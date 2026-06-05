(function errlDevPhoneUnlock() {
  const DEV_KEY = 'errl_dev_unlock_v1';
  const LONG_PRESS_MS = 2000;

  function isDevUrl() {
    try {
      return new URLSearchParams(window.location.search).get('dev') === '1';
    } catch (_) {
      return false;
    }
  }

  function isUnlocked() {
    try {
      return isDevUrl() || localStorage.getItem(DEV_KEY) === 'true';
    } catch (_) {
      return isDevUrl();
    }
  }

  function unlock() {
    try {
      localStorage.setItem(DEV_KEY, 'true');
    } catch (_) {}
    document.body.classList.remove('errl-phone-hidden');
    document.body.classList.add('errl-phone-unlocked');
    window.dispatchEvent(new CustomEvent('errl:dev-phone-unlocked'));
  }

  function applyHiddenState() {
    if (isUnlocked()) {
      document.body.classList.add('errl-phone-unlocked');
      return;
    }
    document.body.classList.add('errl-phone-hidden');
  }

  if (isDevUrl()) unlock();
  else applyHiddenState();

  function bindErrlLongPress() {
    const errl = document.getElementById('errl');
    if (!errl || errl.dataset.devUnlockBound === '1') return;
    errl.dataset.devUnlockBound = '1';
    let timer = null;
    const clear = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    errl.addEventListener('pointerdown', () => {
      if (isUnlocked()) return;
      clear();
      timer = setTimeout(() => {
        timer = null;
        unlock();
      }, LONG_PRESS_MS);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => {
      errl.addEventListener(ev, clear);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindErrlLongPress);
  } else {
    bindErrlLongPress();
  }

  window.errlDevPhoneUnlock = { isUnlocked, unlock };
})();
