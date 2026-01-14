const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function fit() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
fit();
addEventListener("resize", fit);

const pts = Array.from({ length: 18 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  p: Math.random() * 6.28,
}));

addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") {
    pts.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      p: Math.random() * 6.28,
    });
  }
});

function loop(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const step = 4;
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        let best = 0;
        let bestD = 1e9;
        for (let i = 0; i < pts.length; i++) {
          const dx = x - pts[i].x;
          const dy = y - pts[i].y;
          const d = dx * dx + dy * dy;
          if (d < bestD) {
            best = i;
            bestD = d;
          }
        }
        const hue = (best * 37 + t / 40) % 360;
        const l = 45;
        ctx.fillStyle = `hsl(${hue},100%,${l}%)`;
        ctx.fillRect(x, y, step, step);
      }
    }
    return;
  }

  requestAnimationFrame(loop);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // animate points
  for (const s of pts) {
    s.p += 0.01;
    s.x += Math.cos(s.p) * 0.6;
    s.y += Math.sin(s.p * 1.2) * 0.6;
  }
  // draw cells by sampling grid (coarse for speed) and blobby smoothing
  const step = 4;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      let best = 0;
      let bestD = 1e9;
      for (let i = 0; i < pts.length; i++) {
        const dx = x - pts[i].x;
        const dy = y - pts[i].y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          best = i;
          bestD = d;
        }
      }
      const hue = (best * 37 + t / 40) % 360;
      const l = 45 + 25 * Math.sin((Math.sqrt(bestD) % 120) / 120 * 6.28 + t / 900);
      ctx.fillStyle = `hsl(${hue},100%,${l}%)`;
      ctx.fillRect(x, y, step, step);
    }
  }
}

loop(0);

