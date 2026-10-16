/* global THREE, ROOMS, item, people, M, box, cyl, group, picture, sign, caseOn, person, bench, blob, panelWall, std, textTex, canvasTex, scene, W, D, H */
// hang a list of pictures along a wall: [src, alt] pairs, centred on u0 with step
function row(wall, list, y, h, u0, step, o){
  const n = list.length, start = u0 - step * (n - 1) / 2;
  list.forEach((p, i) => picture(p[0], wall, start + i * step, y, h, Object.assign({ alt: p[1], maxW: step * .86 }, o || {})));
}
const P = (k, i, extra) => Object.assign({}, people[i % people.length], extra || {});
function mat(c, o){ return std(Object.assign({ color: c, roughness: .6 }, o || {})); }
function flagPole(x, z, tex, h){
  cyl(.025, .025, h || 2.6, M.black, x, (h || 2.6) / 2, z, 10);
  cyl(.18, .22, .06, M.black, x, .03, z, 20);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(.9, .6), std({ map: tex, side: THREE.DoubleSide, roughness: .9 }));
  f.position.set(x + .46, (h || 2.6) - .35, z); f.rotation.y = -.25; scene.add(f);
}
function flagTex(bg, fg, sq){ return canvasTex(180, 120, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.fillRect(w / 2 - (sq || 30), h / 2 - (sq || 30), (sq || 30) * 2, (sq || 30) * 2); }); }
function screenTex(lines, o){ return textTex(lines, Object.assign({ bg: '#0c1622', fg: '#e8f1ff', font: 'Arial, Helvetica, sans-serif', weight: '700', size: 90, track: 4 }, o || {})); }
function screen(x, y, z, ry, w, h, tex){
  const g = group(x, y, z, ry);
  const b = new THREE.Mesh(new THREE.BoxGeometry(w + .08, h + .08, .06), M.black); g.add(b);
  const s = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex })); s.position.z = .035; g.add(s);
  return g;
}
function totem(x, z, ry, word, h){
  const g = group(x, 0, z, ry);
  const b = new THREE.Mesh(new THREE.BoxGeometry(2.2, h || 3.2, .3), mat(0x26282c, { roughness: .5 })); b.position.y = (h || 3.2) / 2; b.castShadow = true; g.add(b);
  const t = textTex([word], { bg: '#26282c', fg: '#f2f2f2', font: 'Arial, Helvetica, sans-serif', weight: '400', size: 150, track: 10 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(2, .5), new THREE.MeshBasicMaterial({ map: t })); p.position.set(0, (h || 3.2) - .5, .16); g.add(p);
  blob(x, z, 1.3, .45, .6);
  return g;
}
function chair(x, z, ry, c){
  const g = group(x, 0, z, ry); const m = mat(c || 0x7b2a22, { roughness: .8 });
  const s = new THREE.Mesh(new THREE.BoxGeometry(.6, .18, .55), m); s.position.y = .42; s.castShadow = true; g.add(s);
  const b = new THREE.Mesh(new THREE.BoxGeometry(.6, .62, .14), m); b.position.set(0, .78, -.22); b.castShadow = true; g.add(b);
  [-1, 1].forEach(k => { const a = new THREE.Mesh(new THREE.BoxGeometry(.1, .3, .55), m); a.position.set(k * .3, .58, 0); g.add(a); });
  blob(x, z, .4, .4, .5); return g;
}
function table(x, z, w, d, c){
  const top = mat(c || 0x3d2214, { roughness: .35 });
  box(w, .06, d, top, x, .74, z);
  [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => box(.06, .72, .06, M.black, x + a * (w / 2 - .08), .36, z + b * (d / 2 - .08)));
  blob(x, z, w * .65, d * .7, .5);
}

// ---------------- AUDITORIUM ----------------
ROOMS['auditorium'] = {
  W: 16, D: 16, H: 6, floor: 'carpet', carpet: "#3a0f13", walls: { back: 'dark', left: 'brick', right: 'brick' }, trim: false, hemi: .2, fill: .2,
  cam: { x: 0, y: 3.6, z: 7.8, ly: 2.4, lz: -8, fov: 55 },
  build(){
    // the screen and stage
    box(12, .6, 2.4, M.timber, 0, .3, -6.8);
    screen(0, 3.2, -7.85, 0, 9, 4.1, textTex(['NOW SHOWING', 'This Month in History · The Signal Story · The Cyber Story · The Hello Girls'], { bg: '#0b1018', fg: '#e0bc4a', size: 120, sub: .26, font: 'Georgia, serif' }));
    const curtain = mat(0x6a1218, { roughness: .95 });
    [-1, 1].forEach(k => { for (let i = 0; i < 6; i++) cyl(.16, .16, 5.6, curtain, k * (5.2 + i * .25), 2.8, -7.6 + (i % 2) * .1, 12); });
    // rows of seats rising toward the camera
    const seat = mat(0x7a1820, { roughness: .85 });
    for (let r = 0; r < 6; r++){
      const z = -3.2 + r * 1.3, y = r * .22;
      if (y > 0) box(14, y, 1.3, std({ map: M.carpetTex || null, color: 0x3a1013 }), 0, y / 2, z);
      for (let s = -6; s <= 6; s++){
        if (s === 0) continue;
        const x = s * .95;
        box(.62, .12, .5, seat, x, y + .42, z); box(.62, .55, .1, seat, x, y + .72, z + .26);
      }
    }
    // wall sconces
    [-1, 1].forEach(k => { for (let z = -5; z < 7; z += 3.5){ const l = new THREE.PointLight(0xffc98a, .5, 4); l.position.set(k * 7.6, 3, z); scene.add(l); cyl(.12, .06, .3, std({ color: 0xc9a227, emissive: 0xffb15a, emissiveIntensity: .8 }), k * 7.88, 3, z, 12); } });
    const s1 = new THREE.SpotLight(0xffffff, 2.2, 18, .5, .4); s1.position.set(0, 5.5, 2); s1.target.position.set(0, 3, -7.8); scene.add(s1, s1.target);
    picture('assets/seal-mark.png', 'left', -5.2, 3.4, 1.1, { frame: 0, mat: false, alt: 'Society seal' });
    person(-2.4, -1.9, Math.PI, P(0, 3)); person(1.6, -.6, Math.PI, P(0, 2, { skirt: true }));
  },
};

// ---------------- CYBER STORY ---- (uses the architect's existing drawing; not rendered)

// ---------------- CAMP GORDON: WWI ----------------
ROOMS['camp-gordon'] = {
  W: 20, D: 16, walls: { back: 'brick', left: 'white', right: 'white' }, wood: [104, 64, 40], posts: [[-2, -2], [6, -2]],
  cam: { x: 2.4, z: 7.2, lx: -1.5, lz: -8 },
  build(){
    sign(['CAMP GORDON', 'The WWI Era · 1917–1919'], 'back', 0, 4.0, { w: 4.4, bg: '#1d1d1f' });
    row('back', [['assets/wwi_camp.jpg', 'Camp Gordon barracks'], ['assets/wwi_recruits.jpg', 'Recruits arrive'], ['assets/wwi_328th.jpg', 'The 328th Infantry'], ['assets/wwi_map.jpg', 'Map of Camp Gordon']], 2.2, 1.55, 0, 4.2);
    row('left', [['assets/wwi_nurses.jpg', 'Army nurses'], ['assets/wwi_flu.jpg', 'The 1918 influenza'], ['assets/wwi_pt.jpg', 'Physical training']], 2.1, 1.4, -2, 3.6);
    row('right', [['assets/wwi_black_soldiers.jpg', 'Black soldiers at Camp Gordon'], ['assets/wwi_record.jpg', 'A service record']], 2.1, 1.4, -3.5, 4);
    // trench-line display: sandbags, barrels, a duckboard
    const bag = mat(0xb59a6a, { roughness: 1 });
    for (let i = 0; i < 9; i++) for (let j = 0; j < 3 - (i % 2 ? 1 : 0); j++){ const m = new THREE.Mesh(new THREE.SphereGeometry(.32, 14, 10), bag); m.scale.set(1.2, .45, .7); m.position.set(-6.4 + i * .55, .16 + j * .27, -1.3 + (j % 2) * .05); m.castShadow = true; scene.add(m); }
    blob(-4.2, -1.3, 2.8, .7, .5);
    const bar = mat(0x4a3424, { roughness: .8 });
    cyl(.32, .3, .9, bar, -7.6, .45, .3, 20); cyl(.32, .3, .9, bar, -7.0, .45, .9, 20);
    for (let k = 0; k < 3; k++) cyl(.335, .335, .04, M.black, -7.6, .1 + k * .35, .3, 20);
    caseOn(3.0, -3.8, { item: item.helmet() }); caseOn(4.6, -3.8, { item: item.book(0x5a4630) }); caseOn(3.0, -5.4, { item: item.medal() });
    person(0.4, -4.2, Math.PI - .2, P(0, 0)); person(-1.6, -.2, -2.3, P(0, 4)); person(4.6, -1.6, Math.PI + .5, P(0, 2, { skirt: true }));
  },
};

// ---------------- COMMAND GALLERY ----------------
ROOMS['command-gallery'] = {
  W: 22, D: 16, walls: { back: 'white', left: 'dark', right: 'brick' }, wood: [92, 52, 32],
  cam: { x: -2, z: 7.2, lx: 1.2, lz: -8 },
  build(){
    sign(['COMMAND GALLERY', 'Signal Commands of the Regiment'], 'back', 0, 4.0, { w: 4.6 });
    ['cmd_1st.png', 'cmd_5th.png', 'cmd_7th.png', 'cmd_9th.png', 'cmd_311th.png', 'cmd_335th.png'].forEach((f, i) =>
      picture('assets/' + f, 'back', -7.5 + i * 3, 2.3, 1.15, { frame: 0, mat: false, alt: 'Signal Command patch' }));
    row('left', [['assets/nara/cg-7th-ritchie-1988.jpg', '7th Signal Command, Fort Ritchie, 1988'], ['assets/nara/cg-5th-sarajevo-1996.jpg', '5th Signal Command, Sarajevo, 1996']], 2.2, 1.5, -3, 4.2);
    picture('assets/nara/cg-501st-kuwait-2003.jpg', 'right', -3, 2.2, 1.6, { alt: '501st Signal Battalion, Kuwait, 2003' });
    // guidons in Signal orange and white
    const g1 = flagTex('#e8742a', '#ffffff', 0), g2 = flagTex('#ffffff', '#e8742a', 22);
    for (let i = 0; i < 5; i++) flagPole(-9.4 + .2, -5 + i * 1.3, i % 2 ? g2 : g1, 2.4);
    picture('assets/hurricane_board.jpg', { x: 5.6, z: -1.2, ry: -Math.PI / 2 + .3 }, 0, 1.6, 1.2, { alt: 'Hurricane board' });
    box(.2, 2.4, 2.2, M.dark, 5.72, 1.2, -1.15, .3);
    person(-1.4, -3.2, Math.PI + .1, P(0, 1)); person(1.6, -2.4, Math.PI - .3, P(0, 3)); person(3.8, 1, Math.PI - .8, P(0, 0));
  },
};

// ---------------- COMBAT CAMERA ----------------
ROOMS['combat-camera'] = {
  W: 20, D: 16, walls: { back: 'white', left: 'brick' }, wood: [100, 58, 36],
  cam: { x: 3, z: 7.2, lx: -1.4, lz: -8 },
  build(){
    sign(['COMBAT CAMERA & VIDEO', "The Army's eye"], 'back', -1, 4.0, { w: 4.6 });
    picture('assets/dday_signal.jpg', 'back', -1, 2.15, 2.1, { alt: 'A Signal Corps photograph from Normandy' });
    row('back', [['assets/nara/cc-fort-myer-1933.jpg', 'Signal Corps cameramen, Fort Myer, 1933']], 2.1, 1.4, -5.6, 3);
    row('back', [['assets/nara/cc-desert-shield-sat.jpg', 'Video by satellite, Desert Shield']], 2.1, 1.4, 3.6, 3);
    row('left', [['assets/nara/cc-cameraman-parade.jpg', 'Signal Corps cameraman'], ['assets/wwi_368th.jpg', 'The 368th Infantry, photographed by the Corps']], 2.1, 1.5, -2.6, 4);
    sign(['THE OSCARS'], 'right', -4.4, 3.3, { w: 2, bg: '#1f1f22', size: 120 });
    row('right', [['assets/zanuck_portrait.jpg', 'Darryl F. Zanuck'], ['assets/geisel_portrait.jpg', 'Theodor Geisel'], ['assets/oscar_case.jpg', 'Academy Awards won by the Signal Corps']], 2.1, 1.3, -4.4, 2.2);
    // a newsreel camera on a tripod
    const cg = group(-3.2, 0, -2.4, .7);
    [0, 2.1, 4.2].forEach(a => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.025, .02, 1.6, 8), M.timber); l.position.set(Math.cos(a) * .32, .75, Math.sin(a) * .32); l.rotation.set(Math.sin(a) * .35, 0, -Math.cos(a) * .35); cg.add(l); });
    const body = new THREE.Mesh(new THREE.BoxGeometry(.5, .4, .32), mat(0x232323, { metalness: .4, roughness: .4 })); body.position.y = 1.65; cg.add(body);
    [-.14, .14].forEach(k => { const r = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .07, 24), mat(0x2f2f2f, { metalness: .5 })); r.rotation.z = Math.PI / 2; r.position.set(.0, 1.98, k * 1.6); r.rotation.set(0, 0, Math.PI / 2); r.position.set(k, 2.0, 0); r.rotation.set(Math.PI / 2, 0, 0); cg.add(r); });
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .25, 16), M.black); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.65, .28); cg.add(lens);
    blob(-3.2, -2.4, .6, .6, .6);
    caseOn(4.6, -3, { item: item.reel() }); caseOn(6.2, -3, { item: item.reel() });
    person(-.6, -3.6, Math.PI, P(0, 2)); person(4.2, -.6, -1.9, P(0, 0)); person(1.6, 1.4, Math.PI - .4, P(0, 1, { skirt: true }));
  },
};

