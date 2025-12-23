/**
 * Calculate Wind Rose data for a specific station or all data.
 * @param {Array} data - Filtered dust data.
 * @returns {Object} - Wind rose frequency data.
 */
/**
 * Calculate Wind Rose data for a specific station or all data.
 * Mimics the python 'windrose' library style.
 * Speed bins: [2, 5, 7, 10, 15, 20]
 * Colors: ['blue', 'deepskyblue', 'limegreen', 'yellow', 'orange', 'red']
 * @param {Array} data - Filtered dust data.
 * @returns {Object} - Wind rose frequency data suitable for Plotly.
 */
const calculateWindRose = (data) => {
    // 16 cardinal directions
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

    // Bins based on user request: <2, 2-5, 5-7, 7-10, 10-15, 15-20, >=20
    const bins = [
        { label: '< 2', max: 2, color: 'blue' },
        { label: '2-5', max: 5, color: 'deepskyblue' },
        { label: '5-7', max: 7, color: 'limegreen' },
        { label: '7-10', max: 10, color: 'yellow' },
        { label: '10-15', max: 15, color: 'orange' },
        { label: '15-20', max: 20, color: 'red' },
        { label: '> 20', max: 999, color: 'darkred' } // Extra bin for extreme
    ];

    // Initialize counts: [binIndex][directionIndex]
    // 16 directions for each bin
    const binnedData = bins.map(b => ({
        label: b.label,
        color: b.color,
        r: Array(16).fill(0), // Frequency (radius)
        theta: directions
    }));

    let totalValid = 0;

    data.forEach(record => {
        const drct = parseFloat(record.drct);
        const sknt = parseFloat(record.sknt);

        if (!isNaN(drct) && !isNaN(sknt)) {
            // EXCLUDE CALM WINDS (0,0) from the rose calculation
            if (sknt === 0 && drct === 0) return;

            // Determine direction index
            const dirIndex = Math.round(drct / 22.5) % 16;

            // Determine bin index
            let binIndex = 0;
            if (sknt < 2) binIndex = 0;
            else if (sknt < 5) binIndex = 1;
            else if (sknt < 7) binIndex = 2;
            else if (sknt < 10) binIndex = 3;
            else if (sknt < 15) binIndex = 4;
            else if (sknt < 20) binIndex = 5;
            else binIndex = 6;

            binnedData[binIndex].r[dirIndex] += 1;
            totalValid++;
        }
    });

    // Optional: Convert to percentages if needed, but absolute counts are fine for Plotly
    // The python script uses normed=True, so usually it shows %
    // Let's stick to counts for now, Plotly handles stacking nicely.

    return binnedData;
};

module.exports = {
    calculateWindRose
};
