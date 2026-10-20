(() => {
// Screens: Today and Me, plus shared helpers (sheet, toast, share, starfield).
const {SIGNS, PLANETS, signOf, fmtDeg} = Chart;
const {TRAITS, TONES, SIGN_TEXT, PLANET_TEXT} = Texts;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sg = i => SIGNS[i];
const dateFmt = (d, o={day:"numeric", month:"long", year:"numeric"}) => d.toLocaleDateString(undefined, o);

// ---- helpers
function sheet(html){ $("#sheet-body").innerHTML = html; $("#sheet").classList.add("on"); $("#sheet .panel").scrollTop = 0; }
function closeSheet(){ const on = $("#sheet").classList.contains("on"); $("#sheet").classList.remove("on"); return on; }
let toastT;
function toast(msg){ const t = $("#toast"); t.textContent = msg; t.style.display = "block"; clearTimeout(toastT); toastT = setTimeout(()=>t.style.display="none", 2200); }
function buzz(p="12"){ try{ window.AugurNative ? AugurNative.vibrate(p) : navigator.vibrate && navigator.vibrate(p.split(",").map(Number)); }catch(e){} }
async function share(text){
  if(window.AugurNative) return AugurNative.share(text);
  if(navigator.share){ try{ await navigator.share({text}); }catch(e){} return; }
  try{ await navigator.clipboard.writeText(text); toast("Copied to clipboard"); }catch(e){}
}
function dots(n, of=4){ return `<span class="dots">${[...Array(of)].map((_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</span>`; }

// a quiet starfield behind everything (seeded, so it's the same every time)
function starfield(){
  const c = $("#stars"), x = c.getContext("2d"), dpr = Math.min(2, devicePixelRatio||1);
  c.width = c.clientWidth*dpr; c.height = c.clientHeight*dpr;
  let s = 11; const r = () => (s = (s*16807)%2147483647)/2147483647;
  for(let i=0;i<120;i++){
    x.globalAlpha = 0.12 + r()*0.6; x.fillStyle = r() < 0.12 ? "#ffd9b0" : "#ffffff";
    x.beginPath(); x.arc(r()*c.width, r()*c.height*0.7, (0.35 + r()*1.0)*dpr, 0, 7); x.fill();
  }
}
const toTop = () => { const m = $("#main"); if(m) m.scrollTop = 0; };

// the agreement ring: one arc per system, lit when it agrees with the day's tone (like Hora's timer ring)
function agreeRing(votes, tone){
  const n = votes.length, gap = 10, R = 74, C = 2*Math.PI*R, seg = C/n - gap;
  let s = `<svg viewBox="0 0 180 180" class="ring">`;
  s += `<circle cx="90" cy="90" r="${R}" class="ring-track"/>`;
  votes.forEach((v,i) => {
    s += `<circle cx="90" cy="90" r="${R}" class="ring-seg ${v.tone === tone ? "on" : ""}" stroke-dasharray="${seg.toFixed(1)} ${(C-seg).toFixed(1)}"
      stroke-dashoffset="${(-(i*C/n) + C/4 - gap/2).toFixed(1)}"/>`;
  });
  return s + `</svg>`;
}

// ---- Today
function renderToday(S){
  const d = S.day, c = d.consensus, tone = TONES[c.tone], q = Quotes.quoteFor(new Date());
  const first = (S.profile.name || S.profile.birthName).split(" ")[0];
  const hour = new Date().getHours();
  const hello = hour < 5 ? "Good night" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const voteRows = c.votes.map(v => `<div class="vote"><div class="sys">${v.system}</div><div class="grow">
      <div class="t ${v.tone===c.tone?"match":""}">${TONES[v.tone].name}</div><div class="small dim">${esc(v.why)}</div></div></div>`).join("");
  const R = d.ratings, rat = k => `<div class="r"><span>${k[0].toUpperCase()+k.slice(1)}</span><div class="bar"><i style="width:${R[k]*20}%"></i></div><span class="small">${R[k]}</span></div>`;
  const verdict = c.count === c.of ? "All three systems point the same way." : c.count >= 2 ? `${c.count} of ${c.of} systems agree.` : "The systems disagree today, so the Moon leads.";
  const sun = sg(signOf(S.chart.points.sun.lon)), wm = d.wheelMoon;
  $("#v-today").innerHTML = `
    <div class="top"><div><div class="date">${dateFmt(new Date(), {weekday:"long", day:"numeric", month:"long"})}</div><h1>${hello}, ${esc(first)}</h1></div>
      <div class="badge"><i></i>${d.phaseName}</div></div>

    <div class="hero tap" id="t-cons">
      <div class="ringwrap">${agreeRing(c.votes, c.tone)}
        <div class="ring-in"><div class="ring-n">${c.count}<small>/${c.of}</small></div><div class="ring-l">agree</div></div></div>
      <div class="kicker">Where the systems agree today</div>
      <div class="tone">${tone.name}</div>
      <p class="tone-t">${tone.text}</p>
      <p class="tiny faint">${verdict} <span id="t-more">Tap to see each vote.</span></p>
    </div>
    <div class="card" id="t-votes" style="display:none">${voteRows}</div>

    <div class="card reading">
      <div class="label"><span>Your day</span><span>${sun.glyph} ${sun.name}</span></div>
      ${d.reading.map(p=>`<p>${p}</p>`).join("")}
      <div class="row" style="margin-top:12px"><button class="btn small ghost" id="t-share">Share</button></div>
    </div>

    <div class="grid2">
      <div class="card ratings" style="margin:0"><div class="label">Today's stars</div>${["love","work","energy","mood"].map(rat).join("")}</div>
      <div class="card luck" style="margin:0"><div class="label">For luck</div>
        <div class="lucky">${d.lucky}</div><div class="tiny faint">number of the day</div>
        <div class="row" style="margin-top:10px"><i class="sw" style="background:${d.colour[1]}"></i><span class="small">${d.colour[0]}</span></div>
      </div>
    </div>

    <div class="card quote-card"><div class="label">Quote of the day</div><div class="quote">${esc(q.text)}</div><div class="by">${esc(q.by)}</div></div>

    <div class="card tap" id="t-sky">
      <div class="label"><span>Today's sky</span><span class="chev"></span></div>
      <table class="list">
        <tr><td class="g">☉</td><td>Sun in ${sg(d.sunSign).name}</td><td class="r">${fmtDeg(d.pos.sun.lon,false)}</td></tr>
        <tr><td class="g">☽</td><td>Moon in ${sg(d.moonSign).name}</td><td class="r">${Math.round(d.phase.illum*100)}% lit</td></tr>
        <tr><td class="g">◍</td><td>${wm.moon} <span class="faint">(${wm.animal})</span></td><td class="r small">wheel</td></tr>
        <tr><td class="g">${d.dayPillar.stem.han}${d.dayPillar.branch.han}</td><td>${d.dayPillar.stem.name} ${d.dayPillar.branch.name} day</td><td class="r el-${d.dayPillar.stem.element}">${Chinese.ELEMENTS[d.dayPillar.stem.element].name}</td></tr>
        ${d.retro.length ? `<tr><td class="g">℞</td><td>Retrograde: ${d.retro.map(k=>PLANETS[k].name).join(", ")}</td><td></td></tr>` : ""}
      </table>
    </div>`;
  $("#t-cons").onclick = () => { const v = $("#t-votes"), on = v.style.display === "none"; v.style.display = on ? "block" : "none"; $("#t-more").textContent = on ? "Tap to hide." : "Tap to see each vote."; buzz(); };
  $("#t-share").onclick = () => share(`${dateFmt(new Date())}, ${tone.name}\n\n${d.reading.map(p=>p.replace(/<[^>]+>/g,"")).join("\n\n")}\n\n“${q.text}” — ${q.by}\n\nfrom Augur`);
  $("#t-sky").onclick = () => skySheet(S);
}

function skySheet(S){
  const d = S.day;
  const rows = Astro.BODIES.map(k => `<tr><td class="g">${PLANETS[k].glyph}</td><td>${PLANETS[k].name}${d.pos[k].retro?" ℞":""}</td>
    <td class="r">${fmtDeg(d.pos[k].lon)}</td><td class="r faint small">house ${Chart.houseOf(d.pos[k].lon, S.chart.houses.cusps)}</td></tr>`).join("");
  const tr = d.transits.slice(0,8).map(x => `<tr><td class="g">${x.aspect.glyph}</td><td>${PLANETS[x.t].name} ${x.aspect.name} natal ${PLANETS[x.n].name}</td><td class="r">${x.orb.toFixed(1)}°</td></tr>`).join("");
  sheet(`<h2>Today's sky</h2><p class="small dim">Positions at noon today, tropical zodiac. Houses are your natal houses.</p>
    <div class="card"><table class="list">${rows}</table></div>
    <h3>Transits to your chart</h3><div class="card">${tr ? `<table class="list">${tr}</table>` : `<p class="dim small">No close aspects today.</p>`}</div>
    <h3>Medicine Wheel</h3><div class="card small"><p>The Sun is in the <b>${d.wheelMoon.moon}</b>, the moon of the <b>${d.wheelMoon.animal}</b>${d.wheelMoon.index === S.wheel.index ? ", your own birth moon" : ""}.</p></div>
    <h3>Numerology</h3><div class="card small"><p>Personal Year <b>${d.personalYear}</b> · Month <b>${d.personalMonth}</b> · Day <b>${d.personalDay}</b></p><p class="dim">Today is ${Numerology.CYCLE[d.personalDay].text}.</p></div>`);
}

// ---- Me
function bigThree(S){
  const ch = S.chart, p = ch.points;
  const cell = (what, sign, extra="") => `<div class="cell"><div class="what">${what}</div><div class="glyph">${sg(sign).glyph}</div><div class="sign">${sg(sign).name}</div>${extra}</div>`;
  const moon = ch.moonOptions ? `<div class="cell"><div class="what">Moon</div><div class="glyph">${ch.moonOptions.map(i=>sg(i).glyph).join("/")}</div><div class="sign">${ch.moonOptions.map(i=>sg(i).name).join(" or ")}</div><div class="tiny faint">changed sign that day</div></div>`
    : cell("Moon", signOf(p.moon.lon));
  let rising;
  if(ch.timeKnown){
    const rc = ch.risingCertainty;
    const note = rc.alternatives.length ? `<div class="tiny faint">or ${rc.alternatives.map(i=>sg(i).name).join(", ")}</div>`
      : Math.min(rc.before||999, rc.after||999) < 20 ? `<div class="tiny faint">close to a sign change</div>` : `<div class="tiny faint">${fmtDeg(p.asc.lon,false)}</div>`;
    rising = cell("Rising", signOf(p.asc.lon), note);
  } else rising = `<div class="cell"><div class="what">Rising</div><div class="glyph">?</div><div class="sign">Needs time</div><div class="tiny faint">${ch.risingOptions.length} possible</div></div>`;
  return `<div class="grid3 big3">${cell("Sun", signOf(p.sun.lon), `<div class="tiny faint">${fmtDeg(p.sun.lon,false)}</div>`)}${moon}${rising}</div>`;
}

function renderMe(S){
  const ch = S.chart, nat = S.nat, p = ch.points;
  const traitRows = nat.agreed.map((v,i) => `<div class="trait tap" data-i="${i}"><div class="n">${v.count}/4</div><div class="grow">
      <div><b>${TRAITS[v.trait].name}</b> ${dots(v.count)}</div><div class="small dim">${TRAITS[v.trait].text}</div>
      <div class="tiny faint">${v.systems.join(" · ")}</div></div></div>`).join("");
  const dis = nat.disagreement;
  const sunS = signOf(p.sun.lon), moonS = signOf(p.moon.lon);
  let certainty = "";
  if(ch.timeKnown){
    const rc = ch.risingCertainty, risingS = signOf(p.asc.lon);
    if(rc.alternatives.length) certainty = `<div class="warn">With your time give or take ${rc.spread} minutes, you could also be <b>${rc.alternatives.map(i=>sg(i).name).join(" or ")} rising</b>. Augur uses ${sg(risingS).name}, from the time you entered.</div>`;
    else if(rc.after !== null && rc.after < 20) certainty = `<div class="warn">Your rising sign changes to <b>${sg((risingS+1)%12).name}</b> just ${rc.after} min after your birth time. If your recorded time is a little early, that may be your real rising sign.</div>`;
    else if(rc.before !== null && rc.before < 20) certainty = `<div class="warn">Your rising sign was <b>${sg((risingS+11)%12).name}</b> until ${rc.before} min before your birth time. If your recorded time is a little late, that may be your real rising sign.</div>`;
  } else {
    certainty = `<div class="warn">Without a birth time Augur can't know your rising sign or houses. On your birthday these were rising:<br>${ch.risingOptions.map(o=>`<b>${sg(o.sign).name}</b> ${o.from}–${o.to}`).join(" · ")}</div>`;
  }
  $("#v-me").innerHTML = `
    <div class="top"><div><div class="date">Your chart</div><h1>${esc(S.profile.name || S.profile.birthName)}</h1></div></div>
    ${bigThree(S)}
    ${certainty}
    ${ch.notes.map(n=>`<div class="warn">${esc(n)}</div>`).join("")}

    <div class="card">
      <div class="label"><span>Where the systems agree about you</span></div>
      ${traitRows}
      ${dis ? `<div class="vote" style="margin-top:4px"><div class="sys">Odd one out</div><div class="grow small"><b>${TRAITS[dis.trait].name}</b>: ${dis.system} puts this first (${esc(dis.why)}), but ${dis.absent.join(" and ")} don't see it at all.</div></div>` : ""}
    </div>

    <div class="card reading">
      <div class="label">In short</div>
      <p><b>Sun in ${sg(sunS).name}.</b> ${SIGN_TEXT[sunS].sun}</p>
      ${ch.moonOptions ? `<p><b>Moon in ${ch.moonOptions.map(i=>sg(i).name).join(" or ")}.</b> The Moon changed sign on the day you were born; your birth time would settle which.</p>` : `<p><b>Moon in ${sg(moonS).name}.</b> ${SIGN_TEXT[moonS].moon}</p>`}
      ${ch.timeKnown ? `<p><b>${sg(signOf(p.asc.lon)).name} rising.</b> ${SIGN_TEXT[signOf(p.asc.lon)].rising}</p>` : ""}
    </div>

    <div class="grid2">
      <div class="card tap" style="margin:0" data-go="native"><div class="label">Native American</div><div class="mini-h">${S.wheel.animal}</div><div class="small dim">${S.wheel.clan.name} clan · ${S.wheel.direction.name}</div></div>
      <div class="card tap" style="margin:0" data-go="chinese"><div class="label">Chinese</div><div class="mini-h">${Chinese.ELEMENTS[S.chi.element].name} ${S.chi.animal.name}</div><div class="small dim">${S.chi.dayMaster.name} ${Chinese.ELEMENTS[S.chi.dayMaster.element].name} Day Master</div></div>
      <div class="card tap" style="margin:0" data-go="numerology"><div class="label">Numerology</div><div class="mini-h">Life Path ${S.num.lifePath}</div><div class="small dim">${Numerology.NUMBERS[S.num.lifePath].title}</div></div>
      <div class="card tap" style="margin:0" data-go="western"><div class="label">Western</div><div class="mini-h">Mostly ${ch.balance.element}</div><div class="small dim">${ch.balance.mode} signs lead</div></div>
    </div>

    <p class="tiny faint" style="margin-top:16px">Born ${dateFmt(new Date(S.profile.date+"T12:00"))}${ch.timeKnown ? ` at ${S.profile.time}` : ""} in ${esc(S.profile.place.name)}.
      ${ch.timeKnown ? `That's ${ch.utc.toISOString().slice(0,16).replace("T"," ")} UTC (local time was ${Chart.fmtOffset(ch.conv.offsetMin)}, from the ${esc(S.profile.place.tz)} time-zone history).` : ""}</p>`;
  document.querySelectorAll("#v-me .trait").forEach(el => el.onclick = () => {
    const v = nat.agreed[+el.dataset.i];
    sheet(`<h2>${TRAITS[v.trait].name}</h2><p class="dim">${TRAITS[v.trait].text}</p><div class="card">${v.why.map(w=>`<p class="small">${esc(w)}</p>`).join("")}</div>
      <p class="tiny faint">Each system votes for its top three traits. A trait counts as agreed when it's in the top three of two or more systems.</p>`);
  });
  document.querySelectorAll("#v-me [data-go]").forEach(el => el.onclick = () => App.go("systems", el.dataset.go));
}

window.UI = {$, esc, sheet, closeSheet, toast, buzz, share, starfield, toTop, renderToday, renderMe, dateFmt, dots};
})();