// ---------------- FIRESIDE CHATS ----------------
ROOMS['fireside'] = {
  W: 14, D: 12, H: 4.4, walls: { back: 'brick', left: 'white', right: 'white' }, wood: [96, 54, 32], hemi: .22, fill: .22, exposure: 1.05,
  cam: { x: 2.2, y: 1.5, z: 5.2, lx: -.6, ly: 1.4, lz: -6 },
  build(){
    // fireplace on the brick wall
    const st = mat(0x6f6a62, { roughness: .9 });
    box(3.2, 1.6, .6, st, 0, .8, -5.7); box(3.6, .16, .8, M.timber, 0, 1.68, -5.6);
    const fire = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.0), new THREE.MeshBasicMaterial({ map: canvasTex(256, 140, (g, w, h) => { const r = g.createRadialGradient(w / 2, h, 4, w / 2, h, h); r.addColorStop(0, '#fff2b0'); r.addColorStop(.3, '#ff9a2a'); r.addColorStop(.7, '#7a1d06'); r.addColorStop(1, '#120705'); g.fillStyle = r; g.fillRect(0, 0, w, h); }) }));
    fire.position.set(0, .62, -5.39); scene.add(fire);
    const fl = new THREE.PointLight(0xff8a3a, 2.4, 7, 1.5); fl.position.set(0, .8, -4.9); scene.add(fl);
    picture('assets/fireside_group.jpg', 'back', 0, 2.75, 1.15, { alt: 'Heritage, the museum magazine' });
    sign(['FIRESIDE CHATS', 'First-person recollections from the Signaleers who lived this history'], 'left', -1.2, 3.3, { w: 4, h: .8, sub: .3 });
    // rug, armchairs, a side table and lamp
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 3.2), std({ map: canvasTex(256, 192, (g, w, h) => { g.fillStyle = '#5b1d1a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a227'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28); g.strokeStyle = '#1f2b22'; g.lineWidth = 3; g.strokeRect(28, 28, w - 56, h - 56); }), roughness: 1 }));
    rug.rotation.x = -Math.PI / 2; rug.position.set(0, .006, -3); scene.add(rug);
    chair(-1.4, -3.2, .8, 0x6b2d1e); chair(1.4, -3.2, -.8, 0x6b2d1e); chair(0, -1.7, Math.PI, 0x2f4a3a);
    table(0, -3.4, .7, .7);
    cyl(.02, .02, .5, M.black, 0, 1.0, -3.4, 8); const sh = cyl(.18, .26, .28, std({ color: 0xf0dfb5, emissive: 0xffd28a, emissiveIntensity: .7 }), 0, 1.35, -3.4, 18);
    const lp = new THREE.PointLight(0xffd29a, .8, 4); lp.position.set(0, 1.3, -3.4); scene.add(lp);
    // a bookcase
    const bc = group(-6.6, 0, -2, Math.PI / 2);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, .4), M.timber); fr.position.y = 1.3; bc.add(fr);
    for (let s = 0; s < 5; s++) for (let b = 0; b < 16; b++){ const bk = new THREE.Mesh(new THREE.BoxGeometry(.11, .34 + (b % 3) * .03, .28), mat([0x6b2a1e, 0x29405e, 0x2f4a3a, 0x8a6b3c, 0x3a3a3a][(b + s) % 5])); bk.position.set(-1.05 + b * .14, .3 + s * .5, .1); bc.add(bk); }
    person(-3.4, -2.2, Math.PI - .9, P(0, 0));
  },
};

