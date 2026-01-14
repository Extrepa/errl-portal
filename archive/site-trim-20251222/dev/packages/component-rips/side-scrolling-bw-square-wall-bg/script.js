const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: false });
const root = document.getElementById("component-root");

let w, h, dpr;
let offsetX = 0;

function resize() {
  dpr = devicePixelRatio || 1;
  w = canvas.width = Math.floor(root.clientWidth * dpr);
  h = canvas.height = Math.floor(root.clientHeight * dpr);
}
resize();
new ResizeObserver(resize).observe(root);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const squareSize = 40;
const speed = reducedMotion ? 0 : 1;

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  if (reducedMotion) {
    ctx.fillStyle = "#fff";
    const cols = Math.ceil(w / squareSize) + 1;
    const rows = Math.ceil(h / squareSize) + 1;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if ((x + y) % 2 === 0) {
          ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
        }
      }
    }
    return;
  }

  ctx.fillStyle = "#fff";
  const cols = Math.ceil(w / squareSize) + 2;
  const rows = Math.ceil(h / squareSize) + 1;
  const startX = Math.floor(offsetX / squareSize);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const gridX = (startX + x) % 2;
      if ((gridX + y) % 2 === 0) {
        const px = (startX + x) * squareSize - (offsetX % squareSize);
        ctx.fillRect(px, y * squareSize, squareSize, squareSize);
      }
    }
  }

  offsetX += speed;
  if (offsetX >= squareSize * 2) {
    offsetX = 0;
  }
}

function step() {
  draw();
  if (!reducedMotion) {
    requestAnimationFrame(step);
  }
}
step();

