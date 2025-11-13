const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colsInput = document.getElementById("cols");
const rowsInput = document.getElementById("rows");
const warpInput = document.getElementById("warp");

let w, h, dpr;

function resize() {
  dpr = devicePixelRatio || 1;
  w = canvas.width = Math.floor(innerWidth * dpr);
  h = canvas.height = Math.floor(innerHeight * dpr);
}
addEventListener("resize", resize);
resize();

const cfg = { cols: 28, rows: 18, warp: 0.45, hue: 200 };
colsInput.addEventListener("input", (e) => (cfg.cols = +e.target.value));
rowsInput.addEventListener("input", (e) => (cfg.rows = +e.target.value));
warpInput.addEventListener("input", (e) => (cfg.warp = +e.target.value));

let mx = w / 2;
let my = h / 2;
addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) * dpr;
  my = (e.clientY - r.top) * dpr;
});

function draw() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1 * dpr;
    const pad = 60 * dpr;
    const cw = (w - pad * 2) / (cfg.cols - 1);
    const rh = (h - pad * 2) / (cfg.rows - 1);

    const pts = [];
    for (let j = 0; j < cfg.rows; j++) {
      for (let i = 0; i < cfg.cols; i++) {
        const x = pad + i * cw;
        const y = pad + j * rh;
        pts.push([x, y]);
      }
    }

    ctx.strokeStyle = `hsl(${cfg.hue} 80% 60% / 0.8)`;
    for (let j = 0; j < cfg.rows; j++) {
      ctx.beginPath();
      for (let i = 0; i < cfg.cols; i++) {
        const p = pts[j * cfg.cols + i];
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = `hsl(${(cfg.hue + 40) % 360} 80% 60% / 0.55)`;
    for (let i = 0; i < cfg.cols; i++) {
      ctx.beginPath();
      for (let j = 0; j < cfg.rows; j++) {
        const p = pts[j * cfg.cols + i];
        if (j === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.stroke();
    }
    return;
  }

  requestAnimationFrame(draw);
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1 * dpr;
  const pad = 60 * dpr;
  const cw = (w - pad * 2) / (cfg.cols - 1);
  const rh = (h - pad * 2) / (cfg.rows - 1);

  // grid points with warp around pointer
  const pts = [];
  for (let j = 0; j < cfg.rows; j++) {
    for (let i = 0; i < cfg.cols; i++) {
      const x = pad + i * cw;
      const y = pad + j * rh;
      const dx = x - mx;
      const dy = y - my;
      const dist = Math.hypot(dx, dy);
      const force = Math.exp(-dist / (180 * dpr)) * cfg.warp;
      pts.push([x + dx * force, y + dy * force]);
    }
  }

  // draw
  ctx.strokeStyle = `hsl(${cfg.hue} 80% 60% / 0.8)`;
  // horizontal lines
  for (let j = 0; j < cfg.rows; j++) {
    ctx.beginPath();
    for (let i = 0; i < cfg.cols; i++) {
      const p = pts[j * cfg.cols + i];
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  }
  // vertical lines
  ctx.strokeStyle = `hsl(${(cfg.hue + 40) % 360} 80% 60% / 0.55)`;
  for (let i = 0; i < cfg.cols; i++) {
    ctx.beginPath();
    for (let j = 0; j < cfg.rows; j++) {
      const p = pts[j * cfg.cols + i];
      if (j === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  }
}

requestAnimationFrame(draw);

