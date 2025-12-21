/**
 * Generate summary statistics for the dust events.
 * @param {Array} data - Filtered dust data.
 * @returns {Object} - Summary object.
 */
const generateSummary = (data) => {
    const summary = {
        totalEvents: data.length,
        byType: {},
        byStation: {},
        latestEvent: null
    };

    data.forEach(record => {
        // Count by WxCode
        // Wxcodes can be combined e.g. "BLSA DU", so we should split or check presence
        const codes = record.wxcodes ? record.wxcodes.split(' ') : [];
        codes.forEach(code => {
            // We only care about our target codes
            if (['DU', 'SA', 'BLSA', 'BLDU', 'SS', 'DS', 'PO'].includes(code)) {
                summary.byType[code] = (summary.byType[code] || 0) + 1;
            }
        });

        // Count by Station
        const station = record.station;
        if (!summary.byStation[station]) {
            summary.byStation[station] = {
                count: 0,
                name: station, // ideally we map this to a real name if available
                lastEvent: record.valid,
                maxWind: 0
            };
        }
        summary.byStation[station].count += 1;

        // Update max wind for station
        const wind = parseFloat(record.sknt) || 0;
        if (wind > summary.byStation[station].maxWind) {
            summary.byStation[station].maxWind = wind;
        }

        // Track latest global event
        if (!summary.latestEvent || new Date(record.valid) > new Date(summary.latestEvent.valid)) {
            summary.latestEvent = record;
        }
    });

    return summary;
};

module.exports = {
    generateSummary
};
