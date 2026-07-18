/* =========================================================
   Visuals — inline SVG car renders & brand emblems
   Everything is generated locally: no external images,
   no placeholders, no network dependency.
   ========================================================= */
"use strict";

/* ---------- Luxury sedan studio render (side profile) ---------- */
function carSVG(car, uid) {
  const id = `${car.id}-${uid}`;
  const c = car.color;
  const cl = car.colorLight;
  return `
  <svg class="car-render" viewBox="0 0 660 300" role="img"
       aria-label="${car.en}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="body-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0"   stop-color="${cl}"/>
        <stop offset="0.35" stop-color="${c}"/>
        <stop offset="1"   stop-color="${shade(c, -35)}"/>
      </linearGradient>
      <linearGradient id="glass-${id}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3b4356"/>
        <stop offset="1" stop-color="#0c0f16"/>
      </linearGradient>
      <linearGradient id="shine-${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0"   stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.5" stop-color="#fff" stop-opacity="0.35"/>
        <stop offset="1"   stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <radialGradient id="floor-${id}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#d4af37" stop-opacity="0.35"/>
        <stop offset="0.7" stop-color="#d4af37" stop-opacity="0.08"/>
        <stop offset="1" stop-color="#d4af37" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="hub-${id}" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#f4e3ae"/>
        <stop offset="0.35" stop-color="#8f8f96"/>
        <stop offset="1" stop-color="#2a2a30"/>
      </radialGradient>
    </defs>

    <!-- showroom floor glow -->
    <ellipse cx="330" cy="252" rx="290" ry="26" fill="url(#floor-${id})"/>

    <!-- body -->
    <path fill="url(#body-${id})" stroke="${shade(c, 45)}" stroke-width="2" d="
      M46 208
      C46 190 58 178 84 172
      C104 168 128 164 150 160
      C182 128 232 104 316 102
      C404 100 468 118 508 150
      C548 156 588 166 604 182
      C614 192 616 204 610 214
      C604 222 592 224 578 224
      L536 224 A44 44 0 0 0 448 224
      L216 224 A44 44 0 0 0 128 224
      L76 224 C56 224 46 218 46 208 Z"/>

    <!-- greenhouse -->
    <path fill="url(#glass-${id})" stroke="${shade(c, 55)}" stroke-width="2" d="
      M172 158
      C200 132 246 114 318 112
      C390 110 444 124 484 150
      C420 158 250 160 172 158 Z"/>
    <!-- B-pillar -->
    <rect x="322" y="112" width="7" height="47" rx="3" fill="${shade(c, -25)}" opacity="0.9"/>

    <!-- character line -->
    <path d="M92 182 C220 172 460 170 586 190" stroke="#ffffff" stroke-opacity="0.22"
          stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- roof shine sweep -->
    <path d="M180 122 C260 100 400 100 476 128 L470 136 C392 110 262 110 190 130 Z"
          fill="url(#shine-${id})"/>

    <!-- chrome window trim -->
    <path d="M170 160 C246 112 420 112 488 152" stroke="#e8d9a0" stroke-opacity="0.7"
          stroke-width="2" fill="none"/>

    <!-- headlight & tail-light -->
    <path d="M588 186 C600 190 608 198 608 206 L586 204 Z" fill="#ffe9b0">
      <animate attributeName="opacity" values="0.75;1;0.75" dur="2.6s" repeatCount="indefinite"/>
    </path>
    <path d="M50 196 C48 202 50 208 56 212 L70 210 L68 196 Z" fill="#c22b3a" opacity="0.9"/>

    <!-- door handles -->
    <rect x="246" y="168" width="34" height="5" rx="2.5" fill="#dfd3a8" opacity="0.75"/>
    <rect x="356" y="168" width="34" height="5" rx="2.5" fill="#dfd3a8" opacity="0.75"/>

    <!-- rocker chrome -->
    <rect x="150" y="216" width="360" height="4" rx="2" fill="#cbb26a" opacity="0.45"/>

    <!-- wheels -->
    ${wheelSVG(172, 224, id)}
    ${wheelSVG(492, 224, id)}

    <!-- floor reflection -->
    <g opacity="0.16" transform="translate(0,470) scale(1,-1)">
      <path fill="url(#body-${id})" d="
        M46 208 C46 190 58 178 84 172 C104 168 128 164 150 160
        C182 128 232 104 316 102 C404 100 468 118 508 150
        C548 156 588 166 604 182 C614 192 616 204 610 214
        C604 222 592 224 578 224 L76 224 C56 224 46 218 46 208 Z"/>
    </g>
  </svg>`;
}

function wheelSVG(cx, cy, id) {
  const spokes = Array.from({ length: 10 }, (_, i) => {
    const a = (i * 36 * Math.PI) / 180;
    return `<line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(a) * 24}" y2="${cy + Math.sin(a) * 24}"
             stroke="#c9c9d2" stroke-width="3" stroke-linecap="round"/>`;
  }).join("");
  return `
    <g>
      <circle cx="${cx}" cy="${cy}" r="42" fill="#101014" stroke="#2c2c34" stroke-width="3"/>
      <circle cx="${cx}" cy="${cy}" r="27" fill="#1b1b22"/>
      <g opacity="0.9">${spokes}</g>
      <circle cx="${cx}" cy="${cy}" r="8" fill="url(#hub-${id})" stroke="#e8d9a0" stroke-width="1.5"/>
    </g>`;
}

