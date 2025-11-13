const svg = document.getElementById("svg");
const curve = document.getElementById("curve");
const textPath = document.getElementById("textPath");
const h1 = document.getElementById("h1");
const h2 = document.getElementById("h2");
const textInput = document.getElementById("textInput");
const fontSize = document.getElementById("fontSize");
const ui = document.getElementById("ui");

let drag = null;
let offX = 0;
let offY = 0;

function updateCurve() {
  const x1 = parseFloat(h1.getAttribute("cx"));
  const y1 = parseFloat(h1.getAttribute("cy"));
  const x2 = parseFloat(h2.getAttribute("cx"));
  const y2 = parseFloat(h2.getAttribute("cy"));
  curve.setAttribute("d", `M 60 150 C ${x1} ${y1}, ${x2} ${y2}, 740 150`);
}

function updateText() {
  textPath.textContent = textInput.value || "ERRL PORTAL";
}

function updateFontSize() {
  const text = svg.querySelector("text");
  text.setAttribute("font-size", fontSize.value);
}

function getSvgPoint(event) {
  const rect = svg.getBoundingClientRect();
  const viewBox = svg.viewBox.baseVal;
  const scaleX = viewBox.width / rect.width;
  const scaleY = viewBox.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

[h1, h2].forEach((handle) => {
  handle.addEventListener("pointerdown", (e) => {
    drag = handle;
    const point = getSvgPoint(e);
    offX = point.x - parseFloat(handle.getAttribute("cx"));
    offY = point.y - parseFloat(handle.getAttribute("cy"));
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener("pointerup", () => {
    drag = null;
  });

  handle.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const point = getSvgPoint(e);
    const x = point.x - offX;
    const y = point.y - offY;
    drag.setAttribute("cx", Math.max(60, Math.min(740, x)));
    drag.setAttribute("cy", Math.max(50, Math.min(250, y)));
    updateCurve();
  });
});

textInput.addEventListener("input", updateText);
fontSize.addEventListener("input", updateFontSize);

updateText();
updateFontSize();
