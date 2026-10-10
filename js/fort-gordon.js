/*
 * Fort Gordon, Then and Now: opens and closes the room's pop-up panels.
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
})();
