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
                if (!stationMap.has(key)) {
                    stationMap.set(key, point);
                } else {
                    // Keep the "worst" condition for the marker
                    const existing = stationMap.get(key);
                    const currentSev = this._getSeverity(point.wxcodes);
                    const existingSev = this._getSeverity(existing.wxcodes);
                    if (currentSev > existingSev) {
                        stationMap.set(key, point);
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

                marker.bindPopup(`
                    <strong>${point.station}</strong><br>
                    Region Reports: ${mapData.filter(p => p.station === point.station).length}<br>
                    Worst Case: ${point.wxcodes}<br>
                    Avg Vis: ${point.vsby} miles
                `);
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

