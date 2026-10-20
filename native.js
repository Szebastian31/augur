(() => {
// Native American astrology: the Medicine Wheel published by Sun Bear and Wabun Wind (1980),
// the version most "Native American zodiac" sites use. Your birth totem comes from the Sun's
// position at birth (each "moon" of the wheel starts at a solstice, equinox or the points between),
// so it's exact even if you were born on a cusp.
//
// Index = tropical sign (0 = Aries). Popular sites sometimes swap a few animals; `alt` keeps those names.
const TOTEMS = [
  {animal:"Red Hawk",    alt:"Falcon",     icon:"🦅", moon:"Budding Trees Moon", dates:"21 Mar – 19 Apr", plant:"Dandelion",    mineral:"Fire opal",    colour:["Yellow","#f2c14e"],
   traits:["bold","ambitious"],   text:"A born pioneer. You see the goal from high up and dive straight for it. Quick, fearless and impatient with slowness, you lead by going first."},
  {animal:"Beaver",      alt:null,         icon:"🦫", moon:"Frogs Return Moon",  dates:"20 Apr – 20 May", plant:"Blue camas",   mineral:"Chrysocolla",  colour:["Blue","#5b8fd6"],
   traits:["grounded","precise"], text:"A builder. Patient, practical and hard-working, you make a safe and comfortable home and finish what you start."},
  {animal:"Deer",        alt:null,         icon:"🦌", moon:"Cornplanting Moon",  dates:"21 May – 20 Jun", plant:"Yarrow",       mineral:"Moss agate",   colour:["White and green","#9fd3a5"],
   traits:["curious","harmonious"], text:"Gentle, quick and sociable. You sense danger and opportunity early, love good conversation and move gracefully between people."},
  {animal:"Flicker",     alt:"Woodpecker", icon:"🐦", moon:"Strong Sun Moon",    dates:"21 Jun – 22 Jul", plant:"Wild rose",    mineral:"Carnelian",    colour:["Pink","#ec8fa8"],
   traits:["caring","intuitive"], text:"A protector of home and family. Warm, devoted and sensitive, you drum up energy for the people you love."},
  {animal:"Sturgeon",    alt:"Salmon",     icon:"🐟", moon:"Ripe Berries Moon",  dates:"23 Jul – 22 Aug", plant:"Raspberry",    mineral:"Garnet",       colour:["Red","#d9534f"],
   traits:["proud","bold"],       text:"Strong, generous and determined, swimming against the current to get where you're going. You inspire others with your confidence."},
  {animal:"Brown Bear",  alt:"Bear",       icon:"🐻", moon:"Harvest Moon",       dates:"23 Aug – 22 Sep", plant:"Violet",       mineral:"Amethyst",     colour:["Purple","#8e6cc4"],
   traits:["precise","grounded"], text:"Steady, careful and quietly wise. You gather what's needed, look after others' wellbeing and think before you act."},
  {animal:"Raven",       alt:null,         icon:"🐦‍⬛", moon:"Ducks Fly Moon",     dates:"23 Sep – 23 Oct", plant:"Mullein",      mineral:"Jasper",       colour:["Brown","#a0714f"],
   traits:["harmonious","curious"], text:"Clever, charming and a natural go-between. You love company and fairness, and you can talk anyone round."},
  {animal:"Snake",       alt:null,         icon:"🐍", moon:"Freeze Up Moon",     dates:"24 Oct – 21 Nov", plant:"Thistle",      mineral:"Copper",       colour:["Orange","#e88a3c"],
   traits:["intense","intuitive"], text:"Deep, private and transformative. Like the snake shedding its skin, you renew yourself, and you read people very well."},
  {animal:"Elk",         alt:"Owl",        icon:"🫎", moon:"Long Snows Moon",    dates:"22 Nov – 21 Dec", plant:"Black spruce", mineral:"Obsidian",     colour:["Black","#4a4a5a"],
   traits:["free","visionary"],   text:"Free-roaming and big-hearted. You need space, love adventure and keep your eyes on the far horizon."},
  {animal:"Snow Goose",  alt:"Goose",      icon:"🪿", moon:"Earth Renewal Moon", dates:"22 Dec – 19 Jan", plant:"Birch",        mineral:"Quartz",       colour:["White","#e8ecf2"],
   traits:["ambitious","grounded"], text:"Tireless and determined. You fly long distances in formation and you don't give up until you've reached your goal."},
  {animal:"Otter",       alt:null,         icon:"🦦", moon:"Rest and Cleansing Moon", dates:"20 Jan – 18 Feb", plant:"Quaking aspen", mineral:"Silver", colour:["Silver","#c4cad4"],
   traits:["visionary","free"],   text:"Playful, original and friendly. You see things from unusual angles and bring fresh ideas to any group."},
  {animal:"Cougar",      alt:"Wolf",       icon:"🐺", moon:"Big Winds Moon",     dates:"19 Feb – 20 Mar", plant:"Plantain",     mineral:"Turquoise",    colour:["Blue-green","#3fb5a8"],
   traits:["intuitive","caring"], text:"Sensitive, intuitive and loyal. You feel what others feel and you'll fiercely protect the people in your pack."},
];

// four elemental clans (one per element, three totems each)
const CLANS = {
  fire: {name:"Thunderbird", element:"Fire",  icon:"⚡", traits:["bold"],      text:"Energy, passion and quick action. Thunderbird people spark things into life."},
  earth:{name:"Turtle",      element:"Earth", icon:"🐢", traits:["grounded"],  text:"Stability, patience and endurance. Turtle people carry their home with them and stay steady."},
  air:  {name:"Butterfly",   element:"Air",   icon:"🦋", traits:["curious"],   text:"Change, ideas and communication. Butterfly people transform and help others transform."},
  water:{name:"Frog",        element:"Water", icon:"🐸", traits:["intuitive"], text:"Feeling, flow and healing. Frog people cleanse and renew, and go deep."},
};
// four spirit keepers of the directions; each rules three moons
const DIRECTIONS = [
  {name:"East",  keeper:"Wabun",       season:"spring", gift:"illumination and new beginnings", traits:["bold"]},
  {name:"South", keeper:"Shawnodese",  season:"summer", gift:"growth, trust and warmth",        traits:["caring"]},
  {name:"West",  keeper:"Mudjekeewis", season:"autumn", gift:"introspection and inner strength", traits:["intense"]},
  {name:"North", keeper:"Waboose",     season:"winter", gift:"wisdom and renewal",              traits:["precise"]},
];
// sign index -> direction (Aries–Gemini East, Cancer–Virgo South, Libra–Sagittarius West, Capricorn–Pisces North)
const dirOf = i => DIRECTIONS[Math.floor(i/3)];
const clanOf = i => CLANS[Chart.SIGNS[i].element];

function totemOf(sunLon){
  const i = Chart.signOf(sunLon);
  return {index:i, ...TOTEMS[i], clan:clanOf(i), direction:dirOf(i)};
}

function native(chart){
  const t = totemOf(chart.points.sun.lon);
  const within = Astro.norm360(chart.points.sun.lon) % 30;
  const cusp = within < 1 ? (t.index + 11) % 12 : within > 29 ? (t.index + 1) % 12 : null;
  // totems that share your clan, and the one opposite you on the wheel
  const kin = [0,1,2,3,4,5,6,7,8,9,10,11].filter(i => i !== t.index && Chart.SIGNS[i].element === Chart.SIGNS[t.index].element);
  return {...t, cusp, kin, opposite:(t.index + 6) % 12};
}

window.Native = {TOTEMS, CLANS, DIRECTIONS, totemOf, native};
})();
