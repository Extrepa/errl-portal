const scene = document.getElementById("scene");
const trail = document.getElementById("trail");
const gs = scene.getContext("2d");
const gt = trail.getContext("2d");
const decInput = document.getElementById("dec");
const spdInput = document.getElementById("spd");

function fit() {
  [scene, trail].forEach((x) => {
    x.width = innerWidth;
    x.height = innerHeight;
  });
}
fit();
addEventListener("resize", fit);

let pts = Array.from({ length: 90 }, (_, i) => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  a: Math.random() * 6.283,
  r: 2 + Math.random() * 3,
  s: 0.2 + Math.random() * 2,
}));

function drawScene(time) {
  gs.clearRect(0, 0, innerWidth, innerHeight);
  const speed = 0.2 + parseFloat(spdInput.value) * 3.0;
  for (const p of pts) {
    p.a += 0.002 * speed + p.s * 0.003;
    p.x += Math.cos(p.a) * p.s * speed * 2;
    p.y += Math.sin(p.a) * p.s * speed * 2;
    if (p.x < 0) p.x += innerWidth;
    if (p.x > innerWidth) p.x -= innerWidth;
    if (p.y < 0) p.y += innerHeight;
    if (p.y > innerHeight) p.y -= innerHeight;
    gs.fillStyle = "rgba(255,255,255,.9)";
    gs.beginPath();
    gs.arc(p.x, p.y, p.r, 0, 6.283);
    gs.fill();
  }
}

function loop(ti) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    drawScene(ti);
    return;
  }

  requestAnimationFrame(loop);
  drawScene(ti);
  // fade trails
  gt.globalCompositeOperation = "source-over";
  gt.globalAlpha = parseFloat(decInput.value);
  gt.drawImage(trail, 0, 0);
  // add new frame
  gt.globalCompositeOperation = "lighter";
  gt.globalAlpha = 0.9;
  gt.drawImage(scene, 0, 0);
  // present
  gs.globalCompositeOperation = "difference";
  gs.drawImage(trail, 0, 0);
  gs.globalCompositeOperation = "source-over";
}

loop(0);

