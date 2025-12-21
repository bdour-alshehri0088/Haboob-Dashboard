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

        mapData.forEach(point => {
            if (isWmo) {
                // WMO Style Marker with Professional Styling
                const iconHtml = createStationIcon(point);
                const icon = L.divIcon({
                    html: iconHtml,
                    className: 'wmo-icon',
                    iconSize: [120, 120],
                    iconAnchor: [60, 60]
                });

                const marker = L.marker([point.lat, point.lon], { icon: icon });

                // Add professional METAR popup
                const popupContent = createMetarPopup(point);
                marker.bindPopup(popupContent, {
                    maxWidth: 350,
                    className: 'metar-popup'
                });

                markers.push(marker);

            } else {
                // Standard Circle Marker
                const marker = L.circleMarker([point.lat, point.lon], {
                    radius: 6,
                    fillColor: this._getColor(point.wxcodes),
                    color: "#fff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });

                marker.bindPopup(`
                    <strong>${point.station}</strong><br>
                    Phenomena: ${point.wxcodes}<br>
                    Vis: ${point.vsby} miles<br>
                    Wind: ${point.sknt} kts (${point.drct}°)
                `);
                markers.push(marker);

                heatPoints.push([point.lat, point.lon, point.intensity]);
            }
        });

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
        if (!code) return '#FFD700';
        if (code.includes('DS') || code.includes('SS')) return '#FF4500';
        if (code.includes('BLDU') || code.includes('BLSA')) return '#FFA500';
        return '#FFD700';
    }
}

