/*
 * Map pop-outs: every drawn map in the museum opens in a large pop-out panel.
 *
 * To make a map pop out, mark its outer element in the room file:
 *   data-map-pop="Title of the map"
 * This script puts a "Pop out map" button above it. Pressing the button moves the
 * live map, with its own buttons and animation, into a <dialog> beside its old
 * place (so the room's styles still reach it) and moves it back on close.
 * Escape, the Close button and a click on the dimmed backdrop all close the panel.
 *
 * Scanned maps are pictures, so they use the lightbox instead: data-lightbox in
 * js/museum.js, with data-lightbox-wide for the larger frame.
 * Load order: after every script that builds a map.
 */
(function () {
  var maps = document.querySelectorAll('[data-map-pop]');
  if (!maps.length || !window.HTMLDialogElement) return;
  var open = null;   // the panel now showing, if any

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // the drawing itself: the largest svg inside the map
  function mainSvg(map) {
    var best = null, area = 0;
    [].forEach.call(map.querySelectorAll('svg'), function (s) {
      var r = s.getBoundingClientRect(), a = r.width * r.height;
      if (a > area) { area = a; best = s; }
    });
    return best;
  }

  [].forEach.call(maps, function (map) {
    var title = map.getAttribute('data-map-pop') || 'Map';

    var bar = el('div', 'map-pop-bar'); bar.setAttribute('data-tour-skip', '');
    var btn = el('button', 'map-pop-btn', '⤢ Pop out map'); btn.type = 'button';
    btn.setAttribute('aria-label', 'Pop out map: ' + title);
    bar.appendChild(btn);
    map.parentNode.insertBefore(bar, map);

    var dlg = el('dialog', 'map-pop'); dlg.setAttribute('aria-label', title); dlg.setAttribute('data-tour-skip', '');
    var head = el('div', 'map-pop-head');
    head.appendChild(el('span', 'map-pop-title', title));
    var x = el('button', 'map-pop-x', 'Close ✕'); x.type = 'button';
    head.appendChild(x);
    var body = el('div', 'map-pop-body');
    dlg.appendChild(head); dlg.appendChild(body);
    map.parentNode.insertBefore(dlg, map.nextSibling);

    // keeps the map's place in the room while it is out
    var hold = el('div', 'map-pop-hold', 'This map is open in the pop-out.');

    btn.addEventListener('click', function () {
      if (dlg.open) return;
      var mapBox = map.getBoundingClientRect(), svg = mainSvg(map), width = '';
      if (svg) {
        // size the panel so the whole drawing fits the window (its caption may scroll),
        // unless the drawing sits beside a text panel (then use the full width)
        var s = svg.getBoundingClientRect(), vb = svg.viewBox && svg.viewBox.baseVal;
        if (vb && vb.height && s.width > mapBox.width * 0.8) {
          var above = Math.max(0, s.top - mapBox.top) + 112;   // the map's own buttons above the drawing, plus the panel's bar and edges
          var fit = (window.innerHeight - above) * (vb.width / vb.height) + 30;
          width = Math.max(Math.min(900, window.innerWidth - 24), Math.min(1240, window.innerWidth - 24, fit)) + 'px';
        }
      }
      dlg.style.width = width;
      hold.style.minHeight = Math.round(mapBox.height) + 'px';
      map.parentNode.insertBefore(hold, map);
      body.appendChild(map);
      dlg.showModal();
      body.scrollTop = 0;
      open = dlg;
    });

    dlg.addEventListener('close', function () {
      if (hold.parentNode) { hold.parentNode.insertBefore(map, hold); hold.parentNode.removeChild(hold); }
      if (open === dlg) open = null;
      if (btn.offsetParent) btn.focus();
    });
    x.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) { dlg.close(); return; }              // the backdrop
      if (e.target.closest('[data-goto]')) dlg.close();           // a room on the floor plan: go there
    });
  });

  // leaving the room by a link or the Back button closes the panel
  window.addEventListener('hashchange', function () { if (open) open.close(); });
})();
