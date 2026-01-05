import { createStationIcon, createMetarPopup } from './wmoSymbols.js';

export class DustMap {
    constructor(elementId, options = {}) {
        this.elementId = elementId;
        this.map = null;
        this.layer = null;
        this.heatLayer = null;
        this.options = options; // { isWmoMode: boolean }

        this.init();
    }

    init() {
        if (!document.getElementById(this.elementId)) return;

        // Center on Saudi Arabia/Middle East
        this.map = L.map(this.elementId).setView([24.7136, 46.6753], 5);

        // Use light tiles for WMO mode too
        const tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        L.tileLayer(tileUrl, {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
    }

    update(mapData) {
        if (!this.map) return;

        // Clear existing layers
        if (this.layer) this.map.removeLayer(this.layer);
        if (this.heatLayer) this.map.removeLayer(this.heatLayer);

        const markers = [];
        const heatPoints = [];
        const isWmo = this.options.isWmoMode;

        if (isWmo) {
            mapData.forEach(point => {
                const iconHtml = createStationIcon(point);
                const icon = L.divIcon({
                    html: iconHtml,
                    className: 'wmo-icon',
                    iconSize: [120, 120],
                    iconAnchor: [60, 60]
                });

                const marker = L.marker([point.lat, point.lon], { icon: icon });
                const popupContent = createMetarPopup(point);
                marker.bindPopup(popupContent, {
                    maxWidth: 350,
                    className: 'metar-popup'
                });
                markers.push(marker);
            });
        } else {
            // Group by station for the summary map to avoid overlapping markers
            const stationMap = new Map();

            mapData.forEach(point => {
                const key = point.station;
                const currentVis = parseFloat(point.vsby);

                if (!stationMap.has(key)) {
                    // Initialize with minVis and an array for all observations
                    stationMap.set(key, {
                        ...point,
                        minVis: isNaN(currentVis) ? Infinity : currentVis,
                        allObservations: [point]
                    });
                } else {
                    const existing = stationMap.get(key);

                    // Add to observations list
                    existing.allObservations.push(point);

                    // Update minVis across all observations for this station
                    if (!isNaN(currentVis) && currentVis < existing.minVis) {
                        existing.minVis = currentVis;
                    }

                    // Keep the "worst" condition record for the main marker properties (color/icon)
                    const currentSev = this._getSeverity(point.wxcodes);
                    const existingSev = this._getSeverity(existing.wxcodes);

                    if (currentSev > existingSev || (currentSev === existingSev && currentVis < parseFloat(existing.vsby))) {
                        const savedMinVis = existing.minVis;
                        const savedObs = existing.allObservations;
                        Object.assign(existing, point);
                        existing.minVis = savedMinVis;
                        existing.allObservations = savedObs;
                    }
                }

                // Still add ALL points to heatmap
                heatPoints.push([point.lat, point.lon, point.intensity]);
            });

            stationMap.forEach(point => {
                const marker = L.circleMarker([point.lat, point.lon], {
                    radius: 8,
                    fillColor: this._getColor(point.wxcodes),
                    color: "#fff",
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.9
                });

                // Generate scrollable list of all METARs for this station
                // Sort by time descending (latest first)
                const sortedObs = point.allObservations.sort((a, b) => new Date(b.valid) - new Date(a.valid));
                const metarListHtml = sortedObs.map(obs => `
                    <div style="margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px dashed #eee; last-child { border-bottom: none; }">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-bottom: 2px;">
                            <span>${new Date(obs.valid).toUTCString().replace('GMT', 'UTC')}</span>
                            <span style="font-weight: bold; color: ${this._getSeverity(obs.wxcodes) === 3 ? '#e63946' : '#666'}">${obs.wxcodes || '-'}</span>
                        </div>
                        <code style="display: block; font-size: 11px; color: #1e3a5f; word-break: break-all;">${obs.metar}</code>
                    </div>
                `).join('');

                const minVisRawMeters = point.minVis === Infinity ? 'N/A' : point.minVis * 1609.34;
                // Round to nearest 100m for cleaner reporting
                const minVisMeters = minVisRawMeters === 'N/A' ? 'N/A' : Math.round(minVisRawMeters / 100) * 100;

                marker.bindPopup(`
                    <div style="font-family: 'Tajawal', sans-serif; min-width: 280px;">
                        <div style="background: #1e3a5f; color: white; padding: 10px 15px; margin: -14px -20px 10px -20px; font-weight: bold; border-radius: 4px 4px 0 0; display: flex; justify-content: space-between; align-items: center;">
                            <span>Station: ${point.station}</span>
                            <span style="font-size: 11px; opacity: 0.9;">${point.allObservations.length} Obs</span>
                        </div>
                        <div style="font-size: 13px; line-height: 1.6;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span><strong>Reports:</strong> ${point.allObservations.length}</span>
                                <span><strong>Min Vis:</strong> <span style="color: #e63946; font-weight: bold;">${point.minVis === Infinity ? 'N/A' : point.minVis.toFixed(2)} mi (${minVisMeters}m)</span></span>
                            </div>
                            
                            <hr style="margin: 10px 0; border: 0; border-top: 1px solid #eee;">
                            
                            <strong style="font-size: 12px; color: #1e3a5f; display: block; margin-bottom: 8px;">METAR Records:</strong>
                            <div style="max-height: 180px; overflow-y: auto; background: #f8f9fa; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                                ${metarListHtml}
                            </div>
                        </div>
                    </div>
                `, { maxWidth: 350 });
                markers.push(marker);
            });
        }

        // Add Markers Layer
        this.layer = L.layerGroup(markers).addTo(this.map);

        // Add Heatmap Layer (Standard mode only)
        if (!isWmo && L.heatLayer) {
            this.heatLayer = L.heatLayer(heatPoints, {
                radius: 25,
                blur: 15,
                maxZoom: 10,
                gradient: { 0.4: 'yellow', 0.65: 'orange', 1: 'red' }
            }).addTo(this.map);
        }
    }

    _getColor(code) {
        const severity = this._getSeverity(code);
        if (severity === 3) return '#FF4500'; // Red
        if (severity === 2) return '#FFA500'; // Orange
        return '#FFD700'; // Yellow
    }

    _getSeverity(code) {
        if (!code) return 1;
        if (code.includes('DS') || code.includes('SS')) return 3; // Severe
        if (code.includes('BLDU') || code.includes('BLSA')) return 2; // Moderate
        return 1; // Light
    }
}

