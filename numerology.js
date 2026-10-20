(() => {
// Numerology (Pythagorean): numbers from your birth date and the full name you were given at birth.
const VAL = {}; "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c,i)=> VAL[c] = i%9 + 1);
const MASTERS = [11,22,33];
const VOWELS = new Set(["A","E","I","O","U"]);

const NUMBERS = {
  1: {title:"The Leader",       traits:["bold","ambitious"],      text:"Independent and driven. You'd rather start something new than follow someone else's plan."},
  2: {title:"The Peacemaker",   traits:["harmonious","caring"],   text:"Gentle, patient and tuned in to other people. You're at your best in a partnership."},
  3: {title:"The Communicator", traits:["curious","proud"],       text:"Expressive and sociable. Words, humour and creativity come naturally to you."},
  4: {title:"The Builder",      traits:["grounded","precise"],    text:"Practical, loyal and hard-working. You make things that last and keep your promises."},
  5: {title:"The Adventurer",   traits:["free","curious"],        text:"Restless and adaptable. You learn by doing, and you need variety and freedom."},
  6: {title:"The Nurturer",     traits:["caring","harmonious"],   text:"Responsible and warm. People lean on you, and home and family matter deeply."},
  7: {title:"The Seeker",       traits:["intuitive","precise"],   text:"Thoughtful and analytical. You need time alone to think and you look beneath the surface."},
  8: {title:"The Powerhouse",   traits:["ambitious","intense"],   text:"Determined and capable with money, power and big projects. You aim high."},
  9: {title:"The Humanitarian", traits:["visionary","caring"],    text:"Generous, idealistic and wise beyond your years. You care about the bigger picture."},
  11:{title:"The Intuitive (master number)",     traits:["intuitive","visionary"], text:"A heightened 2: sensitive, inspiring and strongly intuitive, sometimes to the point of nerves."},
  22:{title:"The Master Builder (master number)",traits:["ambitious","grounded"],   text:"A heightened 4: able to turn big dreams into real, practical things."},
  33:{title:"The Master Teacher (master number)",traits:["caring","visionary"],    text:"A heightened 6: deeply compassionate, here to help and to teach by example."},
};
// what a Personal Day / Month / Year number is good for
const CYCLE = {
  1:{tone:"push",    text:"a day for beginnings: start the thing you've been putting off"},
  2:{tone:"connect", text:"a day for patience and teamwork: listen more than you speak"},
  3:{tone:"create",  text:"a day for expression: write, talk, make something, have fun"},
  4:{tone:"steady",  text:"a day for work and order: tidy up, plan, build"},
  5:{tone:"push",    text:"a day for change: try something new, expect the unexpected"},
  6:{tone:"connect", text:"a day for home and people you love: help, fix, care"},
  7:{tone:"reflect", text:"a day for rest and thought: study, think, take time alone"},
  8:{tone:"steady",  text:"a day for ambition and money matters: decide, negotiate, lead"},
  9:{tone:"reflect", text:"a day for endings: finish, forgive, clear space for what's next"},
};

const digits = n => String(n).split("").reduce((a,b)=>a + +b, 0);
function reduce(n, keepMaster=true){
  while(n > 9 && !(keepMaster && MASTERS.includes(n))) n = digits(n);
  return n;
}
function clean(name){
  return (name||"").replace(/ł/g,"l").replace(/Ł/g,"L").replace(/ß/g,"ss").replace(/[æÆ]/g,"ae").replace(/[øØ]/g,"o").replace(/[đĐ]/g,"d")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z]/g," ");
}
// Y counts as a vowel when it has no vowel next to it (as in "Lynn"), otherwise as a consonant
function letters(name){
  const s = clean(name), out = [];
  for(let i=0;i<s.length;i++){
    const c = s[i]; if(c === " ") continue;
    let vowel = VOWELS.has(c);
    if(c === "Y") vowel = !VOWELS.has(s[i-1]||"") && !VOWELS.has(s[i+1]||"");
    out.push({c, v:VAL[c], vowel});
  }
  return out;
}
const sumOf = arr => arr.reduce((a,x)=>a + x.v, 0);

function numerology(profile, today=new Date()){
  const [y,m,d] = profile.date.split("-").map(Number);
  const lifePath = reduce(reduce(m) + reduce(d) + reduce(digits(y)));
  const L = letters(profile.birthName || profile.name);
  const expression = L.length ? reduce(sumOf(L)) : null;
  const soul = L.length ? reduce(sumOf(L.filter(x=>x.vowel))) : null;
  const personality = L.length ? reduce(sumOf(L.filter(x=>!x.vowel))) : null;
  const birthday = reduce(d);
  const maturity = expression ? reduce(reduce(lifePath + expression)) : null;
  const cur = profile.name && profile.birthName && clean(profile.name) !== clean(profile.birthName) ? reduce(sumOf(letters(profile.name))) : null;
  return {lifePath, expression, soul, personality, birthday, maturity, currentName:cur, ...personal(profile, today)};
}
// the cycles that change: personal year (from 1 January), month and day
function personal(profile, date){
  const [, m, d] = profile.date.split("-").map(Number);
  const year = reduce(reduce(m) + reduce(d) + reduce(digits(date.getFullYear())), false);
  const month = reduce(year + date.getMonth() + 1, false);
  const day = reduce(month + date.getDate(), false);
  return {personalYear:year, personalMonth:month, personalDay:day};
}

window.Numerology = {NUMBERS, CYCLE, reduce, letters, numerology, personal};
})();
