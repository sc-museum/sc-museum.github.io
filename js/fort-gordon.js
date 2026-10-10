/*
 * Fort Gordon, Then and Now: opens and closes the room's pop-up panels, and tilts its framed photographs.
 *
 * The panels are <dialog> elements written out in rooms/93-fort-gordon.html.
 *   data-fg-open="id"   on a button: open that panel (closing the one it sits in)
 *   data-fg-close       on a button: close the panel it sits in
 * A click on the dimmed backdrop closes the panel too; Escape is the browser's own.
 */
(function () {
  var room = document.getElementById('room-fort-gordon');
  if (!room) return;

  function show(d) {
    if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    d.scrollTop = 0;
    var inner = d.querySelector('.fg-dlg-in'); if (inner) inner.scrollTop = 0;
  }
  function hide(d) {
    if (d.close) d.close(); else d.removeAttribute('open');
  }

  room.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-fg-open]');
    if (opener) {
      var next = document.getElementById(opener.getAttribute('data-fg-open'));
      if (!next) return;
      var cur = opener.closest('dialog');
      if (cur) hide(cur);
      show(next);
      return;
    }
    var closer = e.target.closest('[data-fg-close]');
    if (closer) { hide(closer.closest('dialog')); return; }
    if (e.target.tagName === 'DIALOG') hide(e.target);   // the backdrop
  });

  // photographs: tilt each frame toward the pointer, and move the light across the glass
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!still) [].forEach.call(room.querySelectorAll('.fg-photo'), function (fig) {
    fig.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      var r = fig.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      fig.classList.add('tracking');
      fig.style.setProperty('--ry', ((x - 0.5) * 18).toFixed(2) + 'deg');
      fig.style.setProperty('--rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
      fig.style.setProperty('--gx', (x * 100).toFixed(0) + '%');
      fig.style.setProperty('--gy', (y * 100).toFixed(0) + '%');
    });
    fig.addEventListener('pointerleave', function () {
      fig.classList.remove('tracking');
      ['--rx', '--ry', '--gx', '--gy'].forEach(function (p) { fig.style.removeProperty(p); });
    });
  });
})();
