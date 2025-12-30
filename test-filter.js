const { REGEX_PATTERN } = require('./dust-dashboard/backend/config/dustCodes');
const { filterDustData } = require('./dust-dashboard/backend/services/dustFilter');

const testData = [
    { station: 'TEST1', wxcodes: 'SS', metar: 'CORRECT' },
    { station: 'TEST2', wxcodes: '+SS', metar: 'HEAVY' },
    { station: 'TEST3', wxcodes: '-SS', metar: 'LIGHT' },
    { station: 'TEST4', wxcodes: 'DU', metar: 'DUST' },
    { station: 'TEST5', wxcodes: '+DS', metar: 'HEAVY DS' },
    { station: 'TEST6', wxcodes: 'BLDU +SS', metar: 'MIXED' },
    { station: 'TEST7', wxcodes: 'RA', metar: 'RAIN (SHOULD BE FILTERED)' },
    { station: 'TEST8', wxcodes: null, metar: 'NULL (SHOULD BE FILTERED)' }
];

console.log('Testing Regex Pattern:', REGEX_PATTERN);
testData.forEach(d => {
    const match = d.wxcodes ? REGEX_PATTERN.test(d.wxcodes) : false;
    console.log(`Code: [${d.wxcodes}] -> Match: ${match}`);
});

const filtered = filterDustData(testData);
console.log('\nFiltered Count:', filtered.length);
console.log('Filtered Stations:', filtered.map(f => f.station).join(', '));
