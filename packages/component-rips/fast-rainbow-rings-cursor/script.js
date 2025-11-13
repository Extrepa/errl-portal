const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const toggleButton = document.getElementById("toggleReverse");

function fit() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
fit();
window.addEventListener("resize", fit);

let mx = window.innerWidth / 2;
let my = window.innerHeight / 2;
let frames = [];
let reversed = false;

window.addEventListener("pointermove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  drop(mx, my);
});

function drop(x, y) {
  frames.push({ x, y, t: performance.now() });
  if (frames.length > 900) frames.shift();
}

function toggleReverse() {
  reversed = !reversed;
  toggleButton.textContent = reversed ? "Forward" : "Reverse";
}

toggleButton.addEventListener("click", toggleReverse);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggleReverse();
  }
});

function loop() {
  requestAnimationFrame(loop);
  ctx.fillStyle = "rgba(4, 4, 10, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const now = performance.now();
  for (let i = 0; i < frames.length; i++) {
    const f = reversed ? frames[frames.length - 1 - i] : frames[i];
    const age = (now - f.t) / 1000;
    const r = 6 + age * 160;
    const a = Math.max(0, 0.8 - age * 0.6);
    const hue = ((f.t / 15 + age * 60) % 360);
    ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${a})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}

loop();
