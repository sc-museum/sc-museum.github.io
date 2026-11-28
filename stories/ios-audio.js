/* iPhone and iPad sound for the museum's films.
   Safari treats a web page's speech and synthesized music like ringtones: muted by Silent mode, and sometimes
   not started at all. Playing an ordinary (silent) audio track, started by the visitor's own tap, switches the
   page into media playback, like a video, so the narration and music play.
   Call iosAudio(true) inside the Play tap and iosAudio(false) when the film stops. Does nothing elsewhere. */
(function(){
  "use strict";
  var IOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var track = null;
  function silentWav(){   // half a second of silence, 16-bit mono WAV
    var sr = 8000, n = sr / 2, b = new ArrayBuffer(44 + n * 2), d = new DataView(b);
    function s(o, t){ for (var i = 0; i < t.length; i++) d.setUint8(o + i, t.charCodeAt(i)); }
    s(0, "RIFF"); d.setUint32(4, 36 + n * 2, true); s(8, "WAVE"); s(12, "fmt ");
    d.setUint32(16, 16, true); d.setUint16(20, 1, true); d.setUint16(22, 1, true);
    d.setUint32(24, sr, true); d.setUint32(28, sr * 2, true); d.setUint16(32, 2, true); d.setUint16(34, 16, true);
    s(36, "data"); d.setUint32(40, n * 2, true);
    return URL.createObjectURL(new Blob([b], { type: "audio/wav" }));
  }
  window.iosAudio = function(on){
    if (!IOS) return;
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    try {
      if (on) {
        if (!track) { track = new Audio(silentWav()); track.loop = true; track.setAttribute("playsinline", ""); }
        var p = track.play(); if (p && p.catch) p.catch(function(){});
        // the lock screen and Control Center show the film's name, not a blank player
        try { if ("mediaSession" in navigator && window.MediaMetadata) navigator.mediaSession.metadata = new MediaMetadata({ title: document.title.split(" · ")[0], artist: "Signal & Cyber Corps Museum Society" }); } catch (e) {}
        if (window.speechSynthesis && speechSynthesis.paused) speechSynthesis.resume();
      } else if (track) {
        track.pause();
      }
    } catch (e) {}
  };
  window.iosAudio.isIOS = IOS;
})();
