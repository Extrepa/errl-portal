const container = document.getElementById('holographic-cursor-container');
const maxDotsInput = document.getElementById('maxDots');
const throttleInput = document.getElementById('throttle');
const fadeDelayInput = document.getElementById('fadeDelay');
const lifetimeInput = document.getElementById('lifetime');

if (!container) {
  console.error('Container not found');
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  maxDots: 80,
  throttleInterval: 20,
  fadeDelay: 80,
  lifetime: 650,
};

function updateState() {
  state.maxDots = parseInt(maxDotsInput.value, 10);
  state.throttleInterval = parseInt(throttleInput.value, 10);
  state.fadeDelay = parseInt(fadeDelayInput.value, 10);
  state.lifetime = parseInt(lifetimeInput.value, 10);
}

[maxDotsInput, throttleInput, fadeDelayInput, lifetimeInput].forEach(input => {
  input.addEventListener('input', updateState);
});

updateState();

let lastMoveTime = 0;

function createTrailDot(x, y) {
  if (container.childElementCount > state.maxDots) {
    container.firstChild.remove();
  }
  
  const dot = document.createElement('div');
  dot.className = 'trail-dot';
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  container.appendChild(dot);
  
  setTimeout(() => {
    if (dot.isConnected) {
      dot.style.opacity = '0';
    }
  }, state.fadeDelay);
  
  dot.addEventListener('transitionend', () => {
    if (dot.isConnected) dot.remove();
  });
  
  const timeout = reduce.matches ? Math.min(state.lifetime * 0.7, 450) : state.lifetime;
  setTimeout(() => {
    if (container.contains(dot)) {
      container.removeChild(dot);
    }
  }, timeout);
}

window.addEventListener('mousemove', (e) => {
  const now = Date.now();
  const throttle = reduce.matches ? Math.max(state.throttleInterval * 2, 40) : state.throttleInterval;
  
  if (now - lastMoveTime < throttle) return;
  lastMoveTime = now;
  createTrailDot(e.clientX, e.clientY);
});

