const canvas = document.getElementById("canvas");
const root = document.getElementById("component-root");
const ctx = canvas.getContext("2d");
const countInput = document.getElementById("count");
const dragInput = document.getElementById("drag");
const sizeInput = document.getElementById("size");

let w, h, dpr;

function resize() {
  dpr = window.devicePixelRatio || 1;
  w = canvas.width = root.clientWidth * dpr;
  h = canvas.height = root.clientHeight * dpr;
}
new ResizeObserver(resize).observe(root);
resize();

const state = {
  count: 24,
  drag: 0.92,
  size: 6,
};

const beads = Array.from({ length: state.count }, () => ({
  x: w / 2,
  y: h / 2,
  vx: 0,
  vy: 0,
}));

let mx = w / 2;
let my = h / 2;

root.addEventListener("pointermove", (e) => {
  const r = root.getBoundingClientRect();
  mx = (e.clientX - r.left) * dpr;
  my = (e.clientY - r.top) * dpr;
});

function step() {
  // Slightly more fade for calmer effect
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.fillRect(0, 0, w, h);
  let px = mx;
  let py = my;
  // Slightly slower spring for calmer effect
  const k = 0.1;
  const drag = state.drag;
  for (let i = 0; i < beads.length; i++) {
    const b = beads[i];
    const dx = px - b.x;
    const dy = py - b.y;
    b.vx = (b.vx + dx * k) * drag;
    b.vy = (b.vy + dy * k) * drag;
    b.x += b.vx;
    b.y += b.vy;
    const t = i / (beads.length - 1 || 1);
    const r = state.size * (1 - t * 0.6) * dpr;
    ctx.beginPath();
    // Toned down: lower saturation (60% vs 80%), lower opacity (0.7 vs 0.95)
    ctx.fillStyle = `hsl(${210 + t * 150} 60% ${55 + 10 * (1 - t)}% / ${0.7 * (1 - t * 0.3)})`;
    ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
    ctx.fill();
    px = b.x;
    py = b.y;
  }
  requestAnimationFrame(step);
}

function sync() {
  state.count = +countInput.value;
  state.drag = +dragInput.value;
  state.size = +sizeInput.value;
  beads.length = 0;
  for (let i = 0; i < state.count; i++) {
    beads.push({ x: w / 2, y: h / 2, vx: 0, vy: 0 });
  }
}

[countInput, dragInput, sizeInput].forEach((el) =>
  el.addEventListener("input", sync)
);
sync();
requestAnimationFrame(step);
