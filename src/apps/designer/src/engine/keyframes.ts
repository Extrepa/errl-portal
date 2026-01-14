/**
 * Keyframe System
 * Handles keyframe-based animation with interpolation
 */

export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export interface Keyframe {
  id: string;
  time: number; // Time in seconds (0-1 or absolute)
  value: number | string; // Numeric value or color string
  easing?: EasingFunction;
}

export interface PropertyTrack {
  property: 'x' | 'y' | 'scale' | 'rotation' | 'opacity' | 'color';
  keyframes: Keyframe[];
}

export interface AnimationTrack {
  id: string;
  objectId: string; // Reference to scene object or component
  properties: PropertyTrack[];
  duration: number; // Total duration in seconds
  loop: boolean;
}

/**
 * Interpolate between two keyframes
 */
function interpolate(
  startValue: number,
  endValue: number,
  t: number,
  easing: EasingFunction = 'linear'
): number {
  // Apply easing function
  let easedT = t;
  switch (easing) {
    case 'ease-in':
      easedT = t * t;
      break;
    case 'ease-out':
      easedT = t * (2 - t);
      break;
    case 'ease-in-out':
      easedT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      break;
    case 'ease':
      easedT = t * t * (3 - 2 * t);
      break;
    case 'linear':
    default:
      easedT = t;
  }

  return startValue + (endValue - startValue) * easedT;
}

/**
 * Get value at a specific time from a property track
 */
export function getValueAtTime(track: PropertyTrack, time: number): number | string | null {
  if (track.keyframes.length === 0) return null;
  if (track.keyframes.length === 1) return track.keyframes[0].value;

  // Find the two keyframes to interpolate between
  const sortedKeyframes = [...track.keyframes].sort((a, b) => a.time - b.time);
  
  // Before first keyframe
  if (time <= sortedKeyframes[0].time) {
    return sortedKeyframes[0].value;
  }

  // After last keyframe
  if (time >= sortedKeyframes[sortedKeyframes.length - 1].time) {
    return sortedKeyframes[sortedKeyframes.length - 1].value;
  }

  // Find the keyframes to interpolate between
  for (let i = 0; i < sortedKeyframes.length - 1; i++) {
    const kf1 = sortedKeyframes[i];
    const kf2 = sortedKeyframes[i + 1];

    if (time >= kf1.time && time <= kf2.time) {
      // Normalize time between keyframes (0-1)
      const normalizedTime = (time - kf1.time) / (kf2.time - kf1.time);

      // Handle color interpolation separately
      if (typeof kf1.value === 'string' && typeof kf2.value === 'string') {
        // Simple color interpolation (could be enhanced)
        return normalizedTime < 0.5 ? kf1.value : kf2.value;
      }

      // Numeric interpolation
      if (typeof kf1.value === 'number' && typeof kf2.value === 'number') {
        const easing = kf2.easing || 'linear';
        return interpolate(kf1.value, kf2.value, normalizedTime, easing);
      }
    }
  }

  return null;
}

/**
 * Get all property values at a specific time for an animation track
 */
export function getAnimationStateAtTime(track: AnimationTrack, time: number): Record<string, number | string> {
  const state: Record<string, number | string> = {};

  // Handle looping
  let normalizedTime = time;
  if (track.loop && track.duration > 0) {
    normalizedTime = time % track.duration;
  } else {
    normalizedTime = Math.min(time, track.duration);
  }

  // Normalize to 0-1 range if using relative keyframes
  const useRelativeTime = track.properties.some(p => 
    p.keyframes.some(kf => kf.time <= 1)
  );

  const finalTime = useRelativeTime ? normalizedTime / track.duration : normalizedTime;

  for (const propTrack of track.properties) {
    const value = getValueAtTime(propTrack, finalTime);
    if (value !== null) {
      state[propTrack.property] = value;
    }
  }

  return state;
}

/**
 * Create a default keyframe track for a property
 */
export function createDefaultTrack(property: PropertyTrack['property'], duration: number = 1): PropertyTrack {
  return {
    property,
    keyframes: [
      { id: 'kf_start', time: 0, value: property === 'opacity' ? 1 : property === 'scale' ? 1 : 0 },
      { id: 'kf_end', time: duration, value: property === 'opacity' ? 1 : property === 'scale' ? 1 : 0 },
    ],
  };
}

