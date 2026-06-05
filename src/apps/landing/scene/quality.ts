import { isMetaballNavActive } from './navRenderMode';

export type QualityTier = 'low' | 'medium' | 'high';

export function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium';
  try {
    const params = new URLSearchParams(window.location.search);
    const forced = params.get('quality');
    if (forced === 'low' || forced === 'medium' || forced === 'high') return forced;
  } catch (_) {}

  let reduced = false;
  try {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {}
  if (reduced) return 'low';

  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const cores = typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const lowMem = typeof mem === 'number' && mem <= 4;

  if (coarse && (cores <= 4 || lowMem)) return 'low';
  if (cores >= 8 && !coarse) return 'high';
  return 'medium';
}

export function shouldUseScene3dNav(): boolean {
  return isMetaballNavActive();
}

export function sdfMarchSteps(tier: QualityTier): number {
  if (tier === 'low') return 32;
  if (tier === 'high') return 64;
  return 48;
}

export function maxDpr(tier: QualityTier): number {
  if (tier === 'low') return 1.25;
  if (tier === 'high') return 2;
  return 1.5;
}
