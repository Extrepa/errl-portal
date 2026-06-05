import type { SceneSettings } from '../sceneTypes';
import { DEFAULT_SCENE_SETTINGS } from '../sceneTypes';
import { patchSceneSettings } from './sceneControls';

export type ScenePresetId = 'portal' | 'metaball' | 'atmospheric';

export type ScenePresetDef = {
  id: ScenePresetId;
  label: string;
  blurb: string;
  scene: Partial<SceneSettings>;
  controls?: Record<string, string | boolean | number>;
};

export const SCENE_PRESETS: Record<ScenePresetId, ScenePresetDef> = {
  portal: {
    id: 'portal',
    label: 'Portal',
    blurb: 'Classic DOM nav, ambient bubbles, calm defaults.',
    scene: {
      preset: 'portal',
      navRenderMode: 'dom',
      metaball: {
        steps: 48,
        bloomIntensity: 0.35,
        bloomThreshold: 0.6,
        vignetteDarkness: 0.65,
        glow: 0.9,
        mergeK: 0.32,
        pointerPull: 0.12,
      },
      sculpture: { magneticRadius: 0.32, separation: 0.44, floatSpeed: 0.9, scrollInfluence: 1 },
    },
    controls: {
      rbInteractionMode: 'ambient',
      rbWobble: '0.45',
      rbAlpha: '0.62',
      navOrbitSpeed: '0.72',
      navRadius: '1.1',
      hueEnabled: false,
      shimmerToggle: false,
      vignetteToggle: true,
    },
  },
  metaball: {
    id: 'metaball',
    label: 'Metaball',
    blurb: 'SDF nav sculptures, stronger merge and bloom.',
    scene: {
      preset: 'metaball',
      navRenderMode: 'metaball',
      metaball: {
        steps: 56,
        bloomIntensity: 0.52,
        bloomThreshold: 0.55,
        vignetteDarkness: 0.75,
        glow: 1.25,
        mergeK: 0.42,
        pointerPull: 0.2,
      },
      sculpture: { magneticRadius: 0.38, separation: 0.38, floatSpeed: 1.15, scrollInfluence: 1 },
    },
    controls: {
      rbInteractionMode: 'ambient',
      rbWobble: '0.35',
      rbAlpha: '0.58',
      hueEnabled: false,
      glOrbsToggle: false,
    },
  },
  atmospheric: {
    id: 'atmospheric',
    label: 'Atmospheric',
    blurb: 'Slow drift, darker frame, soft metaball tuning for DOM nav.',
    scene: {
      preset: 'atmospheric',
      navRenderMode: 'dom',
      metaball: {
        steps: 40,
        bloomIntensity: 0.28,
        bloomThreshold: 0.65,
        vignetteDarkness: 0.82,
        glow: 0.65,
        mergeK: 0.28,
        pointerPull: 0.08,
      },
      sculpture: { magneticRadius: 0.28, separation: 0.46, floatSpeed: 0.55, scrollInfluence: 0.85 },
    },
    controls: {
      rbInteractionMode: 'ambient',
      rbWobble: '0.28',
      rbFreq: '0.42',
      rbAlpha: '0.52',
      navOrbitSpeed: '0.55',
      navRadius: '1.05',
      hueEnabled: false,
      shimmerToggle: false,
      vignetteToggle: true,
      glOverlayAlpha: '0.18',
    },
  },
};

function setControlValue(id: string, value: string | boolean | number) {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el) return;
  if (el.type === 'checkbox') {
    el.checked = !!value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    el.value = String(value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

export function applyScenePreset(id: ScenePresetId): { needsReload: boolean } {
  const def = SCENE_PRESETS[id];
  if (!def) return { needsReload: false };

  const currentMode =
    typeof window !== 'undefined' && window.errlSceneControls
      ? window.errlSceneControls.getNavRenderMode()
      : 'dom';
  const targetMode = def.scene.navRenderMode ?? 'dom';
  const needsReload = currentMode !== targetMode;

  patchSceneSettings({
    ...def.scene,
    metaball: { ...DEFAULT_SCENE_SETTINGS.metaball, ...def.scene.metaball },
    sculpture: { ...DEFAULT_SCENE_SETTINGS.sculpture, ...def.scene.sculpture },
  });

  if (def.controls) {
    Object.entries(def.controls).forEach(([key, val]) => setControlValue(key, val));
  }

  return { needsReload };
}
