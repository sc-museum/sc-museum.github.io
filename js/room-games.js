/*
 * Room games: one short game at the foot of each room, built from window.ROOM_GAMES
 * (js/room-games-data.js, which must load first). Three kinds:
 *
 *   quiz    multiple choice, with the reason shown after each answer
 *   order   put events in order, earliest first, with Up / Down buttons
 *   match   pair each name with its description
 *
 * To add or change a game, edit js/room-games-data.js; nothing here needs to change.
 * Every fact in a game should come from the text of its own room.
 */
(function () {
  var GAMES = window.ROOM_GAMES;
  if (!GAMES) return;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function btn(cls, text) { var b = el('button', cls, text); b.type = 'button'; return b; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function stars(got, of) { var n = of ? Math.round(got / of * 3) : 0; return '★★★'.slice(0, n) + '☆☆☆'.slice(0, 3 - n); }
  function verdict(got, of) {
    if (got === of) return 'Perfect. You know this room.';
    if (got >= of * 0.6) return 'Well done. A second look at the room will get you the rest.';
    return 'A good start. Read through the room and try again.';
  }

  Object.keys(GAMES).forEach(function (key) {
    var game = GAMES[key], room = document.getElementById('room-' + key);
    if (!room || !game) return;

    var box = el('div', 'rg'); box.setAttribute('data-tour-skip', '');
    var head = el('div', 'rg-head');
    head.appendChild(el('div', 'rg-kicker', 'Play · ' + ({ quiz: 'Quiz', order: 'Put it in order', match: 'Match-up' }[game.type] || 'Game')));
    head.appendChild(el('h3', 'rg-title', game.title));
    head.appendChild(el('p', 'rg-intro', game.intro));
    box.appendChild(head);
    var stage = el('div', 'rg-stage'); stage.setAttribute('aria-live', 'polite');
    box.appendChild(stage);

    function startCard() {
      stage.innerHTML = '';
      var n = (game.questions || game.items || game.pairs || []).length;
      var b = btn('rg-go', '▶ Play');
      b.addEventListener('click', function () { PLAY[game.type](); });
      var row = el('div', 'rg-row'); row.appendChild(b);
      row.appendChild(el('span', 'rg-meta', n + (game.type === 'quiz' ? ' questions' : game.type === 'order' ? ' events' : ' pairs') + ' · about a minute'));
      stage.appendChild(row);
    }

    function finish(got, of) {
      stage.innerHTML = '';
      var end = el('div', 'rg-end');
      end.appendChild(el('div', 'rg-stars', stars(got, of)));
      end.appendChild(el('div', 'rg-score', got + ' of ' + of));
      end.appendChild(el('p', 'rg-verdict', verdict(got, of)));
      var again = btn('rg-go', '↺ Play again');
      again.addEventListener('click', function () { PLAY[game.type](); });
      end.appendChild(again);
      stage.appendChild(end);
      again.focus();
    }

    var PLAY = {
      quiz: function () {
        var qs = shuffle(game.questions), at = 0, got = 0;
        function ask() {
          stage.innerHTML = '';
          var q = qs[at];
          stage.appendChild(el('div', 'rg-count', 'Question ' + (at + 1) + ' of ' + qs.length));
          stage.appendChild(el('p', 'rg-q', q.q));
          var list = el('div', 'rg-choices');
          var order = shuffle(q.choices.map(function (c, i) { return i; }));
          var fb = el('p', 'rg-fb'), next = btn('rg-go rg-next', at + 1 < qs.length ? 'Next question →' : 'See your score →');
          next.hidden = true;
          order.forEach(function (i) {
            var b = btn('rg-choice', q.choices[i]);
            b.addEventListener('click', function () {
              [].forEach.call(list.children, function (c) { c.disabled = true; });
              var right = i === q.answer;
              if (right) got++;
              b.classList.add(right ? 'right' : 'wrong');
              if (!right) [].forEach.call(list.children, function (c, n) { if (order[n] === q.answer) c.classList.add('right'); });
              fb.textContent = (right ? 'Right. ' : 'Not quite. ') + q.why;
              fb.className = 'rg-fb ' + (right ? 'good' : 'bad');
              next.hidden = false; next.focus();
            });
            list.appendChild(b);
          });
          next.addEventListener('click', function () { at++; at < qs.length ? ask() : finish(got, qs.length); });
          stage.appendChild(list); stage.appendChild(fb); stage.appendChild(next);
        }
        ask();
      },

      order: function () {
        var right = game.items, cur = shuffle(right);
        // never hand over an already-solved list
        if (cur.every(function (it, i) { return it === right[i]; })) cur.push(cur.shift());
        function draw(checked) {
          stage.innerHTML = '';
          var list = el('ol', 'rg-order');
          cur.forEach(function (it, i) {
            var li = el('li', 'rg-item');
            var ok = checked && it === right[i];
            if (checked) li.classList.add(ok ? 'right' : 'wrong');
            li.appendChild(el('span', 'rg-label', it.label));
            if (checked) li.appendChild(el('span', 'rg-when', it.when));
            else {
              var up = btn('rg-move', '▲'), down = btn('rg-move', '▼');
              up.setAttribute('aria-label', 'Move earlier: ' + it.label); down.setAttribute('aria-label', 'Move later: ' + it.label);
              up.disabled = i === 0; down.disabled = i === cur.length - 1;
              up.addEventListener('click', function () { swap(i, i - 1, 0); });
              down.addEventListener('click', function () { swap(i, i + 1, 1); });
              var m = el('span', 'rg-moves'); m.appendChild(up); m.appendChild(down); li.appendChild(m);
            }
            list.appendChild(li);
          });
          stage.appendChild(list);
          if (checked) {
            var got = cur.filter(function (it, i) { return it === right[i]; }).length;
            var row = el('div', 'rg-row');
            row.appendChild(el('span', 'rg-meta', got === right.length ? 'Every one in place.' : got + ' of ' + right.length + ' in the right place. The dates are shown; the correct order is below.'));
            stage.appendChild(row);
            if (got !== right.length) {
              var sol = el('ol', 'rg-order rg-solution');
              right.forEach(function (it) { var li = el('li', 'rg-item'); li.appendChild(el('span', 'rg-label', it.label)); li.appendChild(el('span', 'rg-when', it.when)); sol.appendChild(li); });
              stage.appendChild(sol);
            }
            var done = btn('rg-go', 'See your score →');
            done.addEventListener('click', function () { finish(got, right.length); });
            stage.appendChild(done); done.focus();
          } else {
            var check = btn('rg-go', 'Check my order');
            check.addEventListener('click', function () { draw(true); });
            stage.appendChild(check);
          }
        }
        function swap(a, b, which) {
          var t = cur[a]; cur[a] = cur[b]; cur[b] = t; draw(false);
          var moved = stage.querySelectorAll('.rg-item')[b];
          var again = moved && moved.querySelectorAll('.rg-move')[which];
          if (again && !again.disabled) again.focus(); else if (moved) { var other = moved.querySelector('.rg-move:not(:disabled)'); if (other) other.focus(); }
        }
        draw(false);
      },

      match: function () {
        var pairs = game.pairs, lefts = shuffle(pairs), rights = shuffle(pairs), picked = null, done = 0, misses = 0;
        stage.innerHTML = '';
        var grid = el('div', 'rg-match'), colL = el('div', 'rg-col'), colR = el('div', 'rg-col'), fb = el('p', 'rg-fb');
        fb.textContent = 'Choose a name on the left, then its match on the right.';
        function pick(b, p) {
          [].forEach.call(colL.children, function (c) { c.classList.remove('picked'); });
          picked = { b: b, p: p }; b.classList.add('picked');
          fb.className = 'rg-fb'; fb.textContent = 'Now choose the match for “' + p.left + '”.';
        }
        lefts.forEach(function (p) {
          var b = btn('rg-card', p.left);
          b.addEventListener('click', function () { if (!b.disabled) pick(b, p); });
          colL.appendChild(b);
        });
        rights.forEach(function (p) {
          var b = btn('rg-card rg-right', p.right);
          b.addEventListener('click', function () {
            if (!picked) { fb.className = 'rg-fb'; fb.textContent = 'Choose a name on the left first.'; return; }
            if (picked.p === p) {
              picked.b.disabled = true; b.disabled = true;
              picked.b.classList.remove('picked'); picked.b.classList.add('right'); b.classList.add('right');
              fb.className = 'rg-fb good'; fb.textContent = 'Right: ' + p.left + ' — ' + p.right;
              picked = null; done++;
              if (done === pairs.length) {
                var end = btn('rg-go', 'See your score →');
                end.addEventListener('click', function () { finish(Math.max(0, pairs.length - misses), pairs.length); });
                stage.appendChild(end); end.focus();
              }
            } else {
              misses++;
              b.classList.add('wrong'); setTimeout(function () { b.classList.remove('wrong'); }, 600);
              fb.className = 'rg-fb bad'; fb.textContent = 'Not that one. Try another match for “' + picked.p.left + '”.';
            }
          });
          colR.appendChild(b);
        });
        grid.appendChild(colL); grid.appendChild(colR);
        stage.appendChild(grid); stage.appendChild(fb);
      }
    };
    if (!PLAY[game.type]) return;

    startCard();
    var foot = room.querySelector('.room-foot');
    var wrap = room.querySelector('.wrap') || room;
    if (foot && foot.parentNode) foot.parentNode.insertBefore(box, foot); else wrap.appendChild(box);
  });
})();
