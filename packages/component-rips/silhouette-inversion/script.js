const img = document.getElementById("img");
const toggle = document.getElementById("toggle");
let inverted = true;

function toggleInversion() {
  inverted = !inverted;
  if (inverted) {
    img.classList.add("invert");
  } else {
    img.classList.remove("invert");
  }
}

toggle.addEventListener("click", toggleInversion);

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    toggleInversion();
  }
});
