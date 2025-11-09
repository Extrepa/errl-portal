import {
  applySnapshot,
  getControl,
  getControls,
  registerControl,
  snapshotControls,
  subscribeToControls,
  type DevControl,
  type DevPanelSnapshot,
} from './registry';

type WindowWithEffects = Window &
  typeof globalThis & {
    ErrlHueController?: any;
    enableErrlGL?: () => void;
    errlGLSetGoo?: (params: Record<string, number>) => void;
  };

const STORAGE_KEY = 'errl_devpanel_snapshot';
const AUTO_KEY = 'errl_devpanel_auto';
let root: HTMLElement | null = null;
let builtInsRegistered = false;
let snapshotPending: DevPanelSnapshot | null = null;
let syncInterval: number | null = null;
let safetyKeyHandler: ((event: KeyboardEvent) => void) | null = null;

const controlInputs = new Map<string, HTMLInputElement>();
const controlValueLabels = new Map<string, HTMLElement>();

export function mountDevPanel() {
  if (root) return;
  ensureStyles();
  root = buildShell();
  document.body.appendChild(root);
  installSafetyFeatures(root);
  hookGlobalActions(root);
  hookAutoToggle(root);
  listenToControls(root);
  registerBuiltInControls();
  scheduleSnapshotRestore();
}

function ensureStyles() {
  if (document.getElementById('errl-devpanel-styles')) return;
  const style = document.createElement('style');
  style.id = 'errl-devpanel-styles';
  style.textContent = `
    .errl-devpanel {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 4000;
      width: min(320px, calc(100vw - 32px));
      border-radius: 16px;
      background: rgba(5, 8, 18, 0.92);
      color: #f2f5ff;
      box-shadow: 0 20px 45px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08);
      font: 500 13px/1.4 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      backdrop-filter: blur(18px);
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .errl-devpanel_head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      gap: 8px;
    }
    .errl-devpanel_head h2 {
      margin: 0;
      font-size: 14px;
      letter-spacing: 0.02em;
    }
    .errl-devpanel_actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .errl-devpanel_actions button,
    .errl-devpanel_actions label {
      font: inherit;
    }
    .errl-devpanel button {
      border: 1px solid rgba(255,255,255,0.16);
      background: rgba(255,255,255,0.08);
      color: inherit;
      border-radius: 8px;
      padding: 4px 10px;
      cursor: pointer;
      transition: background 120ms ease, border 120ms ease;
    }
    .errl-devpanel button:hover {
      background: rgba(255,255,255,0.16);
      border-color: rgba(255,255,255,0.3);
    }
    .errl-devpanel_body {
      max-height: 70vh;
      overflow-y: auto;
      padding: 12px 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .errl-devpanel_section {
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.01);
    }
    .errl-devpanel_section h3 {
      margin: 0 0 8px;
      font-size: 13px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.65);
    }
    .errl-devpanel_control {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 10px;
    }
    .errl-devpanel_control label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: rgba(255,255,255,0.72);
    }
    .errl-devpanel_value {
      font-size: 11px;
      color: rgba(255,255,255,0.8);
      margin-left: 8px;
    }
    .errl-devpanel_control input[type="range"] {
      width: 100%;
      accent-color: #6cf0ff;
    }
    .errl-devpanel_empty {
      text-align: center;
      opacity: 0.55;
      font-size: 12px;
      padding: 24px 0;
    }
    .errl-devpanel.is-hidden {
      display: none !important;
    }
    .errl-devpanel.is-clickthrough {
      pointer-events: none !important;
      opacity: 0.6;
      transition: opacity 160ms ease;
    }
    .errl-devpanel.is-clickthrough * {
      pointer-events: none !important;
    }
  `;
  document.head.appendChild(style);
}

function installSafetyFeatures(container: HTMLElement) {
  container.classList.remove('is-hidden', 'is-clickthrough');
  if (safetyKeyHandler) {
    window.removeEventListener('keydown', safetyKeyHandler);
  }
  safetyKeyHandler = (event: KeyboardEvent) => {
    if (!event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.code === 'KeyD') {
      const hidden = container.classList.toggle('is-hidden');
      try {
        console.info(`[devpanel] panel ${hidden ? 'hidden' : 'shown'} (Alt+D)`);
      } catch (_) {}
      event.preventDefault();
      return;
    }
    if (event.code === 'KeyP') {
      const clickthrough = container.classList.toggle('is-clickthrough');
      try {
        console.info(`[devpanel] panel ${clickthrough ? 'set to click-through' : 'interactive'} (Alt+P)`);
      } catch (_) {}
      event.preventDefault();
    }
  };
  window.addEventListener('keydown', safetyKeyHandler, { passive: false });
}

