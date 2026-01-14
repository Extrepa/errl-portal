const canvas = document.getElementById("canvas");
const back = document.getElementById("back");
const ga = canvas.getContext("2d");
const gb = back.getContext("2d");
const glwInput = document.getElementById("glw");
const dyeInput = document.getElementById("dye");

function fit() {
  [canvas, back].forEach((x) => {
    x.width = innerWidth;
    x.height = innerHeight;
  });
}
fit();
addEventListener("resize", fit);

let mx = innerWidth / 2;
let my = innerHeight / 2;
let down = false;

addEventListener("pointerdown", (e) => {
  down = true;
  mx = e.clientX;
  my = e.clientY;
});
addEventListener("pointerup", () => (down = false));
addEventListener("pointermove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  if (down) splat(mx, my);
});

function splat(x, y) {
  const g = ga;
  const r = 12 + Math.random() * 18;
  const h = (performance.now() / 30) % 360;
  g.globalCompositeOperation = "lighter";
  const grad = g.createRadialGradient(x, y, 0, x, y, r * 3);
  grad.addColorStop(0, `hsla(${h},100%,60%,0.8)`);
  grad.addColorStop(1, `hsla(${(h + 90) % 360},100%,50%,0)`);
  g.fillStyle = grad;
  g.beginPath();
  g.arc(x, y, r * 3, 0, 6.283);
  g.fill();
}

function loop() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    ga.clearRect(0, 0, canvas.width, canvas.height);
    gb.clearRect(0, 0, back.width, back.height);
    return;
  }

  requestAnimationFrame(loop);
  const glow = parseFloat(glwInput.value);
  const dyeV = parseFloat(dyeInput.value);
  // fade back buffer slightly
  gb.globalAlpha = 0.9;
  gb.globalCompositeOperation = "source-over";
  gb.drawImage(back, 0, 0);
  // blur-ish by drawing scaled
  gb.globalAlpha = 0.3 + glow * 0.4;
  gb.drawImage(canvas, 0, 0);
  // clear front
  ga.clearRect(0, 0, canvas.width, canvas.height);
  // show back buffer to screen
  ga.globalCompositeOperation = "source-over";
  ga.globalAlpha = 1.0;
  ga.drawImage(back, 0, 0);
  // auto splats
  if (Math.random() < 0.06 * dyeV) {
    splat(Math.random() * innerWidth, Math.random() * innerHeight);
  }
}

loop();

