export const metaballVertexShader = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const metaballFragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uMergeK;
uniform float uGlow;
uniform float uPointerPull;
uniform vec2 uErrlCenter;
uniform float uErrlRadius;
uniform vec4 uBall0;
uniform vec4 uBall1;
uniform vec4 uBall2;
uniform vec4 uBall3;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / max(k, 0.001), 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float ballDist2d(vec2 uv, vec4 ball) {
  return length(uv - ball.xy) - ball.w;
}

vec3 pickColor(vec2 uv, vec4 b0, vec4 b1, vec4 b2, vec4 b3) {
  float d0 = length(uv - b0.xy);
  float d1 = length(uv - b1.xy);
  float d2 = length(uv - b2.xy);
  float d3 = length(uv - b3.xy);
  float best = d0;
  vec3 col = uColor0;
  if (d1 < best) { best = d1; col = uColor1; }
  if (d2 < best) { best = d2; col = uColor2; }
  if (d3 < best) { best = d3; col = uColor3; }
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec4 b0 = uBall0;
  vec4 b1 = uBall1;
  vec4 b2 = uBall2;
  vec4 b3 = uBall3;

  float t = uTime * 0.35;
  b0.xy += vec2(sin(t) * 0.006, cos(t * 0.9) * 0.006);
  b1.xy += vec2(cos(t * 1.1) * 0.006, sin(t * 0.8) * 0.006);
  b2.xy += vec2(sin(t * 0.7 + 1.0) * 0.005, cos(t * 1.2) * 0.005);
  b3.xy += vec2(cos(t * 0.9 + 2.0) * 0.005, sin(t * 0.6) * 0.005);

  if (uPointerActive > 0.5) {
    vec2 ptr = (uPointer - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    b0.xy += ptr * uPointerPull * 0.04;
  }

  float d = ballDist2d(uv, b0);
  d = smin(d, ballDist2d(uv, b1), uMergeK);
  d = smin(d, ballDist2d(uv, b2), uMergeK);
  d = smin(d, ballDist2d(uv, b3), uMergeK);

  vec3 baseCol = pickColor(uv, b0, b1, b2, b3);
  float edge = smoothstep(b0.w * 0.35, -b0.w * 0.15, d);
  float rim = smoothstep(b0.w * 0.45, -b0.w * 0.08, d);
  float alpha = edge * 0.98;

  vec3 col = baseCol * (0.45 + rim * 0.65);
  col += baseCol * uGlow * 0.35 * rim;
  col += vec3(1.0) * pow(rim, 3.0) * 0.35;

  float errlCore = length(uv - uErrlCenter) - uErrlRadius;
  if (errlCore < 0.0) {
    alpha *= smoothstep(-0.1, 0.04, errlCore);
  }

  float vign = smoothstep(1.35, 0.35, length(uv));
  col *= vign;
  gl_FragColor = vec4(col * alpha, alpha);
}
`;

export type BallUniform = { x: number; y: number; z: number; w: number };

export function hexToColorVec3(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  if (h.length < 6) return [0.5, 0.75, 1];
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

/** Map CSS screen px to shader UV ball (xy = center, w = radius in UV units). */
export function screenPxToBallUniform(
  left: number,
  top: number,
  radiusPx: number,
  viewportWidth?: number,
  viewportHeight?: number,
): BallUniform {
  const w = viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1440);
  const h = viewportHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 900);
  if (w <= 0 || h <= 0) {
    return { x: 0, y: 0, z: 0, w: 0.12 };
  }
  const aspect = w / h;
  const uvx = ((left / w) * 2 - 1) * aspect;
  const uvy = 1 - (top / h) * 2;
  const radiusUv = (radiusPx / h) * 2;
  return { x: uvx, y: uvy, z: 0, w: radiusUv };
}
