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

function renderEffect() {
  const mode = modeSelect.value;
  if (mode === "rgb") applyRgbSplit();
  else if (mode === "glitch") applyGlitch();
  else applyMono();
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
