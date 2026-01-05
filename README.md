# Dust Observation Dashboard 🏜️
**Professional-Grade Sandstorm & Dust Monitoring System for the MENA Region**

<div align="center">

![Version](https://img.shields.io/badge/Version-1.2.0-blue)
![Meteorology](https://img.shields.io/badge/Standard-WMO-green)
![Stability](https://img.shields.io/badge/Performance-Optimized-orange)
![Arabic](https://img.shields.io/badge/Support-Arabic%20RTL-red)

**Real-time METAR visualization and historical analysis for aviation and meteorological research.**

</div>

---

## 📖 Overview
The **Dust Observation Dashboard** is a comprehensive meteorological platform designed to monitor and visualize dust-related weather events across the Middle East and North Africa. By leveraging real-time METAR data from the **Iowa Environmental Mesonet (IEM)**, the system provides high-fidelity visualizations of sandstorms, blowing dust, and dust whirls using international meteorological standards.

---

## ✨ Key Features & Scenarios

### 1. **Real-Time Monitoring (Live Mode)**
- **Dynamic Heatmapping**: Identifies active dust concentrations using a weighted intensity algorithm.
- **Auto-Refresh**: Synchronizes with data sources every 5 minutes to provide "Live" situational awareness.
- **Connection Status**: Real-time indicator ("Connected" / "Loading") for data integrity.

### 2. **WMO Standard Symbology**
The dashboard generates precise SVG-based **Station Models** according to World Meteorological Organization protocols:
- **Wind Barbs**: Directional shafts with barbs representing speed (Half-barb = 5kt, Full-barb = 10kt).
- **Calm/Light Logic**: Precise thresholds for 0 kt (double circle) and 1-4 kt (shaft only).
- **Sky Cover**: 9 distinct visual states for cloud shading (0/8 to 8/8 coverage).

### 3. **Interactive Reporting**
- **Daily Detailed Reports**: Aggregated view of dust events per country.
- **Historical Custom Ranges**: Ability to fetch and analyze data for up to 60 days in a single session.
- **CSV Export**: Export filtered station data for external analysis in Excel or Python.

---

## 🏗️ Technical Architecture

### **Backend: High-Performance Data Pipeline**
- **Parallel Network Acquisition**: Uses a concurrent fetching strategy (`Promise.all`) to query 12 national networks (SA, AE, KW, QA, BH, OM, YE, JO, IQ, SY, LB, IR) simultaneously.
- **Resilient Retry Mechanism**: Built-in exponential backoff for failed API requests to ensure stability during network fluctuations.
- **Sequential Chunking**: For very large historical requests, the system automatically chunks data into manageable batches.

### **Data Processing Logic**
- **Regex Filtering (`dustCodes.js`)**: Isolated dust events using strict patterns: `DU` (Dust), `SA` (Sand), `BLDU`/`BLSA` (Blowing Dust/Sand), `DS`/`SS` (Dust/Sandstorms), `PO` (Dust Whirls).
- **Intensity Mapping**:
  - **Level 1 (Severe)**: Visibility < 1.0 mile OR Code `DS`/`SS`.
  - **Level 2 (Moderate)**: Visibility 1.0 - 3.0 miles OR Code `BLDU`/`BLSA`.
  - **Level 3 (Light)**: Visibility > 3.0 miles OR Code `DU`/`SA`.
- **Coordinate Patching**: Fallback geolocation for specific regional stations (e.g., OERS, OEMN, OEAR) that lack metadata in the source API.

### **Frontend: Modern UI/UX**
- **Glassmorphism Design**: A premium, "Earthy" aesthetic designed for professional environments.
- **Layout**: Fully responsive and LTR/RTL compliant.
- **Libraries**:
  - `Leaflet.js`: Mapping and Heatmaps.
  - `Plotly.js`: Meteorological Time-Series charts.
  - `Chart.js`: Wind Rose diagrams.

---

## 🚀 Performance & Security Benchmarks

### **Performance Optimizations**
- **Gzip/Brotli Compression**: Enabled via backend middleware to reduce JSON payload size by up to 70%.
- **Resource Hints**: `dns-prefetch` and `preconnect` for external assets (CDNs, Google Fonts).
- **Asset Loading**: Selective `defer` attribute on application scripts to ensure non-blocking page renders.

### **Security Hardening**
- **Helmet.js**: Implementation of secure HTTP headers.
- **Rate Limiting**: Protection against API scraping and DoS attacks (100 requests / 15 min).
- **Uniform Error Handling**: Centralized global error handling that masks internal stack traces from users.

---

## 🛠️ Installation & Deployment

### **Installation**
1. **Clone**: `git clone [repository-url]`
2. **Backend**: 
   ```bash
   cd dust-dashboard/backend
   npm install
   npm run dev
   ```
3. **Frontend**: Open `frontend/index.html` (Accessible via local server at port 3000).

### **Deployment (Render.com)**
- **Root Directory**: `dust-dashboard/backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`
- **Environment**: Set `PORT` to default.

---

## 🛰️ Regional Network Coverage
The dashboard specifically monitors the following networks:
- **SA__ASOS** (Saudi Arabia) | **AE__ASOS** (UAE) | **KW__ASOS** (Kuwait)
- **QA__ASOS** (Qatar) | **BH__ASOS** (Bahrain) | **OM__ASOS** (Oman)
- **YE__ASOS** (Yemen) | **JO__ASOS** (Jordan) | **IQ__ASOS** (Iraq)
- **SY__ASOS** (Syria) | **LB__ASOS** (Lebanon) | **IR__ASOS** (Iran)

---

## 👩‍💻 Credits
Developed by **Eng. Budour Alshehri**. .
Special thanks to the **Iowa Environmental Mesonet** for data access.

---

## 🛡️ License
Licensed under the **ISC License**.
© 2025 Dust Observation Dashboard.
