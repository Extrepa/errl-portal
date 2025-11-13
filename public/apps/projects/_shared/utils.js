/**
 * Shared utilities for Errl portal visual effects
 * – Reduced-motion support
 * – DPR-aware canvas sizing
 * – Pointer event throttling
 */

export function isReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function onReducedMotionChange(callback) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (e) => callback(e.matches);
  if (mq.addEventListener) {
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  } else {
    // Legacy
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }
}

export function setCanvasSize(canvas, cssWidth, cssHeight, dpr = window.devicePixelRatio || 1) {
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

export function throttleWithRaf(fn) {
  let rafId = null;
  let lastArgs = null;
  return function throttled(...args) {
    lastArgs = args;
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn.apply(this, lastArgs);
        rafId = null;
        lastArgs = null;
      });
    }
  };
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Update root CSS variable to signal reduced motion state
 */
export function updateReducedMotionCSSVar() {
  document.documentElement.style.setProperty('--reduced-motion', isReducedMotion() ? '1' : '0');
}

// Auto-update on load
if (typeof document !== 'undefined') {
  updateReducedMotionCSSVar();
  onReducedMotionChange(updateReducedMotionCSSVar);
}
