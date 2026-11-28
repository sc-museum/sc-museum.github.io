/* Shared player for the museum's narrated story pages (Wired Annex series).
   The page defines window.STORY = {photos:{key:{src,cap,credit,fit,top}}, scenes:[...], key:0}
   and a stage holding svg.map with layers <g class="lay" id="L-name">.
   A scene may set: part (music mood), card (html), date, stat [value or [from,to], label],
   photo [key, "inset"|"right"|"full"], lay [names], dim, flash, trio [[svg,big,small] x3],
   panel (html), cap (caption html), say (narration), v ("m" man or "f" woman; default alternates, man first), min (seconds).
   Narration, music and controls are the same as stories/gulf-war-network.html. */
(function(){
"use strict";
const $=id=>document.getElementById(id);
const ST=window.STORY,S=ST.scenes,PH=ST.photos||{};
const LAYS=[...document.querySelectorAll("svg.map .lay")].map(g=>g.id.slice(2));

/* ---------- drawing a scene ---------- */
let shownPhoto="";
function countUp(el,a,b){const t0=performance.now();(function f(now){const k=Math.min(1,(now-t0)/1800),e=1-Math.pow(1-k,3);el.textContent=Math.round(a+(b-a)*e).toLocaleString("en-US");if(k<1)requestAnimationFrame(f)})(t0)}
function draw(i){
  const s=S[i];
  LAYS.forEach(k=>$("L-"+k).classList.toggle("on",!!(s.lay&&s.lay.includes(k))));
  $("dim").classList.toggle("on",!!s.dim);
  const fl=$("flash");fl.classList.remove("go");if(s.flash){void fl.offsetWidth;fl.classList.add("go")}
  $("date").textContent=s.date||"";$("date").classList.toggle("on",!!s.date&&!s.card);
  const st=$("stat");
  if(s.stat){st.classList.add("on");$("statL").textContent=s.stat[1];const v=s.stat[0];
    if(Array.isArray(v))countUp($("statN"),v[0],v[1]);else if(typeof v==="number")countUp($("statN"),0,v);else $("statN").textContent=v}
  else st.classList.remove("on");
  const ph=$("photo");
  if(s.photo){const p=PH[s.photo[0]];
    ph.className="photo "+s.photo[1]+(p.fit?" fit":"")+(p.top?" top":"");
    if(shownPhoto!==s.photo[0]){$("photoImg").src=p.src;shownPhoto=s.photo[0]}
    $("photoImg").alt=p.cap;$("photoCap").innerHTML=p.cap+"<i>"+p.credit+"</i>";
    void ph.offsetWidth;ph.classList.add("on")}
  else ph.classList.remove("on");
  const tr=$("trio");
  if(s.trio){tr.innerHTML=s.trio.map(t=>"<div>"+t[0]+"<b>"+t[1]+"</b><span>"+t[2]+"</span></div>").join("");void tr.offsetWidth;tr.classList.add("on")}else tr.classList.remove("on");
  const pn=$("panel");
  if(s.panel){pn.innerHTML=s.panel;void pn.offsetWidth;pn.classList.add("on")}else pn.classList.remove("on");
  const c=$("card");if(s.card){c.classList.remove("on");c.innerHTML=s.card;void c.offsetWidth;c.classList.add("on")}else c.classList.remove("on");
  const cap=$("cap");cap.style.opacity=0;setTimeout(()=>{cap.innerHTML=s.cap;cap.style.opacity=1},200);
  [...$("dots").children].forEach((d,n)=>{d.className=n<i?"done":n===i?"now":""});
  $("prev").disabled=i===0;$("next").disabled=i===S.length-1;
}


/* ---------- narration: two narrators, a low, deep man's voice and a warm woman's voice; the story waits for them ---------- */
const hasTTS="speechSynthesis" in window&&"SpeechSynthesisUtterance" in window;
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let voiceOn=hasTTS&&store.get("narr-on",true),voices={m:null,f:null},talkTok=0,talkTimer=null;
const MALE=/Guy|Christopher|Andrew|Brian|Eric|Davis|Roger|Tony|Jason|Steffan|Ryan|Thomas|Oliver|William|Liam|Connor|Daniel|Arthur|Aaron|Evan|Nathan|Tom|Alex\b|Google UK English Male|David|Mark|George|James|Male/i;
const FEMALE=/Ava|Aria|Jenny|Emma|Michelle|Samantha|Libby|Sonia|Zira|Susan|Hazel|Karen|Moira|Tessa|Fiona|Serena|Allison|Nancy|Jane|Sara|Female|Victoria|Kate|Google US English|Google UK English Female/i;
// Deep, resonant men's voices first (Edge's natural Guy, Davis, Christopher, Roger, Andrew, Brian); warm women's voices (Ava, Emma, Jenny, Samantha).
const DEEP=/Guy|Davis|Christopher|Roger|Andrew|Brian|Daniel/i, WARM=/Ava|Emma|Jenny|Sonia|Libby|Samantha|Allison|Google US English/i;
const NAT=/Natural|Neural|Premium|Enhanced/i, JUNK=/Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|eSpeak|\bAna\b/i;
function pickVoices(){if(!hasTTS)return;const vs=speechSynthesis.getVoices().filter(v=>/^en(-|_|$)/i.test(v.lang)&&!JUNK.test(v.name));
  const lang=v=>/en-US/i.test(v.lang)?6:/en-GB/i.test(v.lang)?5:0;
  const isM=v=>MALE.test(v.name)&&!FEMALE.test(v.name),isF=v=>FEMALE.test(v.name)&&!MALE.test(v.name);
  const best=(ok,bonus)=>vs.filter(ok).sort((a,b)=>(NAT.test(b.name)?60:0)+(bonus.test(b.name)?14:0)+lang(b)-((NAT.test(a.name)?60:0)+(bonus.test(a.name)?14:0)+lang(a)))[0]||null;
  voices.m=best(isM,DEEP);voices.f=best(isF,WARM);
  const any=vs.sort((a,b)=>(NAT.test(b.name)?1:0)-(NAT.test(a.name)?1:0))[0]||null;   // a device with only one voice uses it for both
  if(!voices.m)voices.m=voices.f||any;if(!voices.f)voices.f=voices.m||any}
if(hasTTS){pickVoices();speechSynthesis.addEventListener&&speechSynthesis.addEventListener("voiceschanged",pickVoices)}
function stopTalk(){talkTok++;clearTimeout(talkTimer);if(hasTTS)speechSynthesis.cancel()}
function say(text,done,who){stopTalk();const tok=talkTok,voice=voices[who==="f"?"f":"m"];
  if(!voiceOn||!hasTTS||!voice||!text.trim()){setTimeout(()=>{if(tok===talkTok)done()},0);return}
  const nat=NAT.test(voice.name),man=voice===voices.m&&who!=="f";
  // Smooth delivery: a natural voice reads the whole scene in one breath, at its own pitch and close to its own pace,
  // because pitch-shifting or slowing it is what makes it sound synthetic. Plain voices are cut into sentences
  // (some browsers stop long utterances) and get only a light touch: a little deeper for the man.
  const parts=nat?[text]:(text.match(/[^.!?]+(?:[.!?]+|$)\s*/g)||[text]);let k=0;
  const rate=nat?(man?.96:.98):(man?.93:.95),pitch=nat?1:(man?.88:1);
  talkTimer=setTimeout(()=>{if(tok===talkTok)done()},(text.split(/\s+/).length/1.5+8)*1000);   // never wait forever
  (function next(){if(tok!==talkTok)return;if(k>=parts.length){clearTimeout(talkTimer);done();return}
    const u=new SpeechSynthesisUtterance(parts[k++].trim());u.voice=voice;u.lang=voice.lang;u.rate=rate;u.pitch=pitch;
    u.onend=()=>{if(tok===talkTok)setTimeout(next,80)};u.onerror=e=>{if(tok!==talkTok||e.error==="interrupted"||e.error==="canceled")return;clearTimeout(talkTimer);done()};
    speechSynthesis.speak(u)})()}

/* ---------- music: an original score, synthesized in the browser ---------- */
const AC=window.AudioContext||window.webkitAudioContext;
let ac=null,musicOn=!!AC,bus,verb,padG,padF,pads=[],nb=null,talking=false;
const KEY=ST.key||0;   // transposes the whole score, so each film has its own key
const mtof=m=>440*Math.pow(2,(m+KEY-69)/12);
function initAudio(){if(ac||!AC)return;ac=new AC();const master=ac.createGain();master.gain.value=.85;master.connect(ac.destination);
  bus=ac.createGain();bus.gain.value=0;bus.connect(master);
  verb=ac.createConvolver();const L=Math.floor(ac.sampleRate*3),ir=ac.createBuffer(2,L,ac.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<L;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/L,2.4)}
  verb.buffer=ir;const vg=ac.createGain();vg.gain.value=.32;verb.connect(vg);vg.connect(bus);
  padF=ac.createBiquadFilter();padF.type="lowpass";padF.frequency.value=700;padG=ac.createGain();padG.gain.value=0;padF.connect(padG);padG.connect(bus);padG.connect(verb);
  for(let i=0;i<8;i++){const o=ac.createOscillator();o.type="sawtooth";o.detune.value=i%2?9:-9;const g=ac.createGain();g.gain.value=.038;o.connect(g);g.connect(padF);o.start();pads.push(o)}
  nb=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1}
function noise(){const s=ac.createBufferSource();s.buffer=nb;s.loop=true;return s}
function send(n,wet){n.connect(bus);if(wet){const g=ac.createGain();g.gain.value=wet;n.connect(g);g.connect(verb)}}
function env(g,at,pk,a,d){g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(pk,at+a);g.gain.exponentialRampToValueAtTime(.0001,at+a+d)}
function snare(at,v){const n=noise(),f=ac.createBiquadFilter(),g=ac.createGain();f.type="highpass";f.frequency.value=1500;env(g,at,.26*v,.003,.14);n.connect(f);f.connect(g);send(g,.45);n.start(at);n.stop(at+.2)}
function hat(at,v){const n=noise(),f=ac.createBiquadFilter(),g=ac.createGain();f.type="highpass";f.frequency.value=7000;env(g,at,.08*v,.002,.05);n.connect(f);f.connect(g);send(g,.2);n.start(at);n.stop(at+.08)}
function drum(at,hz,v,d){const o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.setValueAtTime(hz*1.7,at);o.frequency.exponentialRampToValueAtTime(hz,at+.07);env(g,at,.8*v,.006,d);o.connect(g);send(g,.35);o.start(at);o.stop(at+d+.05)}
function cymbal(at,v){const n=noise(),f=ac.createBiquadFilter(),g=ac.createGain();f.type="highpass";f.frequency.value=5200;env(g,at,.2*v,.004,2.4);n.connect(f);f.connect(g);send(g,.6);n.start(at);n.stop(at+2.5)}
function brass(at,notes,v,dur){notes.forEach(m=>[-6,6].forEach(dt=>{const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type="sawtooth";o.frequency.value=mtof(m);o.detune.value=dt;
  f.type="lowpass";f.Q.value=2;f.frequency.setValueAtTime(300,at);f.frequency.exponentialRampToValueAtTime(2600,at+.09);f.frequency.exponentialRampToValueAtTime(900,at+dur);
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.05*v,at+.05);g.gain.setTargetAtTime(.0001,at+dur*.6,dur*.25);o.connect(f);f.connect(g);send(g,.5);o.start(at);o.stop(at+dur+.8)}))}
function pulse(at,m,v){const o=ac.createOscillator(),f=ac.createBiquadFilter(),g=ac.createGain();o.type="square";o.frequency.value=mtof(m);f.type="lowpass";f.frequency.setValueAtTime(1800,at);f.frequency.exponentialRampToValueAtTime(300,at+.2);env(g,at,.07*v,.004,.2);o.connect(f);f.connect(g);send(g,.35);o.start(at);o.stop(at+.26)}
// A telegraph key: a soft sine "dit" for the wire films.
function key(at,m,v,len){const o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.value=mtof(m);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(.05*v,at+.005);g.gain.setValueAtTime(.05*v,at+len);g.gain.exponentialRampToValueAtTime(.0001,at+len+.01);o.connect(g);send(g,.15);o.start(at);o.stop(at+len+.05)}
function pad(ch,l,cut,at){ch.forEach((m,i)=>{pads[i*2].frequency.setTargetAtTime(mtof(m),at,.1);pads[i*2+1].frequency.setTargetAtTime(mtof(m),at,.1)});padG.gain.setTargetAtTime(l,at,.7);padF.frequency.setTargetAtTime(cut,at,.6)}
// Minor for hardship and battle, major for the line that holds.
const SONG={title:{ch:[[40,52,55,59]],l:.5,c:500},tension:{ch:[[40,52,55,58],[40,51,55,58]],l:.55,c:700},
  build:{ch:[[40,52,55,59],[36,52,55,60],[43,55,59,62],[38,54,57,62]],l:.45,c:1100},drive:{ch:[[40,52,55,59],[36,52,55,60],[38,54,57,62],[35,51,54,59]],l:.45,c:1500},
  wire:{ch:[[40,52,55,59],[43,55,59,62],[36,52,55,60],[38,54,57,62]],l:.4,c:900},
  alarm:{ch:[[40,52,55,58]],l:.6,c:1800},march:{ch:[[40,52,55,59],[38,50,57,62],[36,52,55,60],[35,51,54,59]],l:.5,c:1300},
  battle:{ch:[[40,52,55,59],[36,52,55,60],[38,50,54,57],[35,51,54,59]],l:.6,c:2200},held:{ch:[[40,52,56,59]],l:.65,c:2600},
  elegy:{ch:[[40,52,55,59],[45,52,57,60],[36,52,55,60],[47,54,59,62]],l:.42,c:800},
  calm:{ch:[[40,52,56,59],[45,52,57,61],[42,54,57,61],[47,54,59,63]],l:.4,c:1200},resolve:{ch:[[40,52,56,59],[45,57,61,64],[47,59,63,66],[40,52,56,64]],l:.5,c:1600},end:{ch:[[40,52,56,59]],l:.45,c:1100}};
