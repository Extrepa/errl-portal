import {
  DEFAULT_SCENE_SETTINGS,
  normalizeSceneSettings,
  type NavRenderMode,
  type SceneMetaballSettings,
  type SceneSculptureSettings,
  type SceneSettings,
} from '../sceneTypes';

export const SCENE_CONTROLS_EVENT = 'errl:scene-controls-changed';
const SETTINGS_KEY = 'errl_portal_settings_v1';

type Listener = (settings: SceneSettings) => void;
const listeners = new Set<Listener>();

let cached: SceneSettings = { ...DEFAULT_SCENE_SETTINGS, metaball: { ...DEFAULT_SCENE_SETTINGS.metaball }, sculpture: { ...DEFAULT_SCENE_SETTINGS.sculpture } };

function readFromStorage(): SceneSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return normalizeSceneSettings(null);
    const bundle = JSON.parse(raw) as { scene?: unknown };
    return normalizeSceneSettings(bundle.scene);
  } catch (_) {
    return normalizeSceneSettings(null);
  }
}

function writeToStorage(settings: SceneSettings) {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const bundle = raw ? JSON.parse(raw) : { version: 1, ui: {} };
    bundle.scene = settings;
    bundle.version = 1;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(bundle));
  } catch (_) {}
}

function emit(settings: SceneSettings) {
  cached = settings;
  try {
    window.dispatchEvent(new CustomEvent(SCENE_CONTROLS_EVENT, { detail: { settings } }));
  } catch (_) {}
  listeners.forEach((fn) => fn(settings));
}

function patch(partial: Partial<SceneSettings>) {
  const next = normalizeSceneSettings({
    ...cached,
    ...partial,
    metaball: { ...cached.metaball, ...(partial.metaball || {}) },
    sculpture: { ...cached.sculpture, ...(partial.sculpture || {}) },
  });
  writeToStorage(next);
  emit(next);
  return next;
}

export function initSceneControls() {
  cached = readFromStorage();
  emit(cached);
}

export function getSceneSettings(): SceneSettings {
  return cached;
}

export function getNavRenderMode(): NavRenderMode {
  try {
    if (new URLSearchParams(window.location.search).get('scene3d') === '1') return 'metaball';
  } catch (_) {}
  return cached.navRenderMode;
}

export function getMetaball(): SceneMetaballSettings {
  return { ...cached.metaball };
}

export function getSculpture(): SceneSculptureSettings {
  return { ...cached.sculpture };
}

export function setMetaball(partial: Partial<SceneMetaballSettings>) {
  return patch({ metaball: { ...cached.metaball, ...partial } });
}

export function setSculpture(partial: Partial<SceneSculptureSettings>) {
  return patch({ sculpture: { ...cached.sculpture, ...partial } });
}

export function patchSceneSettings(partial: Partial<SceneSettings>) {
  return patch(partial);
}

/** Shareable query fragment for scene mode (e.g. copy link with ?scene3d=1&scenePreset=metaball). */
export function buildSceneQuery(settings?: SceneSettings): string {
  const s = settings ?? cached;
  const q = new URLSearchParams();
  if (s.navRenderMode === 'metaball') q.set('scene3d', '1');
  if (s.preset) q.set('scenePreset', s.preset);
  return q.toString();
}

export function subscribeSceneControls(fn: Listener) {
  listeners.add(fn);
  fn(cached);
  return () => listeners.delete(fn);
}

export function buildSceneControlsApi() {
  return {
    getSceneSettings,
    getNavRenderMode,
    getMetaball,
    getSculpture,
    setMetaball,
    setSculpture,
    patchSceneSettings,
    buildSceneQuery,
    subscribe: subscribeSceneControls,
  };
}

declare global {
  interface Window {
    errlSceneControls?: ReturnType<typeof buildSceneControlsApi>;
  }
}

export function mountSceneControlsGlobal() {
  if (typeof window === 'undefined') return;
  initSceneControls();
  window.errlSceneControls = buildSceneControlsApi();
}
