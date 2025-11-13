const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const particleCountInput = document.getElementById("particleCount");
const connectionDistanceInput = document.getElementById("connectionDistance");
const speedInput = document.getElementById("speed");

let width = 0;
let height = 0;
let particles = [];
let particleCount = 50;
let connectionDistance = 120;
let speed = 0.8;

function resize() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  canvas.width = width;
  canvas.height = height;
  initParticles();
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      hue: (i * 360) / particleCount,
    });
  }
}

function updateParticles() {
  particles.forEach((p) => {
    p.x += p.vx * speed;
    p.y += p.vy * speed;

    // Bounce off edges
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    // Keep in bounds
    p.x = Math.max(0, Math.min(width, p.x));
    p.y = Math.max(0, Math.min(height, p.y));
  });
}

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < connectionDistance) {
        const opacity = 1 - dist / connectionDistance;
        const hue = (p1.hue + p2.hue) / 2;
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }
}

function drawParticles() {
  particles.forEach((p) => {
    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 4);
    gradient.addColorStop(0, `hsla(${p.hue}, 100%, 70%, 1)`);
    gradient.addColorStop(1, `hsla(${p.hue}, 100%, 70%, 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function animate() {
  ctx.fillStyle = "rgba(14, 14, 33, 0.1)";
  ctx.fillRect(0, 0, width, height);

  updateParticles();
  drawConnections();
  drawParticles();

  requestAnimationFrame(animate);
}

particleCountInput.addEventListener("input", (e) => {
  particleCount = parseInt(e.target.value, 10);
  initParticles();
});

connectionDistanceInput.addEventListener("input", (e) => {
  connectionDistance = parseInt(e.target.value, 10);
});

speedInput.addEventListener("input", (e) => {
  speed = parseFloat(e.target.value);
  particles.forEach((p) => {
    p.vx = (Math.random() - 0.5) * speed;
    p.vy = (Math.random() - 0.5) * speed;
  });
});

window.addEventListener("resize", resize);
resize();
animate();
