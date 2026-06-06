import {
  getNavRenderMode as getModeFromBus,
  getSceneSettings as getSettingsFromBus,
  mountSceneControlsGlobal,
  patchSceneSettings,
  SCENE_CONTROLS_EVENT,
} from './bridge/sceneControls';
import type { NavRenderMode, SceneSettings } from './sceneTypes';

export const NAV_RENDER_MODE_EVENT = SCENE_CONTROLS_EVENT;

export function ensureSceneControlsInit() {
  if (typeof window !== 'undefined' && !window.errlSceneControls) {
    mountSceneControlsGlobal();
  }
}

export function getNavRenderMode(): NavRenderMode {
  ensureSceneControlsInit();
  return getModeFromBus();
}

export function isMetaballNavActive(): boolean {
  return getNavRenderMode() === 'metaball';
}

export function applyNavRenderModeToDocument(mode?: NavRenderMode) {
  if (typeof document === 'undefined') return;
  const m = mode ?? getNavRenderMode();
  const body = document.body;
  body.classList.remove('errl-nav-mode-dom', 'errl-nav-mode-metaball', 'errl-scene-3d-nav');
  if (m === 'metaball') {
    body.classList.add('errl-nav-mode-metaball', 'errl-scene-3d-nav');
    try {
      const w = window as Window & { enableErrlGL?: () => void; errlGLShowOrbs?: (show: boolean) => void };
      w.enableErrlGL?.();
      const hideOrbs = () => w.errlGLShowOrbs?.(false);
      hideOrbs();
      window.addEventListener('errl:webgl-ready', hideOrbs, { once: true });
    } catch (_) {}
  } else {
    body.classList.add('errl-nav-mode-dom');
    try {
      const toggle = document.getElementById('glOrbsToggle') as HTMLInputElement | null;
      const w = window as Window & { errlGLShowOrbs?: (show: boolean) => void };
      w.errlGLShowOrbs?.(toggle ? toggle.checked : true);
    } catch (_) {}
  }
  try {
    window.dispatchEvent(new CustomEvent(NAV_RENDER_MODE_EVENT, { detail: { mode: m, settings: getSceneSettings() } }));
  } catch (_) {}
}

export function setNavRenderMode(mode: NavRenderMode, options?: { reload?: boolean }) {
  ensureSceneControlsInit();
  patchSceneSettings({ navRenderMode: mode });
  if (mode === 'metaball') {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('scene3d', '1');
      if (options?.reload !== false) {
        window.location.assign(url.toString());
        return;
      }
      window.history.replaceState(null, '', url.toString());
    } catch (_) {}
  } else {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('scene3d');
      if (options?.reload !== false) {
        window.location.assign(url.toString());
        return;
      }
      window.history.replaceState(null, '', url.toString());
    } catch (_) {}
  }
  applyNavRenderModeToDocument(mode);
}

export function getSceneSettings(): SceneSettings {
  ensureSceneControlsInit();
  return getSettingsFromBus();
}
