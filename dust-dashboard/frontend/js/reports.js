/**
 * Enhanced Reports Page - Daily dust event reports
 * Features: Executive Summary, Map, Wind Roses, PDF Export
 */

const API_BASE = 'http://localhost:3000/api/dust';

// All countries to track
const ALL_COUNTRIES = [
    'Saudi Arabia', 'Kuwait', 'Bahrain', 'Qatar', 'UAE', 'Oman',
    'Yemen', 'Jordan', 'Iraq', 'Syria', 'Lebanon', 'Iran'
];

// Country coordinates for map markers
const COUNTRY_COORDS = {
    'Saudi Arabia': [24.7, 46.7],
    'Kuwait': [29.3, 47.9],
    'Bahrain': [26.0, 50.5],
    'Qatar': [25.3, 51.2],
    'UAE': [24.4, 54.4],
    'Oman': [21.5, 57.0],
    'Yemen': [15.5, 48.5],
    'Jordan': [31.9, 35.9],
    'Iraq': [33.3, 44.4],
    'Syria': [34.8, 38.9],
    'Lebanon': [33.9, 35.5],
    'Iran': [32.4, 53.7]
};

// DOM Elements
const reportDateInput = document.getElementById('report-date');
const loadReportBtn = document.getElementById('load-report-btn');
const reportContent = document.getElementById('report-content');
const noDataDiv = document.getElementById('no-data');
const loadingOverlay = document.getElementById('loading');
const summaryBody = document.getElementById('summary-body');
const totalsBox = document.getElementById('totals-box');
const stationsContainer = document.getElementById('stations-container');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const summaryTextDiv = document.getElementById('summary-text');
const noEventsDiv = document.getElementById('no-events-countries');

let currentReportData = null;
let summaryMap = null;
let executiveSummaryText = '';

// Set default date to yesterday
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
reportDateInput.value = yesterday.toISOString().split('T')[0];

// Event Listeners
loadReportBtn.addEventListener('click', loadReport);
exportPdfBtn.addEventListener('click', exportPDF);
exportCsvBtn.addEventListener('click', exportCSV);

/**
 * Show a toast notification
 */
