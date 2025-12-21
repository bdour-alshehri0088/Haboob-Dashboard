import { fetchAllData, fetchSummary, fetchMapData, fetchWindRose } from './api.js';
import { DustMap } from './map.js';
import { renderTable } from './table.js';
import { initWindRose, updateWindRose } from './windrose.js';

import { TimeController } from './timeController.js';

let currentHours = 24;

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

let customRange = null; // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
let timeController = null;

let summaryMap = null;
let wmoMap = null;

// Setup
document.addEventListener('DOMContentLoaded', async () => {
    // Init components
    initWindRose();

    // Init Maps
    summaryMap = new DustMap('map', { isWmoMode: false });
    wmoMap = new DustMap('wmo-map', { isWmoMode: true });

    // Initial Load: Default to Live Mode
    document.getElementById('live-btn').classList.add('active');
    enableLiveMode();

    // Event Listeners
    document.getElementById('refresh-map-btn').addEventListener('click', loadData);
    document.getElementById('station-select').addEventListener('change', handleStationChange);
    document.getElementById('export-btn').addEventListener('click', exportToCSV);

    // Live Button
    document.getElementById('live-btn').addEventListener('click', () => {
        document.querySelectorAll('.time-controls button').forEach(b => b.classList.remove('active'));
        document.getElementById('live-btn').classList.add('active');
        enableLiveMode();
    });

    document.querySelectorAll('.time-controls button[data-hours]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.time-controls button').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const hours = parseInt(e.target.dataset.hours);
            currentHours = hours;
            stopLiveMode(); // Stop live refresh if enabled

            if (hours === 24) {
                // Special case: 24h means "Yesterday" (00:00 - 23:59)
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yStr = yesterday.toISOString().split('T')[0];
                customRange = { start: yStr, end: yStr };
                console.log("Loading Yesterday Data:", yStr);
            } else {
                customRange = null; // Reset custom for 48h, 7 days (rolling)
            }

            loadData();
        });
    });

    // Custom Date Logic
    const dateModal = document.getElementById('date-modal');
    const customBtn = document.getElementById('custom-range-btn');
    const closeDateBtn = document.getElementById('close-date-modal');
    const applyDateBtn = document.getElementById('apply-date-btn');

    customBtn.onclick = () => dateModal.style.display = "block";
    closeDateBtn.onclick = () => dateModal.style.display = "none";

    applyDateBtn.onclick = () => {
        const start = document.getElementById('start-date').value;
        const end = document.getElementById('end-date').value;

        if (start && end) {
            customRange = { start, end };
            // Clear hour buttons active state
            document.querySelectorAll('.time-controls button').forEach(b => b.classList.remove('active'));
            customBtn.classList.add('active');

            dateModal.style.display = "none";
            loadData();
        } else {
            alert("Please select both dates");
        }
    };

    // Modal Logic (Info)
    const modal = document.getElementById('info-modal');
    const btn = document.getElementById('info-btn');
    const span = document.getElementsByClassName("close-modal")[0];

    btn.onclick = () => modal.style.display = "block";
    span.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        /* Generic close for both modals if clicked outside */
        if (event.target == modal) modal.style.display = "none";
        if (event.target == dateModal) dateModal.style.display = "none";
    }
});

let globalTableData = [];

async function loadData() {
    showLoading(true);
    updatePeriodLabel();

    try {
        // Parallel fetching
        const [summary, mapData, tableData, windData] = await Promise.all([
            fetchSummary(currentHours, customRange),
            fetchMapData(currentHours, customRange),
            fetchAllData(currentHours, customRange),
            fetchWindRose('', currentHours, customRange)
        ]);

        globalTableData = tableData;

        // Update Summary Map (Cumulative/Current)
        summaryMap.update(mapData);

        // Update WMO Map (Time Series)
        if (mapData.length > 0) {
            if (timeController) {
                // Update controller data
                timeController.allData = mapData;
                timeController.init();
            } else {
                // Init new controller
                timeController = new TimeController(mapData, (filteredData) => {
                    wmoMap.update(filteredData);
                });
            }
        }

        updateUI(summary, tableData, windData);
        populateStationSelect(tableData);
        updateWindRoseSubtitle(document.getElementById('station-select').value);

        document.getElementById('connection-status').innerHTML = '<span class="dot"></span> Connected';
        document.getElementById('connection-status').querySelector('.dot').style.background = '#4CAF50';
    } catch (error) {
        console.error("Failed to load data", error);
        document.getElementById('connection-status').innerHTML = '<span class="dot" style="background:red"></span> Error';
        showNotification("Failed to connect to data service. Please check your connection.", "error");
    } finally {
        showLoading(false);
    }
}

