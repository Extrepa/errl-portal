// Rainbow Drawing Tablet Module
// Extracted and rebuilt from Framer component

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Configuration
  const config = {
    lineWidth: 6,
    backgroundColor: '#F7F7F7',
    gradientSpeed: 4,
    interactionType: 'hover', // 'press' or 'hover'
    disappear: true,
    disappearDelay: 400,
    elasticity: 0
  };

  // State
  let isDrawing = false;
  let currentHue = 0;
  let lastPoint = null;
  let currentLineWidth = config.lineWidth;
  const strokes = [];

  // Initialize canvas
  function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  // Get mouse/touch position relative to canvas
  function getPoint(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  // Start drawing
  function startDraw(e) {
    if (config.interactionType === 'press') {
      isDrawing = true;
    }
    lastPoint = getPoint(e);
    draw(e);
  }

  // Draw
  function draw(e) {
    if (config.interactionType === 'press' && !isDrawing) return;

    const point = getPoint(e);
    if (!lastPoint) {
      lastPoint = point;
      return;
    }

    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const elasticityFactor = Math.min(distance * config.elasticity, 1);

    // Draw quadratic curve
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    
    const controlX = lastPoint.x + dx * 0.5;
    const controlY = lastPoint.y + dy * 0.5 + elasticityFactor * 20;
    
    ctx.quadraticCurveTo(controlX, controlY, point.x, point.y);

    // Update hue for rainbow effect
    currentHue = (currentHue + config.gradientSpeed) % 360;
    ctx.strokeStyle = `hsl(${currentHue}, 100%, 50%)`;

    // Dynamic line width based on elasticity
    const targetWidth = config.lineWidth * (1 + elasticityFactor);
    currentLineWidth += (targetWidth - currentLineWidth) * 0.2;
    ctx.lineWidth = currentLineWidth;

    ctx.stroke();

    // Store stroke for disappear effect
    if (config.disappear) {
      strokes.push({
        start: { ...lastPoint },
        control: { x: controlX, y: controlY },
        end: { ...point },
        hue: currentHue,
        opacity: 1,
        width: currentLineWidth,
        createdAt: Date.now()
      });
    }

    lastPoint = point;
  }

  // End drawing
  function endDraw() {
    isDrawing = false;
    lastPoint = null;
    currentLineWidth = config.lineWidth;
  }

  // Animate disappear effect
  function animateDisappear() {
    if (!config.disappear || prefersReducedMotion) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const now = Date.now();
    for (let i = strokes.length - 1; i >= 0; i--) {
      const stroke = strokes[i];
      const age = now - stroke.createdAt;

      if (age > config.disappearDelay) {
        stroke.opacity -= 0.02;
        stroke.width -= 0.1;
      }

      if (stroke.opacity <= 0 || stroke.width <= 0) {
        strokes.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(stroke.start.x, stroke.start.y);
      ctx.quadraticCurveTo(stroke.control.x, stroke.control.y, stroke.end.x, stroke.end.y);
      ctx.strokeStyle = `hsla(${stroke.hue}, 100%, 50%, ${stroke.opacity})`;
      ctx.lineWidth = stroke.width;
      ctx.stroke();
    }
  }

  // Event handlers
  if (config.interactionType === 'press') {
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseout', endDraw);
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDraw(e); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener('touchend', (e) => { e.preventDefault(); endDraw(); });
  } else {
    canvas.addEventListener('mouseenter', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', endDraw);
  }

  // Initialize
  initCanvas();

  // Handle resize
  window.addEventListener('resize', () => {
    initCanvas();
    strokes.length = 0; // Clear strokes on resize
  });

  // Animation loop for disappear effect
  if (config.disappear && !prefersReducedMotion) {
    function loop() {
      animateDisappear();
      requestAnimationFrame(loop);
    }
    loop();
  }
})();