function showNotification(message, type = 'info', duration = 5000) {
    const area = document.getElementById('notification-area');
    if (!area) return;

    const toast = document.createElement('div');
    toast.className = `notification ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    area.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s forwards';
        setTimeout(() => toast.remove(), 500);
    }, duration);
}

async function loadReport() {
    const date = reportDateInput.value;
    if (!date) {
        showNotification('Please select a date', 'warning');
        return;
    }

    showLoading(true);
    reportContent.style.display = 'none';
    noDataDiv.style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}/report?date=${date}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to fetch report');
        }

        const data = await response.json();
        currentReportData = data;

        renderExecutiveSummary(data, date);
        renderSummaryTable(data.summaryTable);
        renderTotals(data.totals);
        renderStations(data.stationsByCountry);

        reportContent.style.display = 'block';

        // Render Map AFTER display block to ensure correct sizing
        renderSummaryMap(data);

        // Invalidate map size after display
        setTimeout(() => {
            if (summaryMap) {
                summaryMap.invalidateSize();
                summaryMap.fitBounds([[10.0, 32.0], [38.0, 65.0]]);
            }
        }, 100);

        showNotification('Report loaded successfully', 'success', 3000);
    } catch (error) {
        console.error('Error loading report:', error);
        noDataDiv.textContent = `Error: ${error.message}`;
        noDataDiv.style.display = 'block';
        showNotification(`Error: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function renderExecutiveSummary(data, dateStr) {
    const date = new Date(dateStr);
    const day = getOrdinal(date.getDate());
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();

    let text = `<p>On <b>${day} of ${month} ${year}</b>, the regional status of dust and sandstorm events was analyzed.</p>`;
    let plainText = `On ${day} of ${month} ${year}, the regional status of dust and sandstorm events was analyzed.\n\n`;

    // Helper: Find events with lowest visibility
    function findWorstCases(stations) {
        let minVis = Infinity;
        let events = [];
        stations.forEach(s => {
            s.observations.forEach(o => {
                if (o.visMeters < minVis) minVis = o.visMeters;
            });
        });
        if (minVis === Infinity) return null;
        stations.forEach(s => {
            s.observations.forEach(o => {
                if (o.visMeters === minVis) events.push({ station: s.station, obs: o });
            });
        });
        const uniqueStations = [];
        const seen = new Set();
        events.forEach(e => {
            if (!seen.has(e.station)) {
                seen.add(e.station);
                uniqueStations.push(e);
            }
        });
        return { minVis, cases: uniqueStations };
    }

    // Helper: All unique WX codes for a station
    function getStationWxCodes(station) {
        return [...new Set(station.observations.map(o => o.wxcodes).filter(Boolean))];
    }

    // --- Saudi Arabia Analysis ---
    const saStations = data.stationsByCountry['Saudi Arabia'] || [];

    if (saStations.length === 0) {
        const line = "Saudi Arabia recorded no dust or sandstorm observations across its meteorological network.";
        text += `<p><b>Saudi Arabia:</b> ${line}</p>`;
        plainText += `Saudi Arabia: ${line}\n`;
    } else {
        text += `<p><b>Saudi Arabia:</b></p>`;
        plainText += `Saudi Arabia:\n`;

        saStations.forEach(station => {
            const obsCount = station.observations.length;

            // Find critical values
            let minVisObs = station.observations[0];
            let maxWindObs = station.observations[0];

            station.observations.forEach(o => {
                if (o.visMeters < minVisObs.visMeters) minVisObs = o;
                if (o.windKt > maxWindObs.windKt) maxWindObs = o;
            });

            // Format details
            const time = new Date(minVisObs.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
            const allPhenom = getStationWxCodes(station).join(', ');

            // HTML Version
            text += `<div style="margin-top:5px; margin-bottom:10px; padding-left:10px; border-left: 3px solid #ddd;">
                <b>${station.station}</b>: Recorded <b>${obsCount}</b> dust-related activity observations. 
                Lowest visibility was <span class="highlight">${minVisObs.visMeters}m</span> at ${time}Z due to <b>${allPhenom}</b>. 
                Maximum wind speed reached <b>${maxWindObs.windKt} kt</b> from ${maxWindObs.windDirCompass || 'VRB'}.
            </div>`;

            // Plain Text Version
            plainText += `- ${station.station}: Recorded ${obsCount} dust-related activity observations. Lowest visibility was ${minVisObs.visMeters}m at ${time}Z due to ${allPhenom}. Maximum wind speed reached ${maxWindObs.windKt} kt from ${maxWindObs.windDirCompass || 'VRB'}.\n`;
        });
    }

    // --- Regional Analysis (Sorted by Duration) ---
    const regionalCountries = ALL_COUNTRIES.filter(c => c !== 'Saudi Arabia');
    const countryStats = regionalCountries.map(country => {
        const stations = data.stationsByCountry[country] || [];
        const totalObs = stations.reduce((sum, s) => sum + s.observations.length, 0);
        return { country, stations, totalObs };
    });
    countryStats.sort((a, b) => b.totalObs - a.totalObs);

    const activeCountries = countryStats.filter(c => c.totalObs > 0);
    const inactiveCountries = countryStats.filter(c => c.totalObs === 0).map(c => c.country);

    if (activeCountries.length > 0) {
        activeCountries.forEach(stat => {
            const worst = findWorstCases(stat.stations);
            let lineHTML = `Recorded <b>${stat.totalObs} hours</b> of activity. `;
            let linePlain = `Recorded ${stat.totalObs} hours of activity. `;

            if (worst) {
                const stationsList = worst.cases.map(c => `<b>${c.station}</b>`).join(worst.cases.length > 2 ? ', ' : ' and ');
                const stationsListPlain = worst.cases.map(c => c.station).join(worst.cases.length > 2 ? ', ' : ' and ');

                // Get all unique phenomena for these stations
                let allPhenom = new Set();
                worst.cases.forEach(c => {
                    const stObj = stat.stations.find(s => s.station === c.station);
                    if (stObj) getStationWxCodes(stObj).forEach(code => allPhenom.add(code));
                });
                const phenomStr = Array.from(allPhenom).join(', ');
                const sampleObs = worst.cases[0].obs;

                lineHTML += `Lowest visibility was <span class="highlight">${worst.minVis}m</span> at ${stationsList}. Observed phenomena included <b>${phenomStr}</b>.`;
                linePlain += `Lowest visibility was ${worst.minVis}m at ${stationsListPlain}. Observed phenomena included ${phenomStr}.`;
            }

            text += `<p><b>${stat.country}:</b> ${lineHTML}</p>`;
            plainText += `${stat.country}: ${linePlain}\n`;
        });
    } else {
        const line = "No dust events were recorded in other monitoring countries.";
        text += `<p><b>Region:</b> ${line}</p>`;
        plainText += `Region: ${line}\n`;
    }

    // --- No Events List ---
    const allNoEvents = inactiveCountries;
    // Logic: If SA has 0 and NO region events, show "No events recorded anywhere".
    // If SA has events OR Region has events, list the inactive ones.

    const anyActivity = saStations.length > 0 || activeCountries.length > 0;

    if (anyActivity && allNoEvents.length > 0) {
        const listStr = allNoEvents.join(' • ');
        text += `<div class="no-events-countries"><b>Countries with no recorded events:</b> ${listStr}</div>`;
        plainText += `Countries with no recorded events: ${allNoEvents.join(', ')}`;
        document.getElementById('no-events-countries').style.display = 'none';
    } else if (!anyActivity) {
        document.getElementById('no-events-countries').innerHTML = `<strong>No events recorded in any monitoring country.</strong>`;
        document.getElementById('no-events-countries').style.display = 'block';
    } else {
        document.getElementById('no-events-countries').style.display = 'none';
    }

    summaryTextDiv.innerHTML = text;
    executiveSummaryText = plainText; // Global for PDF
}

function renderSummaryMap(data) {
    // Initialize or reset map
    const mapContainer = document.getElementById('summary-map');
    if (summaryMap) {
        summaryMap.remove();
        summaryMap = null;
    }

    summaryMap = L.map('summary-map', {
        preferCanvas: true, // Crucial for html2canvas to capture markers
        zoomControl: false,  // Cleaner look for report
        minZoom: 4
    });

    // Fit bounds to cover the whole region (Yemen to Syria/Iran)
    // South-West: [10, 32], North-East: [38, 65]
    summaryMap.fitBounds([[10.0, 32.0], [38.0, 65.0]]);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(summaryMap);

    // Flatten all stations from all countries
    const allStations = Object.values(data.stationsByCountry).flat();

    allStations.forEach(station => {
        // Get valid coordinates (check first observation)
        const validObs = station.observations.find(o => o.lat && o.lon);
        if (!validObs) return;

        const lat = validObs.lat;
        const lon = validObs.lon;

        // Determine Color based on daily WORST case
        let color = '#f1c40f'; // Default Yellow
        const allCodes = station.wxcodes || [];
        const hasSevere = allCodes.some(c => c.includes('DS') || c.includes('SS'));
        const hasBlowing = allCodes.some(c => c.includes('BLDU') || c.includes('BLSA'));

        if (hasSevere) color = '#e74c3c';
        else if (hasBlowing) color = '#f39c12';

        // Calculate Stats for Popup
        let minVis = Infinity;
        let maxWind = 0;
        station.observations.forEach(o => {
            if (o.visMeters < minVis) minVis = o.visMeters;
            if (o.windKt > maxWind) maxWind = o.windKt;
        });

        // Add Marker
        const marker = L.circleMarker([lat, lon], {
            radius: 6,
            fillColor: color,
            color: '#fff',
            weight: 1,
            fillOpacity: 0.9
        }).addTo(summaryMap);

        marker.bindPopup(`
            <div style="font-family: Tajawal, sans-serif;">
                <strong>${station.station}</strong><br>
                <div style="margin-top:2px; font-size:11px; color:#555;">${station.country}</div>
                <hr style="margin:4px 0; border:0; border-top:1px solid #eee;">
                Phenomena: <b>${allCodes.join(', ')}</b><br>
                Min Vis: <b>${minVis} m</b><br>
                Max Wind: <b>${maxWind} kt</b>
            </div>
        `);
    });

    // Legend Control
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.border = '1px solid #ccc';
        div.style.fontFamily = 'Tajawal, sans-serif';
        div.style.fontSize = '12px';
        div.style.boxShadow = '0 1px 5px rgba(0,0,0,0.4)';
        div.style.direction = 'ltr'; // Fix parentheses flipping

        const labels = [
            { label: 'Severe (DS/SS)', color: '#e74c3c' },
            { label: 'Blowing (BLDU/BLSA)', color: '#f39c12' },
            { label: 'Suspended (DU/SA)', color: '#f1c40f' }
        ];

        div.innerHTML = '<strong style="display:block; margin-bottom:5px;">Event Types</strong>';
        labels.forEach(item => {
            div.innerHTML += `
                <div style="display:flex; align-items:center; margin-bottom:4px;">
                    <span style="background:${item.color}; width:12px; height:12px; display:inline-block; margin-right:8px; border-radius:50%;"></span>
                    <span>${item.label}</span>
                </div>`;
        });
        return div;
    };
    legend.addTo(summaryMap);

    // North Arrow Control
    const northArrow = L.control({ position: 'topright' });
    northArrow.onAdd = function () {
        const div = L.DomUtil.create('div', 'north-arrow');
        div.innerHTML = `
            <div style="text-align:center; color:#2c3e50; font-weight:bold; font-family:'Times New Roman', serif;">
                <div style="font-size:28px; line-height:24px;">▲</div>
                <div style="font-size:16px;">N</div>
            </div>
        `;
        // No background to look like overlay part of map map
        div.style.padding = '5px';
        div.style.marginRight = '10px';
        div.style.marginTop = '10px';
        return div;
    };
    northArrow.addTo(summaryMap);
}

function getEventColor(row) {
    if ((row.DS || 0) + (row.SS || 0) > 0) return '#e74c3c'; // Red for severe
    if ((row.BLDU || 0) + (row.BLSA || 0) > 0) return '#f39c12'; // Orange for blowing
    return '#f1c40f'; // Yellow for suspended
}

function renderSummaryTable(summaryTable) {
    summaryBody.innerHTML = '';

    ALL_COUNTRIES.forEach(country => {
        const row = summaryTable.find(r => r.country === country) || {
            country, DS: 0, SS: 0, BLDU: 0, BLSA: 0, DU: 0, SA: 0, PO: 0, total: 0
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="country-cell" style="text-align:left; padding-left:15px;"><strong>${row.country}</strong></td>
            <td>${row.DS || 0}</td>
            <td>${row.SS || 0}</td>
            <td>${row.BLDU || 0}</td>
            <td>${row.BLSA || 0}</td>
            <td>${row.DU || 0}</td>
            <td>${row.SA || 0}</td>
            <td>${row.PO || 0}</td>
            <td class="${row.total > 0 ? 'total-cell' : ''}"><strong>${row.total}</strong></td>
        `;
        summaryBody.appendChild(tr);
    });
}

function renderTotals(totals) {
    const severe = (totals.byPhenomenon.DS || 0) + (totals.byPhenomenon.SS || 0);
    const blowing = (totals.byPhenomenon.BLDU || 0) + (totals.byPhenomenon.BLSA || 0);
    const suspended = (totals.byPhenomenon.DU || 0) + (totals.byPhenomenon.SA || 0);

    totalsBox.innerHTML = `
        <div class="stat-card">
            <div class="value">${totals.saudiArabia}</div>
            <div class="label">Saudi Arabia</div>
        </div>
        <div class="stat-card">
            <div class="value">${totals.region}</div>
            <div class="label">Region</div>
        </div>
        <div class="stat-card">
            <div class="value">${severe}</div>
            <div class="label">Severe (DS/SS)</div>
        </div>
        <div class="stat-card">
            <div class="value">${blowing}</div>
            <div class="label">Blowing (BLDU/BLSA)</div>
        </div>
        <div class="stat-card">
            <div class="value">${suspended}</div>
            <div class="label">Suspended (DU/SA)</div>
        </div>
    `;
}

function renderStations(stationsByCountry) {
    stationsContainer.innerHTML = '';

    ALL_COUNTRIES.forEach(country => {
        const stations = stationsByCountry[country];
        if (!stations || stations.length === 0) return;

        const countryDiv = document.createElement('div');
        countryDiv.className = 'country-group';
        countryDiv.innerHTML = `<div class="country-header">${country} (${stations.length} station${stations.length > 1 ? 's' : ''})</div>`;

        stations.forEach((station, idx) => {
            const stationBlock = document.createElement('div');
            stationBlock.className = 'station-card';

            let html = `
                <div class="station-header">
                    <div class="station-name">Station: ${station.station}</div>
                </div>
            `;

            // Wx codes tags
            if (station.wxcodes && station.wxcodes.length > 0) {
                html += '<div style="margin-bottom:15px;">';
                station.wxcodes.forEach(wx => {
                    html += `<span class="wxcode-tag">${wx}</span>`;
                });
                html += '</div>';
            }

            // Wind rose
            const wrId = `wr-${station.station.replace(/\s/g, '')}`;
            html += `<div id="${wrId}" class="station-windrose"></div>`;

            // Raw METARs
            if (station.observations && station.observations.some(obs => obs.metar)) {
                html += `
                    <div style="margin: 15px 0; background: #2c3e50; color: #ecf0f1; border-radius: 6px; padding: 12px; font-family: 'Courier New', monospace; font-size: 11px; max-height: 150px; overflow-y: auto; direction: ltr; text-align: left;">
                        ${station.observations.filter(o => o.metar).map(obs => {
                    const timeStr = new Date(obs.time).toISOString().substring(11, 16);
                    return `<div style="margin-bottom: 3px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 2px;">
                                <span style="color: #95a5a6; margin-right: 8px;">${timeStr}Z</span>
                                <span>${obs.metar}</span>
                            </div>`;
                }).join('')}
                    </div>
                `;
            }

            // Observations table
            if (station.observations && station.observations.length > 0) {
                html += `
                    <table class="obs-table">
                        <thead>
                            <tr>
                                <th>Time (UTC)</th>
                                <th>Temp/Dew (°C)</th>
                                <th>Wind (kt)</th>
                                <th>Direction</th>
                                <th>Visibility (m)</th>
                                <th>Phenomenon</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                station.observations.forEach(obs => {
                    const time = new Date(obs.time).toLocaleTimeString('en-US', {
                        hour12: false, hour: '2-digit', minute: '2-digit'
                    });
                    const tempDew = obs.tempC !== null ? `${obs.tempC}/${obs.dewC || '--'}` : 'M/M';
                    const dir = obs.windDir !== null ? `${Math.round(obs.windDir)}° ${obs.windDirCompass}` : 'VRB';
                    const vis = obs.visMeters !== null ? obs.visMeters : 'M';

                    html += `
                        <tr>
                            <td>${time}</td>
                            <td>${tempDew}</td>
                            <td>${obs.windKt}</td>
                            <td>${dir}</td>
                            <td>${vis}</td>
                            <td><strong>${obs.wxcodes || '-'}</strong></td>
                        </tr>
                    `;
                });

                html += '</tbody></table>';
            }

            stationBlock.innerHTML = html;
            countryDiv.appendChild(stationBlock);

            // Render wind rose
            setTimeout(() => renderStationWindRose(wrId, station.observations), 100 * idx);
        });

        stationsContainer.appendChild(countryDiv);
    });
}

