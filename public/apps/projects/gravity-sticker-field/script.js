import { isReducedMotion, onReducedMotionChange, setCanvasSize } from '../_shared/utils.js';

const cvs = document.getElementById('c');
const ctx = cvs.getContext('2d');
let reduced = isReducedMotion();
onReducedMotionChange(val => { reduced = val; init(); });

// Physics constants
const GRAV = 0.5;
const REST = 0.8;
const FRICTION = 0.99;
const R = 28;

// Sticker image
const img = new Image();
img.src = 'assets/sticker.png';

let balls = [];
let N = reduced ? 8 : 14;
let paused = false;
let mx = 0, my = 0, md = false, dragI = -1, ox = 0, oy = 0;

function init() {
  N = reduced ? 8 : 14;
  balls = Array.from({ length: N }, (_, i) => ({
    x: 100 + i * 50,
    y: 80,
    vx: 0,
    vy: 0,
    r: R,
    drag: false
  }));
}

function fit() {
  setCanvasSize(cvs, innerWidth, innerHeight);
}

fit();
addEventListener('resize', fit);
init();

// Pointer interaction
addEventListener('pointerdown', (e) => {
  md = true;
  mx = e.clientX;
  my = e.clientY;
  dragI = balls.findIndex(b => (mx - b.x) ** 2 + (my - b.y) ** 2 < b.r * b.r);
  if (dragI >= 0) {
    balls[dragI].drag = true;
    ox = mx - balls[dragI].x;
    oy = my - balls[dragI].y;
  }
});

addEventListener('pointermove', (e) => {
  mx = e.clientX;
  my = e.clientY;
});

addEventListener('pointerup', () => {
  md = false;
  if (dragI >= 0) {
    balls[dragI].drag = false;
    dragI = -1;
  }
});

// Pause/resume on visibility
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
});

function step() {
  if (paused || (reduced && dragI < 0)) return;
  
  const gravStrength = reduced ? GRAV * 0.3 : GRAV;
  
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    if (b.drag) {
      b.x = mx - ox;
      b.y = my - oy;
      b.vx *= 0.8;
      b.vy *= 0.8;
    } else {
      b.vy += gravStrength;
      b.vx *= FRICTION;
      b.vy *= FRICTION;
      b.x += b.vx;
      b.y += b.vy;
    }
    // Walls
    if (b.x - b.r < 0) { b.x = b.r; b.vx *= -REST; }
    if (b.x + b.r > innerWidth) { b.x = innerWidth - b.r; b.vx *= -REST; }
    if (b.y + b.r > innerHeight) { b.y = innerHeight - b.r; b.vy *= -REST; }
    if (b.y - b.r < 0) { b.y = b.r; b.vy *= -REST; }
  }
  
  // Collisions
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i], b = balls[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const min = a.r + b.r;
      if (dist > 0 && dist < min) {
        const nx = dx / dist, ny = dy / dist;
        const pen = min - dist;
        a.x -= nx * pen * 0.5;
        a.y -= ny * pen * 0.5;
        b.x += nx * pen * 0.5;
        b.y += ny * pen * 0.5;
        const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
        const rel = rvx * nx + rvy * ny;
        const imp = -(1 + REST) * rel * 0.5;
        a.vx -= imp * nx;
        a.vy -= imp * ny;
        b.vx += imp * nx;
        b.vy += imp * ny;
      }
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const b of balls) {
    if (img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, b.x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    } else {
      ctx.fillStyle = '#f0a';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, 6.283);
      ctx.fill();
    }
  }
}

(function loop() {
  requestAnimationFrame(loop);
  step();
  draw();
})();
