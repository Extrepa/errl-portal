// ASCII Drawing Tablet Module
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
    glyphSet: 3, // 0=dots, 1=squares, 2=blocks, 3=dither, 4=shapes
    scale: 24, // Font size percentage
    gamma: 0, // Brightness curve adjustment
    mix: 100, // Overall opacity
    invertOrder: true,
    monochrome: true,
    blendMode: 'Normal', // Normal, Add, Screen, Multiply, Difference
    radius: 20, // Drawing radius percentage
    strength: 82, // Drawing strength percentage
    turbulence: 100, // Turbulence percentage
    tint: '#FFFFFF', // Color tint
    colorMix: 100, // Blend between grayscale and tint
    tail: 100, // Tail length percentage
    drawBlendMode: 'Screen', // Trail blend mode
    trackMouse: 100, // Mouse tracking percentage (lower = autonomous)
    momentum: 42 // Smoothness of trail movement
  };

  // State
  const mousePos = { x: 100, y: 100 };
  const smoothedPos = { x: 100, y: 100 };
  const trail = [];
  let time = 0;
  let animationFrame = null;

  // Glyph sets
  const glyphSets = {
    0: '●•·. ', // Halftone — Dots
    1: '■□▪▫ ', // Halftone — Square
    2: '█▓▒░ ', // Ordered Dither
    3: '▣▤▥▦▧▨▩ ', // Floyd—Steinberg
    4: '◆◇◈○◉◊◌ ' // Atkinson
  };

  // Initialize canvas
  function initCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  // Get mouse position relative to canvas
  function updateMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
  }

  // Parse color
  function parseColor(color) {
    let r = 255, g = 255, b = 255;
    
    if (typeof color === 'string') {
      if (color.startsWith('#')) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      } else if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        if (matches) {
          r = parseInt(matches[0]);
          g = parseInt(matches[1]);
          b = parseInt(matches[2]);
        }
      }
    } else if (typeof color === 'object' && color) {
      r = Math.round((color.r || 1) * 255);
      g = Math.round((color.g || 1) * 255);
      b = Math.round((color.b || 1) * 255);
    }
    
    return { r, g, b };
  }

  // Animation loop
  function animate() {
    if (prefersReducedMotion) return;

    time += 0.016;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate target position (with autonomous movement if trackMouse < 100)
    let targetX = mousePos.x;
    let targetY = mousePos.y;

    if (config.trackMouse < 100) {
      const centerX = canvas.width / 2 + Math.sin(time) * 150;
      const centerY = canvas.height / 2 + Math.cos(time * 0.7) * 150;
      const trackFactor = config.trackMouse / 100;
      targetX = mousePos.x * trackFactor + centerX * (1 - trackFactor);
      targetY = mousePos.y * trackFactor + centerY * (1 - trackFactor);
    }

    // Smooth position with momentum
    const momentumFactor = 1 - (config.momentum / 100) * 0.95;
    smoothedPos.x += (targetX - smoothedPos.x) * momentumFactor;
    smoothedPos.y += (targetY - smoothedPos.y) * momentumFactor;

    // Add to trail
    trail.push({ x: smoothedPos.x, y: smoothedPos.y, life: 1 });

    // Limit trail length
    const maxTrailLength = Math.floor((config.tail / 100) * 50) + 5;
    while (trail.length > maxTrailLength) {
      trail.shift();
    }

    // Decay trail
    const decayRate = 0.02 * (1 - config.tail / 100) + 0.01;
    trail.forEach(point => point.life -= decayRate);
    for (let i = trail.length - 1; i >= 0; i--) {
      if (trail[i].life <= 0) {
        trail.splice(i, 1);
      }
    }

    // Get glyph set
    let glyphs = glyphSets[config.glyphSet] || '@%#*+=-:. ';
    if (config.invertOrder) {
      glyphs = glyphs.split('').reverse().join('');
    }

    // Parse tint color
    const tint = parseColor(config.tint);

    // Set font and blend mode
    const fontSize = Math.max(6, Math.floor(16 * config.scale / 100));
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Set blend mode
    switch (config.blendMode) {
      case 'Add':
        ctx.globalCompositeOperation = 'lighter';
        break;
      case 'Screen':
        ctx.globalCompositeOperation = 'screen';
        break;
      case 'Multiply':
        ctx.globalCompositeOperation = 'multiply';
        break;
      case 'Difference':
        ctx.globalCompositeOperation = 'difference';
        break;
      default:
        ctx.globalCompositeOperation = 'source-over';
    }

    // Calculate grid
    const cols = Math.ceil(canvas.width / fontSize);
    const rows = Math.ceil(canvas.height / fontSize);

    // Render grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * fontSize + fontSize / 2;
        const y = row * fontSize + fontSize / 2;
        let intensity = 0;

        // Calculate intensity from trail
        trail.forEach(point => {
          const dist = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
          const radius = (config.radius / 100) * 150;
          
          if (dist < radius) {
            const contribution = (1 - dist / radius) * point.life * (config.strength / 100);
            
            switch (config.drawBlendMode) {
              case 'Add':
                intensity += contribution;
                break;
              case 'Multiply':
                intensity *= contribution;
                break;
              case 'Difference':
                intensity = Math.abs(intensity - contribution);
                break;
              case 'Screen':
                intensity = 1 - (1 - intensity) * (1 - contribution);
                break;
              default:
                intensity = Math.max(intensity, contribution);
            }
          }
        });

        // Add turbulence
        if (config.turbulence > 0 && intensity > 0) {
          const turbulence = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time * 0.7) * (config.turbulence / 1000);
          intensity += turbulence;
        }

        // Apply gamma
        if (config.gamma !== 0 && intensity > 0) {
          intensity = intensity ** (1 - config.gamma);
        }

        // Apply dithering patterns
        if (config.glyphSet > 0 && intensity > 0) {
          const ditherAmount = 0.2;
          
          if (config.glyphSet === 1) {
            // Square pattern
            const pattern = (Math.sin(col * 0.5) + Math.cos(row * 0.5)) * ditherAmount;
            intensity += pattern;
          } else if (config.glyphSet === 2) {
            // Checker pattern
            const pattern = ((col % 2) + (row % 2)) * ditherAmount - ditherAmount;
            intensity += pattern;
          } else if (config.glyphSet === 3) {
            // Bayer dither matrix
            const bayer = [
              [0, 8, 2, 10],
              [12, 4, 14, 6],
              [3, 11, 1, 9],
              [15, 7, 13, 5]
            ][row % 4][col % 4] / 16;
            intensity = intensity > bayer ? 1 : intensity * 0.5;
          } else if (config.glyphSet === 4 || config.glyphSet === 5) {
            // Random dither
            const pattern = (Math.random() * ditherAmount) - ditherAmount / 2;
            intensity += pattern;
          }
        }

        // Clamp intensity
        intensity = Math.max(0, Math.min(1, intensity));

        // Render glyph if visible
        if (intensity > 0.01) {
          const glyphIndex = Math.min(glyphs.length - 1, Math.floor(intensity * glyphs.length));
          const glyph = glyphs[glyphIndex];
          const opacity = intensity * (config.mix / 100);

          // Set color
          if (config.monochrome) {
            ctx.fillStyle = `rgba(${tint.r}, ${tint.g}, ${tint.b}, ${opacity})`;
          } else {
            const colorMix = config.colorMix / 100;
            const r = Math.round(255 * intensity * (1 - colorMix) + tint.r * colorMix * intensity);
            const g = Math.round(255 * intensity * (1 - colorMix) + tint.g * colorMix * intensity);
            const b = Math.round(255 * intensity * (1 - colorMix) + tint.b * colorMix * intensity);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          }

          ctx.fillText(glyph, x, y);
        }
      }
    }

    // Reset blend mode
    ctx.globalCompositeOperation = 'source-over';

    animationFrame = requestAnimationFrame(animate);
  }

  // Event handlers
  canvas.addEventListener('mousemove', updateMousePos);
  window.addEventListener('resize', () => {
    initCanvas();
    trail.length = 0; // Clear trail on resize
  });

  // Initialize
  initCanvas();

  // Start animation
  if (!prefersReducedMotion) {
    animate();
  }
})();
