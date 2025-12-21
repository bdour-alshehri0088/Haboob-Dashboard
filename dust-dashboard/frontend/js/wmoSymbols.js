/**
 * Professional WMO Station Plot - Enhanced with Flight Rules Colors & Synoptic Format
 */

// Dust phenomenon symbols - WMO Standard
const DUST_SYMBOLS = {
    // Severe storms (DS/SS)
    'DS': `<image href="assets/images/ds_ss.png" x="-15" y="-15" width="30" height="30" />`,
    'SS': `<image href="assets/images/ds_ss.png" x="-15" y="-15" width="30" height="30" />`,

    // Blowing/Suspended dust/sand
    'BLDU': `<image href="assets/images/bldu_blsa.png" x="-15" y="-15" width="30" height="30" />`,
    'BLSA': `<image href="assets/images/bldu_blsa.png" x="-15" y="-15" width="30" height="30" />`,

    // Suspended dust/sand
    'DU': `<image href="assets/images/du_sa.png" x="-15" y="-15" width="30" height="30" />`,
    'SA': `<image href="assets/images/du_sa.png" x="-15" y="-15" width="30" height="30" />`,

    // Dust whirls (PO)
    'PO': `<image href="assets/images/po.png" x="-15" y="-15" width="30" height="30" />`
};

/**
 * Format pressure in synoptic format (last 3 digits * 10)
 * e.g., 1012.4 -> 124, 998.7 -> 987
 */
const formatPressure = (p) => {
    if (!p) return "";
    let val = parseFloat(p);
    if (isNaN(val)) return "";
    let shortVal = (val >= 1000) ? val - 1000 : val - 900;
    return Math.round(shortVal * 10).toString().padStart(3, '0');
};

/**
 * Get visibility color based on Flight Rules (meters)
 */
const getVisColor = (visMiles) => {
    if (!visMiles && visMiles !== 0) return "#ffffff";
    let visMeters = parseFloat(visMiles) * 1609.34; // Convert miles to meters
    if (visMeters < 1600) return "#d500f9"; // LIFR - Magenta (Very Severe)
    if (visMeters < 5000) return "#ff1744"; // IFR - Red
    if (visMeters < 8000) return "#2979ff"; // MVFR - Blue
    return "#00e676"; // VFR - Green
};

/**
 * Generate wind barb SVG
 */
const getWindBarbSVG = (speed, isWhite = true) => {
    let spd = Math.round(speed / 5) * 5;
    const strokeColor = isWhite ? "white" : "black";
    const fillColor = isWhite ? "white" : "black";

    if (spd < 5) return ""; // Calm - will draw double circle separately

    let svg = `<line x1="0" y1="0" x2="0" y2="-45" stroke="${strokeColor}" stroke-width="2.5" />`;
    let y = -45;
    let tempSpd = spd;

    // 50kt Pennants (Triangles)
    while (tempSpd >= 50) {
        svg += `<polygon points="0,${y} 15,${y + 5} 0,${y + 10}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1"/>`;
        y += 12;
        tempSpd -= 50;
    }

    // 10kt Barbs (Full lines)
    while (tempSpd >= 10) {
        svg += `<line x1="0" y1="${y}" x2="15" y2="${y - 5}" stroke="${strokeColor}" stroke-width="2.5" />`;
        y += 7;
        tempSpd -= 10;
    }

    // 5kt Barbs (Half lines)
    if (tempSpd >= 5) {
        svg += `<line x1="0" y1="${y}" x2="8" y2="${y - 3}" stroke="${strokeColor}" stroke-width="2.5" />`;
    }

    return svg;
};

/**
 * Get dust symbol SVG based on wxcode
 */
const getDustSymbol = (wxcode) => {
    if (!wxcode) return '';
    const code = wxcode.toUpperCase();

    // Priority order is CRITICAL here.
    // 1. PO, DS, SS (Specific/Severe)
    // 2. BLDU, BLSA (Blowing - Must be checked BEFORE DU/SA because 'BLDU' contains 'DU')
    // 3. DU, SA (Suspended - General)
    // Substring check (.includes) allows matching modifiers like '+BLDU', 'TSSS', 'VCBLDU'
    const priority = ['PO', 'DS', 'SS', 'BLDU', 'BLSA', 'DU', 'SA'];

    for (const type of priority) {
        if (code.includes(type)) {
            if (DUST_SYMBOLS[type]) {
                return `<g transform="scale(1.3)">${DUST_SYMBOLS[type]}</g>`;
            }
        }
    }
    return '';
};

/**
 * Check if severe dust (for obscured sky)
 */
const isSevereDust = (wxcode) => {
    if (!wxcode) return false;
    const code = wxcode.toUpperCase();
    return code.includes('DS') || code.includes('SS') ||
        code.includes('+DU') || code.includes('+SA') ||
        code.includes('+BLDU') || code.includes('+BLSA');
};

/**
 * Generate WMO Cloud Cover SVG (N okta)
 */
