# Haboob | Dust Observation Dashboard 🏜️
**Sandstorm & Dust Monitoring System for the MENA Region**

A professional-grade, real-time meteorological dashboard designed to monitor and analyze dust and sandstorm activities across the Middle East. Built with stability, performance, and meteorological precision in mind.

By **Eng. Budour Alshehri**

---

## 🌟 Key Features

- **WMO Standard Visualization**: Precise rendering of weather stations using standard World Meteorological Organization (WMO) symbols for cloud cover and wind barbs.
- **Heatmap Analysis**: Real-time intensity visualization identifying severe dust concentrations.
- **Historical Analysis**: Scalable data fetching for custom date ranges (up to months).
- **Intelligent Time Filtering**: Quick-access periods (Live, 24h, 48h, 7 Days) synchronized with calendar days.
- **Meteorological Detail**: Deep-dive into specific station data including METAR strings, visibility, temperature, and pressure.
- **Performance Optimized**: Built-in Gzip compression, resource hints (DNS-prefetch), and optimized script loading.

## 🏗️ Architecture & Technology Stack

### **Backend (Node.js/Express)**
- **Data Source**: Iowa Environmental Mesonet (IEM) ASOS/METAR API.
- **Processing Engine**: `mesonetService.js` processes raw CSV data from 12+ regional networks (Saudi Arabia, UAE, Kuwait, etc.).
- **Parallel Fetching**: High-performance "Parallel Network Acquisition" strategy to bypass API bottlenecks for large datasets.
- **Security**: Hardened with `helmet` and `express-rate-limit` for production readiness.
- **Middleware**: `compression` (Gzip) enabled to reduce payload sizes for mobile and low-bandwidth clients.

### **Frontend (Vanilla HTML5/JS/CSS)**
- **Map Layer**: Leaflet.js with custom-themed tile layers.
- **Visuals**: Dynamic SVG generation for WMO station models.
- **Charts**: Plotly.js for high-quality time-series analysis.
- **UI/UX**: Minimalist, professional glassmorphism design with a fully responsive layout.

---

## 🛰️ Data Retrieval Logic

The dashboard utilizes a sophisticated multi-stage data pipeline:
1. **Parallel Acquisition**: Requests are fired concurrently for multiple national networks (e.g., SA__ASOS, AE__ASOS, KW__ASOS).
2. **Sequential Time Management**: Large historical ranges are automatically chunked to ensure browser/server stability.
3. **Regex Classification**: Data is filtered via `dustFilter.js` using strict meteorological regex patterns to isolate specific dust/sand phenomena (e.g., BLDU, DS, SS, PO).
4. **Coordinate Patching**: Fallback mechanisms for offline stations ensuring map markers remain accurate even if metadata is missing.

## 🌡️ WMO Symbol Logic
The dashboard follows strict meteorological protocols for station models:
- **Calm (0 kt)**: Green double circle (no shaft).
- **Light (1-4 kt)**: Shaft only, representing direction without barbs.
- **Normal (≥5 kt)**: Standard shaft with barbs (rounded to 5-knot units).
- **Cloud Cover**: Center circle shading reflects 0/8 to 8/8 coverage.

---

## 🚀 Installation & Setup

### **Prerequisites**
- Node.js (v14+)
- npm

### **Steps**
1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd Dust-Dash/dust-dashboard
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Access**:
   Open your browser at `http://localhost:3000`

---

## 📝 Performance Benchmarks
- **Page Load Time**: Optimized via `defer` and `preconnect` hints.
- **Data Speed**: 30 days of regional data (~1,000+ records) processed in < 20 seconds.
- **Security Score**: A+ rating for HTTP headers via `helmet`.

---

## 🛡️ Credits & Ownership
Developed and Maintained by **Eng. Budour Alshehri**.
All rights reserved © 2025.
