(function(){
  var IMAGES = JSON.parse(document.getElementById('data-images').textContent);
  var ROSTER = JSON.parse(document.getElementById('data-roster').textContent);

  // ---- fill every img[data-img] ----
  document.querySelectorAll('img[data-img]').forEach(function(img){
    var key = img.getAttribute('data-img');
    if (IMAGES[key]) img.src = IMAGES[key];
    else img.closest('.figure, .profile') && (img.style.display='none');
  });

  // ---- directory data ----
  var DIRECTORY = [
    {n:'01', t:'Auditorium', d:'Every video in the museum\u2019s collection, organized by exhibit.', go:'auditorium'},
    {n:'02', t:'The Signal Story', d:'From wig-wag flags to fiber — and how Fort Gordon became Signal\u2019s home.', go:'signal-story'},
    {n:'03', t:'The Cyber Story', d:'The Army\u2019s newest branch, built on Signal\u2019s oldest instinct.', go:'cyber-story'},
    {n:'04', t:'Camp Gordon: The WWI Era', d:'The first Camp Gordon, the 82d Division, and nineteen National Archives photographs.', go:'camp-gordon'},
    {n:'05', t:'Command Gallery', d:'The Signal Regiment order of battle, with lineage links, the 1st Signal Brigade, and the 501st Signal Battalion.', go:'command-gallery'},
    {n:'06', t:'Aviation Annex', d:'Signal Corps aviators, namesake airfields, and the defense industry they founded.', go:'aviation'},
    {n:'07', t:'The Hello Girls', d:'223 women, one war, and the medal a century in the making.', go:'hello-girls'},
    {n:'08', t:'Combat Camera & Video', d:'Signal Corps film and photography, from Dr. Seuss to The Longest Day.', go:'combat-camera'},
    {n:'09', t:'Fireside Chats', d:'First-person recollections from Signal and Cyber veterans.', go:'fireside'},
    {n:'10', t:'Donor Spotlight', d:'The Campaign Circle, Signal Champions, and the donors who keep the doors open.', go:'donor-spotlight'},
    {n:'11', t:'Honor Roll', d:'Staff, board, advisors, distinguished members, Hall of Fame.', go:'people'},
    {n:'12', t:'Support the Museum', d:'Sponsorship tiers and easy ways to help.', go:'give'},
    {n:'13', t:'Timeline', d:'Where the museum started, and where it is today.', go:'timeline'},
    {n:'14', t:'News & Announcements', d:'Heritage magazine issues and the museum\u2019s YouTube channel.', go:'news'},
    {n:'15', t:'Heritage Magazine', d:'Every page of the Society\u2019s magazine issues, readable full size.', go:'magazine'},
    {n:'16', t:'Museum Map', d:'Search for a room, or click the floor plan to go there.', go:'map'}
  ];
  var dirGrid = document.getElementById('dir-grid');
  DIRECTORY.forEach(function(d){
    var el = document.createElement('div');
    el.className = 'dir-item';
    el.setAttribute('data-goto', d.go);
    el.innerHTML = '<span class="n">'+d.n+'</span><span class="t">'+d.t+'</span><span class="d">'+d.d+'</span>';
    dirGrid.appendChild(el);
  });

  // ---- inject a centered "Museum Map" link into every room footer ----
  document.querySelectorAll('.room-foot').forEach(function(foot){
    if (foot.querySelector('.map-foot-link')) return;
    var btns = foot.querySelectorAll('button');
    var mapBtn = document.createElement('button');
    mapBtn.type = 'button';
    mapBtn.className = 'map-foot-link';
    mapBtn.setAttribute('data-goto', 'map');
    mapBtn.textContent = '🗺 Museum Map';
    if (btns.length >= 2){
      foot.insertBefore(mapBtn, btns[btns.length - 1]);
    } else {
      foot.appendChild(mapBtn);
    }
  });

  // ---- room navigation ----
  function goto(id, avsub){
    var roomId = (id === 'map') ? 'lobby' : id;
    document.querySelectorAll('.room').forEach(function(r){ r.classList.remove('active'); });
    var target = document.getElementById('room-'+roomId);
    if (target){ target.classList.add('active'); }
    document.querySelectorAll('.topbar-nav button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-goto') === id);
    });
    if (avsub && target){
      var subBtn = target.querySelector('.subnav button[data-sub="'+avsub+'"]');
      if (subBtn) subBtn.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    }
    if (id === 'map'){
      var mapEl = document.getElementById('map-section');
      if (mapEl) { mapEl.scrollIntoView({behavior:'smooth', block:'start'}); }
    } else {
      window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
    }
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-goto]');
    if (el){ goto(el.getAttribute('data-goto'), el.getAttribute('data-avsub')); }
  });

  // Deep links: index.html#room-name opens that room, and #some-section-id
  // opens the room holding that section (and its tab, if any) and scrolls to it.
  function gotoHash(){
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var target = document.getElementById(id);
    if (!target && document.getElementById('room-' + id)){ goto(id); return; }
    if (!target) return;
    var room = target.closest('.room');
    if (!room) return;
    var panel = target.closest('.subpanel');
    goto(room.id.replace(/^room-/, ''), panel ? panel.id.replace(/^sub-/, '') : null);
    setTimeout(function(){ target.scrollIntoView({block:'start', behavior:'instant'}); }, 0);
  }
  window.addEventListener('hashchange', gotoHash);
  setTimeout(gotoHash, 0); // after the rest of this script has wired up the tabs

  // Anything that navigates must work from the keyboard too. Buttons and links
  // already do; the masthead and the SVG floor plan are neither, so give them
  // a tab stop, a role, and Enter/Space.
  function makeKeyboardOperable(el){
    if (el.tagName === 'BUTTON' || el.tagName === 'A') return;
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if (!el.hasAttribute('aria-label')){
      var label = el.getAttribute('data-roomname') || (el.textContent || '').trim().split('\n')[0];
      if (label) el.setAttribute('aria-label', 'Go to ' + label);
    }
  }
  document.querySelectorAll('[data-goto]').forEach(makeKeyboardOperable);
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest && e.target.closest('[data-goto]');
    if (!el || el.tagName === 'BUTTON' || el.tagName === 'A') return;
    e.preventDefault();
    goto(el.getAttribute('data-goto'), el.getAttribute('data-avsub'));
  });

  // ---- subnav (aviation, people) ----
  document.querySelectorAll('.subnav').forEach(function(nav){
    nav.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-sub]');
      if (!btn) return;
      var room = nav.closest('.room');
      nav.querySelectorAll('button').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      room.querySelectorAll('.subpanel').forEach(function(p){ p.classList.remove('active'); });
      var panel = room.querySelector('#sub-'+btn.getAttribute('data-sub'));
      if (panel) panel.classList.add('active');
    });
  });

  // ---- lineage links (only pages the museum's slide deck links to) ----
  var LINEAGE_PAGES = ['0001scbde.htm','0001scctr.htm','0002scbde.htm','0002scctr.htm','0003scbde.htm','0003scctr.htm','0004scctr.htm','0005sccmd.htm','0005scctr.htm','0006scctr.htm','0007scbde.htm','0007sccmd.htm','0007scctr.htm','0009sccmd.htm','0010scbn.htm','0011scbde.htm','0011scdet.htm','0014scdet.htm','0016scco.htm','0017scbn.htm','0019scco.htm','0021scbde.htm','0021scco.htm','0022scbde.htm','0025scbn.htm','0029scbn.htm','0030scbn.htm','0035scbde.htm','0035scbn.htm','0036scbn.htm','0039scbn.htm','0040scbn.htm','0041scbn.htm','0043scbn.htm','0044scbn.htm','0050scbn.htm','0051scbn.htm','0052scbn.htm','0053scbn.htm','0054scbn.htm','0054scco.htm','0055scco.htm','0056scbn.htm','0056scco.htm','0057scbn.htm','0057scco.htm','0058scbn.htm','0062scbn.htm','0063scbn.htm','0063scco.htm','0067scbn.htm','0069scbn.htm','0069scco.htm','0072scbn.htm','0073scco.htm','0078scbn.htm','0082scbn.htm','0086scbn.htm','0093scbde.htm','0094scco.htm','0098scbn.htm','0100scbn.htm','0102scbn.htm','0106scbde.htm','0112scbn.htm','0114scbn_hqhqdet.htm','0121scbn.htm','0122scbn.htm','0123scbn.htm','0124scbn.htm','0128scco.htm','0137scco.htm','0138scco.htm','0141scbn.htm','0146scco.htm','0149scco.htm','0151scbn.htm','0160scbde.htm','0169scco.htm','0176scco.htm','0178scco.htm','0181scco.htm','0198scbn.htm','0201scco.htm','0205scco.htm','0206scco.htm','0208scco.htm','0226scco.htm','0228scco.htm','0232scco.htm','0251scdet.htm','0252scco.htm','0255scdet.htm','0256scco.htm','0258scco.htm','0261scco.htm','0267scco.htm','0268scco.htm','0269scco.htm','0270scco.htm','0275scco.htm','0278scco.htm','0286scco.htm','0287scco.htm','0293scco.htm','0298scco.htm','0301scco.htm','0302scbn.htm','0304scbn.htm','0307scbn.htm','0311sccmd.htm','0319scbn.htm','0324scbn.htm','0324scco.htm','0327scbn.htm','0327scco.htm','0333scco.htm','0334scco.htm','0335sccmd.htm','0337scco.htm','0338scco.htm','0349scco.htm','0359scbde.htm','0362scco.htm','0369scbn.htm','0385scco.htm','0392scbn.htm','0396scco.htm','0404scco.htm','0414scco.htm','0422scbn.htm','0433scco.htm','0440scbn.htm','0442scbn.htm','0447scbn.htm','0472scco.htm','0501scbn.htm','0501scco.htm','0504scbn.htm','0504scco.htm','0505scbde.htm','0507scco.htm','0509scbn.htm','0514scco.htm','0516scbde.htm','0518scco.htm','0519scco.htm','0525scco.htm','0529scco.htm','0532scco.htm','0534scco.htm','0536scbn.htm','0550scco.htm','0551scbn.htm','0552scco.htm','0556scco.htm','0558scco.htm','0578scco.htm','0579scco.htm','0580scco.htm','0581scco.htm','0586scco.htm','0587scco.htm','0589scco.htm','0596scco.htm','0656scco.htm','0804scco.htm','0812scco.htm','0820scco.htm','0842scco.htm','0982scco.htm'];
  var LINEAGE_CODES = {commands:'sccmd', brigades:'scbde', centers:'scctr', battalions:'scbn', companies:'scco', detachments:'scdet'};
  function lineageUrl(groupKey, name){
    var m = /(\d+)(?:st|nd|rd|th|d)\b/.exec(name.replace(/^.*?,\s*/, ''));
    if (!m || !LINEAGE_CODES[groupKey]) return '';
    var base = ('0000' + m[1]).slice(-4) + LINEAGE_CODES[groupKey];
    var hit = [base + '.htm', base + '_hqhqdet.htm'].filter(function(f){ return LINEAGE_PAGES.indexOf(f) !== -1; })[0];
    // The museum's own mirror of the CMH record — history.army.mil blocks many networks.
    return hit ? 'lineage/' + hit : '';
  }

  // ---- roster accordion ----
  var GROUPS = [
    {key:'commands', title:'Signal Commands', blurb:'The largest communications formations in the U.S. Army — the highest command level a Signal Officer can reach. Signal Commands oversee brigades, battalions, and other formations, typically under a one- or two-star general officer.'},
    {key:'brigades', title:'Signal Brigades', blurb:'The Army\u2019s largest strategic and tactical Signal formations. At the strategic level, brigades oversee network enterprise centers; at the tactical level, they command signal battalions that keep ground commanders able to move, shoot, and communicate.'},
    {key:'centers', title:'Signal Centers', blurb:'Help operate and maintain the Army\u2019s federated communications environment, providing oversight, command, and control.'},
    {key:'battalions', title:'Signal Battalions', blurb:'Strategic and tactical communications formations. At the strategic level they oversee installation and regional network operations; at the tactical level they operate within a ground maneuver battlespace.'},
    {key:'companies', title:'Separate Signal Companies', blurb:'Enable an array of units and formations across the Army to complete their assigned missions.'},
    {key:'detachments', title:'Signal Detachments', blurb:'Unique units that give commanders special capabilities required to establish and maintain command and control.'}
  ];
  var root = document.getElementById('roster-root');
  GROUPS.forEach(function(g){
    var list = ROSTER[g.key] || [];
    var det = document.createElement('details');
    det.className = 'roster-group';
    var summary = document.createElement('summary');
    summary.innerHTML = '<span>'+g.title+'</span><span class="count">'+list.length+' total</span>';
    det.appendChild(summary);
    var blurb = document.createElement('p');
    blurb.className = 'roster-blurb';
    blurb.textContent = g.blurb;
    det.appendChild(blurb);
    var ul = document.createElement('div');
    ul.className = 'roster-list';
    list.forEach(function(u){
      var row = document.createElement('div');
      row.className = 'u';
      var href = lineageUrl(g.key, u.name);
      var nameHtml = href ? '<a href="'+href+'" target="_blank" rel="noopener">'+u.name+'</a>' : u.name;
      row.innerHTML = '<span class="name">'+nameHtml+'</span><span class="date">'+u.date+'</span>';
      ul.appendChild(row);
    });
    det.appendChild(ul);
    root.appendChild(det);
  });

  // ---- 3D building photo: turns toward the pointer, light follows ----
  (function(){
    var stage = document.getElementById('hero-3d');
    if (!stage || !window.matchMedia('(hover:hover)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    var card = stage.querySelector('.h3d-card'), floor = stage.querySelector('.h3d-floor');
    var frame = null;
    stage.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      var x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      var y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function(){
        card.classList.add('tracking');
        card.style.setProperty('--ry', ((x - 0.5) * 22).toFixed(2) + 'deg');
        card.style.setProperty('--rx', ((0.5 - y) * 14 + 3).toFixed(2) + 'deg');
        card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        floor.style.setProperty('--fx', ((0.5 - x) * 40).toFixed(1));
      });
    });
    stage.addEventListener('pointerleave', function(){
      if (frame) cancelAnimationFrame(frame);
      card.classList.remove('tracking');
      ['--rx', '--ry', '--gx', '--gy'].forEach(function(p){ card.style.removeProperty(p); });
      floor.style.removeProperty('--fx');
    });
  })();

  // ---- video facades ----
  // Every video streams from YouTube and plays in the pop-out player.
  // The Chief of Signal chat isn't on YouTube yet: upload it, then paste its
  // video ID here (the part after "watch?v=") and its cards will appear.
  var CHIEF_OF_SIGNAL_YT_ID = '';
  var VIDEOS = {
    'welcome': [
      {id:'U5SbqLIg0I8', t:'Signal and Cyber Corps Museum Promo'},
      {id:'HCdtMqRoIAo', t:'Secure Our Story'},
      {id:'AmHjN_qTK8s', t:'Veterans Day Message \u2014 Welton Chase, Board Chairman'},
      {id:'uNsxPznc3Ms', t:'Why Signal and Cyber Corps History Matters \u2014 Lieutenant General Susan S. Lawrence, US Army (retired), AFCEA'},
      {id:'huSTVP-O5WE', t:'How Proud Are You of Your Flag?'}
    ],
    'shorts': [
      {id:'hyGP0R5dgt8', t:'Why the Signal and Cyber Museum Matters'},
      {id:'yX86z-D__nw', t:'Today\u2019s Technology Traces Back to Signal and Cyber'},
      {id:'sx2tADmB1TI', t:'Saving Signal and Cyber History for the Next Generation'},
      {id:'D6qiCnG2upQ', t:'Life After Service and Giving Back'},
      {id:'oOnzoC1j-7I', t:'\u201cIt\u2019s the People\u201d: Why Share Your Story'},
      {id:'54KAVmnPobc', t:'\u201cWho Doesn\u2019t Fly Now?\u201d'}
    ],
    'signal': [
      {id:'zr8Ufv3QJhY', t:'The Signal Corps March'},
      {id:'ujsqWnzoyFk', t:'U.S. Army Signal Officer'},
      {id:'yoPLzglT8DA', t:'Carrier Pigeon Historical Short'},
      {id:'47Af05udrgM', t:'Code Talkers Historical Short'},
      {id:'W6ToW3YeQlg', t:'Project Diana Historical Short'},
      {id:'mhZW6yutR3c', t:'Virtual Museum Exhibit: Message Center Artifact'}
    ],
    'cyber': [
      {id:'-1QSq11T0CM', t:'U.S. Army Cyber Officer'}
    ],
    'fireside': [
      {id:CHIEF_OF_SIGNAL_YT_ID, t:'Chief of Signal Chat'},
      {id:'Bw9U0nVJkrs', t:'Save Our Story: Dr. (Col. Ret) Sly Cotton'},
      {id:'uiRWup_S_Kk', t:'How the Signal Corps Shaped Modern Military Practices'},
      {id:'au6Wn2cxcTQ', t:'Why the Museum Matters \u2014 Kevin and Kelly Knitter'},
      {id:'paD1jlyfumY', t:'Save Our Story: Colonel Dwayne Williams, US Army (retired)'},
      {id:'7ILlLZiWoVw', t:'Fireside Panel: Danny Burns and John O\u2019Reilly'},
      {id:'bG8DfzXrvgg', t:'Fireside Chat: LTG John Morrison'},
      {id:'lZX-P_qpVBE', t:'Fireside Chat: Colonel Sam Anderson, US Army (retired)'},
      {id:'bEY7jXAFDag', t:'Fireside Chat: Anna Smith'},
      {id:'dtNCmbCR6JM', t:'SGM Brady on Preserving Signal Regiment History'},
      {id:'Ge89DJnrEWo', t:'Why Is Everyone Talking About Signal and Cyber Corps?'},
      {id:'m9g5dHVe5nQ', t:'Ev Greenwood Professional Development Session with SBOLC Students, Aug 2021'},
      {id:'hXSz9tkSUo8', t:'Save Our Story: Colonel Everette Greenwood, US Army (retired)'},
      {id:'BVjNgMrt9PM', t:'Save Our Story: Wilfredo Norat'},
      {id:'4qXi4pB44z0', t:'Secure Our Story: Command Sergeant Major Sheldon Moorer, US Army (retired)'}
    ],
    'fireside-interview': [
      {id:CHIEF_OF_SIGNAL_YT_ID, t:'Chief of Signal Chat'}
    ],
    'hellogirls': [
      {id:'APVYPUJitSY', t:'Hello Girls Historical Short'}
    ],
    // Combat Camera screening room: add {id:'YouTube video ID', t:'Title'} entries.
    'combat-camera': [
    ]
  };

  document.querySelectorAll('[data-video-group]').forEach(function(grid){
    var list = (VIDEOS[grid.getAttribute('data-video-group')] || []).filter(function(v){ return v.id; });
    var placeholder = grid.parentNode.querySelector('[data-video-placeholder]');
    if (placeholder) placeholder.style.display = list.length ? 'none' : '';
    var hideIfEmpty = grid.closest('[data-hide-if-empty]');
    if (!list.length && hideIfEmpty){ hideIfEmpty.style.display = 'none'; return; }
    var onBillboard = !!grid.closest('.billboard');
    list.forEach(function(v, i){
      var d = document.createElement('div');
      d.className = 'yt-facade';
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.setAttribute('aria-label', 'Play: ' + v.t);
      d.setAttribute('data-yid', v.id);
      var thumb = "url('https://img.youtube.com/vi/"+v.id+"/hqdefault.jpg')";
      if (onBillboard){
        // Auditorium: a poster card with the title under the picture.
        d.classList.add('bb-card');
        d.innerHTML = '<div class="bb-thumb"><span class="bb-num"></span><div class="play-btn">\u25B6</div></div><div class="vt"></div>';
        d.querySelector('.bb-thumb').style.backgroundImage = thumb;
        d.querySelector('.bb-num').textContent = 'No. ' + (i < 9 ? '0' : '') + (i + 1);
      } else {
        d.style.backgroundImage = thumb;
        d.innerHTML = '<div class="play-btn">\u25B6</div><div class="vt"></div>';
      }
      d.querySelector('.vt').textContent = v.t;
      grid.appendChild(d);
    });
  });

  // Billboard tabs show how many videos each exhibit holds.
  document.querySelectorAll('.billboard .subnav button[data-sub]').forEach(function(btn){
    var panel = document.getElementById('sub-' + btn.getAttribute('data-sub'));
    if (!panel) return;
    var n = panel.querySelectorAll('.yt-facade').length;
    var c = document.createElement('span');
    c.className = 'bb-count';
    c.textContent = n;
    c.setAttribute('aria-hidden', 'true');
    btn.appendChild(c);
  });

  function playFacade(facade){
    var title = facade.querySelector('.vt') ? facade.querySelector('.vt').textContent : 'Now playing';
    openVideoPop(facade.getAttribute('data-yid'), title, facade);
  }
  document.addEventListener('click', function(e){
    var facade = e.target.closest('.yt-facade');
    if (facade) playFacade(facade);
  });
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var facade = e.target.closest && e.target.closest('.yt-facade');
    if (!facade) return;
    e.preventDefault();
    playFacade(facade);
  });

  // ---- pop-out player: floats over the page, can be dragged, resized, minimized ----
  var pop = document.getElementById('video-pop');
  var popBar = document.getElementById('video-pop-bar');
  var popFrame = document.getElementById('video-pop-frame');
  var popTitle = document.getElementById('video-pop-title');
  var popLink = document.getElementById('video-pop-yt-link');
  var popMin = document.getElementById('video-pop-min');
  var popSize = document.getElementById('video-pop-size');
  var popClose = document.getElementById('video-pop-close');
  var playingFacade = null;

  function setMinimized(min){
    pop.classList.toggle('min', min);
    popMin.innerHTML = min ? '&#9633;' : '&#8211;';
    popMin.title = min ? 'Restore' : 'Minimize';
    popMin.setAttribute('aria-label', popMin.title);
    keepInView();
  }
  function openVideoPop(id, title, facade){
    popTitle.textContent = title || 'Now playing';
    popFrame.innerHTML = '<iframe src="https://www.youtube.com/embed/'+encodeURIComponent(id)+'?autoplay=1&rel=0&playsinline=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>';
    popFrame.querySelector('iframe').title = title || 'video';
    popLink.href = 'https://www.youtube.com/watch?v='+encodeURIComponent(id);
    if (playingFacade) playingFacade.classList.remove('playing');
    playingFacade = facade || null;
    if (playingFacade) playingFacade.classList.add('playing');
    pop.classList.add('open');
    setMinimized(false);
  }
  function closeVideoPop(){
    pop.classList.remove('open', 'min', 'large');
    popFrame.innerHTML = '';
    if (playingFacade) playingFacade.classList.remove('playing');
    playingFacade = null;
  }
  function placePop(x, y){
    x = Math.max(8, Math.min(x, window.innerWidth - pop.offsetWidth - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - pop.offsetHeight - 8));
    pop.style.left = x+'px'; pop.style.top = y+'px';
    pop.style.right = 'auto'; pop.style.bottom = 'auto';
  }
  function keepInView(){
    if (!pop.style.left || !pop.classList.contains('open')) return;
    var r = pop.getBoundingClientRect();
    placePop(r.left, r.top);
  }

  popMin.addEventListener('click', function(){ setMinimized(!pop.classList.contains('min')); });
  popSize.addEventListener('click', function(){
    var large = pop.classList.toggle('large');
    popSize.title = large ? 'Smaller player' : 'Larger player';
    popSize.setAttribute('aria-label', popSize.title);
    keepInView();
  });
  popClose.addEventListener('click', closeVideoPop);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && pop.classList.contains('open')) closeVideoPop();
  });
  window.addEventListener('resize', keepInView);

  var drag = null;
  popBar.addEventListener('pointerdown', function(e){
    if (e.target.closest('button') || window.matchMedia('(max-width:640px)').matches) return;
    var r = pop.getBoundingClientRect();
    drag = {dx:e.clientX - r.left, dy:e.clientY - r.top};
    popBar.setPointerCapture(e.pointerId);
    popFrame.style.pointerEvents = 'none'; // keep the iframe from swallowing the drag
  });
  popBar.addEventListener('pointermove', function(e){
    if (drag) placePop(e.clientX - drag.dx, e.clientY - drag.dy);
  });
  function endDrag(){ drag = null; popFrame.style.pointerEvents = ''; }
  popBar.addEventListener('pointerup', endDrag);
  popBar.addEventListener('pointercancel', endDrag);

  // ---- museum map search ----
  var mapRooms = Array.prototype.slice.call(document.querySelectorAll('.map-room'));
  var mapSearch = document.getElementById('map-search');
  var mapResults = document.getElementById('map-search-results');

  function clearMapHighlight(){
    mapRooms.forEach(function(r){ r.classList.remove('dim', 'match'); });
  }
  function highlightMap(q){
    if (!q){ clearMapHighlight(); return; }
    mapRooms.forEach(function(r){
      var isMatch = r.getAttribute('data-roomname').toLowerCase().indexOf(q) !== -1;
      r.classList.toggle('match', isMatch);
      r.classList.toggle('dim', !isMatch);
    });
  }
  function renderMapResults(q){
    if (!q){ mapResults.classList.remove('open'); mapResults.innerHTML = ''; return; }
    var matches = mapRooms.filter(function(r){
      return r.getAttribute('data-roomname').toLowerCase().indexOf(q) !== -1;
    });
    if (!matches.length){
      mapResults.innerHTML = '<div class="none">No rooms match &quot;'+q+'&quot;</div>';
    } else {
      mapResults.innerHTML = matches.map(function(r){
        return '<div class="r" data-goto="'+r.getAttribute('data-goto')+'">'+r.getAttribute('data-roomname')+'</div>';
      }).join('');
    }
    mapResults.classList.add('open');
  }
  if (mapSearch){
    mapSearch.addEventListener('input', function(){
      var q = mapSearch.value.trim().toLowerCase();
      highlightMap(q);
      renderMapResults(q);
    });
    mapSearch.addEventListener('focus', function(){
      if (mapSearch.value.trim()) mapResults.classList.add('open');
    });
    document.addEventListener('click', function(e){
      if (!e.target.closest('.map-search-wrap')){ mapResults.classList.remove('open'); }
    });
  }
  // clear highlight whenever the map room is (re)entered
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-goto="map"]');
    if (el && mapSearch){ mapSearch.value = ''; clearMapHighlight(); mapResults.classList.remove('open'); }
  });

  // ---- artifact lightbox ----
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxCap = document.getElementById('lightbox-cap');
  // ---- member biographies ----
  // Bios are the member's own words, reproduced from the Society's site.
  // Add an entry here and put data-bio="<key>" on the name to make it open.
  var BIOS = {
    'mcconnell': {
      name: 'John McConnell',
      role: 'Board of Directors',
      org: 'Military Retirement Podcast - Founder',
      portrait: 'assets/bio_mcconnell.png',
      own: 'In his own words',
      paras: [
        'Information Technology and Cyber Security professional with over 30 combined years of experience. Forward thinker and futurist. Empathetic leader focused on resilience, mental health, inclusivity, and breaking down barriers to success. Podcast host and producer.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/9john-mcconnell" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'haynes': {
      name: 'Shalisha Haynes',
      role: 'Treasurer',
      org: 'Accountant, SME CPAs',
      portrait: 'assets/bio_haynes.jpg',
      own: 'In her own words',
      paras: [
        'Growing up nothing made me happier than helping someone out in need. As an Army Combat Veteran, I enjoyed helping Soldiers advance in their careers. This passion has since carried into my accounting career. I enjoy meeting and helping clients with their financial needs and goals. I am always honored and grateful to be a part of their success. In my role as a Staff Accountant, I focus on helping individuals and small businesses with their financial plans. I prepare individual and business tax returns, financial statements and reports for businesses, and analyze financial information to enable informed decision-making at every level. I take great pride in being a determined, diligent, and caring professional.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/4shalisha-haynes" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'washer': {
      name: 'Tom Washer',
      role: 'Board of Directors',
      org: 'Customer Success Executive at Cisco (DoD Sector)',
      portrait: 'assets/bio_washer.jpg',
      own: 'In his own words',
      paras: [
        '\u2022 Highly experienced and respected organizational leader (managing large and diverse workforces) and program manager (in both the public and private sectors) with strong planning, team building, and communication skills. \u2022 Particularly strong in anticipating customer requirements, developing business capture management strategies, ensuring project/program performance, and implementing innovative solutions across a diverse range of functional areas. \u2022 Enterprise-minded director/manager of large multi-sector workforces supporting diverse business requirements with efficient and cost-effective solutions. \u2022 Versatile leader of large organizations during a 36-year Army/Corporate career with a proven record of accomplishment as a strategic thinker, innovator, resource manager, and problem solver. \u2022 Extensive experience working in International environments and with International business partners.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/6atom-washer" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'peyton': {
      name: 'Laroy Peyton',
      role: 'Vice Chairman of the Board of Directors',
      org: 'Customer Success at Cisco Systems, Inc.',
      portrait: 'assets/bio_peyton.jpg',
      own: 'In his own words',
      paras: [
        'Information Technology Professional with exceptional leadership and problem-solving skills spanning 20 years of experience including six years serving as the primary communicator for the President of the United States. Results-driven strategic communicator with expertise in national security, emergency management, and cybersecurity of critical infrastructure. Proven track record of leading large, complex, and global organizations in no-fail missions of worldwide significance. Extensive experience with bringing together stakeholders from disparate organizations during times of crisis to collaborate on a common mission.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/5laroy-peyton" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'toler': {
      name: 'Eric Toler',
      role: 'Board of Directors',
      org: 'Executive Director, Georgia Cyber Center',
      portrait: 'assets/bio_toler.png',
      own: 'In his own words',
      paras: [
        'The Georgia Cyber Innovation & Training Center is a unique public/private collaboration among academia, government, and the private sector. It is designed to meet the growing need for cybersecurity talent by addressing the cybersecurity workforce shortage with creative training solutions while shaping a culture of innovation.',
        'The Hull McKnight building is home to certificate, undergraduate, graduate, and doctoral level programs in information technology, cybersecurity and cyber sciences offered by Augusta University and Augusta Technical College. Training to meet the current and future workforce needs for private industry as well as federal, state, and local government is a key focus in the Georgia Cyber Center\u2019s first building.',
        'The Shaffer MacCartney building fosters innovation and entrepreneurship while serving as a hub for technology startups. It also includes leasable space available to firms and organizations supporting the state\u2019s cybersecurity ecosystem. Resident partners can leverage the center\u2019s strategic resources while benefiting from the world-class collaboration between industry leaders, startup companies, academic institutions and federal/state government entities.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/6eric-toler" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'wilson': {
      name: 'Pete Wilson',
      role: 'Board of Directors',
      org: 'Customer Success Executive, Cisco Systems, INC.',
      portrait: 'assets/bio_wilson.png',
      own: 'In his own words',
      paras: [
        'Retired Army officer and combat veteran with over two decades of experience in cyber security, information management systems, computer networking, project management, and organizational leadership. Also experienced in marketing, sales and recruiting.',
        'Specialties: executive leader experience, servant leadership, line of site and beyond line of site communications, cyber security, information management systems, marketing, college recruiting.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/7pete-wilson" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'johnson': {
      name: 'Ann Johnson',
      role: 'Advisory Council',
      org: 'Corporate Vice President and Deputy CISO, Microsoft.',
      portrait: 'assets/bio_johnson.png',
      own: 'In her own words',
      paras: [
        'Ann Johnson is Corporate Vice President and Deputy CISO at Microsoft. In this role, Ann focuses on all external engagement for the Microsoft Office of the CISO, as well as risk for the Sales and Partner organization. She is a long-tenured, recognized thought leader on cybersecurity and a sought-after global speaker and digital author specializing in cyber resilience, online fraud, cyberattacks, compliance, and security.',
        'Ann challenges traditional schools of thought and cyber-norms\u2013from the way the tech industry tackles cyber threats to the language it uses to communicate\u2013and encourages the industry to get outside its comfort zones and expand how it addresses the evolving threat landscape with the power of technology and people. As a global cybersecurity leader and strategist, she is looking ahead at how today\u2019s cybersecurity investments will impact tomorrow\u2019s cybersecurity reality.',
        'Ann currently serves on the Board of Directors of Seattle Humane, N-Able, Human Security, Datavant, and is Member of the Board of Advisors for Cybersecurity Center of Excellence, WA and the Signal & Cyber Museum Society. Ann is also the Executive Sponsor of the Microsoft Women in Security Group.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/advisors-single-page-layout/annjohnson" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'dyer': {
      name: 'Stuart M. Dyer',
      role: 'Board Advisor',
      org: 'CEO/President, Cahaba Defense Consulting LLC',
      portrait: 'assets/bio_dyer.jpg',
      note: 'Major General, US Army (retired). Commanded the <strong>335th Signal Command</strong> and finished 36 years of service as Director of Cyber Security for the Army CIO/G-6 — the Army’s Chief Information Security Officer.',
      own: 'In his own words',
      paras: [
        'Stuart M. Dyer is a retired defense industry executive as well as a retired Major',
        'General from the United States Army.',
        'Stuart served as the CEO/President of Cahaba Defense Consulting, LLC, whose',
        'primary focus was on supporting clients in capturing and winning business with',
        'the Department of Defense. Prior to starting his own consulting practice, Stuart spent over',
        'fourteen years in various leadership roles at small and large defense contractors including',
        'Lockheed Martin and Leidos. He also spent two decades in various marketing and sales roles',
        'within the Automatic Identification/Wireless data communications industry.',
        'In 2014, Stuart retired at the rank of Major General, having served a total of 36 years in the',
        'Army and the Army Reserve. Stuart culminated his Army career as the Director of Cyber',
        'Security for the Army CIO/G6. In this capacity, he also served as the Army\u2019s Chief Information',
        'Security Officer (CISO). In this position, he was responsible for Army-wide cyber',
        'security/information assurance policies and programs. He is also a retired Certified Information',
        'Security Manager (CISM).',
        'Major General (Retired) Stuart Dyer served in both Operation Iraqi Freedom as well as',
        'Operation Noble Eagle. In addition, he has commanded military organizations at all levels, from',
        'the Company Command level through the two-star Army Signal Command level. As the',
        'Commanding General for the 335th Signal Command, MG (Retired) Dyer and his command',
        'provided highly reliable and secure strategic communications for the Army in the countries of',
        'Iraq, Afghanistan, and Kuwait, as well as other countries in Southwest Asia.',
        'Stuart is a 1978 graduate of the US Military Academy and a 2001 US Army War College',
        'graduate. He also earned his Master of Science in Management from Georgia Tech in 1985.',
        'His military awards include the Distinguished Service Medal, the Legion of Merit, the Bronze',
        'Star as well as other numerous awards and decorations. He also earned the Parachutist Badge',
        'and the Army Staff Identification Badge.',
        'A devoted runner, hiker, and college football fan, Stuart resides with his wife in Pelham,',
        'Alabama.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/advisors-single-page-layout/stuart-m-dyer" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'nishizawa': {
      name: 'Eric Y. Nishizawa',
      role: 'Board Advisor',
      org: 'Owner, Law Offices of Eric Nishizawa',
      portrait: 'assets/bio_nishizawa.png',
      own: 'In his own words',
      paras: [
        'Eric Yoshiaki Nishizawa is an attorney at Law Ofc Eric Nishizawa in Marina Del Rey, California. Eric Yoshiaki Nishizawa has 28 years of experience as a lawyer since graduating from University of California at Los Angeles School of Law with a N/A in 1998. This attorney also has a N/A from Loyola Law School, Loyola Marymount University.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/advisors-single-page-layout/eric-y-nishizawa" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'clark': {
      name: 'Dr. Tom Clark',
      role: 'Board Advisor',
      org: 'Executive Director, Alliance for Fort Eisenhower',
      portrait: 'assets/bio_clark.png',
      own: 'In his own words',
      paras: [
        'Named One of Georgia\'s Most Influential Leaders by Georgia Trend Magazine in their 2022 & 2023 TOP 500 edition. ',
        'Named One of the 100 Most Influential/Notable Georgians by Georgia Trend (2019, 2020, 2021, 2022, and 2023) and James Magazines (2019, 2020, 2021, and 2022). Currently serves on the Georgia Joint Defense Commission representing Fort Gordon/Cyber Center of Excellence. ',
        'Accomplished and experienced U.S. Military and Civilian Education Training Manager and U.S. Army Veteran with a commendable track record of providing leadership and direction for Fort Gordon\u2019s IT/Signal Training School Programs, General Dynamics Mission System Programs, and leadership programs in the non-profit/business community. ',
        'Devised/delivered long-term planning to drive military and civilian organizational efficiencies and training mission goals. Demonstrated knowledge of agency level program directives, extensive leadership including personnel recruitment, training, scheduling, recognition, development, performance evaluations, and promotion. ',
        'Project Management Professional (PMP) certification, Master\u2019s Degree in Postsecondary Adult Education, Doctorate Degree in Management in Organizational Leadership, with a Top Secret SCI Clearance.',
        'Highly successful military career with multiple combat leadership assignments and a CAPSTONE assignment as the United States Army Signal Center and Fort Gordon Command Sergeant Major / Signal Corps Regimental Sergeant Major; ',
        'Specialties: PMP, Leadership, Adult Education, Military, Fund Raising, Public Speaking'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/advisors-single-page-layout/dr-tom-clark" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'foley': {
      name: 'Jeffery Foley',
      role: 'Lead Advisor',
      org: 'CEO, Loral Mountain',
      portrait: 'assets/bio_foley.png',
      note: 'Brigadier General, US Army (retired). The Army’s <strong>34th Chief of Signal</strong> and Commanding General of the U.S. Army Signal Center and Fort Gordon — the post this museum keeps the history of.',
      own: 'In his own words',
      paras: [
        'As a certified leadership coach, Jeff works with business leaders who want to achieve greater results by creating positive and lasting change in behavior for themselves and the people they lead. In his latest book "BRAVE Business Leadership" he shares his proven methodology for growing competent, confident leaders that produce winning cultures leading to greater results. ',
        'Jeff earned the rank of Brigadier General having served 32 years in the United States Army. Throughout his military career he served in leadership positions around the world, in constantly changing environments, all the time focused on the accomplishment of the mission and caring for people.',
        'He is also the co-author of the the Penguin published book: "Rules and Tools for Leaders." As President of Loral Mountain Solutions, LLC, Jeff enjoys a wide range of clients including small and large businesses, health care professionals, non-profits, and the NCAA. He is also a partner with the Ken Blanchard Companies, Jim Horan\'s: One-Page Business Plan, and Wiley Corporation (Five Behaviors of an Effective Team & The Leadership Challenge). ',
        'He played intercollegiate sports at West Point, is an Eagle Scout, and both a Distinguished Alum and a member of his high school\u2019s Sports Hall of Fame. He lives in Augusta, Georgia, enjoys the game of golf, and is an active member of his community, currently serving on 4 local and national boards.'
      ],
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/advisors-single-page-layout/1jeffery-foley" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org \u2197</a>'
    },
    'chase': {
      name: 'Welton Chase, Jr.',
      role: 'Chairman of the Board',
      org: 'Business Leader, Department of Defense — Cisco',
      portrait: 'assets/bio_chase.jpg',
      own: 'In his own words',
      paras: [
        'As a Business Leader for Department of Defense - Cisco, I drive strategic post-sales market initiatives, enterprise growth, and trusted partnerships across defense and military command structures. Drawing on extensive executive leadership, a distinguished military background, and deep technical expertise in artificial intelligence and coding, I oversee the end-to-end implementation of comprehensive technologies—spanning collaboration, data centers, routers, security, artificial intelligence, network-as-code, and automated agents—to achieve national security and defense mission outcomes.',
        'I lead high-performing operational and customer success organizations dedicated to accelerating capability adoption, ensuring resilient lifecycle delivery, and deploying intelligent, software-driven infrastructures across defense agencies. Holding advanced credentials including BCS 3.0 Delivery Enablement and Customer Success Executive Green Belt, I am committed to principled leadership, operational excellence, and driving measurable impact for our nation’s armed forces.'
      ],
      note: 'Brigadier General, US Army (retired). His commands, from company to theater signal command, are listed on the Board of Directors card.',
      src: '<a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/1welton-chase-jr" target="_blank" rel="noopener">Profile at signalandcybercorpsmuseum.org ↗</a> &#183; <a href="https://www.linkedin.com/in/wechase/" target="_blank" rel="noopener">LinkedIn ↗</a>'
    },
    'tuschen': {
      name: 'Amy Tuschen',
      role: 'Executive Director',
      org: 'Signal &amp; Cyber Corps Museum Society',
      portrait: 'assets/bio_tuschen.png',
      own: 'In her own words',
      paras: [
        'As the Executive Director of Fort Gordon Historical Museum Society (FGHMS), I lead the efforts to fund and support the future Signal and Cyber Corps Museum, a historical and educational asset for the Augusta, GA area. I manage the non-profit’s operations, and finances, planning our Virtual Museum, and ensuring its preservation and accessibility. I also leverage my extensive network and experience in the IT, Information Assurance (IA), and Cyber fields to promote the museum’s mission and relevance to the current and future generations of military and civilian professionals.',
        'In addition to my role at FGHMS, I teach part-time as an Adjunct Professor at Augusta University-Hull College of Business, where I share my knowledge and insights on IT and Project Management with undergraduate students. I enjoy mentoring and inspiring the next wave of leaders and innovators in the industry, drawing from my 30 years of service and support to the Army and the DoD as a Signal Corps Officer and a contractor. I am passionate about advancing the fields of IT and Cybersecurity, and contributing to the development and security of our nation.'
      ],
      src: 'Biography as published by the Society. <a href="https://www.signalandcybercorpsmuseum.org/en/bod-single-page-layout/3amy-tuschen" target="_blank" rel="noopener">Read it at signalandcybercorpsmuseum.org ↗</a>'
    }
  };

  var biobox = document.getElementById('biobox');
  var bioReturnFocus = null;

  function openBio(key, trigger){
    var b = BIOS[key];
    if (!b || !biobox) return;
    var portrait = document.getElementById('biobox-portrait');
    if (b.portrait){ portrait.src = b.portrait; portrait.alt = b.name; portrait.style.display = ''; }
    else { portrait.removeAttribute('src'); portrait.style.display = 'none'; }
    document.getElementById('biobox-name').textContent = b.name;
    document.getElementById('biobox-role').textContent = b.role || '';
    document.getElementById('biobox-org').innerHTML = b.org || '';
    document.getElementById('biobox-own').textContent = b.own || '';
    document.getElementById('biobox-body').innerHTML =
      (b.paras || []).map(function(p){ return '<p>' + p + '</p>'; }).join('');
    var noteEl = document.getElementById('biobox-note');
    noteEl.innerHTML = b.note || '';
    noteEl.style.display = b.note ? '' : 'none';
    document.getElementById('biobox-src').innerHTML = b.src || '';
    biobox.classList.add('open');
    bioReturnFocus = trigger || null;
    var close = document.getElementById('biobox-close');
    if (close) close.focus();
  }
  function closeBio(){
    if (!biobox) return;
    biobox.classList.remove('open');
    if (bioReturnFocus && bioReturnFocus.focus) bioReturnFocus.focus();
    bioReturnFocus = null;
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-bio]');
    if (t){ e.preventDefault(); openBio(t.getAttribute('data-bio'), t); return; }
    if (e.target === biobox || e.target.id === 'biobox-close') closeBio();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && biobox && biobox.classList.contains('open')) closeBio();
  });

  function openLightbox(el){
    lightboxImg.src = IMAGES[el.getAttribute('data-lightbox')] || '';
    lightboxImg.alt = el.getAttribute('data-lightbox-cap') || '';
    lightboxCap.textContent = el.getAttribute('data-lightbox-cap') || '';
    lightbox.classList.add('open');
    lightbox.scrollTop = 0;
  }
  function closeLightbox(){ lightbox.classList.remove('open'); lightboxImg.src = ''; }
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-lightbox]');
    if (el) openLightbox(el);
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && lightbox.classList.contains('open')) { closeLightbox(); return; }
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest && e.target.closest('[data-lightbox]');
    if (el){ e.preventDefault(); openLightbox(el); }
  });
  lightbox.addEventListener('click', function(e){
    if (e.target === lightbox || e.target.id === 'lightbox-close') closeLightbox();
  });

  goto('lobby');
})();

