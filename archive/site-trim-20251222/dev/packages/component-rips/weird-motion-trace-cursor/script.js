const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const trailLengthInput = document.getElementById("trailLength");
const distortionInput = document.getElementById("distortion");
const speedInput = document.getElementById("speed");

let w, h, dpr;

function resize() {
  dpr = devicePixelRatio || 1;
  w = canvas.width = Math.floor(innerWidth * dpr);
  h = canvas.height = Math.floor(innerHeight * dpr);
}
addEventListener("resize", resize);
resize();

const cfg = { trailLength: 50, distortion: 0.8, speed: 1 };
trailLengthInput.addEventListener("input", (e) => (cfg.trailLength = +e.target.value));
distortionInput.addEventListener("input", (e) => (cfg.distortion = +e.target.value));
speedInput.addEventListener("input", (e) => (cfg.speed = +e.target.value));

const trail = [];
let mx = w / 2;
let my = h / 2;
let lastTime = performance.now();

addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) * dpr;
  my = (e.clientY - r.top) * dpr;
});

function step(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "hsl(200, 100%, 60%)";
    ctx.beginPath();
    ctx.arc(mx, my, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  requestAnimationFrame(step);

  const now = performance.now();
  const dt = (now - lastTime) * 0.001 * cfg.speed;
  lastTime = now;

  // Fade background
  ctx.fillStyle = "rgba(0,0,0,0.15)";
  ctx.fillRect(0, 0, w, h);

  // Add current position to trail
  trail.push({ x: mx, y: my, t: now });

  // Remove old trail points
  while (trail.length > cfg.trailLength) {
    trail.shift();
  }

  // Draw trail with distortion
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < trail.length; i++) {
    const p = trail[i];
    const age = (now - p.t) / 1000;
    const t = i / (trail.length - 1 || 1);

    // Apply weird distortion based on position and time
    const distX = Math.sin(age * 2 + p.x * 0.01) * cfg.distortion * 10;
    const distY = Math.cos(age * 1.5 + p.y * 0.01) * cfg.distortion * 10;

    const x = p.x + distX;
    const y = p.y + distY;

    const hue = (t * 360 + age * 50) % 360;
    const alpha = (1 - t) * 0.8;
    const size = (1 - t) * 6 * dpr;

    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Connect to next point with line
    if (i < trail.length - 1) {
      const next = trail[i + 1];
      const nextDistX = Math.sin((now - next.t) / 1000 * 2 + next.x * 0.01) * cfg.distortion * 10;
      const nextDistY = Math.cos((now - next.t) / 1000 * 1.5 + next.y * 0.01) * cfg.distortion * 10;
      const nextX = next.x + nextDistX;
      const nextY = next.y + nextDistY;

      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha * 0.5})`;
      ctx.lineWidth = size * 0.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nextX, nextY);
      ctx.stroke();
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

step(0);

