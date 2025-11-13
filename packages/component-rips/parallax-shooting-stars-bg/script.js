const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function fit() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
fit();
addEventListener("resize", fit);

const stars = Array.from({ length: 900 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  z: Math.random(),
  p: Math.random() * 6.28,
}));

let mx = innerWidth / 2;
let my = innerHeight / 2;
addEventListener("pointermove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});

function loop(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.fillStyle = "rgba(2,2,9,0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const s of stars) {
      const hue = (t / 80 + s.z * 360) % 360;
      const r = 0.6 + s.z * 2.2;
      ctx.fillStyle = `hsla(${hue},100%,60%,0.8)`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, 6.283);
      ctx.fill();
    }
    return;
  }

  requestAnimationFrame(loop);
  ctx.fillStyle = "rgba(2,2,9,0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const s of stars) {
    s.p += 0.002 + s.z * 0.01;
    const dx = (mx - s.x) * 0.0006 * (1 - s.z);
    const dy = (my - s.y) * 0.0006 * (1 - s.z);
    s.x += Math.cos(s.p) * 0.4 + dx;
    s.y += Math.sin(s.p) * 0.4 + dy;
    if (s.x < 0) s.x += innerWidth;
    if (s.x > innerWidth) s.x -= innerWidth;
    if (s.y < 0) s.y += innerHeight;
    if (s.y > innerHeight) s.y -= innerHeight;
    const hue = (t / 80 + s.z * 360) % 360;
    const r = 0.6 + s.z * 2.2;
    ctx.fillStyle = `hsla(${hue},100%,60%,0.8)`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, 6.283);
    ctx.fill();
    // chroma trail
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = `hsla(${(hue + 180) % 360},100%,70%,0.6)`;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(
      s.x - Math.cos(s.p) * 8 * (1 + s.z * 2),
      s.y - Math.sin(s.p) * 8 * (1 + s.z * 2)
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

loop(0);

