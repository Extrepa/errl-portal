const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function fit() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
fit();
addEventListener("resize", fit);

let dir = 0;
addEventListener("pointermove", (e) => {
  if (e.movementX !== undefined && e.movementY !== undefined) {
    dir = Math.atan2(e.movementY, e.movementX);
  }
});

function hash(x, y) {
  return (Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
}

function velvet(x, y, ang) {
  // oriented noise by sampling along angle
  let s = 0;
  const n = 7;
  for (let i = 0; i < n; i++) {
    const t = (i / n - 0.5) * 8;
    s += hash(
      Math.floor((x + Math.cos(ang) * t) / 8),
      Math.floor((y + Math.sin(ang) * t) / 8)
    );
  }
  return s / n;
}

function hslToRgb(h, s, l) {
  const a = h / 60;
  const C = (1 - Math.abs((2 * l) / 100 - 1)) * 0.9;
  const X = C * (1 - Math.abs((a % 2) - 1));
  const m = l / 100 - C / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (0 <= a && a < 1) {
    r = C;
    g = X;
  } else if (1 <= a && a < 2) {
    r = X;
    g = C;
  } else if (2 <= a && a < 3) {
    g = C;
    b = X;
  } else if (3 <= a && a < 4) {
    g = X;
    b = C;
  } else if (4 <= a && a < 5) {
    r = X;
    b = C;
  } else {
    r = C;
    b = X;
  }
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

(function loop(t) {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    requestAnimationFrame(loop);
  }
  const img = ctx.createImageData(canvas.width, canvas.height);
  const ang = dir + Math.sin(t / 1200) * 0.3;
  let i = 0;
  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const v = velvet(x, y, ang);
      const h = (200 + v * 160 + (y / canvas.height) * 40) % 360;
      const l = 25 + v * 35;
      const [r, g, b] = hslToRgb(h, 90, l);
      for (let dy = 0; dy < 2; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
          img.data[idx] = r;
          img.data[idx + 1] = g;
          img.data[idx + 2] = b;
          img.data[idx + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Single frame for reduced motion
    return;
  }
})(0);

