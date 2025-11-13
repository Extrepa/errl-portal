const c = document.getElementById("c");
const g = c.getContext("2d");

function fit() {
  c.width = innerWidth;
  c.height = innerHeight;
}
fit();
addEventListener("resize", fit);

let speed = 0.004;
addEventListener("keydown", (e) => {
  if (e.key === "a") speed -= 0.001;
  if (e.key === "d") speed += 0.001;
  speed = Math.max(0, Math.min(0.02, speed));
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let animationId = null;

function draw(t) {
  if (prefersReducedMotion) {
    g.fillStyle = "rgba(9,9,14,0.2)";
    g.fillRect(0, 0, c.width, c.height);
    g.save();
    g.translate(c.width / 2, c.height / 2);
    const N = 120;
    const R = Math.min(c.width, c.height) * 0.45;
    for (let i = 0; i < N; i++) {
      const ang = 0;
      const x = Math.cos(ang) * R;
      const y = Math.sin(ang * 1.3) * R * 0.6;
      g.strokeStyle = `hsla(${(i * 3) % 360},100%,65%,0.6)`;
      g.beginPath();
      for (let j = -R; j <= R; j += 6) {
        const u = j / R;
        const px = x + u * R;
        const py = y + Math.sin(ang + u * 6) * 20;
        if (j === -R) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();
    }
    g.restore();
    return;
  }
  animationId = requestAnimationFrame(draw);
  g.fillStyle = "rgba(9,9,14,0.2)";
  g.fillRect(0, 0, c.width, c.height);
  g.save();
  g.translate(c.width / 2, c.height / 2);
  const N = 120;
  const R = Math.min(c.width, c.height) * 0.45;
  for (let i = 0; i < N; i++) {
    const ang = t * speed * (i * 0.7 + 1);
    const x = Math.cos(ang) * R;
    const y = Math.sin(ang * 1.3) * R * 0.6;
    g.strokeStyle = `hsla(${(i * 3 + t / 20) % 360},100%,65%,0.6)`;
    g.beginPath();
    for (let j = -R; j <= R; j += 6) {
      const u = j / R;
      const px = x + u * R;
      const py = y + Math.sin(ang + u * 6) * 20;
      if (j === -R) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.stroke();
  }
  g.restore();
}

if (!prefersReducedMotion) {
  draw(0);
} else {
  draw(0);
}

