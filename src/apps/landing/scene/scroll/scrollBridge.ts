export const SCROLL_NAV_EVENT = 'errl:scroll-nav';

export type ScrollNavState = {
  /** Wrapped 0–1 scroll journey (one “lap” around the orbit). */
  progress: number;
  velocity: number;
  /** Added to DOM bubble orbit angle (degrees). */
  angleOffsetDeg: number;
  /** Added to DOM bubble orbit radius (px). */
  radiusOffset: number;
  /** Soft vertical drift of orbit center (px). */
  centerOffsetY: number;
};

export type ScrollNavOptions = {
  influence?: number;
  enabled?: boolean;
};

const state: ScrollNavState = {
  progress: 0,
  velocity: 0,
  angleOffsetDeg: 0,
  radiusOffset: 0,
  centerOffsetY: 0,
};

let influence = 1;
let enabled = true;
let mounted = false;
let rafId = 0;
let lastTs = 0;

const listeners = new Set<(s: ScrollNavState) => void>();

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
}

function readScrollNavEnabledFromUrl(): boolean {
  try {
    const v = new URLSearchParams(window.location.search).get('scrollNav');
    if (v === '0' || v === 'false') return false;
    if (v === '1' || v === 'true') return true;
  } catch (_) {}
  return true;
}

function emit() {
  try {
    window.dispatchEvent(new CustomEvent(SCROLL_NAV_EVENT, { detail: { ...state } }));
  } catch (_) {}
  listeners.forEach((fn) => fn({ ...state }));
  try {
    const rb = (window as Window & { errlRisingBubblesThree?: { setScrollDrift?: (v: number) => void } })
      .errlRisingBubblesThree;
    const modeEl = document.getElementById('rbInteractionMode') as HTMLSelectElement | null;
    if (rb && typeof rb.setScrollDrift === 'function' && modeEl?.value === 'ambient') {
      rb.setScrollDrift(state.progress);
    }
  } catch (_) {}
}

/** Lenis runway (or other drivers) can set wrapped scroll progress directly. */
export function setScrollProgress(progress: number, velocity = 0) {
  if (!enabled && velocity === 0) return;
  state.progress = ((progress % 1) + 1) % 1;
  state.velocity = velocity;
  recomputeOffsets();
  emit();
}

function recomputeOffsets() {
  const t = state.progress * Math.PI * 2;
  const inf = influence;
  state.angleOffsetDeg = state.progress * 360 * inf;
  state.radiusOffset = Math.sin(t) * 28 * inf;
  state.centerOffsetY = Math.cos(t * 0.5) * 18 * inf;
}

function ingestDelta(deltaY: number) {
  if (!enabled || prefersReducedMotion()) return;
  const inf = Math.max(0.15, influence);
  state.velocity += deltaY * 0.00035 * inf;
}

function tick(ts: number) {
  if (!lastTs) lastTs = ts;
  const dt = Math.min(0.05, (ts - lastTs) / 1000);
  lastTs = ts;

  if (enabled && !prefersReducedMotion()) {
    state.progress = (state.progress + state.velocity * dt * 2.2) % 1;
    if (state.progress < 0) state.progress += 1;
    state.velocity *= 0.9;
  }

  recomputeOffsets();
  emit();
  rafId = requestAnimationFrame(tick);
}

function isInsideErrlPanel(target: EventTarget | null): boolean {
  return target instanceof Element && !!target.closest('#errlPanel');
}

function onWheel(ev: WheelEvent) {
  if (!enabled) return;
  if (isInsideErrlPanel(ev.target)) return;
  ingestDelta(ev.deltaY);
  if (Math.abs(ev.deltaY) > 2) ev.preventDefault();
}

function onTouchStart(ev: TouchEvent) {
  (onTouchStart as { lastY?: number }).lastY = ev.touches[0]?.clientY;
}

function onTouchMove(ev: TouchEvent) {
  if (!enabled) return;
  if (isInsideErrlPanel(ev.target)) return;
  const lastY = (onTouchStart as { lastY?: number }).lastY;
  const y = ev.touches[0]?.clientY;
  if (lastY == null || y == null) return;
  const dy = lastY - y;
  (onTouchStart as { lastY?: number }).lastY = y;
  ingestDelta(dy * 2.5);
  if (Math.abs(dy) > 1) ev.preventDefault();
}

export function getScrollNavState(): ScrollNavState {
  return { ...state };
}

export function setScrollNavInfluence(value: number) {
  influence = clamp(value, 0, 2);
  recomputeOffsets();
  emit();
}

export function setScrollNavEnabled(on: boolean) {
  enabled = on;
  if (!on) {
    state.velocity = 0;
    recomputeOffsets();
    emit();
  }
}

export function subscribeScrollNav(fn: (s: ScrollNavState) => void) {
  listeners.add(fn);
  fn({ ...state });
  return () => listeners.delete(fn);
}

export function mountScrollNavDrive(options: ScrollNavOptions = {}) {
  if (typeof window === 'undefined') return () => {};
  if (mounted) {
    if (options.influence !== undefined) setScrollNavInfluence(options.influence);
    if (options.enabled !== undefined) setScrollNavEnabled(options.enabled);
    return unmountScrollNavDrive;
  }
  mounted = true;
  enabled = options.enabled ?? readScrollNavEnabledFromUrl();
  if (options.influence !== undefined) influence = clamp(options.influence, 0, 2);

  window.errlSceneScroll = {
    getState: getScrollNavState,
    setInfluence: setScrollNavInfluence,
    setEnabled: setScrollNavEnabled,
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  rafId = requestAnimationFrame(tick);

  return unmountScrollNavDrive;
}

export function unmountScrollNavDrive() {
  if (!mounted) return;
  mounted = false;
  cancelAnimationFrame(rafId);
  window.removeEventListener('wheel', onWheel);
  window.removeEventListener('touchstart', onTouchStart);
  window.removeEventListener('touchmove', onTouchMove);
  delete window.errlSceneScroll;
}

declare global {
  interface Window {
    errlSceneScroll?: {
      getState: typeof getScrollNavState;
      setInfluence: typeof setScrollNavInfluence;
      setEnabled: typeof setScrollNavEnabled;
    };
  }
}
