const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const kSpan = document.getElementById("k");
let K = 8;

function fit() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
fit();
addEventListener("resize", fit);

let down = false;
let px = 0;
let py = 0;

addEventListener("pointerdown", (e) => {
  down = true;
  px = e.clientX;
  py = e.clientY;
});
addEventListener("pointerup", () => (down = false));
addEventListener("pointermove", (e) => {
  if (!down) return;
  draw(e.clientX, e.clientY);
});
addEventListener("keydown", (e) => {
  if (e.key === "q" || e.key === "Q") {
    K = Math.max(2, K - 1);
    kSpan.textContent = K;
  }
  if (e.key === "w" || e.key === "W") {
    K = Math.min(24, K + 1);
    kSpan.textContent = K;
  }
});

function draw(x, y) {
  const cx = innerWidth / 2;
  const cy = innerHeight / 2;
  const dx = x - cx;
  const dy = y - cy;
  const a = Math.atan2(dy, dx);
  const r = Math.hypot(dx, dy);
  for (let i = 0; i < K; i++) {
    const ang = a + (i * (Math.PI * 2)) / K;
    const nx = cx + Math.cos(ang) * r;
    const ny = cy + Math.sin(ang) * r;
    const hue = ((performance.now() / 30 + i * 20) % 360);
    ctx.strokeStyle = `hsla(${hue},100%,60%,0.8)`;
    ctx.lineWidth = 6 - (4 * i) / K;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(nx, ny);
    ctx.stroke();
  }
  px = x;
  py = y;
}

// ambient drip
function loop(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.fillStyle = "rgba(0,0,0,0.04)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  requestAnimationFrame(loop);
  ctx.fillStyle = "rgba(0,0,0,0.04)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const cx = innerWidth / 2 + Math.sin(t / 1400) * 120;
  const cy = innerHeight / 2 + Math.cos(t / 1600) * 90;
  draw(cx + Math.sin(t / 500) * 60, cy + Math.cos(t / 600) * 60);
}

loop(0);

