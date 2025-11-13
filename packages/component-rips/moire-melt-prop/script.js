const A = document.getElementById("A");
const B = document.getElementById("B");
const offInput = document.getElementById("off");
const rotInput = document.getElementById("rot");
const pulInput = document.getElementById("pul");

function apply() {
  const o = +offInput.value;
  const r = +rotInput.value;
  A.style.transform = `translate(${-o / 2}px, ${o / 2}px) rotate(${r}deg)`;
  B.style.transform = `translate(${o}px, ${-o}px) rotate(${-r}deg)`;
}

offInput.addEventListener("input", apply);
rotInput.addEventListener("input", apply);
apply();

function loop(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Static state for reduced motion
    B.style.opacity = "0.4";
    return;
  }

  requestAnimationFrame(loop);
  B.style.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t / 800)) * +pulInput.value;
}

loop(0);