// ---------------- DONOR SPOTLIGHT ----------------
ROOMS['donor-spotlight'] = {
  W: 18, D: 14, walls: { back: 'white', left: 'brick' }, wood: [112, 66, 40],
  cam: { x: 2.6, z: 6.2, lx: -.8, lz: -7 },
  build(){
    sign(['CAMPAIGN CIRCLE', 'Donor Spotlight'], 'back', 0, 4.05, { w: 4.4, bg: '#1d1d1f' });
    // the donor wall: a plaque for each tier of the Campaign Circle
    const tiers = ['Monmouth', 'Germantown', 'Brandywine', 'Princeton', 'Trenton', 'Long Island', 'Charleston', 'Quebec', 'Boston', 'Ticonderoga', 'Lexington'];
    box(8.6, 2.9, .12, mat(0x2a2c2f, { roughness: .4 }), 0, 2.15, -6.93);
    tiers.forEach((t, i) => {
      const c = i % 4, r = i / 4 | 0, x = -3.1 + c * 2.07, y = 3.05 - r * .82;
      const tx = textTex([t.toUpperCase()], { w: 512, h: 160, bg: '#c9a227', fg: '#1d1608', size: 58, track: 3, border: '#8a6d14' });
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.8, .56), std({ map: tx, metalness: .55, roughness: .35, envMapIntensity: 1.2 })); p.position.set(x, y, -6.86); scene.add(p);
    });
    const sp = new THREE.SpotLight(0xfff0d8, 3, 10, .55, .5); sp.position.set(0, 4.6, -3.5); sp.target.position.set(0, 2.1, -7); scene.add(sp, sp.target);
    row('left', [['assets/peter_kind.jpg', 'Peter Kind'], ['assets/nara/fg-kind-1990.jpg', 'Peter Kind, 1990']], 2.1, 1.6, -2.2, 3.4);
    caseOn(4.2, -3.2, { item: item.medal() });
    person(-.8, -4.2, Math.PI + .1, P(0, 4)); person(1.4, -3.6, Math.PI - .3, P(0, 2, { skirt: true }));
  },
};