function buildShell() {
  const wrapper = document.createElement('div');
  wrapper.className = 'errl-devpanel';
  wrapper.innerHTML = `
    <div class="errl-devpanel_head">
      <h2>Errl Dev Controls</h2>
      <div class="errl-devpanel_actions">
        <label class="auto-toggle"><input type="checkbox" id="devpanelAuto" /> Auto-open</label>
        <button type="button" id="devpanelSave">Save</button>
        <button type="button" id="devpanelExport">Export</button>
        <button type="button" id="devpanelClose" title="Hide dev panel">Close</button>
      </div>
    </div>
    <div class="errl-devpanel_body" id="devpanelBody">
      <p class="errl-devpanel_empty">Waiting for controls…</p>
    </div>
  `;
  return wrapper;
}

function hookGlobalActions(container: HTMLElement) {
  const saveBtn = container.querySelector<HTMLButtonElement>('#devpanelSave');
  const exportBtn = container.querySelector<HTMLButtonElement>('#devpanelExport');
  const closeBtn = container.querySelector<HTMLButtonElement>('#devpanelClose');

  saveBtn?.addEventListener('click', () => {
    const snapshot = snapshotControls();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      flashMessage(container, 'Preset saved locally');
    } catch (error) {
      console.error('[devpanel] Failed to save snapshot', error);
      flashMessage(container, 'Failed to save preset');
    }
  });

  exportBtn?.addEventListener('click', () => {
    const snapshot = snapshotControls();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'errl-devpanel-preset.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 500);
  });

  closeBtn?.addEventListener('click', () => {
    destroyDevPanel();
  });
}

function hookAutoToggle(container: HTMLElement) {
  const checkbox = container.querySelector<HTMLInputElement>('#devpanelAuto');
  if (!checkbox) return;
  checkbox.checked = localStorage.getItem(AUTO_KEY) === '1';
  checkbox.addEventListener('change', () => {
    try {
      if (checkbox.checked) {
        localStorage.setItem(AUTO_KEY, '1');
      } else {
        localStorage.removeItem(AUTO_KEY);
      }
    } catch (error) {
      console.warn('[devpanel] Failed to persist auto setting', error);
    }
  });
}

function flashMessage(container: HTMLElement, message: string) {
  const banner = document.createElement('div');
  banner.textContent = message;
  banner.style.position = 'absolute';
  banner.style.top = '8px';
  banner.style.left = '50%';
  banner.style.transform = 'translateX(-50%)';
  banner.style.padding = '6px 12px';
  banner.style.borderRadius = '999px';
  banner.style.background = 'rgba(15,225,255,0.15)';
  banner.style.border = '1px solid rgba(15,225,255,0.45)';
  banner.style.fontSize = '12px';
  banner.style.pointerEvents = 'none';
  container.appendChild(banner);
  setTimeout(() => banner.remove(), 1600);
}

function listenToControls(container: HTMLElement) {
  const body = container.querySelector<HTMLElement>('#devpanelBody');
  if (!body) return;

  subscribeToControls((controlsList) => {
    renderControls(body, controlsList);
  });

  if (syncInterval) window.clearInterval(syncInterval);
  syncInterval = window.setInterval(() => {
    controlInputs.forEach((input, id) => {
      const control = getControl(id);
      if (!control) return;
      const raw = control.getValue();
      if (typeof raw === 'number') {
        const rounded = Number(raw.toFixed(4));
        if (Math.abs(Number(input.value) - rounded) > 0.0001) {
          input.value = String(rounded);
        }
        const label = controlValueLabels.get(id);
        if (label) label.textContent = formatValue(control, raw);
      }
    });
  }, 800);
}

function renderControls(target: HTMLElement, controlsList: DevControl[]) {
  controlInputs.clear();
  controlValueLabels.clear();
  target.innerHTML = '';

  if (!controlsList.length) {
    const empty = document.createElement('p');
    empty.className = 'errl-devpanel_empty';
    empty.textContent = 'No controls registered yet.';
    target.appendChild(empty);
    return;
  }

  const groups = groupBy(controlsList, (c) => c.group);
  groups.forEach((groupControls, groupName) => {
    const section = document.createElement('section');
    section.className = 'errl-devpanel_section';
    const title = document.createElement('h3');
    title.textContent = groupName;
    section.appendChild(title);

    groupControls.forEach((control) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'errl-devpanel_control';

      const label = document.createElement('label');
      label.textContent = control.label;
      const valueEl = document.createElement('span');
      valueEl.className = 'errl-devpanel_value';
      valueEl.textContent = formatValue(control, control.getValue());
      label.appendChild(valueEl);
      wrapper.appendChild(label);

      if (control.kind === 'slider') {
        const input = document.createElement('input');
        input.type = 'range';
        if (typeof control.min === 'number') input.min = String(control.min);
        if (typeof control.max === 'number') input.max = String(control.max);
        if (typeof control.step === 'number') input.step = String(control.step);
        const initial = control.getValue();
        if (typeof initial === 'number') input.value = String(initial);
        input.addEventListener('input', () => {
          const value = Number(input.value);
          control.setValue(value);
          valueEl.textContent = formatValue(control, value);
        });
        controlInputs.set(control.id, input);
        controlValueLabels.set(control.id, valueEl);
        wrapper.appendChild(input);
      } else if (control.kind === 'toggle') {
        const toggle = document.createElement('input');
        toggle.type = 'checkbox';
        toggle.checked = Boolean(control.getValue());
        toggle.addEventListener('change', () => {
          control.setValue(toggle.checked);
          valueEl.textContent = formatValue(control, toggle.checked);
        });
        wrapper.appendChild(toggle);
      }

      section.appendChild(wrapper);
    });

    target.appendChild(section);
  });
}