const STEP=60/100/4;let nextAt=0,stepN=0,lastPart="",at=0,playing=false;
// Morse for "SC" (Signal Corps): ... -.-.  as steps (1 = dit, 3 = dah)
const MORSE=[1,0,1,0,1,0,0,0,3,0,0,0,1,0,3,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0];
function enter(p,t){if(p==="alarm"){brass(t,[64,67,70,76],1,1.3);cymbal(t,1);drum(t,mtof(28),1,1.8)}
  if(p==="battle"){cymbal(t,.8);for(let i=0;i<12;i++)drum(t+i*.05,mtof(28),.3+i*.05,.3)}
  if(p==="held"){brass(t,[64,68,71,76],1.2,2.8);cymbal(t,1.2)}if(p==="resolve")brass(t,[52,56,59,64],.7,3);if(p==="end")drum(t,mtof(28),.6,2.4)}
function step(t,n){const p=S[at].part,Sg=SONG[p]||SONG.build,b=n%16,bar=Math.floor(n/16),ch=Sg.ch[bar%Sg.ch.length],r=ch[0];
  if(p!==lastPart){enter(p,t);lastPart=p;pad(ch,Sg.l,Sg.c,t)}if(b===0)pad(ch,Sg.l,Sg.c,t);let pat;
  switch(p){case"title":if(b===0)drum(t,mtof(28),.9,1.8);if(b===8)drum(t,mtof(35),.4,1.2);break;
   case"tension":if(b===0||b===10)drum(t,mtof(28),.8,1.4);if(n%4===2)pulse(t,r+24,.35);break;
   case"build":if(n%2===0)pulse(t,r+24+[0,7,12,7][(n/2)%4],.6);if(b%8===0)drum(t,mtof(28),.6,.5);if(b===4||b===12)snare(t,.25);break;
   case"wire":{const m=MORSE[n%32];if(m)key(t,r+36,.7,m*STEP*.9);if(b%8===0)drum(t,mtof(28),.5,.6);if(n%4===2)pulse(t,r+24,.25);break}
   case"drive":pulse(t,r+24+[0,7,12,15][n%4],.5);if(b%4===0)drum(t,mtof(28),.7,.4);if(b===4||b===12)snare(t,.4);if(n%2)hat(t,.8);break;
   case"alarm":snare(t,.2+.4*b/16);if(b%4===0)drum(t,mtof(28),.8,.6);break;
   case"march":pat="x.xxx.x.x.xxx.xx";if(pat[b]==="x")snare(t,b%4===0?.75:.4);if(b%8===0)drum(t,mtof(28),.8,.5);if(n%2===0)pulse(t,r+12,.35);break;
   case"battle":pat="x.xxx.xxx.xxx.xx";if(pat[b]==="x")snare(t,b%4===0?.9:.5);if(b%4===0)drum(t,mtof(28),.9,.45);
     if(b===0)brass(t,ch.slice(1).map(m=>m+12),1,.9);if(b===8)brass(t,ch.slice(1).map(m=>m+12),.7,.5);hat(t,.6);break;
   case"held":if(b===0)drum(t,mtof(28),1,1.6);if(b%4===0)snare(t,.25);break;
   case"elegy":if(b===0)drum(t,mtof(28),.35,2);if(n%8===0)pulse(t,r+24+[0,3,7,12][(n/8)%4],.25);break;
   case"calm":if(n%4===0)pulse(t,r+24+[0,4,7,11][(n/4)%4],.35);if(b===0)drum(t,mtof(28),.4,1.2);break;
   case"resolve":if(b===0)drum(t,mtof(28),.6,1.6);if(n%4===0)pulse(t,r+24+[0,7,12,16][(n/4)%4],.3);break;
   case"end":if(b===0&&bar%2===0)drum(t,mtof(28),.5,2);break}}
