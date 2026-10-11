/*
 * "Write to the museum" form in the Get Involved room (rooms/13-give.html).
 *
 * The site has no server, so the message is handed to FormSubmit, which emails it
 * to the Society. If that fails, the visitor is offered the same message as a
 * ready-made email in their own mail program, and the address itself.
 *
 * FormSubmit must be activated once: its first message to the address is a
 * confirmation link that someone with access to the inbox has to click.
 */
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var TO = 'scmsreg@gmail.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + TO;
  var status = document.getElementById('contact-status');
  var send = document.getElementById('contact-send');

  function val(id) { return document.getElementById(id).value.trim(); }
  function say(text, kind) {
    status.textContent = text;
    status.className = 'contact-status' + (kind ? ' ' + kind : '');
  }
  function topics() {
    return [].slice.call(form.querySelectorAll('input[name="topic"]:checked')).map(function (c) { return c.value; });
  }

  // The same message as a mailto: link, for when the page cannot send it.
  function offerEmail(m) {
    var body = m.message + '\n\n' + m.name + '\n' + m.email +
      (m.unit ? '\nUnit or room: ' + m.unit : '') +
      (m.topics ? '\nAbout: ' + m.topics : '');
    status.textContent = 'This page could not send your message. ';
    status.className = 'contact-status bad';
    var a = document.createElement('a');
    a.className = 'ext-link';
    a.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(m._subject) + '&body=' + encodeURIComponent(body);
    a.textContent = 'Open it in your email program';
    status.appendChild(a);
    status.appendChild(document.createTextNode(', or write to ' + TO + '.'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (document.getElementById('contact-website').value) return;   // filled only by bots
    var name = val('contact-name'), email = val('contact-email'), message = val('contact-message');
    if (!name) { say('Please add your name.', 'bad'); document.getElementById('contact-name').focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say('Please add an email address we can reply to.', 'bad'); document.getElementById('contact-email').focus(); return; }
    if (!message) { say('Please write your message.', 'bad'); document.getElementById('contact-message').focus(); return; }

    var about = topics();
    var m = {
      _subject: 'Virtual museum: ' + (about.length ? about.join('; ') : 'message') + ' (from ' + name + ')',
      _template: 'table',
      _captcha: 'false',
      name: name,
      email: email,
      topics: about.join('; '),
      unit: val('contact-unit'),
      message: message
    };
    send.disabled = true;
    say('Sending…');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(m)
    }).then(function (r) { return r.json(); }).then(function (res) {
      if (String(res.success) !== 'true') throw new Error(res.message || 'not sent');
      form.reset();
      say('Thank you. Your message is on its way to the Society, and a volunteer will reply by email.', 'ok');
      if (typeof window.gtag === 'function') window.gtag('event', 'contact_submit', { contact_topics: m.topics });
    }).catch(function () {
      offerEmail(m);
    }).then(function () { send.disabled = false; });
  });
})();

// "Write to Us" in the top bar: museum.js opens the room that holds #write-to-us
// and scrolls to it whenever the address changes to that anchor.
(function () {
  [].forEach.call(document.querySelectorAll('[data-contact-jump]'), function (b) {
    b.addEventListener('click', function () {
      if (location.hash === '#write-to-us') history.replaceState(null, '', location.pathname + location.search);
      location.hash = 'write-to-us';
    });
  });
})();
