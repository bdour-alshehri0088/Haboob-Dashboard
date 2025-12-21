const express = require('express');
const router = express.Router();
const mesonetService = require('../services/mesonetService');
const summaryGenerator = require('../services/summaryGenerator');
const mapDataProcessor = require('../services/mapDataProcessor');
const windRoseCalculator = require('../services/windRoseCalculator');

// Cache to store data temporarily
// Simple cache: Map of "hours" -> { time, data }
const cache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getData = async (hours = 24, start = null, end = null) => {
    // Generates a cache key based on inputs
    const key = (start && end) ? `${start}_${end}` : hours;
    const now = Date.now();

    // Check Cache
    if (cache[key] && (now - cache[key].time < CACHE_DURATION)) {
        console.log(`Serving data from cache for key: ${key}`);
        return cache[key].data;
    }

    // Fetch Data
    console.log(`Cache miss for key: ${key}. Fetching...`);
    let data;
    if (start && end) {
        data = await mesonetService.getDustData(hours, start, end);
    } else {
        data = await mesonetService.getDustData(hours);
    }

    // Save to Cache (Simple in-memory)
    cache[key] = { time: now, data };
    return data;
};

// GET /api/dust/all
router.get('/all', async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const { start, end } = req.query;
        const data = await getData(hours, start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dust data' });
    }
});

// GET /api/dust/summary
router.get('/summary', async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const { start, end } = req.query;
        const data = await getData(hours, start, end);
        const summary = summaryGenerator.generateSummary(data);
        res.json(summary);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate summary' });
    }
});

// GET /api/dust/map
router.get('/map', async (req, res) => {
    try {
        const hours = parseInt(req.query.hours) || 24;
        const { start, end } = req.query;
        const data = await getData(hours, start, end);
        const mapData = mapDataProcessor.processMapData(data);
        res.json(mapData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate map data' });
    }
});

// GET /api/dust/windrose
// Optional query param: station
router.get('/windrose', async (req, res) => {
    try {
        const { station, start, end } = req.query;
        const hours = parseInt(req.query.hours) || 24;
        let data = await getData(hours, start, end); // Already filtered by dust

        if (station) {
            data = data.filter(d => d.station === station);
        }

        const windRose = windRoseCalculator.calculateWindRose(data);
        res.json(windRose);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate wind rose data' });
    }
});

// GET /api/dust/report
// Query param: date (YYYY-MM-DD)
const reportService = require('../services/reportService');

router.get('/report', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Date parameter required (YYYY-MM-DD)' });
        }
        const report = await reportService.generateReport(date);
        res.json(report);
    } catch (err) {
        console.error('Report generation error:', err);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

module.exports = router;
