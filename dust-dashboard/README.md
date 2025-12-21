# Dust Dashboard 🌪️

A comprehensive dashboard for visualizing dust-related meteorological data.

## Features
- **Precise WxCodes Filtering**: Filters for DU, SA, BLSA, BLDU, SS, DS, PO.
- **Interactive Map**: Leaflet-based map with heatmaps and station markers.
- **Wind Rose Analysis**: Generates wind roses for individual stations.
- **Detailed Summaries**: Matches specific reporting requirements.
- **RTL Support**: Fully supports Arabic layout and text.
- **Premium Design**: "Earthy" theme with responsive UI.

## WxCodes Explanation
The application filters METAR data for the following weather codes:
- **DU**: Dust (Widespread)
- **SA**: Sand
- **BLSA**: Blowing Sand
- **BLDU**: Blowing Dust
- **SS**: Sandstorm
- **DS**: Duststorm
- **PO**: Dust/Sand Whirls

## Setup Instructions

### Prerequisites
- Node.js installed

### Installation
1. Clone the repository.
2. Navigate to the backend directory:
   ```bash
   cd dust-dashboard/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally
1. Start the backend server:
   ```bash
   npm run dev
   ```
2. Open `dust-dashboard/frontend/index.html` in your browser (or use a simple static server like Live Server).

## Deployment on Render
1. Create a new Web Service on Render.
2. Connect your repository.
3. Set **Root Directory** to `dust-dashboard/backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `node server.js`.
6. Ensure environment variables are set if needed.

