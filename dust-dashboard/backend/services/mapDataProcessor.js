/**
 * Process data for Map visualization.
 * @param {Array} data - Filtered dust data.
 * @returns {Array} - Array of objects suitable for mapping.
 */
const processMapData = (data) => {
    return data.map(record => ({
        lat: parseFloat(record.lat),
        lon: parseFloat(record.lon),
        station: record.station,
        wxcodes: record.wxcodes,
        valid: record.valid,
        tmpf: record.tmpf,
        dwpf: record.dwpf,
        sknt: record.sknt,
        drct: record.drct,
        vsby: record.vsby,
        alti: record.alti,
        skyc1: record.skyc1,
        skyc2: record.skyc2,
        skyc3: record.skyc3,
        skyc4: record.skyc4,
        metar: record.metar,
        intensity: calculateIntensity(record.wxcodes, record.vsby)
    }));
};

/**
 * Calculate intensity weight for heatmap based on visibility and code using simple logic.
 */
const calculateIntensity = (code, vis) => {
    let weight = 0.6; // Boosted base visibility
    const visibility = parseFloat(vis);

    // Lower visibility = higher intensity
    if (!isNaN(visibility)) {
        if (visibility < 1) weight = 1.0;
        else if (visibility < 3) weight = 0.8;
        else if (visibility < 5) weight = 0.6;
    }

    // Boost for severe codes
    if (code && (code.includes('DS') || code.includes('SS'))) {
        weight = 1.0;
    }

    return weight;
};

module.exports = {
    processMapData
};
