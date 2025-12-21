/**
 * Report Service - Generates detailed daily dust event reports
 */

const mesonetService = require('./mesonetService');
const { filterDustData } = require('./dustFilter');

// ICAO prefix to country mapping
const COUNTRY_MAP = {
    'OE': 'Saudi Arabia',
    'OI': 'Iran',
    'OR': 'Iraq',
    'OJ': 'Jordan',
    'OK': 'Kuwait',
    'OB': 'Bahrain',
    'OT': 'Qatar',
    'OM': 'UAE',
    'OO': 'Oman',
    'OL': 'Lebanon',
    'OS': 'Syria',
    'OY': 'Yemen'
};

const PHENOMENA = ['DS', 'SS', 'BLDU', 'BLSA', 'DU', 'SA', 'PO'];

const PHENOMENA_LABELS = {
    'DU': 'DU (Dust)',
    'SA': 'SA (Sand)',
    'BLDU': 'BLDU (Blowing Dust)',
    'BLSA': 'BLSA (Blowing Sand)',
    'SS': 'SS (Sandstorm)',
    'DS': 'DS (Duststorm)',
    'PO': 'PO (Dust Whirls)'
};

const COUNTRIES_ORDER = [
    'Saudi Arabia', 'Kuwait', 'Bahrain', 'Qatar', 'UAE', 'Oman',
    'Yemen', 'Jordan', 'Iraq', 'Syria', 'Lebanon', 'Iran'
];

/**
 * Get country from station ICAO code
 */
const getCountryByStation = (station) => {
    if (!station || typeof station !== 'string' || station.length < 2) {
        return 'Unknown';
    }
    const prefix = station.substring(0, 2).toUpperCase();
    return COUNTRY_MAP[prefix] || 'Unknown';
};

/**
 * Detect phenomenon from wxcodes
 */
const detectPhenomenon = (wxcodes) => {
    if (!wxcodes) return null;
    const wx = wxcodes.toUpperCase();
    for (const ph of PHENOMENA) {
        if (wx.includes(ph)) return ph;
    }
    return null;
};

/**
 * Convert wind direction to compass
 */
const degToCompass = (deg) => {
    if (deg === null || deg === undefined || isNaN(deg)) return 'N/A';
    const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
        'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const ix = Math.round(deg / 22.5) % 16;
    return dirs[ix];
};

/**
 * Convert visibility miles to meters
 */
const vsbyToMeters = (miles) => {
    if (miles === null || miles === undefined || isNaN(miles)) return null;
    return Math.round(miles * 1609.344 / 100) * 100;
};

/**
 * Generate report data for a specific date
 */
const generateReport = async (dateStr) => {
    // dateStr format: YYYY-MM-DD
    const startDate = new Date(dateStr);
    const endDate = new Date(dateStr);
    endDate.setUTCHours(23, 59, 59, 999);

    // Fetch data for the day
    const rawData = await mesonetService.getDustData(24, dateStr, dateStr);

    // Build summary by country
    const summaryByCountry = {};
    const stationDetails = {};

    rawData.forEach(row => {
        const station = row.station;
        const country = getCountryByStation(station);
        const phenomenon = detectPhenomenon(row.wxcodes);

        // Initialize country summary
        if (!summaryByCountry[country]) {
            summaryByCountry[country] = {};
            PHENOMENA.forEach(ph => summaryByCountry[country][ph] = 0);
        }

        // Count phenomenon
        if (phenomenon) {
            summaryByCountry[country][phenomenon]++;
        }

        // Station details
        if (!stationDetails[station]) {
            stationDetails[station] = {
                country,
                station,
                observations: [],
                wxcodes: new Set()
            };
        }

        // Add observation
        const tempC = row.tmpf ? Math.round((parseFloat(row.tmpf) - 32) * 5 / 9) : null;
        const dewC = row.dwpf ? Math.round((parseFloat(row.dwpf) - 32) * 5 / 9) : null;
        const windKt = parseFloat(row.sknt) || 0;
        const windKmh = Math.round(windKt * 1.852);
        const windDir = parseFloat(row.drct);
        const visMiles = parseFloat(row.vsby);
        const visMeters = vsbyToMeters(visMiles);

        stationDetails[station].observations.push({
            time: row.valid,
            tempC,
            dewC,
            windKt,
            windKmh,
            windDir,
            windDirCompass: degToCompass(windDir),
            visMeters,
            visMiles,
            wxcodes: row.wxcodes || '',
            metar: row.metar || '',
            lat: parseFloat(row.lat) || null,
            lon: parseFloat(row.lon) || null
        });

        if (row.wxcodes) {
            stationDetails[station].wxcodes.add(row.wxcodes);
        }
    });

    // Convert Set to Array
    Object.values(stationDetails).forEach(s => {
        s.wxcodes = Array.from(s.wxcodes);
        s.observations.sort((a, b) => new Date(a.time) - new Date(b.time));
    });

    // Build summary table
    const summaryTable = COUNTRIES_ORDER.map(country => {
        const counts = summaryByCountry[country] || {};
        const total = PHENOMENA.reduce((sum, ph) => sum + (counts[ph] || 0), 0);
        return {
            country,
            ...Object.fromEntries(PHENOMENA.map(ph => [ph, counts[ph] || 0])),
            total
        };
    }).filter(row => !!row.country);

    // Totals
    const totals = {
        saudiArabia: summaryByCountry['Saudi Arabia']
            ? PHENOMENA.reduce((s, ph) => s + (summaryByCountry['Saudi Arabia'][ph] || 0), 0) : 0,
        region: Object.entries(summaryByCountry)
            .filter(([c]) => c !== 'Saudi Arabia')
            .reduce((s, [_, counts]) => s + PHENOMENA.reduce((ss, ph) => ss + (counts[ph] || 0), 0), 0),
        byPhenomenon: Object.fromEntries(
            PHENOMENA.map(ph => [
                ph,
                Object.values(summaryByCountry).reduce((s, counts) => s + (counts[ph] || 0), 0)
            ])
        )
    };

    // Stations grouped by country
    const stationsByCountry = {};
    Object.values(stationDetails).forEach(s => {
        if (!stationsByCountry[s.country]) {
            stationsByCountry[s.country] = [];
        }
        stationsByCountry[s.country].push(s);
    });

    return {
        date: dateStr,
        summaryTable,
        totals,
        stationsByCountry,
        phenomenaLabels: PHENOMENA_LABELS
    };
};

module.exports = {
    generateReport,
    getCountryByStation,
    PHENOMENA,
    PHENOMENA_LABELS,
    COUNTRIES_ORDER
};
