/* Google Analytics 4 for the virtual museum. Measurement ID: G-8VYFV63CSW
 *
 * Events sent:
 *   page_view       one per room, so each room shows in the Pages report
 *   room_enter      a visitor enters a room            (room_name)
 *   nav_click       map tile / directory / menu / link (nav_target, nav_source)
 *   video_play      a video starts                     (video_title, room_name)
 *   video_progress  25 / 50 / 75 % watched             (video_title, video_percent)
 *   video_complete  a video is watched to the end      (video_title, room_name)
 *   donate_click    a Donate button is pressed         (donate_source, room_name)
 *
 * A cookie notice lets a visitor turn counting off; a browser's Global Privacy
 * Control signal does the same.
 *
 * Loaded by every page on the site: the museum (through the build), and the
 * Heritage, Lineage and Honors, photo album and 404 pages (a script tag before
 * </body>, written by their generators in tools/). Outside the museum only the
 * page view, Donate clicks and the notice apply.
 *
 * Runs only on the public site, so the share copy and local previews are never
 * counted. To test, add ?ga_debug=1 to the address and watch GA4 > Admin >
 * DebugView, or Reports > Realtime.
 */
(function(){
  'use strict';
  var GA_ID = 'G-8VYFV63CSW';
  var SITE = 'Signal & Cyber Corps Museum Society';
  if (location.hostname !== 'sc-museum.github.io') return;

  // ---- the visitor's choice ----
  // Counting is on until a visitor says no. "No thanks" on the cookie notice, or
  // a browser sending the Global Privacy Control signal, turns it off entirely.
  var CHOICE_KEY = 'museum-analytics';
  var choice = null;
  try { choice = localStorage.getItem(CHOICE_KEY); } catch(e){}
  function remember(v){ try { localStorage.setItem(CHOICE_KEY, v); } catch(e){} }
  if (choice === 'no' || navigator.globalPrivacyControl){
    window['ga-disable-' + GA_ID] = true;
    return;
  }

  // ---- Google tag ----
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(tag);
  // In the museum, rooms send their own page views below; every other page
  // (Heritage, Lineage and Honors, the 404 page) sends the ordinary one.
  // debug_mode is left out unless asked for: GA4 treats even debug_mode:false as on.
  var isMuseum = !!document.querySelector('.room');
  var config = { send_page_view: !isMuseum };
  if (/[?&]ga_debug=1/.test(location.search)) config.debug_mode = true;
  gtag('js', new Date());
  gtag('config', GA_ID, config);

  function send(name, params){ gtag('event', name, params || {}); }
  function clean(t){ return (t || '').replace(/\s+/g, ' ').trim().slice(0, 100); }

  // ---- rooms ----
  // museum.js shows a room by moving the "active" class, so watch for that.
  function activeRoom(){ return document.querySelector('.room.active'); }
  function roomId(room){ return room ? room.id.replace(/^room-/, '') : ''; }
  function roomName(room){
    if (!room) return '';
    var id = roomId(room);
    var tile = document.querySelector('.map-room[data-goto="' + id + '"]:not([data-avsub])');
    var title = room.querySelector('.room-title');
    return clean((tile && tile.getAttribute('data-roomname')) || (title && title.textContent) || id);
  }

  var currentId = null;
  function enterRoom(){
    var room = activeRoom();
    var id = roomId(room);
    if (!id || id === currentId) return;
    currentId = id;
    var name = roomName(room);
    send('room_enter', { room_name: name });
    send('page_view', {
      page_title: name + ' | ' + SITE,
      page_location: location.origin + location.pathname + location.search + (id === 'lobby' ? '' : '#' + id)
    });
  }
  // After museum.js has opened any room named in the address
  setTimeout(function(){
    enterRoom();
    if (!('MutationObserver' in window)) return;
    var mo = new MutationObserver(enterRoom);
    document.querySelectorAll('.room').forEach(function(r){
      mo.observe(r, { attributes: true, attributeFilter: ['class'] });
    });
  }, 0);

  // ---- navigation: floor plan, directory, top bar, room footers, links in the text ----
  function navClick(el){
    var target = el.getAttribute('data-roomname');
    if (!target){
      var room = document.getElementById('room-' + el.getAttribute('data-goto'));
      target = roomName(room) || el.getAttribute('data-goto');
      if (el.getAttribute('data-avsub')) target += ' / ' + el.getAttribute('data-avsub');
    }
    send('nav_click', {
      nav_target: clean(target),
      nav_source: el.closest('#museum-map-svg, .map-search-results') ? 'map'
                : el.closest('.dir-grid') ? 'directory'
                : el.closest('.topbar') ? 'menu'
                : el.closest('.room-foot') ? 'footer' : 'link'
    });
  }
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('[data-goto]');
    if (el) navClick(el);
  }, true);
  document.addEventListener('keydown', function(e){
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var el = e.target.closest && e.target.closest('[data-goto]');
    if (el && el.tagName !== 'BUTTON' && el.tagName !== 'A') navClick(el);
  }, true);

  // ---- Donate buttons ----
  document.addEventListener('click', function(e){
    var el = e.target.closest && e.target.closest('a[href*="givebutter.com"], .donate-note button');
    if (!el) return;
    send('donate_click', {
      donate_source: el.classList.contains('give-launch') ? 'floating button'
                   : el.classList.contains('fly-give') ? 'fly-through'
                   : el.closest('.hero-cta') ? 'lobby welcome'
                   : el.closest('.donate-note') ? 'donate note' : 'link',
      room_name: roomName(activeRoom())
    });
  }, true);

  // ---- cookie notice, shown until the visitor answers ----
  function stopCounting(){
    window['ga-disable-' + GA_ID] = true;
    ['_ga', '_ga_' + GA_ID.replace(/^G-/, '')].forEach(function(n){
      document.cookie = n + '=; Max-Age=0; path=/';
      document.cookie = n + '=; Max-Age=0; path=/; domain=' + location.hostname;
    });
  }
  if (choice !== 'ok'){
    // Styled here, in the museum's colours, so the notice looks the same on every page.
    var css = document.createElement('style');
    css.textContent =
      '.cookie-notice{position:fixed; left:50%; bottom:20px; transform:translateX(-50%); z-index:95;' +
        ' box-sizing:border-box; width:min(440px, calc(100vw - 24px)); padding:14px 16px;' +
        ' background:#183324; color:#f4f3ee; border:1px solid #c9a227; border-radius:4px;' +
        ' box-shadow:0 14px 40px rgba(0,0,0,0.6); font-family:"IBM Plex Sans", -apple-system, sans-serif; text-align:left;}' +
      '.cookie-notice.above-launchers{bottom:76px;}' + // clear of Guided Tour and Donate Now
      '.cookie-notice p{margin:0 0 10px; font-size:13.5px; line-height:1.5; color:#f4f3ee; max-width:none;}' +
      '.cookie-notice-row{display:flex; gap:8px; justify-content:flex-end;}' +
      '.cookie-notice button{font:600 13px/1.2 "IBM Plex Sans", -apple-system, sans-serif; padding:8px 16px;' +
        ' margin:0; border-radius:2px; cursor:pointer; border:1px solid #c9a227;}' +
      '.cookie-notice .cookie-ok{background:#c9a227; color:#0d1f16;}' +
      '.cookie-notice .cookie-ok:hover{background:#e0bc4a;}' +
      '.cookie-notice .cookie-no{background:none; color:#f4f3ee; border-color:#2a4a37;}' +
      '.cookie-notice .cookie-no:hover{border-color:#c9a227;}' +
      '.cookie-notice button:focus-visible{outline:2px solid #f4ecd6; outline-offset:2px;}' +
      '@media print{.cookie-notice{display:none !important;}}';
    document.head.appendChild(css);
    var notice = document.createElement('div');
    notice.className = 'cookie-notice' + (isMuseum ? ' above-launchers' : '');
    notice.setAttribute('role', 'region');
    notice.setAttribute('aria-label', 'Cookie notice');
    notice.innerHTML =
      '<p>This site uses Google Analytics cookies to count visits and to see which rooms and videos are used.</p>' +
      '<div class="cookie-notice-row">' +
        '<button type="button" class="cookie-ok">OK</button>' +
        '<button type="button" class="cookie-no">No thanks</button>' +
      '</div>';
    notice.addEventListener('click', function(e){
      var b = e.target.closest('button');
      if (!b) return;
      if (b.classList.contains('cookie-no')){ remember('no'); stopCounting(); }
      else { remember('ok'); }
      notice.remove();
    });
    document.body.appendChild(notice);
  }

  // ---- videos: every video plays in the pop-out player, as a YouTube embed ----
  var popFrame = document.getElementById('video-pop-frame');
  var popTitle = document.getElementById('video-pop-title');
  if (!popFrame || !('MutationObserver' in window)) return;

  var pending = null, apiAsked = false, timer = null;
  function track(frame){
    var facade = document.querySelector('.yt-facade.playing');
    var room = facade ? facade.closest('.room') : activeRoom();
    var base = {
      video_title: clean(popTitle && popTitle.textContent) || 'YouTube video',
      room_name: roomName(room),
      video_provider: 'youtube'
    };
    function info(extra){
      var o = { video_title: base.video_title, room_name: base.room_name, video_provider: base.video_provider };
      if (extra) o.video_percent = extra;
      return o;
    }
    var started = false, marks = {};
    new window.YT.Player(frame, { events: { onStateChange: function(e){
      var p = e.target;
      clearInterval(timer);
      if (e.data === window.YT.PlayerState.PLAYING){
        if (!started){ started = true; marks = {}; send('video_play', info()); }
        timer = setInterval(function(){
          if (!frame.isConnected){ clearInterval(timer); return; }
          var d = p.getDuration && p.getDuration(), t = p.getCurrentTime && p.getCurrentTime();
          if (!d) return;
          [25, 50, 75].forEach(function(m){
            if (t / d * 100 >= m && !marks[m]){ marks[m] = true; send('video_progress', info(m)); }
          });
        }, 1000);
      } else if (e.data === window.YT.PlayerState.ENDED){
        send('video_complete', info());
        started = false; // watching again counts as a new play
      }
    } } });
  }
  function onFrame(){
    var frame = popFrame.querySelector('iframe');
    clearInterval(timer);
    if (!frame || frame.__ga) return;
    frame.__ga = true;
    if (window.YT && window.YT.Player){ track(frame); return; }
    pending = frame;
    if (apiAsked) return;
    apiAsked = true;
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){
      if (typeof prev === 'function') prev();
      if (pending && pending.isConnected) track(pending);
      pending = null;
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(s);
  }
  new MutationObserver(onFrame).observe(popFrame, { childList: true });
})();
