/*
 * Lobby first impression (approved by the owner, November 2026):
 * rotating archive photo behind the hero, a small campaign bar, "Find your unit" search,
 * the impact numbers, This Month in Signal history, voices from the field, real photos on
 * the room cards, the compact top menu, and hiding the floating launchers on the Lobby.
 * Everything here reads from the rest of the page, so each figure has one source.
 */
(function () {
  'use strict';
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Top menu: Rooms drop-down, and Menu button on phones ---------- */
  var roomsBtn = document.querySelector('.nav-rooms-toggle'), roomsPanel = document.getElementById('nav-rooms-panel');
  var menuBtn = document.querySelector('.nav-menu-toggle'), nav = document.getElementById('topbar-nav');
  function setRooms(open) { if (!roomsBtn) return; roomsPanel.hidden = !open; roomsBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  function setMenu(open) { if (!menuBtn) return; nav.classList.toggle('open', open); menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false'); menuBtn.textContent = open ? 'Close' : 'Menu'; }
  if (roomsBtn) roomsBtn.addEventListener('click', function (e) { e.stopPropagation(); setRooms(roomsPanel.hidden); });
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-rooms-panel [data-goto], .topbar-nav [data-goto], .topbar-nav [data-contact-jump], .topbar-nav .passport-btn')) { setRooms(false); setMenu(false); return; }
    if (roomsPanel && !roomsPanel.hidden && !e.target.closest('.nav-rooms')) setRooms(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (roomsPanel && !roomsPanel.hidden) { setRooms(false); roomsBtn.focus(); } else if (nav && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); } } });
  function markRooms() {
    if (!roomsBtn) return;
    var any = roomsPanel.querySelector('button.active');
    roomsBtn.classList.toggle('active', !!any);
  }

  /* ---------- Hide the floating Guided Tour and Donate buttons on the Lobby ---------- */
  function onLobby() {
    var lobby = document.getElementById('room-lobby');
    document.documentElement.classList.toggle('on-lobby', !!(lobby && lobby.classList.contains('active')));
    markRooms();
  }
  document.addEventListener('click', function (e) { if (e.target.closest('[data-goto]')) setTimeout(onLobby, 30); });
  window.addEventListener('hashchange', function () { setTimeout(onLobby, 30); });
  setTimeout(onLobby, 30);

  /* ---------- Hero photos: one at a time, with their credit ---------- */
  var hero = document.getElementById('lobby-hero');
  if (hero) {
    var imgs = [].slice.call(hero.querySelectorAll('.hero-bg img')), credit = document.getElementById('hero-credit'), at = 0;
    function show(i) {
      var img = imgs[i];
      if (img.getAttribute('data-src')) { img.src = img.getAttribute('data-src'); img.removeAttribute('data-src'); }
      imgs.forEach(function (x, j) { x.classList.toggle('on', j === i); });
      if (credit) credit.textContent = img.getAttribute('data-credit') || '';
    }
    if (!reduce && imgs.length > 1) {
      setInterval(function () {
        if (document.hidden || !hero.closest('.room.active')) return;
        at = (at + 1) % imgs.length;
        var next = imgs[at];
        if (next.getAttribute('data-src')) { next.onload = function () { show(at); }; next.src = next.getAttribute('data-src'); next.removeAttribute('data-src'); }
        else show(at);
      }, 7000);
    }
  }

  /* ---------- Small campaign bar, read from the Support room's bar ---------- */
  function money(n) { return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  var cb = document.querySelector('#room-give .campaign-bar'), slot = document.getElementById('lobby-campaign');
  if (cb && slot) {
    var goal = +cb.getAttribute('data-goal'), raised = +cb.getAttribute('data-raised');
    var pct = Math.min(100, raised / goal * 100), shown = Math.round(pct);
    var a = el('button', 'mini-bar'); a.type = 'button'; a.setAttribute('data-goto', 'give');
    var t = el('span', 'mini-t'); t.appendChild(el('b', null, money(raised))); t.appendChild(document.createTextNode(' raised of ' + money(goal) + ' to buy the building'));
    var tr = el('span', 'mini-track'); var fi = el('span', 'mini-fill'); fi.style.width = pct.toFixed(1) + '%'; tr.appendChild(fi);
    var m = el('span', 'mini-m', shown + '% · as of ' + (cb.getAttribute('data-asof') || '') + ' · see the campaign →');
    a.appendChild(t); a.appendChild(tr); a.appendChild(m);
    a.setAttribute('aria-label', money(raised) + ' raised of a ' + money(goal) + ' goal, ' + shown + ' percent. Open the campaign in the Support room.');
    slot.appendChild(a);
    var ir = document.getElementById('impact-raised');
    if (ir) ir.textContent = money(raised);
    var ik = document.getElementById('impact-raised-k');
    if (ik && cb.getAttribute('data-donors')) ik.textContent = 'raised by ' + cb.getAttribute('data-donors') + ' donors';
  }

  /* ---------- Impact numbers ---------- */
  var y = document.getElementById('impact-years'); if (y) y.textContent = String(new Date().getFullYear() - 1860);
  var uc = document.getElementById('impact-units'); if (uc && window.MUSEUM_UNITS) uc.textContent = String(window.MUSEUM_UNITS.length);

  /* ---------- Find your unit ---------- */
  var form = document.getElementById('unit-find');
  if (form && window.MUSEUM_UNITS) {
    var q = document.getElementById('unit-find-q'), list = document.getElementById('unit-find-results');
    var units = window.MUSEUM_UNITS;
    function norm(s) { return s.toLowerCase().replace(/(\d+)(st|nd|rd|th|d)\b/g, '$1').replace(/headquarters and headquarters (company|detachment),?/g, '').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }
    units.forEach(function (u) { u.k = norm(u.name); });
    function search() {
      var words = norm(q.value).split(' ').filter(Boolean);
      list.textContent = '';
      if (!words.length) { list.hidden = true; return []; }
      var hits = units.filter(function (u) { return words.every(function (w) { return u.k.indexOf(w) >= 0; }); }).slice(0, 8);
      if (!hits.length) { list.appendChild(el('li', 'uf-none', 'No unit matches. Try the number alone, like 67, or browse the Command Gallery.')); }
      hits.forEach(function (u) {
        var li = el('li'), a2 = el('a', null, u.name); a2.href = u.href; a2.target = '_blank'; a2.rel = 'noopener';
        a2.appendChild(el('span', 'uf-g', u.group)); li.appendChild(a2); list.appendChild(li);
      });
      list.hidden = false;
      return hits;
    }
    q.addEventListener('input', search);
    form.addEventListener('submit', function (e) { e.preventDefault(); var h = search(); if (h.length === 1) window.open(h[0].href, '_blank', 'noopener'); else { var f = list.querySelector('a'); if (f) f.focus(); } });
  }

  /* ---------- This Month in Signal history, from the Auditorium's calendar ---------- */
  var tm = document.getElementById('this-month');
  if (tm) {
    var mo = new Date().getMonth() + 1;
    var block = document.querySelector('#room-auditorium .tmh-month[data-month="' + mo + '"]');
    var ban = block && block.querySelector('.banner');
    if (ban) {
      tm.appendChild(el('p', 'tm-k', 'This month in Signal history · ' + (block.querySelector('.tmh-label') || {}).textContent));
      tm.appendChild(el('h3', 'tm-t', (ban.querySelector('b') || {}).textContent || ''));
      tm.appendChild(el('p', 'tm-d', (ban.querySelector('span') || {}).textContent || ''));
      var n = block.querySelectorAll('article').length;
      var go = el('button', 'tm-go', 'See ' + (n ? n + ' stories' : 'the stories') + ' in the Auditorium →'); go.type = 'button'; go.setAttribute('data-goto', 'auditorium');
      tm.appendChild(go);
    } else tm.hidden = true;
  }

  /* ---------- Voices from the field, from the rooms' own quotations ---------- */
  var vz = document.getElementById('voices');
  if (vz) {
    var figs = [].slice.call(document.querySelectorAll('.room .ds-voice')).filter(function (f) { return f.querySelector('blockquote'); });
    if (!figs.length) vz.hidden = true; else {
      vz.appendChild(el('p', 'tm-k', 'Voices from the field'));
      var box = el('figure', 'voice'); var bq = el('blockquote'); var cap = el('figcaption'); box.appendChild(bq); box.appendChild(cap); vz.appendChild(box);
      box.setAttribute('aria-live', 'polite');
      var row = el('div', 'voice-row');
      var prev = el('button', 'voice-btn', '‹'); prev.type = 'button'; prev.setAttribute('aria-label', 'Previous voice');
      var nxt = el('button', 'voice-btn', '›'); nxt.type = 'button'; nxt.setAttribute('aria-label', 'Next voice');
      var more = el('button', 'tm-go', 'More voices in The Network in the Sand →'); more.type = 'button'; more.setAttribute('data-goto', 'desert-storm');
      row.appendChild(prev); row.appendChild(nxt); row.appendChild(more); vz.appendChild(row);
      var vi = Math.floor(Math.random() * figs.length);
      function voice(i) {
        vi = (i + figs.length) % figs.length; var f = figs[vi];
        bq.textContent = f.querySelector('blockquote').textContent;
        cap.textContent = '';
        var who = f.querySelector('figcaption b'); var fc = f.querySelector('figcaption');
        if (who) cap.appendChild(el('b', null, who.textContent));
        var rest = fc ? [].slice.call(fc.childNodes).filter(function (n) { return n.nodeType === 3; }).map(function (n) { return n.textContent; }).join('').trim() : '';
        if (rest) cap.appendChild(document.createTextNode(' ' + rest.replace(/^,\s*/, ', ')));
      }
      prev.addEventListener('click', function () { voice(vi - 1); });
      nxt.addEventListener('click', function () { voice(vi + 1); });
      voice(vi);
      if (!reduce) setInterval(function () { if (!document.hidden && vz.closest('.room.active') && !vz.matches(':hover') && !vz.contains(document.activeElement)) voice(vi + 1); }, 9000);
    }
  }

  /* ---------- Room cards: a real picture from each room, the drawing on hover ---------- */
  document.querySelectorAll('#rooms-drawn .drawn-card[data-goto]').forEach(function (card) {
    var room = document.getElementById('room-' + card.getAttribute('data-goto'));
    if (!room) return;
    var pic = room.querySelector('.ax-photo img, .fg-photo img, .figure img:not([data-img^="render"]), .profile img, .hero-photo img');
    var render = card.querySelector('img');
    if (!pic || !render) return;
    var real = el('img', 'drawn-real'); real.loading = 'lazy'; real.decoding = 'async'; real.alt = ''; real.width = 480; real.height = 270;
    real.src = pic.getAttribute('src');
    render.classList.add('drawn-render');
    card.insertBefore(real, render);
    card.classList.add('has-real');
  });

  /* ---------- Passport card on the Lobby opens the passport ---------- */
  document.addEventListener('click', function (e) { if (e.target.closest('[data-passport-open]')) { var p = document.querySelector('.passport-btn'); if (p) p.click(); } });
})();
