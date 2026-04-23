/**
 * Syncs Design nav visibility with localStorage (errl_portal_show_design_nav).
 * Same key as the Errl Phone "Show Design in navigation" toggle on the landing page.
 */
const KEY = 'errl_portal_show_design_nav';
const FORUM_HOST = 'forum.errl.wtf';
const FORUM_WARNING_TEXT = 'You are leaving the Errl Portal and heading to the forum.';

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

function ensureExternalModal() {
  let root = document.getElementById('errl-external-modal');
  if (root) return root;

  root = document.createElement('div');
  root.id = 'errl-external-modal';
  root.className = 'errl-external-modal';
  root.hidden = true;
  root.innerHTML = `
    <div class="errl-external-modal__overlay" data-modal-close="1" aria-hidden="true"></div>
    <div class="errl-external-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="errl-external-modal-title">
      <h2 id="errl-external-modal-title" class="errl-external-modal__title">Leave portal?</h2>
      <p class="errl-external-modal__copy"></p>
      <div class="errl-external-modal__actions">
        <button type="button" class="errl-external-modal__btn" data-modal-cancel="1">Stay here</button>
        <button type="button" class="errl-external-modal__btn errl-external-modal__btn--confirm" data-modal-confirm="1">Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  return root;
}

function promptExternalNav(message) {
  return new Promise((resolve) => {
    const modal = ensureExternalModal();
    const copy = modal.querySelector('.errl-external-modal__copy');
    const confirmBtn = modal.querySelector('[data-modal-confirm="1"]');
    const cancelBtn = modal.querySelector('[data-modal-cancel="1"]');
    const closeOverlay = modal.querySelector('[data-modal-close="1"]');
    if (!copy || !confirmBtn || !cancelBtn || !closeOverlay) {
      resolve(false);
      return;
    }

    copy.textContent = message;
    modal.hidden = false;
    confirmBtn.focus();

    const cleanup = (next) => {
      modal.hidden = true;
      confirmBtn.removeEventListener('click', onConfirm);
      cancelBtn.removeEventListener('click', onCancel);
      closeOverlay.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKeyDown);
      resolve(next);
    };

    const onConfirm = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cleanup(false);
      }
    };

    confirmBtn.addEventListener('click', onConfirm, { once: true });
    cancelBtn.addEventListener('click', onCancel, { once: true });
    closeOverlay.addEventListener('click', onCancel, { once: true });
    document.addEventListener('keydown', onKeyDown);
  });
}

function bindForumWarning() {
  const seen = new WeakSet();
  const links = Array.from(document.querySelectorAll('a[href]'));
  links.forEach((link) => {
    if (seen.has(link)) return;
    const href = link.getAttribute('href') || '';
    if (!href.toLowerCase().includes(FORUM_HOST)) return;
    link.dataset.errlExternalWarning = 'forum';
    seen.add(link);
    link.addEventListener('click', async (event) => {
      if (isModifiedClick(event)) return;
      event.preventDefault();
      event.stopPropagation();
      const ok = await promptExternalNav(FORUM_WARNING_TEXT);
      if (ok) window.location.assign(link.href);
    });
  });
}

apply();
bindForumWarning();

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
