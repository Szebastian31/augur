(() => {
// Today's reading, built from the real sky at noon today measured against your birth chart.
// The sentences come from the current language (i18n/xx.js); the astrology decides which ones.
const {norm360} = Astro;
const {SIGNS, PLANETS, signOf, angDist, houseOf} = Chart;
const {HOUSE_TEXT, TONES} = Texts;
const t = L.t;

const NATAL = ["sun","moon","mercury","venus","mars","asc","mc"];          // natal points transits are read against
const ORB = {moon:4, sun:2.5, mercury:2.5, venus:2.5, mars:2.5, jupiter:1.5, saturn:1.5};
const COLOUR = {wood:"#5fb36b", fire:"#e0605a", earth:"#e2c15b", metal:"#e8e4d8", water:"#4a78d6"};

const phaseName = e => t("phases")[Math.floor(norm360(e + 22.5)/45)%8];

function transits(pos, natalPts){
  const out = [];
  for(const tp of Object.keys(ORB)){
    for(const n of NATAL){
      if(!natalPts[n]) continue;
      const d = angDist(pos[tp].lon, natalPts[n].lon);
      for(const a of Chart.ASPECTS){
        const orb = Math.abs(d - a.angle);
        if(orb <= ORB[tp]){ out.push({t:tp, n, aspect:a, orb, weight:(ORB[tp]-orb)/ORB[tp] * (tp === "moon" ? 0.8 : 1)}); break; }
      }
    }
  }
  return out.sort((a,b)=>b.weight - a.weight);
}

function day(profile, chart, chi, now=new Date()){
  const noon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0);
  const pos = Astro.positions(noon);
  const before = Astro.positions(new Date(noon.getTime()-12*3600000)), after = Astro.positions(new Date(noon.getTime()+12*3600000));
  const dp = Chinese.dayPillar(now.getFullYear(), now.getMonth()+1, now.getDate());
  const per = Numerology.personal(profile, now);
  const phase = Astro.moonPhase(noon);
  const d = {
    date:noon, pos, phase, phaseName:phaseName(phase.elong),
    moonSign:signOf(pos.moon.lon), sunSign:signOf(pos.sun.lon),
    moonHouse:houseOf(pos.moon.lon, chart.houses.cusps),
    wheelMoon:Native.totemOf(pos.sun.lon),
    dayPillar:dp, relation:Chinese.relation(chi.dayMaster.element, dp.stem.element),
    clash: dp.branchIndex === chi.clash, myAnimal:chi.animal.name,
    personalDay:per.personalDay, personalMonth:per.personalMonth, personalYear:per.personalYear,
    transits:transits(pos, chart.points),
    retro:["mercury","venus","mars","jupiter","saturn"].filter(k => pos[k].retro),
    ingress:Astro.BODIES.filter(k => k !== "node" && k !== "moon" && signOf(before[k].lon) !== signOf(after[k].lon)).map(k => ({k, sign:signOf(after[k].lon)})),
    colourHex:COLOUR[dp.stem.element], colourName:t("luckColours." + dp.stem.element),
  };
  d.consensus = Consensus.daily(d);
  d.ratings = ratings(d);
  d.reading = reading(d);
  d.lucky = Numerology.reduce(d.personalDay + now.getDate() + (d.moonHouse||1), false);
  return d;
}

function ratings(d){
  const r = {love:3, work:3, energy:3, mood:3};
  const add = (k, v) => r[k] += v;
  for(const x of d.transits.slice(0,6)){
    const s = (x.aspect.kind === "easy" ? 1 : x.aspect.kind === "hard" ? -1 : 0.5) * x.weight;
    if(x.t === "venus" || x.n === "venus") add("love", s*1.5);
    if(x.t === "moon") add("mood", s*1.5);
    if(x.t === "mars" || x.t === "sun") add("energy", s*1.5);
    if(x.t === "saturn" || x.t === "jupiter" || x.n === "mc" || x.t === "mercury") add("work", s*1.5);
  }
  if([5,7].includes(d.moonHouse)) add("love", 1);
  if([6,10].includes(d.moonHouse)) add("work", 1);
  if([1,5,9].includes(d.moonHouse) || SIGNS[d.moonSign].element === "fire") add("energy", 0.7);
  if([12,8,4].includes(d.moonHouse)) add("energy", -0.5);
  if(d.phase.elong > 160 && d.phase.elong < 200) add("mood", -0.3);   // full moon: big feelings
  if(d.clash) add("mood", -0.7);
  if(d.relation === "support") add("mood", 0.5);
  if(d.relation === "opportunity") add("work", 0.5);
  for(const k in r) r[k] = Math.max(1, Math.min(5, Math.round(r[k])));
  return r;
}

function reading(d){
  const p = [];
  const tone = TONES[d.consensus.tone];
  p.push(`<b>${tone.name}.</b> ${tone.text}`);
  p.push(t("readMoon", {sign:SIGNS[d.moonSign].name, mood:t("moods")[d.moonSign], n:d.moonHouse, nth:L.ord(d.moonHouse), focus:HOUSE_TEXT[d.moonHouse-1].text}));
  const seen = new Set();
  for(const x of d.transits){
    if(seen.size >= 2) break;
    if(seen.has(x.t)) continue;
    seen.add(x.t);
    p.push(t("readTransit", {t:PLANETS[x.t].name, verb:x.aspect.verb, aspect:x.aspect.label, n:PLANETS[x.n].name,
      gift:t(`gift.${x.aspect.kind}.${x.t}`), noun:t("natalNoun." + x.n)}));
  }
  if(d.retro.includes("mercury")) p.push(t("readMercury"));
  for(const g of d.ingress) p.push(t("readIngress", {p:PLANETS[g.k].name, sign:SIGNS[g.sign].name}));
  return p;
}

window.Daily = {day, phaseName};
})();