// ---------------- HONOR ROLL ----------------
ROOMS['people'] = {
  W: 20, D: 14, walls: { back: 'dark', left: 'white', right: 'white' }, wood: [92, 52, 30],
  cam: { x: 0, z: 6.2, lz: -7 },
  build(){
    sign(['HONOR ROLL', 'The people behind the museum'], 'back', 0, 4.1, { w: 4.4, bg: '#e8e2d2', fg: '#1d1d1f' });
    const bios = ['bio_chase.jpg', 'bio_clark.png', 'bio_dyer.jpg', 'bio_foley.png', 'bio_haynes.jpg', 'bio_johnson.png', 'bio_mcconnell.png', 'bio_nishizawa.png'];
    bios.forEach((b, i) => picture('assets/' + b, 'back', -6.3 + i * 1.8, 2.25, 1.1, { maxW: 1.1, frameMat: mat(0xa8862a, { metalness: .7, roughness: .3 }), alt: 'Board and staff' }));
    row('left', [['assets/zanuck_portrait.jpg', 'Darryl F. Zanuck, Hall of Fame'], ['assets/geisel_portrait.jpg', 'Theodor Geisel, Hall of Fame']], 2.2, 1.5, -2.2, 3.2);
    picture('assets/aviator_wing.jpg', 'right', -2.6, 2.2, 1.3, { alt: 'Aviator wings' });
    [-7.4, -5.6, 5.6, 7.4].forEach(x => caseOn(x, -3.6, { w: .8, d: .8, item: item.medal() }));
    bench(0, .4, 0);
    person(-4.4, -4.2, Math.PI + .3, P(0, 3)); person(3.4, -1.4, Math.PI + .5, P(0, 1));
  },
};

// ---------------- GET INVOLVED ----------------
ROOMS['give'] = {
  W: 18, D: 14, walls: { back: 'brick', left: 'white', right: 'white' }, wood: [128, 76, 46],
  cam: { x: -2.4, z: 6.2, lx: 1, lz: -7 },
  build(){
    sign(['SECURE OUR STORY', 'A building for the collection'], 'back', 0, 4.0, { w: 4.6, bg: '#1d1d1f', fg: '#e0bc4a' });
    picture('assets/uncle_sam.jpg', 'back', -3.4, 2.2, 2.1, { alt: 'Uncle Sam recruiting poster' });
    picture('assets/rosie.png', 'back', 3.4, 2.2, 2.1, { alt: 'Rosie the Riveter poster' });
    // a campaign display: the building's progress, about $500,000 raised
    const g = group(0, 0, -5.6, 0);
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.7, .25), mat(0x26282c)); b.position.y = 1.35; b.castShadow = true; g.add(b);
    const t = textTex(['$500,000', 'raised so far by more than 80 donors', 'Help open the doors'], { w: 768, h: 800, bg: '#26282c', fg: '#f3efe6', size: 120, sub: .3 });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.5), new THREE.MeshBasicMaterial({ map: t })); p.position.set(0, 1.45, .13); g.add(p);
    blob(0, -5.6, 1.5, .5, .6);
    picture('assets/building.jpg', 'left', -2, 2.2, 1.6, { alt: 'The planned museum building' });
    picture('assets/floor_plan.jpg', 'right', -2.6, 2.2, 1.6, { alt: 'Floor plan of the planned museum' });
    // a donation kiosk
    box(.6, 1.0, .5, M.dark, 4.2, .5, -2.6); const k = screen(4.2, 1.22, -2.62, -.4, .52, .34, screenTex(['DONATE'], { bg: '#c9a227', fg: '#0d1f16', size: 140 })); k.rotation.x = -.5;
    person(-1.2, -3.2, Math.PI, P(0, 0)); person(3.4, -1.8, -2.3, P(0, 4)); person(1, -1, Math.PI + .2, P(0, 2, { skirt: true }));
  },
};

// ---------------- TIMELINE ----------------
ROOMS['timeline'] = {
  W: 22, D: 12, walls: { back: 'white', left: 'brick', right: 'brick' }, wood: [104, 60, 36],
  cam: { x: 0, z: 5.2, lz: -6 },
  build(){
    sign(['TIME WAITS FOR NO ONE'], 'back', 0, 4.15, { w: 5, h: .7, size: 100 });
    box(15, .06, .04, mat(0xc9a227, { metalness: .7, roughness: .3 }), 0, 1.25, -5.95);
    [['2019', 'Where we started', 'logo_2019.png', -5.5], ['2021', 'Where we have been', 'logo_2021.png', 0], ['2024', 'Where we are today', 'logo_2024.png', 5.5]].forEach(([yr, lbl, f, u]) => {
      picture('assets/' + f, 'back', u, 2.55, 1.6, { frame: 0, mat: false, alt: lbl });
      sign([yr, lbl], 'back', u, 1.05, { w: 2.2, h: .62, bg: null, fg: '#1d1d1f', size: 110, sub: .38 });
      cyl(.09, .09, .05, mat(0xc9a227, { metalness: .7 }), u, 1.25, -5.93).rotation.x = Math.PI / 2;
    });
    bench(-2.8, -1.6, 0); bench(2.8, -1.6, 0);
    person(-3.6, -3.4, Math.PI, P(0, 1)); person(2.6, -3.8, Math.PI + .2, P(0, 2, { skirt: true }));
  },
};

// ---------------- NEWS ----------------
ROOMS['news'] = {
  W: 18, D: 14, walls: { back: 'white', left: 'brick' }, wood: [120, 70, 42],
  cam: { x: 2.6, z: 6.2, lx: -.8, lz: -7 },
  build(){
    sign(['NEWS & ANNOUNCEMENTS'], 'back', 0, 4.05, { w: 4.6, h: .7, size: 96 });
    row('back', [['assets/heritage_2020_1.jpg', 'Heritage, Issue 1'], ['assets/heritage_2021_2.jpg', 'Heritage, Issue 2'], ['assets/heritage_2021_3.jpg', 'Heritage, Issue 3'], ['assets/heritage_space.jpg', 'Heritage, space issue']], 2.25, 1.75, 0, 2.6);
    // a news screen and a magazine rack
    screen(-8.94, 2.3, -2.2, Math.PI / 2, 2.6, 1.46, screenTex(['IN THE NEWS', 'Signal & Cyber Corps Museum Society'], { size: 110, sub: .32 }));
    const rk = group(4.4, 0, -4.6, -.5);
    const fr = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.5, .4), M.timber); fr.position.y = .75; fr.castShadow = true; rk.add(fr);
    for (let s = 0; s < 3; s++) for (let c = 0; c < 4; c++){ const m = new THREE.Mesh(new THREE.BoxGeometry(.32, .42, .02), mat([0x29405e, 0x8a2b20, 0xc9a227, 0xe8e2d2][(s + c) % 4])); m.position.set(-.55 + c * .37, .32 + s * .45, .22); m.rotation.x = -.2; rk.add(m); }
    blob(4.4, -4.6, 1, .4, .5);
    table(-2.6, -2.6, 1.6, .9); chair(-3.2, -1.8, Math.PI, 0x2f4a3a); chair(-2, -1.8, Math.PI, 0x2f4a3a);
    person(.8, -4.6, Math.PI, P(0, 3)); person(-1.4, -4.8, Math.PI + .2, P(0, 1, { skirt: true }));
  },
};