/* Lighten / darken a hex color by percent (-100..100) */
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const amt = Math.round(2.55 * pct);
  const r = Math.min(255, Math.max(0, (n >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amt));
  const b = Math.min(255, Math.max(0, (n & 255) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

/* ---------- Brand emblems (stylized, drawn as gold-line SVG) ---------- */
const GOLD = "#e6c96a";

const EMBLEMS = {
  /* Mercedes — three-pointed star in a ring */
  mercedes: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD}" stroke-width="4"/>
    <path fill="${GOLD}" d="M50 8 L54 46 L86 71 L52 53 L50 92 L48 53 L14 71 L46 46 Z"/></svg>`,

  /* BMW — quartered roundel */
  bmw: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="none" stroke="${GOLD}" stroke-width="5"/>
    <circle cx="50" cy="50" r="31" fill="none" stroke="${GOLD}" stroke-width="2.5"/>
    <path d="M50 19 A31 31 0 0 1 81 50 L50 50 Z" fill="${GOLD}" opacity=".9"/>
    <path d="M50 81 A31 31 0 0 1 19 50 L50 50 Z" fill="${GOLD}" opacity=".9"/>
    <text x="50" y="14" font-size="11" fill="${GOLD}" text-anchor="middle" font-family="Arial" letter-spacing="2">BMW</text></svg>`,

  /* Audi — four interlocked rings */
  audi: `<svg viewBox="0 0 160 70">${[28, 62, 96, 130].map(x =>
    `<circle cx="${x}" cy="35" r="24" fill="none" stroke="${GOLD}" stroke-width="5"/>`).join("")}</svg>`,

  /* Lexus — L inside an oval */
  lexus: `<svg viewBox="0 0 120 80"><ellipse cx="60" cy="40" rx="54" ry="34" fill="none" stroke="${GOLD}" stroke-width="4"/>
    <path d="M60 14 L34 60 C46 66 78 66 94 56" fill="none" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/></svg>`,

  /* Porsche — crest silhouette */
  porsche: `<svg viewBox="0 0 100 110"><path d="M50 6 L88 16 L88 60 C88 86 70 100 50 106 C30 100 12 86 12 60 L12 16 Z"
      fill="none" stroke="${GOLD}" stroke-width="4"/>
    <path d="M30 38 h40 M30 52 h40" stroke="${GOLD}" stroke-width="3"/>
    <path d="M38 66 L50 88 L62 66 Z" fill="${GOLD}"/>
    <text x="50" y="30" font-size="13" fill="${GOLD}" text-anchor="middle" font-family="Georgia">P</text></svg>`,

  /* Genesis — winged shield */
  genesis: `<svg viewBox="0 0 160 70">
    <path d="M80 22 L96 35 L80 48 L64 35 Z" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
    <path d="M62 33 C40 20 18 22 6 35 C22 30 44 33 62 38 Z" fill="${GOLD}"/>
    <path d="M98 33 C120 20 142 22 154 35 C138 30 116 33 98 38 Z" fill="${GOLD}"/></svg>`,

  /* Maserati — trident */
  maserati: `<svg viewBox="0 0 80 110">
    <path d="M40 6 L40 96 M40 96 L28 106 M40 96 L52 106" stroke="${GOLD}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M16 34 C14 18 22 10 28 8 C24 22 28 34 34 42 Z" fill="${GOLD}"/>
    <path d="M64 34 C66 18 58 10 52 8 C56 22 52 34 46 42 Z" fill="${GOLD}"/>
    <path d="M36 6 L40 0 L44 6 L40 14 Z" fill="${GOLD}"/></svg>`,

  /* Bentley — winged B */
  bentley: `<svg viewBox="0 0 170 70">
    <circle cx="85" cy="35" r="20" fill="none" stroke="${GOLD}" stroke-width="4"/>
    <text x="85" y="43" font-size="24" fill="${GOLD}" text-anchor="middle" font-family="Georgia" font-weight="bold">B</text>
    ${[0, 1].map(s => `<g transform="translate(85,35) scale(${s ? -1 : 1},1)">
      <path d="M22 -6 C46 -22 70 -20 82 -8 C64 -12 44 -8 24 2 Z" fill="${GOLD}"/>
      <path d="M24 4 C48 -4 66 -2 76 4 C60 4 42 8 26 12 Z" fill="${GOLD}" opacity=".8"/></g>`).join("")}</svg>`,

  /* Rolls-Royce — double R monogram */
  rolls: `<svg viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="8" fill="none" stroke="${GOLD}" stroke-width="3.5"/>
    <text x="42" y="62" font-size="44" fill="${GOLD}" text-anchor="middle" font-family="Georgia" font-style="italic">R</text>
    <text x="60" y="74" font-size="44" fill="${GOLD}" text-anchor="middle" font-family="Georgia" font-style="italic" opacity=".85">R</text></svg>`,

  /* Lucid — modern wordmark */
  lucid: `<svg viewBox="0 0 160 60"><text x="80" y="38" font-size="30" fill="${GOLD}" text-anchor="middle"
    font-family="Futura, 'Century Gothic', Arial" letter-spacing="8">LUCID</text>
    <line x1="20" y1="48" x2="140" y2="48" stroke="${GOLD}" stroke-width="2"/></svg>`,
};

function emblemSVG(carId) {
  return `<span class="emblem">${EMBLEMS[carId] || ""}</span>`;
}
