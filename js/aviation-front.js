// ---- Aviation Annex: Western Front chapter ----
// Colour side views of five 1918 airplanes and the five-period map of France
// (review batch signal-aviation-wwi-2026-10).
(function(){
if (!document.getElementById("wf-map")) return;
/* ---------- Aircraft illustrations ---------- */
const PLANES = {
  jenny:   {nose:'car',    fus:'#e6d9b0', wing:'#efe4c2', trim:'#b9a878', seats:[150,186], up:[118,74,30], lo:[124,70,98], gear:112, label:'S.C. 4037'},
  nieuport:{nose:'rotary', fus:'#9aa38a', wing:'#b4bba4', trim:'#cfd3c8', seats:[168], up:[124,58,36], lo:[132,48,98], gear:120, ins:'ins-95', insX:212, insS:46, gun:'vickers'},
  spad:    {nose:'flat',   fus:'#8b7653', wing:'#9a8a63', trim:'#5f6b44', seats:[172], up:[118,60,34], lo:[122,58,98], gear:118, ins:'ins-94', insX:214, insS:44, gun:'vickers'},
  salmson: {nose:'radial', fus:'#8d8a63', wing:'#a39f78', trim:'#6f6c4a', seats:[150,196], up:[122,66,30], lo:[126,62,98], gear:114, ins:'ins-1', insX:228, insS:38, flag:true, gun:'lewis'},
  dh4:     {nose:'liberty',fus:'#6c6b45', wing:'#7c7a52', trim:'#4d4c31', seats:[140,226], up:[112,70,28], lo:[116,68,100], gear:108, deep:true, gun:'both', roundelSide:true}
};
function planeSVG(key){
  const p=PLANES[key], id='c'+key, n=28;
  const yt=p.deep?60:64, yb=p.deep?98:94;
  let s=`<svg viewBox="0 0 420 170" role="img" aria-label="Illustration of the ${key}">`;
  s+=`<ellipse cx="220" cy="156" rx="150" ry="5" fill="#000" opacity=".25"/>`;
  // tail plane
  s+=`<path d="M318 71 L374 70 L376 73 L318 75 Z" fill="${p.wing}"/>`;
  // fuselage
  s+=`<path d="M${n+20} ${yt} L250 ${yt} Q300 ${yt+2} 358 70 L358 77 Q300 ${yb-6} 250 ${yb} L${n+20} ${yb} Z" fill="${p.fus}" stroke="${p.trim}" stroke-width="1"/>`;
  s+=`<path d="M${n+60} ${(yt+yb)/2} L330 74" stroke="${p.trim}" stroke-width=".8" opacity=".6"/>`;
  // fin & rudder
  s+=`<clipPath id="${id}r"><path d="M358 44 Q384 42 390 56 L390 84 L358 84 Z"/></clipPath>`;
  s+=`<path d="M334 70 Q344 50 358 46 L358 72 Z" fill="${p.fus}" stroke="${p.trim}" stroke-width="1"/>`;
  s+=`<g clip-path="url(#${id}r)"><rect x="358" y="40" width="11" height="48" fill="#c8202f"/><rect x="369" y="40" width="10" height="48" fill="#ffffff"/><rect x="379" y="40" width="12" height="48" fill="#1f3a8a"/></g>`;
  s+=`<path d="M358 44 Q384 42 390 56 L390 84 L358 84 Z" fill="none" stroke="#222" stroke-width=".8"/>`;
  s+=`<path d="M350 78 L360 92" stroke="#333" stroke-width="2"/>`;
  // nose
  const m=(yt+yb)/2;
  if(p.nose==='car'){s+=`<rect x="${n+4}" y="${yt-4}" width="18" height="${yb-yt+8}" rx="2" fill="#5a5a52"/>`;for(let y=yt;y<yb+4;y+=5)s+=`<path d="M${n+6} ${y} h14" stroke="#7d7d73"/>`;}
  if(p.nose==='rotary'){s+=`<path d="M${n+24} ${yt-1} Q${n} ${yt} ${n+2} ${m} Q${n} ${yb} ${n+24} ${yb+1} Z" fill="#c9ccc4" stroke="#8a8d85"/>`;}
  if(p.nose==='flat'){s+=`<path d="M${n+24} ${yt} L${n+8} ${yt+1} Q${n+4} ${m} ${n+8} ${yb-1} L${n+24} ${yb} Z" fill="#b8b29a"/><rect x="${n+4}" y="${yt+2}" width="5" height="${yb-yt-4}" rx="2" fill="#4a4a44"/>`;}
  if(p.nose==='radial'){s+=`<path d="M${n+26} ${yt-6} Q${n+2} ${yt-6} ${n+2} ${m} Q${n+2} ${yb+6} ${n+26} ${yb+6} Z" fill="#7a786a" stroke="#55534a"/>`;for(let i=0;i<5;i++)s+=`<circle cx="${n+10}" cy="${yt-1+i*8.5}" r="3" fill="#5b594f"/>`;}
  if(p.nose==='liberty'){s+=`<rect x="${n}" y="${yt-3}" width="12" height="${yb-yt+6}" rx="2" fill="#444438"/><path d="M${n+12} ${yt} L${n+22} ${yt} L${n+22} ${yb} L${n+12} ${yb} Z" fill="${p.trim}"/>`;for(let y=yt;y<yb+2;y+=5)s+=`<path d="M${n+2} ${y} h8" stroke="#66665a"/>`;}
  // propeller
  s+=`<ellipse cx="${n-2}" cy="${m}" rx="3.2" ry="38" fill="#8a5a2b" opacity=".9"/><ellipse cx="${n-1}" cy="${m}" rx="4" ry="5" fill="#555"/>`;
  // guns
  if(p.gun==='vickers'||p.gun==='both')s+=`<rect x="${n+28}" y="${yt-6}" width="40" height="5" rx="1.5" fill="#2b2b2b"/>`;
  // lower wing
  const [lx,lc,ly]=p.lo, [ux,uc,uy]=p.up;
  const wing=(x,c,y)=>`<path d="M${x} ${y+3} Q${x} ${y} ${x+7} ${y} L${x+c} ${y+1.5} L${x+c} ${y+3.5} L${x+7} ${y+6} Q${x} ${y+6} ${x} ${y+3} Z" fill="${p.wing}" stroke="${p.trim}" stroke-width=".8"/>`;
  // gear
  s+=`<path d="M${p.gear-12} ${yb} L${p.gear} 136 L${p.gear+14} ${yb}" fill="none" stroke="#333" stroke-width="2.5"/>`;
  s+=`<circle cx="${p.gear}" cy="138" r="15" fill="#2a2a2a"/><circle cx="${p.gear}" cy="138" r="5" fill="#9a9a90"/>`;
  s+=wing(lx,lc,ly);
  // insignia & labels
  if(p.ins){const h=p.flag?p.insS*0.66:p.insS; s+=`<use href="#${p.ins}" x="${p.insX}" y="${m-h/2}" width="${p.insS}" height="${h}"/>`;}
  if(p.roundelSide)s+=`<use href="#roundel" x="248" y="${m-14}" width="28" height="28"/>`;
  if(p.label)s+=`<text x="232" y="${m+5}" font-family="IBM Plex Mono,monospace" font-size="13" fill="#3b3524">${p.label}</text>`;
  // cockpits & crew
  p.seats.forEach((x,i)=>{s+=`<path d="M${x-12} ${yt} Q${x} ${yt+7} ${x+12} ${yt} Z" fill="#2a2418"/><circle cx="${x}" cy="${yt-4}" r="6" fill="#5b3a22"/><rect x="${x-6}" y="${yt-6}" width="7" height="3" rx="1.5" fill="#cfd8dc"/>`;});
  if(p.gun==='lewis'||p.gun==='both'){const x=p.seats[1];s+=`<path d="M${x+4} ${yt-6} L${x+30} ${yt-16}" stroke="#2b2b2b" stroke-width="3"/><circle cx="${x+14}" cy="${yt-13}" r="5" fill="#2b2b2b"/>`;}
  // struts & rigging
  const f1=0.25,f2=0.78;
  s+=`<g stroke="#4b4636" stroke-width="2.2"><path d="M${ux+uc*f1} ${uy+5} L${lx+lc*f1} ${ly+1}"/><path d="M${ux+uc*f2} ${uy+5} L${lx+lc*f2} ${ly+1}"/></g>`;
  s+=`<g stroke="#4b4636" stroke-width="1.6"><path d="M${ux+uc*0.35} ${uy+5} L${ux+uc*0.3} ${yt}"/><path d="M${ux+uc*0.6} ${uy+5} L${ux+uc*0.62} ${yt}"/></g>`;
  s+=`<g stroke="#5a5546" stroke-width=".7" opacity=".8"><path d="M${ux+uc*f1} ${uy+5} L${lx+lc*f2} ${ly+1}"/><path d="M${ux+uc*f2} ${uy+5} L${lx+lc*f1} ${ly+1}"/></g>`;
  s+=wing(ux,uc,uy);
  s+=`</svg>`;
  return s;
}
document.querySelectorAll('#av-front [data-plane]').forEach(el=>el.innerHTML=planeSVG(el.dataset.plane));

/* ---------- Map ---------- */
const W=900,H=760, X=lon=>(lon-1.0)*0.665*199, Y=lat=>(50.4-lat)*199;
const P=(lat,lon)=>[X(lon),Y(lat)];
const pts=a=>a.map(([la,lo])=>P(la,lo).map(v=>v.toFixed(1)).join(',')).join(' ');
const FRANCE=[[51.05,2.4],[50.95,1.85],[50.72,1.6],[50.2,1.55],[49.92,1.05],[49.7,0.2],[49.48,0.1],[49.35,-0.2],[49.32,-1.1],[49.65,-1.3],[49.65,-1.9],[49.2,-1.6],[48.65,-1.55],[48.65,-2.1],[48.85,-3.0],[48.65,-4.0],[48.5,-4.75],[48.0,-4.6],[47.8,-4.1],[47.7,-3.3],[47.3,-2.5],[47.1,-2.1],[46.7,-1.85],[46.3,-1.3],[45.8,-1.2],[45.4,-1.15],[45.0,-1.2]];
const FRANCE_E=[[45.0,6.75],[45.5,6.95],[45.9,6.85],[46.15,6.15],[46.45,6.15],[46.95,6.6],[47.3,7.0],[47.5,7.1],[47.7,7.05],[48.1,7.05],[48.5,7.12],[48.75,6.95],[48.95,6.2],[49.2,6.1],[49.47,6.05],[49.52,5.8],[49.75,5.3],[49.9,4.85],[50.15,4.2],[50.3,3.6],[50.5,3.3],[50.75,3.1],[50.8,2.65],[51.05,2.4]];
const GERMAN_AL=[[47.5,7.1],[47.6,7.6],[48.0,7.6],[48.6,7.8],[48.97,8.2],[49.2,7.4],[49.15,6.75],[49.4,6.6],[49.47,6.05],[49.2,6.1],[48.95,6.2],[48.75,6.95],[48.5,7.12],[48.1,7.05],[47.7,7.05]];
const FRONT_SEPT=[[51.15,2.75],[50.85,2.95],[50.6,2.85],[50.3,2.9],[50.0,3.1],[49.85,3.3],[49.6,3.4],[49.42,3.5],[49.35,3.8],[49.27,4.05],[49.2,4.5],[49.18,4.95],[49.22,5.35],[49.12,5.55],[49.0,5.6],[48.89,5.52],[48.86,5.72],[48.88,5.9],[48.9,6.05],[48.75,6.4],[48.55,6.9],[48.2,7.05],[47.75,7.1],[47.5,7.15]];
const FRONT_JULY=[[49.6,3.1],[49.38,3.18],[49.2,3.22],[49.05,3.38],[49.07,3.65],[49.13,3.9],[49.25,4.03]];
const FRONT_NOV=[[49.18,4.75],[49.4,4.85],[49.6,4.9],[49.68,5.0],[49.55,5.2],[49.4,5.35],[49.28,5.45]];
const PL={
  havre:{n:'Le Havre',ll:[49.49,0.11],t:'city'}, paris:{n:'Paris',ll:[48.857,2.352],t:'city'},
  issoudun:{n:'Issoudun (3rd AIC)',ll:[47.03,1.83],t:'base'}, clermont:{n:'Clermont-Ferrand',ll:[45.78,3.08],t:'base'},
  chaumont:{n:'Chaumont (GHQ)',ll:[48.11,5.14],t:'base'}, colombey:{n:'Colombey-les-Belles',ll:[48.53,5.9],t:'base'},
  amanty:{n:'Amanty',ll:[48.51,5.62],t:'base'}, ourches:{n:'Ourches',ll:[48.66,5.69],t:'base'}, toul:{n:'Toul (Gengoult)',ll:[48.68,5.9],t:'base'},
  touquin:{n:'Touquin',ll:[48.73,3.01],t:'base'}, saints:{n:'Saints',ll:[48.76,3.05],t:'base'},
  rembercourt:{n:'Rembercourt',ll:[48.87,5.16],t:'base'}, remicourt:{n:'Remicourt',ll:[48.97,4.93],t:'base'}, maulan:{n:'Maulan',ll:[48.66,5.27],t:'base'},
  verdun:{n:'Verdun',ll:[49.16,5.38],t:'city'}, sedan:{n:'Sedan',ll:[49.70,4.94],t:'city'}, metz:{n:'Metz',ll:[49.12,6.18],t:'city'}, ct:{n:'Château-Thierry',ll:[49.046,3.403],t:'city'},
  stm:{n:'St-Mihiel',ll:[48.89,5.54],t:'city'}, dommary:{n:'Dommary-Baroncourt',ll:[49.28,5.69],t:'target'}, conflans:{n:'Conflans',ll:[49.17,5.86],t:'target'}
};
const PHASES={
  train:{dates:'June 1917 – November 1918',title:'Training fields and the rear',
    body:'Squadrons organized in the United States crossed to France and finished their training there. The 1st Aero Squadron landed at Le Havre in September 1917 and moved to Issoudun in October. The 3rd Aviation Instruction Center at Issoudun, opened June 21, 1917, became the largest American flying school in Europe, with more than 8,000 men. The 96th trained at Clermont-Ferrand; new airplanes came forward through the First Air Depot at Colombey-les-Belles, near Pershing\'s headquarters at Chaumont.',
    bases:['issoudun','chaumont','colombey','amanty','paris'],
    routes:[['paris','issoudun','train'],['issoudun','amanty','train'],['paris','chaumont','train'],['colombey','toul','train']],front:[]},
  toul:{dates:'April – June 1918',title:'The Toul sector',
    body:'The first American squadrons went to the front in a quiet sector near Toul. The 94th moved to Gengoult Aerodrome on April 7 and scored the first victories on April 14. The 1st Aero Squadron flew observation from Ourches from April 11, and on June 12 the 96th flew the first American daylight bombing raid from Amanty against the rail yards at Dommary-Baroncourt.',
    bases:['toul','ourches','amanty','colombey'],
    routes:[['toul',[48.92,5.82],'pur'],['ourches',[48.98,5.62],'obs'],['amanty','dommary','bom']],front:['sept']},
  marne:{dates:'Late June – August 1918',title:'Château-Thierry and the Marne',
    body:'When the German drive on Paris reached the Marne, the 1st Pursuit Group moved west to Touquin on June 28 and to Saints on July 9, and the 1st and 12th Aero Squadrons flew observation from Saints. Over the Marne the squadrons met concentrations of the best German fighter units for the first time.',
    bases:['touquin','saints','paris'],
    routes:[['saints',[49.2,3.5],'pur'],['touquin',[49.12,3.35],'pur'],['saints',[49.1,3.62],'obs']],front:['july']},
  mihiel:{dates:'12 – 16 September 1918',title:'St. Mihiel',
    body:'For the First Army\'s first offensive, Col. Billy Mitchell commanded the largest gathering of Allied air power of the war, with pursuit, observation and bombing squadrons from airfields around Toul, Ourches, Amanty and Rembercourt. Observers photographed and watched the salient while fighters patrolled ahead and bombers struck roads and rail centers behind it. By September 16 the salient was gone.',
    bases:['rembercourt','toul','ourches','amanty'],
    routes:[['rembercourt',[48.97,5.6],'pur'],['toul',[48.96,5.86],'obs'],['ourches',[48.93,5.7],'obs'],['amanty','conflans','bom']],front:['sept']},
  argonne:{dates:'26 September – 11 November 1918',title:'Meuse-Argonne',
    body:'The air units moved north and west to support the final offensive between the Argonne Forest and the Meuse. The 1st Pursuit Group flew from Rembercourt, the I Corps Observation Group (1st, 12th and 50th Aero) from Remicourt, and the 96th bombed from Maulan. In October a DH-4 crew of the 50th Aero, Lts. Harold Goettler and Erwin Bleckley, were killed on a mission to find and resupply the “Lost Battalion,” and both received the Medal of Honor.',
    bases:['rembercourt','remicourt','maulan','verdun'],
    routes:[['rembercourt',[49.33,5.08],'pur'],['remicourt',[49.28,4.9],'obs'],['maulan','conflans','bom']],front:['nov']}
};
const SVGNS='http://www.w3.org/2000/svg';
const map=document.getElementById('wf-map');
function el(t,a,parent){const e=document.createElementNS(SVGNS,t);for(const k in a)e.setAttribute(k,a[k]);(parent||map).appendChild(e);return e}
function drawBase(){
  el('rect',{width:W,height:H,fill:'#c9d8dc'});
  el('rect',{width:W,height:H,fill:'#e6e8de'});
  const FOREIGN=[[46.0,6.4],[46.6,6.4],[46.95,6.6],[47.3,7.0],[47.5,7.1]].concat(FRANCE_E.slice(7)).concat([[51.5,2.4],[51.5,8.5],[46.0,8.5]]);
  el('polygon',{points:pts(FOREIGN),fill:'#d3d0c4',stroke:'#7c8478','stroke-width':1.4});
  el('polygon',{points:pts([[50.4,0.5],[50.4,1.58],[50.72,1.6],[50.95,1.85],[51.05,2.4],[51.5,2.4],[51.5,0.5]]),fill:'#c9d8dc'});
  // neighbours
  [['BELGIUM',[50.25,4.3]],['GERMANY',[49.75,7.2]],['ALSACE-LORRAINE',[48.3,7.45]],['(German 1871–1918)',[48.18,7.45]],['SWITZERLAND',[46.85,7.35]],['FRANCE',[47.6,3.4]]].forEach(([t,ll])=>{const [x,y]=P(...ll);el('text',{x,y,'text-anchor':'middle','font-family':'IBM Plex Mono,monospace','font-size':t==='FRANCE'?22:12,'letter-spacing':'2','fill':'#7a8277',opacity:.9}).textContent=t;});
  const g=el('g',{id:'wf-fronts'});
  el('polyline',{points:pts(FRONT_SEPT),fill:'none',stroke:'#b02a2a','stroke-width':3,'stroke-linejoin':'round',id:'wf-f-sept'},g);
  el('polyline',{points:pts(FRONT_JULY),fill:'none',stroke:'#b02a2a','stroke-width':3,'stroke-dasharray':'7 5',id:'wf-f-july'},g);
  el('polyline',{points:pts(FRONT_NOV),fill:'none',stroke:'#b02a2a','stroke-width':3,'stroke-dasharray':'7 5',id:'wf-f-nov'},g);
  el('g',{id:'wf-routes'}); el('g',{id:'wf-places'}); el('g',{id:'wf-flyers'});
}
drawBase();
const COL={pur:'#e0782b',obs:'#2f8f9d',bom:'#c0392b',train:'#7a6fb0'};
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let anim=null;
function ll(v){return typeof v==='string'?PL[v].ll:v}
function render(key){
  const ph=PHASES[key];
  document.getElementById('wf-dates').textContent=ph.dates;
  document.getElementById('wf-title').textContent=ph.title;
  document.getElementById('wf-body').textContent=ph.body;
  document.querySelectorAll('#av-front .phases button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.phase===key));
  ['sept','july','nov'].forEach(f=>{const e=document.getElementById('wf-f-'+f);const on=ph.front.includes(f)||(f==='sept'&&key!=='train');e.setAttribute('opacity',on?(f==='sept'&&!ph.front.includes('sept')?.45:1):0);});
  const R=document.getElementById('wf-routes'),Pg=document.getElementById('wf-places'),F=document.getElementById('wf-flyers');
  R.innerHTML='';Pg.innerHTML='';F.innerHTML='';
  const paths=[];
  ph.routes.forEach(([a,b,t])=>{const [x1,y1]=P(...ll(a)),[x2,y2]=P(...ll(b));const mx=(x1+x2)/2,my=(y1+y2)/2,dx=x2-x1,dy=y2-y1;const cx=mx-dy*0.18,cy=my+dx*0.18;
    const p=el('path',{d:`M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`,fill:'none',stroke:COL[t],'stroke-width':3,'stroke-dasharray':'8 6','stroke-linecap':'round'},R);
    el('circle',{cx:x2,cy:y2,r:4,fill:COL[t]},R); paths.push([p,COL[t]]);});
  Object.entries(PL).forEach(([k,v])=>{const hi=ph.bases.includes(k);const isTgt=v.t==='target';const showT=isTgt&&ph.routes.some(r=>r[1]===k);
    if(!hi&&v.t==='base')return; if(isTgt&&!showT)return;
    const [x,y]=P(...v.ll);
    if(v.t==='base')el('circle',{cx:x,cy:y,r:7,fill:'#f08a3c',stroke:'#0d1f16','stroke-width':2},Pg);
    else if(isTgt)el('path',{d:`M${x-6} ${y-6} L${x+6} ${y+6} M${x+6} ${y-6} L${x-6} ${y+6}`,stroke:'#8a1c1c','stroke-width':3},Pg);
    else el('circle',{cx:x,cy:y,r:3.5,fill:'#3a4a40'},Pg);
    const left=['toul','colombey','metz','conflans'].includes(k);const below=['amanty','maulan','saints','remicourt'].includes(k);
    const t=el('text',{x:left?x+11:x-11,y:below?y+18:y-9,'text-anchor':left?'start':'end','font-family':'Source Sans 3,sans-serif','font-size':v.t==='base'?15:13,'font-weight':v.t==='base'?700:400,fill:'#18201b',stroke:'#e6e8de','stroke-width':4,'paint-order':'stroke'},Pg);t.textContent=v.n;});
  if(anim)cancelAnimationFrame(anim);
  if(reduce)return;
  const flyers=paths.map(([p,c])=>[p,el('path',{d:'M-9 0 L7 0 L9 -3 L11 0 L9 3 Z M-2 -8 L1 -8 L1 8 L-2 8 Z',fill:c,stroke:'#0d1f16','stroke-width':1},F)]);
  const t0=performance.now();
  const step=now=>{const t=((now-t0)/3200)%1;if(!map.getClientRects().length){anim=requestAnimationFrame(step);return;} // room not on screen
    flyers.forEach(([p,f],i)=>{const L=p.getTotalLength();if(!L)return;const u=(t+i*0.17)%1;const a=p.getPointAtLength(u*L),b=p.getPointAtLength(Math.min(L,u*L+1));const ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;f.setAttribute('transform',`translate(${a.x} ${a.y}) rotate(${ang})`);});anim=requestAnimationFrame(step)};
  anim=requestAnimationFrame(step);
}
document.querySelectorAll('#av-front .phases button').forEach(b=>b.addEventListener('click',()=>{render(b.dataset.phase);try{localStorage.setItem('wf-phase',b.dataset.phase)}catch(e){}}));
let start='toul';try{start=localStorage.getItem('wf-phase')||'toul'}catch(e){}
render(PHASES[start]?start:'toul');
})();
