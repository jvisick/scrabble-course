/* quiz.js — reusable retrieval-practice widgets for the Scrabble course.
   Two widgets, both give IMMEDIATE feedback (tight loop = storage strength):

   1) validQuiz(mountId, items)  — "valid or not?" rapid-fire.
      items: [{ w: "QI", ok: true }, { w: "QT", ok: false }, ...]
      Renders one word at a time with two buttons. Tracks score + streak,
      reshuffles missed items to the end so you re-see what you got wrong.

   2) flashDeck(mountId, cards)  — self-graded recall flashcards.
      cards: [{ front: "...", back: "..." }, ...]
      Click to flip; mark "knew it" / "missed" to cycle the deck until clear.

   No dependencies. Randomization uses a caller-seedable shuffle so lessons
   vary order without relying on Math.random at author time. */

function _shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tileStrip(word) {
  return '<span class="word">' +
    word.toUpperCase().split('').map(c => `<span class="tile">${c}</span>`).join('') +
    '</span>';
}

function validQuiz(mountId, items) {
  const mount = document.getElementById(mountId);
  let queue = _shuffle(items);
  let i = 0, correct = 0, seen = 0, streak = 0, best = 0;

  function render() {
    if (i >= queue.length) return done();
    const it = queue[i];
    mount.innerHTML = `
      <div class="quiz">
        <div class="quiz-stat">Word ${seen + 1} &middot; Score ${correct}/${seen} &middot; Streak ${streak} (best ${best})</div>
        <div class="quiz-word">${tileStrip(it.w)}</div>
        <div class="quiz-btns">
          <button data-a="yes">Valid ✓</button>
          <button data-a="no">Not a word ✗</button>
        </div>
        <div class="quiz-fb">&nbsp;</div>
      </div>`;
    mount.querySelectorAll('button').forEach(b =>
      b.onclick = () => answer(b.dataset.a === 'yes', it));
  }

  function answer(said, it) {
    const right = (said === it.ok);
    seen++;
    const fb = mount.querySelector('.quiz-fb');
    if (right) {
      correct++; streak++; best = Math.max(best, streak);
      fb.className = 'quiz-fb good';
      fb.innerHTML = it.ok
        ? `✓ Yes — <strong>${it.w}</strong> is valid.${it.def ? ' ' + it.def : ''}`
        : `✓ Right — <strong>${it.w}</strong> is not in NWL2023.`;
    } else {
      streak = 0;
      queue.push(it); // re-see missed items later
      fb.className = 'quiz-fb bad';
      fb.innerHTML = it.ok
        ? `✗ Actually valid — <strong>${it.w}</strong>${it.def ? ': ' + it.def : ''}. You'll see it again.`
        : `✗ Actually not a word — <strong>${it.w}</strong> is invalid. You'll see it again.`;
    }
    // Replace the answer buttons with a self-paced Next button so the reader
    // controls how long the definition stays up. Focus it so Enter/Space advances.
    const btns = mount.querySelector('.quiz-btns');
    const last = (i + 1 >= queue.length);
    btns.innerHTML = `<button class="next">${last ? 'See results →' : 'Next word →'}</button>`;
    const nextBtn = btns.querySelector('.next');
    nextBtn.onclick = () => { i++; render(); };
    nextBtn.focus();
  }

  function done() {
    const pct = Math.round((correct / seen) * 100);
    mount.innerHTML = `
      <div class="quiz done">
        <div class="quiz-word">${pct}%</div>
        <p>${correct} of ${seen} correct · best streak ${best}.</p>
        <p>${pct >= 90 ? 'Sharp. Come back tomorrow and do it again — spacing is what makes it stick.'
                       : 'Good work. Run it again now, then once more tomorrow.'}</p>
        <button onclick="location.reload()">Run again ↻</button>
      </div>`;
  }

  render();
}

function flashDeck(mountId, cards) {
  const mount = document.getElementById(mountId);
  let queue = _shuffle(cards), i = 0, flipped = false, cleared = 0;

  function render() {
    if (i >= queue.length) {
      mount.innerHTML = `<div class="quiz done"><div class="quiz-word">✓</div>
        <p>Deck cleared — ${cleared} cards known.</p>
        <button onclick="location.reload()">Shuffle again ↻</button></div>`;
      return;
    }
    const c = queue[i];
    mount.innerHTML = `
      <div class="quiz">
        <div class="quiz-stat">Card ${i + 1} of ${queue.length}</div>
        <div class="flash" style="cursor:pointer">${flipped ? c.back : c.front}
          <div class="quiz-stat">${flipped ? '' : '(click to reveal)'}</div>
        </div>
        ${flipped ? `<div class="quiz-btns">
          <button data-a="knew">Knew it ✓</button>
          <button data-a="miss">Missed ✗</button></div>` : ''}
      </div>`;
    const flash = mount.querySelector('.flash');
    flash.onclick = () => { flipped = true; render(); };
    mount.querySelectorAll('.quiz-btns button').forEach(b => b.onclick = () => {
      if (b.dataset.a === 'miss') queue.push(c); else cleared++;
      i++; flipped = false; render();
    });
  }
  render();
}
