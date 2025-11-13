const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");
const speedSlider = document.getElementById("speed");
const trailSlider = document.getElementById("trail");

const DPR = Math.min(window.devicePixelRatio || 1, 1.8);
let width = 0;
let height = 0;
let frame = 0;
const particles = [];
const MAX_PARTICLES = 360;

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
      radius: (Math.min(canvas.clientWidth, canvas.clientHeight) * 0.42) * (0.75 + Math.random() * 0.25),
      speed: 0.0016 + Math.random() * 0.001,
      drift: Math.random() * 0.002,
      hue: palette[Math.floor(Math.random() * palette.length)],
    });
  }
}

function update() {
  frame += 1;
  const { baseSpeed, pointer } = state;
  const influence = pointer.active ? 1 + pointer.weight : 1;

  particles.forEach((p, idx) => {
    const wave = Math.sin(frame * p.drift + idx * 0.02) * 0.002;
    p.angle += (p.speed + wave) * baseSpeed * influence;
    const px = canvas.clientWidth / 2 + Math.cos(p.angle) * p.radius;
    const py = canvas.clientHeight / 2 + Math.sin(p.angle) * p.radius;
    p.x = px;
    p.y = py;
  });
}

function draw() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(8, 12, 20, ${1 - state.trail})`;
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  ctx.globalCompositeOperation = "lighter";
  particles.forEach((p, idx) => {
    const size = 2 + Math.sin(frame * 0.03 + idx) * 1.8;
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 40);
    gradient.addColorStop(0, `${p.hue}`);
    gradient.addColorStop(1, "rgba(8, 14, 24, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 12, 0, Math.PI * 2);
    ctx.fill();
  });
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
