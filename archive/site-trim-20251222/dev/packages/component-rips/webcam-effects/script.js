const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const toggleButton = document.getElementById("toggle");
const modeSelect = document.getElementById("mode");
const snapshotButton = document.getElementById("snapshot");
const gallery = document.getElementById("gallery");

let stream = null;
let animationFrame = null;
let glitchNoise = new Uint8ClampedArray(0);

const DPR = Math.min(window.devicePixelRatio || 1, 2);

function sizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * DPR);
  canvas.height = Math.floor(rect.height * DPR);
  context.scale(DPR, DPR);
}

async function startWebcam() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    await video.play();
    video.style.opacity = "1";
    toggleButton.textContent = "Disable Webcam";
    toggleButton.dataset.state = "on";
    tick();
  } catch (error) {
    console.error("Webcam access denied", error);
    stopWebcam();
    toggleButton.textContent = "Enable Webcam";
    toggleButton.dataset.state = "off";
  }
}

function stopWebcam() {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  video.srcObject = null;
  context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  video.style.opacity = "0";
  toggleButton.textContent = "Enable Webcam";
  toggleButton.dataset.state = "off";
}

function applyRgbSplit() {
  const { clientWidth, clientHeight } = canvas;
  context.drawImage(video, 0, 0, clientWidth, clientHeight);
  const frame = context.getImageData(0, 0, clientWidth, clientHeight);
  const output = context.createImageData(frame);

  const offset = 6;
  for (let y = 0; y < clientHeight; y++) {
    for (let x = 0; x < clientWidth; x++) {
      const index = (y * clientWidth + x) * 4;
      const rIndex = (y * clientWidth + Math.max(0, x - offset)) * 4;
      const gIndex = index;
      const bIndex = (y * clientWidth + Math.min(clientWidth - 1, x + offset)) * 4;

      output.data[index] = frame.data[rIndex];
      output.data[index + 1] = frame.data[gIndex + 1];
      output.data[index + 2] = frame.data[bIndex + 2];
      output.data[index + 3] = 255;
    }
  }
  context.putImageData(output, 0, 0);
}

function applyGlitch() {
  const { clientWidth, clientHeight } = canvas;
  context.drawImage(video, 0, 0, clientWidth, clientHeight);

  if (glitchNoise.length !== clientWidth) {
    glitchNoise = new Uint8ClampedArray(clientWidth);
  }

  const imageData = context.getImageData(0, 0, clientWidth, clientHeight);
  for (let y = 0; y < clientHeight; y += 4) {
    const shift = Math.sin((Date.now() / 300 + y) * 0.25) * 12;
    const rowStart = (y * clientWidth) * 4;
    const rowEnd = rowStart + clientWidth * 4;
    glitchNoise.fill(shift);
    const row = imageData.data.slice(rowStart, rowEnd);
    for (let x = 0; x < clientWidth; x++) {
      const src = x * 4;
      const target = Math.min(clientWidth - 1, Math.max(0, Math.floor(x + shift))) * 4;
      row[target] = row[src];
      row[target + 1] = row[src + 1];
      row[target + 2] = row[src + 2];
    }
    imageData.data.set(row, rowStart);
  }

  context.putImageData(imageData, 0, 0);
  context.globalCompositeOperation = "lighter";
  context.fillStyle = "rgba(255, 120, 214, 0.08)";
  context.fillRect(0, 0, clientWidth, clientHeight);
  context.globalCompositeOperation = "source-over";
}

function applyMono() {
  const { clientWidth, clientHeight } = canvas;
  context.drawImage(video, 0, 0, clientWidth, clientHeight);
  const frame = context.getImageData(0, 0, clientWidth, clientHeight);
  for (let i = 0; i < frame.data.length; i += 4) {
    const avg = frame.data[i] * 0.3 + frame.data[i + 1] * 0.59 + frame.data[i + 2] * 0.11;
    frame.data[i] = avg + 30;
    frame.data[i + 1] = avg + 15;
    frame.data[i + 2] = avg + 60;
  }
  context.putImageData(frame, 0, 0);
  context.globalCompositeOperation = "lighter";
  context.fillStyle = "rgba(127, 255, 212, 0.12)";
  context.fillRect(0, 0, clientWidth, clientHeight);
  context.globalCompositeOperation = "source-over";
}

