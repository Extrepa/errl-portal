import type { ScenePhase } from '../App';

export function setBodyScenePhase(phase: ScenePhase) {
  const body = document.body;
  body.classList.remove('errl-scene-arrival', 'errl-scene-entering', 'errl-scene-main');
  if (phase === 'arrival') body.classList.add('errl-scene-arrival');
  else if (phase === 'entering') body.classList.add('errl-scene-entering');
  else body.classList.add('errl-scene-main');
}

export function dispatchSceneReady() {
  try {
    window.dispatchEvent(new CustomEvent('errl:scene-ready'));
  } catch (_) {}
}

export function dispatchEnterRequested() {
  try {
    window.dispatchEvent(new CustomEvent('errl:enter-requested'));
  } catch (_) {}
}

export function setRbAmbientMode() {
  const rb = (window as Window & { errlRisingBubblesThree?: { setInteractionMode?: (m: string) => void } })
    .errlRisingBubblesThree;
  if (rb && typeof rb.setInteractionMode === 'function') {
    rb.setInteractionMode('ambient');
  }
  const sel = document.getElementById('rbInteractionMode') as HTMLSelectElement | null;
  if (sel) sel.value = 'ambient';
}

export function pointerRippleAt(clientX: number, clientY: number) {
  const fn = (window as Window & { errlGLSetOverlay?: (o: { active?: boolean; dx?: number; dy?: number }) => void })
    .errlGLSetOverlay;
  if (typeof fn !== 'function') return;
  const w = window.innerWidth || 1;
  const h = window.innerHeight || 1;
  fn({
    active: true,
    dx: (clientX / w - 0.5) * 0.08,
    dy: (clientY / h - 0.5) * 0.08,
  });
}
