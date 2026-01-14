const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
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
const gridSize = 30;

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  const cols = Math.ceil(w / gridSize) + 1;
  const rows = Math.ceil(h / gridSize) + 1;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * gridSize;
      const py = y * gridSize;
      const dist = Math.sqrt((px - w / 2) ** 2 + (py - h / 2) ** 2);
      const hue = reducedMotion
        ? (x + y) * 10
        : ((dist * 0.1 + time * 20 + (x + y) * 5) % 360);
      ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
      ctx.fillRect(px, py, gridSize - 2, gridSize - 2);
    }
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

