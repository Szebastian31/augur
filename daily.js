(() => {
// Today's reading, built from the real sky at noon today measured against your birth chart.
const {norm360} = Astro;
const {SIGNS, PLANETS, signOf, angDist, houseOf} = Chart;
const {HOUSE_TEXT, ASPECT_TEXT, TONES} = Texts;

const MOOD = ["impatient and brave","calm and comfort-seeking","chatty and restless","tender and homesick","warm and playful","busy and particular",
  "sociable and fair-minded","deep and private","upbeat and adventurous","serious and productive","friendly and a bit detached","dreamy and sensitive"];
const GIFT = {
  easy:{sun:"confidence comes easily around", moon:"your feelings are in tune with", mercury:"words come easily: a good day to talk about",
        venus:"there's warmth and a little luck in", mars:"you've got the energy to act on", jupiter:"a lucky break is possible around", saturn:"slow, solid progress is possible with"},
  hard:{sun:"egos may clash over", moon:"you may react strongly about", mercury:"watch for misunderstandings around",
        venus:"watch for overspending or small frictions in", mars:"tempers may run short about", jupiter:"don't overdo it with", saturn:"expect delays or extra work around"},
  blend:{sun:"the spotlight falls on", moon:"emotions gather around", mercury:"your mind keeps returning to", venus:"sweetness flows into",
        mars:"there's a burst of energy in", jupiter:"things expand in", saturn:"it's time to get serious about"},
};
const NATAL_NOUN = {sun:"who you are and what you want", moon:"your feelings and home life", mercury:"your plans and conversations",
  venus:"your relationships and money", mars:"your goals and energy", asc:"how you come across", mc:"your career and reputation"};
const ORB = {moon:4, sun:2.5, mercury:2.5, venus:2.5, mars:2.5, jupiter:1.5, saturn:1.5};
const COLOUR = {wood:["green","#5fb36b"], fire:["red","#e0605a"], earth:["yellow","#e2c15b"], metal:["white and gold","#e8e4d8"], water:["deep blue","#4a78d6"]};

function phaseName(e){
  const names = ["New Moon","Waxing crescent","First quarter","Waxing gibbous","Full Moon","Waning gibbous","Last quarter","Waning crescent"];
  return names[Math.floor(norm360(e + 22.5)/45)%8];
}

function transits(pos, natalPts){
  const out = [];
  for(const t of Object.keys(ORB)){
    for(const n of Object.keys(NATAL_NOUN)){
      if(!natalPts[n]) continue;
      const d = angDist(pos[t].lon, natalPts[n].lon);
      for(const a of Chart.ASPECTS){
        const orb = Math.abs(d - a.angle);
        if(orb <= ORB[t]){ out.push({t, n, aspect:a, orb, weight:(ORB[t]-orb)/ORB[t] * (t === "moon" ? 0.8 : 1)}); break; }
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
    colour:COLOUR[dp.stem.element],
  };
  d.consensus = Consensus.daily(d);
  d.ratings = ratings(d);
  d.reading = reading(d, chart);
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

function reading(d, chart){
  const p = [];
  const tone = TONES[d.consensus.tone];
  p.push(`<b>${tone.name}.</b> ${tone.text}`);
  const h = HOUSE_TEXT[d.moonHouse-1];
  p.push(`The Moon is in ${SIGNS[d.moonSign].name} today, so the mood is ${MOOD[d.moonSign]}. It's passing through your ${Consensus.ordinal(d.moonHouse)} house, which puts the focus on ${h.text}.`);
  const seen = new Set();
  for(const x of d.transits){
    if(seen.size >= 2) break;
    if(seen.has(x.t)) continue;
    seen.add(x.t);
    const g = GIFT[x.aspect.kind][x.t];
    p.push(`${PLANETS[x.t].name} ${ASPECT_TEXT[x.aspect.name]} your natal ${PLANETS[x.n].name}: ${g} ${NATAL_NOUN[x.n]}.`);
  }
  if(d.retro.includes("mercury")) p.push("Mercury is retrograde: double-check messages, plans and travel details, and give old projects a second look before starting new ones.");
  for(const g of d.ingress) p.push(`${PLANETS[g.k].name} moves into ${SIGNS[g.sign].name} today.`);
  return p;
}

window.Daily = {day, phaseName};
})();
