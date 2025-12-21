// Use relative URL to work in both development and production
const API_BASE = '/api/dust';

export const fetchAllData = async (hours = 24, customRange = null) => {
    try {
        let url = `${API_BASE}/all?hours=${hours}`;
        if (customRange && customRange.start && customRange.end) {
            url += `&start=${customRange.start}&end=${customRange.end}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching all data:', error);
        throw error;
    }
};

export const fetchSummary = async (hours = 24, customRange = null) => {
    try {
        let url = `${API_BASE}/summary?hours=${hours}`;
        if (customRange && customRange.start && customRange.end) {
            url += `&start=${customRange.start}&end=${customRange.end}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching summary:', error);
        throw error;
    }
};

export const fetchMapData = async (hours = 24, customRange = null) => {
    try {
        let url = `${API_BASE}/map?hours=${hours}`;
        if (customRange && customRange.start && customRange.end) {
            url += `&start=${customRange.start}&end=${customRange.end}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching map data:', error);
        throw error;
    }
};

export const fetchWindRose = async (station = '', hours = 24, customRange = null) => {
    try {
        let url = `${API_BASE}/windrose?hours=${hours}`;
        if (station) {
            url += `&station=${station}`;
        }
        if (customRange && customRange.start && customRange.end) {
            url += `&start=${customRange.start}&end=${customRange.end}`;
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error('Error fetching wind rose data:', error);
        throw error;
    }
};
