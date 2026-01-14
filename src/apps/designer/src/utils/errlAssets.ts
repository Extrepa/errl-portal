import type { Asset, Component } from '../state/types';
import { generateId } from './helpers';

export const createErrlAssets = (): { assets: Asset[]; components: Component[] } => {
  const bodyAsset: Asset = {
    id: 'errl_body_asset',
    name: 'Errl Body',
    type: 'svg',
    data: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 10 C75 10 90 30 90 55 S75 95 50 95 S10 80 10 55 S25 10 50 10" fill="#0a0a0a" stroke="#00ff9d" stroke-width="1.5" />
    </svg>`,
  };

  const bubbleAsset: Asset = {
    id: 'errl_bubble_asset',
    name: 'Errl Bubble',
    type: 'svg',
    data: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="6" fill="#00ff9d" opacity="0.6" />
    </svg>`,
  };

  const eyeAsset: Asset = {
    id: 'errl_eye_asset',
    name: 'Errl Eye',
    type: 'svg',
    data: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="6" fill="#0a0a0a" stroke="#00ff9d" stroke-width="1" />
      <circle cx="10" cy="10" r="2.5" fill="#00ff9d" />
    </svg>`,
  };

  const trailAsset: Asset = {
    id: 'errl_trail_asset',
    name: 'Errl Trail',
    type: 'svg',
    data: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 60">
      <path d="M10 0 C6 10 14 20 10 30 C6 40 14 50 10 60" fill="none" stroke="#00ff9d" stroke-width="1.2" />
    </svg>`,
  };

  const bodyComponent: Component = {
    id: generateId('comp'),
    name: 'Errl Body Comp',
    base_asset: bodyAsset.id,
    vibeStack: [
      { type: 'pulse', intensity: 0.8, frequency: 0.5, hueAmplitude: 45, target: 'stroke' },
    ],
  };

  const bubbleComponent: Component = {
    id: generateId('comp'),
    name: 'Errl Bubble Comp',
    base_asset: bubbleAsset.id,
    vibeStack: [
      { type: 'float', intensity: 0.4, frequency: 0.2, amplitude: 8, phaseOffset: Math.random() * 360 },
      { type: 'opacity_flicker', intensity: 0.2, frequency: 4 },
    ],
  };

  const eyeComponent: Component = {
    id: generateId('comp'),
    name: 'Errl Eye Comp',
    base_asset: eyeAsset.id,
    vibeStack: [
      { type: 'pulse', intensity: 0.5, frequency: 1.2 },
      { type: 'shake', intensity: 0.2, amplitude: 3, frequency: 8 },
    ],
  };

  const trailComponent: Component = {
    id: generateId('comp'),
    name: 'Errl Trail Comp',
    base_asset: trailAsset.id,
    vibeStack: [
      { type: 'float', intensity: 0.6, frequency: 0.4, amplitude: 12, phaseOffset: 180 },
    ],
  };

  return {
    assets: [bodyAsset, bubbleAsset, eyeAsset, trailAsset],
    components: [bodyComponent, bubbleComponent, eyeComponent, trailComponent],
  };
};
