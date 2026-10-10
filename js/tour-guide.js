// ---- Virtual tour guide ----
// A docent that walks visitors through the museum room by room and reads the
// exhibits aloud, with captions and a highlight on the exhibit being read.
//
// It reads whatever is on the page, so it never goes out of date: change a
// room in rooms/ and the guide reads the new text. The tour follows the Museum
// Directory order (the #dir-grid tiles), starting in the Lobby.
//
// Speech uses the browser's built-in voices (Web Speech API). Where there are
// none, the guide still runs in captions-only mode on a reading timer.
//
// To keep the guide from reading something, add data-tour-skip to it.
// To give it a spoken version different from the text, add
// data-tour-say="..." to the element.
(function(){
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- what the guide reads ----------
  // Exhibit "units" are read whole (a placard, a person card, a timeline entry).
  var UNIT = [
    '.room-head', '.hero h1', '.hero .sub', '.hero .welcome',
    '.placard', 'article.co', '.tmh .banner', '.tmh .also',
    '.sat-card', '.person', '.profile', '.tstop', 'ol.chron > li', '.tier',
    '.cmd-patches', '.donor-names', '.figure .cap', '.hero-photo .cap', '.donate-note'
  ].join(',');
  // Anything else with text, read paragraph by paragraph.
  var GENERIC = 'h1,h2,h3,h4,h5,p,li,blockquote,figcaption,dt,dd';
  // Never read these, or anything inside them.
  var SKIP = [
    '[data-tour-skip]', '.tg-panel', '.tg-listen', '.tg-cta', '.room-foot', '.subnav',
    '#map-section', '.map-search-wrap', '.directory', '#dir-grid', '#roster-root',
    '.video-grid', '.hero-3d', 'svg', 'table', 'form', 'script', 'style', 'noscript',
    'input', 'select', 'textarea', '[aria-hidden="true"]'
  ].join(',');
  // Parts of a unit that are controls or decoration, not exhibit text.
  var STRIP = '.donate-note button, .donate-note div, button.go, .zoom, .bio-link, .more, .unit-card-link, .tg-listen, [data-tour-skip]';

  var SAY = [
    [/[↗→←⤢↪—–]\s*$/g, ''],
    [/[↗⤢\u{1F5FA}\u{1F3A7}\u{1F50A}▶⏵]/gu, ''],
    [/\s+[→←]\s*/g, ' '],
    [/\s*[—]\s*/g, ', '],
    [/(\d)\s*[–]\s*(\d)/g, '$1 to $2'],
    [/\bWWII\b/g, 'World War Two'], [/\bWWI\b/g, 'World War One'],
    [/\bLt\. Col\./g, 'Lieutenant Colonel'], [/\bLt\. Gen\./g, 'Lieutenant General'],
    [/\bMaj\. Gen\./g, 'Major General'], [/\bBrig\. Gen\./g, 'Brigadier General'],
    [/\bGen\./g, 'General'], [/\bCol\./g, 'Colonel'], [/\bMaj\./g, 'Major'],
    [/\bCapt\./g, 'Captain'], [/\b1st Lt\./g, 'First Lieutenant'], [/\b2nd Lt\./g, 'Second Lieutenant'],
    [/\bLt\./g, 'Lieutenant'], [/\bSgt\. Maj\./g, 'Sergeant Major'], [/\bSgt\./g, 'Sergeant'],
    [/\bCpl\./g, 'Corporal'], [/\bPvt\./g, 'Private'], [/\bCSM\b/g, 'Command Sergeant Major'],
    [/\bNo\.\s*(\d)/g, 'Number $1'], [/\bca\.\s*(\d)/g, 'circa $1'],
    [/\b(\d*2)d\b/g, '$1nd'], [/\b(\d*3)d\b/g, '$1rd'],
    [/\bCMH\b/g, 'C.M.H.'], [/\bS\.(\d)/g, 'S. $1'],
    // "Cyber" is always said "SIGH-ber". Some voices say "kib-er" or "sibber",
    // so the voice gets a spelling it cannot misread. Captions keep "Cyber".
    [/\b(c)yber(?=[a-z])/gi, function(m, c){ return (c === 'C' ? 'Sigh' : 'sigh') + 'ber '; }],
    [/\b(c)yber\b/gi, function(m, c){ return (c === 'C' ? 'Sigh' : 'sigh') + 'ber'; }],
    [/&/g, ' and '], [/\s{2,}/g, ' ']
  ];

  function isVisible(el){ return !!(el.offsetParent || el.getClientRects().length); }

  // Kickers and labels set in capitals ("WING ONE") read badly in some voices.
  // Runs of two or more capitalized words become sentence case; lone
  // acronyms (NETCOM, CECOM) are left alone.
  function sentenceCase(line){
    return line.replace(/\b[A-Z][A-Z'\u2019]+(?:[ \u2014\u2013-]+[A-Z][A-Z'\u2019]*)+\b/g, function(run){
      return run.charAt(0) + run.slice(1).toLowerCase();
    });
  }

  // The text of an exhibit, as a visitor would see it, minus its controls.
  function exhibitText(el){
    if (el.hasAttribute('data-tour-say')) return el.getAttribute('data-tour-say');
    var text = el.innerText || el.textContent || '';
    el.querySelectorAll(STRIP).forEach(function(s){
      var t = (s.innerText || '').trim();
      if (t) text = text.replace(t, '');
    });
    if (isNameList(el)){
      var names = [];
      el.querySelectorAll(':scope > li').forEach(function(li){ names.push(li.textContent.trim()); });
      return names.join(', ') + '.';
    }
    if (el.matches('.cmd-patches')){
      var labels = [];
      el.querySelectorAll('.lbl').forEach(function(l){ labels.push(l.textContent.replace(/[↗]/g, '').trim()); });
      text = 'On the wall: ' + labels.join(', ') + '.';
    }
    // A bold lead-in run into its text ("Also this month" + text) gets a stop.
    el.querySelectorAll(':scope > b, :scope > strong').forEach(function(b){
      var t = (b.innerText || '').trim();
      if (t && !/[.:!?]$/.test(t)) text = text.replace(t, t + '. ');
    });
    text = text.replace(/[\u2197\u2922]/g, '');
    var lines = text.split(/\n+/).map(function(l){ return sentenceCase(l.trim()); }).filter(Boolean);
    return lines.map(function(l){ return /[.!?:;,"”)]$/.test(l) ? l : l + '.'; }).join(' ');
  }

  // A long list of short entries (donor names, say) is read as one exhibit,
  // not one name at a time.
  function isNameList(el){
    if (!/^(UL|OL)$/.test(el.tagName)) return false;
    var items = el.querySelectorAll(':scope > li');
    if (items.length < 8) return false;
    for (var i = 0; i < items.length; i++){
      if (items[i].textContent.trim().length > 60 || items[i].querySelector('p, div, ul, ol')) return false;
    }
    return true;
  }

  function speakable(text){
    SAY.forEach(function(r){ text = text.replace(r[0], r[1]); });
    return text.replace(/\s+([.,;:!?])/g, '$1').replace(/([.,;:!?]){2,}/g, '$1').trim();
  }

  // Every exhibit in a room that is on screen now (open tab only), in page order.
  function roomSegments(room){
    var picked = [];
    var set = new Set();
    room.querySelectorAll(UNIT + ',' + GENERIC + ',ul,ol').forEach(function(el){
      if (/^(UL|OL)$/.test(el.tagName) && !el.matches(UNIT) && !isNameList(el)) return;
      if (el.closest(SKIP) || !isVisible(el)) return;
      for (var p = el.parentElement; p && p !== room; p = p.parentElement){ if (set.has(p)) return; }
      var text = exhibitText(el).replace(/\s+/g, ' ').trim();
      if (text.replace(/[^A-Za-z0-9]/g, '').length < 2) return;
      // A unit swallows the generic elements inside it, so drop any already picked.
      if (el.matches(UNIT) || isNameList(el)){
        picked = picked.filter(function(s){ return !el.contains(s.el); });
      }
      set.add(el);
      picked.push({el: el, text: text});
    });
    return picked;
  }

  function roomTabs(room){
    var nav = room.querySelector('.subnav');
    if (!nav) return [];
    var names = [];
    nav.querySelectorAll('button[data-sub]').forEach(function(b){
      if (!b.classList.contains('active')) names.push(tabName(b));
    });
    return names;
  }

  function tabName(b){
    var t = '';
    b.childNodes.forEach(function(n){ if (n.nodeType === 3) t += n.textContent; });
    return (t || b.textContent).trim();
  }

  function listJoin(a){
    if (a.length < 2) return a.join('');
    return a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  }

  // ---------- tour stops: the Museum Directory, Lobby first ----------
  function tourStops(){
    var stops = [{go: 'lobby', name: 'the Lobby'}];
    document.querySelectorAll('#dir-grid .dir-item').forEach(function(d){
      var go = d.getAttribute('data-goto');
      if (go === 'map' || d.hasAttribute('data-avsub')) return; // the map and the games are hands-on
      var t = d.querySelector('.t');
      var name = t ? t.textContent.trim() : go;
      // "the Auditorium", "the Aviation Annex"; but "Support the Museum", "The Hello Girls"
      if (/(Annex|Gallery|Auditorium|Roll|Timeline|Spotlight)$/.test(name)) name = 'the ' + name;
      stops.push({go: go, name: name});
    });
    return stops;
  }

  function activeRoom(){ return document.querySelector('.room.active'); }
  function roomName(room){
    if (!room) return '';
    if (room.id === 'room-lobby') return 'the Lobby';
    var t = room.querySelector('.room-title');
    return t ? t.textContent.trim() : room.id.replace(/^room-/, '');
  }

  // ---------- settings (remembered per browser) ----------
  var store = {
    get: function(k, d){ try { var v = localStorage.getItem('tg-' + k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
    set: function(k, v){ try { localStorage.setItem('tg-' + k, JSON.stringify(v)); } catch(e){} }
  };
  var settings = {
    rate: store.get('rate2', 0.9),   // a calm, unhurried pace by default
    voice: store.get('voice', ''),
    auto: store.get('auto', true),
    sound: store.get('sound', true),
    captions: store.get('captions', true)
  };

  // ---------- the panel ----------
  var panel = document.createElement('section');
  panel.className = 'tg-panel';
  panel.setAttribute('aria-label', 'Tour guide');
  panel.hidden = true;
  panel.innerHTML =
    '<div class="tg-head">' +
      '<img class="tg-avatar" src="assets/seal-mark.png" width="40" height="40" alt="">' +
      '<div class="tg-who"><div class="tg-role">Your Tour Guide</div><div class="tg-where" id="tg-where">Lobby</div></div>' +
      '<div class="tg-step" id="tg-step"></div>' +
      '<button type="button" class="tg-icon" id="tg-min" aria-label="Minimize tour guide" title="Minimize">&#8211;</button>' +
      '<button type="button" class="tg-icon" id="tg-close" aria-label="End the tour" title="End the tour">&times;</button>' +
    '</div>' +
    '<div class="tg-body">' +
      '<div class="tg-caption" id="tg-caption"></div>' +
      '<div class="tg-progress" aria-hidden="true"><span id="tg-bar"></span></div>' +
      '<div class="tg-controls">' +
        '<button type="button" class="tg-btn" id="tg-prev" aria-label="Previous exhibit" title="Previous exhibit">&#9198;</button>' +
        '<button type="button" class="tg-btn tg-play" id="tg-play" aria-label="Play">&#9654;</button>' +
        '<button type="button" class="tg-btn" id="tg-next" aria-label="Next exhibit" title="Next exhibit">&#9197;</button>' +
        '<button type="button" class="tg-text" id="tg-room" title="Skip to the next room">Next room &#8594;</button>' +
        '<button type="button" class="tg-icon tg-gear" id="tg-gear" aria-label="Guide settings" aria-expanded="false" title="Settings">&#9881;</button>' +
      '</div>' +
      '<div class="tg-settings" id="tg-settings" hidden>' +
        '<label>Speed <select id="tg-rate">' +
          '<option value="0.8">Slower</option><option value="0.9">Calm</option><option value="1">Normal</option>' +
          '<option value="1.15">Brisk</option><option value="1.3">Fast</option></select></label>' +
        '<label class="tg-voice-wrap">Voice <select id="tg-voice"></select></label>' +
        '<label class="tg-check"><input type="checkbox" id="tg-auto"> Walk to the next room on my own</label>' +
        '<label class="tg-check"><input type="checkbox" id="tg-sound"> Read aloud (off: captions only)</label>' +
        '<label class="tg-check"><input type="checkbox" id="tg-captions"> Show captions</label>' +
        '<p class="tg-hint">For the most natural voice, pick one marked Natural, Premium or Enhanced.</p>' +
        '<p class="tg-hint">Tip: while the guide is open, tap any paragraph to hear it read from there.</p>' +
      '</div>' +
    '</div>' +
    '<button type="button" class="tg-nav" id="tg-nav" hidden></button>';
  document.body.appendChild(panel);

  var launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'tg-launch';
  launcher.innerHTML = '<span aria-hidden="true">&#127911;</span> Guided Tour';
  launcher.setAttribute('aria-label', 'Start the guided tour');
  document.body.appendChild(launcher);

  var $ = function(id){ return document.getElementById(id); };
  var ui = {
    where: $('tg-where'), step: $('tg-step'), caption: $('tg-caption'), bar: $('tg-bar'),
    play: $('tg-play'), prev: $('tg-prev'), next: $('tg-next'), room: $('tg-room'),
    gear: $('tg-gear'), settings: $('tg-settings'), rate: $('tg-rate'), voice: $('tg-voice'),
    auto: $('tg-auto'), sound: $('tg-sound'), captions: $('tg-captions'), nav: $('tg-nav')
  };

  // A "Listen" button on every room, and a tour invitation in the Lobby.
  document.querySelectorAll('.room').forEach(function(room){
    var head = room.querySelector('.room-head') || room.querySelector('.hero');
    if (!head || head.querySelector('.tg-listen')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tg-listen';
    b.innerHTML = '<span aria-hidden="true">&#128266;</span> Listen to this room';
    b.addEventListener('click', function(){ openGuide('room'); });
    head.appendChild(b);
  });
  var welcome = document.querySelector('#room-lobby .hero .welcome');
  if (welcome){
    var cta = document.createElement('div');
    cta.className = 'tg-cta';
    cta.innerHTML = '<button type="button" class="tg-cta-go"><span aria-hidden="true">&#127911;</span> Take the guided tour</button>' +
      '<span>A guide walks you through every room and reads the exhibits aloud.</span>';
    cta.querySelector('button').addEventListener('click', function(){ openGuide('tour', true); });
    welcome.parentNode.insertBefore(cta, welcome.nextSibling);
    // the Lobby's own Listen button would duplicate this one
    var lobbyListen = document.querySelector('#room-lobby .tg-listen');
    if (lobbyListen) lobbyListen.remove();
  }

  // ---------- state ----------
  var st = {
    mode: 'tour',        // 'tour' walks the museum; 'room' reads one room
    stops: [], stop: 0,
    queue: [], idx: 0,   // queue of things to say in this room: {el?, text, kind}
    chunks: [], chunk: 0,
    playing: false,
    token: 0,            // bumps on every stop, so stale speech callbacks do nothing
    expectRoom: null,    // the room the guide itself is walking into
    timer: null,
    lit: null
  };

  // ---------- voices ----------
  var voices = [];
  function loadVoices(){
    if (!synth) return;
    voices = synth.getVoices().filter(function(v){ return /^en(-|_|$)/i.test(v.lang); });
    var score = function(v){
      var n = v.name;
      if (/Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|eSpeak/i.test(n)) return -100;
      return (/Natural|Neural|Premium|Enhanced|Siri/i.test(n) ? 50 : 0) +
             (/Ava|Aria|Jenny|Emma|Andrew|Brian|Guy|Michelle|Zoe|Evan|Nathan|Samantha|Allison|Susan|Serena|Daniel|Libby|Sonia|Ryan/i.test(n) ? 20 : 0) +
             (/Google US English|Google UK English/i.test(n) ? 15 : 0) +
             (/en-US/i.test(v.lang) ? 8 : /en-GB/i.test(v.lang) ? 5 : 0) +
             (/Microsoft (David|Mark|Zira) Desktop/i.test(n) ? -20 : 0);
    };
    voices.sort(function(a, b){ return score(b) - score(a); });
    ui.voice.innerHTML = voices.map(function(v){
      return '<option value="' + v.name.replace(/"/g, '&quot;') + '">' + v.name.replace(/</g, '&lt;') + ' (' + v.lang + ')</option>';
    }).join('');
    if (settings.voice && voices.some(function(v){ return v.name === settings.voice; })) ui.voice.value = settings.voice;
    panel.querySelector('.tg-voice-wrap').hidden = !voices.length;
  }
  if (synth){
    loadVoices();
    if ('onvoiceschanged' in synth) synth.addEventListener('voiceschanged', loadVoices);
  }
  function currentVoice(){
    var name = ui.voice.value;
    for (var i = 0; i < voices.length; i++) if (voices[i].name === name) return voices[i];
    return voices[0] || null;
  }
  // No voices installed (some Linux browsers): fall back to captions on a timer.
  function canSpeak(){ return !!synth && settings.sound && voices.length > 0; }

  // ---------- speaking ----------
  // Long text is split at sentence ends: some browsers cut a voice off after
  // about fifteen seconds, and short pieces make pause and resume exact.
  function chunk(text){
    var parts = text.match(/[^.!?]+(?:[.!?]+["”)]?|$)\s*/g) || [text];
    var out = [], cur = '';
    parts.forEach(function(p){
      if (cur && ((cur + p).length > 220 || cur.trim().length > 60)){ out.push(cur.trim()); cur = ''; }
      cur += p;
    });
    if (cur.trim()) out.push(cur.trim());
    return out;
  }

  function stopVoice(){
    st.token++;
    clearTimeout(st.timer);
    if (synth) synth.cancel();
  }

  function sayChunk(){
    var item = st.queue[st.idx];
    if (!item) return;
    var my = ++st.token;
    var text = st.chunks[st.chunk];
    renderCaption();
    var done = function(){
      if (my !== st.token || !st.playing) return;
      if (st.chunk < st.chunks.length - 1){
        st.chunk++;
        st.timer = setTimeout(function(){ if (my === st.token && st.playing) sayChunk(); }, 220);
      }
      else afterItem();
    };
    if (canSpeak()){
      var u = new SpeechSynthesisUtterance(speakable(text));
      var v = currentVoice();
      if (v){ u.voice = v; u.lang = v.lang; } else { u.lang = 'en-US'; }
      u.rate = settings.rate;
      u.pitch = 0.95;
      u.onend = done;
      u.onerror = function(e){
        if (my !== st.token) return;
        if (e.error === 'interrupted' || e.error === 'canceled') return;
        // Anything else (no audio allowed, voice failed): read this piece as a caption.
        timed(text, done);
      };
      synth.speak(u);
    } else {
      timed(text, done);
    }
  }
  // Captions-only reading pace: about 170 words a minute at normal speed.
  function timed(text, done){
    var words = text.split(/\s+/).length;
    st.timer = setTimeout(done, Math.max(1800, words * 350 / settings.rate));
  }

  function afterItem(){
    if (st.idx < st.queue.length - 1){
      var gap = st.queue[st.idx].kind === 'guide' ? 700 : 1000;
      var my = st.token;
      st.timer = setTimeout(function(){ if (my === st.token && st.playing) startItem(st.idx + 1); }, gap);
      return;
    }
    // End of this room.
    if (st.mode === 'tour' && st.stop < st.stops.length - 1){
      if (settings.auto){ var my2 = st.token; st.timer = setTimeout(function(){ if (my2 === st.token && st.playing) walkTo(st.stop + 1); }, 1600); }
      else { setPlaying(false); showNav('Walk on to ' + st.stops[st.stop + 1].name + ' →', function(){ walkTo(st.stop + 1, true); }); }
    } else {
      setPlaying(false);
      unlight();
      if (st.mode === 'room') showNav('Take the full guided tour from here →', function(){ startTourHere(); });
    }
  }

  function startItem(i){
    stopVoice();
    st.idx = Math.max(0, Math.min(i, st.queue.length - 1));
    var item = st.queue[st.idx];
    st.chunks = chunk(item.text);
    st.chunk = 0;
    light(item.el);
    renderStep();
    if (st.playing) sayChunk(); else renderCaption();
  }

  // ---------- highlighting ----------
  function light(el){
    unlight();
    if (!el) return;
    st.lit = el;
    el.classList.add('tg-reading');
    var r = el.getBoundingClientRect();
    var panelTop = panel.hidden ? window.innerHeight : panel.getBoundingClientRect().top;
    if (r.top < 70 || r.bottom > panelTop - 10){
      el.scrollIntoView({block: 'center', behavior: reduceMotion ? 'auto' : 'smooth'});
    }
  }
  function unlight(){
    if (st.lit) st.lit.classList.remove('tg-reading');
    st.lit = null;
  }

  // ---------- building what to say in a room ----------
  function buildRoomQueue(intro){
    var room = activeRoom();
    var q = [];
    if (intro) q.push({kind: 'guide', text: intro});
    roomSegments(room).forEach(function(s){ q.push({kind: 'exhibit', el: s.el, text: s.text}); });
    var tabs = roomTabs(room);
    if (tabs.length){
      q.push({kind: 'guide', text: 'This room has more to explore under its other tabs: ' + listJoin(tabs) + '. Open any of them and press Listen to this room.'});
    }
    if (st.mode === 'tour' && st.stop === st.stops.length - 1){
      q.push({kind: 'guide', text: 'That brings us to the end of the tour. Thank you for walking these halls with me. Every room here stays open because of donors and members, and you will find ways to help in Support the Museum. Feel free to wander back to any room you would like to see again.'});
    }
    st.queue = q;
    st.idx = 0;
  }

  function walkTo(n, playNow, introOverride){
    stopVoice();
    hideNav();
    st.stop = n;
    var stop = st.stops[n];
    st.expectRoom = 'room-' + stop.go;
    navigate(stop.go);
    var intro = n === 0
      ? 'Welcome to the virtual museum of the Signal and Cyber Corps Museum Society. I will be your guide today. We will walk through the museum one room at a time, and I will read each exhibit to you as we go. You can pause me, skip ahead, or wander into any room on your own whenever you like.'
      : (n === 1 ? 'Let us begin. Our first stop is ' : 'Next, we walk to ') + stop.name + '.';
    buildRoomQueue(introOverride || intro);
    if (playNow) setPlaying(true);
    renderAll();
    startItem(0);
  }

  // Room navigation goes through the museum's own data-goto handler.
  var navBtn = document.createElement('button');
  navBtn.type = 'button'; navBtn.hidden = true; navBtn.className = 'tg-hidden-nav';
  panel.appendChild(navBtn);
  function navigate(go){
    var room = activeRoom();
    if (room && room.id === 'room-' + go){ st.expectRoom = null; return; }
    navBtn.setAttribute('data-goto', go);
    navBtn.click();
  }

  function startTourHere(){
    st.mode = 'tour';
    st.stops = tourStops();
    var room = activeRoom();
    var at = 0;
    st.stops.forEach(function(s, i){ if (room && room.id === 'room-' + s.go) at = i; });
    walkTo(at, true, at === 0 ? null :
      'Let us start the tour right here, in ' + st.stops[at].name + '. When we finish this room, I will walk you on to the next one.');
  }

  // ---------- opening and closing ----------
  function openGuide(mode, fromStart){
    panel.hidden = false;
    panel.classList.remove('tg-min');
    launcher.hidden = true;
    document.body.classList.add('tg-on');
    hideNav();
    if (mode === 'tour'){
      st.mode = 'tour';
      st.stops = tourStops();
      if (fromStart){ walkTo(0, true); }
      else { startTourHere(); }
    } else {
      st.mode = 'room';
      buildRoomQueue('');
      setPlaying(true);
      startItem(0);
    }
    renderAll();
  }

  function closeGuide(){
    stopVoice();
    setPlaying(false);
    unlight();
    panel.hidden = true;
    launcher.hidden = false;
    document.body.classList.remove('tg-on');
    launcher.focus();
  }

  function setPlaying(on){
    st.playing = on;
    ui.play.innerHTML = on ? '&#10074;&#10074;' : '&#9654;';
    ui.play.setAttribute('aria-label', on ? 'Pause' : 'Play');
    ui.play.title = on ? 'Pause' : 'Play';
    panel.classList.toggle('tg-playing', on);
  }

  function togglePlay(){
    if (st.playing){ stopVoice(); setPlaying(false); renderCaption(); return; }
    hideNav();
    if (!st.queue.length){ buildRoomQueue(''); st.idx = 0; }
    // Finished this room already: start it again.
    setPlaying(true);
    var item = st.queue[st.idx];
    if (item){ light(item.el); sayChunk(); }
  }

  // ---------- rendering ----------
  function renderStep(){
    var room = activeRoom();
    ui.where.textContent = st.mode === 'tour' && st.stops[st.stop]
      ? st.stops[st.stop].name.replace(/^the /, 'The ')
      : roomName(room).replace(/^the /, 'The ');
    ui.step.textContent = st.mode === 'tour' && st.stops.length ? 'Stop ' + (st.stop + 1) + ' of ' + st.stops.length : 'This room';
    var pct = st.queue.length ? ((st.idx + (st.chunks.length ? st.chunk / st.chunks.length : 0)) / st.queue.length) * 100 : 0;
    ui.bar.style.width = pct.toFixed(1) + '%';
    ui.prev.disabled = st.idx <= 0;
    ui.next.disabled = st.idx >= st.queue.length - 1;
    ui.room.hidden = st.mode !== 'tour' || st.stop >= st.stops.length - 1;
  }

  function esc(s){ return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function renderCaption(){
    var item = st.queue[st.idx];
    renderStep();
    panel.classList.toggle('tg-nocap', !settings.captions);
    if (!item){ ui.caption.innerHTML = ''; return; }
    ui.caption.classList.toggle('tg-guide-line', item.kind === 'guide');
    ui.caption.innerHTML = st.chunks.map(function(c, i){
      return '<span' + (i === st.chunk ? ' class="tg-now"' : '') + '>' + esc(c) + '</span>';
    }).join(' ');
    var now = ui.caption.querySelector('.tg-now');
    if (now) ui.caption.scrollTop = Math.max(0, now.offsetTop - ui.caption.offsetTop - 8);
  }

  function renderAll(){
    ui.rate.value = String(settings.rate);
    if (ui.rate.value === '') ui.rate.value = '1';
    ui.auto.checked = settings.auto;
    ui.sound.checked = settings.sound && !!synth;
    ui.sound.disabled = !synth;
    ui.captions.checked = settings.captions;
    renderCaption();
  }

  function showNav(label, fn){
    ui.nav.textContent = label;
    ui.nav.hidden = false;
    ui.nav.onclick = function(){ hideNav(); fn(); };
  }
  function hideNav(){ ui.nav.hidden = true; ui.nav.onclick = null; }

  // ---------- controls ----------
  launcher.addEventListener('click', function(){ openGuide('tour', activeRoom() && activeRoom().id === 'room-lobby'); });
  ui.play.addEventListener('click', togglePlay);
  ui.prev.addEventListener('click', function(){ hideNav(); startItem(st.idx - 1); });
  ui.next.addEventListener('click', function(){ hideNav(); startItem(st.idx + 1); });
  ui.room.addEventListener('click', function(){ if (st.stop < st.stops.length - 1) walkTo(st.stop + 1, true); });
  $('tg-close').addEventListener('click', closeGuide);
  $('tg-min').addEventListener('click', function(){
    var min = !panel.classList.contains('tg-min');
    panel.classList.toggle('tg-min', min);
    this.innerHTML = min ? '&#9650;' : '&#8211;';
    this.setAttribute('aria-label', min ? 'Expand tour guide' : 'Minimize tour guide');
    this.title = min ? 'Expand' : 'Minimize';
  });
  ui.gear.addEventListener('click', function(){
    var open = ui.settings.hidden;
    ui.settings.hidden = !open;
    ui.gear.setAttribute('aria-expanded', String(open));
  });
  function restartChunk(){ if (st.playing){ stopVoice(); sayChunk(); } }
  ui.rate.addEventListener('change', function(){ settings.rate = parseFloat(ui.rate.value) || 1; store.set('rate2', settings.rate); restartChunk(); });
  ui.voice.addEventListener('change', function(){ settings.voice = ui.voice.value; store.set('voice', settings.voice); restartChunk(); });
  ui.auto.addEventListener('change', function(){ settings.auto = ui.auto.checked; store.set('auto', settings.auto); });
  ui.sound.addEventListener('change', function(){ settings.sound = ui.sound.checked; store.set('sound', settings.sound); restartChunk(); });
  ui.captions.addEventListener('change', function(){ settings.captions = ui.captions.checked; store.set('captions', settings.captions); renderCaption(); });

  // Tap a paragraph while the guide is open to hear it from there.
  document.addEventListener('click', function(e){
    if (panel.hidden || e.defaultPrevented) return;
    var t = e.target;
    if (t.closest('a, button, input, select, textarea, label, [data-goto], [data-lightbox], [data-img], .tg-panel, .lightbox, .biobox, .video-pop')) return;
    for (var i = 0; i < st.queue.length; i++){
      var el = st.queue[i].el;
      if (el && el.contains(t)){ setPlaying(true); hideNav(); startItem(i); return; }
    }
  });

  // ---------- staying in step with the visitor ----------
  // If the visitor walks into another room (map, top bar, a door), the guide
  // stops talking and waits there. Play picks up in the new room.
  var lastRoom = activeRoom();
  var mo = new MutationObserver(function(){
    var room = activeRoom();
    if (room === lastRoom) return;
    lastRoom = room;
    if (room && room.id === st.expectRoom){ st.expectRoom = null; return; }
    st.expectRoom = null;
    if (panel.hidden) return;
    stopVoice(); setPlaying(false); unlight(); hideNav();
    if (st.mode === 'tour'){
      st.stops = st.stops.length ? st.stops : tourStops();
      var found = -1;
      st.stops.forEach(function(s, i){ if (room && room.id === 'room-' + s.go) found = i; });
      if (found >= 0){
        st.stop = found;
        buildRoomQueue('Welcome to ' + st.stops[found].name + '. Press play when you are ready, and I will continue the tour from here.');
      } else {
        st.mode = 'room';
        buildRoomQueue('');
      }
    } else {
      buildRoomQueue('');
    }
    startItem(0);
    ui.caption.innerHTML = '<span class="tg-now">You are in ' + esc(roomName(room)) + '. Press play and I will read this room.</span>';
  });
  document.querySelectorAll('.room').forEach(function(r){ mo.observe(r, {attributes: true, attributeFilter: ['class']}); });

  // A tab change inside a room (Auditorium, Honor Roll, Aviation) changes what is on screen.
  document.addEventListener('click', function(e){
    var tab = e.target.closest('.subnav button[data-sub]');
    if (!tab || panel.hidden) return;
    setTimeout(function(){
      stopVoice(); setPlaying(false); unlight();
      buildRoomQueue('');
      startItem(0);
      ui.caption.innerHTML = '<span class="tg-now">You opened ' + esc(tabName(tab)) + '. Press play and I will read it.</span>';
    }, 0);
  });

  // Pause for videos, and stop when the visitor leaves the page.
  var vp = document.getElementById('video-pop');
  if (vp){
    new MutationObserver(function(){
      if (vp.classList.contains('open') && st.playing){ stopVoice(); setPlaying(false); renderCaption(); }
    }).observe(vp, {attributes: true, attributeFilter: ['class']});
  }
  window.addEventListener('pagehide', function(){ if (synth) synth.cancel(); });

  // index.html#tour opens the guide.
  if (location.hash === '#tour'){
    setTimeout(function(){
      panel.hidden = false; launcher.hidden = true; document.body.classList.add('tg-on');
      st.mode = 'tour'; st.stops = tourStops(); st.stop = 0;
      buildRoomQueue('Welcome to the virtual museum. Press play and I will walk you through it.');
      startItem(0); renderAll();
    }, 50);
  }

  renderAll();
})();
