/**
 * Errl Phone Scene tab — metaball + sculpture settings via window.errlSceneControls.
 */
import { mountSceneControlsGlobal, SCENE_CONTROLS_EVENT } from '../scene/bridge/sceneControls';
import { applyScenePreset, SCENE_PRESETS, type ScenePresetId } from '../scene/bridge/scene-presets';
import { getNavRenderMode, setNavRenderMode } from '../scene/navRenderMode';
import type { SceneMetaballSettings, SceneSculptureSettings } from '../scene/sceneTypes';

const SCENE_PRESET_KEY = 'errl_scene_last_preset_v1';

function bindRange(
  id: string,
  apply: (value: number) => void,
  parse: (raw: string) => number = Number,
) {
  const el = document.getElementById(id) as HTMLInputElement | null;
  if (!el || el.dataset.sceneBound === '1') return;
  el.dataset.sceneBound = '1';
  el.addEventListener('input', () => apply(parse(el.value)));
}

function bindNavMode() {
  const domBtn = document.getElementById('sceneNavModeDom');
  const metaBtn = document.getElementById('sceneNavModeMetaball');
  if (!domBtn || !metaBtn) return;

  const syncActive = () => {
    const mode = getNavRenderMode();
    domBtn.classList.toggle('active', mode === 'dom');
    metaBtn.classList.toggle('active', mode === 'metaball');
    domBtn.setAttribute('aria-pressed', mode === 'dom' ? 'true' : 'false');
    metaBtn.setAttribute('aria-pressed', mode === 'metaball' ? 'true' : 'false');
  };

  if (domBtn.dataset.sceneBound !== '1') {
    domBtn.dataset.sceneBound = '1';
    domBtn.addEventListener('click', () => setNavRenderMode('dom'));
  }
  if (metaBtn.dataset.sceneBound !== '1') {
    metaBtn.dataset.sceneBound = '1';
    metaBtn.addEventListener('click', () => setNavRenderMode('metaball'));
  }
  syncActive();
  window.addEventListener(SCENE_CONTROLS_EVENT, syncActive);
}

function hydrateFromBus() {
  const api = window.errlSceneControls;
  if (!api) return;
  const s = api.getSceneSettings();
  const setVal = (id: string, v: number) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = String(v);
  };
  const mb = s.metaball;
  const sc = s.sculpture;
  setVal('sceneMetaballGlow', mb.glow);
  setVal('sceneMetaballMergeK', mb.mergeK);
  setVal('sceneMetaballPointerPull', mb.pointerPull);
  setVal('sceneMetaballSteps', mb.steps);
  setVal('sceneMetaballBloom', mb.bloomIntensity);
  setVal('sceneSculptureSeparation', sc.separation);
  setVal('sceneSculptureMagnetic', sc.magneticRadius);
  setVal('sceneSculptureFloat', sc.floatSpeed);
  setVal('sceneSculptureScroll', sc.scrollInfluence ?? 1);
}

function bindMetaballControls() {
  const api = window.errlSceneControls;
  if (!api) return;

  const patch = (partial: Partial<SceneMetaballSettings>) => api.setMetaball(partial);

  bindRange('sceneMetaballGlow', (v) => patch({ glow: v }));
  bindRange('sceneMetaballMergeK', (v) => patch({ mergeK: v }));
  bindRange('sceneMetaballPointerPull', (v) => patch({ pointerPull: v }));
  bindRange('sceneMetaballSteps', (v) => patch({ steps: Math.round(v) }));
  bindRange('sceneMetaballBloom', (v) => patch({ bloomIntensity: v }));
}

function bindSculptureControls() {
  const api = window.errlSceneControls;
  if (!api) return;

  const patch = (partial: Partial<SceneSculptureSettings>) => api.setSculpture(partial);

  bindRange('sceneSculptureSeparation', (v) => patch({ separation: v }));
  bindRange('sceneSculptureMagnetic', (v) => patch({ magneticRadius: v }));
  bindRange('sceneSculptureFloat', (v) => patch({ floatSpeed: v }));
  bindRange('sceneSculptureScroll', (v) => patch({ scrollInfluence: v }));
}

function bindOpenLab() {
  const btn = document.getElementById('sceneOpenMetaballLab');
  if (!btn || btn.dataset.sceneBound === '1') return;
  btn.dataset.sceneBound = '1';
  btn.addEventListener('click', () => {
    window.location.href = '/fx/metaball-lab/';
  });
}

function setPresetStatus(text: string) {
  const el = document.getElementById('scenePresetStatus');
  if (el) el.textContent = text;
}

function bindScenePresets() {
  const ids: ScenePresetId[] = ['portal', 'metaball', 'atmospheric'];
  ids.forEach((id) => {
    const btn = document.getElementById(`scenePreset${id[0].toUpperCase()}${id.slice(1)}`);
    if (!btn || btn.dataset.sceneBound === '1') return;
    btn.dataset.sceneBound = '1';
    btn.addEventListener('click', () => {
      const def = SCENE_PRESETS[id];
      const msg = `Apply “${def.label}”? Updates scene, Rising Bubbles, and background controls. The panel footer Back button can undo.`;
      if (!window.confirm(msg)) return;

      const { needsReload } = applyScenePreset(id);
      try {
        localStorage.setItem(SCENE_PRESET_KEY, id);
      } catch (_) {}

      document.querySelectorAll('[data-scene-preset]').forEach((node) => {
        node.classList.toggle('active', node.getAttribute('data-scene-preset') === id);
      });
      setPresetStatus(`Applied: ${def.label}. ${def.blurb}`);

      if (needsReload) {
        setNavRenderMode(def.scene.navRenderMode === 'metaball' ? 'metaball' : 'dom');
        return;
      }
      hydrateFromBus();
    });
  });

  try {
    const last = localStorage.getItem(SCENE_PRESET_KEY) as ScenePresetId | null;
    if (last && SCENE_PRESETS[last]) {
      document.querySelectorAll('[data-scene-preset]').forEach((node) => {
        node.classList.toggle('active', node.getAttribute('data-scene-preset') === last);
      });
      setPresetStatus(`Last: ${SCENE_PRESETS[last].label} (tap to re-apply).`);
    }
  } catch (_) {}
}

function bindCopySceneLink() {
  const btn = document.getElementById('sceneCopyLink');
  if (!btn || btn.dataset.sceneBound === '1') return;
  btn.dataset.sceneBound = '1';
  btn.addEventListener('click', async () => {
    const api = window.errlSceneControls;
    if (!api) return;
    const qs = api.buildSceneQuery();
    const url = `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ''}`;
    try {
      await navigator.clipboard.writeText(url);
      setPresetStatus('Scene link copied to clipboard.');
    } catch (_) {
      setPresetStatus('Copy failed — select and copy the address bar manually.');
    }
  });
}

function init() {
  mountSceneControlsGlobal();
  bindNavMode();
  bindMetaballControls();
  bindSculptureControls();
  bindScenePresets();
  bindOpenLab();
  bindCopySceneLink();
  hydrateFromBus();
  window.addEventListener(SCENE_CONTROLS_EVENT, hydrateFromBus);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
