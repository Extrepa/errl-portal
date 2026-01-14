const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const root = document.getElementById("component-root");

let w, h, dpr;
let time = 0;

function resize() {
  dpr = devicePixelRatio || 1;
  w = canvas.width = Math.floor(root.clientWidth * dpr);
  h = canvas.height = Math.floor(root.clientHeight * dpr);
}
resize();
new ResizeObserver(resize).observe(root);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const bubbles = [];
const bubbleCount = 20;

for (let i = 0; i < bubbleCount; i++) {
  bubbles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    radius: 20 + Math.random() * 60,
    speed: 0.5 + Math.random() * 1.5,
    hue: Math.random() * 360,
    phase: Math.random() * Math.PI * 2,
  });
}

function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, w, h);

  for (const bubble of bubbles) {
    if (!reducedMotion) {
      bubble.y -= bubble.speed * dpr;
      if (bubble.y < -bubble.radius) {
        bubble.y = h + bubble.radius;
        bubble.x = Math.random() * w;
      }
      bubble.x += Math.sin(time + bubble.phase) * 0.5 * dpr;
      bubble.hue = (bubble.hue + 0.5) % 360;
    }

    const alpha = 0.3 + Math.sin(time + bubble.phase) * 0.2;
    ctx.beginPath();
    ctx.arc(bubble.x, bubble.y, bubble.radius * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${bubble.hue}, 80%, 60%, ${alpha})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bubble.x - bubble.radius * 0.3 * dpr, bubble.y - bubble.radius * 0.3 * dpr, bubble.radius * 0.3 * dpr, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${bubble.hue}, 80%, 80%, ${alpha * 0.5})`;
    ctx.fill();
  }

  if (!reducedMotion) {
    time += 0.01;
  }
}

function step() {
  draw();
  if (!reducedMotion) {
    requestAnimationFrame(step);
  }
}
step();

