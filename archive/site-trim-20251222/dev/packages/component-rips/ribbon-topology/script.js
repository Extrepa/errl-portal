const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const viewport = document.getElementById("viewport");
const overlay = document.getElementById("overlay");

const ribbonCountInput = document.getElementById("ribbonCount");
const strokeWidthInput = document.getElementById("strokeWidth");
const fadeInput = document.getElementById("fade");
const speedInput = document.getElementById("speed");
const colorShiftInput = document.getElementById("colorShift");
const shuffleButton = document.getElementById("shuffle");

const ribbons = [];
const settings = {
  count: parseInt(ribbonCountInput.value, 10),
  strokeWidth: parseInt(strokeWidthInput.value, 10),
  fade: parseFloat(fadeInput.value),
  speed: parseFloat(speedInput.value),
  colorShift: parseInt(colorShiftInput.value, 10),
};

let animationId = null;
let dpr = 1;
let width = 0;
let height = 0;

function resize() {
  const rect = viewport.getBoundingClientRect();
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  width = rect.width;
  height = rect.height;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
}

function resetRibbons() {
  ribbons.length = 0;
  for (let i = 0; i < settings.count; i += 1) {
    ribbons.push({
      offset: Math.random() * Math.PI * 2,
      hue: (i * settings.colorShift) % 360,
      angularVelocity: 0.6 + Math.random() * 0.3,
      radiusFactor: 0.7 + Math.random() * 0.2,
    });
  }
}

function shuffleRibbons() {
  ribbons.forEach((ribbon, index) => {
    ribbon.offset = Math.random() * Math.PI * 2;
    ribbon.hue = (index * settings.colorShift + Math.random() * 40) % 360;
  });
}

function applyColorShift() {
  ribbons.forEach((ribbon, index) => {
    ribbon.hue = (index * settings.colorShift) % 360;
  });
}

function computePath(time, ribbon) {
  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) * 0.36 * ribbon.radiusFactor;

  const t1 = time * ribbon.angularVelocity + ribbon.offset;
  const t2 = t1 + 1.1;
  const t3 = t1 + 2.2;

  const x1 = cx + Math.cos(t1) * baseRadius * 1.2;
  const y1 = cy + Math.sin(t1 * 1.3) * baseRadius * 0.7;

  const cx1 = cx + Math.cos(t2) * baseRadius * (1 + Math.sin(time + ribbon.offset) * 0.08);
  const cy1 = cy + Math.sin(t2 * 1.1) * baseRadius * 0.8;

  const x2 = cx + Math.cos(t3) * baseRadius * 1.2;
  const y2 = cy + Math.sin(t3 * 1.3) * baseRadius * 0.7;

  return { x1, y1, cx1, cy1, x2, y2 };
}

function drawFrame(timestamp) {
  const t = (timestamp || 0) * 0.001 * settings.speed;

  ctx.fillStyle = `rgba(6, 6, 12, ${1 - settings.fade})`;
  ctx.fillRect(0, 0, width, height);

  const segments = ribbons.map((ribbon) => {
    const path = computePath(t, ribbon);
    const midpoint = (path.y1 + path.y2) * 0.5;
    return { ribbon, path, midpoint };
  });

  segments.sort((a, b) => a.midpoint - b.midpoint);

  segments.forEach(({ ribbon, path }, order) => {
    const hue = (ribbon.hue + order * settings.colorShift + t * 20) % 360;
    ctx.lineWidth = settings.strokeWidth;
    ctx.strokeStyle = `hsla(${hue}, 100%, 65%, 0.9)`;
    ctx.beginPath();
    ctx.moveTo(path.x1, path.y1);
    ctx.quadraticCurveTo(path.cx1, path.cy1, path.x2, path.y2);
    ctx.stroke();

    ctx.lineWidth = Math.max(2, settings.strokeWidth * 0.45);
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.stroke();
  });
}

function render(time) {
  drawFrame(time);
  animationId = requestAnimationFrame(render);
}

function startAnimation() {
  if (animationId == null) {
    animationId = requestAnimationFrame(render);
  }
}

function stopAnimation() {
  if (animationId != null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

ribbonCountInput.addEventListener("input", (event) => {
  settings.count = parseInt(event.target.value, 10);
  resetRibbons();
});

strokeWidthInput.addEventListener("input", (event) => {
  settings.strokeWidth = parseInt(event.target.value, 10);
});

fadeInput.addEventListener("input", (event) => {
  settings.fade = parseFloat(event.target.value);
});

speedInput.addEventListener("input", (event) => {
  settings.speed = parseFloat(event.target.value);
});

colorShiftInput.addEventListener("input", (event) => {
  settings.colorShift = parseInt(event.target.value, 10);
  applyColorShift();
});

shuffleButton.addEventListener("click", () => {
  shuffleRibbons();
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyMotionPreference() {
  const reduce = prefersReducedMotion.matches;
  if (reduce) {
    overlay.textContent = "Animation paused (reduced motion enabled).";
    stopAnimation();
    ctx.clearRect(0, 0, width, height);
  } else {
    overlay.textContent = "Interweaving ribbons with faux depth.";
    startAnimation();
  }
}

prefersReducedMotion.addEventListener?.("change", applyMotionPreference) ??
  prefersReducedMotion.addListener?.(applyMotionPreference);

window.addEventListener("resize", () => {
  resize();
});

resize();
resetRibbons();
applyMotionPreference();
