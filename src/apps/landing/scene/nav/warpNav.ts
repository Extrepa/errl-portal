export type WarpStage = 'IDLE' | 'OUT';

export const WARP_NAV_EVENT = 'errl:warp-nav';
/** Brief beat so the swap reads before navigation. */
export const WARP_MIN_MS = 280;
/** Safety cap if preload hangs. */
export const WARP_MAX_MS = 12000;

export type WarpNavState = {
  stage: WarpStage;
  targetRoute: string | null;
};

let stage: WarpStage = 'IDLE';
let targetRoute: string | null = null;
let warpGeneration = 0;
let maxWarpTimer: ReturnType<typeof setTimeout> | null = null;

const listeners = new Set<(s: WarpNavState) => void>();
const prefetched = new Set<string>();

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
}

function boostWarpStars() {
  try {
    window.errlBgParticlesBoost?.({ amount: 1.1, durationMs: WARP_MAX_MS });
  } catch (_) {}
}

function emit() {
  const snapshot = getWarpNavState();
  try {
    document.body.dataset.errlWarpStage = snapshot.stage;
  } catch (_) {}
  try {
    window.dispatchEvent(new CustomEvent(WARP_NAV_EVENT, { detail: snapshot }));
  } catch (_) {}
  listeners.forEach((fn) => fn(snapshot));
}

export function getWarpNavState(): WarpNavState {
  return { stage, targetRoute };
}

export function subscribeWarpNav(fn: (s: WarpNavState) => void) {
  listeners.add(fn);
  fn(getWarpNavState());
  return () => {
    listeners.delete(fn);
  };
}

export function prefetchWarpRoute(href: string) {
  if (typeof window === 'undefined' || !href || prefetched.has(href)) return;
  prefetched.add(href);
  fetch(href, { method: 'GET', credentials: 'same-origin', cache: 'force-cache' }).catch(() => {
    prefetched.delete(href);
  });
}

export type StartWarpNavOptions = {
  /** Playwright / unit checks: animate overlay only, no navigation. */
  dryRun?: boolean;
};

function clearMaxWarpTimer() {
  if (maxWarpTimer) {
    clearTimeout(maxWarpTimer);
    maxWarpTimer = null;
  }
}

function navigateWhenReady(href: string, generation: number) {
  const started = performance.now();

  const go = () => {
    if (generation !== warpGeneration || stage !== 'OUT' || targetRoute !== href) return;
    try {
      sessionStorage.setItem('errl_warp_handoff', '1');
    } catch (_) {}
    window.location.assign(href);
  };

  clearMaxWarpTimer();
  maxWarpTimer = setTimeout(go, WARP_MAX_MS);

  (async () => {
    try {
      await fetch(href, { method: 'GET', credentials: 'same-origin', cache: 'force-cache' });
    } catch (_) {}

    const elapsed = performance.now() - started;
    const remaining = Math.max(0, WARP_MIN_MS - elapsed);
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining));
    }

    if (generation !== warpGeneration) return;
    clearMaxWarpTimer();
    go();
  })();
}

export function startWarpNav(href: string, options: StartWarpNavOptions = {}) {
  if (typeof window === 'undefined' || !href) return;
  if (stage !== 'IDLE') return;

  if (options.dryRun) {
    targetRoute = href;
    stage = 'OUT';
    emit();
    maxWarpTimer = setTimeout(() => {
      maxWarpTimer = null;
      resetWarpNav();
    }, 120);
    return;
  }

  if (prefersReducedMotion()) {
    window.location.assign(href);
    return;
  }

  warpGeneration += 1;
  const generation = warpGeneration;

  targetRoute = href;
  stage = 'OUT';
  emit();
  boostWarpStars();
  navigateWhenReady(href, generation);
}

export function resetWarpNav() {
  warpGeneration += 1;
  stage = 'IDLE';
  targetRoute = null;
  clearMaxWarpTimer();
  emit();
}

export function mountWarpNavGlobal() {
  if (typeof window === 'undefined') return;
  window.errlWarpNav = {
    startWarpNav,
    getWarpNavState,
    resetWarpNav,
    prefetchWarpRoute,
  };
}

declare global {
  interface Window {
    errlBgParticlesBoost?: (opts?: { amount?: number; durationMs?: number }) => void;
    errlWarpNav?: {
      startWarpNav: typeof startWarpNav;
      getWarpNavState: typeof getWarpNavState;
      resetWarpNav: typeof resetWarpNav;
      prefetchWarpRoute: typeof prefetchWarpRoute;
    };
  }
}
