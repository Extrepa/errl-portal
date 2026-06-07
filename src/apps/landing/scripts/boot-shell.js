/**
 * Synchronous first-paint boot shell.
 * Must run as the first script inside <body> before any visible chrome paints.
 * Sets body classes for phone lock, nav mode, and scene phase.
 */
(function errlBootShell() {
  const SETTINGS_KEY = 'errl_portal_settings_v1';
  const DEV_KEY = 'errl_dev_unlock_v1';
  const ENTERED_KEY = 'errl_entered_v1';

  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch (_) {
    params = new URLSearchParams();
  }

  const dev = params.get('dev') === '1';
  const scene3d = params.get('scene3d') === '1';
  const domOverride = params.get('dom') === '1' || params.get('scene3d') === '0';
  const skipIntro = params.get('skipIntro') === '1';

  let unlocked = dev;
  if (!unlocked) {
    try {
      unlocked = localStorage.getItem(DEV_KEY) === 'true';
    } catch (_) {}
  }

  let navMode = 'metaball';
  if (domOverride) {
    navMode = 'dom';
  } else {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const bundle = JSON.parse(raw);
        if (bundle.scene && bundle.scene.navRenderMode === 'dom') navMode = 'dom';
        else if (bundle.scene && bundle.scene.navRenderMode === 'metaball') navMode = 'metaball';
      }
    } catch (_) {}
    if (scene3d) navMode = 'metaball';
  }

  let entered = skipIntro;
  if (!entered) {
    try {
      entered = sessionStorage.getItem(ENTERED_KEY) === '1';
    } catch (_) {}
  }

  const body = document.body;
  if (!body) return;

  if (unlocked) {
    body.classList.add('errl-phone-unlocked');
    body.classList.remove('errl-phone-hidden');
  } else {
    body.classList.add('errl-phone-hidden');
    body.classList.remove('errl-phone-unlocked');
  }

  body.classList.remove('errl-nav-mode-dom', 'errl-nav-mode-metaball', 'errl-scene-3d-nav');
  if (navMode === 'metaball') {
    body.classList.add('errl-nav-mode-metaball', 'errl-scene-3d-nav');
    try {
      const style = document.createElement('style');
      style.id = 'errl-boot-hide-legacy-nav';
      style.textContent =
        '#navOrbit,#navOrbitBehind,.nav-orbit .bubble{visibility:hidden!important;opacity:0!important;pointer-events:none!important}';
      document.head.appendChild(style);
    } catch (_) {}
  } else {
    body.classList.add('errl-nav-mode-dom');
  }

  body.classList.remove('errl-scene-arrival', 'errl-scene-entering', 'errl-scene-main');
  body.classList.add(entered ? 'errl-scene-main' : 'errl-scene-arrival');

  body.classList.add('errl-boot-ready');

  try {
    if (sessionStorage.getItem('errl_warp_handoff') === '1') {
      sessionStorage.removeItem('errl_warp_handoff');
      body.classList.add('errl-warp-landing-arrival');
      const boost = () => {
        try {
          window.errlBgParticlesBoost?.({ amount: 1.1, durationMs: 1400 });
        } catch (_) {}
      };
      if (typeof window.errlBgParticlesBoost === 'function') boost();
      else window.addEventListener('load', boost, { once: true });
    }
  } catch (_) {}

  window.__errlBootShell = {
    dev: dev,
    scene3d: scene3d,
    domOverride: domOverride,
    skipIntro: skipIntro,
    unlocked: unlocked,
    navMode: navMode,
    entered: entered,
  };
})();
