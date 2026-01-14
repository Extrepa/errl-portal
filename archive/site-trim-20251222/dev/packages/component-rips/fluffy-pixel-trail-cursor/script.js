const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const rateInput = document.getElementById("rate");
const decayInput = document.getElementById("decay");
const pxInput = document.getElementById("px");

let w, h, dpr;

function resize() {
  dpr = devicePixelRatio || 1;
  w = canvas.width = Math.floor(innerWidth * dpr);
  h = canvas.height = Math.floor(innerHeight * dpr);
}
addEventListener("resize", resize);
resize();

const cfg = { rate: 18, decay: 0.06, px: 6, hue: 260 };
rateInput.addEventListener("input", (e) => (cfg.rate = +e.target.value));
decayInput.addEventListener("input", (e) => (cfg.decay = +e.target.value));
pxInput.addEventListener("input", (e) => (cfg.px = +e.target.value));

let mx = w / 2;
let my = h / 2;
addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) * dpr;
  my = (e.clientY - r.top) * dpr;
});

const parts = [];
function spawn(x, y) {
  for (let i = 0; i < cfg.rate; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 0.5 + Math.random() * 2.0;
    parts.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 1,
      hue: (cfg.hue + Math.random() * 80) % 360,
    });
  }
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function tick() {
  ctx.fillStyle = `rgba(0,0,0,${cfg.decay})`;
  ctx.fillRect(0, 0, w, h);

  if (!reducedMotion) {
    spawn(mx, my);

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.life -= 0.016;
      if (p.life <= 0 || p.x < 0 || p.y < 0 || p.x > w || p.y > h) {
        parts.splice(i, 1);
        continue;
      }

      ctx.fillStyle = `hsl(${p.hue} 90% 60% / ${p.life})`;
      const s = cfg.px * dpr;
      ctx.fillRect(p.x | 0, p.y | 0, s, s);
    }
  }

  if (!reducedMotion) {
    requestAnimationFrame(tick);
  }
}

// Respect reduced motion preference
if (!reducedMotion) {
  requestAnimationFrame(tick);
}

