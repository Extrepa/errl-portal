import { useMemo, useRef } from 'react';
import { DEFAULT_SCENE_SETTINGS, type SceneSculptureSettings } from '../sceneTypes';
import { NAV_ITEMS, type NavKey } from './navConfig';
import { ORBIT_CENTER, anchorPosition, getOrbitAnchors, getOrbitDistNormScale } from './orbitLayout';

export type NavPhysicsState = {
  key: NavKey;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
};

const ORBIT_CENTER_REF = ORBIT_CENTER;

export type NavPhysicsApi = {
  getStates: () => NavPhysicsState[];
  step: (
    dt: number,
    pointer?: { x: number; y: number; active: boolean },
    getSculpture?: () => SceneSculptureSettings,
  ) => void;
};

export function useNavPhysics(initial?: Partial<Record<NavKey, { x: number; y: number; z: number }>>): NavPhysicsApi {
  const stateRef = useRef<NavPhysicsState[]>(
    getOrbitAnchors().map((anchor, i) => {
      const item = NAV_ITEMS[i];
      const pos = anchorPosition(anchor.angleRad, anchor.distNorm);
      const custom = initial?.[item.key];
      return {
        key: item.key,
        x: custom?.x ?? pos.x,
        y: custom?.y ?? pos.y,
        z: custom?.z ?? 0,
        vx: 0,
        vy: 0,
      };
    }),
  );

  const api = useMemo<NavPhysicsApi>(
    () => ({
      getStates: () => stateRef.current,
      step(dt, pointer, getSculpture) {
        const cfg = getSculpture?.() ?? DEFAULT_SCENE_SETTINGS.sculpture;
        const minSep = cfg.separation;
        const magneticRadius = cfg.magneticRadius;
        const floatMul = cfg.floatSpeed;
        const scrollInf = cfg.scrollInfluence ?? 1;
        const scroll =
          typeof window !== 'undefined' && window.errlSceneScroll
            ? window.errlSceneScroll.getState()
            : null;
        const scrollPhase = scroll ? scroll.progress * Math.PI * 2 : 0;

        const states = stateRef.current;
        const t = performance.now() * 0.001 * floatMul;
        const tier = getOrbitDistNormScale();
        states.forEach((s, i) => {
          const base = NAV_ITEMS[i];
          const rad = (base.angle * Math.PI) / 180;
          const r = (base.dist / 220) * tier;
          const ax =
            ORBIT_CENTER_REF.x +
            Math.cos(rad + t * 0.15) * r +
            Math.cos(scrollPhase + i * 0.4) * 0.14 * scrollInf;
          const ay =
            ORBIT_CENTER_REF.y +
            Math.sin(rad + t * 0.12) * r * 0.85 +
            Math.sin(scrollPhase + i * 0.35) * 0.12 * scrollInf;
          s.vx += (ax - s.x) * 1.2 * dt;
          s.vy += (ay - s.y) * 1.2 * dt;
          if (pointer?.active) {
            const dx = pointer.x - s.x;
            const dy = pointer.y - s.y;
            const d2 = dx * dx + dy * dy;
            const mag = magneticRadius;
            if (d2 < mag * mag) {
              const pull = (1 - Math.sqrt(d2) / mag) * 0.35;
              s.vx += dx * pull * dt * 4;
              s.vy += dy * pull * dt * 4;
            }
          }
          s.vx *= 0.92;
          s.vy *= 0.92;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
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
    [],
  );

  return api;
}
