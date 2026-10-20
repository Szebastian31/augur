(() => {
// "Where the systems agree": like Consensus Weather averaging forecast models, each system votes
// for traits (about you) or a tone (about today), and Augur shows where they line up.
const {TRAITS, SIGN_TRAIT, ELEMENT_TRAITS} = Texts;
const signName = i => Chart.SIGNS[i].name;

function system(name){
  const s = {name, score:{}, why:{}};
  s.add = (trait, w, reason) => {
    s.score[trait] = (s.score[trait]||0) + w;
    (s.why[trait] = s.why[trait] || []).push(reason);
  };
  return s;
}
// the top 3 traits of a system (ties at third place included)
function top(s){
  const list = Object.entries(s.score).sort((a,b)=>b[1]-a[1]);
  if(!list.length) return [];
  const cut = list[Math.min(2, list.length-1)][1];
  return list.filter(x => x[1] >= cut).map(x => x[0]);
}

function natal(profile, chart, ved, chi, num){
  const W = system("Western"), V = system("Vedic"), C = system("Chinese"), N = system("Numerology");
  const sg = k => Chart.signOf(chart.points[k].lon);

  W.add(SIGN_TRAIT[sg("sun")], 3, `Sun in ${signName(sg("sun"))}`);
  if(chart.moonOptions) chart.moonOptions.forEach(s => W.add(SIGN_TRAIT[s], 1, `Moon in ${signName(s)} (maybe)`));
  else W.add(SIGN_TRAIT[sg("moon")], 2, `Moon in ${signName(sg("moon"))}`);
  if(chart.timeKnown) W.add(SIGN_TRAIT[sg("asc")], 2, `${signName(sg("asc"))} rising`);
  for(const k of ["mercury","venus","mars"]) W.add(SIGN_TRAIT[sg(k)], 0.5, `${Chart.PLANETS[k].name} in ${signName(sg(k))}`);
  for(const t of ELEMENT_TRAITS[chart.balance.element]) W.add(t, 1, `mostly ${chart.balance.element} signs`);

  const vs = k => Chart.signOf(ved.points[k].lon);
  V.add(SIGN_TRAIT[vs("moon")], 2, `Moon in ${Vedic.RASHIS[vs("moon")]}`);
  V.add(SIGN_TRAIT[vs("sun")], 1, `Sun in ${Vedic.RASHIS[vs("sun")]}`);
  if(ved.lagna !== undefined) V.add(SIGN_TRAIT[Chart.signOf(ved.lagna)], 2, `${Vedic.RASHIS[Chart.signOf(ved.lagna)]} Lagna`);
  for(const t of ved.moonNakshatra.traits) V.add(t, 1.5, `Moon in ${ved.moonNakshatra.name}`);

  for(const t of chi.animal.traits) C.add(t, 2, `${Chinese.ELEMENTS[chi.element].name} ${chi.animal.name} year`);
  for(const t of Chinese.ELEMENTS[chi.dayMaster.element].traits) C.add(t, 1.5, `${chi.dayMaster.name} ${Chinese.ELEMENTS[chi.dayMaster.element].name} Day Master`);
  for(const t of Chinese.ELEMENTS[chi.strongest].traits) C.add(t, 1, `strong ${chi.strongest} in your pillars`);

  const NUM = Numerology.NUMBERS;
  for(const t of NUM[num.lifePath].traits) N.add(t, 2, `Life Path ${num.lifePath}`);
  if(num.expression) for(const t of NUM[num.expression].traits) N.add(t, 1.5, `Expression ${num.expression}`);
  if(num.soul) for(const t of NUM[num.soul].traits) N.add(t, 1, `Soul Urge ${num.soul}`);
  for(const t of NUM[Numerology.reduce(num.birthday,false)].traits) N.add(t, 0.5, `born on the ${ordinal(+profile.date.slice(8,10))}`);

  const systems = [W,V,C,N];
  const tops = systems.map(top);
  const votes = Object.keys(TRAITS).map(trait => {
    const who = systems.filter((s,i) => tops[i].includes(trait));
    const strength = systems.reduce((a,s) => a + (s.score[trait]||0)/Math.max(...Object.values(s.score)), 0);
    return {trait, count:who.length, systems:who.map(s=>s.name), why:who.map(s => `${s.name}: ${s.why[trait].join(", ")}`), strength};
  }).sort((a,b) => b.count - a.count || b.strength - a.strength);

  // a trait one system puts first that most others don't see at all
  let disagreement = null;
  systems.forEach((s, i) => {
    if(disagreement) return;
    const first = Object.entries(s.score).sort((a,b)=>b[1]-a[1])[0][0];
    const absent = systems.filter(o => o !== s && !o.score[first]);
    if(absent.length >= 2) disagreement = {trait:first, system:s.name, why:s.why[first].join(", "), absent:absent.map(o=>o.name)};
  });

  return {votes, agreed:votes.filter(v=>v.count >= 2).slice(0,5), disagreement, systems:systems.map((s,i)=>({name:s.name, top:tops[i]}))};
}

// ---- Today's tone
const HOUSE_TONE = [null,"push","steady","connect","reflect","create","steady","connect","reflect","push","steady","connect","reflect"];
// classical tithi groups: Nanda (joy), Bhadra (good works), Jaya (victory), Rikta (empty), Purna (full)
const TITHI_TONE = ["create","steady","push","reflect","connect"];
const TITHI_GROUP = ["Nanda (joyful)","Bhadra (good for steady work)","Jaya (victorious)","Rikta (empty)","Purna (full)"];
const RELATION_TONE = {companion:"connect", support:"reflect", expression:"create", opportunity:"push", pressure:"steady"};
const RELATION_TEXT = {
  companion:"a day of your own element: good for allies and peers",
  support:"today's element feeds yours: accept help, rest and learn",
  expression:"your element feeds today's: a day to express and produce",
  opportunity:"your element masters today's: a day to grab chances",
  pressure:"today's element tests yours: keep discipline and don't force things",
};

function daily(day){
  const votes = [];
  votes.push({system:"Western", tone:HOUSE_TONE[day.moonHouse],
    why:`Moon in ${signName(day.moonSign)}, passing through your ${ordinal(day.moonHouse)} house (${Texts.HOUSE_TEXT[day.moonHouse-1].name.toLowerCase()})`});
  const g = (day.tithi.n - 1) % 5;
  votes.push({system:"Vedic", tone:TITHI_TONE[g], why:`${day.tithi.name}, a ${TITHI_GROUP[g]} tithi; Moon in ${day.nakshatra.name}`});
  votes.push({system:"Chinese", tone:RELATION_TONE[day.relation],
    why:`${day.dayPillar.stem.name} ${day.dayPillar.branch.name} day: ${RELATION_TEXT[day.relation]}${day.clash ? `. It clashes with your ${day.myAnimal} year, so go gently` : ""}`});
  votes.push({system:"Numerology", tone:Numerology.CYCLE[day.personalDay].tone, why:`Personal Day ${day.personalDay}: ${Numerology.CYCLE[day.personalDay].text}`});
  const count = {};
  votes.forEach(v => count[v.tone] = (count[v.tone]||0) + 1);
  const ranked = Object.entries(count).sort((a,b)=>b[1]-a[1]);
  const [tone, n] = ranked[0];
  const tie = ranked.length > 1 && ranked[1][1] === n ? ranked[1][0] : null;
  return {votes, tone, count:n, tie};
}

function ordinal(n){ return n + (["th","st","nd","rd"][(n%100-20)%10] || ["th","st","nd","rd"][n%100] || "th"); }

window.Consensus = {natal, daily, ordinal, RELATION_TEXT};
})();
