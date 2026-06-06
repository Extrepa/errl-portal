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
export function getMinOrbitDistNorm(): number {
  if (typeof document === 'undefined' || typeof window === 'undefined') return 0.58;
  const errl = document.getElementById('errl');
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  if (!errl || minDim <= 0) return 0.58;
  const er = errl.getBoundingClientRect();
  if (er.width <= 0 || er.height <= 0) return 0.58;
  const mobile = window.innerWidth <= 480;
  const bubbleR = mobile
    ? Math.min(Math.max(window.innerWidth * 0.14 * 0.5, 26), 36)
    : Math.min(Math.max(window.innerWidth * 0.096 * 0.5, 33), 59);
  const gap = mobile ? 14 : 18;
  const minDistPx = Math.max(er.width, er.height) * 0.5 + bubbleR + gap;
  return minDistPx / minDim;
}

export function getMaxOrbitDistNorm(): number {
  if (typeof window === 'undefined') return 0.95;
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  if (minDim <= 0) return 0.95;
  const pad = 44;
  const center = getErrlOrbitCenterNorm();
  const cxPx = Math.abs(center.x * minDim);
  const cyPx = Math.abs(center.y * minDim);
  const maxX = (window.innerWidth * 0.5 - pad - cxPx) / minDim;
  const maxY = (window.innerHeight * 0.5 - pad - cyPx) / minDim;
  return Math.max(getMinOrbitDistNorm(), Math.min(maxX, maxY, 0.95));
}

export function getOrbitRadiusNorm(baseDist: number, viewportWidth?: number): number {
  const w = viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const tier = getOrbitDistNormScale(w);
  const raw = (baseDist / 220) * tier;
  return Math.min(Math.max(raw, getMinOrbitDistNorm()), getMaxOrbitDistNorm());
}

export function getOrbitAnchors(viewportWidth?: number): OrbitAnchor[] {
  const w = viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1440);
  return NAV_ITEMS.map((item) => ({
    key: item.key,
    angleRad: (item.angle * Math.PI) / 180,
    distNorm: getOrbitRadiusNorm(item.dist, w),
  }));
}

export const ORBIT_CENTER = { x: 0, y: 0.08 } as const;

/** Map #errl viewport center into physics orbit space (y up, ~1.0 ≈ ring radius). */
export function getErrlOrbitCenterNorm(): { x: number; y: number } {
  if (typeof document === 'undefined' || typeof window === 'undefined') return ORBIT_CENTER;
  const errl = document.getElementById('errl');
  if (!errl) return ORBIT_CENTER;
  const r = errl.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return ORBIT_CENTER;
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  if (minDim <= 0) return ORBIT_CENTER;
  return {
    x: (r.left + r.width * 0.5 - window.innerWidth * 0.5) / minDim,
    y: (window.innerHeight * 0.5 - (r.top + r.height * 0.5)) / minDim,
  };
}

export function anchorPosition(
  angleRad: number,
  distNorm: number,
  center: { x: number; y: number } = getErrlOrbitCenterNorm(),
) {
  return {
    x: center.x + Math.cos(angleRad) * distNorm,
    y: center.y + Math.sin(angleRad) * distNorm * 0.85,
  };
}

/** Clamp normalized label position to stay inside viewport projection bounds. */
export function clampNormToViewport(x: number, y: number, _scale?: number, margin = 1.05) {
  const limit = margin;
  return {
    x: Math.max(-limit, Math.min(limit, x)),
    y: Math.max(-limit, Math.min(limit, y)),
  };
}

export function getMetaballBallRadius(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440): number {
  if (viewportWidth <= 480) return 0.28;
  if (viewportWidth <= 768) return 0.26;
  return 0.24;
}

/** Clamp screen-space bubble center inside viewport (mirrors DOM edge clamp). */
export function clampScreenBubblePosition(left: number, top: number, bubbleRadiusPx = 32): { left: number; top: number } {
  if (typeof window === 'undefined') return { left, top };
  const pad = bubbleRadiusPx + 12;
  return {
    left: Math.max(pad, Math.min(window.innerWidth - pad, left)),
    top: Math.max(pad, Math.min(window.innerHeight - pad, top)),
  };
}
/** Map physics orbit coords to viewport pixels (same space as DOM bubble placement). */
export function orbitNormToScreen(x: number, y: number): { left: number; top: number } {
  if (typeof window === 'undefined') return { left: 0, top: 0 };
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  return clampScreenBubblePosition(
    window.innerWidth * 0.5 + x * minDim,
    window.innerHeight * 0.5 - y * minDim,
  );
}
