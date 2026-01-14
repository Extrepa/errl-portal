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
  // Amplitude affects the wave path curvature - create a smooth sine wave
  const path = document.getElementById("wave-path");
  if (path) {
    const amplitude = parseFloat(value);
    const centerY = 156;
    const width = 800;
    const frequency = 2; // Number of complete waves across the width
    
    // Create a smooth wave path using cubic Bezier curves for smooth sine wave
    const points = 20; // Number of control points
    let pathData = `M0,${centerY}`;
    
    for (let i = 1; i <= points; i++) {
      const x = (width / points) * i;
      const prevX = (width / points) * (i - 1);
      const y = centerY + amplitude * Math.sin((x / width) * frequency * Math.PI * 2);
      const prevY = centerY + amplitude * Math.sin((prevX / width) * frequency * Math.PI * 2);
      
      // Calculate control points for smooth curve
      const dx = (width / points) / 3;
      const cp1X = prevX + dx;
      const cp1Y = centerY + amplitude * Math.sin(((prevX + dx) / width) * frequency * Math.PI * 2);
      const cp2X = x - dx;
      const cp2Y = centerY + amplitude * Math.sin(((x - dx) / width) * frequency * Math.PI * 2);
      
      pathData += ` C${cp1X},${cp1Y} ${cp2X},${cp2Y} ${x},${y}`;
    }
    
    path.setAttribute("d", pathData);
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
