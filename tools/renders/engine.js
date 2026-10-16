// Museum room renderer: builds a gallery in the vocabulary of the architect's
// renderings (brick, dark timber beams, white walls with brick-red trim, wood
// floors, green-marble cases, track lights) and hangs a room's own pictures in it.
/* global THREE, ROOMS */
const ASSET = new URL('../../', location.href).href; // the repo root
const OUT_W = 1600, OUT_H = 900, SS = 2;
const SHOW_PEOPLE = false; // the owner asked for rooms without figures (review, 16 Oct 2026)
const GLOWS = []; // light sources to bloom in post: [position, strength]

function rng(seed){ let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const R = rng(7);

// ---------- procedural textures ----------
function canvasTex(w, h, draw, rep){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
  if (rep){ t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return t;
}
function woodTex(base, rep){
  return canvasTex(1024, 1024, (g, w, h) => {
    const rows = 16, ph = h / rows;
    for (let r = 0; r < rows; r++){
      let x = -R() * 600;
      while (x < w){
        const len = 380 + R() * 520, v = (R() - 0.5) * 0.22;
        const c = base.map(k => Math.max(0, Math.min(255, k * (1 + v))));
        g.fillStyle = `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`; g.fillRect(x, r * ph, len, ph);
        for (let i = 0; i < 14; i++){
          g.strokeStyle = `rgba(40,20,5,${0.05 + R() * 0.09})`; g.lineWidth = 1 + R() * 2;
          const y = r * ph + R() * ph; g.beginPath(); g.moveTo(x, y);
          g.bezierCurveTo(x + len * .3, y + (R() - .5) * 8, x + len * .7, y + (R() - .5) * 8, x + len, y + (R() - .5) * 6); g.stroke();
        }
        g.fillStyle = 'rgba(20,10,0,.55)'; g.fillRect(x, r * ph, 2, ph);
        x += len;
      }
      g.fillStyle = 'rgba(20,10,0,.6)'; g.fillRect(0, r * ph, w, 2);
    }
  }, rep);
}
function brickTex(rep){
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#b9ab98'; g.fillRect(0, 0, w, h);
    const bh = 32, bw = 96;
    for (let r = 0; r < h / bh; r++){
      for (let x = (r % 2) * -bw / 2; x < w; x += bw){
        const v = R(); g.fillStyle = `rgb(${150 + v * 50 | 0},${58 + v * 22 | 0},${38 + v * 14 | 0})`;
        g.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6);
        g.fillStyle = `rgba(0,0,0,${R() * .12})`; g.fillRect(x + 3 + R() * 40, r * bh + 3, 30, bh - 6);
      }
    }
  }, rep);
}
function marbleTex(){
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#4e8a74'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++){
      g.strokeStyle = `rgba(${R() < .5 ? '230,245,235' : '20,50,40'},${.08 + R() * .15})`; g.lineWidth = .5 + R() * 2;
      g.beginPath(); let x = R() * w, y = R() * h; g.moveTo(x, y);
      for (let k = 0; k < 6; k++){ x += (R() - .5) * 90; y += (R() - .3) * 60; g.lineTo(x, y); } g.stroke();
    }
  });
}
function plasterTex(col){
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++){ g.fillStyle = `rgba(0,0,0,${R() * .025})`; g.fillRect(R() * w, R() * h, 2, 2); }
  }, [4, 2]);
}
function carpetTex(col, rep){
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = col; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++){ g.fillStyle = `rgba(${R() < .5 ? '0,0,0' : '255,255,255'},${R() * .05})`; g.fillRect(R() * w, R() * h, 1.5, 1.5); }
  }, rep);
}
function skyTex(){
  return canvasTex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#5f97d6'); gr.addColorStop(.6, '#cfe3f4'); gr.addColorStop(1, '#e8eef0');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 18; i++){ g.fillStyle = 'rgba(255,255,255,.55)'; const x = R() * w, y = R() * h * .45; for (let k = 0; k < 6; k++){ g.beginPath(); g.arc(x + k * 18, y + (R() - .5) * 10, 14 + R() * 16, 0, 7); g.fill(); } }
    for (let x = 0; x < w; x += 6){ const th = 120 + Math.sin(x * .02) * 40 + R() * 50; g.fillStyle = `rgb(${40 + R() * 20 | 0},${80 + R() * 30 | 0},${45 + R() * 15 | 0})`; g.beginPath(); g.ellipse(x, h - th * .55, 14 + R() * 10, th * .55, 0, 0, 7); g.fill(); }
    g.fillStyle = '#5d7a4c'; g.fillRect(0, h - 70, w, 70);
  });
}
function textTex(lines, o){
  o = Object.assign({ w: 1024, h: 256, bg: '#1d1d1f', fg: '#f3efe6', font: 'Georgia, "Times New Roman", serif', size: 110, weight: '600', track: 6, border: null }, o);
  return canvasTex(o.w, o.h, (g, w, h) => {
    if (o.bg){ g.fillStyle = o.bg; g.fillRect(0, 0, w, h); }
    if (o.border){ g.strokeStyle = o.border; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); }
    g.fillStyle = o.fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    const n = lines.length;
    lines.forEach((ln, i) => {
      const sz = (i === 0 ? o.size : o.size * (o.sub || .45));
      g.font = `${i === 0 ? o.weight : '400'} ${sz}px ${o.font}`;
      if ('letterSpacing' in g) g.letterSpacing = (i === 0 ? o.track : 2) + 'px';
      let s = sz; while (g.measureText(ln).width > w * .9 && s > 10){ s -= 4; g.font = `${i === 0 ? o.weight : '400'} ${s}px ${o.font}`; }
      const y = n === 1 ? h / 2 : n === 2 ? h * (i === 0 ? .4 : .72) : h * (.5 + (i - (n - 1) / 2) * .2);
      g.fillText(ln, w / 2, y);
    });
  });
}

