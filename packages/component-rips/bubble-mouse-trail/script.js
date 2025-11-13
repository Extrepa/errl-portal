const container = document.getElementById('bubbling-cursor-container');
const maxBubblesInput = document.getElementById('maxBubbles');
const throttleInput = document.getElementById('throttle');
const sizeMinInput = document.getElementById('sizeMin');
const sizeMaxInput = document.getElementById('sizeMax');

if (!container) {
  console.error('Container not found');
}

const reduce = matchMedia('(prefers-reduced-motion: reduce)');

const state = {
  maxBubbles: 80,
  throttleInterval: 25,
  sizeMin: 10,
  sizeMax: 50,
};

function updateState() {
  state.maxBubbles = parseInt(maxBubblesInput.value, 10);
  state.throttleInterval = parseInt(throttleInput.value, 10);
  state.sizeMin = parseInt(sizeMinInput.value, 10);
  state.sizeMax = parseInt(sizeMaxInput.value, 10);
}

[maxBubblesInput, throttleInput, sizeMinInput, sizeMaxInput].forEach(input => {
  input.addEventListener('input', updateState);
});

updateState();

let lastMoveTime = 0;

window.addEventListener('mousemove', (e) => {
  const currentTime = Date.now();
  const throttle = reduce.matches ? Math.max(state.throttleInterval * 2, 50) : state.throttleInterval;
  
  if (currentTime - lastMoveTime < throttle) return;
  lastMoveTime = currentTime;
  
  if (container.childElementCount > state.maxBubbles) {
    container.firstChild.remove();
  }
  
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  
  const sizeRange = state.sizeMax - state.sizeMin;
  const baseSize = reduce.matches 
    ? state.sizeMin + Math.random() * (sizeRange * 0.5)
    : state.sizeMin + Math.random() * sizeRange;
  const size = Math.max(5, baseSize);
  
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.left = `${e.clientX}px`;
  bubble.style.top = `${e.clientY}px`;
  
  container.appendChild(bubble);
  
  bubble.addEventListener('animationend', () => {
    if (bubble.isConnected) bubble.remove();
  });
  
  const timeout = reduce.matches ? 500 : 800;
  setTimeout(() => {
    if (bubble.isConnected) bubble.remove();
  }, timeout);
});

