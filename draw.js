(() => {
// Chart drawings as inline SVG: the Western wheel and the Native American Medicine Wheel.
const {SIGNS, PLANETS, signOf, angDist} = Chart;
const {norm360, cosD, sinD} = Astro;
const EL_COL = {fire:"var(--fire)", earth:"var(--earth)", air:"var(--air)", water:"var(--water)"};

// ---- Western wheel. Ascendant on the left, signs running anticlockwise, like a printed chart.
function wheel(chart){
  const left = chart.timeKnown ? chart.points.asc.lon : chart.houses.cusps[0];
  const P = (lon, r) => { const t = (180 + lon - left)*Math.PI/180; return [r*Math.cos(t), -r*Math.sin(t)]; };
  const R1 = 170, R2 = 142, R3 = 70;
  let s = `<svg class="wheel" viewBox="-180 -180 360 360" font-family="var(--serif)">`;
  s += `<circle r="${R1}" fill="none" style="stroke:var(--line)"/><circle r="${R2}" fill="none" style="stroke:var(--line)"/><circle r="${R3}" fill="none" style="stroke:var(--line)"/>`;
  for(let i=0;i<12;i++){
    const [x1,y1] = P(i*30, R1), [x2,y2] = P(i*30, R2), [gx,gy] = P(i*30+15, (R1+R2)/2);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:var(--line)"/>`;
    s += `<text x="${gx}" y="${gy}" text-anchor="middle" dominant-baseline="central" font-size="15" style="fill:${EL_COL[SIGNS[i].element]}">${SIGNS[i].glyph}</text>`;
  }
  // houses
  chart.houses.cusps.forEach((c, i) => {
    const angle = chart.timeKnown && (i === 0 || i === 9);
    const [x1,y1] = P(c, R2), [x2,y2] = P(c, angle ? 0 : R3), [nx,ny] = P(c + norm360(chart.houses.cusps[(i+1)%12] - c)/2, R3 + 10);
    s += `<line x1="${x1}" y1="${y1}" x2="${angle ? P(c,R3)[0] : x2}" y2="${angle ? P(c,R3)[1] : y2}" style="stroke:${angle ? "var(--gold)" : "var(--line)"}" stroke-width="${angle?1.6:1}"/>`;
    s += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" font-size="8.5" style="fill:var(--faint)" font-family="var(--sans)">${i+1}</text>`;
  });
  // aspects
  for(const a of chart.aspects){
    if(a.a === "asc" || a.a === "mc" || a.b === "asc" || a.b === "mc") continue;
    const [x1,y1] = P(chart.points[a.a].lon, R3-2), [x2,y2] = P(chart.points[a.b].lon, R3-2);
    if(a.aspect.angle === 0) continue;
    const col = a.aspect.kind === "easy" ? "var(--air)" : "var(--bad)";
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${col}" stroke-opacity="${Math.max(.15, .7 - a.orb/10)}" stroke-width="1"/>`;
  }
  // planets, nudged apart so glyphs don't overlap
  const list = Astro.BODIES.map(k => ({k, lon:chart.points[k].lon, at:chart.points[k].lon})).sort((a,b)=>a.lon-b.lon);
  for(let pass=0; pass<6; pass++) for(let i=0;i<list.length;i++){
    const a = list[i], b = list[(i+1)%list.length];
    const gap = norm360(b.at - a.at);
    if(gap < 8){ a.at -= (8-gap)/2; b.at += (8-gap)/2; }
  }
  for(const p of list){
    const [x,y] = P(p.at, 118), [tx,ty] = P(p.lon, R2), [ux,uy] = P(p.lon, R2-6);
    s += `<line x1="${tx}" y1="${ty}" x2="${ux}" y2="${uy}" style="stroke:var(--gold)"/>`;
    s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="15" style="fill:var(--text)">${PLANETS[p.k].glyph}</text>`;
    const [dx,dy] = P(p.at, 100);
    s += `<text x="${dx}" y="${dy}" text-anchor="middle" dominant-baseline="central" font-size="7.5" font-family="var(--sans)" style="fill:var(--faint)">${Math.floor(norm360(p.lon)%30)}°${chart.points[p.k].retro?"℞":""}</text>`;
  }
  if(chart.timeKnown){
    const [ax,ay] = P(chart.points.asc.lon, R1+6), [mx,my] = P(chart.points.mc.lon, R1+6);
    s += `<text x="${ax-4}" y="${ay}" text-anchor="end" dominant-baseline="central" font-size="9" font-family="var(--sans)" style="fill:var(--gold)">AC</text>`;
    s += `<text x="${mx}" y="${my-4}" text-anchor="middle" font-size="9" font-family="var(--sans)" style="fill:var(--gold)">MC</text>`;
  }
  return s + `</svg>`;
}

// ---- Medicine Wheel: North (winter, Snow Goose) at the top, moving sunwise through East, South and West.
// The wedge you were born in glows; clan colours ring the inside.
const CLAN_COL = EL_COL;
function medicineWheel(mine){
  const pos = (i, r) => { const a = (((i - 9 + 12) % 12) * 30 + 15 - 90) * Math.PI/180; return [r*Math.cos(a), r*Math.sin(a)]; };
  const arc = (i, r1, r2) => {
    const a0 = (((i - 9 + 12) % 12) * 30 - 90) * Math.PI/180, a1 = a0 + Math.PI/6;
    const p = (r, a) => `${(r*Math.cos(a)).toFixed(2)},${(r*Math.sin(a)).toFixed(2)}`;
    return `M${p(r1,a0)}A${r1},${r1} 0 0 1 ${p(r1,a1)}L${p(r2,a1)}A${r2},${r2} 0 0 0 ${p(r2,a0)}Z`;
  };
  let s = `<svg class="wheel" viewBox="-170 -170 340 340" font-family="var(--sans)">`;
  for(let i=0;i<12;i++){
    const on = i === mine, el = SIGNS[i].element;
    s += `<path d="${arc(i,150,92)}" style="fill:${on ? "var(--gold)" : "var(--card)"};stroke:var(--line)" fill-opacity="${on ? .22 : 1}"/>`;
    s += `<path d="${arc(i,92,80)}" style="fill:${CLAN_COL[el]}" fill-opacity="${on ? .95 : .55}"/>`;
    const [x,y] = pos(i, 128), [mx,my] = pos(i, 106);
    s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${Native.TOTEMS[i].animal.length > 8 ? 8.2 : 9.5}" font-weight="${on?700:600}" style="fill:${on ? "var(--gold2)" : "var(--text)"}">${Native.TOTEMS[i].animal}</text>`;
    s += `<text x="${mx}" y="${my}" text-anchor="middle" dominant-baseline="central" font-size="6.6" style="fill:var(--faint)">${Native.TOTEMS[i].dates.split(" – ")[0]}</text>`;
  }
  s += `<circle r="80" style="fill:var(--bg)" fill-opacity=".35"/>`;
  s += `<path d="M0,-74V74M-74,0H74" style="stroke:var(--line)"/><circle r="22" fill="none" style="stroke:var(--line)"/>`;
  const D = [["N","Waboose",0,-52],["E","Wabun",52,0],["S","Shawnodese",0,52],["W","Mudjekeewis",-52,0]];
  const myDir = Native.DIRECTIONS[Math.floor(mine/3)].name[0];
  for(const [k,n,x,y] of D){
    const on = k === myDir;
    s += `<text x="${x}" y="${y-5}" text-anchor="middle" font-size="15" font-family="var(--display)" font-weight="700" style="fill:${on ? "var(--gold)" : "var(--dim)"}">${k}</text>`;
    s += `<text x="${x}" y="${y+9}" text-anchor="middle" font-size="6.8" style="fill:var(--faint)">${n}</text>`;
  }
  return s + `</svg>`;
}

window.Draw = {wheel, medicineWheel};
})();