// ---------------- HERITAGE MAGAZINE ----------------
ROOMS['magazine'] = {
  W: 20, D: 14, walls: { back: 'white', left: 'white', right: 'brick' }, wood: [100, 58, 36],
  cam: { x: -2.6, z: 6.2, lx: .8, lz: -7 },
  build(){
    sign(['HERITAGE', 'The Society’s magazine, page by page'], 'back', 0, 4.05, { w: 4.4 });
    row('back', [['assets/h2021_p01.jpg', 'Heritage, Spring 2021, cover'], ['assets/h2021_p02.jpg', 'Heritage, page 2'], ['assets/h2021_p03.jpg', 'Heritage, page 3'], ['assets/h2021_p04.jpg', 'Heritage, page 4'], ['assets/h2021_p05.jpg', 'Heritage, page 5']], 2.3, 1.75, 0, 2.7);
    row('left', [['assets/h2020_p1.jpg', 'Heritage, 2020, cover'], ['assets/h2020_p2.jpg', 'Heritage, 2020, page 2'], ['assets/h2020_p4.jpg', 'Heritage, 2020, page 4']], 2.3, 1.6, -2.4, 2.2);
    // reading tables
    table(-1.6, -2.4, 2, 1); table(2.6, -2.4, 2, 1);
    [[-2.2, -1.6], [-1, -1.6], [2, -1.6], [3.2, -1.6]].forEach(([x, z]) => chair(x, z, Math.PI, 0x7b2a22));
    [[-1.6, -2.4], [2.6, -2.4]].forEach(([x, z]) => { box(.42, .02, .3, mat(0xe8e2d2), x - .3, .78, z); box(.42, .02, .3, mat(0xe8e2d2), x + .3, .78, z, .2); });
    // a lectern with an open issue
    box(.6, 1.1, .5, M.timber, 5.2, .55, -4.8); box(.7, .05, .6, M.timber, 5.2, 1.15, -4.8);
    person(-.2, -4.6, Math.PI, P(0, 0)); person(3.8, -4.2, Math.PI + .3, P(0, 2, { skirt: true }));
  },
};

// ---------------- CIVIL WAR ----------------
ROOMS['civil-war'] = {
  W: 20, D: 16, walls: { back: 'brick', left: 'white', right: 'white' }, wood: [96, 56, 34], posts: [[-4, -2], [4, -2]],
  cam: { x: 2.8, z: 7.2, lx: -1.2, lz: -8 },
  build(){
    sign(['THE CIVIL WAR SIGNAL ANNEX', 'Flags by day, torches by night'], 'back', 0, 4.05, { w: 5 });
    row('back', [['assets/nara/cw-camp-of-instruction.jpg', 'Signal camp of instruction'], ['assets/nara/cw-telegraph-wilcox.jpg', 'Military telegraph at Wilcox Landing']], 2.2, 1.6, 0, 6);
    picture('assets/nara/cw-cobbs-hill-tower.jpg', 'left', -3.6, 2.2, 2.0, { alt: "Signal tower at Cobb's Hill" });
    picture('assets/nara/cw-elk-mountain.jpg', 'left', 1, 2.2, 1.5, { alt: 'Signal station on Elk Mountain' });
    // a timber signal tower with a flagman
    const tw = group(-3, 0, -3.6, .3); const tm = mat(0x7a5a3a, { roughness: .9 });
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const l = new THREE.Mesh(new THREE.BoxGeometry(.1, 4.2, .1), tm); l.position.set(a * .7, 2.1, b * .7); l.rotation.set(-b * .05, 0, a * .05); l.castShadow = true; tw.add(l); });
    for (let y = .6; y < 4; y += .9) [0, Math.PI / 2].forEach(r => { const br = new THREE.Mesh(new THREE.BoxGeometry(1.5, .06, .06), tm); br.position.y = y; br.rotation.y = r; tw.add(br); const b2 = br.clone(); b2.position.z = r ? 0 : .66; b2.position.x = r ? .66 : 0; tw.add(b2); });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.6, .08, 1.6), tm); deck.position.y = 3.6; tw.add(deck);
    blob(-3, -3.6, 1.1, 1.1, .5);
    // the wig-wag flags: white with a red square, red with a white square
    flagPole(1.2, -4.8, flagTex('#ffffff', '#b3121f', 28), 2.6); flagPole(2.6, -5.0, flagTex('#b3121f', '#ffffff', 28), 2.6);
    caseOn(5.2, -3.2, { item: item.book(0x4a3424) }); caseOn(6.8, -3.2, { item: (x, y, z) => { box(.3, .1, .2, M.timber, x, y + .05, z); cyl(.02, .02, .12, mat(0xb08d57, { metalness: .8 }), x + .05, y + .14, z, 8); } });
    person(.4, -2.8, Math.PI - .2, P(0, 4)); person(4.6, -1.4, Math.PI + .5, P(0, 0));
  },
};

// ---------------- SATELLITES ----------------
ROOMS['satellites'] = {
  W: 20, D: 16, H: 6, walls: { back: 'white', left: 'brick', right: 'glass' }, floor: 'concrete', trim: false, ceil: 0x1d1f22,
  cam: { x: -2.2, y: 1.7, z: 7.2, lx: 1.4, ly: 2.2, lz: -8 },
  build(){
    sign(['THE SATELLITE ANNEX'], 'back', -2, 4.3, { w: 4.4, h: .7, size: 96 });
    row('back', [['assets/nara/sat-phu-lam-1969.jpg', 'Satellite station, Phu Lam, 1969'], ['assets/nara/sat-dscs-1987.jpg', 'DSCS terminal, 1987'], ['assets/nara/sat-triband-1999.jpg', 'Tri-band terminal, 1999']], 2.4, 1.6, -2, 3.6);
    picture('assets/nara/sat-vincent-hall-1999.jpg', 'left', -2.4, 2.3, 1.7, { alt: 'Satellite training at Fort Gordon, 1999' });
    // a ground terminal dish on a plinth
    box(2.4, .5, 2.4, M.dark, 3.6, .25, -3.4);
    cyl(.12, .16, 1.6, mat(0xdedede), 3.6, 1.3, -3.4, 16);
    box(.9, .12, .3, mat(0xdedede), 3.6, 2.1, -3.3); [-1, 1].forEach(k => box(.08, .6, .2, mat(0xdedede), 3.6 + k * .42, 2.4, -3.3));
    const d = new THREE.Mesh(new THREE.SphereGeometry(1.4, 40, 16, 0, 7, 0, .75), std({ color: 0xf4f4f4, roughness: .4, side: THREE.DoubleSide })); d.position.y = -1.4; d.castShadow = true; const dg = group(3.6, 2.7, -3.3, -.4); dg.rotation.x = -.5; dg.add(d);
    blob(3.6, -3.4, 1.7, 1.7, .5);
    // a satellite hanging overhead
    const sg = group(.4, 4.35, -1.6, .5); sg.rotation.z = .2;
    const bus = new THREE.Mesh(new THREE.BoxGeometry(.9, .9, .9), std({ color: 0xc9a227, metalness: .9, roughness: .25 })); sg.add(bus);
    [-1, 1].forEach(k => { const pn = new THREE.Mesh(new THREE.BoxGeometry(2.2, .04, .8), std({ color: 0x1d2c52, metalness: .6, roughness: .3 })); pn.position.x = k * 1.65; sg.add(pn); });
    const an = new THREE.Mesh(new THREE.SphereGeometry(.4, 20, 10, 0, 7, 0, 1), std({ color: 0xffffff, side: THREE.DoubleSide })); an.position.y = -.6; an.rotation.x = Math.PI; sg.add(an);
    [-1, 1].forEach(k => cyl(.005, .005, 1.2, M.black, .4 + k * .3, 5.4, -1.6, 4));
    caseOn(-5.6, -3.2, { item: item.dish() }); caseOn(-5.6, -1.4, { item: item.radio() });
    person(.6, -4.6, Math.PI, P(0, 3)); person(1.6, -1.2, -2.2, P(0, 0)); person(-3, -2, Math.PI + .6, P(0, 1, { skirt: true }));
  },
};

