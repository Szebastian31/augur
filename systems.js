(() => {
// Systems tab: Western, Native American, Chinese and Numerology in full detail.
const {SIGNS, PLANETS, signOf, fmtDeg, HOUSE_SYSTEMS} = Chart;
const {SIGN_TEXT, PLANET_TEXT, HOUSE_TEXT} = Texts;
const {$, esc, sheet, dateFmt} = UI;
let current = "western";

function render(S, which){
  if(which) current = which;
  const tabs = [["western","Western"],["native","Native American"],["chinese","Chinese"],["numerology","Numerology"]];
  const body = {western, native, chinese, numerology}[current](S);
  $("#v-systems").innerHTML = `<div class="top"><div><div class="date">Four ways to read you</div><h1>Systems</h1></div></div>
    <div class="tabs">${tabs.map(([k,n])=>`<button data-k="${k}" class="${k===current?"on":""}">${n}</button>`).join("")}</div>${body}`;
  document.querySelectorAll("#v-systems .tabs button").forEach(b => b.onclick = () => { render(S, b.dataset.k); UI.buzz("8"); UI.toTop(); });
  document.querySelectorAll("#v-systems [data-planet]").forEach(el => el.onclick = () => planetSheet(S, el.dataset.planet));
  document.querySelectorAll("#v-systems [data-num]").forEach(el => el.onclick = () => numberSheet(S, el.dataset.num));
  document.querySelectorAll("#v-systems [data-totem]").forEach(el => el.onclick = () => totemSheet(+el.dataset.totem));
}

// ---- Western
function western(S){
  const ch = S.chart, p = ch.points;
  const rows = Astro.BODIES.concat(ch.timeKnown ? ["asc","mc"] : []).map(k => `<tr class="tap" data-planet="${k}"><td class="g">${PLANETS[k].glyph}</td>
      <td>${PLANETS[k].name}${p[k].retro ? " ℞" : ""}</td><td>${SIGNS[signOf(p[k].lon)].glyph} ${fmtDeg(p[k].lon)}</td>
      <td class="r faint small">${k==="asc"||k==="mc" ? "" : "house "+ch.houseOfPlanet[k]}</td></tr>`).join("");
  const asp = ch.aspects.filter(a => a.orb < 6).slice(0,14).map(a => `<tr><td class="g">${a.aspect.glyph}</td><td>${PLANETS[a.a].name} ${a.aspect.name} ${PLANETS[a.b].name}</td><td class="r">${a.orb.toFixed(1)}°</td></tr>`).join("");
  const bal = ch.balance, tot = Object.values(bal.elements).reduce((a,b)=>a+b,0);
  const bars = Object.entries(bal.elements).map(([e,v]) => `<div class="ratings"><div class="r"><span>${e[0].toUpperCase()+e.slice(1)}</span><div class="bar"><i style="width:${v/tot*100}%; background:var(--${e})"></i></div><span class="small">${v}</span></div></div>`).join("");
  const sysName = ch.houses.system === "solar" ? "Solar houses (no birth time)" : ch.houses.system === "porphyry-fallback" ? "Porphyry (Placidus fails near the poles)" : HOUSE_SYSTEMS[ch.houses.system];
  return `<div class="card">${Draw.wheel(ch)}<p class="tiny faint" style="text-align:center">Tropical zodiac · ${sysName}${ch.timeKnown ? "" : " · without a birth time the chart is drawn for noon"}</p></div>
    <div class="card"><div class="label">Planets <span>tap for meaning</span></div><table class="list">${rows}</table></div>
    <div class="card"><div class="label">Elements</div>${bars}<p class="small dim">Mostly <b>${bal.element}</b> and <b>${bal.mode}</b>. Sun, Moon and Ascendant count double.</p></div>
    <div class="card"><div class="label">Main aspects</div>${asp ? `<table class="list">${asp}</table>` : `<p class="small dim">No close aspects.</p>`}</div>
    ${ch.timeKnown ? `<div class="card"><div class="label">House cusps</div><table class="list">${ch.houses.cusps.map((c,i)=>`<tr><td class="g">${i+1}</td><td>${HOUSE_TEXT[i].name}</td><td class="r">${fmtDeg(c)}</td></tr>`).join("")}</table></div>` : ""}`;
}
function planetSheet(S, k){
  const ch = S.chart, pl = ch.points[k], s = signOf(pl.lon), T = PLANET_TEXT[k];
  const h = k === "asc" || k === "mc" ? null : ch.houseOfPlanet[k];
  sheet(`<h2>${PLANETS[k].glyph} ${PLANETS[k].name} in ${SIGNS[s].name}</h2>
    <p class="dim">${PLANETS[k].name} shows ${T.means}.</p>
    <div class="card reading"><p>${T.verb} ${SIGN_TEXT[s].style}.</p><p class="small dim">${SIGN_TEXT[s].core}</p>
    ${h && ch.timeKnown ? `<p class="small">In your <b>${Consensus.ordinal(h)} house</b>, it plays out in ${HOUSE_TEXT[h-1].text}.</p>` : ""}
    ${pl.retro ? `<p class="small">It was <b>retrograde</b> when you were born: its themes tend to turn inward and get revisited.</p>` : ""}</div>
    <p class="tiny faint">${fmtDeg(pl.lon)}${pl.speed !== undefined ? ` · moving ${Math.abs(pl.speed).toFixed(2)}° a day` : ""}</p>`);
}

// ---- Native American (Sun Bear's Medicine Wheel)
function native(S){
  const n = S.wheel, T = Native.TOTEMS;
  const name = i => T[i].animal + (T[i].alt ? ` <span class="faint">(${T[i].alt})</span>` : "");
  return `<div class="card">${Draw.medicineWheel(n.index)}<p class="tiny faint" style="text-align:center">Your moon of the wheel glows. Tap a totem below to read about it.</p></div>
    <div class="card hero-card"><div class="label">Your birth totem</div>
      <h2>${name(n.index)}</h2>
      <p class="dim small">${n.moon} · ${n.dates}</p>
      <p class="serif-p">${n.text}</p>
      ${n.cusp !== null ? `<div class="warn">You were born within a day of the ${T[n.cusp].animal}'s moon, so you may recognise yourself in both.</div>` : ""}
      <div class="grid3 facts">
        <div><span>Plant</span><b>${n.plant}</b></div><div><span>Mineral</span><b>${n.mineral}</b></div>
        <div><span>Colour</span><b><i class="sw" style="background:${n.colour[1]}"></i>${n.colour[0]}</b></div>
      </div></div>
    <div class="grid2">
      <div class="card" style="margin:0"><div class="label">Elemental clan</div><h3>${n.clan.name} <span class="faint small">${n.clan.element}</span></h3><p class="small dim">${n.clan.text}</p>
        <p class="tiny faint">Clan kin: ${n.kin.map(i=>T[i].animal).join(", ")}</p></div>
      <div class="card" style="margin:0"><div class="label">Spirit keeper</div><h3>${n.direction.name} <span class="faint small">${n.direction.keeper}</span></h3>
        <p class="small dim">The ${n.direction.season} direction, the gift of ${n.direction.gift}.</p></div>
    </div>
    <div class="card"><div class="label">Across the wheel</div>
      <p class="small">Opposite you sits the <b class="tap link" data-totem="${n.opposite}">${T[n.opposite].animal}</b>. Its strengths are the ones you grow into: ${T[n.opposite].text.split(". ")[0].toLowerCase()}.</p></div>
    <div class="card"><div class="label">All twelve moons</div><table class="list">
      ${[9,10,11,0,1,2,3,4,5,6,7,8].map(i => `<tr class="tap" data-totem="${i}"${i===n.index?' style="color:var(--gold)"':""}><td>${T[i].animal}</td><td class="small dim">${T[i].moon}</td><td class="r small">${T[i].dates}</td></tr>`).join("")}
    </table></div>
    <div class="card small dim">This is the Medicine Wheel astrology published by Sun Bear and Wabun Wind in 1980, the version most "Native American zodiac" sites use. It draws on Anishinaabe teachings, but it's a modern system, not a tradition of any one Nation, and many Native people see it that way. Your totem follows the Sun's position at birth, so it often agrees with your Western Sun sign.</div>`;
}
function totemSheet(i){
  const t = Native.totemOf(i*30 + 15);
  sheet(`<h2>${t.animal}${t.alt ? ` <span class="faint">(${t.alt})</span>` : ""}</h2><p class="dim">${t.moon} · ${t.dates}</p>
    <div class="card reading"><p>${t.text}</p></div>
    <p class="small">${t.clan.name} clan (${t.clan.element}) · ${t.direction.name}, ${t.direction.keeper} · ${t.plant} · ${t.mineral} · ${t.colour[0]}</p>`);
}

// ---- Chinese
function chinese(S){
  const c = S.chi, E = Chinese.ELEMENTS;
  const pil = (lab, p) => p ? `<div class="p"><div class="lab">${lab}</div><div class="han el-${p.stem.element}">${p.stem.han}</div><div class="han el-${p.branch.element}">${p.branch.han}</div>
      <div class="tiny">${p.stem.name} ${p.branch.name}</div><div class="tiny faint">${E[p.stem.element].name}</div></div>`
    : `<div class="p"><div class="lab">${lab}</div><div class="han faint">?</div><div class="han faint">?</div><div class="tiny faint">needs time</div></div>`;
  const tot = Object.values(c.count).reduce((a,b)=>a+b,0);
  const bars = Object.entries(c.count).map(([e,v]) => `<div class="ratings"><div class="r"><span class="el-${e}">${E[e].name}</span><div class="bar"><i style="width:${v/tot*100}%; background:var(--${e==="water"?"wateri":e})"></i></div><span class="small">${v}</span></div></div>`).join("");
  return `<div class="card"><div class="label">Your zodiac animal</div>
      <h2>${E[c.element].name} ${c.animal.name} <span class="faint">${c.animal.han}</span></h2>
      <p>${c.animal.text}</p><p class="small dim">${E[c.element].name} adds ${E[c.element].text}. ${c.yang ? "Yang" : "Yin"} year.</p>
      <p class="small">Best matches: <b>${c.friends.map(i=>Chinese.ANIMALS[i].name).join(" and ")}</b>. Clashes with: <b>${Chinese.ANIMALS[c.clash].name}</b>.</p>
      ${c.animalDiffersFromBaZi ? `<div class="warn">You were born between Lunar New Year and Lichun (or the other way round), so your Four Pillars year below differs from your popular zodiac animal. Both are normal.</div>` : ""}
      <p class="tiny faint">Lunar New Year ${S.profile.date.slice(0,4)}: ${dateFmt(c.lunarNewYear, {day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Shanghai"})}.</p></div>
    <div class="card"><div class="label">Four Pillars (Ba Zi)</div><div class="pillars">${pil("Hour",c.pillars.hour)}${pil("Day",c.pillars.day)}${pil("Month",c.pillars.month)}${pil("Year",c.pillars.year)}</div>
      <p class="small" style="margin-top:10px">Your <b>Day Master</b> is <b class="el-${c.dayMaster.element}">${c.dayMaster.name} ${E[c.dayMaster.element].name}</b> (${c.dayMaster.yang?"yang":"yin"}), the element that stands for you: ${E[c.dayMaster.element].text}.</p>
      <p class="tiny faint">Year and month follow the solar calendar (the year starts at Lichun, around 4 February). The hour uses clock time.</p></div>
    <div class="card"><div class="label">Element balance</div>${bars}
      <p class="small dim">Strongest: <b>${E[c.strongest].name}</b>.${c.missing.length ? ` Missing: <b>${c.missing.map(e=>E[e].name).join(", ")}</b>, which traditionally you'd balance with that element's colours, foods and activities.` : ""}</p></div>`;
}

// ---- Numerology
function numerology(S){
  const n = S.num, N = Numerology.NUMBERS;
  const box = (k, v, lab) => v ? `<div class="nb tap" data-num="${k}"><div class="v">${v}</div><div class="k">${lab}</div></div>` : "";
  const L = Numerology.letters(S.profile.birthName || S.profile.name);
  return `<div class="card"><div class="label">Life Path</div><h2>${n.lifePath} · ${N[n.lifePath].title}</h2><p>${N[n.lifePath].text}</p>
      <p class="tiny faint">From your full birth date. It's the most important number in numerology.</p></div>
    <div class="numbers">${box("expression",n.expression,"Expression")}${box("soul",n.soul,"Soul urge")}${box("personality",n.personality,"Personality")}
      ${box("birthday",n.birthday,"Birthday")}${box("maturity",n.maturity,"Maturity")}${box("currentName",n.currentName,"Current name")}</div>
    <div class="card"><div class="label">Cycles right now</div>
      <p>Personal Year <b>${n.personalYear}</b>: ${N[n.personalYear].title.replace(/ \(.*\)/,"")} energy for ${new Date().getFullYear()}.</p>
      <p class="small dim">Month ${n.personalMonth} · Day ${n.personalDay}: ${Numerology.CYCLE[n.personalDay].text}.</p></div>
    <div class="card"><div class="label">Your name in numbers</div>
      <div class="row wrap" style="gap:4px">${L.map(x=>`<span class="pill" style="${x.vowel?"color:var(--gold)":""}">${x.c} ${x.v}</span>`).join("")}</div>
      <p class="tiny faint" style="margin-top:8px">Gold letters are vowels (Soul Urge); the rest are consonants (Personality). Pythagorean system.</p></div>`;
}
function numberSheet(S, k){
  const v = S.num[k], N = Numerology.NUMBERS[v];
  const what = {expression:"your talents and how you go about life, from your full birth name", soul:"what you want deep down, from the vowels of your name",
    personality:"how others see you at first, from the consonants of your name", birthday:"a special gift, from the day of the month you were born",
    maturity:"who you grow into after about 40, from Life Path + Expression", currentName:"the energy of the name you use now"}[k];
  sheet(`<h2>${v} · ${N.title}</h2><p class="dim">This number shows ${what}.</p><div class="card reading"><p>${N.text}</p></div>`);
}

window.Systems = {render};
})();
