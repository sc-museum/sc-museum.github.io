/*
 * Animated telegraph maps. A room places <div class="wm" data-wire-map="KEY"></div>; this file draws the map for
 * window.WIRE_MAPS[KEY] (js/wire-maps-data.js) over an outline from window.WIRE_SHAPES (js/wire-map-shapes.js).
 *
 * Each map is a list of dated steps. Showing a step draws its lines across the map, sends a spark down each
 * one, and puts up its caption. Earlier lines stay on the map, dimmed. Play runs the steps in turn.
 *
 *   places   { key: { name, lon, lat, dx, dy } }      dx, dy nudge the label away from the dot
 *   steps    [ { when, title, text, lines: [ [fromKey, toKey, kind?], ... ] } ]
 *   kinds    { kind: label }                          the key under the map; the first kind is the default
 */
(function () {
  var MAPS = window.WIRE_MAPS, SHAPES = window.WIRE_SHAPES;
  if (!MAPS || !SHAPES) return;
  var NS = 'http://www.w3.org/2000/svg', SECONDS = 9;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function svg(tag, attrs, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(cls, text) { var b = el('button', cls, text); b.type = 'button'; return b; }
  function length(path) { try { return path.getTotalLength() || 0; } catch (e) { return 0; } }

  [].forEach.call(document.querySelectorAll('[data-wire-map]'), function (root) {
    var map = MAPS[root.getAttribute('data-wire-map')]; if (!map) return;
    var shape = SHAPES[map.shape]; if (!shape) return;
    function xy(p) { return [(p.lon - shape.lon0) * shape.cos * shape.k, (shape.lat1 - p.lat) * shape.k]; }
    var kinds = Object.keys(map.kinds || { line: 'Telegraph line' });

    root.setAttribute('data-tour-skip', '');
    var stage = el('div', 'wm-stage');
    var s = svg('svg', { viewBox: '0 0 ' + shape.w + ' ' + shape.h, role: 'img', 'aria-label': map.alt || map.title });
    var land = svg('g', { 'class': 'wm-land' });
    shape.paths.forEach(function (p) { land.appendChild(svg('path', { d: p.d, 'class': 'wm-' + p.c })); });
    s.appendChild(land);
    (map.notes || []).forEach(function (n) { var p = xy(n); s.appendChild(svg('text', { x: p[0], y: p[1], 'class': 'wm-note' + (n.big ? ' big' : '') }, n.text)); });
    var gLines = svg('g', { 'class': 'wm-lines' }), gSparks = svg('g', { 'class': 'wm-sparks' }), gPlaces = svg('g', { 'class': 'wm-places' });
    s.appendChild(gLines); s.appendChild(gSparks); s.appendChild(gPlaces);
    stage.appendChild(s);

    // one <g> of lines per step, and each place appears with the first step that uses it
    var placeEls = {}, firstUse = {};
    var stepLines = map.steps.map(function (st, i) {
      var g = svg('g', { 'class': 'wm-step' }); gLines.appendChild(g);
      return (st.lines || []).map(function (ln) {
        var a = map.places[ln[0]], b = map.places[ln[1]]; if (!a || !b) return null;
        [ln[0], ln[1]].forEach(function (k) { if (firstUse[k] == null) firstUse[k] = i; });
        var p = xy(a), q = xy(b);
        // a gentle bow keeps parallel lines apart
        var mx = (p[0] + q[0]) / 2 + (q[1] - p[1]) * 0.08, my = (p[1] + q[1]) / 2 - (q[0] - p[0]) * 0.08;
        var path = svg('path', { d: 'M' + p[0].toFixed(1) + ',' + p[1].toFixed(1) + 'Q' + mx.toFixed(1) + ',' + my.toFixed(1) + ' ' + q[0].toFixed(1) + ',' + q[1].toFixed(1), 'class': 'wm-line wm-k-' + (ln[2] || kinds[0]) });
        g.appendChild(path);
        return path;
      }).filter(Boolean);
    });
    (map.steps || []).forEach(function (st, i) { (st.places || []).forEach(function (k) { if (firstUse[k] == null) firstUse[k] = i; }); });
    Object.keys(map.places).forEach(function (k) {
      var pl = map.places[k], p = xy(pl), g = svg('g', { 'class': 'wm-place' + (pl.hub ? ' hub' : '') });
      g.appendChild(svg('circle', { cx: p[0], cy: p[1], r: pl.hub ? 6 : 4 }));
      var dx = pl.dx == null ? 8 : pl.dx, dy = pl.dy == null ? 4 : pl.dy;
      g.appendChild(svg('text', { x: p[0] + dx, y: p[1] + dy, 'text-anchor': dx < 0 ? 'end' : 'start' }, pl.name));
      gPlaces.appendChild(g); placeEls[k] = g;
    });

    var cap = el('div', 'wm-cap'); cap.setAttribute('aria-live', 'polite');
    var capWhen = el('div', 'wm-when'), capTitle = el('div', 'wm-title'), capText = el('p', 'wm-text');
    cap.appendChild(capWhen); cap.appendChild(capTitle); cap.appendChild(capText);
    var bar = el('div', 'wm-bar'), prev = btn('wm-btn', '← Back'), play = btn('wm-btn wm-play', '▶ Play'), next = btn('wm-btn', 'Next →'), dots = el('div', 'wm-dots');
    bar.appendChild(prev); bar.appendChild(play); bar.appendChild(next); bar.appendChild(dots);
    var key = el('div', 'wm-key');
    kinds.forEach(function (k) { var i = el('span', 'wm-keyitem'); i.appendChild(el('i', 'wm-swatch wm-k-' + k)); i.appendChild(document.createTextNode((map.kinds || {})[k] || 'Telegraph line')); key.appendChild(i); });
    Object.keys(map.landKey || {}).forEach(function (c) { var i = el('span', 'wm-keyitem'); i.appendChild(el('i', 'wm-box wm-' + c)); i.appendChild(document.createTextNode(map.landKey[c])); key.appendChild(i); });
    root.appendChild(stage); root.appendChild(cap); root.appendChild(bar); root.appendChild(key);
    if (map.source) { var src = el('p', 'wm-src'); src.innerHTML = map.source; root.appendChild(src); }

    var at = -1, timer = null, playing = false, raf = [];
    var dotEls = map.steps.map(function (st, i) {
      var d = btn('wm-dot'); d.setAttribute('aria-label', 'Step ' + (i + 1) + ': ' + st.when + ', ' + st.title);
      d.addEventListener('click', function () { stop(); show(i); }); dots.appendChild(d); return d;
    });

    function spark(path, delay) {
      var len = length(path), dot = svg('circle', { r: 4, 'class': 'wm-spark' }), t0 = null, dur = 1500;
      gSparks.appendChild(dot);
      function tick(t) {
        if (t0 == null) t0 = t + delay;
        var f = (t - t0) / dur;
        if (f < 0) { dot.style.opacity = 0; raf.push(requestAnimationFrame(tick)); return; }
        if (f >= 2.999) { if (dot.parentNode) dot.parentNode.removeChild(dot); return; }
        var pt = path.getPointAtLength((f % 1) * len);                       // three passes down the wire
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y); dot.style.opacity = 1;
        raf.push(requestAnimationFrame(tick));
      }
      raf.push(requestAnimationFrame(tick));
    }

    function show(i) {
      at = Math.max(0, Math.min(map.steps.length - 1, i));
      raf.forEach(cancelAnimationFrame); raf = []; gSparks.textContent = '';
      stepLines.forEach(function (lines, n) {
        lines.forEach(function (path, m) {
          var len = length(path);
          path.style.transition = 'none';
          path.style.strokeDasharray = /wm-k-(cable|leased)/.test(path.getAttribute('class')) ? '' : len;
          path.classList.toggle('old', n < at); path.classList.toggle('now', n === at);
          if (n > at) { path.style.opacity = 0; }
          else if (n < at || still) { path.style.opacity = ''; path.style.strokeDashoffset = 0; }
          else {
            path.style.opacity = ''; path.style.strokeDashoffset = len;
            void path.getBoundingClientRect();
            path.style.transition = 'stroke-dashoffset 1.6s ease ' + (m * 0.25) + 's';
            path.style.strokeDashoffset = 0;
            spark(path, 1500 + m * 250);
          }
        });
      });
      Object.keys(placeEls).forEach(function (k) {
        var f = firstUse[k]; placeEls[k].classList.toggle('on', f != null && f <= at); placeEls[k].classList.toggle('new', f === at);
      });
      // only the current step's places are named, so the labels never pile up
      var cur = {}, stNow = map.steps[at];
      (stNow.lines || []).forEach(function (ln) { cur[ln[0]] = cur[ln[1]] = 1; });
      (stNow.places || []).forEach(function (k) { cur[k] = 1; });
      Object.keys(placeEls).forEach(function (k) { placeEls[k].classList.toggle('cur', !!cur[k]); });
      var st = map.steps[at];
      capWhen.textContent = st.when + ' · step ' + (at + 1) + ' of ' + map.steps.length; capTitle.textContent = st.title; capText.textContent = st.text;
      dotEls.forEach(function (d, n) { d.classList.toggle('done', n < at); d.classList.toggle('now', n === at); });
      prev.disabled = at === 0; next.disabled = at === map.steps.length - 1;
    }
    function stop() { playing = false; clearTimeout(timer); play.textContent = '▶ Play'; root.classList.remove('playing'); }
    function run() {
      playing = true; play.textContent = 'Pause'; root.classList.add('playing');
      if (at >= map.steps.length - 1) show(0);
      (function loop() { timer = setTimeout(function () { if (at + 1 < map.steps.length) { show(at + 1); loop(); } else stop(); }, SECONDS * 1000); })();
    }
    play.addEventListener('click', function () { playing ? stop() : run(); });
    prev.addEventListener('click', function () { stop(); show(at - 1); });
    next.addEventListener('click', function () { stop(); show(at + 1); });
    var room = root.closest('.room');
    if (room && window.MutationObserver) new MutationObserver(function () { if (!room.classList.contains('active')) stop(); else show(at); }).observe(room, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
    show(0);
  });
})();
