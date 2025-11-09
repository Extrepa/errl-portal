export type DevControlKind = 'slider' | 'toggle';

export interface DevControl {
  id: string;
  label: string;
  group: string;
  kind: DevControlKind;
  min?: number;
  max?: number;
  step?: number;
  format?(value: number | boolean): string;
  getValue(): number | boolean;
  setValue(value: number | boolean): void;
}

export type DevControlListener = (controls: DevControl[]) => void;

const controls = new Map<string, DevControl>();
const listeners = new Set<DevControlListener>();

function emit() {
  const snapshot = Array.from(controls.values());
  listeners.forEach((listener) => {
    try {
      listener(snapshot);
    } catch (error) {
      console.error('[devpanel] listener failed', error);
    }
  });
}

export function registerControl(control: DevControl) {
  if (controls.has(control.id)) {
    console.warn(`[devpanel] Control "${control.id}" already registered. Overwriting.`);
  }
  controls.set(control.id, control);
  emit();
  return () => {
    controls.delete(control.id);
    emit();
  };
}

export function getControl(id: string) {
  return controls.get(id) || null;
}

export function getControls() {
  return Array.from(controls.values());
}

export function subscribeToControls(listener: DevControlListener) {
  listeners.add(listener);
  listener(getControls());
  return () => listeners.delete(listener);
}

export type DevPanelSnapshot = Record<string, number | boolean>;

export function snapshotControls(): DevPanelSnapshot {
  const snapshot: DevPanelSnapshot = {};
  controls.forEach((control) => {
    try {
      snapshot[control.id] = control.getValue();
    } catch (error) {
      console.warn(`[devpanel] Failed to snapshot control "${control.id}"`, error);
    }
  });
  return snapshot;
}

export function applySnapshot(snapshot: DevPanelSnapshot) {
  Object.entries(snapshot).forEach(([id, value]) => {
    const control = controls.get(id);
    if (!control) return;
    try {
      control.setValue(value);
    } catch (error) {
      console.warn(`[devpanel] Failed to apply snapshot value for "${id}"`, error);
    }
  });
}
