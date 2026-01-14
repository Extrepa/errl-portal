const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const micButton = document.getElementById("mic");
const triggerButton = document.getElementById("trigger");
const resetButton = document.getElementById("reset");

function fit() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
fit();
window.addEventListener("resize", fit);

const cols = 40;
const rows = 24;
const pts = Array.from({ length: rows }, (_, j) =>
  Array.from({ length: cols }, (_, i) => ({ z: 0, v: 0 }))
);

let prev = { x: 0, y: 0 };
let micEnabled = false;
let audioContext = null;
let analyser = null;
let dataArray = null;
let stream = null;

window.addEventListener("pointermove", (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const i = Math.floor((x / window.innerWidth) * cols);
  const j = Math.floor((y / window.innerHeight) * rows);
  const p = pts[j]?.[i];
  if (p) {
    p.v -= 2;
  }
  prev = { x, y };
});

async function enableMic() {
  if (micEnabled) {
    // Disable mic
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      stream = null;
    }
    if (audioContext) {
      await audioContext.close();
      audioContext = null;
    }
    analyser = null;
    dataArray = null;
    micEnabled = false;
    micButton.textContent = "Enable Microphone";
    micButton.disabled = false;
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    audioContext.createMediaStreamSource(stream).connect(analyser);
    dataArray = new Uint8Array(analyser.frequencyBinCount);

    micEnabled = true;
    micButton.textContent = "Disable Microphone";
    micButton.disabled = false;

    function pump() {
      if (!micEnabled || !analyser) return;
      analyser.getByteFrequencyData(dataArray);
      const bands = 8;
      for (let b = 0; b < bands; b++) {
        const seg = dataArray.slice(
          b * (dataArray.length / bands),
          (b + 1) * (dataArray.length / bands)
        );
        const avg = seg.reduce((a, v) => a + v, 0) / seg.length / 255;
        const j = Math.floor((rows / bands) * b + rows / bands / 2);
        for (let i = 0; i < cols; i++) {
          if (pts[j]?.[i]) {
            pts[j][i].v -= avg * 1.5;
          }
        }
      }
      requestAnimationFrame(pump);
    }
    pump();
  } catch (e) {
    console.error("Microphone access denied", e);
    alert("Microphone permission needed.");
    micButton.disabled = false;
  }
}

function triggerWave() {
  // Create a wave from center or random point
  const centerX = Math.floor(cols / 2);
  const centerY = Math.floor(rows / 2);
  const intensity = 15;
  
  // Create circular wave
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const dx = i - centerX;
      const dy = j - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      const wave = Math.sin(dist * 0.5) * intensity * (1 - dist / maxDist);
      if (pts[j]?.[i]) {
        pts[j][i].v += wave;
      }
    }
  }
}

function resetGrid() {
  // Reset all points to zero
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      if (pts[j]?.[i]) {
        pts[j][i].z = 0;
        pts[j][i].v = 0;
      }
    }
  }
}

micButton.addEventListener("click", () => {
  micButton.disabled = true;
  enableMic();
});

triggerButton.addEventListener("click", triggerWave);
resetButton.addEventListener("click", resetGrid);

function step() {
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const p = pts[j][i];
      // membrane spring neighbors
      const n =
        (pts[j][i - 1]?.z || 0) +
        (pts[j][i + 1]?.z || 0) +
        (pts[j - 1]?.[i]?.z || 0) +
        (pts[j + 1]?.[i]?.z || 0);
      const k = (n / 4 - p.z) * 0.2;
      p.v += k;
      p.v *= 0.98;
      p.z += p.v;
    }
  }
}

function render(t) {
  step();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const cw = window.innerWidth / (cols - 1);
  const ch = window.innerHeight / (rows - 1);
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = pts[j][i].z;
      const b = pts[j][i + 1].z;
      const c1 = pts[j + 1][i].z;
      const d = pts[j + 1][i + 1].z;
      const x = i * cw;
      const y = j * ch;
      const hue = (200 + (a + b + c1 + d) * 80 + t / 20) % 360;
      ctx.fillStyle = `hsla(${hue}, 100%, 55%, 0.8)`;
      ctx.beginPath();
      ctx.moveTo(x, y + a * 4);
      ctx.lineTo(x + cw, y + b * 4);
      ctx.lineTo(x + cw, y + ch + d * 4);
      ctx.lineTo(x, y + ch + c1 * 4);
      ctx.closePath();
      ctx.fill();
    }
  }
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
