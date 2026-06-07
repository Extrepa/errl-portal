/**
 * Errl Phone discoverability: long-press Errl (~2s) to unlock customize panel.
 * Initial lock/unlock classes are set by boot-shell.js before first paint.
 */
(function errlDevPhoneUnlock() {
  const DEV_KEY = 'errl_dev_unlock_v1';
  const LONG_PRESS_MS = 2000;
  const MOVE_CANCEL_PX = 12;

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

  function isMainScene() {
    return document.body && document.body.classList.contains('errl-scene-main');
  }

  function isNavBubbleTarget(target) {
    if (!(target instanceof Element)) return false;
    return !!target.closest('.errl-metaball-link, #navOrbit .bubble, #navOrbitBehind .bubble');
  }

  function pointInErrl(clientX, clientY) {
    const errl = document.getElementById('errl');
    if (!errl) return false;
    const r = errl.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }

  function unlock() {
    try {
      localStorage.setItem(DEV_KEY, 'true');
    } catch (_) {}
    document.body.classList.remove('errl-phone-hidden');
    document.body.classList.add('errl-phone-unlocked');
    const errl = document.getElementById('errl');
    if (errl) errl.classList.remove('errl-long-press-active');
    window.dispatchEvent(new CustomEvent('errl:dev-phone-unlocked'));
  }

  function bindErrlLongPress() {
    if (document.documentElement.dataset.devUnlockBound === '1') return;
    document.documentElement.dataset.devUnlockBound = '1';

    let timer = null;
    let startX = 0;
    let startY = 0;

    const clear = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      const errl = document.getElementById('errl');
      if (errl) errl.classList.remove('errl-long-press-active');
    };

    document.addEventListener(
      'pointerdown',
      (ev) => {
        if (isUnlocked() || !isMainScene()) return;
        if (isNavBubbleTarget(ev.target)) return;
        if (!pointInErrl(ev.clientX, ev.clientY)) return;
        clear();
        startX = ev.clientX;
        startY = ev.clientY;
        const errl = document.getElementById('errl');
        if (errl) errl.classList.add('errl-long-press-active');
        timer = setTimeout(() => {
          timer = null;
          unlock();
        }, LONG_PRESS_MS);
      },
      { capture: true },
    );

    document.addEventListener(
      'pointermove',
      (ev) => {
        if (!timer) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) clear();
      },
      { capture: true },
    );

    ['pointerup', 'pointercancel'].forEach((evName) => {
      document.addEventListener(evName, clear, { capture: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindErrlLongPress);
  } else {
    bindErrlLongPress();
  }

  window.errlDevPhoneUnlock = { isUnlocked: isUnlocked, unlock: unlock };
})();
