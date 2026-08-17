// Helper to generate realistic high-clarity fingerprint pattern SVGs for preview and testing
export function generateRealisticFingerprintSVG(fingerKey: string = 'R1', pattern: string = 'WC', index: number = 0): string {
  return generateFingerprintSvg(pattern, fingerKey, index);
}

export function generateFingerprintSvg(pattern: string = 'WC', fingerKey: string = 'R1', index: number = 0): string {
  const seed = (fingerKey.charCodeAt(0) + fingerKey.charCodeAt(1) + index * 17) % 100;
  
  let paths = '';
  const numRings = 24;
  const centerX = 150;
  const centerY = 170;

  if (pattern.startsWith('W')) {
    // Whorl pattern (circular concentric loops & spirals)
    for (let r = 12; r < 140; r += 5) {
      const rx = r + (seed % 4);
      const ry = r * 1.18 + ((seed + r) % 5);
      paths += `<ellipse cx="${centerX}" cy="${centerY}" rx="${rx}" ry="${ry}" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-opacity="${0.6 + (r % 7) * 0.05}" />`;
    }
    // Add delta indicators
    paths += `<path d="M 50,220 L 70,250 L 30,250 Z" fill="none" stroke="#f43f5e" stroke-width="2" />`;
    paths += `<path d="M 250,220 L 270,250 L 230,250 Z" fill="none" stroke="#f43f5e" stroke-width="2" />`;
    paths += `<circle cx="${centerX}" cy="${centerY}" r="4" fill="#10b981" />`;
  } else if (pattern.startsWith('U') || pattern.startsWith('R')) {
    // Loop pattern
    const isUlnar = pattern.startsWith('U');
    const tilt = isUlnar ? 25 : -25;
    for (let r = 10; r < 130; r += 5.5) {
      const h = r * 1.8;
      const x1 = centerX - r * 0.9;
      const x2 = centerX + r * 0.9;
      paths += `<path d="M ${x1},${centerY + 90} C ${x1 + tilt},${centerY - h * 0.5} ${x2 + tilt},${centerY - h * 0.5} ${x2},${centerY + 90}" fill="none" stroke="#60a5fa" stroke-width="2.2" stroke-opacity="0.8" />`;
    }
    // Delta indicator
    const deltaX = isUlnar ? 60 : 240;
    paths += `<path d="M ${deltaX},230 L ${deltaX + 18},255 L ${deltaX - 18},255 Z" fill="none" stroke="#f43f5e" stroke-width="2" />`;
    paths += `<circle cx="${centerX + (isUlnar ? 10 : -10)}" cy="${centerY - 10}" r="4" fill="#10b981" />`;
  } else {
    // Arch pattern
    for (let r = 10; r < 140; r += 5.5) {
      const archH = r * 0.9;
      paths += `<path d="M 30,${centerY + 100 - r * 0.6} Q ${centerX},${centerY - archH} 270,${centerY + 100 - r * 0.6}" fill="none" stroke="#a78bfa" stroke-width="2.2" stroke-opacity="0.85" />`;
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340" width="300" height="340" class="w-full h-full bg-slate-950">
      <defs>
        <radialGradient id="glow-${fingerKey}-${index}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#0f172a" stop-opacity="1" />
          <stop offset="100%" stop-color="#020617" stop-opacity="1" />
        </radialGradient>
        <pattern id="grid-${fingerKey}-${index}" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.75"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#glow-${fingerKey}-${index})" />
      <rect width="100%" height="100%" fill="url(#grid-${fingerKey}-${index})" opacity="0.4" />
      
      <!-- Finger print outline boundary -->
      <path d="M 150,20 C 230,20 270,80 270,180 C 270,270 230,320 150,320 C 70,320 30,270 30,180 C 30,80 70,20 150,20 Z" fill="#030712" stroke="#334155" stroke-dasharray="4 4" stroke-width="1.5" />
      
      <!-- Ridge Lines -->
      <g>
        ${paths}
      </g>
      
      <!-- Metadata Tag on scan -->
      <text x="40" y="45" font-family="sans-serif" font-size="11" font-weight="bold" fill="#94a3b8" letter-spacing="1">MBT SCAN: ${fingerKey} | ${pattern}</text>
      <text x="40" y="60" font-family="sans-serif" font-size="9" fill="#64748b">AUTO-COUNT RC: ${12 + (seed % 8)}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generatePalmSvg(hand: 'left' | 'right', atdAngle: number = 37): string {
  const isLeft = hand === 'left';
  const aX = isLeft ? 100 : 200;
  const aY = 110;
  const dX = isLeft ? 200 : 100;
  const dY = 115;
  const tX = 150;
  const tY = 270;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 340" width="300" height="340" class="w-full h-full bg-slate-950">
      <rect width="100%" height="100%" fill="#020617" />
      <!-- Palm Contour -->
      <path d="M 60,180 C 50,100 80,60 150,60 C 220,60 250,100 240,180 C 235,260 210,310 150,310 C 90,310 65,260 60,180 Z" fill="#090d16" stroke="#334155" stroke-width="2" />
      
      <!-- ATD Triangle Lines -->
      <line x1="${aX}" y1="${aY}" x2="${tX}" y2="${tY}" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="3 3" />
      <line x1="${dX}" y1="${dY}" x2="${tX}" y2="${tY}" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="3 3" />
      <line x1="${aX}" y1="${aY}" x2="${dX}" y2="${dY}" stroke="#94a3b8" stroke-width="1.5" />
      
      <!-- Triradius Points -->
      <circle cx="${aX}" cy="${aY}" r="6" fill="#f43f5e" />
      <text x="${aX + (isLeft ? -20 : 10)}" y="${aY - 5}" fill="#f43f5e" font-weight="bold" font-size="12">a</text>
      
      <circle cx="${dX}" cy="${dY}" r="6" fill="#f43f5e" />
      <text x="${dX + (isLeft ? 10 : -20)}" y="${dY - 5}" fill="#f43f5e" font-weight="bold" font-size="12">d</text>
      
      <circle cx="${tX}" cy="${tY}" r="6" fill="#10b981" />
      <text x="${tX + 10}" y="${tY + 15}" fill="#10b981" font-weight="bold" font-size="12">t</text>
      
      <!-- ATD Angle Arc -->
      <path d="M ${tX - 15},${tY - 30} Q ${tX},${tY - 40} ${tX + 15},${tY - 30}" fill="none" stroke="#fbbf24" stroke-width="2" />
      <text x="${tX - 25}" y="${tY - 45}" fill="#fbbf24" font-weight="bold" font-size="13">ATD: ${atdAngle.toFixed(1)}°</text>
      
      <text x="30" y="35" font-family="sans-serif" font-size="11" font-weight="bold" fill="#cbd5e1">${hand.toUpperCase()} PALM ATD TRIANGLE</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
