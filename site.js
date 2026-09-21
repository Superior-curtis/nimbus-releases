/* ============================================================
   Nimbus — site behaviour.
   No framework, no dependencies. Three jobs:
     1. the interactive island demo
     2. a live menubar clock
     3. the download link
   ============================================================ */

/* ---- The only integration point on this page. -------------------
   DOWNLOAD_URL points at the released DMG.                          */
const DOWNLOAD_URL = 'https://github.com/Superior-curtis/nimbus-releases/releases/download/v1.0-beta7/Nimbus-1.0-beta7.dmg';

for (const a of document.querySelectorAll('[data-download]')) a.href = DOWNLOAD_URL;

/* ------------------------------ the demo ------------------------------ */
/* Only the homepage carries the stage. On FAQs / Changelog these are null,
   so everything below the guard is skipped and the commerce links above
   still get wired.                                                        */

const island = document.getElementById('island');
const hint   = document.getElementById('hint');
const dots   = document.getElementById('dots');
const stage  = document.getElementById('stage');

if (island && dots && stage) {

const MODES = ['idle', 'music', 'shelf', 'together', 'calendar'];
const DWELL = 3400;                       // ms a surface holds before the tour advances

let index = 0;
let touched = false;                      // the visitor has taken over — stop the tour
let timer = null;

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function show(mode, byUser) {
  index = Math.max(0, MODES.indexOf(mode));
  island.dataset.mode = mode;

  for (const b of dots.querySelectorAll('button')) {
    b.classList.toggle('on', b.dataset.go === mode);
  }

  if (byUser && !touched) {
    touched = true;
    hint.classList.add('gone');
    stop();
  }
}

function advance() { show(MODES[(index + 1) % MODES.length], false); }

function start() {
  if (touched || reduced) return;
  stop();
  timer = setInterval(advance, DWELL);
}
function stop() { clearInterval(timer); timer = null; }

island.addEventListener('click', () => show(MODES[(index + 1) % MODES.length], true));

dots.addEventListener('click', (e) => {
  const go = e.target.closest('button')?.dataset.go;
  if (go) show(go, true);
});

/* Run the tour whenever any of the stage is on screen. Threshold 0 (not 0.35):
   a short window still peeks at part of the stage, and the visitor shouldn't
   need to scroll the whole height into view before the demo wakes up.        */
if ('IntersectionObserver' in window) {
  new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { threshold: 0 }
  ).observe(stage);
} else {
  start();
}

document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

}   /* end of the stage-only block */

/* ------------------------------ menubar clock ------------------------------ */

const clockEl = document.getElementById('stageClock');
const dateEl  = document.getElementById('stageDate');

function tick() {
  if (!clockEl || !dateEl) return;
  const now = new Date();
  // Pinned to en-US: this is a mock macOS menubar, not the visitor's own clock.
  clockEl.textContent = now
    .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    .replace(/\s?(AM|PM)/i, '');
  dateEl.textContent = now.toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}
tick();
setInterval(tick, 20_000);

/* ------------------------------ nav hairline ------------------------------ */

const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('stuck', window.scrollY > 8);
onScroll();
addEventListener('scroll', onScroll, { passive: true });
