import { useMemo } from 'react';
import type { VibeConfig } from '../state/types';

export interface VibeState {
  scale: number;
  translate: { x: number; y: number };
  hueRotate?: number;
  appliedToStroke?: boolean;
  appliedToFill?: boolean;
}

const DEFAULT_VIBE: VibeState = { scale: 1, translate: { x: 0, y: 0 } };

const getFrequency = (vibe: VibeConfig): number => {
  // fall back to speed or default slow oscillation
  return vibe.frequency ?? vibe.speed ?? 1;
};

export const computeVibeStack = (vibes: VibeConfig[], time: number): VibeState => {
  if (!vibes || vibes.length === 0) return DEFAULT_VIBE;

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let hueRotate: number | undefined;
  let appliedToStroke = false;
  let appliedToFill = false;

  vibes.forEach((vibe) => {
    const freq = getFrequency(vibe);
    const intensity = vibe.intensity ?? 0.5;
    const phase = (vibe.phaseOffset ?? 0) * (Math.PI / 180); // degrees -> radians

    switch (vibe.type) {
      case 'pulse': {
        const pulse = 1 + Math.sin(time * freq + phase) * intensity * 0.2;
        scale *= pulse;
        break;
      }
      case 'float': {
        const amp = vibe.amplitude ?? 10;
        ty += Math.sin(time * freq + phase) * amp * intensity;
        break;
      }
      case 'shake': {
        const amp = (vibe.amplitude ?? 5) * intensity;
        tx += (Math.random() - 0.5) * 2 * amp;
        ty += (Math.random() - 0.5) * 2 * amp;
        break;
      }
      case 'rotation': {
        // rotation vibe handled upstream via component rotation; noop here
        break;
      }
      case 'opacity_flicker': {
        // leave transform untouched; opacity handled upstream if desired
        break;
      }
      default:
        break;
    }

    if (vibe.hueAmplitude && vibe.hueAmplitude !== 0) {
      hueRotate = (Math.sin(time * freq + phase) * vibe.hueAmplitude);
      if (vibe.target === 'stroke') appliedToStroke = true;
      else if (vibe.target === 'fill') appliedToFill = true;
      else {
        appliedToStroke = true;
        appliedToFill = true;
      }
    }
  });

  return { scale, translate: { x: tx, y: ty }, hueRotate, appliedToStroke, appliedToFill };
};

/**
 * React hook wrapper for computeVibeStack to memoize based on inputs.
 */
export const useVibeStack = (vibes: VibeConfig[], time: number): VibeState => {
  return useMemo(() => computeVibeStack(vibes, time), [vibes, time]);
};