function formatValue(control: DevControl, value: number | boolean) {
  if (control.format) return control.format(value);
  if (typeof value === 'boolean') return value ? 'On' : 'Off';
  if (control.step && control.step >= 1) return `${Math.round(value)}`;
  return value.toFixed(2);
}

function groupBy<T>(items: T[], getter: (item: T) => string) {
  const map = new Map<string, T[]>();
  items.forEach((item) => {
    const key = getter(item) || 'General';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });
  return map;
}

function registerBuiltInControls() {
  if (builtInsRegistered) return;
  builtInsRegistered = true;
  registerHueTimeline();
  registerGooIntensity();
  registerNavOrbitControls();
  registerRisingBubbleControls();
}

function registerHueTimeline(retry = 0) {
  const hue = (window as WindowWithEffects).ErrlHueController;
  if (!hue) {
    if (retry > 20) return;
    setTimeout(() => registerHueTimeline(retry + 1), 200);
    return;
  }
  const id = 'hue.timeline';
  if (getControl(id)) return;
  let cached = hue.master?.baseHue ?? 0;
  registerControl({
    id,
    label: 'Hue Timeline',
    group: 'Hue',
    kind: 'slider',
    min: 0,
    max: 360,
    step: 1,
    format: (value) => `${Math.round(Number(value) || 0)}°`,
    getValue: () => {
      const raw = (window as WindowWithEffects).ErrlHueController?.master?.baseHue;
      cached = typeof raw === 'number' ? raw : cached;
      return cached;
    },
    setValue: (value) => {
      const normalized = typeof value === 'number' ? ((value % 360) + 360) % 360 : cached;
      cached = normalized;
      (window as WindowWithEffects).ErrlHueController?.setTimeline?.(normalized);
    },
  });
}

function registerGooIntensity(retry = 0) {
  const win = window as WindowWithEffects;
  if (!win.errlGLSetGoo) {
    if (win.enableErrlGL) win.enableErrlGL();
    if (retry > 25) return;
    setTimeout(() => registerGooIntensity(retry + 1), 300);
    return;
  }
  const id = 'webgl.gooIntensity';
  if (getControl(id)) return;
  let cached = 0.7;
  registerControl({
    id,
    label: 'Goo Intensity',
    group: 'WebGL',
    kind: 'slider',
    min: 0,
    max: 1,
    step: 0.01,
    format: (value) => `${(Number(value) || 0).toFixed(2)}`,
    getValue: () => cached,
    setValue: (value) => {
      const numeric = clamp(Number(value), 0, 1);
      cached = numeric;
      if (!win.errlGLSetGoo && win.enableErrlGL) win.enableErrlGL();
      win.errlGLSetGoo?.({ intensity: numeric });
    },
  });
}

type NavControls = {
  getState?: () => { speed?: number; radius?: number; orbScale?: number; gamesVisible?: boolean };
  setSpeed?: (value: number, opts?: Record<string, unknown>) => unknown;
  setRadius?: (value: number, opts?: Record<string, unknown>) => unknown;
  setOrbScale?: (value: number, opts?: Record<string, unknown>) => unknown;
  setGamesVisible?: (value: boolean, opts?: Record<string, unknown>) => unknown;
  toggleGames?: () => unknown;
};

