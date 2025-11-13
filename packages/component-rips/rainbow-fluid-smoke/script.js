const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const playground = document.getElementById("playground");
const motionWarning = document.getElementById("motionWarning");

const trailLengthInput = document.getElementById("trailLength");
const trailDragInput = document.getElementById("trailDrag");
const glowInput = document.getElementById("glow");
const colorCycleInput = document.getElementById("colorCycle");
const clearButton = document.getElementById("clear");

const settings = {
  trailLength: parseInt(trailLengthInput.value, 10),
  drag: parseFloat(trailDragInput.value),
  glow: parseInt(glowInput.value, 10),
  colorCycle: parseInt(colorCycleInput.value, 10),
};

const nodes = [];
let hueCursor = Math.random() * 360;
let animationId = null;
let dpr = 1;

const pointer = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
};
const emitter = { ...pointer };
let tick = 0;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function handlePointer(event) {
  pointer.x = event.clientX;
  pointer.y = event.clientY;
}

function addNode(x, y) {
  hueCursor = (hueCursor + settings.colorCycle / settings.trailLength) % 360;
  nodes.push({
    x,
    y,
    life: 1,
    hue: hueCursor,
  });

  if (nodes.length > settings.trailLength) {
    nodes.splice(0, nodes.length - settings.trailLength);
  }
}

function step() {
  tick += 1;

  emitter.x += (pointer.x - emitter.x) * 0.18;
  emitter.y += (pointer.y - emitter.y) * 0.18;

  const wobble = settings.glow * 0.2;
  addNode(
    emitter.x + Math.cos(tick * 0.12) * wobble,
    emitter.y + Math.sin(tick * 0.09) * wobble
  );

  ctx.fillStyle = `rgba(6, 9, 16, ${1 - settings.drag})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "lighter";

  for (let i = nodes.length - 1; i >= 0; i -= 1) {
    const node = nodes[i];
    const life = node.life;
    const baseRadius = settings.glow * (0.6 + (i / settings.trailLength) * 0.9);
    const gradient = ctx.createRadialGradient(
      node.x,
      node.y,
      0,
      node.x,
      node.y,
      baseRadius * 4
    );

    gradient.addColorStop(0, `hsla(${node.hue}, 85%, 65%, ${0.85 * life})`);
    gradient.addColorStop(1, `hsla(${(node.hue + 40) % 360}, 85%, 45%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, baseRadius * 1.6, 0, Math.PI * 2);
    ctx.fill();

    node.life *= settings.drag;
    if (node.life < 0.015) {
      nodes.splice(i, 1);
    }
  }

  ctx.globalCompositeOperation = "source-over";
}

function loop() {
  step();
  animationId = requestAnimationFrame(loop);
}

function startLoop() {
  if (animationId === null) {
    loop();
  }
}

function stopLoop() {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function updateSetting(key, value) {
  settings[key] = value;
  if (key === "trailLength" && nodes.length > settings.trailLength) {
    nodes.splice(0, nodes.length - settings.trailLength);
  }
}

trailLengthInput.addEventListener("input", (event) => {
  updateSetting("trailLength", parseInt(event.target.value, 10));
});

trailDragInput.addEventListener("input", (event) => {
  updateSetting("drag", parseFloat(event.target.value));
});

glowInput.addEventListener("input", (event) => {
  updateSetting("glow", parseInt(event.target.value, 10));
});

colorCycleInput.addEventListener("input", (event) => {
  updateSetting("colorCycle", parseInt(event.target.value, 10));
});

clearButton.addEventListener("click", () => {
  nodes.length = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyMotionPreference() {
  const reduce = prefersReducedMotion.matches;
  document.body.classList.toggle("reduce-motion", reduce);
  motionWarning.classList.toggle("visible", reduce);

  if (reduce) {
    stopLoop();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  } else {
    startLoop();
  }
}

prefersReducedMotion.addEventListener?.("change", applyMotionPreference) ??
  prefersReducedMotion.addListener?.(applyMotionPreference);

window.addEventListener("pointermove", handlePointer, { passive: true });
window.addEventListener("pointerdown", handlePointer, { passive: true });
window.addEventListener("resize", resize);

playground.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length) {
      handlePointer(event.touches[0]);
    }
  },
  { passive: true }
);
playground.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length) {
      handlePointer(event.touches[0]);
    }
  },
  { passive: true }
);

resize();
applyMotionPreference();
startLoop();
console.warn("[component-rip] rainbow-fluid-smoke: script extraction pending");
