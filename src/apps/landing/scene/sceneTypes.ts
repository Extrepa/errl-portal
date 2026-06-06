export type NavRenderMode = 'dom' | 'metaball';

export type SceneMetaballSettings = {
  steps: number;
  bloomIntensity: number;
  bloomThreshold: number;
  vignetteDarkness: number;
  glow: number;
  mergeK: number;
  pointerPull: number;
};

export type SceneSculptureSettings = {
  magneticRadius: number;
  separation: number;
  floatSpeed: number;
  /** How much wheel / scroll shifts the nav orbit (0 = off). */
  scrollInfluence: number;
};

export type SceneSettings = {
  navRenderMode: NavRenderMode;
  metaball: SceneMetaballSettings;
  sculpture: SceneSculptureSettings;
  preset?: string;
};

export const DEFAULT_SCENE_SETTINGS: SceneSettings = {
  navRenderMode: 'metaball',
  metaball: {
    steps: 48,
    bloomIntensity: 0.4,
    bloomThreshold: 0.6,
    vignetteDarkness: 0.7,
    glow: 1,
    mergeK: 0.35,
    pointerPull: 0.15,
  },
  sculpture: {
    magneticRadius: 0.35,
    separation: 0.42,
    floatSpeed: 1,
    scrollInfluence: 1,
  },
};

export function normalizeSceneSettings(raw: unknown): SceneSettings {
  const base = { ...DEFAULT_SCENE_SETTINGS, metaball: { ...DEFAULT_SCENE_SETTINGS.metaball }, sculpture: { ...DEFAULT_SCENE_SETTINGS.sculpture } };
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<SceneSettings>;
  if (s.navRenderMode === 'metaball' || s.navRenderMode === 'dom') base.navRenderMode = s.navRenderMode;
  if (s.metaball && typeof s.metaball === 'object') {
    Object.assign(base.metaball, s.metaball);
  }
  if (s.sculpture && typeof s.sculpture === 'object') {
    Object.assign(base.sculpture, s.sculpture);
  }
  if (typeof s.preset === 'string') base.preset = s.preset;
  return base;
}
