/*
 * Desert Shield & Desert Storm Annex: the network stack and the two-phase map.
 * Lobby: the Arc of History timeline's Earlier / Later buttons.
 * Room navigation itself is handled by museum.js through data-goto.
 */
(function () {
  // ---- network stack: one pane per level ----
  var net = document.querySelector('#room-desert-storm .ds-net');
  if (net) {
    var tiers = net.querySelectorAll('.ds-tier');
    var panes = net.querySelectorAll('.ds-pane');
    function show(key) {
      tiers.forEach(function (t) { t.setAttribute('aria-selected', t.getAttribute('data-tier') === key ? 'true' : 'false'); });
      panes.forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== key; });
    }
    tiers.forEach(function (t) {
      t.addEventListener('click', function () { show(t.getAttribute('data-tier')); });
    });
  }

  // ---- map: shift west / ground war ----
  var map = document.querySelector('#room-desert-storm .ds-map');
  if (map) {
    var svg = map.querySelector('.ds-map-svg');
    var btns = map.querySelectorAll('.ds-map-tabs button');
    var capShift = map.querySelector('.ds-cap-shift'), capAttack = map.querySelector('.ds-cap-attack');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var phase = b.getAttribute('data-phase');
        btns.forEach(function (x) { var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-selected', on ? 'true' : 'false'); });
        svg.setAttribute('data-phase', phase);
        capShift.hidden = phase !== 'shift';
        capAttack.hidden = phase !== 'attack';
        // replay the arrows
        var layer = svg.querySelector(phase === 'shift' ? '.ds-shift' : '.ds-attack');
        layer.querySelectorAll('.ds-move').forEach(function (m) {
          m.style.animation = 'none'; void m.getBoundingClientRect(); m.style.animation = 'ds-draw 1.4s ease-out both';
        });
      });
    });
  }

  // ---- lobby: Arc of History, Earlier / Later ----
  var rail = document.getElementById('arc-rail');
  if (rail) {
    document.querySelectorAll('[data-arc]').forEach(function (b) {
      b.addEventListener('click', function () {
        var step = rail.clientWidth * 0.8 * (b.getAttribute('data-arc') === 'prev' ? -1 : 1);
        rail.scrollBy({ left: step, behavior: 'smooth' });
      });
    });
    var sizeLine = function () { rail.style.setProperty('--arc-w', rail.scrollWidth + 'px'); };
    sizeLine(); window.addEventListener('resize', sizeLine);
    // the Lobby may be hidden when this runs (a link straight to another room), so measure again when it shows
    if (window.ResizeObserver) new ResizeObserver(sizeLine).observe(rail);
  }
})();
