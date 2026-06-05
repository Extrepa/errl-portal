/**
 * Syncs Errl Phone Nav tab with nav render mode (dom vs metaball).
 */
import {
  applyNavRenderModeToDocument,
  getNavRenderMode,
  NAV_RENDER_MODE_EVENT,
} from '../scene/navRenderMode';
import type { NavRenderMode } from '../scene/sceneTypes';

function setControlsDisabled(root: HTMLElement | null, disabled: boolean) {
  if (!root) return;
  root.querySelectorAll('input, select, button').forEach((el) => {
    const node = el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement;
    if (node.id === 'navMetaballOpenLab') return;
    node.disabled = disabled;
  });
  root.style.opacity = disabled ? '0.45' : '';
  root.style.pointerEvents = disabled ? 'none' : '';
}

function updateNavTabUi(mode: NavRenderMode) {
  const dom = document.getElementById('navDomControls');
  const notice = document.getElementById('navMetaballNotice');
  const isMetaball = mode === 'metaball';
  setControlsDisabled(dom, isMetaball);
  if (notice) notice.hidden = !isMetaball;
}

function bindOpenLab() {
  const btn = document.getElementById('navMetaballOpenLab');
  if (!btn || btn.dataset.bound === '1') return;
  btn.dataset.bound = '1';
  btn.addEventListener('click', () => {
    window.location.href = '/fx/metaball-lab/';
  });
}

function init() {
  applyNavRenderModeToDocument();
  updateNavTabUi(getNavRenderMode());
  bindOpenLab();
  window.addEventListener(NAV_RENDER_MODE_EVENT, (ev) => {
    const detail = (ev as CustomEvent<{ mode?: NavRenderMode }>).detail;
    updateNavTabUi(detail?.mode ?? getNavRenderMode());
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
