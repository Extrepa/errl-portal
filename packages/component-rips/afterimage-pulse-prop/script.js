const pic = document.getElementById("pic");

function loop(t) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Static state for reduced motion
    pic.className = "";
    pic.style.opacity = "1";
    return;
  }

  requestAnimationFrame(loop);
  const s = Math.sin(t / 500);
  pic.className = s > 0 ? "neg" : "";
  pic.style.opacity = 0.8 + 0.2 * Math.abs(s);
}

loop(0);

