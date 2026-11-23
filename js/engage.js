/*
 * Return-and-give features (approved by the owner, November 2026):
 *   - Share bar at the foot of every room
 *   - "The Signal Dispatch" monthly email sign-up (full form in the Support room, short form in every room)
 *   - Signal Sustainers monthly-giving picker (Support room)
 *   - Wall of Service submissions and search (Honor Roll)
 *   - Museum Passport: a stamp for each room visited, a certificate and a challenge coin at the end
 *
 * The site has no server. Sign-ups and Wall of Service entries are sent by FormSubmit to the
 * Society's inbox, the same way as "Write to the museum" (js/contact.js). Passport progress is kept
 * only in the visitor's own browser.
 */
(function () {
  'use strict';
  var SITE = 'https://sc-museum.github.io/';
  var TO = 'scmsreg@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  var GIVE = 'https://givebutter.com/hpEeXi';

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function money(n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function roomTitle(sec) { var t = sec.querySelector('.room-title') || sec.querySelector('h1'); return t ? t.textContent.trim() : sec.id.replace(/^room-/, ''); }
  function activeRoom() { var r = document.querySelector('.room.active'); return r ? r.id.replace(/^room-/, '') : 'lobby'; }

  function post(data) {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === 'false' || j.success === false) throw new Error('send'); return j; }); });
  }

  /* ---------- Share bar ---------- */
  function shareBar(room) {
    var url = SITE + '#' + room.id.replace(/^room-/, '');
    var title = roomTitle(room) + ' · Signal & Cyber Corps Museum Society';
    var bar = el('div', 'share-bar');
    bar.appendChild(el('span', 'share-k', 'Share this room'));
    var status = el('span', 'share-status'); status.setAttribute('role', 'status');
    if (navigator.share) {
      var ns = el('button', 'share-btn', 'Share…'); ns.type = 'button';
      ns.addEventListener('click', function () { navigator.share({ title: title, url: url }).catch(function () {}); });
      bar.appendChild(ns);
    }
    var copy = el('button', 'share-btn', 'Copy link'); copy.type = 'button';
    copy.addEventListener('click', function () {
      function done() { status.textContent = 'Link copied.'; }
      function fail() { status.textContent = url; }
      try { navigator.clipboard.writeText(url).then(done, fail); } catch (e) { fail(); }
    });
    bar.appendChild(copy);
    [['Email', 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(url)],
     ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)],
     ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url)],
     ['X', 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title)]
    ].forEach(function (s) {
      var a = el('a', 'share-btn', s[0]); a.href = s[1];
      if (s[0] !== 'Email') { a.target = '_blank'; a.rel = 'noopener'; }
      bar.appendChild(a);
    });
    bar.appendChild(status);
    return bar;
  }

  /* ---------- The Signal Dispatch sign-up ---------- */
  var n = 0;
  function dispatchForm(compact, where) {
    n++;
    var f = el('form', 'dispatch' + (compact ? ' compact' : '')); f.noValidate = true;
    if (!compact) {
      f.appendChild(el('p', 'dispatch-k', 'The Signal Dispatch'));
      f.appendChild(el('h3', 'dispatch-h', 'One story a month from the museum'));
      f.appendChild(el('p', 'dispatch-d', 'This Month in History, what is new in the galleries, and how the campaign is going.'));
    } else {
      f.appendChild(el('p', 'dispatch-d', 'Get the Signal Dispatch: one story a month from the museum.'));
    }
    var row = el('div', 'dispatch-row');
    var nameId = 'dsp-name-' + n, mailId = 'dsp-mail-' + n;
    var name = null;
    if (!compact) {
      var ln = el('label', 'dispatch-l', 'First name (optional)'); ln.htmlFor = nameId;
      name = el('input'); name.type = 'text'; name.id = nameId; name.autocomplete = 'given-name'; name.maxLength = 80;
      ln.appendChild(name); row.appendChild(ln);
    }
    var lm = el('label', 'dispatch-l', 'Email'); lm.htmlFor = mailId;
    var mail = el('input'); mail.type = 'email'; mail.id = mailId; mail.autocomplete = 'email'; mail.required = true; mail.maxLength = 200; mail.placeholder = 'you@example.com';
    lm.appendChild(mail); row.appendChild(lm);
    var trap = el('input', 'contact-trap'); trap.type = 'text'; trap.tabIndex = -1; trap.autocomplete = 'off'; trap.setAttribute('aria-hidden', 'true');
    var btn = el('button', 'dispatch-btn', 'Sign me up'); btn.type = 'submit';
    row.appendChild(btn); f.appendChild(row); f.appendChild(trap);
    f.appendChild(el('p', 'dispatch-fine', 'One email a month. Unsubscribe any time by replying. Your address goes only to the Society and is never shared.'));
    var status = el('p', 'dispatch-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); f.appendChild(status);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (trap.value) return;
      var m = mail.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { status.textContent = 'Please enter your email address.'; status.className = 'dispatch-status bad'; mail.focus(); return; }
      btn.disabled = true; status.textContent = 'Signing you up…'; status.className = 'dispatch-status';
      post({ _subject: 'Signal Dispatch sign-up', _template: 'table', _captcha: 'false', email: m, name: name ? name.value.trim() : '', signed_up_from: where, list: 'The Signal Dispatch (monthly email)' })
        .then(function () { status.textContent = 'Thank you' + (name && name.value.trim() ? ', ' + name.value.trim() : '') + '. Your first Dispatch arrives next month.'; status.className = 'dispatch-status ok'; f.reset(); })
        .catch(function () { status.textContent = 'This page could not sign you up. Please email ' + TO + ' with “Dispatch” in the subject.'; status.className = 'dispatch-status bad'; })
        .then(function () { btn.disabled = false; });
    });
    return f;
  }

  /* ---------- Put the share bar and short sign-up at the foot of every room ---------- */
  document.querySelectorAll('section.room').forEach(function (room) {
    var foot = room.querySelector('.room-foot:last-of-type') || [].slice.call(room.querySelectorAll('.room-foot')).pop();
    var box = el('div', 'engage-foot');
    if (room.id !== 'room-give') box.appendChild(dispatchForm(true, roomTitle(room)));
    box.appendChild(shareBar(room));
    if (foot) foot.parentNode.insertBefore(box, foot); else (room.querySelector('.wrap') || room).appendChild(box);
  });
  var full = document.getElementById('dispatch-slot');
  if (full) full.appendChild(dispatchForm(false, 'Support the Museum room'));

  /* ---------- Signal Sustainers picker ---------- */
  var sus = document.getElementById('sustainers-picker');
  if (sus) {
    var freq = 'monthly', amt = 25;
    var card = sus.querySelector('.sus-card'), go = sus.querySelector('.sus-go');
    function upd() {
      sus.querySelectorAll('[data-freq]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-freq') === freq ? 'true' : 'false'); });
      sus.querySelectorAll('[data-amt]').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-amt') === amt ? 'true' : 'false'); });
      card.textContent = '';
      if (freq === 'monthly') {
        card.appendChild(el('b', null, money(amt) + ' a month'));
        card.appendChild(document.createTextNode(' adds up to ' + money(amt * 12) + ' a year toward the building, and makes you a Signal Sustainer.'));
        go.textContent = 'Give ' + money(amt) + ' a month';
      } else {
        card.appendChild(el('b', null, money(amt) + ' once'));
        card.appendChild(document.createTextNode('. Thank you. Giving monthly instead would add up to ' + money(amt * 12) + ' a year.'));
        go.textContent = 'Give ' + money(amt) + ' once';
      }
    }
    sus.addEventListener('click', function (e) {
      var b = e.target.closest('[data-freq],[data-amt]'); if (!b) return;
      if (b.hasAttribute('data-freq')) freq = b.getAttribute('data-freq'); else amt = +b.getAttribute('data-amt');
      upd();
    });
    upd();
  }

  /* ---------- Wall of Service ---------- */
  var wf = document.getElementById('wall-form');
  if (wf) {
    var ws = document.getElementById('wall-status'), wb = document.getElementById('wall-send');
    wf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (document.getElementById('wall-website').value) return;
      var v = function (id) { return document.getElementById(id).value.trim(); };
      if (!v('wall-name') || !v('wall-unit') || !v('wall-years')) { ws.textContent = 'Please give your name, unit and years.'; ws.className = 'contact-status bad'; return; }
      if (!document.getElementById('wall-consent').checked) { ws.textContent = 'Please tick the box to let us show your entry.'; ws.className = 'contact-status bad'; return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('wall-email'))) { ws.textContent = 'Please give an email address so a volunteer can check your entry. It is never shown.'; ws.className = 'contact-status bad'; return; }
      wb.disabled = true; ws.textContent = 'Sending…'; ws.className = 'contact-status';
      post({ _subject: 'Wall of Service entry: ' + v('wall-name'), _template: 'table', _captcha: 'false', _replyto: v('wall-email'),
        name_shown: v('wall-name'), unit: v('wall-unit'), years: v('wall-years'), hometown: v('wall-town'), email_not_shown: v('wall-email'),
        consent: 'Agreed to be shown on the Wall of Service in the virtual museum' })
        .then(function () { ws.textContent = 'Thank you for your service. A volunteer will check your entry and add it at the next museum update.'; ws.className = 'contact-status ok'; wf.reset(); })
        .catch(function () { ws.textContent = 'This page could not send your entry. Please email it to ' + TO + '.'; ws.className = 'contact-status bad'; })
        .then(function () { wb.disabled = false; });
    });
    var q = document.getElementById('wall-search');
    if (q) q.addEventListener('input', function () {
      var t = q.value.trim().toLowerCase(), shown = 0;
      document.querySelectorAll('#wall-list li').forEach(function (li) { var hit = !t || li.textContent.toLowerCase().indexOf(t) >= 0; li.hidden = !hit; if (hit) shown++; });
      var none = document.getElementById('wall-none'); if (none) none.hidden = shown > 0 || !document.querySelector('#wall-list li');
    });
  }

  /* ---------- Museum Passport ---------- */
  var ROOMS = [].slice.call(document.querySelectorAll('section.room')).filter(function (r) { return r.id !== 'room-lobby'; })
    .map(function (r) { return { id: r.id.replace(/^room-/, ''), t: roomTitle(r) }; });
  var KEY = 'museum-passport';
  var pass = store(KEY) || { stamps: [], name: '' };
  if (!Array.isArray(pass.stamps)) pass.stamps = [];
  var topBtn = el('button', 'passport-btn'); topBtn.type = 'button';
  var nav = document.querySelector('.topbar-nav');
  if (nav) nav.insertBefore(topBtn, nav.querySelector('.nav-write'));

  function count() { return ROOMS.filter(function (r) { return pass.stamps.indexOf(r.id) >= 0; }).length; }
  function paintBtn() { topBtn.textContent = 'Passport ' + count() + '/' + ROOMS.length; topBtn.setAttribute('aria-label', 'Museum Passport: ' + count() + ' of ' + ROOMS.length + ' rooms stamped'); }
  function stamp() {
    var id = activeRoom();
    if (id === 'lobby' || pass.stamps.indexOf(id) >= 0) return;
    if (!ROOMS.some(function (r) { return r.id === id; })) return;
    pass.stamps.push(id); store(KEY, pass); paintBtn();
    if (!dlg.hidden) render();
  }

  var dlg = el('div', 'passport'); dlg.hidden = true; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'passport-h');
  var inner = el('div', 'passport-inner'); dlg.appendChild(inner); document.body.appendChild(dlg);
  var closeBtn = el('button', 'passport-close', '×'); closeBtn.type = 'button'; closeBtn.setAttribute('aria-label', 'Close the passport');
  dlg.appendChild(closeBtn);
  function open() { render(); dlg.hidden = false; document.body.classList.add('passport-open'); closeBtn.focus(); }
  function close() { dlg.hidden = true; document.body.classList.remove('passport-open'); topBtn.focus(); }
  topBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !dlg.hidden) close(); });

  function render() {
    inner.textContent = '';
    var c = count(), all = ROOMS.length;
    inner.appendChild(el('p', 'passport-k', 'Museum Passport'));
    var h = el('h2', null, c === all ? 'Every room stamped' : c + ' of ' + all + ' rooms stamped'); h.id = 'passport-h'; inner.appendChild(h);
    inner.appendChild(el('p', 'passport-d', c === all ? 'You have visited every room in the virtual museum.' : 'Each room you open is stamped. Visit them all to earn your certificate and challenge coin. Your passport is kept in this browser only.'));
    var grid = el('div', 'passport-grid');
    ROOMS.forEach(function (r) {
      var on = pass.stamps.indexOf(r.id) >= 0;
      var b = el('button', 'passport-stamp' + (on ? ' on' : '')); b.type = 'button';
      b.setAttribute('data-goto', r.id);
      b.appendChild(el('span', 'ps-mark', on ? '✓' : ''));
      b.appendChild(el('span', 'ps-t', r.t));
      b.setAttribute('aria-label', r.t + (on ? ', stamped' : ', not yet visited'));
      b.addEventListener('click', function () { close(); });
      grid.appendChild(b);
    });
    inner.appendChild(grid);
    if (c === all) reward(); else {
      var left = ROOMS.filter(function (r) { return pass.stamps.indexOf(r.id) < 0; });
      inner.appendChild(el('p', 'passport-d', 'Still to visit: ' + left.slice(0, 4).map(function (r) { return r.t; }).join(', ') + (left.length > 4 ? ' and ' + (left.length - 4) + ' more' : '') + '.'));
    }
  }

  function reward() {
    var box = el('div', 'passport-reward');
    var ln = el('label', 'dispatch-l', 'Your name for the certificate'); var nm = el('input'); nm.type = 'text'; nm.id = 'passport-name'; nm.maxLength = 60; nm.value = pass.name || ''; nm.autocomplete = 'name'; ln.htmlFor = nm.id; ln.appendChild(nm); box.appendChild(ln);
    var cert = el('div', 'passport-cert'); cert.id = 'passport-cert';
    var coin = el('canvas', 'passport-coin'); coin.width = 480; coin.height = 480; coin.setAttribute('role', 'img');
    var row = el('div', 'dispatch-row');
    var pr = el('button', 'dispatch-btn', 'Print the certificate'); pr.type = 'button';
    var dl = el('a', 'dispatch-btn ghost', 'Save the challenge coin'); dl.download = 'museum-challenge-coin.png'; dl.href = '#';
    row.appendChild(pr); row.appendChild(dl);
    function draw() {
      var who = nm.value.trim() || 'A friend of the Signal Corps';
      pass.name = nm.value.trim(); store(KEY, pass);
      cert.textContent = '';
      cert.appendChild(el('p', 'pc-k', 'Signal & Cyber Corps Museum Society'));
      cert.appendChild(el('p', 'pc-t', 'Certificate of Completion'));
      cert.appendChild(el('p', 'pc-s', 'This certifies that'));
      cert.appendChild(el('p', 'pc-n', who));
      cert.appendChild(el('p', 'pc-s', 'has visited all ' + ROOMS.length + ' rooms of the virtual museum of the U.S. Army Signal Corps and Cyber Corps.'));
      cert.appendChild(el('p', 'pc-d', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + ' · sc-museum.github.io'));
      cert.appendChild(el('p', 'pc-f', 'A keepsake of the virtual museum. It is not an Army award or a membership of the Signal Regiment.'));
      var g = coin.getContext('2d'), R = 240;
      g.clearRect(0, 0, 480, 480);
      var grd = g.createRadialGradient(R, R, 40, R, R, R); grd.addColorStop(0, '#1d3a2a'); grd.addColorStop(1, '#0a1811');
      g.fillStyle = grd; g.beginPath(); g.arc(R, R, 232, 0, Math.PI * 2); g.fill();
      g.lineWidth = 14; g.strokeStyle = '#c9a227'; g.stroke();
      g.lineWidth = 2; g.strokeStyle = '#e0bc4a'; g.beginPath(); g.arc(R, R, 200, 0, Math.PI * 2); g.stroke();
      g.fillStyle = '#e0bc4a'; g.textAlign = 'center'; g.textBaseline = 'middle';
      function arc(text, rad, top) {
        g.save(); g.translate(R, R); g.font = '600 24px "IBM Plex Mono", monospace';
        var span = text.length * 0.075, start = top ? -Math.PI / 2 - span / 2 : Math.PI / 2 + span / 2;
        for (var i = 0; i < text.length; i++) {
          var a = top ? start + i * 0.075 + 0.0375 : start - i * 0.075 - 0.0375;
          g.save(); g.rotate(a); g.translate(rad, 0); g.rotate(top ? Math.PI / 2 : -Math.PI / 2); g.fillText(text[i], 0, 0); g.restore();
        }
        g.restore();
      }
      arc('SIGNAL & CYBER CORPS', 214, true); arc('VIRTUAL MUSEUM', 214, false);
      // crossed signal flags
      [[-1, '#a53344'], [1, '#f4f3ee']].forEach(function (f) {
        g.save(); g.translate(R, R - 30); g.rotate(f[0] * 0.5);
        g.fillStyle = '#c9a227'; g.fillRect(-3, -70, 6, 140);
        g.fillStyle = f[1]; g.fillRect(f[0] < 0 ? -55 : 3, -70, 52, 44);
        g.fillStyle = f[1] === '#f4f3ee' ? '#a53344' : '#f4f3ee'; g.fillRect(f[0] < 0 ? -37 : 21, -56, 16, 16);
        g.restore();
      });
      g.fillStyle = '#f4f3ee'; g.font = '600 30px "Spectral", Georgia, serif'; g.fillText('PASSPORT', R, R + 72);
      g.fillStyle = '#e0bc4a'; g.font = '500 20px "IBM Plex Sans", sans-serif';
      var nmTxt = who.length > 26 ? who.slice(0, 25) + '…' : who; g.fillText(nmTxt, R, R + 108);
      g.font = '500 16px "IBM Plex Mono", monospace'; g.fillText('ALL ' + ROOMS.length + ' ROOMS · ' + new Date().getFullYear(), R, R + 136);
      coin.setAttribute('aria-label', 'Challenge coin for ' + who + ': Signal & Cyber Corps virtual museum, all rooms visited');
      try { dl.href = coin.toDataURL('image/png'); } catch (e) {}
    }
    nm.addEventListener('input', draw);
    pr.addEventListener('click', function () { draw(); window.print(); });
    box.appendChild(cert); box.appendChild(coin); box.appendChild(row);
    var give = el('p', 'passport-d'); give.appendChild(document.createTextNode('Thank you for visiting every room. Help bring the collection home: '));
    var a = el('a', null, 'give to the building fund'); a.href = GIVE; a.target = '_blank'; a.rel = 'noopener'; give.appendChild(a); give.appendChild(document.createTextNode('.'));
    box.appendChild(give);
    inner.appendChild(box);
    draw();
  }

  document.addEventListener('click', function (e) { if (e.target.closest('[data-goto]')) setTimeout(stamp, 50); });
  window.addEventListener('hashchange', function () { setTimeout(stamp, 50); });
  setTimeout(stamp, 300);
  paintBtn();
})();

/* Notices with an end date: data-until="YYYY-MM-DD" shows the element through that day and removes it after.
   Used for the Lt. Gen. Susan S. Lawrence In Memoriam notice on the Lobby (30 days, through 2026-12-19). */
(function () {
  var now = new Date(), today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  document.querySelectorAll('[data-until]').forEach(function (el) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(el.getAttribute('data-until') || '');
    if (m && today > (+m[1]) * 10000 + (+m[2]) * 100 + (+m[3])) el.parentNode.removeChild(el);
  });
})();
