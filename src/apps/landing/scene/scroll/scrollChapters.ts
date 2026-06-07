/**
 * Scroll journey chapters (0–1 progress).
 * Chapter 1: approach (0–0.25) — subtle center lift
 * Chapter 2: orbit (0.25–0.75) — full carousel influence
 * Chapter 3+: reserved for future GSAP ScrollTrigger work
 */

export type ScrollChapter = 'approach' | 'orbit' | 'departure';

export function chapterFromProgress(progress: number): ScrollChapter {
  const p = ((progress % 1) + 1) % 1;
  if (p < 0.25) return 'approach';
  if (p < 0.75) return 'orbit';
  return 'departure';
}

export function applyScrollChapter(progress: number) {
  if (typeof document === 'undefined') return;
  const chapter = chapterFromProgress(progress);
  const body = document.body;
  body.dataset.errlScrollChapter = chapter;
  body.style.setProperty('--errl-scroll-chapter', String(progress));
  if (chapter === 'approach') {
    body.style.setProperty('--errl-chapter-lift', `${Math.sin(progress * Math.PI * 4) * 6}px`);
  } else {
    body.style.setProperty('--errl-chapter-lift', '0px');
  }
  if (chapter === 'departure' && progress > 0.92 && !body.dataset.errlEasterEgg) {
    body.dataset.errlEasterEgg = '1';
    body.classList.add('errl-scroll-easter-egg');
    try {
      window.dispatchEvent(new CustomEvent('errl:easter-egg', { detail: { kind: 'scroll-departure' } }));
    } catch (_) {}
  }
}
