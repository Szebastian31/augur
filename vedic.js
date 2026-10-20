(() => {
// Vedic (Jyotish): the same sky measured against the stars instead of the seasons.
// Sidereal longitude = tropical longitude − ayanamsa (about 24° today, growing ~1° every 72 years).
const {norm360} = Astro;

// ayanamsa at J2000 in degrees; all grow at the precession rate (~50.29″ a year)
const AYANAMSAS = {lahiri:{name:"Lahiri (Chitrapaksha)", j2000:23.8530}, raman:{name:"Raman", j2000:22.4107}, kp:{name:"Krishnamurti (KP)", j2000:23.7620}};
function ayanamsa(date, kind="lahiri"){
  const T = Astro.centuriesTT(date);
  return (AYANAMSAS[kind]||AYANAMSAS.lahiri).j2000 + 1.396971*T + 0.0003086*T*T;
}

const RASHIS = ["Mesha","Vrishabha","Mithuna","Karka","Simha","Kanya","Tula","Vrishchika","Dhanu","Makara","Kumbha","Meena"];
const GRAHAS = {sun:"Surya", moon:"Chandra", mars:"Mangala", mercury:"Budha", jupiter:"Guru", venus:"Shukra", saturn:"Shani", rahu:"Rahu", ketu:"Ketu"};

// 27 lunar mansions of 13°20′, each with a ruling planet (which drives the dasha cycle)
const NAKSHATRAS = [
  {name:"Ashwini",           lord:"ketu",    deity:"the Ashvins, healer twins", symbol:"a horse's head",       key:"quick starts and healing",          traits:["bold","free"]},
  {name:"Bharani",           lord:"venus",   deity:"Yama",                      symbol:"the womb",             key:"carrying things through",           traits:["intense","proud"]},
  {name:"Krittika",          lord:"sun",     deity:"Agni, fire",                symbol:"a blade or flame",     key:"cutting to the truth",              traits:["bold","precise"]},
  {name:"Rohini",            lord:"moon",    deity:"Brahma, the creator",       symbol:"an ox cart",           key:"growth, beauty and comfort",        traits:["grounded","harmonious"]},
  {name:"Mrigashira",        lord:"mars",    deity:"Soma",                      symbol:"a deer's head",        key:"searching and curiosity",           traits:["curious","free"]},
  {name:"Ardra",             lord:"rahu",    deity:"Rudra, the storm",          symbol:"a teardrop",           key:"storms that clear the air",         traits:["intense","visionary"]},
  {name:"Punarvasu",         lord:"jupiter", deity:"Aditi, mother of gods",     symbol:"a quiver of arrows",   key:"returning and renewal",             traits:["caring","free"]},
  {name:"Pushya",            lord:"saturn",  deity:"Brihaspati, the teacher",   symbol:"a cow's udder",        key:"nourishing others",                 traits:["caring","grounded"]},
  {name:"Ashlesha",          lord:"mercury", deity:"the Nagas, serpents",       symbol:"a coiled serpent",     key:"insight and hidden strength",       traits:["intense","intuitive"]},
  {name:"Magha",             lord:"ketu",    deity:"the ancestors",             symbol:"a throne",             key:"legacy and dignity",                traits:["proud","ambitious"]},
  {name:"Purva Phalguni",    lord:"venus",   deity:"Bhaga, delight",            symbol:"the front of a bed",   key:"pleasure, rest and romance",        traits:["proud","harmonious"]},
  {name:"Uttara Phalguni",   lord:"sun",     deity:"Aryaman, friendship",       symbol:"the back of a bed",    key:"loyal partnership",                 traits:["caring","precise"]},
  {name:"Hasta",             lord:"moon",    deity:"Savitar, the sun's light",  symbol:"an open hand",         key:"skill with the hands",              traits:["precise","curious"]},
  {name:"Chitra",            lord:"mars",    deity:"Tvashtar, the craftsman",   symbol:"a bright jewel",       key:"making beautiful things",           traits:["proud","precise"]},
  {name:"Swati",             lord:"rahu",    deity:"Vayu, the wind",            symbol:"a sprout in the wind", key:"independence and flexibility",      traits:["free","harmonious"]},
  {name:"Vishakha",          lord:"jupiter", deity:"Indra and Agni",            symbol:"a triumphal arch",     key:"single-minded goals",               traits:["ambitious","intense"]},
  {name:"Anuradha",          lord:"saturn",  deity:"Mitra, friendship",         symbol:"a lotus",              key:"devotion and friendship",           traits:["caring","intense"]},
  {name:"Jyeshtha",          lord:"mercury", deity:"Indra, chief of gods",      symbol:"an earring",           key:"seniority and protection",          traits:["proud","intense"]},
  {name:"Mula",              lord:"ketu",    deity:"Nirriti",                   symbol:"a bunch of roots",     key:"getting to the root",               traits:["visionary","intense"]},
  {name:"Purva Ashadha",     lord:"venus",   deity:"Apas, the waters",          symbol:"a winnowing fan",      key:"unbeatable conviction",             traits:["bold","free"]},
  {name:"Uttara Ashadha",    lord:"sun",     deity:"the Vishvadevas",           symbol:"an elephant's tusk",   key:"lasting victories",                 traits:["ambitious","grounded"]},
  {name:"Shravana",          lord:"moon",    deity:"Vishnu",                    symbol:"an ear",               key:"listening and learning",            traits:["curious","intuitive"]},
  {name:"Dhanishta",         lord:"mars",    deity:"the Vasus",                 symbol:"a drum",               key:"rhythm, wealth and fame",           traits:["ambitious","harmonious"]},
  {name:"Shatabhisha",       lord:"rahu",    deity:"Varuna, the cosmic waters", symbol:"an empty circle",      key:"healing and secrets",               traits:["visionary","precise"]},
  {name:"Purva Bhadrapada",  lord:"jupiter", deity:"Aja Ekapada",               symbol:"a two-faced man",      key:"fierce idealism",                   traits:["intense","visionary"]},
  {name:"Uttara Bhadrapada", lord:"saturn",  deity:"Ahir Budhnya",              symbol:"twin funeral cots",    key:"depth and self-control",            traits:["intuitive","grounded"]},
  {name:"Revati",            lord:"mercury", deity:"Pushan, guide of travellers", symbol:"a fish",             key:"kindness and safe journeys",        traits:["intuitive","caring"]},
];
const NAK = 360/27;
function nakshatraOf(sidLon){
  const l = norm360(sidLon), i = Math.floor(l/NAK);
  return {index:i, ...NAKSHATRAS[i], pada: Math.floor((l - i*NAK)/(NAK/4)) + 1, fraction:(l - i*NAK)/NAK};
}

// Vimshottari dasha: a 120-year cycle of planetary periods, starting from the Moon's nakshatra lord
const DASHA = [["ketu",7],["venus",20],["sun",6],["moon",10],["mars",7],["rahu",18],["jupiter",16],["saturn",19],["mercury",17]];
const YEAR_MS = 365.25*86400000;
function dashas(birthUTC, moonSid){
  const nk = nakshatraOf(moonSid);
  let idx = DASHA.findIndex(d => d[0] === nk.lord);
  let t = birthUTC.getTime() - nk.fraction*DASHA[idx][1]*YEAR_MS;   // when the first period "began"
  const list = [];
  for(let n=0;n<10;n++){
    const [lord, yrs] = DASHA[(idx+n)%9];
    const start = t, end = t + yrs*YEAR_MS;
    const subs = [];
    let st = start;
    for(let k=0;k<9;k++){
      const [sl, sy] = DASHA[(idx+n+k)%9];
      const len = yrs*sy/120*YEAR_MS;
      subs.push({lord:sl, start:new Date(st), end:new Date(st+len)});
      st += len;
    }
    list.push({lord, years:yrs, start:new Date(start), end:new Date(end), subs});
    t = end;
  }
  const now = Date.now();
  const current = list.find(d => d.start.getTime() <= now && now < d.end.getTime());
  const currentSub = current ? current.subs.find(s => s.start.getTime() <= now && now < s.end.getTime()) : null;
  return {list, current, currentSub};
}

// Tithi: the lunar day (1–30), every 12° the Moon gains on the Sun
const TITHIS = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami","Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi","Trayodashi","Chaturdashi"];
function tithi(date){
  const e = Astro.moonPhase(date).elong, n = Math.floor(e/12) + 1;   // 1..30
  const paksha = n <= 15 ? "Shukla (waxing)" : "Krishna (waning)";
  const k = (n-1)%15;
  const name = k === 14 ? (n === 15 ? "Purnima (full moon)" : "Amavasya (new moon)") : TITHIS[k];
  return {n, name, paksha};
}

// Build the Vedic chart from the tropical natal chart
function vedic(chart, settings){
  const ay = ayanamsa(chart.utc, settings.ayanamsa);
  const sid = {};
  for(const k of ["sun","moon","mars","mercury","jupiter","venus","saturn"]) sid[k] = {lon:norm360(chart.pos[k].lon - ay), retro:chart.pos[k].retro};
  sid.rahu = {lon:norm360(chart.pos.node.lon - ay), retro:true};
  sid.ketu = {lon:norm360(chart.pos.node.lon + 180 - ay), retro:true};
  const out = {ayanamsa:ay, points:sid};
  if(chart.timeKnown){
    out.lagna = norm360(chart.angles.asc - ay);
    const ls = Chart.signOf(out.lagna);
    out.bhava = {};  // whole-sign houses from the Lagna, the Vedic default
    for(const k of Object.keys(sid)) out.bhava[k] = (Chart.signOf(sid[k].lon) - ls + 12)%12 + 1;
  }
  out.moonNakshatra = nakshatraOf(sid.moon.lon);
  out.sunNakshatra = nakshatraOf(sid.sun.lon);
  if(out.lagna !== undefined) out.lagnaNakshatra = nakshatraOf(out.lagna);
  out.dasha = dashas(chart.utc, sid.moon.lon);
  out.tithi = tithi(chart.utc);
  return out;
}

window.Vedic = {AYANAMSAS, RASHIS, GRAHAS, NAKSHATRAS, ayanamsa, nakshatraOf, dashas, tithi, vedic};
})();
