/*
 * Weather Annex: "Read the weather map" activity.
 * Draws a practice map (an imaginary day, not a historical chart) with a storm
 * centered near Chicago, isobars, and a reading at each station, then asks four
 * questions. Wind arrows are computed from the storm, so arrows and answers agree.
 */
(function () {
  var svg = document.getElementById('wx-map');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  function px(lat, lon) { return [20 + (lon + 100) / 34 * 600, 20 + (48 - lat) / 23 * 380]; }

  var STATIONS = [
    ['Omaha', 41.26, -95.94], ['Chicago', 41.88, -87.63], ['St. Louis', 38.63, -90.20],
    ['Memphis', 35.15, -90.05], ['New Orleans', 29.95, -90.07], ['Cincinnati', 39.10, -84.51],
    ['Buffalo', 42.89, -78.88], ['Washington', 38.90, -77.04], ['New York', 40.71, -74.01],
    ['Boston', 42.36, -71.06], ['Augusta', 33.47, -81.97], ['Savannah', 32.08, -81.09]
  ];
  var LOW = px(42.6, -88.6);                 // storm center, just northwest of Chicago
  var RAIN = { 'Chicago': 1, 'Cincinnati': 1, 'Buffalo': 1 };

  function el(name, attrs, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    return n;
  }

  // pressure grows with distance from the storm center
  function pressure(p) { var d = Math.hypot(p[0] - LOW[0], p[1] - LOW[1]); return 29.30 + d * 0.0026; }
  // wind: counterclockwise around the low, turned a little inward (Northern Hemisphere)
  function wind(p) {
    var dx = p[0] - LOW[0], dy = -(p[1] - LOW[1]);          // east, north
    var tx = -dy, ty = dx;                                    // counterclockwise tangent
    var vx = tx - 0.45 * dx, vy = ty - 0.45 * dy;             // plus inflow
    var m = Math.hypot(vx, vy) || 1;
    return [vx / m, vy / m];                                  // direction the wind blows toward
  }
  var POINTS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
  function fromName(v) {                                      // where the wind comes from
    var ang = Math.atan2(-v[0], -v[1]) * 180 / Math.PI;       // bearing of the source, 0 = north
    return POINTS[Math.round(((ang + 360) % 360) / 45) % 8];
  }

  // ---- draw ----
  svg.appendChild(el('rect', { x: 0, y: 0, width: 640, height: 420, class: 'wx-sea' }));
  for (var lon = -95; lon <= -70; lon += 5) { var a = px(48, lon), b = px(25, lon); svg.appendChild(el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'wx-grat' })); }
  for (var lat = 30; lat <= 45; lat += 5) { var c = px(lat, -100), d = px(lat, -66); svg.appendChild(el('line', { x1: c[0], y1: c[1], x2: d[0], y2: d[1], class: 'wx-grat' })); }
  svg.appendChild(el('text', { x: px(31, -71)[0], y: px(31, -71)[1], class: 'wx-water' }, 'Atlantic Ocean'));
  svg.appendChild(el('text', { x: px(26.4, -88)[0], y: px(26.4, -88)[1], class: 'wx-water' }, 'Gulf of Mexico'));

  [29.4, 29.6, 29.8, 30.0, 30.2].forEach(function (p) {
    var r = (p - 29.30) / 0.0026;
    svg.appendChild(el('circle', { cx: LOW[0], cy: LOW[1], r: r, class: 'wx-iso' }));
    svg.appendChild(el('text', { x: LOW[0] + r * 0.707 + 4, y: LOW[1] + r * 0.707, class: 'wx-isolbl' }, p.toFixed(1)));
  });
  svg.appendChild(el('text', { x: LOW[0], y: LOW[1] + 9, class: 'wx-L' }, 'L'));

  var marks = {};
  STATIONS.forEach(function (s) {
    var p = px(s[1], s[2]), v = wind(p), g = el('g', { class: 'wx-st' });
    var x2 = p[0] + v[0] * 22, y2 = p[1] - v[1] * 22;
    g.appendChild(el('line', { x1: p[0], y1: p[1], x2: x2, y2: y2, class: 'wx-arrow' }));
    var ang = Math.atan2(-v[1], v[0]);
    var h1 = [x2 - 7 * Math.cos(ang - 0.45), y2 - 7 * Math.sin(ang - 0.45)], h2 = [x2 - 7 * Math.cos(ang + 0.45), y2 - 7 * Math.sin(ang + 0.45)];
    g.appendChild(el('polygon', { points: x2 + ',' + y2 + ' ' + h1.join(',') + ' ' + h2.join(','), class: 'wx-head' }));
    g.appendChild(el('circle', { cx: p[0], cy: p[1], r: 6, class: RAIN[s[0]] ? 'wx-dot rain' : 'wx-dot' }));
    if (RAIN[s[0]]) for (var i = -1; i <= 1; i++) g.appendChild(el('line', { x1: p[0] + i * 4 - 2, y1: p[1] + 10, x2: p[0] + i * 4 - 4, y2: p[1] + 15, class: 'wx-drop' }));
    var left = s[0] === 'Boston' || s[0] === 'New York' || s[0] === 'Savannah';
    g.appendChild(el('text', { x: p[0] + (left ? -10 : 10), y: p[1] - 2, class: 'wx-name' + (left ? ' end' : '') }, s[0]));
    g.appendChild(el('text', { x: p[0] + (left ? -10 : 10), y: p[1] + 12, class: 'wx-read' + (left ? ' end' : '') }, pressure(p).toFixed(2) + ' in.'));
    svg.appendChild(g);
    marks[s[0]] = g;
  });

  // ---- questions ----
  var aug = fromName(wind(px(33.47, -81.97)));
  var QS = [
    { q: 'Where is the storm centered? Find the station with the lowest barometer reading.',
      a: 'Chicago', c: ['Chicago', 'Augusta', 'Boston', 'New Orleans'], mark: ['Chicago'],
      ok: 'Right. Chicago reads lowest, at the center of the rings of equal pressure. On a Signal Service map that center was the storm.',
      no: 'Look for the smallest barometer number. The pressure rings close in around one city.' },
    { q: 'Look at Augusta’s wind arrow. Which way is the wind coming from?',
      a: 'From the ' + aug, c: ['From the ' + aug].concat(POINTS.filter(function (p) { return p !== aug; }).filter(function (p, i) { return i % 2 === 0; }).slice(0, 3).map(function (p) { return 'From the ' + p; })), mark: ['Augusta'],
      ok: 'Right. Winds turn counterclockwise around a storm in the Northern Hemisphere and drift in toward its center, so Augusta, far to the south, gets wind from the ' + aug + '.',
      no: 'The arrow points the way the wind is blowing. The wind comes from the opposite end.' },
    { q: 'Which stations are reporting rain?',
      a: 'Chicago, Cincinnati and Buffalo', c: ['Chicago, Cincinnati and Buffalo', 'Augusta and Savannah', 'Omaha and St. Louis', 'Boston and New York'], mark: ['Chicago', 'Cincinnati', 'Buffalo'],
      ok: 'Right. The rain falls near the storm and ahead of it, to the east.',
      no: 'Rain is marked by the filled dots with streaks below them.' },
    { q: 'Storms in the United States usually travel from west to east. Which city should get the next storm warning?',
      a: 'Buffalo', c: ['Buffalo', 'Omaha', 'New Orleans', 'Savannah'], mark: ['Buffalo'],
      ok: 'Right. A storm moving east from Chicago reaches the Great Lakes cities next. Warnings like this, sent ahead by telegraph, were what Congress wanted when it gave the job to the Army in 1870.',
      no: 'Follow the storm east from Chicago, across the Great Lakes.' }
  ];

  var stepEl = document.getElementById('wx-step'), qEl = document.getElementById('wx-q'), chEl = document.getElementById('wx-choices'),
      fbEl = document.getElementById('wx-fb'), next = document.getElementById('wx-next'), restart = document.getElementById('wx-restart');
  var at = 0, score = 0;

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function clearMarks() { for (var k in marks) marks[k].classList.remove('hit'); }

  function show() {
    var Q = QS[at]; clearMarks();
    stepEl.textContent = 'Question ' + (at + 1) + ' of ' + QS.length;
    qEl.textContent = Q.q; fbEl.textContent = ''; fbEl.className = 'wx-fb'; chEl.textContent = '';
    next.hidden = true; restart.hidden = true;
    var tried = false;
    shuffle(Q.c).forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'wx-choice'; b.textContent = t;
      b.addEventListener('click', function () {
        if (t === Q.a) {
          if (!tried) score++;
          b.classList.add('right'); fbEl.textContent = Q.ok; fbEl.className = 'wx-fb good';
          Array.prototype.forEach.call(chEl.children, function (x) { x.disabled = true; });
          Q.mark.forEach(function (m) { marks[m] && marks[m].classList.add('hit'); });
          if (at < QS.length - 1) next.hidden = false; else { stepEl.textContent = 'Done: ' + score + ' of ' + QS.length + ' right on the first try.'; restart.hidden = false; }
        } else {
          tried = true; b.classList.add('wrong'); b.disabled = true; fbEl.textContent = Q.no; fbEl.className = 'wx-fb bad';
        }
      });
      chEl.appendChild(b);
    });
  }
  next.addEventListener('click', function () { at++; show(); });
  restart.addEventListener('click', function () { at = 0; score = 0; show(); });
  show();
})();
