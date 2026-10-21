(() => {
// Systems tab: Western, Native American, Chinese and Numerology in full detail.
const {SIGNS, PLANETS, signOf, fmtDeg, HOUSE_SYSTEMS} = Chart;
const {SIGN_TEXT, PLANET_TEXT, HOUSE_TEXT} = Texts;
const {$, esc, sheet, dateFmt} = UI;
const t = L.t;
let current = "western";

function render(S, which){
  if(which) current = which;
  const tabs = [["western","sysWestern"],["native","sysNative"],["chinese","sysChinese"],["numerology","sysNumerology"]];
  const body = {western, native, chinese, numerology}[current](S);
  $("#v-systems").innerHTML = `<div class="top"><div><div class="date">${t("fourWays")}</div><h1>${t("systemsTitle")}</h1></div></div>
    <div class="tabs">${tabs.map(([k,n])=>`<button data-k="${k}" class="${k===current?"on":""}">${t(n)}</button>`).join("")}</div>${body}`;
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
      <td class="r faint small">${k==="asc"||k==="mc" ? "" : t("houseN", {n:ch.houseOfPlanet[k]})}</td></tr>`).join("");
  const asp = ch.aspects.filter(a => a.orb < 6).slice(0,14).map(a => `<tr><td class="g">${a.aspect.glyph}</td><td>${PLANETS[a.a].name} · ${a.aspect.label} · ${PLANETS[a.b].name}</td><td class="r">${a.orb.toFixed(1)}°</td></tr>`).join("");
  const bal = ch.balance, tot = Object.values(bal.elements).reduce((a,b)=>a+b,0);
  const bars = Object.entries(bal.elements).map(([e,v]) => `<div class="ratings"><div class="r"><span>${t("elementsCap." + e)}</span><div class="bar"><i style="width:${v/tot*100}%; background:var(--${e})"></i></div><span class="small">${v}</span></div></div>`).join("");
  const sysName = ch.houses.system === "solar" ? t("solarHouses") : ch.houses.system === "porphyry-fallback" ? t("porphyryFallback") : HOUSE_SYSTEMS[ch.houses.system].name;
  return `<div class="card">${Draw.wheel(ch)}<p class="tiny faint" style="text-align:center">${t("tropical")} · ${sysName}${ch.timeKnown ? "" : " · " + t("noonNote")}</p></div>
    <div class="card"><div class="label">${t("planetsTitle")} <span>${t("tapMeaning")}</span></div><table class="list">${rows}</table></div>
    <div class="card"><div class="label">${t("elementsTitle")}</div>${bars}<p class="small dim">${t("balanceLine", {el:t("elements." + bal.element), mode:t("modes." + bal.mode)})}</p></div>
    <div class="card"><div class="label">${t("mainAspects")}</div>${asp ? `<table class="list">${asp}</table>` : `<p class="small dim">${t("noClose")}</p>`}</div>
    ${ch.timeKnown ? `<div class="card"><div class="label">${t("houseCusps")}</div><table class="list">${ch.houses.cusps.map((c,i)=>`<tr><td class="g">${i+1}</td><td>${HOUSE_TEXT[i].name}</td><td class="r">${fmtDeg(c)}</td></tr>`).join("")}</table></div>` : ""}`;
}
function planetSheet(S, k){
  const ch = S.chart, pl = ch.points[k], s = signOf(pl.lon), T = PLANET_TEXT[k];
  const h = k === "asc" || k === "mc" ? null : ch.houseOfPlanet[k];
  sheet(`<h2>${PLANETS[k].glyph} ${t("planetIn", {planet:PLANETS[k].name, sign:SIGNS[s].name})}</h2>
    <p class="dim">${t("planetShows", {planet:PLANETS[k].name, means:T.means})}</p>
    <div class="card reading"><p>${t("planetStyle", {verb:T.verb, style:SIGN_TEXT[s].style})}</p><p class="small dim">${SIGN_TEXT[s].core}</p>
    ${h && ch.timeKnown ? `<p class="small">${t("inHouse", {n:h, nth:L.ord(h), text:HOUSE_TEXT[h-1].text})}</p>` : ""}
    ${pl.retro ? `<p class="small">${t("retroBorn")}</p>` : ""}</div>
    <p class="tiny faint">${fmtDeg(pl.lon)}${pl.speed !== undefined ? ` · ${t("movingDay", {n:Math.abs(pl.speed).toFixed(2)})}` : ""}</p>`);
}

// ---- Native American (Sun Bear's Medicine Wheel)
function native(S){
  const n = S.wheel, T = Native.TOTEMS;
  const name = i => T[i].animal + (T[i].alt ? ` <span class="faint">(${T[i].alt})</span>` : "");
  return `<div class="card">${Draw.medicineWheel(n.index)}<p class="tiny faint" style="text-align:center">${t("wheelGlow")}</p></div>
    <div class="card"><div class="label">${t("birthTotem")}</div>
      <h2>${name(n.index)}</h2>
      <p class="dim small">${n.moon} · ${n.dates}</p>
      <p class="serif-p">${n.text}</p>
      ${n.cusp !== null ? `<div class="warn" style="margin-top:10px">${t("cuspNote", {animal:T[n.cusp].animal})}</div>` : ""}
      <div class="grid3 facts">
        <div><span>${t("plant")}</span><b>${n.plant}</b></div><div><span>${t("mineral")}</span><b>${n.mineral}</b></div>
        <div><span>${t("colour")}</span><b><i class="sw" style="background:${n.hex}"></i>${n.colour}</b></div>
      </div></div>
    <div class="grid2">
      <div class="card" style="margin:0"><div class="label">${t("clanTitle")}</div><h3>${n.clan.name} <span class="faint small">${n.clan.element}</span></h3><p class="small dim">${n.clan.text}</p>
        <p class="tiny faint">${t("clanKin", {list:L.list(n.kin.map(i=>T[i].animal))})}</p></div>
      <div class="card" style="margin:0"><div class="label">${t("keeperTitle")}</div><h3>${n.direction.name} <span class="faint small">${n.direction.keeper}</span></h3>
        <p class="small dim">${n.direction.text}</p></div>
    </div>
    <div class="card"><div class="label">${t("acrossTitle")}</div>
      <p class="small tap" data-totem="${n.opposite}">${t("acrossText", {animal:T[n.opposite].animal})}</p></div>
    <div class="card"><div class="label">${t("allMoons")}</div><table class="list">
      ${[9,10,11,0,1,2,3,4,5,6,7,8].map(i => `<tr class="tap" data-totem="${i}"${i===n.index?' style="color:var(--gold)"':""}><td>${T[i].animal}</td><td class="small dim">${T[i].moon}</td><td class="r small">${T[i].dates}</td></tr>`).join("")}
    </table></div>
    <div class="card small dim">${t("nativeNote")}</div>`;
}
function totemSheet(i){
  const tt = Native.totemOf(i*30 + 15);
  sheet(`<h2>${tt.animal}${tt.alt ? ` <span class="faint">(${tt.alt})</span>` : ""}</h2><p class="dim">${tt.moon} · ${tt.dates}</p>
    <div class="card reading"><p>${tt.text}</p></div>
    <p class="small">${t("clanOf", {clan:tt.clan.name, el:tt.clan.element})} · ${tt.direction.name}, ${tt.direction.keeper} · ${tt.plant} · ${tt.mineral} · ${tt.colour}</p>`);
}

// ---- Chinese
function chinese(S){
  const c = S.chi, E = Chinese.ELEMENTS;
  const pil = (lab, p) => p ? `<div class="p"><div class="lab">${t(lab)}</div><div class="han el-${p.stem.element}">${p.stem.han}</div><div class="han el-${p.branch.element}">${p.branch.han}</div>
      <div class="tiny">${p.stem.name} · ${p.branch.name}</div><div class="tiny faint">${E[p.stem.element].name}</div></div>`
    : `<div class="p"><div class="lab">${t(lab)}</div><div class="han faint">?</div><div class="han faint">?</div><div class="tiny faint">${t("needsTimeLow")}</div></div>`;
  const tot = Object.values(c.count).reduce((a,b)=>a+b,0);
  const bars = Object.entries(c.count).map(([e,v]) => `<div class="ratings"><div class="r"><span class="el-${e}">${E[e].name}</span><div class="bar"><i style="width:${v/tot*100}%; background:var(--${e==="water"?"wateri":e})"></i></div><span class="small">${v}</span></div></div>`).join("");
  return `<div class="card"><div class="label">${t("zodiacAnimal")}</div>
      <h2>${t("chAnimalEl", {el:E[c.element].name, animal:c.animal.name})} <span class="faint">${c.animal.han}</span></h2>
      <p>${c.animal.text}</p><p class="small dim">${t("elAdds", {el:E[c.element].name, text:E[c.element].text})} ${t(c.yang ? "yangYear" : "yinYear")}</p>
      <p class="small">${t("matches", {list:L.list(c.friends.map(i=>Chinese.ANIMALS[i].name)), c:Chinese.ANIMALS[c.clash].name})}</p>
      ${c.animalDiffersFromBaZi ? `<div class="warn">${t("baziDiffers")}</div>` : ""}
      <p class="tiny faint">${t("lny", {y:S.profile.date.slice(0,4), date:dateFmt(c.lunarNewYear, {day:"numeric", month:"long", year:"numeric", timeZone:"Asia/Shanghai"})})}</p></div>
    <div class="card"><div class="label">${t("fourPillars")}</div><div class="pillars">${pil("pHour",c.pillars.hour)}${pil("pDay",c.pillars.day)}${pil("pMonth",c.pillars.month)}${pil("pYear",c.pillars.year)}</div>
      <p class="small" style="margin-top:10px">${t("dayMasterText", {e:c.dayMaster.element, dm:`${c.dayMaster.name} ${E[c.dayMaster.element].name}`, yy:t(c.dayMaster.yang ? "yang" : "yin"), text:E[c.dayMaster.element].text})}</p>
      <p class="tiny faint">${t("pillarsNote")}</p></div>
    <div class="card"><div class="label">${t("elBalance")}</div>${bars}
      <p class="small dim">${t("strongest", {el:E[c.strongest].name})}${c.missing.length ? t("missing", {list:L.list(c.missing.map(e=>E[e].name))}) : ""}</p></div>`;
}

// ---- Numerology
function numerology(S){
  const n = S.num, N = Numerology.NUMBERS;
  const box = (k, v, lab) => v ? `<div class="nb tap" data-num="${k}"><div class="v">${v}</div><div class="k">${t(lab)}</div></div>` : "";
  const name = S.profile.birthName || S.profile.name;
  const letters = Numerology.letters(name);
  return `<div class="card"><div class="label">${t("lifePath")}</div><h2>${n.lifePath} · ${N[n.lifePath].title}</h2><p>${N[n.lifePath].text}</p>
      <p class="tiny faint">${t("lpNote")}</p></div>
    <div class="numbers">${box("expression",n.expression,"nExpression")}${box("soul",n.soul,"nSoul")}${box("personality",n.personality,"nPersonality")}
      ${box("birthday",n.birthday,"nBirthday")}${box("maturity",n.maturity,"nMaturity")}${box("currentName",n.currentName,"nCurrentName")}</div>
    ${Numerology.readable(name) ? "" : `<div class="warn">${t("latinNote")}</div>`}
    <div class="card"><div class="label">${t("cyclesNow")}</div>
      <p>${t("pyLine", {n:n.personalYear, title:N[n.personalYear].title, year:new Date().getFullYear()})}</p>
      <p class="small dim">${t("monthDay", {m:n.personalMonth, d:n.personalDay, text:Numerology.CYCLE[n.personalDay].text})}</p></div>
    ${letters.length ? `<div class="card"><div class="label">${t("nameNumbers")}</div>
      <div class="row wrap" style="gap:4px">${letters.map(x=>`<span class="pill" style="${x.vowel?"color:var(--gold)":""}">${x.c} ${x.v}</span>`).join("")}</div>
      <p class="tiny faint" style="margin-top:8px">${t("nameNote")}</p></div>` : ""}`;
}
function numberSheet(S, k){
  const v = S.num[k], N = Numerology.NUMBERS[v];
  sheet(`<h2>${v} · ${N.title}</h2><p class="dim">${t("numShows", {what:t("numWhat." + k)})}</p><div class="card reading"><p>${N.text}</p></div>`);
}

window.Systems = {render};
})();
