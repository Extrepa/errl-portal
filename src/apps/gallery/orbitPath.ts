export type OrbitPose = {
  position: [number, number, number];
  rotation: [number, number, number];
  size: number;
};

/** Each slot rides the same looping path with a staggered phase */
export function poseOnPath(phase: number, slot: number, count: number): OrbitPose {
  const t = (phase + slot / Math.max(1, count)) % 1;
  const angle = t * Math.PI * 2;

  const lane = (slot % 3) - 1;
  const wobble = Math.sin(slot * 2.17 + 0.5) * 0.42;
  const radius = 2.55 + wobble;
  const x = Math.sin(angle * 1.05 + slot * 0.31) * radius + lane * 0.48;
  const z = -Math.cos(angle * 0.92 + slot * 0.19) * (radius * 0.9);
  const y = Math.sin(angle * 2.4 + slot * 1.33) * 0.78 + lane * 0.34;

  const yaw = Math.atan2(-x, -z);
  const size = 1.02 + (slot % 4) * 0.13 + Math.sin(slot * 1.9) * 0.07;

  return {
    position: [x, y, z],
    rotation: [0, yaw, 0],
    size,
  };
}

export function windowSlice<T>(items: T[], progress: number, max: number): T[] {
  if (items.length <= max) return items;
  const start = Math.floor(progress * Math.max(1, items.length - max));
  return items.slice(start, start + max);
}
