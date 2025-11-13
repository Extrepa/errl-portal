const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");

const DPR = Math.min(window.devicePixelRatio || 1, 1.8);
let width = 0;
let height = 0;

const settings = {
  nodeCount: 90,
  radius: parseFloat(document.getElementById("radius").value),
  frequency: parseFloat(document.getElementById("frequency").value),
  gravity: document.getElementById("gravity").checked,
  pointer: { active: false, x: 0, y: 0 },
};

const nodes = [];
const sparks = [];

const palette = ["#64ffda", "#ff6ec7", "#7b61ff", "#ffe66d", "#63f5ff"];

function hexToRgba(hex, alpha) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  width = Math.floor(rect.width * DPR);
  height = Math.floor(rect.height * DPR);
  canvas.width = width;
  canvas.height = height;
  ctx.scale(DPR, DPR);
}

function spawnNodes() {
  nodes.length = 0;
  for (let i = 0; i < settings.nodeCount; i++) {
    nodes.push({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      hue: palette[i % palette.length],
    });
  }
}

function spawnSpark(x, y, color) {
  sparks.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    life: 1,
    decay: 0.02 + Math.random() * 0.03,
    hue: color,
  });
}

function updateNodes() {
  const centerX = canvas.clientWidth / 2;
  const centerY = canvas.clientHeight / 2;
  const pointer = settings.pointer;

  nodes.forEach((node) => {
    if (settings.gravity) {
      node.vx += (centerX - node.x) * 0.0004;
      node.vy += (centerY - node.y) * 0.0004;
    }

    if (pointer.active) {
      const dx = pointer.x - node.x;
      const dy = pointer.y - node.y;
      const dist = Math.hypot(dx, dy) || 1;
      const force = Math.min(120 / dist, 2.4);
      node.vx += (dx / dist) * 0.015 * force;
      node.vy += (dy / dist) * 0.015 * force;
    }

    node.vx *= 0.98;
    node.vy *= 0.98;

    node.x += node.vx;
    node.y += node.vy;

    if (node.x < 0 || node.x > canvas.clientWidth) node.vx *= -1;
    if (node.y < 0 || node.y > canvas.clientHeight) node.vy *= -1;
  });
}

function updateSparks() {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i];
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.life -= spark.decay;
    spark.vx *= 0.97;
    spark.vy *= 0.97;
    if (spark.life <= 0) sparks.splice(i, 1);
  }
}

function drawConnections() {
  ctx.lineWidth = 1.2;
  const radius = settings.radius;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const opacity = 1 - dist / radius;
        const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        gradient.addColorStop(0, hexToRgba(a.hue, Math.min(1, opacity + 0.1)));
        gradient.addColorStop(1, hexToRgba(b.hue, Math.min(1, opacity + 0.1)));
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = opacity * 0.9;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (Math.random() < settings.frequency * 0.01) {
          const midX = (a.x + b.x) / 2;
          const midY = (a.y + b.y) / 2;
          spawnSpark(midX, midY, Math.random() > 0.5 ? a.hue : b.hue);
        }
      }
    }
  }
}

function drawNodes() {
  nodes.forEach((node) => {
    const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 14);
    gradient.addColorStop(0, node.hue);
    gradient.addColorStop(1, "rgba(8,12,22,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 9, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSparks() {
  sparks.forEach((spark) => {
    const alpha = Math.max(spark.life, 0);
    ctx.fillStyle = spark.hue;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, 6 * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function render() {
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(8, 12, 22, 0.35)";
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  ctx.globalCompositeOperation = "lighter";
  drawConnections();
  drawNodes();
  drawSparks();
}

function loop() {
  updateNodes();
  updateSparks();
  render();
  requestAnimationFrame(loop);
}

function handlePointer(event) {
  const rect = canvas.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const clientY = event.touches ? event.touches[0].clientY : event.clientY;
  settings.pointer = {
    active: true,
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

canvas.addEventListener("pointerdown", handlePointer);
canvas.addEventListener("pointermove", handlePointer);
canvas.addEventListener("pointerleave", () => (settings.pointer.active = false));
window.addEventListener("pointerup", () => (settings.pointer.active = false));

canvas.addEventListener(
  "touchstart",
  (event) => {
    handlePointer(event);
  },
  { passive: true }
);
canvas.addEventListener(
  "touchmove",
  (event) => {
    handlePointer(event);
  },
  { passive: true }
);
window.addEventListener(
  "touchend",
  () => {
    settings.pointer.active = false;
  },
  { passive: true }
);

document.getElementById("frequency").addEventListener("input", (event) => {
  settings.frequency = parseFloat(event.target.value);
});
document.getElementById("radius").addEventListener("input", (event) => {
  settings.radius = parseFloat(event.target.value);
});
document.getElementById("gravity").addEventListener("change", (event) => {
  settings.gravity = event.target.checked;
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    nodes.forEach((node) => {
      node.vx += (Math.random() - 0.5) * 6;
      node.vy += (Math.random() - 0.5) * 6;
    });
  }
});

window.addEventListener("resize", () => {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  resize();
});

resize();
spawnNodes();
loop();
