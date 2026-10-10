/*
 * Museum map: add rooms here, one line each.
 *
 * Each entry becomes a tile on the floor plan, added in new rows BELOW the
 * tiles already drawn in the lobby's map. Rows hold three tiles. The map grows
 * taller by itself, so nothing else needs to change.
 *
 *   go    the room id: the part after "room-" in the room file's id (room-civil-war -> 'civil-war')
 *   sub   optional: a tab inside the room to open, by its data-sub name (e.g. 'games')
 *   name  full name, used by the map search
 *   lines the tile label, one or two short lines
 *
 * To add a room: add a line, run  perl tools/build-index.pl  and commit index.html with it.
 * Load order: this file must come BEFORE museum.js in src/index.html.
 */
(function () {
  // The Civil War Annex, Satellite Annex and Signal Training Yard are now drawn
  // in the floor plan itself (rooms/01-lobby.html). Use this list for quick
  // additions until a room earns its place in the drawing.
  var MORE_ROOMS = [
    // { go: 'new-room', name: 'New Room Name', lines: ['New Room', 'Name'] },
  ];

  var svg = document.getElementById('museum-map-svg') || document.querySelector('.map-svg-wrap svg');
  if (!svg || !MORE_ROOMS.length) return;
  var NS = 'http://www.w3.org/2000/svg';
  var vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number);
  if (vb.length !== 4 || isNaN(vb[3])) return;
  var W = vb[2], H = vb[3];

  var TILE_W = 228, TILE_H = 102, GAP = 12, X0 = 16, PER_ROW = 3, MARGIN = 16;
  var startY = H - MARGIN + GAP;            // first new row sits one gap below the old last row
  var rows = Math.ceil(MORE_ROOMS.length / PER_ROW);

  MORE_ROOMS.forEach(function (r, i) {
    var col = i % PER_ROW, row = Math.floor(i / PER_ROW);
    var x = X0 + col * (TILE_W + GAP), y = startY + row * (TILE_H + GAP);
    var g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'map-room');
    g.setAttribute('data-goto', r.go);
    if (r.sub) g.setAttribute('data-avsub', r.sub);   // open a tab inside the room
    g.setAttribute('data-roomname', r.name);
    var rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('x', x); rect.setAttribute('y', y);
    rect.setAttribute('width', TILE_W); rect.setAttribute('height', TILE_H); rect.setAttribute('rx', 2);
    g.appendChild(rect);
    var lines = r.lines && r.lines.length ? r.lines : [r.name];
    var cx = x + TILE_W / 2, cy = y + TILE_H / 2;
    lines.forEach(function (t, k) {
      var tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', cx);
      tx.setAttribute('y', lines.length === 1 ? cy + 5 : cy - 5 + k * 20);
      tx.textContent = t;
      g.appendChild(tx);
    });
    svg.appendChild(g);
  });

  var newH = startY + rows * (TILE_H + GAP) - GAP + MARGIN;
  svg.setAttribute('viewBox', vb[0] + ' ' + vb[1] + ' ' + W + ' ' + newH);
  // grow the outer wall rectangle (the first rect with no data-goto parent) by the same amount
  var wall = svg.querySelector('rect');
  if (wall && !wall.parentNode.getAttribute('data-goto')) {
    var wh = parseFloat(wall.getAttribute('height'));
    if (!isNaN(wh)) wall.setAttribute('height', wh + (newH - H));
  }
})();