const getCloudCoverSVG = (data) => {
    // Determine maximum cloud cover reported
    const layers = [data.skyc1, data.skyc2, data.skyc3, data.skyc4].filter(c => c);

    let maxCover = 'CLR';
    const hierarchy = { 'VV': 9, 'OVC': 8, 'BKN': 6, 'SCT': 4, 'FEW': 2, 'CLR': 0, 'SKC': 0 };

    layers.forEach(l => {
        if (hierarchy[l] > (hierarchy[maxCover] || 0)) {
            maxCover = l;
        }
    });

    const okta = hierarchy[maxCover] || 0;

    // Base circle
    let svg = `<circle cx="60" cy="60" r="7" fill="none" stroke="#333" stroke-width="1.5" />`;

    // Shading logic for WMO Station Model (N)
    switch (okta) {
        case 0: // CLR/SKC - Empty circle
            break;
        case 1: // 1/8 - Vertical line (simplified)
            svg += `<line x1="60" y1="53" x2="60" y2="67" stroke="#333" stroke-width="1.5"/>`;
            break;
        case 2: // FEW (2/8) - Quarter shaded (top-right)
            svg += `<path d="M 60 60 L 60 53 A 7 7 0 0 1 67 60 Z" fill="#333" />`;
            svg += `<line x1="60" y1="53" x2="60" y2="67" stroke="#333" stroke-width="1.5"/>`;
            break;
        case 3: // 3/8 - Quarter shaded + line
            svg += `<path d="M 60 60 L 60 53 A 7 7 0 0 1 67 60 Z" fill="#333" />`;
            svg += `<line x1="60" y1="53" x2="60" y2="67" stroke="#333" stroke-width="1.5"/>`;
            svg += `<line x1="53" y1="60" x2="67" y2="60" stroke="#333" stroke-width="1.5"/>`;
            break;
        case 4: // SCT (4/8) - Half shaded
            svg += `<path d="M 60 53 A 7 7 0 0 1 60 67 Z" fill="#333" />`;
            svg += `<line x1="60" y1="53" x2="60" y2="67" stroke="#333" stroke-width="1.5"/>`;
            break;
        case 5: // 5/8 - Half shaded + line
            svg += `<path d="M 60 53 A 7 7 0 0 1 60 67 Z" fill="#333" />`;
            svg += `<line x1="60" y1="53" x2="60" y2="67" stroke="#333" stroke-width="1.5"/>`;
            svg += `<line x1="53" y1="60" x2="60" y2="60" stroke="#333" stroke-width="1.5"/>`;
            break;
        case 6: // BKN (6/8) - 3/4 shaded
            svg += `<path d="M 60 60 L 60 53 A 7 7 0 1 1 53 60 Z" fill="#333" />`;
            svg += `<line x1="60" y1="53" x2="60" y2="67" stroke="#333" stroke-width="1.5"/>`;
            svg += `<line x1="53" y1="60" x2="67" y2="60" stroke="#333" stroke-width="1.5"/>`;
            break;
        case 7: // 7/8 - Almost full (circle with small white slice)
            svg = `<circle cx="60" cy="60" r="7" fill="#333" stroke="#333" stroke-width="1.5" />`;
            svg += `<line x1="60" y1="53" x2="60" y2="60" stroke="white" stroke-width="1.5"/>`;
            break;
        case 8: // OVC (8/8) - Full shaded
            svg = `<circle cx="60" cy="60" r="7" fill="#333" stroke="#333" stroke-width="1.5" />`;
            svg += `<line x1="53" y1="60" x2="67" y2="60" stroke="white" stroke-width="1.5"/>`;
            break;
        case 9: // VV (Obscured) - Circle with X
            svg = `
                <circle cx="60" cy="60" r="7" fill="white" stroke="#333" stroke-width="2" />
                <line x1="55" y1="55" x2="65" y2="65" stroke="#d32f2f" stroke-width="2.5"/>
                <line x1="65" y1="55" x2="55" y2="65" stroke="#d32f2f" stroke-width="2.5"/>
            `;
            break;
        default:
            break;
    }

    return svg;
};

/**
 * Create Professional Station Plot
 */
