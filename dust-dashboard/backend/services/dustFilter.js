const { REGEX_PATTERN } = require('../config/dustCodes');

/**
 * Filter data to only include records with dust-related wxcodes.
 * @param {Array} data - Array of weather data objects.
 * @returns {Array} - Filtered array.
 */
const filterDustData = (data) => {
    return data.filter(record => {
        // Check if wxcodes exists and matches the pattern
        if (!record.wxcodes) return false;
        return REGEX_PATTERN.test(record.wxcodes);
    });
};

module.exports = {
    filterDustData
};
