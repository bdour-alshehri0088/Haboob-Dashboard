export const initWindRose = () => {
    // Plotly doesn't need explicit init like Chart.js canvas context
    // We just ensure the container exists
    const container = document.getElementById('windRoseChart').parentElement;

    // Replace canvas with a div for Plotly
    const div = document.createElement('div');
    div.id = 'windRosePlot';
    div.style.width = '100%';
    div.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(div);
};

export const updateWindRose = (data) => {
    // data is the array of binned objects returned from backend
    // Each object has { label, color, r: [], theta: [] }

    const plotData = data.map(bin => ({
        r: bin.r,
        theta: bin.theta,
        name: bin.label + ' kt',
        marker: { color: bin.color },
        type: "barpolar"
    }));

    // CHECK FOR EMPTY DATA: If all radii are 0, don't plot
    const totalCount = data.reduce((sum, bin) => sum + bin.r.reduce((s, val) => s + val, 0), 0);
    const plotDiv = document.getElementById('windRosePlot');

    if (!plotDiv) return;

    // USE PLOTLY.PURGE: Recommended way to completely reset a Plotly container
    Plotly.purge(plotDiv);

    if (totalCount === 0) {
        plotDiv.innerHTML = `<div class="no-wind-data">No available wind data</div>`;
        return;
    }

    // Clear any previous "no data" message
    plotDiv.innerHTML = '';

    const layout = {
        title: {
            text: 'Wind Speed Distribution',
            font: { size: 12 }
        },
        font: { size: 10, family: 'Tajawal' },
        showlegend: true,
        polar: {
            radialaxis: {
                visible: true,
                range: [0, null] // Auto range
            },
            angularaxis: {
                tickfont: { size: 10 },
                rotation: 90, // Rotate so N is top
                direction: "clockwise"
            },
            bgcolor: 'rgba(0,0,0,0)'
        },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 30, b: 30, l: 30, r: 30 }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('windRosePlot', plotData, layout, config);
};