export const createStationIcon = (data) => {
    const windSpeed = parseFloat(data.sknt) || 0;
    const windDir = parseFloat(data.drct) || 0;
    const wxCode = data.wxcodes || '';
    const visMiles = parseFloat(data.vsby) || 10;
    const tempF = parseFloat(data.tmpf);
    const tempC = !isNaN(tempF) ? Math.round((tempF - 32) * 5 / 9) : '--';
    const dewF = parseFloat(data.dwpf);
    const dewC = !isNaN(dewF) ? Math.round((dewF - 32) * 5 / 9) : '--';
    const pressure = data.alti ? parseFloat(data.alti) * 33.8639 : null; // Convert inHg to mb
    const station = data.station || '';
    const metar = data.metar || '';
    const time = data.valid || '';

    // Prepare values
    const presTxt = formatPressure(pressure);
    const visColor = getVisColor(visMiles);
    const visMeters = Math.round(visMiles * 1609.34);
    const windSVG = getWindBarbSVG(windSpeed, false);  // false = black color
    const dustSVG = getDustSymbol(wxCode);

    // Center circle logic
    let centerCircleSVG = '';

    if (windSpeed < 5) {
        // Calm: Double circle (green outer, black inner)
        centerCircleSVG = `
            <circle cx="60" cy="60" r="10" fill="none" stroke="#00c853" stroke-width="2" />
            <circle cx="60" cy="60" r="6" fill="none" stroke="#333" stroke-width="2" />
        `;
    } else if (isSevereDust(wxCode)) {
        // Obscured due to severe dust
        centerCircleSVG = `
            <circle cx="60" cy="60" r="7" fill="white" stroke="#333" stroke-width="2" />
            <line x1="55" y1="55" x2="65" y2="65" stroke="#d32f2f" stroke-width="2.5"/>
            <line x1="65" y1="55" x2="55" y2="65" stroke="#d32f2f" stroke-width="2.5"/>
        `;
    } else {
        // Standard Cloud Cover based on METAR sky conditions
        centerCircleSVG = getCloudCoverSVG(data);
    }

    const iconHtml = `
        <div class="pro-station-plot" style="width:120px; height:120px; font-family:Arial, sans-serif;" 
             data-station="${station}" data-metar="${encodeURIComponent(metar)}" data-time="${time}">
            <svg width="120" height="120" viewBox="0 0 120 120">
                <!-- Wind Barb -->
                <g transform="translate(60,60) rotate(${windDir})">
                    ${windSVG}
                </g>

                <!-- Center Circle -->
                ${centerCircleSVG}

                <!-- Dust Symbol (left of center) - Natural size -->
                <g transform="translate(38, 60)">
                    ${dustSVG}
                </g>

                <!-- Temperature (top-left, red with white outline) -->
                <text x="40" y="40" text-anchor="end" fill="#c62828" stroke="white" stroke-width="3" paint-order="stroke"
                      style="font-size:14px; font-weight:900;">${tempC}</text>
                
                <!-- Dew Point (bottom-left, green with white outline) -->
                <text x="40" y="90" text-anchor="end" fill="#1b5e20" stroke="white" stroke-width="3" paint-order="stroke"
                      style="font-size:14px; font-weight:900;">${dewC}</text>

                <!-- Pressure (top-right, black with white outline) -->
                <text x="80" y="40" text-anchor="start" fill="#000" stroke="white" stroke-width="3" paint-order="stroke"
                      style="font-size:13px; font-weight:bold;">${presTxt}</text>

                <!-- Visibility (bottom-right, colored with white outline) -->
                <text x="75" y="80" text-anchor="start" fill="${visColor}" stroke="white" stroke-width="3" paint-order="stroke"
                      style="font-size:12px; font-weight:900;">${visMiles.toFixed(1)}</text>

                <!-- Station ID (bottom, black with white outline) -->
                <text x="60" y="110" text-anchor="middle" fill="#000" stroke="white" stroke-width="2" paint-order="stroke"
                      style="font-size:11px; font-weight:bold;">${station}</text>
            </svg>
        </div>
    `;

    return iconHtml;
};

/**
 * Create popup content for METAR display
 */
export const createMetarPopup = (data) => {
    const station = data.station || 'Unknown';
    const time = data.valid ? new Date(data.valid).toLocaleString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit',
        day: '2-digit', month: 'short', year: 'numeric'
    }) : 'N/A';
    const metar = data.metar || 'METAR not available';
    const tempF = parseFloat(data.tmpf);
    const tempC = !isNaN(tempF) ? Math.round((tempF - 32) * 5 / 9) : 'N/A';
    const visMiles = parseFloat(data.vsby) || 'N/A';
    const windSpeed = parseFloat(data.sknt) || 0;
    const windDir = parseFloat(data.drct) || 0;
    const wxCode = data.wxcodes || 'None';

    return `
        <div style="font-family: 'Courier New', monospace; font-size: 13px; color: #333; min-width: 280px;">
            <div style="background: #2c3e50; color: white; padding: 8px 12px; margin: -14px -20px 10px -20px; font-weight: bold;">
                Station: ${station}
            </div>
            <div style="padding: 5px;">
                <strong>Time:</strong> ${time} UTC<br>
                <strong>Temp:</strong> ${tempC}°C | <strong>Wind:</strong> ${windDir}° @ ${windSpeed} kt<br>
                <strong>Visibility:</strong> ${visMiles} mi | <strong>Weather Code:</strong> ${wxCode}<br>
                <hr style="margin: 8px 0; border: 0; border-top: 1px solid #ccc;">
                <strong>Raw METAR:</strong><br>
                <span style="color: #1565c0; font-weight: bold; word-break: break-all;">${metar}</span>
            </div>
        </div>
    `;
};
