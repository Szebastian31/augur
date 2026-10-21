/* Augur app icon, drawn on a 1024 grid. Same family as Caelum, Hora and Consensus Weather (a sky gradient,
   a soft horizon glow, frosted glass), but its own shape: the lituus, the curled staff a Roman augur used to
   mark out the sky, made of glass, with a star in its curl and two birds in flight (augurs read the birds).
   round: rounded-square corners (README, favicon). mask: content kept inside the Android safe zone. */
window.augurIcon = function ({ round = false, mask = false } = {}) {
  const k = mask ? 0.78 : 1, o = 512 * (1 - k);
  const staff = "M420 862 L420 452 C420 300 522 214 640 232 C750 250 788 372 722 438 C666 494 576 470 568 398 C562 344 614 316 654 344";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#14082b"/><stop offset=".36" stop-color="#3a1d6e"/><stop offset=".62" stop-color="#8a3f8f"/>
    <stop offset=".82" stop-color="#e2728a"/><stop offset="1" stop-color="#ffc08a"/>
  </linearGradient>
  <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff0d8"/><stop offset=".4" stop-color="#ffb48a" stop-opacity=".65"/><stop offset="1" stop-color="#ff8f8a" stop-opacity="0"/></radialGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity=".38"/></linearGradient>
  <radialGradient id="star" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#ffd7a8"/></radialGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="22" stdDeviation="26" flood-color="#12052a" flood-opacity=".5"/></filter>
  <filter id="shine" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#ffd7a8" flood-opacity=".9"/></filter>
  <clipPath id="tile"><rect width="1024" height="1024" rx="${round ? 230 : 0}"/></clipPath>
</defs>
<g clip-path="url(#tile)">
  <rect width="1024" height="1024" fill="url(#sky)"/>
  <ellipse cx="512" cy="1030" rx="560" ry="380" fill="url(#sun)"/>
  <!-- a small constellation, top left -->
  <g stroke="#fff" stroke-opacity=".28" stroke-width="3" fill="none"><path d="M150 210 L232 168 L300 232 L262 318"/></g>
  <g fill="#fff"><circle cx="150" cy="210" r="8" opacity=".9"/><circle cx="232" cy="168" r="6" opacity=".75"/><circle cx="300" cy="232" r="9" opacity=".95"/><circle cx="262" cy="318" r="5.5" opacity=".7"/>
    <circle cx="880" cy="140" r="5" opacity=".7"/><circle cx="930" cy="300" r="4" opacity=".5"/><circle cx="120" cy="470" r="4" opacity=".45"/></g>
  <!-- distant hills -->
  <path d="M0 860 Q260 800 520 846 T1024 830 V1024 H0Z" fill="#2a0f3d" opacity=".55"/>
  <path d="M0 920 Q300 872 600 912 T1024 900 V1024 H0Z" fill="#170826" opacity=".75"/>
  <g transform="translate(${o} ${o}) scale(${k})">
    <!-- two birds in flight -->
    <g fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity=".92">
      <path d="M156 560 Q196 520 228 556 Q260 520 300 560"/>
      <path d="M246 668 Q272 642 294 664 Q316 642 342 668" stroke-width="10" opacity=".7"/>
    </g>
    <!-- the glass staff -->
    <g filter="url(#shadow)">
      <path d="${staff}" fill="none" stroke="url(#glass)" stroke-width="74" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <path d="${staff}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="5" stroke-linecap="round" transform="translate(-22 -14)"/>
    <!-- the star in the curl -->
    <path d="M0 -92 Q10 -10 88 0 Q10 10 0 92 Q-10 10 -88 0 Q-10 -10 0 -92Z" fill="url(#star)" filter="url(#shine)" transform="translate(642 370) scale(.56)"/>
    <circle cx="642" cy="370" r="7" fill="#ff9a86"/>
  </g>
</g>
</svg>`;
};
