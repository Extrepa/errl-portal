import { useCallback, useMemo, useRef } from 'react';
import { DEFAULT_SCENE_SETTINGS, type SceneSculptureSettings } from '../sceneTypes';
import { NAV_ITEMS, type NavKey } from './navConfig';
import {
  clampBubblePositionPx,
  getErrlCenterPx,
  getOrbitDistPx,
  getScene3dBubbleRadiusPx,
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

function orbitTargetPx(i: number, t: number, scrollPhase: number, scrollInf: number) {
  const base = NAV_ITEMS[i];
  const center = getErrlCenterPx();
  const rad = (base.angle * Math.PI) / 180;
  const dist = getOrbitDistPx(base.dist);
  const raw = {
    x: center.cx + Math.cos(rad + t * 0.1) * dist + Math.cos(scrollPhase + i * 0.4) * 8 * scrollInf,
    y: center.cy + Math.sin(rad + t * 0.1) * dist + Math.sin(scrollPhase + i * 0.35) * 6 * scrollInf,
  };
  const pushed = pushScreenPointOutsideErrl(raw.x, raw.y, getScene3dBubbleRadiusPx());
  return { x: pushed.left, y: pushed.top };
}

function readScrollOrbit() {
  const scroll =
    typeof window !== 'undefined' && window.errlSceneScroll
      ? window.errlSceneScroll.getState()
      : null;
  return {
    scrollPhase: scroll ? scroll.progress * Math.PI * 2 : 0,
    scrollInf: 1,
  };
}

function snapStateToOrbit(i: number, t = 0, scrollPhase?: number, scrollInf = 1): NavPhysicsState {
  const item = NAV_ITEMS[i];
  const phase = scrollPhase ?? readScrollOrbit().scrollPhase;
  const target = orbitTargetPx(i, t, phase, scrollInf);
  return {
    key: item.key,
    x: target.x,
    y: target.y,
    z: 0,
    vx: 0,
    vy: 0,
  };
}

function buildInitialStates(initial?: Partial<Record<NavKey, { x: number; y: number; z: number }>>) {
  const { scrollPhase, scrollInf } = readScrollOrbit();
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
    return snapStateToOrbit(i, 0, scrollPhase, scrollInf);
  });
}

export type NavPhysicsApi = {
  getStates: () => NavPhysicsState[];
  reanchor: () => void;
  step: (
    dt: number,
    pointer?: { x: number; y: number; active: boolean },
    getSculpture?: () => SceneSculptureSettings,
  ) => void;
};

export function useNavPhysics(initial?: Partial<Record<NavKey, { x: number; y: number; z: number }>>): NavPhysicsApi {
  const stateRef = useRef<NavPhysicsState[]>(buildInitialStates(initial));

  const reanchor = useCallback(() => {
    stateRef.current = buildInitialStates(initial);
  }, [initial]);

  const api = useMemo<NavPhysicsApi>(
    () => ({
      getStates: () => stateRef.current,
      reanchor,
      step(dt, pointer, getSculpture) {
        const cfg = getSculpture?.() ?? DEFAULT_SCENE_SETTINGS.sculpture;
        const bubblePx = getScene3dBubbleRadiusPx();
        const minSep = cfg.separation * bubblePx * 2.2;
        const magneticRadius = cfg.magneticRadius * bubblePx * 3;
        const floatMul = cfg.floatSpeed;
        const scrollInf = cfg.scrollInfluence ?? 1;
        const scroll =
          typeof window !== 'undefined' && window.errlSceneScroll
            ? window.errlSceneScroll.getState()
            : null;
        const scrollPhase = scroll ? scroll.progress * Math.PI * 2 : 0;

        const states = stateRef.current;
        const t = performance.now() * 0.001 * floatMul;
        states.forEach((s, i) => {
          const target = orbitTargetPx(i, t, scrollPhase, scrollInf);
          s.vx += (target.x - s.x) * 2.5 * dt;
          s.vy += (target.y - s.y) * 2.5 * dt;
          if (pointer?.active) {
            const ptrX = (pointer.x * 0.5 + 0.5) * window.innerWidth;
            const ptrY = (-pointer.y * 0.5 + 0.5) * window.innerHeight;
            const dx = ptrX - s.x;
            const dy = ptrY - s.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < magneticRadius * magneticRadius) {
              const pull = (1 - Math.sqrt(d2) / magneticRadius) * 0.25;
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
          s.z = Math.sin(t * 0.8 + i) * 0.08;
        });
        for (let a = 0; a < states.length; a++) {
          for (let b = a + 1; b < states.length; b++) {
            const sa = states[a];
            const sb = states[b];
            const dx = sb.x - sa.x;
            const dy = sb.y - sa.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 0.001;
            if (d < minSep) {
              const push = ((minSep - d) / d) * 0.5;
              sa.vx -= dx * push;
              sa.vy -= dy * push;
              sb.vx += dx * push;
              sb.vy += dy * push;
            }
          }
        }
      },
    }),
    [reanchor],
  );

  return api;
}
