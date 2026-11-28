/* Museum Films in the Auditorium: a Film of the Week that changes every Monday, and a list of every film.
   To add a film: add it to FILMS (once the owner has approved it) and put its id in ROTATION. */
(function(){
  'use strict';
  var FILMS = {
    'telegraph': {src:'stories/wired-flying-telegraph.html', title:'The Flying Telegraph', years:'1861–1904', room:'wired', annex:'Wired Communications Annex', anchor:'wd-film-telegraph',
      dek:'Army wire from Albert Myer’s wagon train to Billy Mitchell’s line across Alaska.'},
    'lrt': {src:'stories/little-round-top.html', title:'Eyes on the High Ground', years:'1863', room:'civil-war', annex:'Civil War Signal Annex', anchor:'cw-little-round-top',
      dek:'The Union signal station on Little Round Top at Gettysburg, on an animated map.'},
    'greatwar': {src:'stories/wired-great-war.html', title:'“Please Don’t Rain”', years:'1917–1919', room:'wired', annex:'Wired Communications Annex', anchor:'wd-film-greatwar',
      dek:'Signal Corps wire in the trenches of France, and the soldiers who kept it whole.'},
    'gulfwar': {src:'stories/gulf-war-network.html', title:'The Network in the Sand', years:'1990–1991', room:'desert-storm', annex:'Desert Shield & Desert Storm Annex', anchor:'ds-film',
      dek:'Signal support in Desert Shield and Desert Storm, with Fort Gordon’s own 67th Signal Battalion.'},
    '900k': {src:'stories/wired-900000-miles.html', title:'Nine Hundred Thousand Miles', years:'1932 to fiber', room:'wired', annex:'Wired Communications Annex', anchor:'wd-film-900k',
      dek:'Field wire from the EE-8 telephone to the pursuit across France, and then glass.'},
    'ode': {src:'stories/wired-ode.html', title:'Ode to the Wireman and the Lineman', years:'1899–1944', room:'wired', annex:'Wired Communications Annex', anchor:'wd-film-ode',
      dek:'The museum’s tribute to the linemen, read with what the record says of them.'}
  };
  // Order of the weekly feature. Week 1 starts Monday 23 November 2026.
  var ROTATION = ['telegraph','lrt','greatwar','gulfwar','900k','ode'];
  var START = new Date(2026, 10, 23);   // local time, a Monday

  var player = document.getElementById('fw-player'), grid = document.getElementById('film-grid');
  if (!player || !grid) return;

  function weekIndex(d){
    var day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    var w = Math.floor(Math.round((day - START) / 864e5) / 7);
    var n = ROTATION.length;
    return ((w % n) + n) % n;
  }
  var thisWeek = ROTATION[weekIndex(new Date())];
  var nextWeek = ROTATION[(weekIndex(new Date()) + 1) % ROTATION.length];

  function show(id, isWeek){
    var f = FILMS[id]; if (!f) return;
    document.getElementById('fw-kicker').textContent = isWeek ? 'Film of the Week · ' + f.annex : 'Now playing · ' + f.annex;
    document.getElementById('fw-title').textContent = f.title;
    document.getElementById('fw-dek').textContent = f.years + ' · ' + f.dek;
    var go = document.getElementById('fw-go');
    go.setAttribute('data-goto', f.room); go.setAttribute('data-film-anchor', f.anchor);
    go.textContent = 'See it in the ' + f.annex + ' →';
    player.title = f.title;
    if (player.getAttribute('src') !== f.src) player.setAttribute('src', f.src);
    [].forEach.call(grid.querySelectorAll('.film-card'), function(c){ c.classList.toggle('playing', c.getAttribute('data-film') === id); });
  }

  // After the museum opens the annex, scroll to the film itself.
  document.addEventListener('click', function(e){
    var b = e.target.closest('[data-film-anchor]'); if (!b) return;
    var a = b.getAttribute('data-film-anchor');
    setTimeout(function(){ var el = document.getElementById(a); if (el) el.scrollIntoView({behavior:'smooth', block:'start'}); }, 350);
  });

  Object.keys(FILMS).forEach(function(id){
    var f = FILMS[id], c = document.createElement('article');
    c.className = 'film-card'; c.setAttribute('data-film', id);
    c.innerHTML = '<div class="fc-yrs"></div><h4></h4><p class="fc-annex"></p><p class="fc-dek"></p>' +
      '<div class="fc-btns"><button type="button" class="fc-watch">▶ Watch here</button><button type="button" class="fc-go">In the annex →</button></div>';
    c.querySelector('.fc-yrs').textContent = f.years + (id === thisWeek ? ' · This week' : '');
    c.querySelector('h4').textContent = f.title;
    c.querySelector('.fc-annex').textContent = f.annex;
    c.querySelector('.fc-dek').textContent = f.dek;
    if (id === thisWeek) c.classList.add('this-week');
    c.querySelector('.fc-watch').addEventListener('click', function(){
      show(id, id === thisWeek);
      document.getElementById('film-week').scrollIntoView({behavior:'smooth', block:'start'});
    });
    var g = c.querySelector('.fc-go'); g.setAttribute('data-goto', f.room); g.setAttribute('data-film-anchor', f.anchor);
    grid.appendChild(c);
  });

  show(thisWeek, true);
  var nf = FILMS[nextWeek];
  if (nf && nextWeek !== thisWeek) document.getElementById('fw-next').textContent = 'Next week: ' + nf.title + ', from the ' + nf.annex + '.';
})();
