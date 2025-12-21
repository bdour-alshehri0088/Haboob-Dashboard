export const renderTable = (data) => {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">No data available</td></tr>';
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(row.valid)}</td>
            <td>${formatTime(row.valid)}</td>
            <td>${row.station}</td>
            <td class="code-cell">${row.wxcodes}</td>
            <td>${row.vsby}</td>
            <td>${row.sknt}</td>
            <td>${toCelsius(row.tmpf)}</td>
        `;
        tbody.appendChild(tr);
    });
};

const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
};

const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
};

const toCelsius = (f) => {
    if (f === 'M' || f === null) return '--';
    const c = (parseFloat(f) - 32) * 5 / 9;
    return Math.round(c * 10) / 10;
};
