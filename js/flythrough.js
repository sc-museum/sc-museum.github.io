/*
 * Lobby fly-through: a camera move through the architect's renderings of the museum to come.
 *
 * Each scene is written out in rooms/01-lobby.html as a .fly-scene holding one image, with its
 * caption in data-k / data-t / data-d and its camera move in CSS variables on the element:
 *   --ox, --oy   the point the camera pushes toward
 *   --from, --to the zoom at the start and the end of the scene
 * To add a stop, add a .fly-scene; nothing here needs to change.
 */
(function () {
  var root = document.getElementById('fly');
  if (!root) return;
  var scenes = [].slice.call(root.querySelectorAll('.fly-scene'));
  if (!scenes.length) return;

  var SECONDS = 8;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cap = { k: root.querySelector('.fly-cap .k'), t: root.querySelector('.fly-cap .t'), d: root.querySelector('.fly-cap .d') };
  var capBox = root.querySelector('.fly-cap');
  var startCard = root.querySelector('.fly-start'), endCard = root.querySelector('.fly-end');
  var playBtn = root.querySelector('[data-fly="play"]'), prevBtn = root.querySelector('[data-fly="prev"]'), nextBtn = root.querySelector('[data-fly="next"]');
  var dotsBox = root.querySelector('.fly-dots');
  var at = -1, playing = false, timer = null, left = 0, since = 0;

  root.style.setProperty('--dur', SECONDS + 's');
  var dots = scenes.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'fly-dot';
    b.setAttribute('aria-label', 'Stop ' + (i + 1) + ' of ' + scenes.length + ': ' + s.getAttribute('data-t'));
    b.appendChild(document.createElement('i'));
    b.addEventListener('click', function () { show(i); play(); });
    dotsBox.appendChild(b);
    return b;
  });

  function show(i) {
    clearTimeout(timer);
    at = i;
    scenes.forEach(function (s, n) {
      var on = n === i;
      if (on) {
        // restart the camera move from its first frame
        s.classList.remove('move');
        void s.offsetWidth;
        s.classList.add('on');
        if (!still) requestAnimationFrame(function () { s.classList.add('move'); });
      } else {
        s.classList.remove('on');
      }
    });
    dots.forEach(function (d, n) {
      d.classList.remove('now'); void d.offsetWidth;
      d.classList.toggle('done', n < i);
      d.classList.toggle('now', n === i);
    });
    var s = scenes[i];
    cap.k.textContent = 'Stop ' + (i + 1) + ' of ' + scenes.length + ' · ' + s.getAttribute('data-k');
    cap.t.textContent = s.getAttribute('data-t');
    cap.d.textContent = s.getAttribute('data-d');
    capBox.hidden = false;
    startCard.hidden = true; endCard.hidden = true;
    prevBtn.disabled = i === 0;
    nextBtn.disabled = false;
    left = SECONDS * 1000;
  }

  function schedule() {
    clearTimeout(timer);
    since = Date.now();
    timer = setTimeout(function () { at + 1 < scenes.length ? (show(at + 1), schedule()) : finish(); }, left);
  }
  function play() {
    if (at < 0 || !endCard.hidden) show(0);
    playing = true;
    root.classList.remove('paused');
    playBtn.textContent = 'Pause';
    // with reduced motion the visitor steps through by hand
    if (!still) schedule();
  }
  function pause() {
    if (!playing) return;
    playing = false;
    clearTimeout(timer);
    left = Math.max(400, left - (Date.now() - since));
    root.classList.add('paused');
    playBtn.textContent = 'Play';
  }
  function finish() {
    playing = false;
    clearTimeout(timer);
    dots.forEach(function (d) { d.classList.remove('now'); d.classList.add('done'); });
    capBox.hidden = true;
    endCard.hidden = false;
    playBtn.textContent = 'Replay';
    nextBtn.disabled = true;
  }

  playBtn.addEventListener('click', function () { playing ? pause() : play(); });
  prevBtn.addEventListener('click', function () { if (at > 0) { show(at - 1); play(); } });
  nextBtn.addEventListener('click', function () { at + 1 < scenes.length ? (show(at + 1), play()) : finish(); });
  [].forEach.call(root.querySelectorAll('[data-fly="start"]'), function (b) { b.addEventListener('click', function () { show(0); play(); }); });

  // stop the camera when the lobby is not the room on screen
  var lobby = root.closest('.room');
  if (lobby && window.MutationObserver) {
    new MutationObserver(function () { if (!lobby.classList.contains('active')) pause(); })
      .observe(lobby, { attributes: true, attributeFilter: ['class'] });
  }
  document.addEventListener('visibilitychange', function () { if (document.hidden) pause(); });

  // the Donate row's "Take the fly-through" button scrolls here and starts it
  [].forEach.call(document.querySelectorAll('[data-fly-jump]'), function (b) {
    b.addEventListener('click', function () {
      root.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'center' });
      show(0); play();
    });
  });
})();
