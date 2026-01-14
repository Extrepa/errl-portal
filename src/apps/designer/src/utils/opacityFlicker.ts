/**
 * Generate opacity flicker based on intensity.
 * Returns a value between 0 and 1.
 */
export const getOpacityFlicker = (intensity: number = 0.2): number => {
  // Bias toward base opacity with occasional spikes
  const base = 0.4;
  const random = Math.random();
  const spike = random > 0.98 ? intensity : 0;
  return Math.min(1, base + spike);
};
