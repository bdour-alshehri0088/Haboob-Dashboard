[README.md](https://github.com/user-attachments/files/24278086/README.md)
# 🌪️ Haboob Dashboard

<div align="center">

![Haboob Dashboard](https://img.shields.io/badge/Version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-ISC-yellow)

**Real-time Dust Storm Monitoring System for Gulf Countries**

Monitor sandstorms and dust events with live METAR data visualization.

[Features](#-features) • [Installation](#-installation) • [Deployment](#-deployment) • [API Documentation](#-api-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Weather Codes](#-weather-codes-wxcodes)
- [Classification Criteria](#-classification-criteria)
- [Contributing](#-contributing)
- [License](#-license)
- [Credits](#-credits)

---

## 🌍 Overview

**Haboob Dashboard** is a comprehensive web application designed to monitor and visualize dust storm events across the Gulf region. The system pulls real-time METAR weather data from the Iowa Environmental Mesonet (IEM) network and provides interactive visualizations, detailed reports, and historical analysis.

### Key Capabilities
- ✅ **Real-time monitoring** of dust events across 6 Gulf countries
- ✅ **Interactive maps** with heatmap visualization
- ✅ **Wind rose diagrams** for individual stations
- ✅ **Historical reports** with customizable date ranges
- ✅ **Automated classification** of dust severity
- ✅ **Export functionality** for data analysis
- ✅ **RTL support** for Arabic interface

---

## ✨ Features

### 🗺️ Interactive Dashboard
- **Live Map Visualization**: Leaflet-based map with station markers and heatmap overlay
- **Real-time Updates**: Auto-refresh capability with customizable time ranges (24h, 48h, 7 days)
- **Station-specific Analysis**: Click on any station to view detailed observations
- **Severity Classification**: Color-coded markers based on dust intensity

### 📊 Data Visualization
- **Wind Rose Charts**: Directional wind analysis using Chart.js
- **Time Series Animation**: WMO-compliant temporal visualization with Plotly
- **Summary Statistics**: Total observations, severe storms, and active stations
- **Detailed METAR Table**: Sortable and filterable observation records

### 📈 Reporting System
- **Daily Reports**: Comprehensive daily summaries by country
- **Custom Date Ranges**: Historical analysis with flexible date selection
- **Country-specific Views**: Detailed breakdowns for each Gulf nation
- **Export Capabilities**: CSV export for further analysis

### 🔒 Security & Performance
- **Rate Limiting**: Protection against API abuse (100 requests/15min)
- **Security Headers**: Helmet.js integration for enhanced security
- **Error Handling**: Centralized error management with user-friendly notifications
- **Retry Logic**: Automatic retry mechanism for failed API calls
- **CORS Enabled**: Secure cross-origin resource sharing

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Axios** | HTTP client for API requests |
| **Helmet** | Security middleware |
| **Express-rate-limit** | API rate limiting |
| **PapaParse** | CSV parsing and export |
| **CORS** | Cross-origin handling |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Vanilla JavaScript** | Core functionality |
| **Leaflet.js** | Interactive maps |
| **Leaflet.heat** | Heatmap visualization |
| **Chart.js** | Wind rose diagrams |
| **Plotly.js** | Time series animation |
| **HTML5/CSS3** | Structure and styling |
| **Tajawal Font** | Arabic typography |

### Data Source
- **Iowa Environmental Mesonet (IEM)**: METAR weather data API
- **Coverage**: Gulf countries (SA, AE, KW, QA, BH, OM)
- **Update Frequency**: Real-time with configurable intervals

---

## 📁 Project Structure

```
Haboob-Dashboard/
├── dust-dashboard/
│   ├── backend/
│   │   ├── server.js              # Main server file
│   │   ├── routes/
│   │   │   └── dustRoutes.js      # API route handlers
│   │   ├── services/
│   │   │   └── mesonetService.js  # IEM API integration
│   │   ├── package.json           # Backend dependencies
│   │   └── .env                   # Environment variables
│   │
│   └── frontend/
│       ├── index.html             # Main dashboard page
│       ├── reports.html           # Reports page
│       ├── css/
│       │   ├── main.css           # Global styles
│       │   └── dashboard.css      # Component styles
│       ├── js/
│       │   ├── app.js             # Main dashboard logic
│       │   └── reports.js         # Reports page logic
│       └── assets/                # Images and static files
│
├── package.json                   # Root package config
└── README.md                      # This file
```

---

## 📦 Installation

### Prerequisites
- **Node.js**: Version 18.0.0 or higher
- **npm**: Comes with Node.js
- **Git**: For cloning the repository

### Step 1: Clone the Repository
```bash
git clone https://github.com/bdour-alshehri0088/Haboob-Dashboard.git
cd Haboob-Dashboard
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd dust-dashboard/backend
npm install
```

### Step 3: Environment Setup (Optional)
Create a `.env` file in the backend directory if needed:
```env
PORT=3000
NODE_ENV=development
```

### Step 4: Start Development Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Step 5: Access the Dashboard
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🚀 Usage

### Main Dashboard

#### Time Range Selection
- Click **24h**, **48h**, or **7 Days** buttons for predefined ranges
- Click **Custom** to select specific date ranges
- Click **LIVE** button to enable auto-refresh (updates every 5 minutes)

#### Interactive Map
- **Zoom**: Scroll or use +/- buttons
- **Pan**: Click and drag
- **Station Info**: Click on markers to view details
- **Legend**: Color-coded severity levels (Light/Moderate/Severe)

#### Wind Rose Analysis
- Use dropdown to select specific stations
- View "All Stations" for aggregated wind patterns
- Automatic updates when time range changes

#### Data Table
- **Sort**: Click column headers
- **Export**: Click "Export CSV" button
- **Scroll**: Navigate through observations

### Reports Page

#### Country Selection
Select from:
- 🇸🇦 Saudi Arabia
- 🇦🇪 United Arab Emirates
- 🇰🇼 Kuwait
- 🇶🇦 Qatar
- 🇧🇭 Bahrain
- 🇴🇲 Oman

#### Date Range Selection
1. Click calendar icon
2. Select start and end dates
3. Click "Load Report"
4. View comprehensive daily summaries

#### Report Features
- **Daily Tables**: Station-by-station observations
- **Statistics**: Total events, severity breakdown
- **Maps**: Geographic distribution of events
- **Export**: Download reports as CSV

---

## 🌐 Deployment

### Deploy to Render

#### Method 1: Automatic Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy Haboob Dashboard"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `Haboob-Dashboard` repository

3. **Configure Service**
   ```
   Name: haboob-dashboard
   Region: Oregon (US West)
   Branch: main
   Root Directory: dust-dashboard/backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free (or Starter for 24/7)
   ```

4. **Environment Variables** (Optional)
   - Leave empty for default configuration
   - PORT will be automatically set by Render

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for initial deployment
   - Your app will be live at: `https://haboob-dashboard.onrender.com`

#### Method 2: Manual Deployment

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Production ready"

# Push to main branch
git push origin main

# Render will automatically deploy
```

### Auto-Deploy Configuration

Render automatically deploys when you push to the connected branch:
```
Code Change → Git Push → Render Detects → Auto Deploy → Live Update
```

### Monitoring Deployment

1. **Live Logs**: View real-time deployment progress in Render dashboard
2. **Health Checks**: Render monitors your service automatically
3. **Notifications**: Email alerts for deployment failures

---

## 📚 API Documentation

### Base URL
```
Local: http://localhost:3000/api
Production: https://your-app.onrender.com/api
```

### Rate Limits
- **100 requests per 15 minutes** per IP address
- Returns `429 Too Many Requests` when exceeded

---

### Endpoints

#### 1. Get Weather Data by Country
```http
GET /api/dust/weather/:country
```

**Parameters:**
- `country` (required): Two-letter country code
- `hours` (optional): Time range in hours (default: 24)
  - Examples: `24`, `48`, `168`

**Example Request:**
```bash
curl http://localhost:3000/api/dust/weather/SA?hours=48
```

**Success Response (200 OK):**
```json
{
  "country": "SA",
  "hours": 48,
  "totalObservations": 156,
  "stations": 12,
  "data": [
    {
      "station": "OERK",
      "valid": "2025-12-21T08:00:00Z",
      "lon": 46.7,
      "lat": 24.9,
      "tmpf": 68.0,
      "dwpf": 41.0,
      "sknt": 12.0,
      "drct": 270,
      "vsby": 2.5,
      "presentwx": "BLDU",
      "metar": "OERK 210800Z 27012KT 2500 BLDU..."
    }
  ]
}
```

**Error Response (500):**
```json
{
  "error": "Failed to fetch data",
  "status": 500
}
```

---

#### 2. Get Daily Report by Country
```http
GET /api/dust/report/:country
```

**Parameters:**
- `country` (required): Two-letter country code
- `startDate` (required): ISO date string (YYYY-MM-DD)
- `endDate` (required): ISO date string (YYYY-MM-DD)

**Example Request:**
```bash
curl "http://localhost:3000/api/dust/report/AE?startDate=2025-12-20&endDate=2025-12-21"
```

**Success Response (200 OK):**
```json
{
  "country": "AE",
  "dateRange": {
    "start": "2025-12-20",
    "end": "2025-12-21"
  },
  "summary": {
    "totalDays": 2,
    "totalObservations": 89,
    "severeStorms": 12,
    "activeStations": 8
  },
  "dailyData": [
    {
      "date": "2025-12-20",
      "observations": 45,
      "stations": [
        {
          "station": "OMDB",
          "location": "Dubai",
          "events": 8,
          "severity": "moderate"
        }
      ]
    }
  ]
}
```

---

#### 3. Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "error": "Invalid country code",
  "status": 400
}
```

**429 Too Many Requests:**
```json
{
  "error": "Too many requests, please try again later.",
  "status": 429
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal Server Error",
  "status": 500
}
```

---

## 🌪️ Weather Codes (WxCodes)

The dashboard monitors the following METAR weather phenomena codes:

| Code | Description | Severity |
|------|-------------|----------|
| **DU** | Dust (Widespread) | Light |
| **SA** | Sand | Light |
| **BLDU** | Blowing Dust | Moderate |
| **BLSA** | Blowing Sand | Moderate |
| **PO** | Dust/Sand Whirls | Moderate |
| **DS** | Duststorm | Severe |
| **SS** | Sandstorm | Severe |

### METAR Code Examples
```
OERK 210800Z 27012KT 2500 BLDU FEW020 25/12 Q1012
       └─────────────────┬──────────────────┘
              Blowing Dust Observation
```

---

## 🎨 Classification Criteria

Dust events are classified into three severity levels:

### 🔴 Severe / Dangerous
- **Weather Codes**: DS (Duststorm) or SS (Sandstorm)
- **Visibility**: Less than 1 mile (1.6 km)
- **Impact**: Hazardous conditions, travel advisories
- **Color**: Red marker

### 🟡 Moderate
- **Weather Codes**: BLDU, BLSA, PO
- **Visibility**: 1 - 3 miles (1.6 - 5 km)
- **Impact**: Reduced visibility, caution advised
- **Color**: Yellow marker

### 🟢 Light
- **Weather Codes**: DU, SA
- **Visibility**: More than 3 miles (5 km)
- **Impact**: Minor visibility reduction
- **Color**: Green marker

---

## 🔧 Configuration

### Backend Configuration

#### Port Configuration (`server.js`)
```javascript
const PORT = process.env.PORT || 3000;
```

#### Rate Limiting
```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests, please try again later.' }
});
```

#### CORS Settings
```javascript
app.use(cors()); // Allow all origins (configure for production)
```

### Frontend Configuration

#### API Endpoint (`js/app.js`)
```javascript
const API_BASE_URL = window.location.origin + '/api';
// Local: http://localhost:3000/api
// Production: https://your-app.onrender.com/api
```

#### Auto-refresh Interval
```javascript
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
```

---

## 🧪 Testing

### Manual Testing

#### Test Backend API
```bash
# Health check
curl http://localhost:3000/api/dust/weather/SA

# Custom time range
curl http://localhost:3000/api/dust/weather/AE?hours=168

# Reports endpoint
curl "http://localhost:3000/api/dust/report/KW?startDate=2025-12-20&endDate=2025-12-21"
```

#### Test Rate Limiting
```bash
# Send 101 requests rapidly to trigger rate limit
for i in {1..101}; do curl http://localhost:3000/api/dust/weather/SA; done
```

### Frontend Testing

1. **Live Updates**: Click LIVE button and verify auto-refresh
2. **Time Ranges**: Test all preset time ranges (24h, 48h, 7 days)
3. **Custom Dates**: Select custom date range and verify data loads
4. **Export**: Click Export CSV and verify file download
5. **Wind Rose**: Select different stations and verify charts update
6. **Reports**: Navigate to reports page and test all countries

---

## 📱 Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Full support |
| Firefox | Latest | ✅ Full support |
| Safari | Latest | ✅ Full support |
| Edge | Latest | ✅ Full support |
| Mobile Safari | iOS 12+ | ✅ Full support |
| Chrome Mobile | Latest | ✅ Full support |

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Cannot connect to server"
**Solution:**
```bash
# Check if server is running
curl http://localhost:3000/api/dust/weather/SA

# Restart server
cd dust-dashboard/backend
npm start
```

#### Issue: "No data displayed on map"
**Possible causes:**
1. IEM API is down (check https://mesonet.agron.iastate.edu)
2. No dust events in selected time range
3. Network connectivity issues

**Solution:**
- Try different time range (7 days)
- Check browser console for errors
- Verify API endpoint is accessible

#### Issue: "Rate limit exceeded"
**Solution:**
- Wait 15 minutes
- Reduce request frequency
- Contact admin to adjust limits

#### Issue: "Deployment failed on Render"
**Solution:**
1. Check build logs in Render dashboard
2. Verify `package.json` scripts are correct
3. Ensure Node.js version >= 18.0.0
4. Check that `Root Directory` is set to `dust-dashboard/backend`

---

## 🔐 Security Considerations

### Implemented Security Measures

✅ **Helmet.js**: Secure HTTP headers  
✅ **Rate Limiting**: Prevents API abuse  
✅ **CORS**: Controlled cross-origin access  
✅ **Error Handling**: No stack trace exposure  
✅ **Input Validation**: Country code validation  

### Production Recommendations

1. **Environment Variables**: Use `.env` for sensitive data
2. **HTTPS**: Always use HTTPS in production (Render provides this)
3. **API Keys**: If adding external services, use environment variables
4. **Monitoring**: Set up logging and monitoring (e.g., Sentry)
5. **Backups**: Regular database backups if storing data locally

---

## 📊 Performance Optimization

### Implemented Optimizations

- ✅ **Parallel API Calls**: Uses `Promise.all()` for multiple countries
- ✅ **Retry Logic**: Exponential backoff for failed requests
- ✅ **Static File Caching**: Express serves frontend efficiently
- ✅ **Debouncing**: Prevents excessive API calls on rapid clicks
- ✅ **Lazy Loading**: Maps and charts load on demand

### Performance Tips

1. **Use CDNs**: Leaflet, Chart.js, Plotly served from CDN
2. **Minimize Requests**: Batch data fetching when possible
3. **Cache Strategy**: Browser caching for static assets
4. **Image Optimization**: Compress background images
5. **Code Splitting**: Future: Split large JS files

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Bugs
1. Check existing issues first
2. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS information

### Suggesting Features
1. Open an issue with `[Feature Request]` prefix
2. Describe the feature and use case
3. Provide mockups if possible

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation as needed

---

## 📄 License

This project is licensed under the **ISC License**.

```
ISC License

Copyright (c) 2025 Haboob Dashboard

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

---

## 👩‍💻 Credits

**Developer**: Eng. Budour Alshehri  
**Institution**: King Abdulaziz University  
**Course**: EMAI651 - Computer Vision & Multimodal Systems  
**Year**: 2025

### Acknowledgments
- **Iowa Environmental Mesonet (IEM)**: METAR data provider
- **Leaflet.js**: Interactive mapping library
- **Chart.js**: Data visualization
- **Plotly.js**: Advanced charting
- **Google Fonts**: Tajawal Arabic typography

---

## 📞 Support

### Get Help
- 📧 **Email**: [Your contact email]
- 🐛 **Issues**: [GitHub Issues](https://github.com/bdour-alshehri0088/Haboob-Dashboard/issues)
- 📖 **Documentation**: This README + inline code comments

### Useful Links
- [Iowa Environmental Mesonet](https://mesonet.agron.iastate.edu)
- [METAR Format Guide](https://www.weather.gov/media/wrh/mesowest/metar_decode_key.pdf)
- [Render Documentation](https://render.com/docs)
- [Express.js Guide](https://expressjs.com)

---

## 🗺️ Roadmap

### Current Version (v1.0.0)
- ✅ Real-time dust monitoring
- ✅ Interactive maps
- ✅ Historical reports
- ✅ Wind rose analysis
- ✅ Export functionality

### Future Enhancements (v2.0.0)
- 🔜 User authentication and saved preferences
- 🔜 Email/SMS alerts for severe dust storms
- 🔜 Mobile application (iOS/Android)
- 🔜 AI-powered dust storm prediction
- 🔜 Integration with satellite imagery
- 🔜 Multi-language support (Arabic/English toggle)
- 🔜 Advanced analytics dashboard
- 🔜 API for third-party integrations

---

<div align="center">

**Made with ❤️ for safer skies in the Gulf region**

⭐ Star this repository if you find it helpful!

[Report Bug](https://github.com/bdour-alshehri0088/Haboob-Dashboard/issues) • [Request Feature](https://github.com/bdour-alshehri0088/Haboob-Dashboard/issues)

</div>
