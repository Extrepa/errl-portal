import { useCallback, useMemo, useRef } from 'react';
import {
  DEFAULT_SCENE_SETTINGS,
  type SceneMetaballSettings,
  type SceneSculptureSettings,
} from '../sceneTypes';
import { NAV_ITEMS, type NavKey } from './navConfig';
import {
  clampBubblePositionPx,
  getErrlCenterPx,
  getMinOrbitDistPx,
  getOrbitDistPx,
  getScene3dBubbleRadiusPx,
  getViewportScale,
  isErrlLayoutReady,
  pushScreenPointOutsideErrl,
} from './orbitLayout';

export type NavPhysicsState = {
  key: NavKey;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Mirrors portal-app navOrbitSpeed input (DOM tab; metaball uses same default when hidden). */
function readNavOrbitSpeed(): number {
  if (typeof document === 'undefined') return 1;
  const el = document.getElementById('navOrbitSpeed') as HTMLInputElement | null;
  const v = parseFloat(el?.value ?? '1');
  return Number.isFinite(v) ? clamp(v, 0, 2) : 1;
}

/** Bubble anchor in CSS px — mirrors DOM placeBubble() scroll + wobble terms. */
function orbitTargetPx(i: number, tSec: number, scrollInf: number) {
  const base = NAV_ITEMS[i];
  const center = getErrlCenterPx();
  const navOrbitSpeed = readNavOrbitSpeed();
  const viewportScale = getViewportScale();

  const scroll =
    typeof window !== 'undefined' && window.errlSceneScroll
      ? window.errlSceneScroll.getState()
      : null;
  const scrollAngle = (scroll?.angleOffsetDeg ?? 0) * scrollInf;
  const scrollRadius = (scroll?.radiusOffset ?? 0) * scrollInf;

  const speedDegPerSec = 12 * navOrbitSpeed;
  const wobbleAmpDeg = 3.5 * clamp(navOrbitSpeed, 0, 2);
  const radiusWobble = 10 * viewportScale * clamp(navOrbitSpeed, 0, 2);

  const angleDeg =
    base.angle +
    tSec * speedDegPerSec +
    Math.sin(tSec * 0.65 + i * 1.7) * wobbleAmpDeg +
    scrollAngle;
  const rad = (angleDeg * Math.PI) / 180;

  let dist =
    getOrbitDistPx(base.dist) +
    Math.sin(tSec * 0.9 + i * 1.3) * radiusWobble +
    scrollRadius;

  const minDist = getMinOrbitDistPx();
  dist = Math.max(dist, minDist);

  const raw = {
    x: center.cx + Math.cos(rad) * dist,
    y: center.cy + Math.sin(rad) * dist,
  };
  const pushed = pushScreenPointOutsideErrl(raw.x, raw.y, getScene3dBubbleRadiusPx());
  return { x: pushed.left, y: pushed.top };
}

function snapStateToOrbit(i: number, tSec = 0, scrollInf = 1): NavPhysicsState {
  const item = NAV_ITEMS[i];
  const target = orbitTargetPx(i, tSec, scrollInf);
  return {
    key: item.key,
    x: target.x,
    y: target.y,
    z: 0,
    vx: 0,
    vy: 0,
  };
}

function readScrollInfluence(): number {
  return DEFAULT_SCENE_SETTINGS.sculpture.scrollInfluence;
}

function buildInitialStates(initial?: Partial<Record<NavKey, { x: number; y: number; z: number }>>) {
  const scrollInf = readScrollInfluence();
  if (typeof window !== 'undefined' && !isErrlLayoutReady()) {
    return NAV_ITEMS.map((item) => ({
      key: item.key,
      x: window.innerWidth * 0.5,
      y: window.innerHeight * 0.5,
      z: 0,
      vx: 0,
      vy: 0,
    }));
  }
  return NAV_ITEMS.map((item, i) => {
    const custom = initial?.[item.key];
    if (custom && Number.isFinite(custom.x) && Number.isFinite(custom.y)) {
      return {
        key: item.key,
        x: custom.x,
        y: custom.y,
        z: custom.z ?? 0,
        vx: 0,
        vy: 0,
      };
    }
    return snapStateToOrbit(i, 0, scrollInf);
  });
}

export type NavPhysicsApi = {
  getStates: () => NavPhysicsState[];
  reanchor: () => void;
  /** Snap to orbit at `tSec`, or keep current orbit phase when omitted */
  snapToOrbit: (tSec?: number) => void;
  step: (
    dt: number,
    pointer?: { x: number; y: number; active: boolean },
    getSculpture?: () => SceneSculptureSettings,
    getMetaball?: () => SceneMetaballSettings,
  ) => void;
};

export function useNavPhysics(initial?: Partial<Record<NavKey, { x: number; y: number; z: number }>>): NavPhysicsApi {
  const stateRef = useRef<NavPhysicsState[]>(buildInitialStates(initial));
  /** Orbit phase clock — must not use wall time or intro snap (t=0) jumps when motion starts. */
  const orbitClockRef = useRef(0);

  const reanchor = useCallback(() => {
    orbitClockRef.current = 0;
    stateRef.current = buildInitialStates(initial);
  }, [initial]);

  const snapToOrbit = useCallback((tSec?: number) => {
    const t = tSec ?? orbitClockRef.current;
    orbitClockRef.current = t;
    const scrollInf = readScrollInfluence();
    stateRef.current = NAV_ITEMS.map((_, i) => snapStateToOrbit(i, t, scrollInf));
  }, []);

  const api = useMemo<NavPhysicsApi>(
    () => ({
      getStates: () => stateRef.current,
      reanchor,
      snapToOrbit,
      step(dt, pointer, getSculpture, getMetaball) {
        const cfg = getSculpture?.() ?? DEFAULT_SCENE_SETTINGS.sculpture;
        const mb = getMetaball?.() ?? DEFAULT_SCENE_SETTINGS.metaball;
        const bubblePx = getScene3dBubbleRadiusPx();
        const mergeFactor = clamp(mb.mergeK, 0, 1);
        const minSep = cfg.separation * bubblePx * 2.2 * (1 - mergeFactor * 0.45);
        const repulsionStrength = 1 - mergeFactor * 0.72;
        const magneticRadius = cfg.magneticRadius * bubblePx * 3;
        const floatMul = cfg.floatSpeed;
        const scrollInf = cfg.scrollInfluence ?? 1;
        const pointerPull = mb.pointerPull ?? DEFAULT_SCENE_SETTINGS.metaball.pointerPull;

        const states = stateRef.current;
        orbitClockRef.current += dt * floatMul;
        const tSec = orbitClockRef.current;
        states.forEach((s, i) => {
          const target = orbitTargetPx(i, tSec, scrollInf);
          s.vx += (target.x - s.x) * 2.5 * dt;
          s.vy += (target.y - s.y) * 2.5 * dt;
          if (pointer?.active && pointerPull > 0) {
            const ptrX = (pointer.x * 0.5 + 0.5) * window.innerWidth;
            const ptrY = (-pointer.y * 0.5 + 0.5) * window.innerHeight;
            const dx = ptrX - s.x;
            const dy = ptrY - s.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < magneticRadius * magneticRadius) {
              const pull = (1 - Math.sqrt(d2) / magneticRadius) * 0.25 * pointerPull;
              s.vx += dx * pull * dt * 3;
              s.vy += dy * pull * dt * 3;
            }
          }
          s.vx *= 0.9;
          s.vy *= 0.9;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          const clamped = clampBubblePositionPx(s.x, s.y, bubblePx);
          s.x = clamped.x;
          s.y = clamped.y;
          s.z = Math.sin(tSec * 0.8 + i) * 0.08;
        });
        for (let a = 0; a < states.length; a++) {
          for (let b = a + 1; b < states.length; b++) {
            const sa = states[a];
            const sb = states[b];
            const dx = sb.x - sa.x;
            const dy = sb.y - sa.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
            if (d < minSep) {
              const push = ((minSep - d) / d) * 0.5 * repulsionStrength;
              sa.vx -= dx * push;
              sa.vy -= dy * push;
              sb.vx += dx * push;
              sb.vy += dy * push;
            }
          }
        }
      },
    }),
    [reanchor, snapToOrbit],
  );

  return api;
}