function renderStationWindRose(containerId, observations) {
    const container = document.getElementById(containerId);
    if (!container || !observations || observations.length === 0) return;

    // Configuration (Matching Backend Logic)
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

    const bins = [
        { label: '< 2', max: 2, color: 'blue' },
        { label: '2-5', max: 5, color: 'deepskyblue' },
        { label: '5-7', max: 7, color: 'limegreen' },
        { label: '7-10', max: 10, color: 'yellow' },
        { label: '10-15', max: 15, color: 'orange' },
        { label: '15-20', max: 20, color: 'red' },
        { label: '> 20', max: 999, color: 'darkred' }
    ];

    // Initialize counts: bin -> direction array
    const binCounts = bins.map(() => directions.map(() => 0));

    observations.forEach(obs => {
        if (obs.windDir !== null && !isNaN(obs.windDir) && obs.windKt !== null) {
            // Determine direction index (0-15)
            // 360/16 = 22.5 degrees per sector
            const dirIdx = Math.round(obs.windDir / 22.5) % 16;

            // Determine speed bin
            const speed = obs.windKt;
            // Note: Logic matches backend (if-else chain implication)
            let binIdx = 0;
            if (speed < 2) binIdx = 0;
            else if (speed < 5) binIdx = 1;
            else if (speed < 7) binIdx = 2;
            else if (speed < 10) binIdx = 3;
            else if (speed < 15) binIdx = 4;
            else if (speed < 20) binIdx = 5;
            else binIdx = 6;

            binCounts[binIdx][dirIdx]++;
        }
    });

    // Create Plotly Traces
    const plotData = bins.map((bin, i) => ({
        r: binCounts[i],
        theta: directions,
        name: bin.label + ' kt',
        marker: { color: bin.color },
        type: 'barpolar'
    }));

    const layout = {
        title: {
            text: 'Wind Speed Distribution',
            font: { size: 12, family: 'Tajawal' }
        },
        font: { size: 10, family: 'Tajawal' },
        showlegend: true, // Enable legend
        legend: {
            orientation: 'h', // Horizontal legend at bottom
            y: -0.2, // Move it down
            x: 0.5,
            xanchor: 'center'
        },
        polar: {
            radialaxis: { visible: true, tickfont: { size: 8 } },
            angularaxis: {
                tickfont: { size: 10 },
                rotation: 90,
                direction: 'clockwise'
            },
            bgcolor: 'rgba(0,0,0,0)'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 35, b: 40, l: 30, r: 30 }, // Increased bottom margin for legend
        dragmode: false // Disable interaction zooming
    };

    Plotly.newPlot(containerId, plotData, layout, {
        responsive: true,
        displayModeBar: false,
        staticPlot: false
    });
}

