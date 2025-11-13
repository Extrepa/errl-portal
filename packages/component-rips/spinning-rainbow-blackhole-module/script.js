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
let strength = 10;

addEventListener("pointermove", (e) => {
  mx = e.clientX;
  my = e.clientY;
});
addEventListener("wheel", (e) => {
  strength = Math.max(0, Math.min(40, strength + Math.sign(e.deltaY)));
  e.preventDefault();
});

function drawBG(t) {
  const cx = innerWidth / 2;
  const cy = innerHeight / 2;
  gb.clearRect(0, 0, bg.width, bg.height);
  for (let i = 0; i < 220; i++) {
    const r = 40 + i * 3;
    const a = t / 1400 + i * 0.09;
    gb.strokeStyle = `hsla(${(i * 2 + t / 20) % 360},100%,50%,0.5)`;
    gb.beginPath();
    gb.arc(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20, r * 0.35, 0, 6.283);
    gb.stroke();
  }
}

function drawRefraction() {
  // build a tiny height field (circular lens) and displace bg onto fx
  const w = fx.width;
  const h = fx.height;
  const img = gb.getImageData(0, 0, w, h);
  const out = gf.createImageData(w, h);
  const r = 120;
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const dx = x;
      const dy = y;
      const d2 = dx * dx + dy * dy;
      if (d2 > r * r) continue;
      const d = Math.sqrt(d2) / r; // 0..1
      const n = 1 - d * d; // lens profile
      const sx = Math.max(0, Math.min(w - 1, Math.round(mx + dx + dx * n * strength * 0.02)));
      const sy = Math.max(0, Math.min(h - 1, Math.round(my + dy + dy * n * strength * 0.02)));
      const si = (sy * w + sx) * 4;
      const di = ((my + dy) | 0) * w * 4 + ((mx + dx) | 0) * 4;
      if (di >= 0 && di < out.data.length) {
        out.data[di] = img.data[si];
        out.data[di + 1] = img.data[si + 1];
        out.data[di + 2] = img.data[si + 2];
        out.data[di + 3] = 255;
      }
    }
  }
  gf.clearRect(0, 0, w, h);
  gf.putImageData(img, 0, 0); // base
  gf.putImageData(out, 0, 0); // refracted lens overlay
  // subtle highlight
  gf.strokeStyle = "rgba(255,255,255,0.4)";
  gf.beginPath();
  gf.arc(mx, my, 120, 0, 6.283);
  gf.stroke();
}

function loop(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    drawBG(t);
    drawRefraction();
    return;
  }

  requestAnimationFrame(loop);
  drawBG(t);
  drawRefraction();
}

loop(0);