// ---------- scene kit ----------
let scene, camera, renderer, W, D, H;
const hot = [], pending = [];
const M = {};
function std(o){ return new THREE.MeshStandardMaterial(o); }
function box(w, h, d, mat, x, y, z, ry){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); if (ry) m.rotation.y = ry; m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
function cyl(rt, rb, h, mat, x, y, z, seg){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 24), mat);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}
function group(x, y, z, ry){ const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry || 0; scene.add(g); return g; }
function addTo(g, mesh){ scene.remove(mesh); g.add(mesh); return mesh; }

// a wall position helper: wall = 'back' | 'left' | 'right', u = along-wall offset from wall centre
function wallPose(wall, u, inset){
  inset = inset || 0.06;
  if (wall === 'back') return { x: u, z: -D / 2 + inset, ry: 0 };
  if (wall === 'left') return { x: -W / 2 + inset, z: u, ry: Math.PI / 2 };
  if (wall === 'right') return { x: W / 2 - inset, z: u, ry: -Math.PI / 2 };
  return wall; // explicit {x,z,ry}
}
function sign(text, wall, u, y, o){
  o = o || {};
  const p = wallPose(wall, u, 0.05);
  const w = o.w || 3.2, h = o.h || w / 4;
  const to = Object.assign({}, o); delete to.w; delete to.h; to.w = 1024; to.h = Math.round(1024 * h / w);
  const t = textTex(Array.isArray(text) ? text : [text], to);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), std({ map: t, roughness: .5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .12, transparent: o.bg === null }));
  m.position.set(p.x, y, p.z); m.rotation.y = p.ry; scene.add(m); return m;
}
// hang a picture: returns after the texture loads
function picture(src, wall, u, y, h, o){
  o = o || {};
  const p = wallPose(wall, u, o.inset || 0.07);
  pending.push(new Promise(res => {
    new THREE.TextureLoader().load(ASSET + src, t => {
      t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
      const ar = t.image.width / t.image.height; let hh = h, ww = h * ar;
      if (o.maxW && ww > o.maxW){ ww = o.maxW; hh = ww / ar; }
      const g = group(p.x, y, p.z, p.ry);
      const fr = o.frame === undefined ? 0.07 : o.frame;
      if (fr){
        const fm = new THREE.Mesh(new THREE.BoxGeometry(ww + fr * 2, hh + fr * 2, .05), o.frameMat || M.frame); fm.castShadow = true; g.add(fm);
        if (o.mat !== false){ const mt = new THREE.Mesh(new THREE.PlaneGeometry(ww + fr * .9, hh + fr * .9), M.matboard); mt.position.z = .027; g.add(mt); }
      }
      const im = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), std({ map: t, roughness: .55, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: o.glow || .28 }));
      im.position.z = .03; g.add(im);
      if (o.label){
        const lt = textTex([o.label], { w: 512, h: 96, bg: '#f4f1ea', fg: '#222', size: 40, weight: '400', track: 1 });
        const lb = new THREE.Mesh(new THREE.PlaneGeometry(.42, .08), std({ map: lt })); lb.position.set(ww / 2 + fr + .3, -hh / 2 + .1, .01); g.add(lb);
      }
      if (o.spot !== false) spotOn(g, hh);
      hot.push({ mesh: im, w: ww, h: hh, src, label: o.alt || '' });
      res();
    }, undefined, () => { console.error('missing ' + src); res(); });
  }));
}
function spotOn(g, hh){
  const wp = new THREE.Vector3(); g.getWorldPosition(wp);
  const n = new THREE.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
  const sp = new THREE.SpotLight(0xffe2b8, 3.2, 9, .42, .55, 1.4);
  sp.position.copy(wp).addScaledVector(n, 1.7); sp.position.y = H - .25;
  sp.target.position.copy(wp); scene.add(sp, sp.target);
  // track-light can
  const can = cyl(.06, .08, .22, M.black, sp.position.x, sp.position.y - .05, sp.position.z, 12); can.castShadow = false;
  can.lookAt(wp); can.rotateX(Math.PI / 2);
  GLOWS.push([new THREE.Vector3().copy(sp.position).lerp(wp, .045), .55]);
}
function caseOn(x, z, o){
  o = o || {};
  const w = o.w || .9, d = o.d || .9, h = o.h || 1.0, gh = o.gh || .55;
  blob(x, z, w * .8, d * .8, .7);
  box(w, h, d, M.marble, x, h / 2, z);
  box(w + .04, .04, d + .04, M.black, x, h + .02, z);
  const gl = box(w - .04, gh, d - .04, M.glass, x, h + .04 + gh / 2, z); gl.castShadow = false;
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => box(.02, gh, .02, M.black, x + a * (w / 2 - .03), h + .04 + gh / 2, z + b * (d / 2 - .03)).castShadow = false);
  box(w - .02, .02, d - .02, M.black, x, h + .05 + gh, z).castShadow = false;
  if (o.item) o.item(x, h + .04, z);
  const pl = new THREE.PointLight(0xfff0d0, .5, 1.6); pl.position.set(x, h + gh, z); scene.add(pl);
}
function person(x, z, ry, o){
  if (!SHOW_PEOPLE) return new THREE.Group();
  o = o || {};
  const top = std({ color: o.top || 0x2a2d33, roughness: .8 }), leg = std({ color: o.leg || 0x1d2027, roughness: .8 }), skin = std({ color: o.skin || 0xb98563, roughness: .7 });
  blob(x, z, .38, .3, .6);
  const g = group(x, 0, z, ry); const s = o.s || 1;
  const L = (dx) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.065 * s, .055 * s, .86 * s, 10), leg); m.position.set(dx * s, .43 * s, 0); m.castShadow = true; g.add(m); };
  L(-.09); L(.09);
  [-.09, .09].forEach(dx => { const sh = new THREE.Mesh(new THREE.BoxGeometry(.1 * s, .07 * s, .24 * s), M.black); sh.position.set(dx * s, .035 * s, .05 * s); g.add(sh); });
  if (o.skirt){ const sk = new THREE.Mesh(new THREE.CylinderGeometry(.17 * s, .25 * s, .5 * s, 16), top); sk.position.y = .72 * s; sk.scale.z = .7; sk.castShadow = true; g.add(sk); }
  const t = new THREE.Mesh(new THREE.CylinderGeometry(.2 * s, .15 * s, .62 * s, 14), top); t.position.y = 1.17 * s; t.scale.z = .62; t.castShadow = true; g.add(t);
  [-1, 1].forEach(k => { const a = new THREE.Mesh(new THREE.CylinderGeometry(.045 * s, .04 * s, .6 * s, 8), top); a.position.set(k * .23 * s, 1.15 * s, 0); a.rotation.z = k * .06; a.castShadow = true; g.add(a); });
  const nk = new THREE.Mesh(new THREE.CylinderGeometry(.05 * s, .05 * s, .1 * s, 8), skin); nk.position.y = 1.52 * s; g.add(nk);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(.11 * s, 16, 12), skin); hd.position.y = 1.64 * s; hd.scale.y = 1.15; hd.castShadow = true; g.add(hd);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(.115 * s, 16, 12, 0, 7, 0, 1.4), std({ color: o.hair || 0x241a12 })); hair.position.y = 1.66 * s; hair.scale.y = 1.15; g.add(hair);
  return g;
}
function blob(x, z, rx, rz, a){
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 32), new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, opacity: a || .55, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.scale.set(rx, rz, 1); m.position.set(x, .004, z); scene.add(m); return m;
}
let BLOB;
function bench(x, z, ry){
  const g = group(x, 0, z, ry);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, .08, .5), M.timber); seat.position.y = .45; seat.castShadow = true; g.add(seat);
  [-.75, .75].forEach(k => { const l = new THREE.Mesh(new THREE.BoxGeometry(.08, .45, .45), M.black); l.position.set(k, .22, 0); g.add(l); });
}
function panelWall(x, z, ry, w, h, mat){ return box(w, h, .25, mat || M.wall, x, h / 2, z, ry); }

