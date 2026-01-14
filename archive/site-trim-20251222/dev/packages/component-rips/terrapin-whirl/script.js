const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const speedSlider = document.getElementById("speed");
const trailSlider = document.getElementById("trail");

const DPR = Math.min(window.devicePixelRatio || 1, 1.8);
let width = 0;
let height = 0;
let frame = 0;
const particles = [];
const MAX_PARTICLES = 480;

const state = {
  baseSpeed: parseFloat(speedSlider.value),
  trail: parseFloat(trailSlider.value),
  pointer: { x: 0, y: 0, active: false },
};

const palette = ["#6DD6FF", "#70FFAF", "#FFB4F0", "#FFD86D"];

function resize() {
  const rect = canvas.getBoundingClientRect();
  width = Math.floor(rect.width * DPR);
  height = Math.floor(rect.height * DPR);
  canvas.width = width;
  canvas.height = height;
  ctx.scale(DPR, DPR);
  initParticles();
}

function initParticles() {
  particles.length = 0;
  const count = MAX_PARTICLES;
  for (let i = 0; i < count; i++) {
    particles.push({
      angle: (i / count) * Math.PI * 2,
      radius: (Math.min(canvas.clientWidth, canvas.clientHeight) * 0.45) * (0.7 + Math.random() * 0.3),
      speed: 0.002 + Math.random() * 0.0015,
      drift: Math.random() * 0.003,
      hue: palette[Math.floor(Math.random() * palette.length)],
      baseRadius: (Math.min(canvas.clientWidth, canvas.clientHeight) * 0.45) * (0.7 + Math.random() * 0.3),
    });
  }
}

function update() {
  frame += 1;
  const { baseSpeed, pointer } = state;
  const influence = pointer.active ? 1 + pointer.weight * 0.5 : 1;

  particles.forEach((p, idx) => {
    // Create more organic whirl motion with multiple wave frequencies
    const wave1 = Math.sin(frame * p.drift + idx * 0.02) * 0.003;
    const wave2 = Math.cos(frame * p.drift * 0.7 + idx * 0.03) * 0.0015;
    const radiusVariation = 1 + Math.sin(frame * 0.01 + idx * 0.05) * 0.15;
    p.radius = p.baseRadius * radiusVariation;
    p.angle += (p.speed + wave1 + wave2) * baseSpeed * influence;
    const px = canvas.clientWidth / 2 + Math.cos(p.angle) * p.radius;
    const py = canvas.clientHeight / 2 + Math.sin(p.angle) * p.radius;
    p.x = px;
    p.y = py;
  });
}

function draw() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(6, 10, 18, ${1 - state.trail})`;
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  ctx.globalCompositeOperation = "lighter";
  particles.forEach((p, idx) => {
    const size = 3 + Math.sin(frame * 0.05 + idx * 0.12) * 2.5;
    const alpha = 0.95 + Math.sin(frame * 0.03 + idx * 0.08) * 0.15;
    const glowSize = size * 20;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
    gradient.addColorStop(0, `${p.hue}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(0.3, `${p.hue}${Math.floor(alpha * 0.8 * 255).toString(16).padStart(2, '0')}`);
    gradient.addColorStop(0.6, `${p.hue}80`);
    gradient.addColorStop(1, "rgba(6, 12, 22, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, glowSize * 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function normalizePointerEvent(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const dist = Math.hypot(x - cx, y - cy);
  const maxDist = Math.max(rect.width, rect.height) / 2;
  return { x, y, weight: Math.min(dist / maxDist, 1) };
}

function bindControls() {
  speedSlider.addEventListener("input", (event) => {
    state.baseSpeed = parseFloat(event.target.value) || 0.5;
  });
  trailSlider.addEventListener("input", (event) => {
    state.trail = parseFloat(event.target.value) || 0.9;
  });

  const activate = (event) => {
    state.pointer = { ...state.pointer, ...normalizePointerEvent(event), active: true };
  };
  const move = (event) => {
    if (!state.pointer.active) return;
    state.pointer = { ...state.pointer, ...normalizePointerEvent(event) };
  };
  const deactivate = () => {
    state.pointer.active = false;
  };

  canvas.addEventListener("pointerdown", activate);
  canvas.addEventListener("pointermove", move);
  window.addEventListener("pointerup", deactivate);

  canvas.addEventListener(
    "touchstart",
    (event) => {
      activate(event);
    },
    { passive: true }
  );
  canvas.addEventListener(
    "touchmove",
    (event) => {
      move(event);
    },
    { passive: true }
  );
  window.addEventListener("touchend", deactivate, { passive: true });
}

window.addEventListener("resize", () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  resize();
});

bindControls();
resize();
loop();