function registerNavOrbitControls(retry = 0) {
  const controls = (window as WindowWithEffects & { errlNavControls?: NavControls }).errlNavControls;
  if (!controls) {
    if (retry > 30) return;
    setTimeout(() => registerNavOrbitControls(retry + 1), 200);
    return;
  }
  const descriptors = [
    {
      id: 'nav.speed',
      label: 'Orbit Speed',
      min: 0,
      max: 2,
      step: 0.01,
      getter: () => controls.getState?.()?.speed ?? 0,
      setter: (value: number) => controls.setSpeed?.(value),
    },
    {
      id: 'nav.radius',
      label: 'Orbit Radius',
      min: 0.6,
      max: 1.6,
      step: 0.01,
      getter: () => controls.getState?.()?.radius ?? 1,
      setter: (value: number) => controls.setRadius?.(value),
    },
    {
      id: 'nav.scale',
      label: 'Bubble Scale',
      min: 0.6,
      max: 1.6,
      step: 0.01,
      getter: () => controls.getState?.()?.orbScale ?? 1,
      setter: (value: number) => controls.setOrbScale?.(value),
    },
  ];

  descriptors.forEach((cfg) => {
    if (getControl(cfg.id)) return;
    registerControl({
      id: cfg.id,
      label: cfg.label,
      group: 'Nav Orbit',
      kind: 'slider',
      min: cfg.min,
      max: cfg.max,
      step: cfg.step,
      getValue: () => cfg.getter(),
      setValue: (value) => cfg.setter(Number(value) || 0),
      format: (value) => `${(Number(value) || 0).toFixed(2)}`,
    });
  });

  const gamesId = 'nav.games';
  if (!getControl(gamesId)) {
    registerControl({
      id: gamesId,
      label: 'Games Bubble',
      group: 'Nav Orbit',
      kind: 'toggle',
      getValue: () => !!controls.getState?.()?.gamesVisible,
      setValue: (value) => controls.setGamesVisible?.(!!value),
    });
  }
}

type RisingBubblesControls = {
  getState?: () => { speed?: number; density?: number; alpha?: number };
  setSpeed?: (value: number, opts?: Record<string, unknown>) => unknown;
  setDensity?: (value: number, opts?: Record<string, unknown>) => unknown;
  setAlpha?: (value: number, opts?: Record<string, unknown>) => unknown;
};

function registerRisingBubbleControls(retry = 0) {
  const controls = (window as WindowWithEffects & { errlRisingBubbles?: RisingBubblesControls }).errlRisingBubbles;
  if (!controls) {
    if (retry > 30) return;
    setTimeout(() => registerRisingBubbleControls(retry + 1), 250);
    return;
  }
  const descriptors = [
    {
      id: 'rb.speed',
      label: 'Rise Speed',
      min: 0,
      max: 3,
      step: 0.01,
      getter: () => controls.getState?.()?.speed ?? 1,
      setter: (value: number) => controls.setSpeed?.(value),
    },
    {
      id: 'rb.density',
      label: 'Density',
      min: 0,
      max: 2,
      step: 0.01,
      getter: () => controls.getState?.()?.density ?? 1,
      setter: (value: number) => controls.setDensity?.(value),
    },
    {
      id: 'rb.alpha',
      label: 'Alpha',
      min: 0,
      max: 1,
      step: 0.01,
      getter: () => controls.getState?.()?.alpha ?? 0.95,
      setter: (value: number) => controls.setAlpha?.(value),
    },
  ];

  descriptors.forEach((cfg) => {
    if (getControl(cfg.id)) return;
    registerControl({
      id: cfg.id,
      label: cfg.label,
      group: 'Rising Bubbles',
      kind: 'slider',
      min: cfg.min,
      max: cfg.max,
      step: cfg.step,
      getValue: () => cfg.getter(),
      setValue: (value) => cfg.setter(Number(value) || 0),
      format: (value) => `${(Number(value) || 0).toFixed(2)}`,
    });
  });
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scheduleSnapshotRestore() {
  snapshotPending = readStoredSnapshot();
  if (!snapshotPending) return;
  const attempt = () => {
    if (!snapshotPending) return;
    const missing = Object.keys(snapshotPending).some((id) => !getControl(id));
    if (missing) {
      setTimeout(attempt, 200);
      return;
    }
    applySnapshot(snapshotPending);
    snapshotPending = null;
  };
  setTimeout(attempt, 300);
}

function readStoredSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DevPanelSnapshot;
  } catch (error) {
    console.warn('[devpanel] Failed to parse stored snapshot', error);
    return null;
  }
}

export function shouldAutoMountDevPanel() {
  try {
    return localStorage.getItem(AUTO_KEY) === '1';
  } catch {
    return false;
  }
}

export function destroyDevPanel() {
  if (root) {
    root.remove();
    root = null;
  }
  if (safetyKeyHandler) {
    window.removeEventListener('keydown', safetyKeyHandler);
    safetyKeyHandler = null;
  }
  controlInputs.clear();
  controlValueLabels.clear();
  if (syncInterval) {
    window.clearInterval(syncInterval);
    syncInterval = null;
  }
}
