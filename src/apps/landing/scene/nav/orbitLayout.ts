import { NAV_ITEMS } from './navConfig';

/** Shared world-space scale for metaball Html labels and shader balls. */
export function getOrbitWorldScale(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440): number {
  if (viewportWidth <= 480) return 1.85;
  if (viewportWidth <= 768) return 2.0;
  return 2.2;
}

/** Normalized orbit radius multiplier aligned with DOM tier scales. */
export function getOrbitDistNormScale(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440): number {
  const minVp = typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) : viewportWidth;
  if (viewportWidth <= 480) return Math.min(1, Math.max(0.88, minVp / 520));
  if (viewportWidth <= 768) return Math.min(1.05, Math.max(0.95, viewportWidth / 720));
  return 1;
}

export type OrbitAnchor = {
  key: string;
  angleRad: number;
  distNorm: number;
};

/** Base orbit anchors from navConfig (matches DOM data-angle / data-dist). */
export function getOrbitAnchors(viewportWidth?: number): OrbitAnchor[] {
  const tier = getOrbitDistNormScale(viewportWidth);
  return NAV_ITEMS.map((item) => ({
    key: item.key,
    angleRad: (item.angle * Math.PI) / 180,
    distNorm: (item.dist / 220) * tier,
  }));
}

export const ORBIT_CENTER = { x: 0, y: 0.1 } as const;

export function anchorPosition(angleRad: number, distNorm: number, center = ORBIT_CENTER) {
  return {
    x: center.x + Math.cos(angleRad) * distNorm,
    y: center.y + Math.sin(angleRad) * distNorm * 0.85,
  };
}

/** Clamp normalized label position to stay inside viewport projection bounds. */
export function clampNormToViewport(x: number, y: number, scale: number, margin = 0.72) {
  const limit = margin / scale;
  return {
    x: Math.max(-limit, Math.min(limit, x)),
    y: Math.max(-limit, Math.min(limit, y)),
  };
}
