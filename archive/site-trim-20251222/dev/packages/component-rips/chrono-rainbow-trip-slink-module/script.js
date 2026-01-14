const c = document.getElementById("c");
const g = c.getContext("2d");

function fit() {
  c.width = innerWidth;
  c.height = innerHeight;
}
fit();
addEventListener("resize", fit);

const W = 10;
const H = 6;
const buffers = Array.from({ length: W * H }, () => document.createElement("canvas"));
for (const b of buffers) {
  b.width = innerWidth;
  b.height = innerHeight;
}

function drawScene(ctx, t) {
  const cx = innerWidth / 2;
  const cy = innerHeight / 2;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < 180; i++) {
    const r = 60 + i * 4;
    const a = t / 900 + i * 0.07;
    ctx.strokeStyle = `hsla(${(i * 2 + t / 20) % 360},100%,65%,0.6)`;
    ctx.beginPath();
    ctx.arc(
      cx + Math.cos(a) * 40,
      cy + Math.sin(a * 1.2) * 30,
      r * 0.2 + 10 * Math.sin(a * 2),
      0,
      6.283
    );
    ctx.stroke();
  }
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let animationId = null;

function loop(t) {
  if (prefersReducedMotion) {
    drawScene(buffers[0].getContext("2d"), 0);
    const tw = Math.ceil(innerWidth / W);
    const th = Math.ceil(innerHeight / H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const sx = x * tw;
        const sy = y * th;
        g.drawImage(buffers[0], sx, sy, tw, th, sx, sy, tw, th);
      }
    }
    return;
  }
  animationId = requestAnimationFrame(loop);
  // render source to ring buffer
  const idx = Math.floor(t / 80) % buffers.length;
  drawScene(buffers[idx].getContext("2d"), t);
  // quilt
  const tw = Math.ceil(innerWidth / W);
  const th = Math.ceil(innerHeight / H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (idx + x + y * W) % buffers.length;
      const sx = x * tw;
      const sy = y * th;
      g.drawImage(buffers[i], sx, sy, tw, th, sx, sy, tw, th);
    }
  }
}

if (!prefersReducedMotion) {
  loop(0);
} else {
  drawScene(buffers[0].getContext("2d"), 0);
  const tw = Math.ceil(innerWidth / W);
  const th = Math.ceil(innerHeight / H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sx = x * tw;
      const sy = y * th;
      g.drawImage(buffers[0], sx, sy, tw, th, sx, sy, tw, th);
    }
  }
}

