/**
 * GoCar Car Rental Booking System - Vehicle Asset Presentation Module
 * Course: CSEB5213 Software Evolution & Maintenance
 * 
 * Separates SVG illustration rendering from controller logic.
 * Generates self-contained, offline vector graphics for vehicle models.
 */

const VehicleAssets = {
  /**
   * Generates clean SVG illustrations for each vehicle model (no external asset dependencies)
   * @param {string} imageType 
   * @param {string} carName 
   * @returns {string} SVG markup
   */
  getCarSvgIllustration(imageType, carName) {
    let bodyColor = '#da291c'; // GoCar Red default
    let carShape = 'hatchback';

    switch (imageType) {
      case 'axia':
        bodyColor = '#e02424';
        carShape = 'compact';
        break;
      case 'myvi':
        bodyColor = '#1f2937';
        carShape = 'hatchback';
        break;
      case 'saga':
        bodyColor = '#2563eb';
        carShape = 'sedan';
        break;
      case 'alza':
        bodyColor = '#059669';
        carShape = 'mpv';
        break;
      default:
        bodyColor = '#da291c';
        carShape = 'hatchback';
    }

    let silhouettePaths = '';

    if (carShape === 'sedan') {
      silhouettePaths = `
        <!-- Sedan Silhouette -->
        <path d="M 45 125 L 35 110 Q 40 95 65 92 L 105 88 L 140 50 L 220 50 L 255 88 L 290 92 Q 305 95 295 120 L 280 125 Z" fill="${bodyColor}"/>
        <!-- Windows -->
        <path d="M 112 85 L 143 54 L 175 54 L 175 85 Z" fill="url(#glassGrad)" opacity="0.9"/>
        <path d="M 182 85 L 182 54 L 217 54 L 246 85 Z" fill="url(#glassGrad)" opacity="0.9"/>
      `;
    } else if (carShape === 'mpv') {
      silhouettePaths = `
        <!-- MPV Silhouette (Alza) -->
        <path d="M 40 125 L 32 105 Q 38 90 60 88 L 100 82 L 130 42 L 260 42 L 285 88 L 295 115 L 280 125 Z" fill="${bodyColor}"/>
        <!-- Windows -->
        <path d="M 108 80 L 134 47 L 175 47 L 175 80 Z" fill="url(#glassGrad)" opacity="0.9"/>
        <path d="M 182 80 L 182 47 L 225 47 L 225 80 Z" fill="url(#glassGrad)" opacity="0.9"/>
        <path d="M 232 80 L 232 47 L 255 47 L 275 80 Z" fill="url(#glassGrad)" opacity="0.9"/>
      `;
    } else {
      silhouettePaths = `
        <!-- Compact / Hatchback (Axia / Myvi) -->
        <path d="M 45 125 L 36 108 Q 42 92 65 90 L 110 86 L 145 46 L 240 46 L 270 88 L 290 105 L 280 125 Z" fill="${bodyColor}"/>
        <!-- Windows -->
        <path d="M 116 83 L 148 51 L 185 51 L 185 83 Z" fill="url(#glassGrad)" opacity="0.9"/>
        <path d="M 192 83 L 192 51 L 234 51 L 260 83 Z" fill="url(#glassGrad)" opacity="0.9"/>
      `;
    }

    return `
      <svg class="car-illustration" viewBox="0 0 320 160" width="100%" height="150" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${DOMUtils ? DOMUtils.escapeHTML(carName || 'Vehicle') : 'Vehicle'}">
        <defs>
          <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#f1f5f9"/>
            <stop offset="100%" stop-color="#e2e8f0"/>
          </linearGradient>
          <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#bae6fd"/>
            <stop offset="100%" stop-color="#38bdf8"/>
          </linearGradient>
        </defs>

        <!-- Ground Shadow -->
        <ellipse cx="160" cy="142" rx="130" ry="10" fill="#cbd5e1" opacity="0.6"/>

        <!-- Car Body -->
        ${silhouettePaths}

        <!-- Headlight and Taillight -->
        <path d="M 35 106 Q 32 114 42 116 Z" fill="#fef08a"/>
        <path d="M 292 102 Q 295 110 286 112 Z" fill="#ef4444"/>

        <!-- Door seam and handle -->
        <line x1="180" y1="84" x2="180" y2="122" stroke="rgba(0,0,0,0.25)" stroke-width="2"/>
        <rect x="190" y="93" width="16" height="4" rx="2" fill="#ffffff" opacity="0.8"/>

        <!-- Wheels -->
        <!-- Rear Wheel -->
        <g transform="translate(85, 125)">
          <circle cx="0" cy="0" r="22" fill="#1e293b"/>
          <circle cx="0" cy="0" r="14" fill="#94a3b8"/>
          <circle cx="0" cy="0" r="6" fill="#334155"/>
        </g>
        <!-- Front Wheel -->
        <g transform="translate(245, 125)">
          <circle cx="0" cy="0" r="22" fill="#1e293b"/>
          <circle cx="0" cy="0" r="14" fill="#94a3b8"/>
          <circle cx="0" cy="0" r="6" fill="#334155"/>
        </g>
      </svg>
    `;
  }
};

if (typeof globalThis !== 'undefined') {
  globalThis.VehicleAssets = VehicleAssets;
}
