const stage = document.getElementById("component-root");
const speedInput = document.getElementById("speed");
const ringCountInput = document.getElementById("ringCount");
let currentRingCount = 5;

function updateSpeed() {
  const duration = parseFloat(speedInput.value);
  document.documentElement.style.setProperty("--animation-duration", `${duration}s`);
  const rings = stage.querySelectorAll(".ring");
  rings.forEach((ring) => {
    ring.style.animationDuration = `${duration}s`;
  });
}

function updateRingCount() {
  const count = parseInt(ringCountInput.value, 10);
  if (count === currentRingCount) return;
  
  const rings = stage.querySelectorAll(".ring");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  if (count > currentRingCount) {
    // Add rings
    for (let i = currentRingCount; i < count; i++) {
      const ring = document.createElement("div");
      ring.className = "ring";
      ring.style.animationDelay = `-${i}s`;
      ring.innerHTML = `
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="180" fill="none" stroke="url(#grad-${i})" stroke-width="8" />
          <circle cx="200" cy="200" r="120" fill="none" stroke="url(#grad-${i})" stroke-width="6" />
          <circle cx="200" cy="200" r="60" fill="none" stroke="url(#grad-${i})" stroke-width="4" />
          <defs>
            <linearGradient id="grad-${i}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#ff0066;stop-opacity:1" />
              <stop offset="25%" style="stop-color:#ffa400;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#ffee00;stop-opacity:1" />
              <stop offset="75%" style="stop-color:#00e5ff;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#7b5cff;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      `;
      if (prefersReducedMotion) {
        ring.style.animation = "none";
        ring.style.transform = "scale(0.75)";
      }
      stage.appendChild(ring);
    }
  } else {
    // Remove rings
    for (let i = rings.length - 1; i >= count; i--) {
      rings[i].remove();
    }
  }
  
  currentRingCount = count;
}

speedInput.addEventListener("input", updateSpeed);
ringCountInput.addEventListener("input", updateRingCount);

// Initialize
updateSpeed();

// Handle reduced motion preference changes
window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (e) => {
  const rings = stage.querySelectorAll(".ring");
  if (e.matches) {
    rings.forEach((ring) => {
      ring.style.animation = "none";
      ring.style.transform = "scale(0.75)";
    });
  } else {
    rings.forEach((ring) => {
      ring.style.animation = "";
      ring.style.transform = "";
    });
    updateSpeed();
  }
});