// ---------------- WEATHER ----------------
ROOMS['weather'] = {
  W: 20, D: 16, walls: { back: 'white', left: 'white', right: 'glass' }, wood: [120, 72, 44],
  cam: { x: -2.4, z: 7.2, lx: 1.2, lz: -8 },
  build(){
    sign(['THE WEATHER ANNEX', 'The nation’s weather service, 1870 to 1891'], 'back', -1, 4.05, { w: 5 });
    row('back', [['assets/nara/wx-greely-card.jpg', 'A Signal Service weather card'], ['assets/nara/wx-gievres-1919.jpg', 'Weather station at Gièvres, 1919'], ['assets/nara/wx-omaha-theodolite.jpg', 'Theodolite at Omaha Beach']], 2.2, 1.6, -1, 3.8);
    picture('assets/nara/wx-met-operations.jpg', 'left', -2.4, 2.2, 1.7, { alt: 'Meteorological operations' });
    // an instrument shelter and an anemometer mast
    const ws = mat(0xf2f2ee, { roughness: .8 });
    for (let k = 0; k < 4; k++) box(.05, 1.0, .05, ws, 2.6 + (k % 2) * .8, .5, -4.2 + (k > 1 ? .6 : 0));
    box(.9, .8, .7, ws, 3.0, 1.4, -3.9); box(1.0, .06, .8, ws, 3.0, 1.84, -3.9);
    for (let s = 0; s < 6; s++) box(.92, .02, .02, M.black, 3.0, 1.05 + s * .12, -3.54);
    blob(3, -3.9, .8, .6, .5);
    cyl(.03, .03, 3.4, M.black, 5.4, 1.7, -2.8, 8);
    for (let a = 0; a < 3; a++){ const arm = cyl(.01, .01, .7, M.black, 5.4 + Math.cos(a * 2.1) * .35, 3.4, -2.8 + Math.sin(a * 2.1) * .35, 6); arm.rotation.set(0, -a * 2.1, Math.PI / 2); const cup = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 8, 0, 7, 0, 1.6), M.black); cup.position.set(5.4 + Math.cos(a * 2.1) * .7, 3.4, -2.8 + Math.sin(a * 2.1) * .7); scene.add(cup); }
    // theodolite on a tripod
    const tg = group(-.6, 0, -3.4, .4);
    [0, 2.1, 4.2].forEach(a => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1.4, 8), M.timber); l.position.set(Math.cos(a) * .28, .65, Math.sin(a) * .28); l.rotation.set(Math.sin(a) * .4, 0, -Math.cos(a) * .4); tg.add(l); });
    const tb = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, .3, 16), mat(0xb08d57, { metalness: .8, roughness: .3 })); tb.position.y = 1.45; tg.add(tb);
    const sc = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .4, 12), M.black); sc.rotation.z = Math.PI / 2; sc.position.y = 1.65; tg.add(sc);
    caseOn(-5.4, -3.6, { item: item.book(0x29405e) }); caseOn(-5.4, -1.8, { item: item.machine(0xb08d57) });
    person(1.2, -4.8, Math.PI, P(0, 4)); person(-2.6, -1.2, Math.PI + .6, P(0, 2, { skirt: true }));
  },
};

// ---------------- FORT GORDON, THEN AND NOW ----------------
ROOMS['fort-gordon'] = {
  W: 24, D: 18, walls: { back: 'brick', left: 'white', right: 'white' }, wood: [104, 60, 36], posts: [[-4, -1], [4, -1]],
  cam: { x: 0, z: 8.2, lz: -9 },
  build(){
    sign(['FORT GORDON', 'Then and Now'], 'back', 0, 4.05, { w: 4.4, bg: '#1d1d1f' });
    row('back', [['assets/fort-gordon/camp-gordon-1917.jpg', 'Camp Gordon, 1917'], ['assets/fort-gordon/people/gordon.jpg', 'Maj. Gen. John B. Gordon'], ['assets/nara/fg-signal-towers-sunset-2003.jpg', 'Signal Towers, 2003']], 2.25, 1.75, 0, 5);
    row('left', [['assets/fort-gordon/nurses-camp-gordon-1918.jpg', 'Nurses of Camp Gordon, 1918'], ['assets/fort-gordon/10ad-bastogne-1944.jpg', 'The 10th Armored Division at Bastogne'], ['assets/fort-gordon/people/shughart.jpg', 'Sgt. 1st Class Randall Shughart']], 2.2, 1.45, -3, 3.6);
    row('right', [['assets/fort-gordon/uss-augusta-1942.jpg', 'USS Augusta, 1942'], ['assets/fort-gordon/people/eisenhower.jpg', 'Dwight D. Eisenhower']], 2.2, 1.45, -4, 3.6);
    // a model of USS Augusta in a long case
    const cx = 3.4, cz = -3.6;
    box(3.2, .95, 1.0, M.marble, cx, .475, cz); blob(cx, cz, 2.2, .8, .6);
    const gl = box(3.1, .7, .9, M.glass, cx, 1.32, cz); gl.castShadow = false;
    const hull = new THREE.Mesh(new THREE.BoxGeometry(2.6, .16, .3), mat(0x6c727a, { metalness: .3 })); hull.position.set(cx, 1.08, cz); scene.add(hull);
    box(.6, .14, .18, mat(0x6c727a), cx - .1, 1.22, cz); box(.12, .25, .1, mat(0x6c727a), cx - .1, 1.36, cz); cyl(.02, .02, .3, M.black, cx + .3, 1.35, cz, 6);
    // a gate sign
    const gs = group(-3.6, 0, -4.2, .5);
    [-1, 1].forEach(k => { const p = new THREE.Mesh(new THREE.BoxGeometry(.5, 1.1, .5), M.brick); p.position.set(k * 1.3, .55, 0); p.castShadow = true; gs.add(p); });
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.1, .6), std({ map: textTex(['FORT GORDON'], { bg: '#f2efe6', fg: '#1d3b2a', size: 120 }) })); pl.position.set(0, .7, .05); gs.add(pl);
    const pb = new THREE.Mesh(new THREE.BoxGeometry(2.3, .7, .08), M.timber); pb.position.set(0, .7, 0); gs.add(pb);
    blob(-3.6, -4.2, 2, .6, .5);
    person(.2, -5.2, Math.PI, P(0, 0)); person(-6.4, -1, -Math.PI / 2 - .3, P(0, 1)); person(2, -.6, Math.PI - .3, P(0, 2, { skirt: true }));
  },
};

