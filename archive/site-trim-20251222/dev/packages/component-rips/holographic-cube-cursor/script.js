const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const sizeInput = document.getElementById("size");
const rotationSpeedInput = document.getElementById("rotationSpeed");
const trailLengthInput = document.getElementById("trailLength");

let width = 0;
let height = 0;
let mouseX = 0;
let mouseY = 0;
let rotationX = 0;
let rotationY = 0;
let rotationZ = 0;
let cubeSize = 25;
let rotationSpeed = 2;
let trailLength = 15;
const trail = [];

function resize() {
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  canvas.width = width;
  canvas.height = height;
}

function project3D(x, y, z) {
  const scale = 200 / (200 + z);
  return {
      x: x * scale + width / 2,
      y: y * scale + height / 2,
      scale: scale
  };
}

function rotatePoint(x, y, z, rx, ry, rz) {
  // Rotate around X axis
  let [x1, y1, z1] = [x, y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
  // Rotate around Y axis
  let [x2, y2, z2] = [x1 * Math.cos(ry) + z1 * Math.sin(ry), y1, -x1 * Math.sin(ry) + z1 * Math.cos(ry)];
  // Rotate around Z axis
  return [
      x2 * Math.cos(rz) - y2 * Math.sin(rz),
      x2 * Math.sin(rz) + y2 * Math.cos(rz),
      z2
  ];
}

function drawCube(x, y, size, rotation, opacity) {
  const s = size / 2;
  const vertices = [
      [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
      [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
  ];

  const [rx, ry, rz] = rotation;
  const rotated = vertices.map(v => {
      const [px, py, pz] = rotatePoint(v[0], v[1], v[2], rx, ry, rz);
      return project3D(px + x - width / 2, py + y - height / 2, pz);
  });

  const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
  ];

  const hue = (performance.now() / 20 + x * 0.1 + y * 0.1) % 360;
  ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
  ctx.lineWidth = 2;

  edges.forEach(([a, b]) => {
      const p1 = rotated[a];
      const p2 = rotated[b];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
  });

  // Draw faces with gradient
  const faces = [
      [0, 1, 2, 3], [4, 7, 6, 5],
      [0, 4, 5, 1], [2, 6, 7, 3],
      [0, 3, 7, 4], [1, 5, 6, 2]
  ];

  faces.forEach((face, i) => {
      const points = face.map(idx => rotated[idx]);
      const gradient = ctx.createLinearGradient(
          points[0].x, points[0].y,
          points[2].x, points[2].y
      );
      const faceHue = (hue + i * 60) % 360;
      gradient.addColorStop(0, `hsla(${faceHue}, 100%, 50%, ${opacity * 0.2})`);
      gradient.addColorStop(1, `hsla(${faceHue + 60}, 100%, 50%, ${opacity * 0.1})`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.fill();
  });
}

window.addEventListener("pointermove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  trail.push({ x: mouseX, y: mouseY, t: performance.now() });
  if (trail.length > trailLength) trail.shift();
});

sizeInput.addEventListener("input", (e) => {
  cubeSize = parseInt(e.target.value, 10);
});

rotationSpeedInput.addEventListener("input", (e) => {
  rotationSpeed = parseFloat(e.target.value);
});

trailLengthInput.addEventListener("input", (e) => {
  trailLength = parseInt(e.target.value, 10);
  while (trail.length > trailLength) trail.shift();
});

function animate() {
  ctx.fillStyle = "rgba(11, 15, 20, 0.1)";
  ctx.fillRect(0, 0, width, height);

  rotationX += rotationSpeed * 0.01;
  rotationY += rotationSpeed * 0.01;
  rotationZ += rotationSpeed * 0.005;

  const now = performance.now();
  trail.forEach((point, i) => {
      const age = (now - point.t) / 1000;
      const opacity = Math.max(0, 1 - age * 2);
      const size = cubeSize * (1 - age * 0.5);
      if (opacity > 0 && size > 0) {
          drawCube(
              point.x,
              point.y,
              size,
              [rotationX + age, rotationY + age, rotationZ + age],
              opacity
          );
      }
  });

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
animate();
