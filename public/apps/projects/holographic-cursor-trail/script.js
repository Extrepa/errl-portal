const container = document.getElementById('holographic-cursor-container');
if (container) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const MAX = reduce.matches ? 40 : 80;
  let lastMoveTime = 0;
  const throttleInterval = reduce.matches ? 40 : 20;

  function createTrailDot(x, y) {
    if (container.childElementCount > MAX) container.firstChild.remove();
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    container.appendChild(dot);
    setTimeout(() => { dot.style.opacity = '0'; }, 80);
    dot.addEventListener('transitionend', () => dot.remove());
    setTimeout(() => { if (container.contains(dot)) container.removeChild(dot); }, reduce.matches ? 450 : 650);
  }

  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastMoveTime < throttleInterval) return;
    lastMoveTime = now;
    createTrailDot(e.clientX, e.clientY);
  });
}
