const root = document.documentElement;
const outerLayer = document.getElementById("layer-outer");
const innerLayer = document.getElementById("layer-inner");
const maskWrapper = document.querySelector(".mask");
const maskHole = document.getElementById("mask-hole");
const tip = document.getElementById("tip");

const outerSpeed = document.getElementById("outerSpeed");
const innerSpeed = document.getElementById("innerSpeed");
const innerCounter = document.getElementById("innerCounter");
const maskSelect = document.getElementById("maskSelect");
const tipToggle = document.getElementById("tipToggle");

function setOuterDuration(value) {
  const seconds = Math.max(Number(value) || 10, 1);
  root.style.setProperty("--outer-duration", `${seconds}s`);
}

function setInnerDuration(value) {
  const seconds = Math.max(Number(value) || 10, 1);
  root.style.setProperty("--inner-duration", `${seconds}s`);
}

function updateInnerDirection() {
  const enableCounter = innerCounter.checked;
  innerLayer.classList.toggle("reverse", !enableCounter);
}

function updateMask() {
  const value = maskSelect.value;
  maskWrapper.classList.remove("hidden");
  maskHole.classList.remove("circle");

  if (value === "circle") {
    maskHole.classList.add("circle");
  } else if (value === "none") {
    maskWrapper.classList.add("hidden");
  }
}

function updateTip() {
  const show = tipToggle.checked;
  tip.hidden = !show;
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyMotionPreference() {
  document.body.classList.toggle("reduce-motion", prefersReducedMotion.matches);
}

prefersReducedMotion.addEventListener?.("change", applyMotionPreference) ??
  prefersReducedMotion.addListener?.(applyMotionPreference);

outerSpeed.addEventListener("input", (event) => setOuterDuration(event.target.value));
innerSpeed.addEventListener("input", (event) => setInnerDuration(event.target.value));
innerCounter.addEventListener("change", updateInnerDirection);
maskSelect.addEventListener("change", updateMask);
tipToggle.addEventListener("change", updateTip);

// Init
setOuterDuration(outerSpeed.value);
setInnerDuration(innerSpeed.value);
updateInnerDirection();
updateMask();
updateTip();
applyMotionPreference();