function applyFisheye() {
  const { clientWidth, clientHeight } = canvas;
  const centerX = clientWidth / 2;
  const centerY = clientHeight / 2;
  const radius = Math.min(centerX, centerY);
  const strength = 0.5;
  
  context.drawImage(video, 0, 0, clientWidth, clientHeight);
  const source = context.getImageData(0, 0, clientWidth, clientHeight);
  const output = context.createImageData(source);
  
  for (let y = 0; y < clientHeight; y++) {
    for (let x = 0; x < clientWidth; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const r = dist / radius;
      
      if (r <= 1) {
        const theta = Math.atan2(dy, dx);
        const newR = r * (1 - strength * r * r);
        const srcX = Math.floor(centerX + Math.cos(theta) * newR * radius);
        const srcY = Math.floor(centerY + Math.sin(theta) * newR * radius);
        
        if (srcX >= 0 && srcX < clientWidth && srcY >= 0 && srcY < clientHeight) {
          const srcIdx = (srcY * clientWidth + srcX) * 4;
          const outIdx = (y * clientWidth + x) * 4;
          output.data[outIdx] = source.data[srcIdx];
          output.data[outIdx + 1] = source.data[srcIdx + 1];
          output.data[outIdx + 2] = source.data[srcIdx + 2];
          output.data[outIdx + 3] = source.data[srcIdx + 3];
        }
      }
    }
  }
  context.putImageData(output, 0, 0);
}

function applyKaleidoscope() {
  const { clientWidth, clientHeight } = canvas;
  const segments = 8;
  const angle = (Math.PI * 2) / segments;
  
  context.save();
  context.translate(clientWidth / 2, clientHeight / 2);
  
  for (let i = 0; i < segments; i++) {
    context.save();
    context.rotate(angle * i);
    context.scale(1, -1);
    context.drawImage(video, -clientWidth / 2, -clientHeight / 2, clientWidth, clientHeight);
    context.restore();
  }
  
  context.restore();
}

function applyMirror() {
  const { clientWidth, clientHeight } = canvas;
  context.drawImage(video, 0, 0, clientWidth, clientHeight);
  context.save();
  context.scale(-1, 1);
  context.drawImage(video, -clientWidth, 0, clientWidth, clientHeight);
  context.restore();
}

function applyPinch() {
  const { clientWidth, clientHeight } = canvas;
  const centerX = clientWidth / 2;
  const centerY = clientHeight / 2;
  const strength = 0.3;
  
  context.drawImage(video, 0, 0, clientWidth, clientHeight);
  const source = context.getImageData(0, 0, clientWidth, clientHeight);
  const output = context.createImageData(source);
  
  for (let y = 0; y < clientHeight; y++) {
    for (let x = 0; x < clientWidth; x++) {
      const dx = (x - centerX) / centerX;
      const dy = (y - centerY) / centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pinch = 1 - Math.min(1, dist) * strength;
      const srcX = Math.floor(centerX + (x - centerX) * pinch);
      const srcY = Math.floor(centerY + (y - centerY) * pinch);
      
      if (srcX >= 0 && srcX < clientWidth && srcY >= 0 && srcY < clientHeight) {
        const srcIdx = (srcY * clientWidth + srcX) * 4;
        const outIdx = (y * clientWidth + x) * 4;
        output.data[outIdx] = source.data[srcIdx];
        output.data[outIdx + 1] = source.data[srcIdx + 1];
        output.data[outIdx + 2] = source.data[srcIdx + 2];
        output.data[outIdx + 3] = source.data[srcIdx + 3];
      }
    }
  }
  context.putImageData(output, 0, 0);
}

