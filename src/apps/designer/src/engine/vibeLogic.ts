// Vibe Engine Core - Based on VIBE_ENGINE_CORE.ts specification
import type { TargetAndTransition, Transition } from 'framer-motion';
import type { VibeConfig } from '../state/types';
import { getAudioReactiveService } from './audioReactive';

export interface VibeEffect extends TargetAndTransition {
  transition: Transition & { repeat?: number };
}

export const VibeEffects = {
  pulse: (intensity: number, speed: number): VibeEffect => ({
    scale: [1, 1 + intensity, 1],
    transition: { 
      duration: 2 / speed, 
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }),

  glow: (color: string, radius: number): VibeEffect => ({
    filter: [
      `drop-shadow(0 0 0px ${color})`, 
      `drop-shadow(0 0 ${radius}px ${color})`
    ],
    transition: { 
      duration: 1.5, 
      repeat: Infinity,
      yoyo: true,
      ease: 'easeInOut'
    }
  }),

  float: (amplitude: number, frequency: number = 1): VibeEffect => ({
    y: [0, -amplitude, 0],
    transition: { 
      duration: 3 / frequency, 
      ease: 'easeInOut', 
      repeat: Infinity 
    }
  }),

  shake: (intensity: number, speed: number): VibeEffect => ({
    x: [-intensity, intensity, -intensity, intensity, 0],
    y: [-intensity, intensity, -intensity, intensity, 0],
    transition: { 
      duration: 0.5 / speed, 
      repeat: Infinity,
      ease: 'linear'
    }
  }),

  rotation: (speed: number, direction: 'cw' | 'ccw' = 'cw'): VibeEffect => ({
    rotate: direction === 'cw' ? [0, 360] : [360, 0],
    transition: { 
      duration: 2 / speed, 
      repeat: Infinity,
      ease: 'linear'
    }
  }),
};

// Get audio-reactive value if configured
const getAudioValue = (vibe: VibeConfig, baseValue: number): number => {
  if (!vibe.audioReactive) return baseValue;
  
  const audioService = getAudioReactiveService();
  if (!audioService.isActive()) return baseValue;
  
  const audioValue = audioService.getFrequencyData(vibe.audioReactive.frequencyBand);
  return baseValue * (1 + audioValue * vibe.audioReactive.multiplier);
};

export const getVibeEffect = (vibe: VibeConfig): VibeEffect | null => {
  if (!vibe.type) return null;

  // Get base values, potentially modified by audio
  const intensity = getAudioValue(vibe, vibe.intensity || 0.5);
  const speed = getAudioValue(vibe, vibe.speed || 1);
  const radius = getAudioValue(vibe, vibe.radius || 10);
  const amplitude = getAudioValue(vibe, vibe.amplitude || 10);

  switch (vibe.type) {
    case 'pulse':
      return VibeEffects.pulse(intensity, speed);
    case 'glow':
      return VibeEffects.glow(
        vibe.color || '#00FF9D',
        radius
      );
    case 'float':
      return VibeEffects.float(
        amplitude,
        vibe.frequency || 1
      );
    case 'shake':
      return VibeEffects.shake(intensity, speed);
    case 'rotation':
      return VibeEffects.rotation(speed, 'cw');
    default:
      return null;
  }
};

// Vibe Presets
export const VibePresets = {
  ghostly: {
    type: 'float' as const,
    intensity: 5,
    speed: 0.8,
    amplitude: 8,
  },
  aggressive: {
    type: 'shake' as const,
    intensity: 10,
    speed: 2,
  },
  stable: {
    type: 'pulse' as const,
    intensity: 0.1,
    speed: 0.5,
  },
  flicker: {
    type: 'glow' as const,
    color: '#00FF9D',
    radius: 20,
    speed: 3,
  },
};
