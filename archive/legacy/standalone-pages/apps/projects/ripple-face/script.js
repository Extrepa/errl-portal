import { isReducedMotion, onReducedMotionChange, setCanvasSize } from '../_shared/utils.js';

const e = document.getElementById('e');
const cv = document.getElementById('fx');
const ctx = cv.getContext('2d');
let reduced = isReducedMotion();
onReducedMotionChange(val => { reduced = val; });

let R = [];
const MAX_RIPPLES = 80;

function fit() {
  const w = e.naturalWidth || 1024;
  const h = e.naturalHeight || 1024;
  const rect = cv.getBoundingClientRect();
  setCanvasSize(cv, rect.width, rect.height);
}

e.onload = fit;
addEventListener('resize', fit);
fit();

function add(x, y) {
  const rect = cv.getBoundingClientRect();
  const cx = ((x - rect.left) / rect.width) * cv.width / (devicePixelRatio || 1);
  const cy = ((y - rect.top) / rect.height) * cv.height / (devicePixelRatio || 1);
  R.push({ x: cx, y: cy, t: performance.now() });
  if (R.length > MAX_RIPPLES) R.shift();
}

let pointerDown = false;
cv.addEventListener('pointerdown', (p) => {
  pointerDown = true;
  add(p.clientX, p.clientY);
});
cv.addEventListener('pointermove', (p) => {
  if (pointerDown && !reduced) {
    add(p.clientX, p.clientY);
  }
});
cv.addEventListener('pointerup', () => { pointerDown = false; });
cv.addEventListener('pointercancel', () => { pointerDown = false; });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) R = [];
});

(function loop(t) {
  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, cv.width / (devicePixelRatio || 1), cv.height / (devicePixelRatio || 1));
  const growthRate = reduced ? 80 : 160;
  const fadeRate = reduced ? 0.4 : 0.6;
  for (const r of R) {
    const age = (t - r.t) / 1000;
    const rad = 10 + age * growthRate;
    const alpha = Math.max(0, fadeRate - age * fadeRate);
    if (alpha > 0) {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(r.x, r.y, rad, 0, 7);
      ctx.stroke();
    }
  }
  R = R.filter(r => (t - r.t) < 2000);
})(0);
