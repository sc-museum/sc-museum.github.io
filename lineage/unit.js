/* Unit page layout: an "at a glance" strip and an "on this page" index under
   the title, built from the record already on the page. */
(function(){
  var wrap = document.querySelector('.wrap');
  var asof = document.querySelector('.wrap > .asof');
  if (!wrap || !asof) return;

  function el(tag, cls, text){
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  // the record's sections are the plain <h2>s that follow the title
  var heads = [].slice.call(wrap.querySelectorAll(':scope > h2')).filter(function(h){ return !h.className; });
  heads.forEach(function(h){ if (!h.id) h.id = slug(h.textContent); });
  var find = function(re){ return heads.filter(function(h){ return re.test(h.textContent); })[0]; };
  var hLineage = find(/^lineage/i), hCamp = find(/campaign/i), hDec = find(/decoration|citation/i);

  // facts
  // lineage lines that record an action with a date (skip headings and notes)
  var dateRe = /(\d{1,2} [A-Z][a-z]+ \d{4}|[A-Z][a-z]+ \d{4}|\b1[789]\d\d\b|\b20\d\d\b)/;
  var verbRe = /^(Constituted|Reconstituted|Organized|Activated|Reactivated|Inactivated|Redesignated|Reorganized|Converted|Consolidated|Withdrawn|Allotted|Assigned|Relieved|Disbanded|Formed|Demobilized|Mustered)/;
  var actions = [].slice.call(wrap.querySelectorAll('p.entry:not(.note)'))
    .map(function(p){ return p.textContent.trim(); })
    .filter(function(t){ return verbRe.test(t) && dateRe.test(t); });
  var firstEntry = actions[0] || '';
  var origin = (firstEntry.match(verbRe) || [])[1];
  var originDate = (firstEntry.match(dateRe) || [])[1];
  var real = function(n){ return !/^\s*none\.?\s*$/i.test(n.textContent); };
  var camps = [].slice.call(wrap.querySelectorAll('ul.camps li')).filter(real).length;
  var decs = [].slice.call(wrap.querySelectorAll('p.dec')).filter(real).length;

  var facts = [];
  if (origin && originDate) facts.push([origin, originDate]);
  facts.push(['Campaigns', camps ? String(camps) : 'None']);
  facts.push(['Decorations', decs ? String(decs) : 'None']);

  var box = el('div', 'unit-glance');
  if (facts.length){
    var dl = el('dl', 'ug-facts');
    facts.forEach(function(f){
      var d = el('div', 'ug-fact');
      d.appendChild(el('dt', null, f[0]));
      d.appendChild(el('dd', null, f[1]));
      dl.appendChild(d);
    });
    box.appendChild(dl);
  }

  // on this page
  var links = [];
  var hist = document.getElementById('unit-history');
  if (hist) links.push(['Unit history', '#unit-history']);
  if (hLineage) links.push(['Lineage', '#' + hLineage.id]);
  if (hCamp) links.push(['Campaigns' + (camps ? ' (' + camps + ')' : ''), '#' + hCamp.id]);
  if (hDec) links.push(['Decorations' + (decs ? ' (' + decs + ')' : ''), '#' + hDec.id]);
  var nav = el('nav', 'ug-nav');
  nav.setAttribute('aria-label', 'On this page');
  nav.appendChild(el('span', 'ug-label', 'On this page'));
  links.forEach(function(l){ var a = el('a', null, l[0]); a.href = l[1]; nav.appendChild(a); });
  var rr = document.getElementById('rb-toggle');
  if (rr){
    var b = el('button', 'ug-rr', 'Ready Room');
    b.type = 'button';
    b.addEventListener('click', function(e){
      e.stopPropagation();
      window.scrollTo({top: 0});
      if (rr.getAttribute('aria-expanded') !== 'true') rr.click();
    });
    nav.appendChild(b);
  }
  if (links.length || rr) box.appendChild(nav);

  if (box.childNodes.length) asof.parentNode.insertBefore(box, asof.nextSibling);

  // long campaign lists read better in columns
  [].slice.call(wrap.querySelectorAll('ul.camps')).forEach(function(ul){
    if (ul.children.length >= 8) ul.classList.add('camps-cols');
  });
})();
