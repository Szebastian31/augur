/* Augur app icon, drawn on a 1024 grid, in the family style of Hora, Caelum and Consensus Weather:
   the same dawn sky, a frosted glass disc and a ring. Augur's ring is the agreement ring: four systems,
   three lit, around a guiding star and the twelve signs.
   round: rounded-square corners (favicon/preview). mask: content kept inside the Android safe zone. */
window.augurIcon = function ({ round = false, mask = false } = {}) {
  const k = mask ? 0.8 : 1, o = 512 * (1 - k);
  const R = 340, C = 2 * Math.PI * R, gap = 70, seg = C / 4 - gap;
  const segs = [0, 1, 2, 3].map(i => `<circle cx="512" cy="470" r="${R}" fill="none" stroke="${i < 3 ? "url(#arc)" : "#fff"}" stroke-opacity="${i < 3 ? 1 : .2}"
      stroke-width="26" stroke-linecap="round" stroke-dasharray="${seg.toFixed(1)} ${(C - seg).toFixed(1)}"
      transform="rotate(${(-90 + gap / 2 / C * 360 + i * 90).toFixed(2)} 512 470)"/>`).join("");
  const dots = [...Array(12)].map((_, i) => {
    const a = i * Math.PI / 6;
    return `<circle cx="${(512 + 228 * Math.sin(a)).toFixed(1)}" cy="${(470 - 228 * Math.cos(a)).toFixed(1)}" r="${i % 3 === 0 ? 9 : 6}" fill="#fff" fill-opacity="${i % 3 === 0 ? .85 : .5}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#070d2e"/><stop offset=".42" stop-color="#1f2e78"/><stop offset=".68" stop-color="#6b4f9a"/>
    <stop offset=".84" stop-color="#ea8a73"/><stop offset="1" stop-color="#ffc996"/>
  </linearGradient>
  <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff1d6"/><stop offset=".35" stop-color="#ffbe8c" stop-opacity=".75"/><stop offset="1" stop-color="#ff9a78" stop-opacity="0"/></radialGradient>
  <radialGradient id="aura" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffc996" stop-opacity=".24"/><stop offset="1" stop-color="#ffc996" stop-opacity="0"/></radialGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".16"/></linearGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity=".2"/></linearGradient>
  <linearGradient id="arc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe2c4"/><stop offset="1" stop-color="#ff9a78"/></linearGradient>
  <radialGradient id="star" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffe2c4"/></radialGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#050a28" flood-opacity=".45"/></filter>
  <filter id="shine" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="#ffc996" flood-opacity=".7"/></filter>
  <clipPath id="tile"><rect width="1024" height="1024" rx="${round ? 230 : 0}"/></clipPath>
</defs>
<g clip-path="url(#tile)">
  <rect width="1024" height="1024" fill="url(#sky)"/>
  <circle cx="512" cy="1010" r="460" fill="url(#sun)"/>
  <g fill="#fff">
    <circle cx="170" cy="150" r="7" opacity=".85"/><circle cx="860" cy="128" r="5" opacity=".7"/>
    <circle cx="790" cy="250" r="4" opacity=".55"/><circle cx="250" cy="300" r="3.5" opacity=".5"/>
  </g>
  <path d="M0 880 Q512 820 1024 880 V1024 H0Z" fill="#170f33" opacity=".55"/>
  <path d="M0 930 Q512 885 1024 930 V1024 H0Z" fill="#0d0a22" opacity=".7"/>
  <g transform="translate(${o} ${o}) scale(${k})">
    <circle cx="512" cy="470" r="380" fill="url(#aura)"/>
    <g filter="url(#shadow)">
      <circle cx="512" cy="470" r="290" fill="url(#glass)"/>
      <circle cx="512" cy="470" r="290" fill="none" stroke="url(#rim)" stroke-width="5"/>
    </g>
    <path d="M300 300 A290 290 0 0 1 690 225" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="10" stroke-linecap="round" filter="url(#soft)"/>
    <circle cx="512" cy="470" r="${R}" fill="none" stroke="#fff" stroke-opacity=".1" stroke-width="26"/>
    ${segs}
    ${dots}
    <path d="M512 290 Q530 452 692 470 Q530 488 512 650 Q494 488 332 470 Q494 452 512 290Z" fill="url(#star)" filter="url(#shine)"/>
    <circle cx="512" cy="470" r="16" fill="#ff9a78"/>
  </g>
</g>
</svg>`;
};
