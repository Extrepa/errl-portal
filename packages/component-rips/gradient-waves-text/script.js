const textPath = document.getElementById("wave-text-path");
const waveGradient = document.querySelector(".wave-gradient");
const speedSlider = document.getElementById("speed");
const amplitudeSlider = document.getElementById("amplitude");
const toggleTextButton = document.getElementById("toggleText");

const copies = ["ERRL PORTAL", "RAINBOW NEURAL CLUB", "PORTAL DREAMSCAPE"];
let copyIndex = 0;

function updateHeadingText() {
  const text = copies[copyIndex];
  if (textPath) {
    textPath.textContent = text;
  }
}

function updateSpeed(value) {
  const duration = 21.05263157894737 / parseFloat(value);
  if (waveGradient) {
    waveGradient.style.animationDuration = `${duration}s`;
  }
  document.documentElement.style.setProperty("--wave-speed", value);
}

function updateAmplitude(value) {
  // Amplitude affects the wave path curvature
  const path = document.getElementById("wave-path");
  if (path) {
    const amplitude = parseFloat(value);
    const wavePath = `M0 ${156 + amplitude * Math.sin(0)} L200 ${156 + amplitude * Math.sin(0.5)} L400 ${156 + amplitude * Math.sin(1)} L600 ${156 + amplitude * Math.sin(1.5)} L800 ${156 + amplitude * Math.sin(2)}`;
    // Use a smoother curve
    path.setAttribute("d", `M0,${156} Q200,${156 + amplitude} 400,${156} T800,${156}`);
  }
  document.documentElement.style.setProperty("--wave-amplitude", value);
}

speedSlider.addEventListener("input", (event) => {
  updateSpeed(event.target.value);
});

amplitudeSlider.addEventListener("input", (event) => {
  animateAmplitudeChange(event.target.value);
});

toggleTextButton.addEventListener("click", () => {
  copyIndex = (copyIndex + 1) % copies.length;
  updateHeadingText();
});

// Initialize
updateHeadingText();
updateSpeed(speedSlider.value);
updateAmplitude(amplitudeSlider.value);

// Update path on amplitude change with animation
let amplitudeAnimationFrame = null;
function animateAmplitudeChange(targetValue) {
  const currentValue = parseFloat(amplitudeSlider.value);
  const startValue = currentValue;
  const endValue = parseFloat(targetValue);
  const duration = 300; // ms
  const startTime = performance.now();
  
  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const currentAmplitude = startValue + (endValue - startValue) * easeProgress;
    
    updateAmplitude(currentAmplitude);
    
    if (progress < 1) {
      amplitudeAnimationFrame = requestAnimationFrame(animate);
    } else {
      amplitudeAnimationFrame = null;
    }
  }
  
  if (amplitudeAnimationFrame) {
    cancelAnimationFrame(amplitudeAnimationFrame);
  }
  amplitudeAnimationFrame = requestAnimationFrame(animate);
}
