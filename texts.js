(() => {
// Everything Augur says, in one place. Readings are put together from these pieces, so every
// sentence is tied to something real in your chart or today's sky.

// The 12 traits shared by every system, used by the "where the systems agree" card
const TRAITS = {
  bold:       {name:"Bold",          text:"You act first and think on your feet."},
  grounded:   {name:"Grounded",      text:"You're steady, practical and hard to knock over."},
  curious:    {name:"Curious",       text:"You want to know how everything works, and to talk about it."},
  caring:     {name:"Caring",        text:"You look after people, and they feel safe around you."},
  proud:      {name:"Expressive",    text:"You shine when you can create and be seen."},
  precise:    {name:"Precise",       text:"You notice details others miss and like things done well."},
  harmonious: {name:"Harmonious",    text:"You look for balance, fairness and beauty."},
  intense:    {name:"Intense",       text:"You feel deeply and don't do anything halfway."},
  free:       {name:"Free-spirited", text:"You need room to roam, explore and change your mind."},
  ambitious:  {name:"Ambitious",     text:"You set long-term goals and climb towards them."},
  visionary:  {name:"Idealistic",    text:"You think about the future and the bigger picture."},
  intuitive:  {name:"Intuitive",     text:"You sense things before you can explain them."},
};
// each zodiac sign leans towards one trait, in sign order Aries → Pisces
const SIGN_TRAIT = ["bold","grounded","curious","caring","proud","precise","harmonious","intense","free","ambitious","visionary","intuitive"];
const ELEMENT_TRAITS = {fire:["bold","proud"], earth:["grounded","precise"], air:["curious","harmonious"], water:["intuitive","caring"]};

// The five tones of a day, shared by every system for the daily agreement card
const TONES = {
  push:    {name:"Go for it",    icon:"↗", text:"Energy is up. Start things, ask for things, move."},
  connect: {name:"Reach out",    icon:"⇄", text:"People matter most today. Talk, team up, make peace."},
  create:  {name:"Make something", icon:"✶", text:"Ideas flow. Express yourself and play."},
  steady:  {name:"Build",        icon:"▦", text:"Good for focus, work and practical decisions."},
  reflect: {name:"Slow down",    icon:"◌", text:"Rest, think and finish things rather than start them."},
};

const SIGN_TEXT = [
  {core:"Aries is the spark: brave, direct and impatient to begin.",
   sun:"You're a starter. You like to be first, you say what you think and you're happiest when there's a challenge.",
   moon:"Your feelings flare up fast and burn out fast. You need action to feel better, not long talks.",
   rising:"You come across as energetic, frank and a little bit fearless.",
   style:"boldly and fast"},
  {core:"Taurus is the garden: patient, sensual and loyal.",
   sun:"You build slowly and well. You love comfort, beauty and good food, and you don't like being rushed.",
   moon:"You feel safe with routine, touch and familiar things. Sudden change unsettles you.",
   rising:"You come across as calm, warm and reassuringly steady.",
   style:"slowly, sensually and with patience"},
  {core:"Gemini is the messenger: curious, witty and quick.",
   sun:"You collect ideas, people and conversations. You get bored easily and learn fast.",
   moon:"You work through feelings by talking or writing them out. A busy mind needs a good chat.",
   rising:"You come across as lively, chatty and younger than your age.",
   style:"with curiosity and lots of words"},
  {core:"Cancer is the home: protective, tender and tenacious.",
   sun:"You care deeply about your people and your roots. Under the shell, you're very soft.",
   moon:"Your moods follow the tides. You need a safe nest and people who really know you.",
   rising:"You come across as gentle, kind and a little guarded at first.",
   style:"protectively, through feeling"},
  {core:"Leo is the sun: warm, generous and proud.",
   sun:"You're made to shine, create and lead with your heart. You love loyally and loudly.",
   moon:"You need to feel appreciated. Praise and play are what restore you.",
   rising:"You come across as confident, warm and impossible to miss.",
   style:"warmly and with flair"},
  {core:"Virgo is the craftsman: careful, helpful and observant.",
   sun:"You make things better. You notice details, fix what's broken and like to be useful.",
   moon:"You calm down by putting things in order. Worry is your weak spot.",
   rising:"You come across as neat, modest and quietly sharp.",
   style:"carefully, with attention to detail"},
  {core:"Libra is the scales: fair, charming and diplomatic.",
   sun:"You look for balance, beauty and partnership, and you see every side of an argument.",
   moon:"You feel best when things are peaceful between you and the people around you.",
   rising:"You come across as graceful, friendly and easy to talk to.",
   style:"fairly, looking for balance and beauty"},
  {core:"Scorpio is the deep water: intense, loyal and perceptive.",
   sun:"You feel everything strongly and see through pretence. All or nothing is your way.",
   moon:"Your emotions run deep and private. Trust takes time, and then it's for life.",
   rising:"You come across as magnetic, reserved and hard to read.",
   style:"deeply, all or nothing"},
  {core:"Sagittarius is the archer: optimistic, adventurous and honest.",
   sun:"You aim far: travel, ideas, meaning. You need freedom and you say it like it is.",
   moon:"You cheer up by getting out, moving and having something to look forward to.",
   rising:"You come across as friendly, funny and always ready to go.",
   style:"with optimism and a love of freedom"},
  {core:"Capricorn is the mountain goat: patient, ambitious and dependable.",
   sun:"You play the long game. You take responsibility seriously and climb steadily to the top.",
   moon:"You keep feelings under control and feel safest when you've got a plan.",
   rising:"You come across as composed, capable and older than your years.",
   style:"seriously, with a long-term plan"},
  {core:"Aquarius is the water-bearer: original, independent and humane.",
   sun:"You think differently and care about people in general. You need space to be yourself.",
   moon:"You process feelings by stepping back and thinking about them. Friends are your family.",
   rising:"You come across as friendly, unusual and a little detached.",
   style:"independently, in your own original way"},
  {core:"Pisces is the ocean: imaginative, gentle and empathic.",
   sun:"You feel what others feel and live half in a dream. Art, music and kindness come easily.",
   moon:"You soak up the mood around you. Quiet, water and music bring you back.",
   rising:"You come across as soft, dreamy and kind.",
   style:"dreamily, with empathy and imagination"},
];

const PLANET_TEXT = {
  sun:     {means:"your core self and what makes you feel alive", verb:"You shine"},
  moon:    {means:"your feelings, needs and what makes you feel safe", verb:"You feel and recharge"},
  mercury: {means:"how you think, learn and talk", verb:"You think and talk"},
  venus:   {means:"how you love, what you value and enjoy", verb:"You love and enjoy"},
  mars:    {means:"your drive, courage and how you fight", verb:"You go after what you want"},
  jupiter: {means:"where you grow and find luck", verb:"You grow and find luck"},
  saturn:  {means:"your lessons, limits and long-term work", verb:"You learn discipline"},
  uranus:  {means:"where you rebel and break the mould (shared by your whole generation)", verb:"Your generation rebels"},
  neptune: {means:"your dreams and ideals (shared by your whole generation)", verb:"Your generation dreams"},
  pluto:   {means:"deep transformation (shared by your whole generation)", verb:"Your generation transforms things"},
  node:    {means:"the direction you're growing in this life", verb:"You grow by learning to live"},
  asc:     {means:"how you come across and meet the world", verb:"You come across"},
  mc:      {means:"your public life, career and reputation", verb:"You're known for working"},
};

const HOUSE_TEXT = [
  {name:"Self",          text:"your body, image and the way you begin things"},
  {name:"Money",         text:"money, possessions and what you value"},
  {name:"Communication", text:"conversations, siblings, short trips and learning"},
  {name:"Home",          text:"home, family and your roots"},
  {name:"Pleasure",      text:"romance, creativity, play and children"},
  {name:"Work & health", text:"daily work, routines and health"},
  {name:"Partners",      text:"partners, close relationships and contracts"},
  {name:"Depth",         text:"intimacy, shared money and change"},
  {name:"Horizons",      text:"travel, study, beliefs and big ideas"},
  {name:"Career",        text:"career, ambitions and reputation"},
  {name:"Friends",       text:"friends, groups and hopes for the future"},
  {name:"The hidden",    text:"rest, dreams, secrets and letting go"},
];

const ASPECT_TEXT = {
  conjunction:"merges with", sextile:"opens a door for", square:"pushes against", trine:"flows easily with", opposition:"pulls against",
};

window.Texts = {TRAITS, SIGN_TRAIT, ELEMENT_TRAITS, TONES, SIGN_TEXT, PLANET_TEXT, HOUSE_TEXT, ASPECT_TEXT};
})();
