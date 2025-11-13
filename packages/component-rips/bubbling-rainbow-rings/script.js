const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const densitySlider = document.getElementById("density");
const fadeSlider = document.getElementById("fade");

const DPR = Math.min(window.devicePixelRatio || 1, 2);
let width = 0;
let height = 0;
const particles = [];
const MAX_PARTICLES = 400;

const palette = ["#ff9af1", "#88e5ff", "#94ffb5", "#ffd76d", "#b592ff"];

const state = {
  density: parseInt(densitySlider.value, 10),
  fade: parseFloat(fadeSlider.value),
  pointer: { x: 0, y: 0, active: false },
};

function resize() {
  width = Math.round(window.innerWidth * DPR);
  height = Math.round(window.innerHeight * DPR);
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

function spawnParticles(x, y) {
  const count = state.density;
  for (let i = 0; i < count; i++) {
    if (particles.length > MAX_PARTICLES) particles.shift();
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 1.4;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.008 + Math.random() * 0.02,
      radius: 20 + Math.random() * 40,
      hue: palette[Math.floor(Math.random() * palette.length)],
      lineWidth: 2 + Math.random() * 3,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;
    p.radius *= 0.995;
    p.vx *= 0.99;
    p.vy *= 0.99;
    if (p.life <= 0 || p.radius <= 1) {
      particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = `rgba(8, 12, 18, ${1 - state.fade})`;
  ctx.fillRect(0, 0, width / DPR, height / DPR);

  ctx.globalCompositeOperation = "lighter";
  particles.forEach((p) => {
    const alpha = Math.max(p.life, 0);
    ctx.strokeStyle = p.hue;
    ctx.lineWidth = p.lineWidth;
    ctx.globalAlpha = alpha * 0.8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.25;
    ctx.fillStyle = p.hue;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function loop() {
  updateParticles();
  drawParticles();
  requestAnimationFrame(loop);
}

function handlePointer(event) {
  const point = event.touches ? event.touches[0] : event;
  state.pointer.x = point.clientX;
  state.pointer.y = point.clientY;
  spawnParticles(point.clientX, point.clientY);
}

window.addEventListener("pointerdown", handlePointer, { passive: true });
window.addEventListener("pointermove", handlePointer, { passive: true });
window.addEventListener("pointerup", () => {
  state.pointer.active = false;
}, { passive: true });

window.addEventListener("touchstart", handlePointer, { passive: true });
window.addEventListener("touchmove", handlePointer, { passive: true });
window.addEventListener("touchend", () => {
  state.pointer.active = false;
}, { passive: true });

densitySlider.addEventListener("input", (event) => {
  state.density = parseInt(event.target.value, 10);
});

fadeSlider.addEventListener("input", (event) => {
  state.fade = parseFloat(event.target.value);
});

window.addEventListener("resize", resize);

resize();
loop();
