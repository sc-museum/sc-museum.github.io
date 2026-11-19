/*
 * Narrator for the museum's animations: a voice that says what is happening in each scene.
 *
 * An animation calls MuseumNarrator.say(text, done, owner) when a scene starts. `done` runs once the line
 * has been spoken (at once if narration is off or the device has no voice), so a player can wait for the
 * narrator before moving on. `owner` is the animation's element: MuseumNarrator.stop(owner) quiets only
 * that animation's voice, and the voice stops by itself when its animation leaves the screen.
 *
 *   MuseumNarrator.button(cls)   a "Narration" on/off button, kept in step everywhere on the page
 *   MuseumNarrator.on()          true when narration is on and the device can speak
 *
 * The narrator is a deep, slow male voice (the best one the device has), whatever the Guided Tour uses.
 * Starting the Guided Tour silences the narrator, and the narrator pauses the Guided Tour.
 */
(function () {
  var synth = ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) ? window.speechSynthesis : null;
  function get(k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var enabled = get('narr-on', true), buttons = [], halts = [];
  var cur = { token: 0, owner: null, done: null, timer: null, watch: null };

  // A documentary narrator: a deep, smooth male voice, natural voices first, novelty voices never.
  var MALE = /Guy|Christopher|Andrew|Brian|Eric|Davis|Roger|Tony|Jason|Steffan|Ryan|Thomas|Oliver|William|Liam|Connor|Daniel|Arthur|Gordon|Aaron|Evan|Nathan|Tom|Alex|Google UK English Male|David|Mark|George|James|Male/i;
  var FEMALE = /Ava|Aria|Jenny|Emma|Michelle|Samantha|Libby|Sonia|Zira|Susan|Hazel|Karen|Moira|Tessa|Fiona|Serena|Allison|Nancy|Jane|Sara|Ana|Female|Victoria|Kate/i;
  var voices = [];
  function loadVoices() {
    if (!synth) return;
    voices = synth.getVoices().filter(function (v) { return /^en(-|_|$)/i.test(v.lang); });
    var score = function (v) {
      var n = v.name;
      if (/Albert|Bad News|Bahh|Bells|Boing|Bubbles|Cellos|Good News|Jester|Organ|Superstar|Trinoids|Whisper|Wobble|Zarvox|Fred|Junior|Ralph|Kathy|eSpeak/i.test(n)) return -100;
      return (/Natural|Neural|Premium|Enhanced/i.test(n) ? 50 : 0) +
             (MALE.test(n) && !FEMALE.test(n) ? 40 : 0) + (FEMALE.test(n) ? -30 : 0) +
             (/Guy|Christopher|Davis|Roger|Andrew|Brian/i.test(n) ? 12 : 0) +            // the deepest of the natural voices
             (/Google UK English Male/i.test(n) ? 15 : 0) +
             (/en-US/i.test(v.lang) ? 6 : /en-GB/i.test(v.lang) ? 5 : 0);
    };
    voices.sort(function (a, b) { return score(b) - score(a); });
  }
  if (synth) { loadVoices(); if (synth.addEventListener) synth.addEventListener('voiceschanged', loadVoices); }
  function voice() { return voices[0] || null; }
  // Slow and low, with weight: natural voices already sound full, so they are lowered less than the older ones.
  function delivery(v) {
    var natural = v && /Natural|Neural|Premium|Enhanced/i.test(v.name);
    return { rate: natural ? .9 : .86, pitch: natural ? .85 : .72 };
  }

  // Say ranks, abbreviations and dates the way a guide would.
  var SAY = [
    [/[↗→←⤢↪]/g, ' '], [/\s*—\s*/g, ', '], [/·/g, '. '],
    [/(\d)\s*–\s*(\d)/g, '$1 to $2'], [/\s*–\s*/g, ' to '],
    [/\bWWII\b/g, 'World War Two'], [/\bWWI\b/g, 'World War One'],
    [/\bLt\. Col\./g, 'Lieutenant Colonel'], [/\bLt\. Gen\./g, 'Lieutenant General'],
    [/\bMaj\. Gen\./g, 'Major General'], [/\bBrig\. Gen\./g, 'Brigadier General'],
    [/\bGen\./g, 'General'], [/\bCol\./g, 'Colonel'], [/\bMaj\./g, 'Major'], [/\bCapt\./g, 'Captain'],
    [/\bLt\./g, 'Lieutenant'], [/\bSgt\./g, 'Sergeant'], [/\bCpl\./g, 'Corporal'], [/\bPvt\./g, 'Private'],
    [/\bSt\. (?=[A-Z])/g, 'Saint '], [/\bNo\.\s*(\d)/g, 'Number $1'],
    [/\bJan\b\.?/g, 'January'], [/\bFeb\b\.?/g, 'February'], [/\bAug\b\.?/g, 'August'], [/\bSept?\b\.?/g, 'September'],
    [/\b(\d*2)d\b/g, '$1nd'], [/\b(\d*3)d\b/g, '$1rd'],
    [/\bMSE\b/g, 'M.S.E.'], [/\bCMH\b/g, 'C.M.H.'],
    [/\b(c)yber/gi, function (m, c) { return (c === 'C' ? 'Sigh' : 'sigh') + 'ber'; }],
    [/&/g, ' and '], [/["“”]/g, ''], [/\s{2,}/g, ' ']
  ];
  function speakable(text) {
    SAY.forEach(function (r) { text = text.replace(r[0], r[1]); });
    return text.replace(/\s+([.,;:!?])/g, '$1').replace(/([.,;:!?])\1+/g, '$1').replace(/\.\s*\./g, '.').trim();
  }
  // Some browsers cut a voice off after about fifteen seconds, so long text goes in sentence-sized pieces.
  function pieces(text) {
    var parts = text.match(/[^.!?]+(?:[.!?]+|$)\s*/g) || [text], out = [], c = '';
    parts.forEach(function (p) { if (c && (c + p).length > 200) { out.push(c.trim()); c = ''; } c += p; });
    if (c.trim()) out.push(c.trim());
    return out;
  }

  function canSpeak() { return !!synth && enabled && voices.length > 0; }

  function finish(token) {
    if (token !== cur.token) return;
    var done = cur.done;
    cur.done = null; cur.owner = null; clearTimeout(cur.timer); clearInterval(cur.watch);
    if (done) done();
  }
  function quiet() {
    cur.token++; cur.done = null; cur.owner = null; clearTimeout(cur.timer); clearInterval(cur.watch);
    if (synth) synth.cancel();
  }

  function say(text, done, owner) {
    quiet();
    var token = cur.token;
    cur.owner = owner || null; cur.done = done || null;
    if (!canSpeak() || !text) { setTimeout(function () { finish(token); }, 0); return; }
    document.dispatchEvent(new CustomEvent('museum-narrator-speak'));   // the Guided Tour pauses
    var list = pieces(speakable(text)), i = 0, v = voice(), dl = delivery(v);
    // never wait forever: a voice that fails silently still lets the animation go on
    cur.timer = setTimeout(function () { finish(token); }, (text.split(/\s+/).length / 2.2 + 6) * 1000);
    // the animation left the screen (another room, a closed panel): stop talking
    if (owner) cur.watch = setInterval(function () { if (!owner.getClientRects().length) { quiet(); halts.forEach(function (f) { f(owner); }); } }, 700);
    (function next() {
      if (token !== cur.token) return;
      if (i >= list.length) { finish(token); return; }
      var u = new SpeechSynthesisUtterance(list[i++]);
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
      u.rate = dl.rate; u.pitch = dl.pitch;
      u.onend = function () { if (token === cur.token) setTimeout(next, 320); };   // a breath between sentences
      u.onerror = function (e) { if (token !== cur.token) return; if (e.error === 'interrupted' || e.error === 'canceled') return; finish(token); };
      synth.speak(u);
    })();
  }

  function stop(owner) { if (!owner || cur.owner === owner) quiet(); }

  function sync() {
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', enabled ? 'true' : 'false');
      b.title = enabled ? 'Narration is on. Select to turn it off.' : 'Narration is off. Select to turn it on.';
    });
  }
  function button(cls) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'narr-btn' + (cls ? ' ' + cls : '');
    b.innerHTML = '<span aria-hidden="true">&#128483;</span> Narration';
    if (!synth) b.hidden = true;
    b.addEventListener('click', function () { enabled = !enabled; put('narr-on', enabled); if (!enabled) quiet(); sync(); });
    buttons.push(b); sync();
    return b;
  }

  // the Guided Tour started talking: the narrator and its animation step aside
  document.addEventListener('museum-guide-speak', function () { var o = cur.owner; quiet(); halts.forEach(function (f) { f(o); }); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) quiet(); });

  window.MuseumNarrator = {
    say: say, stop: stop, button: button,
    on: function () { return canSpeak(); },
    // f(owner) runs when the narrator is cut off from outside (Guided Tour, or the animation left the screen)
    onHalt: function (f) { halts.push(f); }
  };
})();
