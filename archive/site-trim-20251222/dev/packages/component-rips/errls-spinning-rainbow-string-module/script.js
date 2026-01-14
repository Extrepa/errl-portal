const c = document.getElementById("c");
const g = c.getContext("2d");

function fit() {
  c.width = innerWidth;
  c.height = innerHeight;
}
fit();
addEventListener("resize", fit);

let seed = 1;
addEventListener("keydown", (e) => {
  seed = (seed * 1664525 + e.key.charCodeAt(0)) % 4294967296;
});

function R() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let animationId = null;

function loop(t) {
  if (prefersReducedMotion) {
    g.fillStyle = "rgba(5,5,11,0.22)";
    g.fillRect(0, 0, c.width, c.height);
    g.save();
    g.translate(c.width / 2, c.height / 2);
    const N = 48;
    const layers = 10;
    for (let L = 0; L < layers; L++) {
      const r = 30 + L * 26;
      for (let i = 0; i < N; i++) {
        const a = (i * (Math.PI * 2)) / N;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        const hue = (R() * 360 + L * 12) % 360;
        g.fillStyle = `hsla(${hue},100%,65%,0.75)`;
        const s = 2 + R() * 3;
        g.beginPath();
        g.arc(x, y, s, 0, 6.283);
        g.fill();
        // connective filaments
        if (i % 3 === 0) {
          g.strokeStyle = `hsla(${(hue + 120) % 360},100%,60%,0.4)`;
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(Math.cos(a + 0.5) * r * 0.8, Math.sin(a + 0.5) * r * 0.8);
          g.stroke();
        }
      }
    }
    g.restore();
    return;
  }
  animationId = requestAnimationFrame(loop);
  g.fillStyle = "rgba(5,5,11,0.22)";
  g.fillRect(0, 0, c.width, c.height);
  g.save();
  g.translate(c.width / 2, c.height / 2);
  const N = 48;
  const layers = 10;
  for (let L = 0; L < layers; L++) {
    const r = 30 + L * 26 + Math.sin(t / 900 + L) * 8;
    for (let i = 0; i < N; i++) {
      const a = (i * (Math.PI * 2)) / N + Math.sin(t / 1200 + L) * 0.6 * R();
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      const hue = (R() * 360 + t / 30 + L * 12) % 360;
      g.fillStyle = `hsla(${hue},100%,65%,0.75)`;
      const s = 2 + R() * 3 + Math.sin(t / 500 + i + L) * 1.5;
      g.beginPath();
      g.arc(x, y, s, 0, 6.283);
      g.fill();
      // connective filaments
      if (i % 3 === 0) {
        g.strokeStyle = `hsla(${(hue + 120) % 360},100%,60%,0.4)`;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(Math.cos(a + 0.5) * r * 0.8, Math.sin(a + 0.5) * r * 0.8);
        g.stroke();
      }
    }
  }
  g.restore();
}

if (!prefersReducedMotion) {
  loop(0);
} else {
  loop(0);
}

