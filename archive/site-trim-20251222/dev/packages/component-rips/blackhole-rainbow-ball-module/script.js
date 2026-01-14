const bg = document.getElementById("bg");
const fx = document.getElementById("fx");
const gb = bg.getContext("2d");
const gf = fx.getContext("2d");

function fit() {
  [bg, fx].forEach((x) => {
    x.width = innerWidth;
    x.height = innerHeight;
  });
}
fit();
addEventListener("resize", fit);

let mx = innerWidth / 2;
let my = innerHeight / 2;
let down = false;

addEventListener("pointerdown", (e) => {
  down = true;
  mx = e.clientX;
  my = e.clientY;
});
addEventListener("pointermove", (e) => {
  if (down) {
    mx = e.clientX;
    my = e.clientY;
  }
});
addEventListener("pointerup", () => {
  down = false;
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let animationId = null;

function drawBG(t) {
  gb.clearRect(0, 0, bg.width, bg.height);
  const cx = bg.width / 2;
  const cy = bg.height / 2;
  for (let i = 0; i < 200; i++) {
    const r = 20 + i * 3;
    const a = t / 1200 + i * 0.05;
    gb.strokeStyle = `hsla(${(i * 2 + t / 20) % 360},100%,60%,0.6)`;
    gb.beginPath();
    gb.arc(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, r * 0.36, 0, 6.283);
    gb.stroke();
  }
}

function distort() {
  const w = fx.width;
  const h = fx.height;
  const src = gb.getImageData(0, 0, w, h);
  const out = gf.createImageData(w, h);
  const R = 140;
  for (let y = -R; y <= R; y++) {
    for (let x = -R; x <= R; x++) {
      const d = Math.hypot(x, y);
      if (d > R) continue;
      const tslow = 1 - d / R;
      const bend = 1 + tslow * 2.5;
      const sx = Math.max(0, Math.min(w - 1, Math.round(mx + x * bend)));
      const sy = Math.max(0, Math.min(h - 1, Math.round(my + y * bend)));
      const si = (sy * w + sx) * 4;
      const di = ((my + y) | 0) * w * 4 + ((mx + x) | 0) * 4;
      if (di >= 0 && di < out.data.length) {
        out.data[di] = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = 255;
      }
    }
  }
  gf.putImageData(src, 0, 0);
  gf.putImageData(out, 0, 0);
  // accretion glow
  gf.strokeStyle = "rgba(255,255,255,0.5)";
  gf.beginPath();
  gf.arc(mx, my, R, 0, 6.283);
  gf.stroke();
}

function loop(t) {
  if (prefersReducedMotion) {
    drawBG(0);
    distort();
    return;
  }
  animationId = requestAnimationFrame(loop);
  drawBG(t);
  distort();
}

if (!prefersReducedMotion) {
  loop(0);
} else {
  drawBG(0);
  distort();
}