// ---------------- WIRELESS ----------------
ROOMS['wireless'] = {
  W: 20, D: 16, walls: { back: 'white', left: 'brick' }, wood: [104, 60, 36],
  cam: { x: 2.6, z: 7.2, lx: -1.2, lz: -8 },
  build(){
    sign(['THE WIRELESS RADIO ANNEX'], 'back', 0, 4.1, { w: 4.6, h: .7, size: 96 });
    row('back', [['assets/annex/radio-camp-vail-labs.jpg', 'Radio laboratories at Camp Vail'], ['assets/annex/radio-walkie-talkie-normandy-1944.jpg', 'Walkie-talkie, Normandy, 1944'], ['assets/annex/radio-scr300-korea-1950.jpg', 'SCR-300, Korea, 1950'], ['assets/annex/radio-prc25-vietnam-1967.jpg', 'PRC-25, Vietnam, 1967']], 2.2, 1.45, 0, 4);
    row('left', [['assets/nara/wl-scr270-moresby-1943.jpg', 'SCR-270 radar, Port Moresby, 1943'], ['assets/nara/wl-sincgars-class-1990.jpg', 'SINCGARS class, 1990']], 2.2, 1.5, -2.6, 4.2);
    picture('assets/nara/wl-sincgars-1994.jpg', 'right', -3.6, 2.2, 1.5, { alt: 'SINCGARS, 1994' });
    // a lattice radio mast
    const mg = group(-3.4, 0, -3.4, 0); const st = mat(0xb3121f, { metalness: .4, roughness: .5 }), wh = mat(0xf2f2f2);
    for (let s = 0; s < 8; s++){ [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .5, 6), s % 2 ? wh : st); l.position.set(a * .18, .25 + s * .5, b * .18); mg.add(l); }); }
    for (let y = .5; y < 4; y += .5) [0, Math.PI / 2].forEach(r => { const br = new THREE.Mesh(new THREE.BoxGeometry(.4, .02, .02), wh); br.position.y = y; br.rotation.y = r; mg.add(br); });
    const lt = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 8), new THREE.MeshBasicMaterial({ color: 0xff3020 })); lt.position.y = 4.05; mg.add(lt);
    blob(-3.4, -3.4, .6, .6, .5);
    caseOn(1.6, -3.6, { item: item.radio() }); caseOn(3.2, -3.6, { item: item.radio() }); caseOn(4.8, -3.6, { item: item.phone() });
    person(.4, -1.6, Math.PI + .4, P(0, 4)); person(3.2, -1.8, Math.PI - .2, P(0, 0)); person(-1.2, -4.8, Math.PI - .2, P(0, 2, { skirt: true }));
  },
};

// ---------------- WIRED ----------------
ROOMS['wired'] = {
  W: 20, D: 16, walls: { back: 'brick', left: 'white', right: 'white' }, wood: [96, 56, 34],
  cam: { x: -2.6, z: 7.2, lx: 1.2, lz: -8 },
  build(){
    sign(['THE WIRED COMMUNICATIONS ANNEX'], 'back', 1, 4.15, { w: 5, h: .7, size: 90 });
    row('back', [['assets/annex/wire-linemen-menil-la-tour-1918.jpg', 'Linemen at Menil-la-Tour, 1918'], ['assets/annex/wire-operators-toul-1919.jpg', 'Operators at Toul, 1919'], ['assets/nara/wd-switchboard-france-1944.jpg', 'Switchboard in France, 1944']], 2.2, 1.5, 1, 4.4);
    row('right', [['assets/nara/wd-alaska-map-1930.jpg', 'The Alaska system'], ['assets/nara/wd-wire-truck-1933.jpg', 'Wire truck, 1933']], 2.2, 1.5, -3, 4.2);
    picture('assets/annex/wire-lineman-prauthoy-1919.jpg', 'left', -3.2, 2.2, 1.6, { alt: 'Lineman at Prauthoy, 1919' });
    picture('assets/annex/wire-field-telephones.jpg', 'left', 1, 2.2, 1.3, { alt: 'Field telephones' });
    // a telegraph pole with crossarms and glass insulators
    const px = -3.6, pz = -4.6, wood = mat(0x5e4630, { roughness: .95 });
    cyl(.13, .16, 4.6, wood, px, 2.3, pz, 14); blob(px, pz, .5, .5, .6);
    [3.9, 3.4].forEach(y => { box(1.8, .1, .12, wood, px, y, pz); for (let i = -2; i <= 2; i++){ if (!i) continue; cyl(.035, .045, .13, std({ color: 0x5fae9e, transparent: true, opacity: .8, roughness: .1 }), px + i * .38, y + .12, pz, 10); } });
    // a cable reel and field telephones in cases
    const rl = group(-.8, 0, -3.2, .6);
    [-.35, .35].forEach(k => { const d = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, .06, 28), wood); d.rotation.x = Math.PI / 2; d.position.set(0, .6, k); d.castShadow = true; rl.add(d); });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .64, 28), mat(0x1d1d1d, { roughness: .7 })); core.rotation.x = Math.PI / 2; core.position.y = .6; rl.add(core);
    blob(-.8, -3.2, .8, .6, .5);
    caseOn(3.4, -3.4, { item: item.phone() }); caseOn(5, -3.4, { item: item.phone() });
    person(1.6, -4.6, Math.PI, P(0, 3)); person(-1.6, -.8, Math.PI - .5, P(0, 1)); person(4.2, -1.4, Math.PI + .3, P(0, 2, { skirt: true }));
  },
};

