import type { VibeConfig } from '../state/types';

export const vibePresets: Record<string, VibeConfig> = {
  NEON_BREATHE: {
    type: 'pulse',
    intensity: 0.8,
    frequency: 0.5,
    phaseOffset: 0,
    hueAmplitude: 45,
    target: 'fill',
  },
  GHOST_DRIFT: {
    type: 'float',
    intensity: 0.4,
    frequency: 0.2,
    amplitude: 12,
    phaseOffset: Math.random() * 360,
  },
  HEARTBEAT: {
    type: 'pulse',
    intensity: 1,
    frequency: 1.5,
    phaseOffset: 0,
  },
  JITTER: {
    type: 'shake',
    intensity: 0.6,
    amplitude: 6,
    frequency: 8,
  },
};
