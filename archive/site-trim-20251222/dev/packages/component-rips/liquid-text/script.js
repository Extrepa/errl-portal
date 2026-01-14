const heading = document.getElementById("liquidHeading");
const textInput = document.getElementById("textInput");
const amplitudeInput = document.getElementById("amplitude");
const velocityInput = document.getElementById("velocity");
const driftInput = document.getElementById("drift");
const colorInput = document.getElementById("color");
const randomizeButton = document.getElementById("randomize");

const letters = [];
let animationId = null;
let frame = 0;

const settings = {
  amplitude: parseInt(amplitudeInput.value, 10),
  velocity: parseFloat(velocityInput.value),
  drift: parseInt(driftInput.value, 10),
  color: colorInput.value,
};

function setLetterColor(color) {
  document.documentElement.style.setProperty("--letter-color", color);
}

function rebuildLetters(text) {
  const value = text.trim() ? text : "ERRL PORTAL";
  const upper = value.toUpperCase();
  letters.length = 0;
  heading.textContent = "";

  [...upper].forEach((char) => {
    const span = document.createElement("span");
    span.className = "liquid-letter";
    span.textContent = char === " " ? "\u00A0" : char;
    heading.appendChild(span);
    letters.push({
      span,
      offset: Math.random() * Math.PI * 2,
    });
  });
}

function animate() {
  frame += 1;
  const amplitude = settings.amplitude;
  const velocity = settings.velocity;
  const drift = settings.drift;

  const baseSpeed = frame * 0.02 * velocity;

  letters.forEach((letter, index) => {
    const wave = Math.sin(baseSpeed + letter.offset);
    const secondary = Math.sin(frame * 0.013 * velocity + index * 0.6);
    const translateY = wave * amplitude * 0.6 + secondary * amplitude * 0.25;
    const scale = 1 + Math.sin(frame * 0.018 * velocity + letter.offset * 1.4) * 0.04;
    const skew = Math.sin(frame * 0.02 * velocity + index * 0.4) * drift * 0.2;

    letter.span.style.transform = `translateY(${translateY.toFixed(2)}px) scale(${scale.toFixed(
      3
    )}) skewX(${skew.toFixed(2)}deg)`;
  });

  animationId = requestAnimationFrame(animate);
}

function startAnimation() {
  if (animationId == null) {
    animationId = requestAnimationFrame(animate);
  }
}

function stopAnimation() {
  if (animationId != null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

function updateSettings() {
  settings.amplitude = parseInt(amplitudeInput.value, 10);
  settings.velocity = parseFloat(velocityInput.value);
  settings.drift = parseInt(driftInput.value, 10);
  settings.color = colorInput.value;
  setLetterColor(settings.color);
}

function randomize() {
  amplitudeInput.value = Math.floor(10 + Math.random() * 45).toString();
  velocityInput.value = (0.5 + Math.random() * 2.2).toFixed(1);
  driftInput.value = Math.floor(Math.random() * 18).toString();
  const hue = Math.floor(Math.random() * 360);
  const color = `hsl(${hue}, 95%, 60%)`;
  colorInput.value = `#${hslToHex(color)}`;
  updateSettings();
}

function hslToHex(hslString) {
  const match = /hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/i.exec(hslString);
  if (!match) return "1ea2ff";
  let [h, s, l] = match.slice(1).map(Number);
  h /= 360;
  s /= 100;
  l /= 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return [gray, gray, gray].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);

  return [r, g, b]
    .map((value) => Math.round(value * 255).toString(16).padStart(2, "0"))
    .join("");
}

textInput.addEventListener("input", (event) => {
  rebuildLetters(event.target.value);
});

amplitudeInput.addEventListener("input", updateSettings);
velocityInput.addEventListener("input", updateSettings);
driftInput.addEventListener("input", updateSettings);
colorInput.addEventListener("input", (event) => {
  settings.color = event.target.value;
  setLetterColor(settings.color);
});

randomizeButton.addEventListener("click", randomize);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyMotionPreference() {
  const reduce = prefersReducedMotion.matches;
  document.body.classList.toggle("reduce-motion", reduce);
  if (reduce) {
    stopAnimation();
    letters.forEach((letter) => {
      letter.span.style.transform = "none";
    });
  } else {
    startAnimation();
  }
}

prefersReducedMotion.addEventListener?.("change", applyMotionPreference) ??
  prefersReducedMotion.addListener?.(applyMotionPreference);

setLetterColor(settings.color);
rebuildLetters(textInput.value);
updateSettings();
applyMotionPreference();
startAnimation();
