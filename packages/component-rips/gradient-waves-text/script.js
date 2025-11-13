const heading = document.querySelector("[data-wave]");
const speedSlider = document.getElementById("speed");
const amplitudeSlider = document.getElementById("amplitude");
const toggleTextButton = document.getElementById("toggleText");

const copies = ["ERRL PORTAL", "RAINBOW NEURAL CLUB", "PORTAL DREAMSCAPE"];
let copyIndex = 0;

function updateHeadingText() {
  const text = copies[copyIndex];
  heading.textContent = text;
  heading.setAttribute("data-wave-copy", text);
}

function updateSpeed(value) {
  heading.style.setProperty("--wave-speed", value);
}

function updateAmplitude(value) {
  heading.style.setProperty("--wave-amplitude", value);
}

speedSlider.addEventListener("input", (event) => {
  updateSpeed(event.target.value);
});

amplitudeSlider.addEventListener("input", (event) => {
  updateAmplitude(event.target.value);
});

toggleTextButton.addEventListener("click", () => {
  copyIndex = (copyIndex + 1) % copies.length;
  updateHeadingText();
});

updateHeadingText();
updateSpeed(speedSlider.value);
updateAmplitude(amplitudeSlider.value);