function updatePeriodLabel() {
    const label = document.getElementById('period-label');
    if (customRange) {
        label.textContent = `Period: ${customRange.start} to ${customRange.end}`;
    } else {
        if (currentHours === 24) label.textContent = "Last 24 Hours";
        else if (currentHours === 48) label.textContent = "Last 48 Hours";
        else if (currentHours === 168) label.textContent = "Last 7 Days";
        else label.textContent = `Last ${currentHours} Hours`;
    }
}

function exportToCSV() {
    if (!globalTableData || globalTableData.length === 0) {
        alert("No data available for export");
        return;
    }

    const headers = ['Station', 'Phenomenon', 'Visibility (mi)', 'Wind (kt)', 'Temp (C)', 'Time (UTC)', 'METAR'];
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(','));

    // Add data
    globalTableData.forEach(row => {
        const tempC = row.tmpf !== 'M' ? ((parseFloat(row.tmpf) - 32) * 5 / 9).toFixed(1) : '';
        const values = [
            row.station,
            row.wxcodes,
            row.vsby,
            row.sknt,
            tempC,
            row.valid,
            row.metar || ''
        ];
        // Escape quotes if needed and join
        csvRows.push(values.map(v => `"${v}"`).join(','));
    });

    const csvContent = "\ufeff" + csvRows.join('\n'); // Add BOM for Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dust_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function updateUI(summary, tableData, windData) {
    // Update Summary
    document.getElementById('total-events-val').textContent = summary.totalEvents;

    // Calculate severe events (DS + SS)
    const severeCount = (summary.byType.DS || 0) + (summary.byType.SS || 0);
    document.getElementById('severe-events-val').textContent = severeCount;

    // Active stations
    const activeStations = Object.keys(summary.byStation).length;
    document.getElementById('active-stations-val').textContent = activeStations;

    // Update Table
    renderTable(tableData);

    // Update Wind Rose (Global initially)
    updateWindRose(windData);
}

function populateStationSelect(data) {
    const select = document.getElementById('station-select');
    // Get unique stations
    const stations = [...new Set(data.map(d => d.station))].sort();

    // Save current selection if valid
    const currentVal = select.value;

    select.innerHTML = '<option value="">All Stations</option>';
    stations.forEach(st => {
        const opt = document.createElement('option');
        opt.value = st;
        opt.textContent = st;
        select.appendChild(opt);
    });

    if (stations.includes(currentVal)) {
        select.value = currentVal;
    }
}

async function handleStationChange(e) {
    const station = e.target.value;
    updateWindRoseSubtitle(station);
    try {
        const windData = await fetchWindRose(station, currentHours, customRange);
        updateWindRose(windData);
    } catch (error) {
        console.error("Error updating wind rose", error);
    }
}

function updateWindRoseSubtitle(station = null) {
    const stationText = station ? station : 'All Stations';
    let periodText = '';

    if (customRange) {
        periodText = `${customRange.start} to ${customRange.end}`;
    } else {
        if (currentHours === 24) periodText = '24 Hours';
        else if (currentHours === 48) periodText = '48 Hours';
        else if (currentHours === 168) periodText = '7 Days';
        else periodText = `${currentHours} Hours`;
    }

    document.getElementById('windrose-subtitle').textContent = `${stationText} | ${periodText}`;
}

function showLoading(isLoading) {
    const btn = document.getElementById('refresh-map-btn');
    const statusEl = document.getElementById('connection-status');
    const timeButtons = document.querySelectorAll('.time-controls button');

    if (isLoading) {
        btn.textContent = 'Loading...';
        btn.disabled = true;
        statusEl.innerHTML = '<span class="dot" style="background:#f39c12"></span> Loading...';
        timeButtons.forEach(b => b.style.opacity = '0.5');
    } else {
        btn.textContent = 'Refresh';
        btn.disabled = false;
        timeButtons.forEach(b => b.style.opacity = '1');
    }
}

let refreshTimer = null;

function enableLiveMode() {
    console.log("Live Mode Enabled");
    loadData();

    scheduleAutoRefresh();
}

function stopLiveMode() {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
        console.log("Live Mode refresh stopped.");
    }
}

function scheduleAutoRefresh() {
    stopLiveMode(); // Clear existing

    const now = new Date();
    // Target: Next XX:15:00
    let target = new Date(now);
    target.setMinutes(15);
    target.setSeconds(0);
    target.setMilliseconds(0);

    // If we passed XX:15 this hour, target next hour's XX:15
    if (target <= now) {
        target.setHours(target.getHours() + 1);
    }

    const delay = target.getTime() - now.getTime();
    console.log(`Auto-refresh scheduled in ${(delay / 60000).toFixed(1)} minutes (at ${target.toLocaleTimeString()})`);

    refreshTimer = setTimeout(() => {
        console.log("Auto-refreshing Live Data...");
        // Reload data to get latest
        loadData();
        scheduleAutoRefresh(); // Reschedule for next hour
    }, delay);
}