function applyTunnel() {
  const { clientWidth, clientHeight } = canvas;
  const centerX = clientWidth / 2;
  const centerY = clientHeight / 2;
  const t = Date.now() / 1000;
  
  context.drawImage(video, 0, 0, clientWidth, clientHeight);
  const source = context.getImageData(0, 0, clientWidth, clientHeight);
  const output = context.createImageData(source);
  
  for (let y = 0; y < clientHeight; y++) {
    for (let x = 0; x < clientWidth; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const angle = Math.atan2(dy, dx) + t * 0.5;
      const newDist = dist * 0.7 + (maxDist - dist) * 0.3;
      const srcX = Math.floor(centerX + Math.cos(angle) * newDist);
      const srcY = Math.floor(centerY + Math.sin(angle) * newDist);
      
      if (srcX >= 0 && srcX < clientWidth && srcY >= 0 && srcY < clientHeight) {
        const srcIdx = (srcY * clientWidth + srcX) * 4;
        const outIdx = (y * clientWidth + x) * 4;
        output.data[outIdx] = source.data[srcIdx];
        output.data[outIdx + 1] = source.data[srcIdx + 1];
        output.data[outIdx + 2] = source.data[srcIdx + 2];
        output.data[outIdx + 3] = source.data[srcIdx + 3];
      }
    }
  }
  context.putImageData(output, 0, 0);
}

function applyWave() {
  const { clientWidth, clientHeight } = canvas;
  const t = Date.now() / 100;
  const amplitude = 15;
  const frequency = 0.02;
  
  context.drawImage(video, 0, 0, clientWidth, clientHeight);
  const source = context.getImageData(0, 0, clientWidth, clientHeight);
  const output = context.createImageData(source);
  
  for (let y = 0; y < clientHeight; y++) {
    for (let x = 0; x < clientWidth; x++) {
      const waveX = x + Math.sin(y * frequency + t) * amplitude;
      const waveY = y + Math.cos(x * frequency + t) * amplitude * 0.5;
      const srcX = Math.floor(Math.max(0, Math.min(clientWidth - 1, waveX)));
      const srcY = Math.floor(Math.max(0, Math.min(clientHeight - 1, waveY)));
      
      const srcIdx = (srcY * clientWidth + srcX) * 4;
      const outIdx = (y * clientWidth + x) * 4;
      output.data[outIdx] = source.data[srcIdx];
      output.data[outIdx + 1] = source.data[srcIdx + 1];
      output.data[outIdx + 2] = source.data[srcIdx + 2];
      output.data[outIdx + 3] = source.data[srcIdx + 3];
    }
  }
  context.putImageData(output, 0, 0);
}

function renderEffect() {
  const mode = modeSelect.value;
  if (mode === "rgb") applyRgbSplit();
  else if (mode === "glitch") applyGlitch();
  else if (mode === "mono") applyMono();
  else if (mode === "fisheye") applyFisheye();
  else if (mode === "kaleidoscope") applyKaleidoscope();
  else if (mode === "mirror") applyMirror();
  else if (mode === "pinch") applyPinch();
  else if (mode === "tunnel") applyTunnel();
  else if (mode === "wave") applyWave();
}

function tick() {
  if (!stream) {
    return;
  }
  renderEffect();
  animationFrame = requestAnimationFrame(tick);
}

toggleButton.addEventListener("click", async () => {
  if (toggleButton.dataset.state === "on") {
    stopWebcam();
  } else {
    await startWebcam();
  }
});

snapshotButton.addEventListener("click", () => {
  if (!stream) return;
  const img = document.createElement("img");
  img.src = canvas.toDataURL("image/png");
  img.alt = `Snapshot ${new Date().toLocaleTimeString()}`;
  gallery.prepend(img);
  while (gallery.children.length > 6) {
    gallery.removeChild(gallery.lastChild);
  }
});

window.addEventListener("beforeunload", () => {
  stopWebcam();
});

window.addEventListener("resize", () => {
  context.setTransform(1, 0, 0, 1, 0, 0);
  sizeCanvas();
});

sizeCanvas();
toggleButton.dataset.state = "off";
