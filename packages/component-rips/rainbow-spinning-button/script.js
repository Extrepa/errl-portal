const button = document.getElementById("button");
const buttonText = button.querySelector(".button-text");
const textInput = document.getElementById("textInput");
const parInput = document.getElementById("par");
const spdInput = document.getElementById("spd");
const ink = document.getElementById("ink");
const d1 = document.getElementById("d1");
const d2 = document.getElementById("d2");
const d3 = document.getElementById("d3");

let parallax = parseFloat(parInput.value);
let spinSpeed = parseFloat(spdInput.value);

function updateText() {
  buttonText.textContent = textInput.value || "Click Me";
}

function updateParallax() {
  parallax = parseFloat(parInput.value);
}

function updateSpinSpeed() {
  spinSpeed = parseFloat(spdInput.value);
  const duration = 2 + (1 - spinSpeed) * 24;
  ink.style.animationDuration = `${duration}s`;
}

function updateAnimation() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    ink.style.animation = "none";
  } else {
    updateSpinSpeed();
  }
}

textInput.addEventListener("input", updateText);
parInput.addEventListener("input", updateParallax);
spdInput.addEventListener("input", updateSpinSpeed);

window.addEventListener("pointermove", (e) => {
  const nx = (e.clientX / window.innerWidth - 0.5) * 2;
  const ny = (e.clientY / window.innerHeight - 0.5) * 2;
  const t = performance.now() / 1000;

  d1.setAttribute("cy", 460 + ny * 30 * parallax + Math.sin(t * 1.6) * 10);
  d1.setAttribute("cx", 300 + nx * 20 * parallax);
  d2.setAttribute("cy", 430 + ny * 25 * parallax + Math.cos(t * 1.8) * 9);
  d2.setAttribute("cx", 380 + nx * 30 * parallax);
  d3.setAttribute("cy", 430 + ny * 25 * parallax + Math.sin(t * 1.4) * 7);
  d3.setAttribute("cx", 220 + nx * 30 * parallax);
});

button.addEventListener("click", () => {
  console.log("Spinning button clicked!");
});

// Initialize
updateText();
updateAnimation();

// Handle reduced motion preference changes
window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", updateAnimation);
