export const metaballVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const metaballFragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform int uSteps;
uniform vec4 uBall0;
uniform vec4 uBall1;
uniform vec4 uBall2;
uniform vec4 uBall3;
uniform float uMergeK;
uniform float uGlow;
uniform float uPointerPull;
varying vec2 vUv;

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / max(k, 0.001), 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

float ballDist(vec3 p, vec4 ball) {
  return length(p - ball.xyz) - ball.w;
}

float scene(vec3 p) {
  vec4 b0 = uBall0;
  vec4 b1 = uBall1;
  vec4 b2 = uBall2;
  vec4 b3 = uBall3;

  float t = uTime * 0.35;
  b0.xyz += vec3(sin(t) * 0.02, cos(t * 0.9) * 0.02, 0.0);
  b1.xyz += vec3(cos(t * 1.1) * 0.02, sin(t * 0.8) * 0.02, 0.0);

  if (uPointerActive > 0.5) {
    vec2 ptr = (uPointer - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
    b0.xyz += vec3(ptr.x * uPointerPull, ptr.y * uPointerPull, 0.0);
  }

  float d = ballDist(p, b0);
  d = smin(d, ballDist(p, b1), uMergeK);
  d = smin(d, ballDist(p, b2), uMergeK);
  d = smin(d, ballDist(p, b3), uMergeK);
  return d;
}

vec3 calcNormal(vec3 p) {
  const float e = 0.001;
  return normalize(vec3(
    scene(p + vec3(e, 0.0, 0.0)) - scene(p - vec3(e, 0.0, 0.0)),
    scene(p + vec3(0.0, e, 0.0)) - scene(p - vec3(0.0, e, 0.0)),
    scene(p + vec3(0.0, 0.0, e)) - scene(p - vec3(0.0, 0.0, e))
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution.xy) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 ro = vec3(0.0, 0.0, 2.2);
  vec3 rd = normalize(vec3(uv, -1.4));

  float t = 0.0;
  float d = 1.0;
  vec3 p;
  for (int i = 0; i < 96; i++) {
    if (i >= uSteps) break;
    p = ro + rd * t;
    d = scene(p);
    if (d < 0.001) break;
    t += d;
    if (t > 6.0) break;
  }

  vec3 col = vec3(0.02, 0.03, 0.06);
  if (t < 6.0 && d < 0.01) {
    vec3 n = calcNormal(p);
    float fres = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    float glowAmt = exp(-length(p) * 1.2) * uGlow;
    col = mix(vec3(0.08, 0.2, 0.35), vec3(0.5, 0.75, 1.0), fres);
    col += vec3(0.15, 0.35, 0.55) * glowAmt;
    col *= 0.85 + 0.15 * n.y;
  }

  float vign = smoothstep(1.2, 0.2, length(uv));
  col *= vign;
  gl_FragColor = vec4(col, 1.0);
}
`;

export type BallUniform = { x: number; y: number; z: number; w: number };

/** Map nav physics position to shader ball center (vec4 xyz + radius w). */
export function physicsToBall(
  x: number,
  y: number,
  z: number,
  radius = 0.2,
  scale = 2.2,
): BallUniform {
  return { x: x * scale, y: y * scale, z, w: radius };
}
