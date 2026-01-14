const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function fit() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
fit();
addEventListener("resize", fit);

const roots = Array.from({ length: 60 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  a: Math.random() * 6.28,
  life: 200 + Math.random() * 400,
}));

function step(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.fillStyle = "rgba(3,3,10,0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "lighter";
    for (const r of roots) {
      const hue = (t / 30 + r.x * 0.04 + r.y * 0.03) % 360;
      ctx.strokeStyle = `hsla(${hue},100%,60%,0.6)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + 10, r.y + 10);
      ctx.stroke();
    }
    ctx.globalCompositeOperation = "source-over";
    return;
  }

  requestAnimationFrame(step);
  ctx.fillStyle = "rgba(3,3,10,0.2)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "lighter";
  for (const r of roots) {
    const hue = (t / 30 + r.x * 0.04 + r.y * 0.03) % 360;
    ctx.strokeStyle = `hsla(${hue},100%,60%,0.6)`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    r.a += Math.sin(t * 0.001 + r.x * 0.01) * 0.2;
    r.x += Math.cos(r.a) * 2;
    r.y += Math.sin(r.a) * 2;
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
    r.life--;
    if (
      r.life <= 0 ||
      r.x < 0 ||
      r.x > innerWidth ||
      r.y < 0 ||
      r.y > innerHeight
    ) {
      r.x = Math.random() * innerWidth;
      r.y = Math.random() * innerHeight;
      r.a = Math.random() * 6.28;
      r.life = 200 + Math.random() * 400;
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

requestAnimationFrame(step);

