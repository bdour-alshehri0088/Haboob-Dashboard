const axios = require('axios');
const Papa = require('papaparse');
const { filterDustData } = require('./dustFilter');

// Iowa Environmental Mesonet (IEM) API URL for ASOS/METAR data
const BASE_URL = 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py';

/**
 * Fetch and process dust data.
 * Optimized for production (Render) with early filtering and batching.
 * @param {number} hours - Number of hours to look back (default 24).
 */
const getDustData = async (hours = 24, customStart = null, customEnd = null) => {
    try {
        let startDate, endDate;

        console.log(`getDustData called with hours=${hours}, start=${customStart}, end=${customEnd}`);

        if (customStart && customEnd) {
            startDate = new Date(customStart);
            endDate = new Date(customEnd);
            endDate.setUTCHours(23, 59, 59, 999);
        } else {
            endDate = new Date();
            startDate = new Date(endDate.getTime() - (hours * 60 * 60 * 1000));
        }

        const networks = [
            'SA__ASOS', 'KW__ASOS', 'AE__ASOS', 'QA__ASOS',
            'BH__ASOS', 'OM__ASOS', 'YE__ASOS', 'JO__ASOS',
            'IQ__ASOS', 'SY__ASOS', 'LB__ASOS', 'IR__ASOS'
        ];

        // Helper to chunk array
        const chunkArray = (arr, size) => {
            const chunks = [];
            for (let i = 0; i < arr.length; i += size) {
                chunks.push(arr.slice(i, i + size));
            }
            return chunks;
        };

        // Patch missing coordinates for specific stations
        const MANUAL_COORDS = {
            'OERF': { lat: 29.62, lon: 43.48 }, // Rafha (Fixed)
            'OERS': { lat: 25.63028, lon: 37.07833 }, // Red Sea (Fixed)
            'OEMN': { lat: 21.4133, lon: 39.8933 }, // Mina
            'OEAR': { lat: 21.3547, lon: 39.9839 }, // Arafat
            'OEWJ': { lat: 26.23, lon: 36.47 }, // Al Wajh
            'OEJN': { lat: 21.67, lon: 39.15 }, // Jeddah
            'OEDF': { lat: 26.47, lon: 49.80 }, // Dammam
            'OERK': { lat: 24.95, lon: 46.70 }, // Riyadh
            'OEPK': { lat: 28.33, lon: 46.13 }, // Al Qaisumah
            'OEMA': { lat: 24.55, lon: 39.71 }, // Madinah
            'OEGN': { lat: 16.90, lon: 42.58 }  // Gizan
        };

        const fetchChunkAndFilter = async (chunkNetworks, range, retries = 2) => {
            const networkParams = chunkNetworks.map(net => `network=${net}`).join('&');
            const queryParams = new URLSearchParams();
            queryParams.append('data', 'all');
            queryParams.append('tz', 'Etc/UTC');
            queryParams.append('format', 'onlycomma');
            queryParams.append('latlon', 'yes');
            queryParams.append('missing', 'null');
            queryParams.append('trace', 'T');

            const s = range.start;
            const e = range.end;
            queryParams.append('year1', s.getUTCFullYear());
            queryParams.append('month1', s.getUTCMonth() + 1);
            queryParams.append('day1', s.getUTCDate());
            queryParams.append('year2', e.getUTCFullYear());
            queryParams.append('month2', e.getUTCMonth() + 1);
            queryParams.append('day2', e.getUTCDate());

            const requestUrl = `${BASE_URL}?${networkParams}&${queryParams.toString()}`;

            for (let i = 0; i <= retries; i++) {
                try {
                    console.log(`Fetching & Filtering: ${chunkNetworks.join(',')} (Attempt ${i + 1})`);
                    const response = await axios.get(requestUrl, { timeout: 60000 });

                    const parsed = Papa.parse(response.data, {
                        header: true,
                        skipEmptyLines: true,
                        dynamicTyping: true
                    });

                    // EARLY FILTERING: Process and filter immediately to save memory
                    const processed = parsed.data
                        .map(row => {
                            // PRIORITIZE MANUAL OVERRIDES: Ensure critical stations are correctly placed
                            if (MANUAL_COORDS[row.station]) {
                                row.lat = MANUAL_COORDS[row.station].lat;
                                row.lon = MANUAL_COORDS[row.station].lon;
                            }
                            return row;
                        });

                    return filterDustData(processed);
                } catch (err) {
                    const isLastAttempt = i === retries;
                    if (isLastAttempt) return [];
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
            return [];
        };

        // SEMI-PARALLEL BATCHING: Process networks in batches of 4
        // This prevents Render from crashing due to memory spikes
        const networkBatches = chunkArray(networks, 4);
        const allDustData = [];

        console.log(`Starting semi-parallel fetch for ${networks.length} networks in ${networkBatches.length} batches`);

        for (const batch of networkBatches) {
            const batchPromises = batch.map(net => fetchChunkAndFilter([net], { start: startDate, end: endDate }));
            const batchResults = await Promise.all(batchPromises);
            allDustData.push(...batchResults.flat());
        }

        console.log(`Total dust records retained: ${allDustData.length}`);
        return allDustData;

    } catch (error) {
        console.error('Error fetching Mesonet data:', error);
        throw error;
    }
};

module.exports = {
    getDustData
};
