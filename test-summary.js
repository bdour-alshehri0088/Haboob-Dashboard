const { generateSummary } = require('./dust-dashboard/backend/services/summaryGenerator');

const data = [
    { station: 'TEST1', wxcodes: 'SS', sknt: 10 },
    { station: 'TEST2', wxcodes: '+SS', sknt: 15 },
    { station: 'TEST3', wxcodes: 'BLDU +SS', sknt: 20 }
];

const summary = generateSummary(data);
console.log('Summary by Type:', JSON.stringify(summary.byType, null, 2));
