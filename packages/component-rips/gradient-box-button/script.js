const button = document.getElementById("button");
const buttonText = button.querySelector(".button-text");
const textInput = document.getElementById("textInput");
const angleInput = document.getElementById("angle");
const radiusInput = document.getElementById("radius");

function updateText() {
  buttonText.textContent = textInput.value || "Click Me";
}

function updateAngle() {
  button.style.setProperty("--angle", `${angleInput.value}deg`);
}

function updateRadius() {
  button.style.setProperty("--radius", `${radiusInput.value}px`);
}

textInput.addEventListener("input", updateText);
angleInput.addEventListener("input", updateAngle);
radiusInput.addEventListener("input", updateRadius);

button.addEventListener("click", () => {
  console.log("Button clicked!");
});
