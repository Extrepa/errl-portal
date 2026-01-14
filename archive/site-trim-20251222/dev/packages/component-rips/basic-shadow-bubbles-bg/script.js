const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function fit() {
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}
fit();
addEventListener("resize", fit);

let mx = innerWidth / 2;
let my = innerHeight / 2;
addEventListener("pointermove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});

const pts = Array.from({ length: 180 }, (_, i) => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  r: 8 + Math.random() * 10,
  a: Math.random() * 6.28,
  s: 0.4 + Math.random() * 0.9,
}));

function draw(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pts) {
      ctx.fillStyle = "rgba(235, 250, 255, 0.06)";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.283);
      ctx.fill();
    }
    return;
  }

  requestAnimationFrame(draw);
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of pts) {
    p.a += 0.002 + p.s * 0.001;
    p.x += Math.cos(p.a) * 0.5 + (mx - p.x) * 0.0006;
    p.y += Math.sin(p.a) * 0.5 + (my - p.y) * 0.0006;
    ctx.fillStyle = "rgba(235, 250, 255, 0.06)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 6.283);
    ctx.fill();
  }
}

draw(0);

