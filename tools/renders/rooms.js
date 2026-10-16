/* global THREE, M, box, cyl, group, picture, sign, caseOn, person, bench, panelWall, std, textTex, canvasTex, W, D, H */
const ROOMS = {};

// a small item for a case
const item = {
  book: c => (x, y, z) => box(.32, .05, .24, std({ color: c || 0x6b2a1e }), x, y + .03, z),
  medal: () => (x, y, z) => { box(.3, .02, .22, std({ color: 0x1f3a6b }), x, y + .01, z); cyl(.05, .05, .015, std({ color: 0xc9a227, metalness: .8, roughness: .3 }), x, y + .03, z); },
  radio: () => (x, y, z) => { box(.36, .26, .2, std({ color: 0x4a5236, roughness: .7 }), x, y + .13, z); cyl(.004, .004, .45, M.black, x + .12, y + .45, z, 6); },
  phone: () => (x, y, z) => { box(.28, .14, .2, std({ color: 0x3b3a2c }), x, y + .07, z); cyl(.03, .03, .2, M.black, x, y + .17, z, 10).rotation.z = Math.PI / 2; },
  helmet: () => (x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.15, 20, 12, 0, 7, 0, 1.5), std({ color: 0x4f5634, roughness: .8 })); m.position.set(x, y, z); m.castShadow = true; scene.add(m); },
  reel: () => (x, y, z) => { const r = cyl(.14, .14, .03, std({ color: 0x8a8d92, metalness: .7, roughness: .3 }), x, y + .15, z, 28); r.rotation.x = Math.PI / 2; },
  machine: c => (x, y, z) => { box(.4, .16, .3, std({ color: c || 0x2b2b2b }), x, y + .08, z); for (let i = 0; i < 3; i++) cyl(.05, .05, .03, std({ color: 0xbfb9a8 }), x - .1 + i * .1, y + .18, z - .06, 16).rotation.x = Math.PI / 2; },
  dish: () => (x, y, z) => { cyl(.015, .02, .2, M.black, x, y + .1, z, 8); const d = new THREE.Mesh(new THREE.SphereGeometry(.16, 20, 10, 0, 7, 0, .9), std({ color: 0xe8e8e8, side: THREE.DoubleSide })); d.position.set(x, y + .32, z); d.rotation.x = -.9; scene.add(d); },
};
const people = [
  { top: 0x7a1f24, leg: 0x3d4a66, skin: 0xd2a07a, hair: 0xc9c2b8 },
  { top: 0x1c1c1c, leg: 0x1c1c1c, skin: 0x8a5a3c, hair: 0x120c08 },
  { top: 0xe9e4da, leg: 0x8a7b5d, skin: 0xc58e6a, hair: 0x3a2516 },
  { top: 0x2f4a3a, leg: 0x23252b, skin: 0xe0b08c, hair: 0x6b4423 },
  { top: 0x2a3f6b, leg: 0x2b2b2b, skin: 0x6e4630, hair: 0x0f0a07 },
];

// ---------------- HELLO GIRLS ----------------
ROOMS['hello-girls'] = {
  W: 18, D: 14, walls: { back: "white", left: "brick" },
  cam: { x: 3.2, z: 6.2, lx: -1.2, lz: -7 },
  build(){
    sign(['THE HELLO GIRLS', '223 women · 1918'], 'back', 0, 3.75, { w: 4.2, bg: '#1f1f22' });
    picture('assets/hello_girl.jpg', 'back', 0, 2.05, 2.1, { alt: 'Hello Girls film poster' });
    picture('assets/nara/hg-paris-exchange-1919.jpg', 'back', -4.6, 2.0, 1.5, { alt: 'Paris telephone exchange, 1919' });
    picture('assets/nara/hg-chaumont-1919.jpg', 'back', 4.6, 2.0, 1.5, { alt: 'Operators at Chaumont, 1919' });
    picture('assets/nara/hg-bassens-1919.jpg', 'left', -1.5, 2.0, 1.6, { alt: 'Operators at Bassens, 1919' });
    // a 1918 switchboard, the centrepiece
    const sw = group(-3.2, 0, -2.4, .5);
    const wood = std({ color: 0x3d2214, roughness: .4 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.1, .7), wood); body.position.y = .55; body.castShadow = true; sw.add(body);
    const face = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, .22), wood); face.position.set(0, 1.6, -.24); face.castShadow = true; sw.add(face);
    const jacks = canvasTex(512, 220, (g, w, h) => { g.fillStyle = '#1a1410'; g.fillRect(0, 0, w, h); for (let r = 0; r < 7; r++) for (let c = 0; c < 22; c++){ g.fillStyle = '#c9a227'; g.beginPath(); g.arc(14 + c * 22.5, 16 + r * 29, 5, 0, 7); g.fill(); g.fillStyle = '#000'; g.beginPath(); g.arc(14 + c * 22.5, 16 + r * 29, 2.4, 0, 7); g.fill(); } });
    const jp = new THREE.Mesh(new THREE.PlaneGeometry(2.2, .9), std({ map: jacks })); jp.position.set(0, 1.6, -.12); sw.add(jp);
    for (let i = 0; i < 10; i++){ const c = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .14, 8), std({ color: 0x111111 })); c.position.set(-1 + i * .22, 1.14, .1); sw.add(c); }
    [-.5, .5].forEach(k => { const st = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .05, 16), M.timber); st.position.set(k, .62, .75); sw.add(st); const lg = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .6, 8), M.black); lg.position.set(k, .3, .75); sw.add(lg); });
    caseOn(3.6, -3.4, { item: item.phone() });
    caseOn(5.4, -3.4, { item: item.medal() });
    caseOn(5.4, -1.4, { item: item.book(0x29405e) });
    person(-.6, -1.6, Math.PI + .3, people[0]);
    person(-1.9, -4.6, Math.PI + .2, Object.assign({ skirt: true }, people[2]));
    person(3.4, .6, Math.PI - .8, people[1]);
  },
};