async function exportPDF() {
    if (!currentReportData) {
        alert('No report to export');
        return;
    }

    // Show loading
    const loadingEl = document.getElementById('loading');
    const loadingText = loadingEl.querySelector('p');
    const originalText = loadingText.innerHTML;
    loadingText.innerHTML = 'Generating PDF with Maps & Charts...';
    showLoading(true);

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // === Title Page ===
        doc.setFillColor(44, 62, 80);
        doc.rect(0, 0, pageWidth, 50, 'F');

        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('Dust and Sandstorm Daily Report', pageWidth / 2, 25, { align: 'center' });

        doc.setFontSize(14);
        doc.text(`Date: ${currentReportData.date}`, pageWidth / 2, 38, { align: 'center' });

        // === Executive Summary ===
        doc.setFontSize(14);
        doc.setTextColor(44, 62, 80);
        doc.text('Executive Summary', margin, 65);

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        const splitText = doc.splitTextToSize(executiveSummaryText, pageWidth - 2 * margin);
        doc.text(splitText, margin, 75);

        let currentY = 75 + splitText.length * 5 + 10;

        // === Capture & Add Summary Map ===
        const mapEl = document.getElementById('summary-map');
        if (mapEl) {
            try {
                // Force map render sync before capture
                if (summaryMap) summaryMap.invalidateSize();

                // WAIT for tiles and markers to settle
                await new Promise(resolve => setTimeout(resolve, 2000));

                const mapCanvas = await html2canvas(mapEl, {
                    useCORS: true,
                    allowTaint: false, // Must be false to allow toDataURL
                    logging: false,
                    scale: 2
                });

                const imgData = mapCanvas.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (mapCanvas.height * imgWidth) / mapCanvas.width;

                doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
                currentY += imgHeight + 15; // Spacing
            } catch (err) {
                console.warn('Map capture failed', err);
            }
        }

        // --- PAGE BREAK 1: End of Summary & Map ---
        doc.addPage();
        currentY = 20;

        // === Page 2: Totals Box & Summary Table ===

        // 1. Key Statistics Box (Moved to Page 2)
        doc.setFillColor(39, 174, 96);
        doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 25, 3, 3, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);

        const saudiTotal = currentReportData.totals.saudiArabia;
        const regionTotal = currentReportData.totals.region;
        const severe = (currentReportData.totals.byPhenomenon.DS || 0) + (currentReportData.totals.byPhenomenon.SS || 0);

        doc.text(`Saudi Arabia: ${saudiTotal}`, margin + 15, currentY + 15);
        doc.text(`Region Total: ${regionTotal}`, pageWidth / 2 - 20, currentY + 15);
        doc.text(`Severe Events: ${severe}`, pageWidth - margin - 45, currentY + 15);

        currentY += 40; // Space between box and table

        // 2. Summary Table
        doc.setTextColor(44, 62, 80);
        doc.setFontSize(16);
        doc.text('Summary by Country', margin, currentY);
        currentY += 10;

        const tableData = ALL_COUNTRIES.map(country => {
            const row = currentReportData.summaryTable.find(r => r.country === country) || {
                DS: 0, SS: 0, BLDU: 0, BLSA: 0, DU: 0, SA: 0, PO: 0, total: 0
            };
            return [country, row.DS, row.SS, row.BLDU, row.BLSA, row.DU, row.SA, row.PO, row.total];
        });

        doc.autoTable({
            startY: currentY,
            head: [['Country', 'DS', 'SS', 'BLDU', 'BLSA', 'DU', 'SA', 'PO', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: 'bold', minCellHeight: 12, valign: 'middle' },
            styles: { halign: 'center', fontSize: 10, cellPadding: 6, minCellHeight: 10, valign: 'middle' },
            columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
        });

        // --- PAGE BREAK 2: End of Table ---
        doc.addPage();
        let stationY = 20;

        // === Station Details (Page 3+) ===
        for (const [country, stations] of Object.entries(currentReportData.stationsByCountry)) {
            if (stationY > pageHeight - 30) {
                doc.addPage();
                stationY = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(44, 62, 80);
            doc.text(`${country} - ${stations.length} Station(s)`, margin, stationY);
            doc.setDrawColor(44, 62, 80); // Underline country
            doc.line(margin, stationY + 2, margin + 80, stationY + 2);
            stationY += 15;

            for (const station of stations) {
                // Check space for station header
                if (stationY > pageHeight - 60) {
                    doc.addPage();
                    stationY = 20;
                }

                // Station Header Background
                doc.setFillColor(245, 245, 245);
                doc.rect(margin, stationY - 6, pageWidth - 2 * margin, 12, 'F');

                // Station Header
                doc.setFontSize(12);
                doc.setTextColor(0, 0, 0);
                // Removed emoji to fix PDF encoding/rendering issues
                doc.text(`Station: ${station.station}`, margin + 5, stationY + 2);

                if (station.wxcodes && station.wxcodes.length > 0) {
                    doc.setFontSize(10);
                    doc.setTextColor(200, 0, 0);
                    doc.text(`Phenomena: ${station.wxcodes.join(', ')}`, margin + 90, stationY + 2);
                }
                stationY += 12;

                // === Wind Rose Image ===
                const wrId = `wr-${station.station.replace(/\s/g, '')}`;
                const wrDiv = document.getElementById(wrId);

                if (wrDiv) {
                    try {
                        const wrImgData = await Plotly.toImage(wrDiv, { format: 'png', width: 600, height: 500, scale: 3 });
                        const wrWidth = 80; // mm
                        const wrHeight = 65; // mm

                        // Check space for image
                        if (stationY + wrHeight > pageHeight - 20) {
                            doc.addPage();
                            stationY = 20;
                            doc.text(`Station: ${station.station} (Cont.)`, margin, stationY);
                            stationY += 10;
                        }

                        doc.addImage(wrImgData, 'PNG', margin, stationY, wrWidth, wrHeight);
                        // Add Raw METARs next to the Wind Rose if space allows, or below.
                        // Let's add them BELOW the wind rose for clarity in the PDF.
                        stationY += wrHeight + 5;

                    } catch (e) {
                        console.warn('WR capture failed', e);
                    }
                }

                // === Raw METARs === 
                const metars = station.observations.filter(o => o.metar);
                if (metars.length > 0) {
                    // Check space
                    if (stationY + 15 > pageHeight - 20) {
                        doc.addPage();
                        stationY = 20;
                    }

                    doc.setFontSize(10);
                    doc.setTextColor(44, 62, 80);
                    doc.setFont(undefined, 'bold');
                    doc.text('Raw METARs:', margin, stationY);
                    stationY += 5;

                    doc.setFont('courier', 'normal'); // Monospace for METARs
                    doc.setFontSize(8);
                    doc.setTextColor(0, 0, 0);

                    metars.forEach(obs => {
                        const timeStr = new Date(obs.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
                        const line = `${timeStr}Z ${obs.metar}`;

                        // Check space for line
                        if (stationY > pageHeight - 15) {
                            doc.addPage();
                            stationY = 20;
                            doc.setFont(undefined, 'bold'); // Restore for header
                            doc.text(`Station: ${station.station} (METARs Cont.)`, margin, stationY);
                            stationY += 5;
                            doc.setFont('courier', 'normal');
                        }

                        doc.text(line, margin + 5, stationY);
                        stationY += 4;
                    });

                    // Reset Font
                    doc.setFont('helvetica', 'normal');
                    stationY += 5;
                }

                if (station.observations && station.observations.length > 0) {
                    const obsData = station.observations.slice(0, 15).map(obs => [ // Limit rows for PDF to avoid 100 pages?
                        new Date(obs.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
                        obs.tempC !== null ? `${obs.tempC}°C` : 'M',
                        `${obs.windKt} kt`,
                        obs.windDir !== null ? `${Math.round(obs.windDir)}°` : 'VRB',
                        obs.visMeters || 'M',
                        obs.wxcodes || '-'
                    ]);

                    doc.autoTable({
                        startY: stationY,
                        head: [['Time', 'Temp', 'Wind', 'Dir', 'Vis', 'Wx']],
                        body: obsData,
                        theme: 'striped',
                        styles: { fontSize: 8, halign: 'center' },
                        margin: { left: margin },
                        tableWidth: pageWidth - 2 * margin
                    });

                    stationY = doc.lastAutoTable.finalY + 15;
                }
            }
        }

        // === Footer ===
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // 1. Page Number on ALL pages
            doc.setFontSize(8);
            doc.setTextColor(128);
            doc.text(`Generated by DustDash - Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 5, { align: 'center' });

            // 2. Disclaimer on LAST PAGE ONLY
            if (i === pageCount) {
                doc.setFontSize(8);
                doc.setTextColor(100, 100, 100);
                const disclaimer = "Note: This report provides a preliminary analysis of past weather data. It is not final and should be reviewed by a certified meteorologist for accuracy and context.";
                const textWidth = doc.getTextWidth(disclaimer);
                // Position above the page number
                doc.text(disclaimer, (pageWidth - textWidth) / 2, pageHeight - 10);
            }
        }

        doc.save(`Dust_Report_${currentReportData.date}.pdf`);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Error generating PDF. Please check console.');
    } finally {
        showLoading(false);
        // Reset loading text
        loadingText.innerHTML = originalText;
    }
}

function exportCSV() {
    if (!currentReportData || !currentReportData.stationsByCountry) {
        alert('No data to export');
        return;
    }

    // Flatten all observation rows
    const rows = [];
    // Header
    rows.push(['Country', 'Station', 'Time (UTC)', 'Temp (C)', 'Dew Point (C)', 'Wind Dir (deg)', 'Wind Speed (kt)', 'Visibility (m)', 'Phenomena', 'METAR']);

    Object.entries(currentReportData.stationsByCountry).forEach(([country, stations]) => {
        stations.forEach(station => {
            station.observations.forEach(obs => {
                rows.push([
                    country,
                    station.station,
                    new Date(obs.time).toISOString(),
                    obs.tempC || '',
                    obs.dewC || '',
                    obs.windDir || '',
                    obs.windKt || '',
                    obs.visMeters || '',
                    obs.wxcodes || '',
                    obs.metar || ''
                ]);
            });
        });
    });

    const csv = rows.map(r => r.map(v => {
        // Escape quotes and wrap in quotes
        const val = String(v || '').replace(/"/g, '""');
        return `"${val}"`;
    }).join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Dust_Report_${currentReportData.date}.csv`;
    link.click();
}

function showLoading(show) {
    loadingOverlay.classList.toggle('active', show);
}
