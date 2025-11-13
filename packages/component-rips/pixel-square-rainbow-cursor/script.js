const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const countInput = document.getElementById("count");
const sizeInput = document.getElementById("size");
const decayInput = document.getElementById("decay");

let w, h, dpr;

function resize() {
  dpr = devicePixelRatio || 1;
  w = canvas.width = Math.floor(innerWidth * dpr);
  h = canvas.height = Math.floor(innerHeight * dpr);
}
addEventListener("resize", resize);
resize();

const cfg = { count: 20, size: 8, decay: 0.92, hueBase: 0 };
countInput.addEventListener("input", (e) => (cfg.count = +e.target.value));
sizeInput.addEventListener("input", (e) => (cfg.size = +e.target.value));
decayInput.addEventListener("input", (e) => (cfg.decay = +e.target.value));

const squares = [];
let mx = w / 2;
let my = h / 2;

addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) * dpr;
  my = (e.clientY - r.top) * dpr;
});

function step() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, w, h);
    const s = cfg.size * dpr;
    const hue = cfg.hueBase;
    ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
    ctx.fillRect(Math.floor(mx - s / 2), Math.floor(my - s / 2), s, s);
    return;
  }

  requestAnimationFrame(step);

  // Fade background
  ctx.fillStyle = `rgba(0,0,0,${1 - cfg.decay})`;
  ctx.fillRect(0, 0, w, h);

  // Add new square at cursor
  squares.push({
    x: mx,
    y: my,
    hue: cfg.hueBase,
    life: 1,
  });

  // Update and draw squares
  for (let i = squares.length - 1; i >= 0; i--) {
    const sq = squares[i];
    sq.life *= cfg.decay;
    sq.hue = (sq.hue + 2) % 360;

    if (sq.life <= 0.01) {
      squares.splice(i, 1);
      continue;
    }

    const s = cfg.size * dpr * sq.life;
    const alpha = sq.life;
    ctx.fillStyle = `hsla(${sq.hue}, 100%, 60%, ${alpha})`;
    ctx.fillRect(
      Math.floor(sq.x - s / 2),
      Math.floor(sq.y - s / 2),
      Math.floor(s),
      Math.floor(s)
    );
  }

  // Limit square count
  while (squares.length > cfg.count) {
    squares.shift();
  }
}

step();

