const button = document.getElementById("button");
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d", { alpha: true });
const playground = button.closest(".playground");

let w, h, dpr;

function resize() {
  dpr = devicePixelRatio || 1;
  const rect = playground.getBoundingClientRect();
  w = canvas.width = Math.floor(rect.width * dpr);
  h = canvas.height = Math.floor(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
new ResizeObserver(resize).observe(playground);

const confetti = [];

function createConfetti(x, y) {
  const count = 30;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
    const speed = 2 + Math.random() * 4;
    const hue = (Math.random() * 360) % 360;
    confetti.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 4 + Math.random() * 6,
      hue,
      life: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }
}

let isHovering = false;
let hoverTimeout = null;

button.addEventListener("mouseenter", () => {
  isHovering = true;
  if (hoverTimeout) clearTimeout(hoverTimeout);
  const rect = button.getBoundingClientRect();
  const playgroundRect = playground.getBoundingClientRect();
  const x = rect.left + rect.width / 2 - playgroundRect.left;
  const y = rect.top + rect.height / 2 - playgroundRect.top;
  createConfetti(x, y);
});

button.addEventListener("mouseleave", () => {
  isHovering = false;
});

function step() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ctx.clearRect(0, 0, w / dpr, h / dpr);
    return;
  }

  requestAnimationFrame(step);

  // Fade background
  ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
  ctx.fillRect(0, 0, w / dpr, h / dpr);

  // Update and draw confetti
  for (let i = confetti.length - 1; i >= 0; i--) {
    const c = confetti[i];
    c.x += c.vx;
    c.y += c.vy;
    c.vy += 0.3; // gravity
    c.vx *= 0.98; // air resistance
    c.rotation += c.rotationSpeed;
    c.life -= 0.02;

    if (c.life <= 0 || c.y > h / dpr + 20) {
      confetti.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rotation);
    ctx.fillStyle = `hsla(${c.hue}, 100%, 60%, ${c.life})`;
    ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size);
    ctx.restore();
  }

  // Continuous confetti while hovering
  if (isHovering && Math.random() < 0.1) {
    const rect = button.getBoundingClientRect();
    const playgroundRect = playground.getBoundingClientRect();
    const x =
      rect.left +
      rect.width / 2 -
      playgroundRect.left +
      (Math.random() - 0.5) * 40;
    const y =
      rect.top +
      rect.height / 2 -
      playgroundRect.top +
      (Math.random() - 0.5) * 40;
    createConfetti(x, y);
  }
}

step();

