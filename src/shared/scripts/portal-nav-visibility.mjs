/**
 * Syncs Design nav visibility with localStorage (errl_portal_show_design_nav).
 * Same key as the Errl Phone "Show Design in navigation" toggle on the landing page.
 */
const KEY = 'errl_portal_show_design_nav';

function readShow() {
  try {
    return localStorage.getItem(KEY) === 'true';
  } catch (_) {
    return false;
  }
}

function apply() {
  const show = readShow();
  if (show) {
    document.documentElement.removeAttribute('data-errl-hide-design-nav');
  } else {
    document.documentElement.setAttribute('data-errl-hide-design-nav', '');
  }
  try {
    document.dispatchEvent(new CustomEvent('errl-design-nav-visibility', { detail: { show } }));
  } catch (_) {}
}

apply();

window.addEventListener('storage', (e) => {
  if (e.key === KEY) apply();
});

try {
  window.errlSetDesignNavVisibility = function (visible) {
    try {
      if (visible) localStorage.setItem(KEY, 'true');
      else localStorage.removeItem(KEY);
    } catch (_) {}
    apply();
  };
  window.__errlSyncDesignNavFromStorage = apply;
} catch (_) {}