setInterval(()=>{if(!ac)return;const live=playing&&musicOn;bus.gain.setTargetAtTime(live?(talking?.3:.6):0,ac.currentTime,.25);
  if(!live){padG.gain.setTargetAtTime(0,ac.currentTime,.3);nextAt=0;lastPart="";return}
  if(nextAt<ac.currentTime)nextAt=ac.currentTime+.05;while(nextAt<ac.currentTime+.15){step(nextAt,stepN);nextAt+=STEP;stepN++}},30);

/* ---------- the player: each scene waits for its minimum time and for the narrator ---------- */
let timer=null,tok=0;
function go(i){at=Math.max(0,Math.min(S.length-1,i));draw(at);tok++;const my=tok;clearTimeout(timer);
  if(!playing){stopTalk();talking=false;return}
  const s=S[at];let waited=false,spoken=false;
  const fin=()=>{if(my!==tok||!playing||!waited||!spoken)return;if(at+1<S.length)go(at+1);else setPlaying(false)};
  const minMs=(voiceOn?s.min:Math.max(s.min,s.cap.replace(/<[^>]+>/g,"").split(/\s+/).length/2.6))*1000;
  timer=setTimeout(()=>{waited=true;fin()},minMs);
  talking=true;say(s.say,()=>{talking=false;setTimeout(()=>{spoken=true;fin()},700)},s.v||(at%2?"f":"m"))}
