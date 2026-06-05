import { mountSceneControlsGlobal } from './sceneControls';
import { applyScenePreset, type ScenePresetId } from './scene-presets';

const VALID_PRESETS = new Set<ScenePresetId>(['portal', 'metaball', 'atmospheric']);

export function hydrateScenePresetFromUrl(): void {
  try {
    const id = new URLSearchParams(window.location.search).get('scenePreset') as ScenePresetId | null;
    if (!id || !VALID_PRESETS.has(id)) return;
    applyScenePreset(id);
  } catch (_) {}
}

mountSceneControlsGlobal();
hydrateScenePresetFromUrl();