// ---------- room shell ----------
function shell(cfg){
  W = cfg.W || 20; D = cfg.D || 16; H = cfg.H || 5;
  M.frame = std({ color: 0x2b2118, roughness: .5, metalness: .2 });
  M.matboard = std({ color: 0xf3efe6, roughness: .9 });
  M.black = std({ color: 0x18191b, roughness: .5, metalness: .3 });
  M.timber = std({ color: 0x2e140b, roughness: .55, envMapIntensity: .4 });
  M.trim = std({ color: 0x7a2f22, roughness: .6 });
  M.marble = std({ map: marbleTex(), roughness: .25, metalness: .05 });
  M.glass = std({ color: 0xdfeff2, transparent: true, opacity: .14, roughness: .02, metalness: .2, envMapIntensity: 2.5, depthWrite: false });
  M.wall = std({ map: plasterTex(cfg.wallColor || "#ebe7df"), roughness: .95, envMapIntensity: .6 });
  M.dark = std({ color: 0x24262a, roughness: .7 });
  M.brick = std({ map: brickTex([W / 3, H / 1.2]), roughness: .9 });
  M.brickSide = std({ map: brickTex([D / 3, H / 1.2]), roughness: .9 });
  const floorMat = cfg.floor === "concrete" ? std({ map: carpetTex("#5a5d62", [W / 4, D / 4]), color: 0x8a8a8a, roughness: .55, metalness: .05, envMapIntensity: .25 })
    : cfg.floor === 'carpet' ? std({ map: carpetTex(cfg.carpet || '#6b1f24', [6, 6]), roughness: 1 })
    : std({ map: woodTex(cfg.wood || [112, 58, 34], [W / 3, D / 3]), color: 0xb0b0b0, roughness: .3, metalness: .05, envMapIntensity: .35 });
  // surface relief: the brick, plank and plaster textures double as bump maps
  [M.brick, M.brickSide].forEach(m => { m.bumpMap = m.map; m.bumpScale = -.06; });
  M.wall.bumpMap = M.wall.map; M.wall.bumpScale = .01;
  if (floorMat.map && cfg.floor !== 'carpet'){ floorMat.bumpMap = floorMat.map; floorMat.bumpScale = .012; }
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  // a polished floor reflects the room: blend in a mirrored render (see run)
  const refl = cfg.floor === 'carpet' ? 0 : cfg.floor === 'concrete' ? .16 : (cfg.refl || .2);
  if (refl){
    FLOOR = fl;
    floorMat.onBeforeCompile = sh => {
      sh.uniforms.tReflect = { value: REFLECT.texture };
      sh.uniforms.uRes = { value: new THREE.Vector2(OUT_W * SS, OUT_H * SS) };
      sh.uniforms.uRefl = { value: refl };
      sh.fragmentShader = 'uniform sampler2D tReflect;\nuniform vec2 uRes;\nuniform float uRefl;\n' + sh.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
        vec2 suv = gl_FragCoord.xy / uRes; vec3 rc = vec3(0.0);
        for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) rc += texture2D(tReflect, suv + vec2(float(i), float(j)) * vec2(0.0024, 0.0042)).rgb;
        rc = LinearTosRGB(vec4(ACESFilmicToneMapping(rc / 25.0), 1.0)).rgb;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, rc, uRefl * (0.25 + 0.75 * smoothstep(0.0, 0.55, suv.y)));`);
    };
  }
  // soft shading where walls meet the floor and the ceiling
  aoEdges(cfg);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), std({ color: cfg.ceil || 0x2d2f33, roughness: .9 })); ceil.rotation.x = Math.PI / 2; ceil.position.y = H; scene.add(ceil);
  const wallMat = k => cfg.walls && cfg.walls[k] === 'brick' ? (k === 'back' ? M.brick : M.brickSide) : cfg.walls && cfg.walls[k] === 'dark' ? M.dark : M.wall;
  const bw = new THREE.Mesh(new THREE.PlaneGeometry(W, H), wallMat('back')); bw.position.set(0, H / 2, -D / 2); bw.receiveShadow = true; scene.add(bw);
  const lw = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat('left')); lw.position.set(-W / 2, H / 2, 0); lw.rotation.y = Math.PI / 2; lw.receiveShadow = true; scene.add(lw);
  if (cfg.walls && cfg.walls.right === 'glass') glassWall();
  else { const rw = new THREE.Mesh(new THREE.PlaneGeometry(D, H), wallMat('right')); rw.position.set(W / 2, H / 2, 0); rw.rotation.y = -Math.PI / 2; rw.receiveShadow = true; scene.add(rw); }
  // brick-red trim band and baseboard, like the Signal gallery
  if (cfg.trim !== false){
    box(W, .22, .06, M.trim, 0, H - .5, -D / 2 + .03); box(.06, .22, D, M.trim, -W / 2 + .03, H - .5, 0);
    if (!(cfg.walls && cfg.walls.right === 'glass')) box(.06, .22, D, M.trim, W / 2 - .03, H - .5, 0);
  }
  box(W, .12, .03, M.black, 0, .06, -D / 2 + .02);
  box(.03, .12, D, M.black, -W / 2 + .02, .06, 0);
  if (!(cfg.walls && cfg.walls.right === 'glass')) box(.03, .12, D, M.black, W / 2 - .02, .06, 0);
  // timber beam grid and posts
  for (let x = -W / 2 + 4; x < W / 2; x += 4) box(.28, .4, D, M.timber, x, H - .2, 0).castShadow = false;
  for (let z = -D / 2 + 4; z < D / 2; z += 4) box(W, .32, .24, M.timber, 0, H - .16, z).castShadow = false;
  (cfg.posts || []).forEach(p => box(.3, H, .3, M.timber, p[0], H / 2, p[1]));
  // recessed downlights
  for (let x = -W / 2 + 2; x < W / 2; x += 4) for (let z = -D / 2 + 2; z < D / 2; z += 4){
    const d = new THREE.Mesh(new THREE.CircleGeometry(.12, 20), new THREE.MeshBasicMaterial({ color: 0xfff6e0 })); d.rotation.x = Math.PI / 2; d.position.set(x, H - .01, z); scene.add(d); GLOWS.push([d.position.clone().setY(H - .03), 1]);
  }
  // light
  scene.add(new THREE.HemisphereLight(0xfff3e2, 0x3a2a1e, cfg.hemi || .28));
  const sun = new THREE.DirectionalLight(0xfff0dc, cfg.sun || .7); sun.position.set(1.5, 14, 3);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -W / 2; sc.right = W / 2; sc.top = D / 2; sc.bottom = -D / 2; sc.far = 40; sun.shadow.bias = -.0005; sun.shadow.radius = 4;
  scene.add(sun);
  for (let x = -W / 2 + 3; x < W / 2; x += 6) for (let z = -D / 2 + 3; z < D / 2; z += 6){ const pl = new THREE.PointLight(0xffe9c8, cfg.fill || .35, 10); pl.position.set(x, H - .4, z); scene.add(pl); }
}
let FLOOR = null, REFLECT = null;
// gradient strips that darken the corners of the room, a stand-in for ambient occlusion
function aoEdges(cfg){
  const tex = canvasTex(8, 128, (g, w, h) => { const r = g.createLinearGradient(0, 0, 0, h); r.addColorStop(0, 'rgba(0,0,0,1)'); r.addColorStop(.35, 'rgba(0,0,0,.35)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  const mat = a => new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: a, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const glass = cfg.walls && cfg.walls.right === 'glass';
  const walls = [['back', W, 0, -D / 2, 0], ['left', D, -W / 2, 0, Math.PI / 2]];
  if (!glass) walls.push(['right', D, W / 2, 0, -Math.PI / 2]);
  // the gradient is dark along the texture's top edge
  const flipped = () => { const t = tex.clone(); t.center.set(.5, .5); t.rotation = Math.PI; t.needsUpdate = true; return t; };
  walls.forEach(([, len, x, z, ry]) => {
    const n = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)); // into the room
    const at = (m, y, off) => { m.position.set(x + n.x * off, y, z + n.z * off); scene.add(m); return m; };
    const base = new THREE.Mesh(new THREE.PlaneGeometry(len, .7), mat(.42)); base.material.map = flipped(); base.rotation.y = ry; at(base, .35, .006);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(len, .9), mat(.5)); top.rotation.y = ry; at(top, H - .45, .006);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(len, .6), mat(.38)); fl.rotation.order = 'YXZ'; fl.rotation.y = ry; fl.rotation.x = -Math.PI / 2; at(fl, .003, .3);
  });
}
function glassWall(){
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(D * 3, H * 3), new THREE.MeshBasicMaterial({ map: skyTex() }));
  sky.position.set(W / 2 + 12, H * .9, 0); sky.rotation.y = -Math.PI / 2; scene.add(sky);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(30, D * 3), std({ color: 0x6c8a52 })); ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2 + 12, -.02, 0); scene.add(ground);
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(D, H), new THREE.MeshPhysicalMaterial({ color: 0xd8ecf5, transparent: true, opacity: .12, roughness: 0 })); pane.position.set(W / 2, H / 2, 0); pane.rotation.y = -Math.PI / 2; scene.add(pane);
  for (let z = -D / 2; z <= D / 2; z += 2) box(.08, H, .08, M.black, W / 2, H / 2, z);
  for (let y = .02; y <= H; y += 1.25) box(.08, .07, D, M.black, W / 2, y, 0);
  const sl = new THREE.DirectionalLight(0xfff7e6, .5); sl.position.set(W / 2 + 10, 8, 3); sl.target.position.set(0, 0, -2); scene.add(sl, sl.target);
}

function envMap(){
  const es = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(20, 8, 16), new THREE.MeshBasicMaterial({ color: 0x2c241e, side: THREE.BackSide })); es.add(room);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(20, 16), new THREE.MeshBasicMaterial({ color: 0x3a2618 })); fl.rotation.x = -Math.PI / 2; fl.position.y = -3.9; es.add(fl);
  for (let x = -8; x <= 8; x += 4) for (let z = -6; z <= 6; z += 4){ const l = new THREE.Mesh(new THREE.PlaneGeometry(.9, .9), new THREE.MeshBasicMaterial({ color: 0xfff1d6 })); l.rotation.x = Math.PI / 2; l.position.set(x, 3.9, z); es.add(l); }
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), new THREE.MeshBasicMaterial({ color: 0x8a857c })); wl.position.set(0, 0, -7.9); es.add(wl);
  const pm = new THREE.PMREMGenerator(renderer); return pm.fromScene(es, .03).texture;
}
// ---------- render + hotspots ----------
async function run(){
  const id = new URLSearchParams(location.search).get('room');
  const cfg = ROOMS[id];
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x111111);
  renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(OUT_W * SS, OUT_H * SS);
  renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = cfg.exposure || 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.physicallyCorrectLights = false;
  scene.environment = envMap();
  REFLECT = new THREE.WebGLRenderTarget(OUT_W * SS / 2, OUT_H * SS / 2, { type: THREE.HalfFloatType });
  BLOB = canvasTex(128, 128, (g, w, h) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, "rgba(0,0,0,1)"); r.addColorStop(.55, "rgba(0,0,0,.6)"); r.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = r; g.fillRect(0, 0, w, h); });
  shell(cfg);
  cfg.build();
  await Promise.all(pending);
  const cm = cfg.cam || {};
  camera = new THREE.PerspectiveCamera(cm.fov || 50, OUT_W / OUT_H, .05, 100);
  camera.position.set(cm.x || 0, cm.y || 1.65, cm.z !== undefined ? cm.z : D / 2 - .6);
  camera.lookAt(cm.lx || 0, cm.ly || 1.75, cm.lz !== undefined ? cm.lz : -D / 2);
  camera.updateMatrixWorld();
  scene.updateMatrixWorld(true);
  if (FLOOR){ // the room mirrored in the floor, rendered first and blended in by the floor's shader
    FLOOR.visible = false; scene.scale.y = -1; scene.updateMatrixWorld(true);
    renderer.setRenderTarget(REFLECT); renderer.render(scene, camera); renderer.setRenderTarget(null);
    FLOOR.visible = true; scene.scale.y = 1; scene.updateMatrixWorld(true);
  }
  renderer.render(scene, camera);
  const c = document.createElement('canvas'); c.width = OUT_W; c.height = OUT_H;
  const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(renderer.domElement, 0, 0, OUT_W, OUT_H);
  // bloom around the lights that the camera can see
  const rcg = new THREE.Raycaster();
  g.globalCompositeOperation = 'lighter';
  GLOWS.forEach(([p, k]) => {
    const s = p.clone().project(camera); if (s.z > 1 || Math.abs(s.x) > 1.05 || Math.abs(s.y) > 1.05) return;
    const dist = camera.position.distanceTo(p);
    rcg.set(camera.position, p.clone().sub(camera.position).normalize());
    const hit = rcg.intersectObjects(scene.children, true).find(h => h.object.material && !h.object.material.transparent);
    if (hit && hit.distance < dist - .15) return;
    const x = (s.x + 1) / 2 * OUT_W, y = (1 - s.y) / 2 * OUT_H, r = Math.min(90, 260 / dist) * k;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, 'rgba(255,240,215,.55)'); gr.addColorStop(.18, 'rgba(255,225,180,.18)'); gr.addColorStop(1, 'rgba(255,210,160,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  });
  g.globalCompositeOperation = 'source-over';
  // a gentle S-curve and fine film grain
  const px = g.getImageData(0, 0, OUT_W, OUT_H), a = px.data, curve = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++){ const t = i / 255; curve[i] = 255 * (t + .22 * t * (1 - t) * (t - .5) * 2); }
  for (let i = 0; i < a.length; i += 4){ const n = (R() - .5) * 7; a[i] = curve[a[i]] + n; a[i + 1] = curve[a[i + 1]] + n; a[i + 2] = curve[a[i + 2]] + n; }
  g.putImageData(px, 0, 0);
  // lens vignette, as in the architect renders
  const vg = g.createRadialGradient(OUT_W / 2, OUT_H / 2, OUT_H * .45, OUT_W / 2, OUT_H / 2, OUT_W * .62);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.38)"); g.fillStyle = vg; g.fillRect(0, 0, OUT_W, OUT_H);
  const jpg = c.toDataURL('image/jpeg', .84);
  // hotspots: projected bounds of each visible picture, in percent
  const rc = new THREE.Raycaster(), spots = [];
  hot.forEach(hp => {
    const pts = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => new THREE.Vector3(a * hp.w / 2, b * hp.h / 2, 0).applyMatrix4(hp.mesh.matrixWorld).project(camera));
    if (pts.some(p => p.z > 1)) return;
    let x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
    x0 = Math.max(-1, x0); x1 = Math.min(1, x1); y0 = Math.max(-1, y0); y1 = Math.min(1, y1);
    if (x1 - x0 < .035 || y1 - y0 < .04) return;
    const ctr = new THREE.Vector3().applyMatrix4(hp.mesh.matrixWorld);
    rc.setFromCamera({ x: (x0 + x1) / 2, y: (y0 + y1) / 2 }, camera);
    const hit = rc.intersectObjects(scene.children, true).find(h => h.object.material && !h.object.material.transparent);
    if (!hit || hit.object !== hp.mesh) return;
    spots.push({ src: hp.src, alt: hp.label, l: +((x0 + 1) * 50).toFixed(2), t: +((1 - y1) * 50).toFixed(2), w: +((x1 - x0) * 50).toFixed(2), h: +((y1 - y0) * 50).toFixed(2) });
  });
  document.getElementById('out').textContent = JSON.stringify({ room: id, spots }) + '\n@@JPG@@' + jpg;
}
window.addEventListener('load', () => run().catch(e => { document.getElementById('out').textContent = 'ERR ' + e.stack; }));
