(function(){
"use strict";
// Wig-wag General Service Code (July 1864). 1 = flag to ground on the signalman's right, 2 = on his left. 3 = front.
var WW = {A:"22",B:"2112",C:"121",D:"222",E:"12",F:"2221",G:"2211",H:"122",I:"1",J:"1122",K:"2121",L:"221",M:"1221",N:"11",O:"21",P:"1212",Q:"1211",R:"211",S:"212",T:"2",U:"112",V:"1222",W:"1121",X:"2122",Y:"111",Z:"2222"};
var MC = {A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",Y:"-.--",Z:"--.."};
var WORDS_WW = ["FORT","SIGNAL","GORDON","POTOMAC","MYER","HILL","RIDGE","SEND"];
var WORDS_MC = ["SIGNAL","LINCOLN","POTOMAC","FORT GORDON","WHAT HATH GOD WROUGHT"];
var ALL = Object.keys(WW);
function pool(level, table, ck){ // level 1: codes up to 2 symbols, 2: up to 3, 3: all
  var max = level === 1 ? 2 : level === 2 ? 3 : 9;
  return ALL.filter(function(l){ return table[l].length <= max; });
}
function pick(arr, not){ var x; do { x = arr[Math.floor(Math.random()*arr.length)]; } while (arr.length > 1 && x === not); return x; }
function el(t, c, txt){ var e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }
function chartTable(table, fmt){
  var t = el("table","chart"); var tb = el("tbody"); var ks = ALL; var cols = 3; var rows = Math.ceil(ks.length/cols);
  for (var r=0;r<rows;r++){ var tr = el("tr"); for (var c=0;c<cols;c++){ var k = ks[r + c*rows]; if (!k) continue; tr.appendChild(el("td",null,k)); tr.appendChild(el("td",null,fmt(table[k]))); } tb.appendChild(tr); }
  t.appendChild(tb); return t;
}
function live(){ var r=document.getElementById("room-civil-war"), sp=document.getElementById("sub-games"); return !!(r && r.classList.contains("active") && sp && sp.classList.contains("active")); }
var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var panel = document.getElementById("panel"), foot = document.getElementById("foot");
var tabs = {flag:document.getElementById("t-flag"), torch:document.getElementById("t-torch"), morse:document.getElementById("t-morse")};
var timers = [];
function later(fn, ms){ var id = setTimeout(fn, ms); timers.push(id); return id; }
function clearTimers(){ timers.forEach(clearTimeout); timers = []; }
var stopFns = [];
function cleanup(){ clearTimers(); stopFns.forEach(function(f){ try{ f(); }catch(e){} }); stopFns = []; }

// ---------- signalman SVG (viewed from behind, so his right is screen right) ----------
function signalman(night){
  var ns = "http://www.w3.org/2000/svg";
  var wrap = el("div","stage" + (night ? " night" : ""));
  var gnd = night ? "#1a2218" : "var(--ground)";
  var h = '<svg viewBox="0 0 400 260" role="img" aria-label="' + (night ? "A signalman with a torch, seen from behind, with a fixed foot torch on the ground" : "A signalman with a flag, seen from behind") + '">'
   + (night ? '<defs><radialGradient id="gl"><stop offset="0" stop-color="#ffd34d" stop-opacity=".95"/><stop offset="1" stop-color="#ff8a00" stop-opacity="0"/></radialGradient></defs>' : '')
   + '<rect x="0" y="228" width="400" height="32" fill="' + gnd + '"/>'
   + '<rect x="176" y="150" width="48" height="80" rx="6" fill="' + (night ? "#2a3452" : "var(--uniform)") + '"/>'
   + '<circle cx="200" cy="136" r="15" fill="' + (night ? "#4a3d33" : "#5b4636") + '"/>'
   + '<rect x="184" y="118" width="32" height="8" rx="3" fill="' + (night ? "#1d2440" : "#1f2a44") + '"/>'
   + '<g id="pole"><rect x="197" y="22" width="6" height="150" rx="2" fill="' + (night ? "#8a6a3a" : "#6b4a22") + '"/>'
   + (night ? '<circle cx="200" cy="20" r="26" fill="url(#gl)"/><ellipse cx="200" cy="18" rx="7" ry="11" fill="#ffd34d"/>'
            : '<rect x="165" y="14" width="70" height="56" fill="#f4f4ee" stroke="#333" stroke-width="1"/><rect x="185" y="28" width="30" height="28" fill="#c0392b"/>')
   + '</g>'
   + (night ? '<g><ellipse cx="90" cy="214" rx="6" ry="9" fill="#ffd34d"/><circle cx="90" cy="214" r="18" fill="url(#gl)"/><rect x="88" y="220" width="4" height="10" fill="#8a6a3a"/><text x="90" y="250" text-anchor="middle" font-size="11" fill="#c9c2a8" font-family="IBM Plex Sans,sans-serif">foot torch</text></g>' : '')
   + '</svg>';
  wrap.innerHTML = h;
  var pole = wrap.querySelector("#pole");
  function pose(m){ // 0 upright, 1 right, 2 left, 3 front
    var tr = m === 1 ? "rotate(82deg)" : m === 2 ? "rotate(-82deg)" : m === 3 ? "translateY(70px) scaleY(.35)" : "rotate(0deg)";
    pole.style.transform = tr;
  }
  return {node:wrap, pose:pose};
}

// ---------- shared drill UI for flag/torch ----------
function flagStation(night){
  cleanup(); panel.textContent = "";
  var sm = signalman(night);
  var state = {mode:"learn", level:1, target:"", last:"", score:0, streak:0, tries:0, seq:"", busy:false, wordIdx:0, word:""};
  var title = night ? "Torch Drill" : "Flag Drill";
  var left = el("div"), right = el("div");
  var grid = el("div","grid"); grid.appendChild(left); grid.appendChild(right); panel.appendChild(grid);
  left.appendChild(sm.node);
  var legend = el("p","note", "You are the signalman, seen from behind. 1 = wave to the ground on YOUR RIGHT. 2 = wave to the ground on YOUR LEFT. 3 = wave to the front. Always return to upright between motions." + (night ? " At night the fixed foot torch marks the reference point while the flying torch moves." : ""));
  left.appendChild(legend);
  var modes = el("div","mode"); modes.setAttribute("role","group"); modes.setAttribute("aria-label","Drill mode");
  var defs = [["learn","Learn"],["read","Read it"],["send","Send it"],["word","Send a word"]];
  var mbtns = {};
  defs.forEach(function(d){ var b = el("button",null,d[1]); b.type="button"; b.setAttribute("aria-pressed", d[0]==="learn"); b.addEventListener("click", function(){ setMode(d[0]); }); mbtns[d[0]] = b; modes.appendChild(b); });
  right.appendChild(modes);
  var body = el("div"); right.appendChild(body);
  var status = el("p","status"); status.setAttribute("role","status"); status.setAttribute("aria-live","polite");
  var score = el("p","score");
  function updScore(){ score.textContent = "Score " + state.score + " · streak " + state.streak; }

  function play(code, done){
    if (state.busy) return; state.busy = true; var t = 0; var step = reduce ? 420 : 640;
    for (var i=0;i<code.length;i++){ (function(ch,k){ later(function(){ sm.pose(+ch); }, k*step); later(function(){ sm.pose(0); }, k*step + step*0.5); })(code[i], i); }
    later(function(){ state.busy = false; if (done) done(); }, code.length*step + 120);
  }
  function setMode(m){
    state.mode = m; clearTimers(); stopFns.forEach(function(f){ try{ f(); }catch(e){} }); stopFns = []; state.busy = false; sm.pose(0); state.seq = "";
    Object.keys(mbtns).forEach(function(k){ mbtns[k].setAttribute("aria-pressed", k===m); });
    body.textContent = ""; status.textContent = ""; status.className = "status";
    if (m==="learn") learn(); else if (m==="read") read(); else if (m==="send") send(); else word();
  }
  function levelSel(){
    var r = el("div","row"); var l = el("label",null,"Letters: "); var s = document.createElement("select"); s.id = "lv-" + (night?"n":"f"); l.htmlFor = s.id;
    [["1","Short codes (1–2 motions)"],["2","Up to 3 motions"],["3","The whole alphabet"]].forEach(function(o){ var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; if (+o[0]===state.level) op.selected = true; s.appendChild(op); });
    s.addEventListener("change", function(){ state.level = +s.value; if (state.mode==="read") read(); else if (state.mode==="send") send(); });
    r.appendChild(l); r.appendChild(s); return r;
  }
  function learn(){
    body.appendChild(el("p",null,"Pick a letter to watch it signaled. Each letter ends with the staff upright."));
    var sel = el("div","choices");
    ALL.forEach(function(k){ var b = el("button",null,k); b.type="button"; b.setAttribute("aria-label","Show letter "+k+", code "+WW[k].split("").join(" ")); b.addEventListener("click", function(){ clearTimers(); state.busy=false; sm.pose(0); status.className="status"; status.textContent = k + " = " + WW[k].split("").join(" ") + (WW[k].length ? "  (" + WW[k].split("").map(function(c){return c==="1"?"right":"left";}).join(", ") + ")" : ""); play(WW[k]); }); sel.appendChild(b); });
    body.appendChild(sel); body.appendChild(status);
    var det = el("details","ref"); det.appendChild(el("summary",null,"Full code chart (1864)")); det.appendChild(chartTable(WW, function(c){ return c.split("").join(" "); })); body.appendChild(det);
    body.appendChild(el("p","note","Control signals: 3 ends a word, 33 ends a sentence, 333 ends a message."));
  }
  function read(){
    body.appendChild(levelSel());
    body.appendChild(el("p",null,"Watch the motions, then choose the letter."));
    var choices = el("div","choices"); var replay = el("button","btn","Watch again"); replay.type="button";
    body.appendChild(choices); var rr = el("div","row"); rr.appendChild(replay); body.appendChild(rr); body.appendChild(status); body.appendChild(score); updScore();
    var hint = el("p","note"); body.appendChild(hint);
    function next(){
      status.className="status"; status.textContent=""; hint.textContent=""; choices.textContent="";
      var p = pool(state.level, WW); state.target = pick(p, state.last); state.last = state.target; state.tries = 0;
      var opts = [state.target]; while (opts.length<4){ var c = pick(ALL); if (opts.indexOf(c)<0) opts.push(c); }
      opts.sort(function(){ return Math.random()-0.5; });
      opts.forEach(function(o){ var b = el("button",null,o); b.type="button"; b.addEventListener("click", function(){ answer(o,b); }); choices.appendChild(b); });
      play(WW[state.target]);
    }
    function answer(o,b){
      if (state.busy) return;
      if (o===state.target){ state.score += state.tries ? 0 : 1; state.streak++; updScore(); status.className="status ok"; status.textContent = "Correct. " + o + " = " + WW[o].split("").join(" ") + "."; later(next, 1100); }
      else { state.streak = 0; state.tries++; updScore(); b.disabled = true; status.className="status bad"; status.textContent = "Not " + o + ". Watch again and count the motions."; hint.textContent = "Number of motions: " + WW[state.target].length; }
    }
    replay.addEventListener("click", function(){ play(WW[state.target]); });
    next();
  }
  function bindKeys(onMotion, onEnd, onFront){
    function kd(e){
      if (!live()) return;
      if (e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key==="ArrowRight"){ e.preventDefault(); onMotion(1); }
      else if (e.key==="ArrowLeft"){ e.preventDefault(); onMotion(2); }
      else if (e.key==="ArrowDown"){ e.preventDefault(); onFront(); }
      else if (e.key==="ArrowUp" || (e.key==="Enter" && e.target.tagName!=="BUTTON")){ e.preventDefault(); onEnd(); }
    }
    document.addEventListener("keydown", kd); stopFns.push(function(){ document.removeEventListener("keydown", kd); });
  }
  function pad(onMotion,onEnd,onFront,frontLabel){
    var p = el("div","pad");
    var r = el("button",null,"Wave to my RIGHT (1)"), l = el("button",null,"Wave to my LEFT (2)"), e = el("button","btn primary","Letter finished (pause)"), f = el("button",null,frontLabel);
    [r,l,e,f].forEach(function(b){ b.type="button"; });
    r.addEventListener("click", function(){ onMotion(1); }); l.addEventListener("click", function(){ onMotion(2); }); e.addEventListener("click", onEnd); f.addEventListener("click", onFront);
    e.className = "btn primary wide"; p.appendChild(r); p.appendChild(l); p.appendChild(f); p.appendChild(e); return p;
  }
  function wave(m){ sm.pose(m); later(function(){ sm.pose(0); }, reduce ? 180 : 260); }
  function send(){
    body.appendChild(levelSel());
    var big = el("div","big"); var seq = el("div","seq"); seq.setAttribute("aria-live","polite");
    var showCode = document.createElement("input"); showCode.type="checkbox"; showCode.id="sc"; var scl = el("label",null," Show me the code"); scl.htmlFor = "sc";
    var hintRow = el("div","row"); hintRow.appendChild(showCode); hintRow.appendChild(scl);
    var hint = el("p","note");
    body.appendChild(el("p",null,"Send this letter. Use the buttons, or the arrow keys: ← and → to wave, ↓ for the front motion, ↑ when the letter is finished.")); body.appendChild(big); body.appendChild(hintRow); body.appendChild(hint); body.appendChild(seq);
    function next(){ var p = pool(state.level, WW); state.target = pick(p, state.last); state.last = state.target; big.textContent = state.target; state.seq=""; seq.textContent=""; status.className="status"; status.textContent=""; showHint(); }
    function showHint(){ hint.textContent = showCode.checked ? "Code: " + WW[state.target].split("").join(" ") : ""; }
    showCode.addEventListener("change", showHint);
    function onMotion(m){ state.seq += m; seq.textContent = state.seq.split("").join(" "); wave(m); }
    function onFront(){ status.className="status"; status.textContent="Front motion (3) ends a word. In this drill, send one letter at a time."; wave(3); }
    function onEnd(){
      if (!state.seq){ return; }
      if (state.seq === WW[state.target]){ state.score++; state.streak++; updScore(); status.className="status ok"; status.textContent = "Good copy. " + state.target + " = " + WW[state.target].split("").join(" ") + "."; later(next, 1000); }
      else { state.streak=0; updScore(); status.className="status bad"; status.textContent = "You sent " + state.seq.split("").join(" ") + ". " + state.target + " is " + WW[state.target].split("").join(" ") + ". Try again."; state.seq=""; seq.textContent=""; }
    }
    body.appendChild(pad(onMotion,onEnd,onFront,"Front motion (3)")); body.appendChild(status); body.appendChild(score); updScore();
    bindKeys(onMotion,onEnd,onFront); next();
  }
  function word(){
    var big = el("div","big"); var seq = el("div","seq"); seq.setAttribute("aria-live","polite"); var prog = el("p","note");
    body.appendChild(el("p",null,"Send the word one letter at a time: press “Letter finished” after each letter, then the front motion (3) to end the word."));
    body.appendChild(big); body.appendChild(prog); body.appendChild(seq);
    function next(){ state.word = pick(WORDS_WW, state.word); state.wordIdx = 0; state.seq=""; seq.textContent=""; show(); status.className="status"; status.textContent=""; }
    function show(){ var w = state.word, s = ""; for (var i=0;i<w.length;i++){ s += (i<state.wordIdx ? w[i] : (i===state.wordIdx ? "[" + w[i] + "]" : "_")) + " "; } big.textContent = s.trim(); big.style.fontSize = "30px"; prog.textContent = state.wordIdx < state.word.length ? "Now sending: " + state.word[state.wordIdx] : "Word complete. End it with the front motion (3)."; }
    function onMotion(m){ if (state.wordIdx >= state.word.length) return; state.seq += m; seq.textContent = state.seq.split("").join(" "); wave(m); }
    function onEnd(){
      if (state.wordIdx >= state.word.length || !state.seq) return;
      var want = WW[state.word[state.wordIdx]];
      if (state.seq===want){ state.wordIdx++; state.seq=""; seq.textContent=""; status.className="status ok"; status.textContent="Letter good."; show(); }
      else { state.streak=0; updScore(); status.className="status bad"; status.textContent = "That was " + state.seq.split("").join(" ") + ". " + state.word[state.wordIdx] + " is " + want.split("").join(" ") + "."; state.seq=""; seq.textContent=""; }
    }
    function onFront(){ wave(3); if (state.wordIdx >= state.word.length){ state.score += state.word.length; state.streak++; updScore(); status.className="status ok"; status.textContent = "Word sent: " + state.word + ". Message received."; later(next, 1400); } else { status.className="status bad"; status.textContent="Finish the letters first."; } }
    body.appendChild(pad(onMotion,onEnd,onFront,"Front motion (3): end word")); body.appendChild(status); body.appendChild(score); updScore();
    bindKeys(onMotion,onEnd,onFront); next();
  }
  setMode("learn");
  foot.textContent = "Code: the Army's General Service Code of July 1864, as printed in Myer's A Manual of Signals. In the 1864 code a 1 is a wave to the signalman's right and a 2 to his left; the earliest version reversed them. Sources are listed on The Story tab.";
}

// ---------- Morse ----------
var actx = null, muted = false;
function audio(){ if (!actx){ try{ actx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ actx = null; } } if (actx && actx.state==="suspended") actx.resume(); return actx; }
var osc = null, gain = null;
function toneOn(){ var a = audio(); if (!a || muted || osc) return; osc = a.createOscillator(); gain = a.createGain(); osc.type="sine"; osc.frequency.value = 620; gain.gain.setValueAtTime(0,a.currentTime); gain.gain.linearRampToValueAtTime(0.25,a.currentTime+0.01); osc.connect(gain); gain.connect(a.destination); osc.start(); }
function toneOff(){ if (!osc) return; var a = actx; try{ gain.gain.cancelScheduledValues(a.currentTime); gain.gain.setValueAtTime(gain.gain.value,a.currentTime); gain.gain.linearRampToValueAtTime(0,a.currentTime+0.015); osc.stop(a.currentTime+0.03); }catch(e){} osc=null; gain=null; }

function morseStation(){
  cleanup(); panel.textContent = ""; stopFns.push(toneOff);
  var state = {mode:"learn", level:1, target:"", last:"", score:0, streak:0, busy:false, word:"", typed:""};
  var wrap = el("div"); panel.appendChild(wrap);
  var lampRow = el("p","note"); var lamp = el("span","lamp"); lamp.setAttribute("aria-hidden","true"); lampRow.appendChild(lamp); var ltxt = el("span",null,"Sounder lamp (flashes with each tone, so you can follow without sound)"); lampRow.appendChild(ltxt);
  var modes = el("div","mode"); modes.setAttribute("role","group"); modes.setAttribute("aria-label","Drill mode");
  var mbtns = {};
  [["learn","Learn"],["read","Listen and read"],["send","Send on the key"],["msg","Decode a message"]].forEach(function(d){ var b = el("button",null,d[1]); b.type="button"; b.setAttribute("aria-pressed", d[0]==="learn"); b.addEventListener("click", function(){ setMode(d[0]); }); mbtns[d[0]] = b; modes.appendChild(b); });
  var mute = el("button",null,"Sound: on"); mute.type="button"; mute.setAttribute("aria-pressed","false"); mute.addEventListener("click", function(){ muted = !muted; mute.textContent = "Sound: " + (muted?"off":"on"); mute.setAttribute("aria-pressed", muted); });
  modes.appendChild(mute);
  var body = el("div"); var status = el("p","status"); status.setAttribute("role","status"); status.setAttribute("aria-live","polite"); var score = el("p","score");
  wrap.appendChild(modes); wrap.appendChild(lampRow); wrap.appendChild(body);
  function updScore(){ score.textContent = "Score " + state.score + " · streak " + state.streak; }
  function flash(on){ lamp.className = "lamp" + (on ? " on" : ""); }
  var U = 110; // ms per dot
  function playMorse(str, done){ // str of letters/spaces
    if (state.busy) return; state.busy = true; var t = 0;
    for (var i=0;i<str.length;i++){
      var ch = str[i];
      if (ch === " "){ t += U*4; continue; }
      var code = MC[ch]; if (!code) continue;
      for (var j=0;j<code.length;j++){ var d = code[j]==="." ? U : U*3; (function(s,dur){ later(function(){ toneOn(); flash(true); }, s); later(function(){ toneOff(); flash(false); }, s+dur); })(t,d); t += d + U; }
      t += U*2;
    }
    later(function(){ state.busy=false; if (done) done(); }, t+80);
  }
  function setMode(m){
    state.mode = m; clearTimers(); stopFns.forEach(function(f){ try{ f(); }catch(e){} }); state.busy=false; toneOff(); flash(false); state.typed=""; stopFns = [toneOff];
    Object.keys(mbtns).forEach(function(k){ mbtns[k].setAttribute("aria-pressed", k===m); });
    body.textContent=""; status.textContent=""; status.className="status";
    if (m==="learn") learn(); else if (m==="read") read(); else if (m==="send") send(); else msg();
  }
  function dd(c){ return c.split("").map(function(x){return x==="."?"dit":"dah";}).join(" "); }
  function learn(){
    body.appendChild(el("p",null,"Tap a letter to hear and see it. A dot (dit) is short; a dash (dah) is three times as long."));
    var sel = el("div","choices");
    ALL.forEach(function(k){ var b = el("button",null,k); b.type="button"; b.setAttribute("aria-label","Play letter "+k+": "+dd(MC[k])); b.addEventListener("click", function(){ clearTimers(); state.busy=false; toneOff(); flash(false); status.className="status"; status.textContent = k + "   " + MC[k].replace(/\./g,"•").replace(/-/g,"–"); playMorse(k); }); sel.appendChild(b); });
    body.appendChild(sel); body.appendChild(status);
    var det = el("details","ref"); det.appendChild(el("summary",null,"Full chart")); det.appendChild(chartTable(MC, function(c){ return c.replace(/\./g,"•").replace(/-/g,"–"); })); body.appendChild(det);
  }
  function levelSel(){
    var r = el("div","row"); var l = el("label",null,"Letters: "); var s = document.createElement("select"); s.id="lv-m"; l.htmlFor=s.id;
    [["1","Short codes (1–2 signals)"],["2","Up to 3 signals"],["3","The whole alphabet"]].forEach(function(o){ var op = document.createElement("option"); op.value=o[0]; op.textContent=o[1]; if (+o[0]===state.level) op.selected=true; s.appendChild(op); });
    s.addEventListener("change", function(){ state.level=+s.value; setMode(state.mode); });
    r.appendChild(l); r.appendChild(s); return r;
  }
  function read(){
    body.appendChild(levelSel()); body.appendChild(el("p",null,"Listen, then choose the letter. If sound is off, follow the lamp."));
    var choices = el("div","choices"); var rr = el("div","row"); var re = el("button","btn","Play again"); re.type="button"; rr.appendChild(re);
    body.appendChild(choices); body.appendChild(rr); body.appendChild(status); body.appendChild(score); updScore();
    function next(){ status.className="status"; status.textContent=""; choices.textContent="";
      state.target = pick(pool(state.level, MC), state.last); state.last = state.target;
      var opts=[state.target]; while(opts.length<4){ var c=pick(ALL); if (opts.indexOf(c)<0) opts.push(c); } opts.sort(function(){return Math.random()-0.5;});
      opts.forEach(function(o){ var b=el("button",null,o); b.type="button"; b.addEventListener("click", function(){ ans(o,b); }); choices.appendChild(b); });
      audio(); playMorse(state.target);
    }
    function ans(o,b){ if (state.busy) return;
      if (o===state.target){ state.score++; state.streak++; updScore(); status.className="status ok"; status.textContent="Correct. "+o+" is "+MC[o].replace(/\./g,"•").replace(/-/g,"–")+"."; later(next,1100); }
      else { state.streak=0; updScore(); b.disabled=true; status.className="status bad"; status.textContent="Not "+o+". Listen again."; }
    }
    re.addEventListener("click", function(){ audio(); playMorse(state.target); }); next();
  }
  function send(){
    body.appendChild(levelSel());
    var big = el("div","big"); var seq = el("div","seq"); seq.setAttribute("aria-live","polite");
    body.appendChild(el("p",null,"Send this letter by pressing and holding the key. A quick tap is a dot; a longer press is a dash. Pause to finish the letter. You can also hold the space bar."));
    body.appendChild(big);
    var key = el("button","btn primary","HOLD TO SEND"); key.type="button"; key.style.cssText="width:100%;min-height:96px;font-size:20px;letter-spacing:.12em;touch-action:none";
    body.appendChild(key); body.appendChild(seq); body.appendChild(status); body.appendChild(score); updScore();
    var showCode = document.createElement("input"); showCode.type="checkbox"; showCode.id="mc-sc"; var scl = el("label",null," Show me the code"); scl.htmlFor="mc-sc"; var hr = el("div","row"); hr.appendChild(showCode); hr.appendChild(scl); var hint = el("p","note"); body.appendChild(hr); body.appendChild(hint);
    function showHint(){ hint.textContent = showCode.checked ? "Code: " + MC[state.target].replace(/\./g,"•").replace(/-/g,"–") : ""; } showCode.addEventListener("change", showHint);
    function next(){ state.target = pick(pool(state.level, MC), state.last); state.last = state.target; big.textContent = state.target; state.typed=""; seq.textContent=""; status.className="status"; status.textContent=""; showHint(); }
    var downAt = 0, idle = null, down = false;
    function press(){ if (down) return; down = true; downAt = performance.now(); clearTimeout(idle); audio(); toneOn(); flash(true); }
    function release(){ if (!down) return; down = false; toneOff(); flash(false); var d = performance.now()-downAt; state.typed += d < U*2 ? "." : "-"; seq.textContent = state.typed.replace(/\./g,"•").replace(/-/g,"–"); clearTimeout(idle); idle = setTimeout(check, U*7); timers.push(idle); }
    function check(){
      if (!state.typed) return;
      if (state.typed===MC[state.target]){ state.score++; state.streak++; updScore(); status.className="status ok"; status.textContent="Good copy. "+state.target+" received."; later(next,1000); }
      else { state.streak=0; updScore(); status.className="status bad"; status.textContent="You sent "+state.typed.replace(/\./g,"•").replace(/-/g,"–")+". "+state.target+" is "+MC[state.target].replace(/\./g,"•").replace(/-/g,"–")+". Try again."; state.typed=""; seq.textContent=""; }
    }
    key.addEventListener("pointerdown", function(e){ e.preventDefault(); key.setPointerCapture && key.setPointerCapture(e.pointerId); press(); });
    key.addEventListener("pointerup", release); key.addEventListener("pointercancel", release);
    function kd(e){ if (live() && e.code==="Space" && !(e.target && /INPUT|SELECT|TEXTAREA/.test(e.target.tagName))){ e.preventDefault(); if (!e.repeat) press(); } }
    function ku(e){ if (e.code==="Space"){ e.preventDefault(); release(); } }
    document.addEventListener("keydown", kd); document.addEventListener("keyup", ku);
    stopFns.push(function(){ document.removeEventListener("keydown", kd); document.removeEventListener("keyup", ku); });
    next();
  }
  function msg(){
    body.appendChild(el("p",null,"Receive a message as an operator would, then type what you heard. The last one is Samuel Morse's first public message, sent May 24, 1844."));
    var inp = document.createElement("input"); inp.type="text"; inp.id="mc-in"; inp.autocomplete="off"; inp.setAttribute("aria-label","Type the message you heard");
    var row = el("div","row"); var play = el("button","btn","Play message"); play.type="button"; var chk = el("button","btn primary","Check"); chk.type="button"; var nx = el("button","btn","Next message"); nx.type="button";
    row.appendChild(play); row.appendChild(chk); row.appendChild(nx);
    body.appendChild(inp); body.appendChild(row); body.appendChild(status); body.appendChild(score); updScore();
    var idx = -1;
    function next(){ idx = (idx+1) % WORDS_MC.length; state.word = WORDS_MC[idx]; inp.value=""; status.className="status"; status.textContent="Message " + (idx+1) + " of " + WORDS_MC.length + "."; }
    play.addEventListener("click", function(){ audio(); playMorse(state.word); });
    function check(){ var v = inp.value.trim().toUpperCase().replace(/\s+/g," "); if (!v) return;
      if (v===state.word){ state.score += state.word.replace(/ /g,"").length; state.streak++; updScore(); status.className="status ok"; status.textContent="Copied correctly: " + state.word + (state.word.indexOf("WROUGHT")>0 ? ". That was the 1844 Washington to Baltimore message." : "."); }
      else { state.streak=0; updScore(); status.className="status bad"; status.textContent="Not quite. Play it again and listen letter by letter."; } }
    chk.addEventListener("click", check); inp.addEventListener("keydown", function(e){ if (e.key==="Enter") check(); }); nx.addEventListener("click", next); next();
  }
  setMode("learn");
  foot.textContent = "This trainer uses International Morse, the form still in use. Civil War telegraphers used American Morse, a related code with different letters. Morse and Alfred Vail developed the dot-and-dash system.";
}

function show(which){
  Object.keys(tabs).forEach(function(k){ tabs[k].setAttribute("aria-selected", k===which); });
  if (which==="flag") flagStation(false); else if (which==="torch") flagStation(true); else morseStation();
  
}
tabs.flag.addEventListener("click", function(){ show("flag"); });
tabs.torch.addEventListener("click", function(){ show("torch"); });
tabs.morse.addEventListener("click", function(){ show("morse"); });
var tablist = document.querySelector('[role=tablist]');
tablist.addEventListener("keydown", function(e){ var ks=["flag","torch","morse"]; var cur = ks.filter(function(k){return tabs[k].getAttribute("aria-selected")==="true";})[0]; var i = ks.indexOf(cur); if (e.key==="ArrowRight"){ i=(i+1)%3; } else if (e.key==="ArrowLeft"){ i=(i+2)%3; } else return; e.preventDefault(); show(ks[i]); tabs[ks[i]].focus(); });
show("flag");
})();
