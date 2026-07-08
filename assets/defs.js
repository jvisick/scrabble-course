/* defs.js — tap-to-reveal definitions on reference sheets.
   Any .wordgrid .w with a data-def attribute becomes tappable:
   tap shows the definition in a full-width box under the word,
   tap again (or tap another word) hides it. */
(function () {
  var box = null, current = null;

  function close() {
    if (box) box.remove();
    if (current) {
      current.classList.remove('open');
      current.setAttribute('aria-expanded', 'false');
    }
    box = null; current = null;
  }

  function open(w) {
    close();
    box = document.createElement('div');
    box.className = 'defbox';
    var word = document.createElement('strong');
    word.textContent = w.textContent;
    box.appendChild(word);
    box.appendChild(document.createTextNode(' — ' + w.dataset.def));
    w.after(box);
    w.classList.add('open');
    w.setAttribute('aria-expanded', 'true');
    current = w;
  }

  document.querySelectorAll('.wordgrid .w[data-def]').forEach(function (w) {
    w.setAttribute('role', 'button');
    w.setAttribute('tabindex', '0');
    w.setAttribute('aria-expanded', 'false');
    function toggle() { w === current ? close() : open(w); }
    w.addEventListener('click', toggle);
    w.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
})();
