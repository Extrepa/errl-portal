const container = document.getElementById('bubbling-cursor-container');
if (container) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let lastMoveTime = 0;
  const throttleInterval = reduce.matches ? 50 : 25;
  const MAX = 80;
  window.addEventListener('mousemove', (e) => {
    const currentTime = Date.now();
    if (currentTime - lastMoveTime < throttleInterval) return;
    lastMoveTime = currentTime;
    if (container.childElementCount > MAX) container.firstChild.remove();
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const size = Math.random() * (reduce.matches ? 20 : 40) + (reduce.matches ? 10 : 20);
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${e.clientX}px`;
    bubble.style.top = `${e.clientY}px`;
    container.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove());
    setTimeout(() => { if (bubble.isConnected) bubble.remove(); }, reduce.matches ? 500 : 800);
  });
}
