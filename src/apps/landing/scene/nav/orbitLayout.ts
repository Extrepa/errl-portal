import { NAV_ITEMS } from './navConfig';

/** Errl center in CSS pixels (matches DOM placeBubble). */
export function getErrlCenterPx(): { cx: number; cy: number } {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { cx: 0, cy: 0 };
  }
  const errl = document.getElementById('errl');
  if (!errl) {
    return { cx: window.innerWidth * 0.5, cy: window.innerHeight * 0.5 };
  }
  const r = errl.getBoundingClientRect();
  const scroll =
    typeof window.errlSceneScroll?.getState === 'function' ? window.errlSceneScroll.getState() : null;
  const offsetY = scroll?.centerOffsetY ?? 0;
  return { cx: r.left + r.width * 0.5, cy: r.top + r.height * 0.5 + offsetY };
}

/** True once #errl has a measurable layout (avoids corner-clamped nav on first frames). */
export function isErrlLayoutReady(): boolean {
  if (typeof document === 'undefined') return false;
  const errl = document.getElementById('errl');
  if (!errl) return false;
  const r = errl.getBoundingClientRect();
  return r.width > 24 && r.height > 24;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Mirrors portal-app getOrbitDistTierScale. */
export function getOrbitDistTierScale(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440): number {
  const minVp = typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) : viewportWidth;
  if (viewportWidth <= 480) return clamp(minVp / 520, 0.88, 1.0);
  if (viewportWidth <= 768) return clamp(viewportWidth / 720, 0.95, 1.05);
  return 1;
}

export function getViewportScale(): number {
  if (typeof window === 'undefined') return 1;
  const minVp = Math.min(window.innerWidth, window.innerHeight);
  return clamp(minVp / 900, 0.55, 1.05);
}

export function getScene3dBubbleRadiusPx(viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1440): number {
  const mobile = viewportWidth <= 480;
  return mobile
    ? clamp(viewportWidth * 0.14 * 0.5, 26, 36)
    : clamp(viewportWidth * 0.096 * 0.5, 33, 59);
}

/** Orbit distance in px — same formula as DOM placeBubble. */
export function getOrbitDistPx(baseDist: number, navRadius = 1, viewportWidth?: number): number {
  const w = viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const dist = baseDist * navRadius * getViewportScale() * getOrbitDistTierScale(w);
  return Math.max(dist, getMinOrbitDistPx());
}

export function getMinOrbitDistPx(): number {
  if (typeof document === 'undefined' || typeof window === 'undefined') return 120;
  const errl = document.getElementById('errl');
  if (!errl) return 120;
  const er = errl.getBoundingClientRect();
  if (er.width <= 0 || er.height <= 0) return 120;
  const bubbleR = getScene3dBubbleRadiusPx();
  const gap = window.innerWidth <= 480 ? 14 : 18;
  return Math.max(er.width, er.height) * 0.5 + bubbleR + gap;
}

export type OrbitAnchorPx = {
  key: string;
  angleRad: number;
  distPx: number;
};

export function getOrbitAnchorsPx(viewportWidth?: number): OrbitAnchorPx[] {
  return NAV_ITEMS.map((item) => ({
    key: item.key,
    angleRad: (item.angle * Math.PI) / 180,
    distPx: getOrbitDistPx(item.dist, 1, viewportWidth),
  }));
}

/** Bubble anchor in CSS px around Errl center. */
export function anchorPositionPx(angleRad: number, distPx: number, center = getErrlCenterPx()) {
  return {
    x: center.cx + Math.cos(angleRad) * distPx,
    y: center.cy + Math.sin(angleRad) * distPx,
  };
}

/** Map CSS screen coords to shader UV space. */
export function screenToShaderUv(
  left: number,
  top: number,
  width = typeof window !== 'undefined' ? window.innerWidth : 1440,
  height = typeof window !== 'undefined' ? window.innerHeight : 900,
): { x: number; y: number } {
  const aspect = width / height;
  return {
    x: ((left / width) * 2 - 1) * aspect,
    y: 1 - (top / height) * 2,
  };
}

/** Errl silhouette cutout for metaball shader. */
export function getErrlShaderCutout(): { center: { x: number; y: number }; radius: number } {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return { center: { x: 0, y: 0.08 }, radius: 0.38 };
  }
  const errl = document.getElementById('errl');
  if (!errl) return { center: { x: 0, y: 0.08 }, radius: 0.38 };
  const r = errl.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return { center: { x: 0, y: 0.08 }, radius: 0.38 };
  const center = screenToShaderUv(r.left + r.width * 0.5, r.top + r.height * 0.5);
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const aspect = window.innerWidth / window.innerHeight;
  const radius = ((Math.max(r.width, r.height) * 0.5 + 12) / minDim) * aspect;
  return { center, radius };
}

/** Clamp bubble center inside viewport (mirrors DOM clampBubblePosition). */
export function clampBubblePositionPx(
  x: number,
  y: number,
  bubbleRadiusPx = getScene3dBubbleRadiusPx(),
  pad = 10,
): { x: number; y: number } {
  if (typeof window === 'undefined') return { x, y };
  const minX = pad + bubbleRadiusPx;
  const minY = pad + bubbleRadiusPx;
  const maxX = window.innerWidth - pad - bubbleRadiusPx;
  const maxY = window.innerHeight - pad - bubbleRadiusPx;
  return {
    x: clamp(x, minX, maxX),
    y: clamp(y, minY, maxY),
  };
}

/** Push screen point outside Errl + gap. */
export function pushScreenPointOutsideErrl(
  left: number,
  top: number,
  bubbleRadiusPx = getScene3dBubbleRadiusPx(),
): { left: number; top: number } {
  if (typeof document === 'undefined' || typeof window === 'undefined') return { left, top };
  const errl = document.getElementById('errl');
  if (!errl) return { left, top };
  const er = errl.getBoundingClientRect();
  if (er.width <= 0 || er.height <= 0) return { left, top };

  const gap = 14;
  const cx = er.left + er.width * 0.5;
  const cy = er.top + er.height * 0.5;
  const minDist = Math.max(er.width, er.height) * 0.5 + bubbleRadiusPx + gap;

  const dx = left - cx;
  const dy = top - cy;
  const dist = Math.hypot(dx, dy) || 1;

  let x = left;
  let y = top;
  if (dist < minDist) {
    x = cx + (dx / dist) * minDist;
    y = cy + (dy / dist) * minDist;
  }

  const clamped = clampBubblePositionPx(x, y, bubbleRadiusPx);
  return { left: clamped.x, top: clamped.y };
}
