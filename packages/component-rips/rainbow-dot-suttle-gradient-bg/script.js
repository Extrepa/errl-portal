const root = document.getElementById("component-root");
let w, h, dpr;
let time = 0;

function resize() {
  dpr = devicePixelRatio || 1;
  const rect = root.getBoundingClientRect();
  w = rect.width;
  h = rect.height;
}
resize();
new ResizeObserver(resize).observe(root);

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function update() {
  if (reducedMotion) {
    root.style.backgroundImage = `
      radial-gradient(circle at 50% 50%, transparent 1.5px, white 0 8px, transparent 8px),
      radial-gradient(circle at 50% 50%, transparent 1.5px, white 0 8px, transparent 8px),
      radial-gradient(circle at 50% 50%, #f00, transparent 60%),
      radial-gradient(circle at 50% 50%, #ff0, transparent 60%),
      radial-gradient(circle at 50% 50%, #0f0, transparent 60%),
      radial-gradient(ellipse at 50% 50%, #00f, transparent 60%)
    `;
    root.style.backgroundSize = `
      10px 17.32px,
      10px 17.32px,
      200% 200%,
      200% 200%,
      200% 200%,
      200% 17.32px
    `;
    root.style.backgroundPosition = `
      0px 0px,
      5px 8.66px,
      0% 0%,
      0% 0%,
      0% 0%,
      0% 0px
    `;
    return;
  }

  time += 0.01;
  const offset1 = (time * 10) % 20;
  const offset2 = (time * 8) % 20;
  const offset3 = (time * 5) % 360;

  root.style.backgroundImage = `
    radial-gradient(circle at 50% 50%, transparent 1.5px, white 0 8px, transparent 8px),
    radial-gradient(circle at 50% 50%, transparent 1.5px, white 0 8px, transparent 8px),
    radial-gradient(circle at ${50 + Math.sin(time) * 10}% ${50 + Math.cos(time) * 10}%, #f00, transparent 60%),
    radial-gradient(circle at ${50 - Math.sin(time * 1.2) * 10}% ${50 - Math.cos(time * 1.2) * 10}%, #ff0, transparent 60%),
    radial-gradient(circle at ${50 + Math.sin(time * 0.8) * 10}% ${50 + Math.cos(time * 0.8) * 10}%, #0f0, transparent 60%),
    radial-gradient(ellipse at 50% 50%, #00f, transparent 60%)
  `;
  root.style.backgroundSize = `
    10px 17.32px,
    10px 17.32px,
    200% 200%,
    200% 200%,
    200% 200%,
    200% 17.32px
  `;
  root.style.backgroundPosition = `
    ${offset1}px 0px,
    ${offset1 + 5}px 8.66px,
    ${Math.sin(time) * 5}% ${Math.cos(time) * 5}%,
    ${Math.sin(time * 1.2) * 5}% ${Math.cos(time * 1.2) * 5}%,
    ${Math.sin(time * 0.8) * 5}% ${Math.cos(time * 0.8) * 5}%,
    0% ${Math.sin(time * 0.5) * 5}px
  `;
}

function loop() {
  update();
  if (!reducedMotion) {
    requestAnimationFrame(loop);
  }
}
loop();