// ---------------- CODES ----------------
ROOMS['codes'] = {
  W: 18, D: 14, walls: { back: 'dark', left: 'brick', right: 'dark' }, floor: 'concrete', trim: false, hemi: .2, fill: .25,
  cam: { x: 2.4, z: 6.2, lx: -.8, lz: -7 },
  build(){
    sign(['CODING AND ENCRYPTION', 'Keeping the message secret'], 'back', 0, 4.05, { w: 4.8, bg: '#24262a', fg: '#e0bc4a' });
    // a big cipher disk on the back wall
    const disk = canvasTex(1024, 1024, (g, w, h) => {
      g.fillStyle = '#24262a'; g.fillRect(0, 0, w, h);
      const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      [[480, '#e8e2d2', '#1d1d1f', 0], [370, '#c9a227', '#1d1d1f', 7]].forEach(([r, bg, fg, sh]) => {
        g.fillStyle = bg; g.beginPath(); g.arc(512, 512, r, 0, 7); g.fill();
        g.strokeStyle = '#1d1d1f'; g.lineWidth = 4; g.stroke();
        g.fillStyle = fg; g.font = 'bold 54px Georgia'; g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let i = 0; i < 26; i++){ const a = i / 26 * Math.PI * 2 - Math.PI / 2; g.save(); g.translate(512 + Math.cos(a) * (r - 50), 512 + Math.sin(a) * (r - 50)); g.rotate(a + Math.PI / 2); g.fillText(A[(i + sh) % 26], 0, 0); g.restore(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2; g.beginPath(); g.moveTo(512 + Math.cos(a + .12) * r, 512 + Math.sin(a + .12) * r); g.lineTo(512 + Math.cos(a + .12) * (r - 100), 512 + Math.sin(a + .12) * (r - 100)); g.stroke(); }
      });
      g.fillStyle = '#24262a'; g.beginPath(); g.arc(512, 512, 250, 0, 7); g.fill(); g.fillStyle = '#c9a227'; g.beginPath(); g.arc(512, 512, 30, 0, 7); g.fill();
    });
    const dk = new THREE.Mesh(new THREE.CircleGeometry(1.4, 64), std({ map: disk, emissive: 0xffffff, emissiveMap: disk, emissiveIntensity: .2, roughness: .5 })); dk.position.set(-2.8, 2.2, -6.93); scene.add(dk);
    const sd = new THREE.SpotLight(0xffe8c0, 3, 9, .4, .5); sd.position.set(-2.8, 4.6, -4.6); sd.target.position.set(-2.8, 2.2, -7); scene.add(sd, sd.target);
    picture('assets/nara/cd-friedman-hebern-1933.jpg', 'back', 2.4, 2.2, 1.7, { alt: 'William Friedman and the Hebern machine, 1933' });
    screen(-8.94, 2.3, -2.4, Math.PI / 2, 2.6, 1.46, screenTex(['ENIGMA · SIGABA · MI-8', 'Code makers and code breakers'], { bg: '#0a1410', fg: '#7dffb0', font: 'Courier New, monospace', size: 70, sub: .45 }));
    // Enigma and SIGABA under glass
    const enigma = (x, y, z) => { box(.42, .14, .34, mat(0x2a2a2a, { roughness: .4 }), x, y + .07, z); for (let i = 0; i < 3; i++) cyl(.045, .045, .03, mat(0xbfb9a8), x - .08 + i * .08, y + .16, z - .08, 16).rotation.x = Math.PI / 2; box(.36, .02, .14, mat(0x111111), x, y + .15, z + .07); };
    caseOn(1.2, -3.2, { item: enigma, w: 1.0 }); caseOn(3, -3.2, { item: item.machine(0x3a3d34), w: 1.0 }); caseOn(4.8, -3.2, { item: item.book(0x5a1e1a) });
    person(-1.2, -4.6, Math.PI, P(0, 0)); person(2.2, -1.4, Math.PI - .3, P(0, 4)); person(-3.6, -1.6, Math.PI / 2 + .2, P(0, 2, { skirt: true }));
  },
};

// ---------------- DESERT STORM ----------------
ROOMS['desert-storm'] = {
  W: 22, D: 16, walls: { back: 'white', left: 'white', right: 'brick' }, wallColor: '#ece3d0', floor: 'concrete',
  cam: { x: -2.6, z: 7.2, lx: 1.2, lz: -8 },
  build(){
    sign(['THE NETWORK IN THE SAND', 'Desert Shield & Desert Storm · 1990–1991'], 'back', 0, 4.05, { w: 5.2, bg: '#3b3226', fg: '#f0e2c0' });
    row('back', [['assets/annex/desert-storm-cmh-map11.jpg', 'Map: the buildup'], ['assets/annex/desert-storm-cmh-map13.jpg', 'Map: the shift west'], ['assets/annex/desert-storm-cmh-map15.jpg', 'Map: the hundred hours']], 2.25, 1.75, 0, 4.4);
    picture('assets/nara/ds-uplink.jpg', 'left', -2.8, 2.2, 1.7, { alt: 'Satellite uplink in the desert' });
    picture('assets/annex/desert-storm-cmh-map12.jpg', 'left', 1.6, 2.2, 1.5, { alt: 'Map: the network' });
    sign(['2', 'leased telephone circuits in Saudi Arabia when the buildup began'], 'right', -3.6, 2.4, { w: 2.6, h: 1.4, bg: '#3b3226', fg: '#f0e2c0', size: 300, sub: .12 });
    // a sand-colored tent with a dish and a shelter
    const sand = new THREE.Mesh(new THREE.CircleGeometry(4, 40), std({ color: 0xcbb183, roughness: 1 })); sand.rotation.x = -Math.PI / 2; sand.position.set(1, .01, -3.4); sand.scale.y = .6; scene.add(sand);
    const canvas = mat(0xb59a6a, { roughness: 1, side: THREE.DoubleSide });
    const tent = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.8, 1.8, 4, 1, true), canvas); tent.position.set(-1.6, 1.6, -3.6); tent.rotation.y = Math.PI / 4; tent.castShadow = true; scene.add(tent);
    box(2.4, .8, 2.4, canvas, -1.6, .4, -3.6, Math.PI / 4 * 0);
    box(1.6, 1.3, 2.6, mat(0x8f8160, { roughness: .8 }), 2.4, .65, -4.2, .3);
    cyl(.05, .05, 1, M.black, 4.6, .5, -2.8, 8);
    const d = new THREE.Mesh(new THREE.SphereGeometry(.9, 32, 12, 0, 7, 0, .8), std({ color: 0xd8cfbb, side: THREE.DoubleSide })); d.position.y = -.9; d.castShadow = true; const dg = group(4.6, 1.05, -2.8, -.6); dg.rotation.x = -.6; dg.add(d);
    blob(1, -3.4, 4, 2.4, .35);
    caseOn(-5.6, -2.6, { item: item.radio() }); caseOn(-5.6, -.8, { item: item.helmet() });
    person(.6, -.8, Math.PI + .3, P(0, 4)); person(-3.4, -1.2, Math.PI - .4, P(0, 0)); person(3.4, .2, Math.PI - .6, P(0, 1, { skirt: true }));
  },
};
