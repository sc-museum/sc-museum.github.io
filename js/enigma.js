/*
 * Coding and Encryption Annex: a working replica of a three-rotor Enigma I.
 *
 * Rotors I, II and III (left to right) with reflector B, the wiring of the German
 * Army machine of the 1930s. Ring settings are fixed at A. The plugboard takes up
 * to ten pairs. The machine is its own inverse: set the same start position, type
 * the cipher text, and the plain text comes back.
 *
 * The markup is in rooms/96-codes.html (#enigma); styles are in css/codes.css.
 */
(function () {
  var root = document.getElementById('enigma');
  if (!root) return;

  var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var ROTORS = [
    { name: 'I',   wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
    { name: 'II',  wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
    { name: 'III', wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' }
  ];
  var REFLECTOR = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';
  var ROWS = ['QWERTZUIO', 'ASDFGHJK', 'PYXCVBNML'];   // the Enigma's own key layout

  var pos = [0, 0, 0];       // rotor positions, left to right
  var start = [0, 0, 0];     // where this message began
  var plugs = {};            // letter -> letter, both directions
  var count = 0;

  // ---- the machine ----
  function step() {
    var midAtNotch = A[pos[1]] === ROTORS[1].notch;
    var rightAtNotch = A[pos[2]] === ROTORS[2].notch;
    if (midAtNotch) { pos[0] = (pos[0] + 1) % 26; pos[1] = (pos[1] + 1) % 26; }   // the double step
    else if (rightAtNotch) { pos[1] = (pos[1] + 1) % 26; }
    pos[2] = (pos[2] + 1) % 26;
  }
  function through(c, i, back) {
    var w = ROTORS[i].wiring, p = pos[i];
    var inside = (c + p) % 26;
    var out = back ? w.indexOf(A[inside]) : A.indexOf(w[inside]);
    return (out - p + 26) % 26;
  }
  function plug(ch) { return plugs[ch] || ch; }
  // Press one key: the rotors turn first, then the current runs through.
  function press(ch) {
    step();
    var c = A.indexOf(plug(ch));
    c = through(c, 2); c = through(c, 1); c = through(c, 0);
    c = A.indexOf(REFLECTOR[c]);
    c = through(c, 0, true); c = through(c, 1, true); c = through(c, 2, true);
    return plug(A[c]);
  }
  root.enigmaPress = press;   // for the page's own checks

  // ---- the panel ----
  var windows = [].slice.call(root.querySelectorAll('.en-window'));
  var lampBox = root.querySelector('.en-lamps'), keyBox = root.querySelector('.en-keys');
  var tapeIn = root.querySelector('.en-in'), tapeOut = root.querySelector('.en-out');
  var plugInput = root.querySelector('.en-plugs'), plugNote = root.querySelector('.en-plug-note');
  var status = root.querySelector('.en-status');
  var lamps = {}, lit = null, litTimer = null;

  function build(box, cls, make) {
    ROWS.forEach(function (row) {
      var r = document.createElement('div');
      r.className = 'en-row';
      row.split('').forEach(function (ch) { r.appendChild(make(ch, cls)); });
      box.appendChild(r);
    });
  }
  build(lampBox, 'en-lamp', function (ch, cls) {
    var s = document.createElement('span');
    s.className = cls; s.textContent = ch;
    lamps[ch] = s;
    return s;
  });
  build(keyBox, 'en-key', function (ch, cls) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.textContent = ch;
    b.setAttribute('aria-label', 'Key ' + ch);
    b.addEventListener('click', function () { type(ch); });
    return b;
  });

  function showWindows() {
    windows.forEach(function (w, i) { w.textContent = A[pos[i]]; });
  }
  function group(s) { return s.replace(/(.{5})/g, '$1 ').trim(); }
  function type(ch) {
    var out = press(ch);
    count++;
    tapeIn.textContent = group(tapeIn.textContent.replace(/ /g, '') + ch);
    tapeOut.textContent = group(tapeOut.textContent.replace(/ /g, '') + out);
    if (lit) lit.classList.remove('on');
    lit = lamps[out]; lit.classList.add('on');
    clearTimeout(litTimer);
    litTimer = setTimeout(function () { if (lit) lit.classList.remove('on'); }, 900);
    showWindows();
    status.textContent = ch + ' lights ' + out + '. Rotors now at ' + A[pos[0]] + ' ' + A[pos[1]] + ' ' + A[pos[2]] + '.';
  }
  function clearTapes() {
    tapeIn.textContent = ''; tapeOut.textContent = ''; count = 0;
    if (lit) lit.classList.remove('on');
  }
  function turn(i, by) {
    pos[i] = (pos[i] + by + 26) % 26;
    start = pos.slice();
    clearTapes(); showWindows();
    status.textContent = 'Start position ' + A[pos[0]] + ' ' + A[pos[1]] + ' ' + A[pos[2]] + '. Type a message.';
  }
  [].forEach.call(root.querySelectorAll('[data-turn]'), function (b) {
    b.addEventListener('click', function () { turn(+b.getAttribute('data-rotor'), +b.getAttribute('data-turn')); });
  });

  // back to the start of this message, ready to decipher what was just made
  root.querySelector('[data-en="rewind"]').addEventListener('click', function () {
    var made = tapeOut.textContent.replace(/ /g, '');
    pos = start.slice(); clearTapes(); showWindows();
    status.textContent = made
      ? 'Rotors back at ' + A[pos[0]] + ' ' + A[pos[1]] + ' ' + A[pos[2]] + '. Type ' + group(made) + ' and the message returns.'
      : 'Rotors back at ' + A[pos[0]] + ' ' + A[pos[1]] + ' ' + A[pos[2]] + '.';
  });
  root.querySelector('[data-en="reset"]').addEventListener('click', function () {
    pos = [0, 0, 0]; start = [0, 0, 0]; plugs = {}; plugInput.value = ''; plugNote.textContent = '';
    clearTapes(); showWindows();
    status.textContent = 'Machine reset: rotors at A A A, no plugs.';
  });

  // plugboard: pairs such as "AB CD"
  plugInput.addEventListener('input', function () {
    var pairs = plugInput.value.toUpperCase().replace(/[^A-Z ]/g, '').split(/\s+/).filter(Boolean);
    var next = {}, bad = '';
    pairs.slice(0, 10).forEach(function (p) {
      if (p.length !== 2 || p[0] === p[1] || next[p[0]] || next[p[1]]) { bad = p; return; }
      next[p[0]] = p[1]; next[p[1]] = p[0];
    });
    if (pairs.length > 10) bad = 'more than ten pairs';
    plugs = next;
    plugNote.textContent = bad ? 'Skipped: ' + bad + '. Each letter can be plugged once, in pairs.' : (pairs.length ? pairs.length + (pairs.length === 1 ? ' cable' : ' cables') + ' plugged.' : '');
  });

  // typing on a real keyboard while the machine has focus
  root.addEventListener('keydown', function (e) {
    if (e.target === plugInput || e.ctrlKey || e.metaKey || e.altKey) return;
    var ch = (e.key || '').toUpperCase();
    if (ch.length === 1 && ch >= 'A' && ch <= 'Z') { e.preventDefault(); type(ch); }
  });

  showWindows();
})();
