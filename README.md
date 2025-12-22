# Haboob | Dust Observation Dashboard 🌪️
**Advanced Sandstorm & Dust Monitoring System for the MENA Region**

<div align="center">

![Version](https://img.shields.io/badge/Version-1.2.0-blue)
![Meteorology](https://img.shields.io/badge/Standard-WMO-green)
![Stability](https://img.shields.io/badge/Performance-Optimized-orange)

**Professional real-time tracking of dust events across the Gulf and Middle East.**

</div>

---

## 📖 Overview
The **Haboob Dashboard** is a state-of-the-art meteorological visualization tool designed to monitor, analyze, and report on dust and sandstorm activity. It integrates real-time METAR data from over 40 stations across the MENA region, providing users with actionable insights through interactive maps, WMO-compliant station models, and detailed historical reports.

---

## ✨ Core Features

### 🗺️ Interactive GIS Visualization
- **WMO Station Models**: Dynamic SVG markers representing sky cover and wind intensity according to WMO protocols.
- **Heatmap Layer**: Real-time concentration analysis highlighting dangerous dust zones.
- **Station Deep-Dive**: Click any station to view its raw METAR, temperature, pressure, visibility, and wind rose.
- **Auto-Refresh (Live Mode)**: Synchronized 5-minute update cycles to ensure real-time situational awareness.

### 📈 Scalable Historical Reports
- **Custom Date Ranges**: Fetch up to 60 days of data in a single request.
- **Parallel Fetching Engine**: High-speed acquisition bypassing standard API bottlenecks.
- **Regional Analysis**: Categorized data per country (Saudi Arabia, UAE, Kuwait, Qatar, Bahrain, Oman).
- **Export Capabilities**: Download historical data as CSV for external research.

### 🛠️ Performance & Security
- **Gzip Compression**: Optimized JSON and asset delivery for lower latency.
- **Resource Hints**: Pre-connected CDNs and deferred script loading for high PageSpeed scores.
- **API Hardening**: Rate limiting and security headers (Helmet.js) for production stability.

---

## 🏗️ Technical Architecture

### **The Data Pipeline**
The system uses a unique "Parallel Network Acquisition" strategy located in `backend/services/mesonetService.js`:
1. **Request Orchestration**: Instead of one large request, the backend fires parallel requests for 12+ national networks (SA__ASOS, AE__ASOS, etc.).
2. **Dust Classification**: Raw data is filtered through `dustFilter.js` using regex patterns for phenomena like `BLDU` (Blowing Dust), `DS` (Duststorm), and `PO` (Dust Whirls).
3. **Coordinate Resiliency**: Hardcoded fallback logic for regional stations ensuring 100% map coverage even when station metadata is missing from the source.

### **WMO Symbol Engine**
The `frontend/js/wmoSymbols.js` generates precise SVG models:
- **Calm (< 1 kt)**: Green double circle, representing zero wind.
- **Light (1-4 kt)**: Standard cloud circle + directional shaft (no barbs).
- **Normal (≥ 5 kt)**: Standard shaft with barbs (Half-barb = 5kt, Full-barb = 10kt, Pennant = 50kt).
- **Sky Cover**: 9 stages of center shading representing 0/8 (Clear) to 8/8 (Overcast).

---

## 🎨 Classification & Severity

| Severity | Weather Code | Visibility | Map Marker |
| :--- | :--- | :--- | :--- |
| **Severe** | DS, SS | < 1.0 mile | 🔴 Red |
| **Moderate** | BLDU, BLSA, PO | 1.0 - 3.0 miles | 🟡 Yellow |
| **Light** | DU, SA | > 3.0 miles | 🟢 Green |

---

## 🚀 Installation & Usage

### **1. Prerequisites**
- Node.js (v18+)
- npm

### **2. Setup**
```bash
git clone https://github.com/bdour-alshehri0088/Haboob-Dashboard.git
cd dust-dashboard/backend
npm install
```

### **3. Running Locally**
```bash
npm run dev
```
Accessible at: `http://localhost:3000`

### **4. Deployment (Render)**
- **Root Directory**: `dust-dashboard/backend`
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

---

## 📚 API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/dust` | GET | Current regional dust activity (24h). |
| `/api/dust?hours=X` | GET | Activity for the last X hours. |
| `/api/dust?start=DATE&end=DATE` | GET | Custom historical range. |

---

## 👩‍💻 Credits
Developed and Maintained by **Eng. Budour Alshehri**.
Academic Project for **EMAI651 - King Abdulaziz University**.

---

## 🛡️ License
Licensed under the **ISC License**.
© 2025 Haboob Dashboard Team.
