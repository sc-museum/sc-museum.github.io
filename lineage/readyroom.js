/* Unit Ready Room: fills the #ready-room tile on a lineage page with the
   entries filed for that unit in readyroom.json, filterable by year. */
(function(){
  var tile = document.getElementById('ready-room');
  if (!tile) return;
  var key = tile.getAttribute('data-unit') || (location.pathname.split('/').pop() || '').replace(/\.html?$/i, '');
  var unitName = (document.querySelector('h1') || {}).textContent || key;
  var body = document.getElementById('rr-body');
  var years = document.getElementById('rr-years');
  var count = document.getElementById('rr-count');
  var suggest = document.getElementById('rr-suggest');

  // The suggest link names the unit, so submissions arrive already sorted.
  suggest.href = 'mailto:execdirector@fghms.com'
    + '?subject=' + encodeURIComponent('Unit Ready Room: ' + unitName.trim())
    + '&body=' + encodeURIComponent('Unit: ' + unitName.trim() + '\nYear(s):\nWhat it is (photo, orders, article, video, story):\nLink or attachment:\nWho made it, and may the museum show it?\n');

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  // an entry's group: its year, or a free label such as "1990s" when the exact
  // year is unknown ("when"), or "Ongoing" for undated, continuing material
  function yearLabel(it){ return it.year != null ? String(it.year) : (it.when || 'Ongoing'); }
  function rank(k){ return /^\d{4}$/.test(k) ? [0, Number(k)] : k === 'Ongoing' ? [2, 0] : [1, parseInt(k, 10) || 0]; }

  function render(items){
    if (!items.length){ count.textContent = 'Nothing filed yet · add material'; return; }
    // group by year; labelled eras follow the years, "Ongoing" sorts last
    var groups = {}, order = [];
    items.forEach(function(it){
      var k = yearLabel(it);
      if (!groups[k]){ groups[k] = []; order.push(k); }
      groups[k].push(it);
    });
    order.sort(function(a, b){
      var ra = rank(a), rb = rank(b);
      return ra[0] - rb[0] || ra[1] - rb[1];
    });

    var dated = order.filter(function(k){ return /^\d{4}$/.test(k); });
    count.textContent = items.length + (items.length === 1 ? ' item' : ' items')
      + (dated.length ? ' · ' + dated[0] + (dated.length > 1 ? '–' + dated[dated.length - 1] : '') : '');

    body.textContent = '';
    order.forEach(function(k){
      var sec = el('div', 'rr-year');
      sec.setAttribute('data-year', k);
      sec.appendChild(el('div', 'rr-ylabel', k));
      var list = el('div', 'rr-items');
      groups[k].forEach(function(it){
        var ext = /^https?:/i.test(it.url);
        var a = el('a', 'rr-item');
        a.href = it.url;
        if (ext || /\.(jpe?g|png|pdf)$/i.test(it.url)){ a.target = '_blank'; a.rel = 'noopener'; }
        a.appendChild(el('span', 'rr-kind', it.kind || 'Item'));
        var main = el('span', 'rr-main');
        main.appendChild(el('span', 'rr-t', it.title + (ext ? ' ↗' : '')));
        var meta = [it.source, it.date].filter(Boolean).join(' · ');
        if (meta) main.appendChild(el('span', 'rr-m', meta));
        if (it.note) main.appendChild(el('span', 'rr-n', it.note));
        if (it.thumbs && it.thumbs.length){
          var strip = el('span', 'rr-thumbs');
          it.thumbs.slice(0, 6).forEach(function(src){
            var im = el('img'); im.src = src; im.alt = ''; im.loading = 'lazy'; strip.appendChild(im);
          });
          main.appendChild(strip);
        }
        a.appendChild(main);
        list.appendChild(a);
      });
      sec.appendChild(list);
      body.appendChild(sec);
    });

    // year filter chips, only worth showing when there is more than one year
    if (order.length < 2) return;
    function chip(label, k){
      var b = el('button', 'rr-chip', label);
      b.type = 'button';
      b.setAttribute('data-filter', k);
      b.setAttribute('aria-pressed', k === '*' ? 'true' : 'false');
      return b;
    }
    years.appendChild(chip('All years', '*'));
    order.forEach(function(k){ years.appendChild(chip(k, k)); });
    years.hidden = false;
    years.addEventListener('click', function(e){
      var b = e.target.closest('.rr-chip');
      if (!b) return;
      var k = b.getAttribute('data-filter');
      years.querySelectorAll('.rr-chip').forEach(function(c){ c.setAttribute('aria-pressed', String(c === b)); });
      body.querySelectorAll('.rr-year').forEach(function(s){ s.hidden = k !== '*' && s.getAttribute('data-year') !== k; });
    });
  }

  // Pop-out bar variant: a pinned bar whose panel opens on demand.
  var toggle = document.getElementById('rb-toggle');
  if (toggle){
    var panel = document.getElementById('rb-panel');
    var cue = document.getElementById('rb-cue');
    var setOpen = function(open){
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      cue.innerHTML = open ? 'Close &#9652;' : 'Open &#9662;';
    };
    toggle.addEventListener('click', function(){ setOpen(panel.hidden); });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && !panel.hidden){ setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function(e){
      if (!panel.hidden && !tile.contains(e.target)) setOpen(false);
      // an item that jumps within this page closes the panel so the target shows
      var a = e.target.closest && e.target.closest('.rr-item');
      if (a && a.getAttribute('href').charAt(0) === '#') setOpen(false);
    });
  }

  fetch('readyroom.json', {cache: 'no-cache'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){ render((data && data.units && data.units[key]) || []); })
    .catch(function(e){ if (window.console) console.warn("Unit Ready Room:", e); /* the empty-state text stays */ });
})();
