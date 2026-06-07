import { NAV_ITEMS } from './navConfig';

/** Seconds for one full hue revolution per orb. */
export const NAV_ORB_HUE_CYCLE_SEC = 40;

const HUE_SPEED_DEG_PER_SEC = 360 / NAV_ORB_HUE_CYCLE_SEC;

/** Rainbow slot + config tint + session jitter — each orb starts on a different arc. */
export function getNavOrbHueStarts(sessionJitterDeg = Math.random() * 360): number[] {
  return NAV_ITEMS.map((item, i) => {
    const rainbowSlot = (i / NAV_ITEMS.length) * 360;
    const configHue = hexToHueDeg(item.color);
    const perOrbJitter = (i * 17.3 + sessionJitterDeg * 0.35) % 360;
    return (rainbowSlot * 0.55 + configHue * 0.3 + perOrbJitter * 0.15) % 360;
  });
}

export function hexToHueDeg(hex: string): number {
  const raw = hex.replace('#', '').trim();
  if (raw.length !== 6) return 0;
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  if (d < 0.0001) return 0;
  let h = 0;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return (((h * 60) % 360) + 360) % 360;
}

export function hueAt(hueStart: number, tSec: number, speedMul = 1): number {
  return ((hueStart + tSec * HUE_SPEED_DEG_PER_SEC * speedMul) % 360 + 360) % 360;
}

/** Shortest-path hue blend (for merge handoff). */
export function lerpHueDeg(a: number, b: number, t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  const delta = ((((b - a) % 360) + 540) % 360) - 180;
  return (a + delta * clamped + 360) % 360;
}

export function navOrbColorFromHue(h: number, sat = 92, light = 64): string {
  return `hsl(${h.toFixed(1)} ${sat}% ${light}%)`;
}

/** @deprecated use navOrbColorFromHue(hueAt(...)) */
export function navOrbColorAt(hueStart: number, tSec: number, speedMul = 1): string {
  return navOrbColorFromHue(hueAt(hueStart, tSec, speedMul));
}

export type NavOrbColorVars = {
  primary: string;
  iridescent2: string;
  iridescent3: string;
  merge: string;
  spinDeg: number;
  mergeMix: number;
};

/** Iridescent fill + neighbor bleed when orbs touch. */
export function navOrbVisualVars(
  hueStart: number,
  neighborHueStart: number | null,
  orbIndex: number,
  tSec: number,
  mergeProximity: number,
  speedMul = 1,
): NavOrbColorVars {
  const ownHue = hueAt(hueStart, tSec, speedMul);
  let displayHue = ownHue;
  let mergeHue = ownHue;

  if (neighborHueStart !== null && mergeProximity > 0.04) {
    const neighborHue = hueAt(neighborHueStart, tSec, speedMul);
    mergeHue = neighborHue;
    const swapWave = Math.sin(tSec * 2.6 + orbIndex * 1.85) * 0.5 + 0.5;
    const blend = mergeProximity * (0.35 + 0.65 * swapWave);
    displayHue = lerpHueDeg(ownHue, neighborHue, blend * 0.62);
  }

  return {
    primary: navOrbColorFromHue(displayHue, 94, 63),
    iridescent2: navOrbColorFromHue((displayHue + 118) % 360, 96, 58),
    iridescent3: navOrbColorFromHue((displayHue + 52) % 360, 90, 70),
    merge: navOrbColorFromHue(mergeHue, 95, 66),
    spinDeg: (tSec * 48 + orbIndex * 73) % 360,
    mergeMix: mergeProximity,
  };
}
