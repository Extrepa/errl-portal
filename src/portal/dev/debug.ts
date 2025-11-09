/* Debug harness: runtime layer toggles + logging
   Load early from index.html. Safe to include in dev builds; no side effects unless toggles are used. */

(() => {
  type State = {
    overlay?: boolean;
    orbs?: boolean;
    riseBubbles?: boolean;
    vignette?: boolean;
    resolution?: number | null;
  };

  const LS_KEY = 'errl_debug_state_v1';
  function load(): State { try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}') as State; } catch { return {}; } }
  function save(s: State) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} }

  const state = load();
  function getGL(){ return (window as any).__ErrlWebGL || {}; }

  function setDisplay(sel: string, show: boolean) {
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return false;
    el.style.display = show ? '' : 'none';
    return true;
  }

  function ensureGL() { (window as any).enableErrlGL && (window as any).enableErrlGL(); }

  function setOverlay(on?: boolean) {
    if (on == null) on = !(state.overlay ?? true);
    state.overlay = on;
    // Prefer toggling the GL overlay sprite visibility to avoid extra composite surfaces
    const refs = getGL();
    if (refs && refs.overlay) { refs.overlay.visible = !!on; }
    // Also set alpha for good measure if setter exists
    const g = (window as any).errlGLSetOverlay;
    if (g) { g({ alpha: on ? 0.20 : 0.0 }); }
    save(state);
  }

  function setOrbs(on?: boolean) {
    if (on == null) on = !(state.orbs ?? true);
    state.orbs = on;
    const fn = (window as any).errlGLShowOrbs;
    if (fn) fn(!!on); else ensureGL();
    save(state);
  }

  function setRise(on?: boolean) {
    if (on == null) on = !(state.riseBubbles ?? true);
    state.riseBubbles = on;
    setDisplay('#riseBubbles', !!on);
    save(state);
  }

  function setVignette(on?: boolean) {
    if (on == null) on = !(state.vignette ?? true);
    state.vignette = on;
    setDisplay('.vignette-frame', !!on);
    save(state);
  }

  function setResolution(v?: number) {
    const val = v == null ? null : Math.max(0.5, Math.min(2, Number(v)));
    state.resolution = val as any;
    // Persist for WebGL init to read (webgl.js can check window.__ERRL_RES_OVERRIDE)
    (window as any).__ERRL_RES_OVERRIDE = val;
    save(state);
    // Best-effort live apply if renderer exists
    try {
      const app = (window as any).__ErrlPIXIApp; // optional future hook
      if (app && app.renderer && val) { app.renderer.resolution = val; app.renderer.resize(innerWidth, innerHeight); }
    } catch {}
  }

  function canvases() {
    const list = [...document.querySelectorAll('canvas')].map(c => ({
      id: (c as HTMLCanvasElement).id,
      z: getComputedStyle(c).zIndex,
      pe: getComputedStyle(c).pointerEvents,
      w: (c as HTMLCanvasElement).width,
      h: (c as HTMLCanvasElement).height,
      css: `${(c as HTMLCanvasElement).clientWidth}x${(c as HTMLCanvasElement).clientHeight}`
    }));
    console.table(list);
    return list;
  }

  // Expose API
  (window as any).ERRL = Object.freeze({
    toggle: {
      overlay: (b?: boolean) => { ensureGL(); setOverlay(b); },
      overlayNode: (b?: boolean) => { const r=getGL(); if (r && r.overlay) r.overlay.visible = (b==null ? !r.overlay.visible : !!b); },
      overlayFilter: (b?: boolean) => { const r=getGL(); if(r && r.overlay){ if(b==null) b = !(r.overlay.filters && r.overlay.filters.length); r.overlay.filters = b ? [r.overlayFilter||r.overlay.filters?.[0]].filter(Boolean) : []; } },
      fxFilter: (b?: boolean) => { const r=getGL(); if(r && r.fxRoot){ if(b==null) b = !(r.fxRoot.filters && r.fxRoot.filters.length); r.fxRoot.filters = b ? [r.moodFilter||r.fxRoot.filters?.[0]].filter(Boolean) : []; } },
      orbs: (b?: boolean) => { ensureGL(); setOrbs(b); },
      riseBubbles: (b?: boolean) => setRise(b),
      vignette: (b?: boolean) => setVignette(b),
    },
    set: {
      resolution: (v: number) => setResolution(v),
    },
    log: {
      canvases,
    },
    state,
  });

  // Apply persisted toggles on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    if (state.vignette === false) setVignette(false);
    if (state.riseBubbles === false) setRise(false);
    if (state.orbs === false) { ensureGL(); setOrbs(false); }
    if (state.overlay === false) { ensureGL(); setOverlay(false); }
    if (state.resolution != null) setResolution(state.resolution as any);
  });
})();
