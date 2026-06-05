import Lenis from 'lenis';

export function initAboutSmoothScroll() {
  const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  return lenis;
}
