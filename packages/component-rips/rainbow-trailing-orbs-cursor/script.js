const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const countInput = document.getElementById("count");
const dragInput = document.getElementById("drag");
const sizeInput = document.getElementById("size");

let w, h, dpr;

function resize() {
  dpr = window.devicePixelRatio || 1;
  w = canvas.width = Math.floor(window.innerWidth * dpr);
  h = canvas.height = Math.floor(window.innerHeight * dpr);
}
window.addEventListener("resize", resize, { passive: true });
resize();

const state = {
  count: 24,
  drag: 0.92,
  size: 8,
  hueBase: 210,
  hueRange: 160,
};

const beads = [];

function resetBeads() {
  beads.length = 0;
  for (let i = 0; i < state.count; i++) {
    beads.push({ x: w / 2, y: h / 2, vx: 0, vy: 0 });
  }
}
resetBeads();

// UI
function sync() {
  state.count = +countInput.value;
  state.drag = +dragInput.value;
  state.size = +sizeInput.value;
  resetBeads();
}
[countInput, dragInput, sizeInput].forEach((el) =>
  el.addEventListener("input", sync)
);
sync();

// Pointer target
let targetX = w / 2;
let targetY = h / 2;
window.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  targetX = (e.clientX - rect.left) * dpr;
  targetY = (e.clientY - rect.top) * dpr;
});

function step() {
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, w, h);

  // physics: each bead follows previous with spring
  let px = targetX;
  let py = targetY;
  const k = 0.12; // spring
  const dragC = state.drag;
  for (let i = 0; i < beads.length; i++) {
    const b = beads[i];
    const dx = px - b.x;
    const dy = py - b.y;
    b.vx = (b.vx + dx * k) * dragC;
    b.vy = (b.vy + dy * k) * dragC;
    b.x += b.vx;
    b.y += b.vy;

    const t = i / (beads.length - 1 || 1);
    const hue = (state.hueBase + t * state.hueRange) % 360;
    const r = state.size * (1.0 - t * 0.6) * dpr;

    ctx.beginPath();
    ctx.fillStyle = `hsl(${hue} 80% ${50 + 20 * (1 - t)}% / 0.95)`;
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();

    px = b.x;
    py = b.y;
  }
  requestAnimationFrame(step);
}
requestAnimationFrame(step);
