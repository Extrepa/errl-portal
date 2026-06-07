/**
 * Bidirectional warp nav for static portal pages:
 * - Arrival fade-in when sessionStorage handoff is set
 * - Outbound intercept on internal portal links (subpage ↔ subpage, subpage → portal)
 */
const HANDOFF_KEY = 'errl_warp_handoff';
const WARP_MIN_MS = 280;
const WARP_MAX_MS = 12000;
const WALKING_ERRL_PATH = '/assets/walking-errl/index.html?embed=1';

let warpBusy = false;
const prefetched = new Set();

function runArrival() {
  try {
    if (sessionStorage.getItem(HANDOFF_KEY) !== '1') return;
    sessionStorage.removeItem(HANDOFF_KEY);
    document.documentElement.classList.add('errl-warp-arriving');
    const reveal = () => {
      document.documentElement.classList.remove('errl-warp-arriving');
      document.documentElement.classList.add('errl-warp-arrived');
    };
    if (document.readyState === 'complete') {
      requestAnimationFrame(reveal);
      return;
    }
    window.addEventListener('load', () => requestAnimationFrame(reveal), { once: true });
  } catch (_) {}
}

function isModifiedClick(event) {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

function resolveHref(a) {
  const raw = a.getAttribute('href');
  if (!raw) return null;
  try {
    return new URL(raw, window.location.href).href;
  } catch (_) {
    return null;
  }
}

function isInternalPortalLink(a) {
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
  const href = resolveHref(a);
  if (!href) return false;
  let url;
  try {
    url = new URL(href);
  } catch (_) {
    return false;
  }
  if (url.origin !== window.location.origin) return false;
  if (a.hasAttribute('data-portal-link')) return true;
  if (a.classList.contains('errl-home-btn')) return true;
  if (!a.classList.contains('errl-bubble-btn')) return false;
  const path = url.pathname.replace(/\/index\.html$/, '/').replace(/\/$/, '') || '/';
  return path === '' || path === '/' || path === '/about' || path === '/gallery' || path === '/studio';
}

function ensureWarpOverlay() {
  let root = document.getElementById('errl-warp-portal-overlay');
  if (root) return root;
  root = document.createElement('div');
  root.id = 'errl-warp-portal-overlay';
  root.className = 'errl-warp-portal-overlay';
  root.setAttribute('aria-hidden', 'true');
  const frame = document.createElement('iframe');
  frame.className = 'errl-warp-portal-overlay__loader';
  frame.src = WALKING_ERRL_PATH;
  frame.title = '';
  frame.setAttribute('tabindex', '-1');
  root.appendChild(frame);
  document.body.appendChild(root);
  return root;
}

function showWarpDeparting() {
  document.documentElement.classList.add('errl-warp-departing');
  try {
    document.body.dataset.errlWarpStage = 'OUT';
  } catch (_) {}
  const overlay = ensureWarpOverlay();
  overlay.hidden = false;
}

function prefetchRoute(href) {
  if (!href || prefetched.has(href)) return;
  prefetched.add(href);
  fetch(href, { method: 'GET', credentials: 'same-origin', cache: 'force-cache' }).catch(() => {
    prefetched.delete(href);
  });
}

async function startWarpNav(href) {
  if (warpBusy || !href) return;
  warpBusy = true;
  try {
    sessionStorage.setItem(HANDOFF_KEY, '1');
  } catch (_) {}
  showWarpDeparting();

  const started = performance.now();
  const go = () => {
    window.location.assign(href);
  };

  const maxTimer = window.setTimeout(go, WARP_MAX_MS);

  try {
    await fetch(href, { method: 'GET', credentials: 'same-origin', cache: 'force-cache' });
  } catch (_) {}

  const remaining = Math.max(0, WARP_MIN_MS - (performance.now() - started));
  if (remaining > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
  }

  window.clearTimeout(maxTimer);
  go();
}

function bindWarpNav() {
  document.addEventListener(
    'click',
    (event) => {
      const a = event.target.closest?.('a');
      if (!a || !isInternalPortalLink(a)) return;
      if (isModifiedClick(event)) return;
      const href = resolveHref(a);
      if (!href || href === window.location.href) return;
      event.preventDefault();
      event.stopPropagation();
      startWarpNav(href);
    },
    { capture: true },
  );

  document.addEventListener(
    'mouseover',
    (event) => {
      const a = event.target.closest?.('a');
      if (!a || !isInternalPortalLink(a)) return;
      prefetchRoute(resolveHref(a));
    },
    { passive: true },
  );

  document.addEventListener(
    'focusin',
    (event) => {
      const a = event.target.closest?.('a');
      if (!a || !isInternalPortalLink(a)) return;
      prefetchRoute(resolveHref(a));
    },
    { passive: true },
  );
}

runArrival();
bindWarpNav();