function setPlaying(on){playing=on;$("play").textContent=on?"❚❚ Pause":"▶ Play";
  if(on){initAudio();if(ac&&ac.state!=="running")ac.resume();if(at>=S.length-1)at=0;go(at)}
  else{tok++;clearTimeout(timer);stopTalk();talking=false}}
$("play").onclick=()=>setPlaying(!playing);
$("prev").onclick=()=>go(at-1);
$("next").onclick=()=>go(at+1);
$("stage").addEventListener("click",()=>{if(!playing)setPlaying(true)});
const dots=$("dots");S.forEach((s,i)=>{const d=document.createElement("i");d.title="Scene "+(i+1);d.onclick=()=>go(i);dots.appendChild(d)});
const musB=$("mus"),narB=$("nar");if(!AC)musB.style.display="none";if(!hasTTS)narB.style.display="none";
musB.onclick=()=>{musicOn=!musicOn;musB.setAttribute("aria-pressed",musicOn)};
narB.setAttribute("aria-pressed",voiceOn);
narB.onclick=()=>{voiceOn=!voiceOn;store.set("narr-on",voiceOn);narB.setAttribute("aria-pressed",voiceOn);if(!voiceOn)stopTalk();if(playing)go(at)};
// Stop when the visitor leaves: another tab, another museum room, or scrolled away.
document.addEventListener("visibilitychange",()=>{if(document.hidden&&playing)setPlaying(false)});
if("IntersectionObserver" in window)new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting&&playing)setPlaying(false)})}).observe($("stage"));
// Inside the museum page the room already gives the sources, so the notes are hidden there.
try{if(window.self!==window.top){document.querySelectorAll(".note").forEach(n=>n.style.display="none");document.querySelector(".wrap").style.padding="0 0 8px"}}catch(e){}
// #scene=N opens the story at scene N (1 = the title), paused
const sm=location.hash.match(/scene=(\d+)/);at=sm?Math.max(0,Math.min(S.length-1,+sm[1]-1)):0;draw(at);
})();
