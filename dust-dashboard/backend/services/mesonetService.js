const axios = require('axios');
const Papa = require('papaparse');
const { filterDustData } = require('./dustFilter');

// Iowa Environmental Mesonet (IEM) API URL for ASOS/METAR data
// Fetching last 24 hours by default
const BASE_URL = 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py';

/**
 * Fetch and process dust data.
 * @param {number} hours - Number of hours to look back (default 24).
 */
const getDustData = async (hours = 24, customStart = null, customEnd = null) => {
    try {
        // Calculate date range
        let startDate, endDate;

        console.log(`getDustData called with hours=${hours}, start=${customStart}, end=${customEnd}`);

        if (customStart && customEnd) {
            startDate = new Date(customStart);
            // Set end date to end of that day (23:59:59) to include full day data
            // Or simple way: set to next day 00:00 if standard date picker
            // But let's set to 23:59:59.999
            endDate = new Date(customEnd);
            endDate.setUTCHours(23, 59, 59, 999);
        } else {
            endDate = new Date();
            startDate = new Date(endDate.getTime() - (hours * 60 * 60 * 1000));
        }

        const params = {
            station: 'all',
            data: 'all',
            year1: startDate.getUTCFullYear(),
            month1: startDate.getUTCMonth() + 1,
            day1: startDate.getUTCDate(),
            year2: endDate.getUTCFullYear(),
            month2: endDate.getUTCMonth() + 1,
            day2: endDate.getUTCDate(),
            tz: 'Etc/UTC',
            format: 'csv',
            latlon: 'yes',
            direct: 'no',
            report_type: '1' // 1 for METAR
        };

        // Note: For 'all' stations, the request might be huge. 
        // Usually we filter by network (e.g., SA__ASOS for Saudi Arabia).
        // For this demo, let's fetch a specific network or bounding box if possible, 
        // but the standard endpoint uses 'station' or 'network'. 
        // Let's hardcode a network list for the region if possible, or fetch 'all' and filter by lat/lon manually if the API is too slow.
        // Better approach: Use network 'SA__ASOS', 'KW__ASOS', 'AE__ASOS' etc.
        // For now, let's try a simplified approach: Fetch specific networks.

        // Construct URL with multiple networks is tricky in one go sometimes.
        // Let's stick to a known working network for Saudi first or use a different endpoint if we need global.
        // Actually, asking for 'data=all' is too much. We need specific columns.
        // columns: station, valid, tmpf, dwpf, relh, drct, sknt, p01i, alti, mslp, vsby, gust, skyc1, skyc2, skyc3, skyc4, skyl1, skyl2, skyl3, skyl4, wxcodes, lat, lon

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

        // Split networks into chunks of 4
        const networkChunks = chunkArray(networks, 4);

        // Helper to split date range into chunks (e.g., 7 days)
        const splitDateRange = (start, end, daysPerChunk) => {
            const chunks = [];
            let current = new Date(start);
            const final = new Date(end);

            while (current < final) {
                const chunkStart = new Date(current);
                const chunkEnd = new Date(current);
                chunkEnd.setDate(chunkEnd.getDate() + daysPerChunk);

                if (chunkEnd > final) {
                    chunkEnd.setTime(final.getTime()); // Set to exact end time
                } else {
                    // Set to end of expected day
                    chunkEnd.setUTCHours(23, 59, 59, 999);
                }

                chunks.push({ start: chunkStart, end: chunkEnd });
                current.setDate(current.getDate() + daysPerChunk);
                current.setUTCHours(0, 0, 0, 0); // Start of next chunk
                // Add 1ms to avoid overlap if needed, but for IEM allow slight overlap is safer or gapless
                // Actually ASOS request is inclusive.
                current = new Date(chunkEnd.getTime() + 1);
            }
            return chunks;
        };

        // Split time into 10-day chunks to prevent timeouts on long queries
        const timeChunks = splitDateRange(startDate, endDate, 10);

        const fetchChunk = async (chunkNetworks, range, retries = 2) => {
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
                    console.log(`Fetching chunk: ${chunkNetworks[0]}... (Attempt ${i + 1}/${retries + 1})`);
                    const response = await axios.get(requestUrl, { timeout: 45000 }); // 45s timeout
                    const parsed = Papa.parse(response.data, {
                        header: true,
                        skipEmptyLines: true,
                        dynamicTyping: true
                    });
                    return parsed.data;
                } catch (err) {
                    const isLastAttempt = i === retries;
                    console.error(`Error fetching chunk (Attempt ${i + 1}): ${err.message}${isLastAttempt ? ' - Final fail' : ' - Retrying...'}`);
                    if (isLastAttempt) return [];
                    // Exponential backoff
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                }
            }
            return [];
        };

        // Execute ALL requests in parallel (Time Chunks * Network Chunks)
        // e.g. 30 days (3 chunks) * 12 networks (3 chunks) = 9 requests
        const promises = [];
        timeChunks.forEach(range => {
            networkChunks.forEach(nets => {
                promises.push(fetchChunk(nets, range));
            });
        });

        const results = await Promise.all(promises);

        // Flatten results
        const rawData = results.flat();

        console.log(`Total raw records fetched: ${rawData.length}`);

        // Patch missing coordinates for specific stations (OERS, OEMN, OEAR)
        const MANUAL_COORDS = {
            'OERS': { lat: 25.6283, lon: 37.0889 }, // Red Sea / Hanak
            'OEMN': { lat: 21.4133, lon: 39.8933 }, // Mina
            'OEAR': { lat: 21.3547, lon: 39.9839 }  // Arafat
        };

        rawData.forEach(row => {
            if ((!row.lat || !row.lon) && MANUAL_COORDS[row.station]) {
                row.lat = MANUAL_COORDS[row.station].lat;
                row.lon = MANUAL_COORDS[row.station].lon;
            }
        });

        // Filter for Dust
        const dustData = filterDustData(rawData);

        return dustData;

    } catch (error) {
        console.error('Error fetching Mesonet data:', error);
        throw error;
    }
};

module.exports = {
    getDustData
};
