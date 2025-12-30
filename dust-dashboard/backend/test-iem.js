const axios = require('axios');
const Papa = require('papaparse');

const testFetch = async () => {
    const url = 'https://mesonet.agron.iastate.edu/cgi-bin/request/asos.py?network=SA__ASOS&data=all&tz=Etc/UTC&format=onlycomma&latlon=yes&missing=null&trace=T&year1=2025&month1=12&day1=25&year2=2025&month2=12&day2=26';

    try {
        const response = await axios.get(url);
        const parsed = Papa.parse(response.data, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true
        });

        console.log('Sample Row WxCodes:', parsed.data.slice(0, 20).map(r => ({ station: r.station, codes: r.wxcodes })));

        const hasSS = parsed.data.filter(r => r.wxcodes && r.wxcodes.includes('SS'));
        console.log('\nRows with SS:', hasSS.slice(0, 5).map(r => ({ station: r.station, codes: r.wxcodes })));

    } catch (err) {
        console.error('Error fetching sample data:', err.message);
    }
};

testFetch();
