// Particle Face Parallax Push Module
// Extracted and rebuilt from Framer component
// Creates a 3D particle parallax effect from an image

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
    imageSrc: 'https://framerusercontent.com/images/YLaxniizpwEM9PA9rPzXYmkzI.jpg?width=736&height=960',
    imageWidth: 300,
    imageHeight: 200,
    amplitude: 1, // Wave amplitude
    animationSpeed: 0.03, // Animation speed
    backgroundColor: '#000000',
    pointSize: 2,
    zRange: 400 // Depth range
  };

  // State
  let particles = [];
  let mouse = { x: 0, y: 0 };
  let animationTime = 0;
  let animationFrame = null;
  let imageLoaded = false;

  // Initialize canvas
  function initCanvas() {
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
  }

  // Convert image to particles
  function createParticles(imageData) {
    particles = [];
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Luminance weights for grayscale conversion
    const luminanceWeights = [0.299, 0.587, 0.114];
    
    // Sample every 2 pixels for performance
    for (let y = 0; y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const index = (y * width + x) * 4;
        const r = data[index] / 255;
        const g = data[index + 1] / 255;
        const b = data[index + 2] / 255;
        const alpha = data[index + 3] / 255;
        
        // Skip transparent pixels
        if (alpha < 0.1) continue;
        
        // Calculate luminance
        const luminance = r * luminanceWeights[0] + g * luminanceWeights[1] + b * luminanceWeights[2];
        
        // Convert to 3D coordinates
        const x3d = (x - centerX) * 2;
        const y3d = (y - centerY) * 2;
        const z3d = (luminance - 0.5) * config.zRange;
        
        particles.push({
          x: x3d,
          y: y3d,
          z: z3d,
          originalX: x3d,
          originalY: y3d,
          originalZ: z3d,
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          alpha: alpha
        });
      }
    }
    
    console.log(`Created ${particles.length} particles`);
  }

  // Load and process image
  function loadImage() {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
      // Create temporary canvas to process image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = config.imageWidth;
      tempCanvas.height = config.imageHeight;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        try {
          tempCtx.drawImage(img, 0, 0, config.imageWidth, config.imageHeight);
          const imageData = tempCtx.getImageData(0, 0, config.imageWidth, config.imageHeight);
          createParticles(imageData);
          imageLoaded = true;
          
          if (!prefersReducedMotion && !animationFrame) {
            startAnimation();
          } else {
            renderStatic();
          }
        } catch (error) {
          console.error('Failed to process image:', error);
        }
      }
    };
    
    img.onerror = function() {
      console.error('Failed to load image:', config.imageSrc);
    };
    
    img.src = config.imageSrc;
  }

  // 3D rotation and projection
  function project3D(x, y, z, mouseX, mouseY, time) {
    // Apply wave animation
    const waveZ = z * (1 + Math.sin(time) * config.amplitude);
    
    // Mouse-based rotation
    const rotX = mouseY * 0.3;
    const rotY = mouseX * 0.5;
    
    // Rotate around Y axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - waveZ * sinY;
    const z1 = x * sinY + waveZ * cosY;
    
    // Rotate around X axis
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    
    // Perspective projection
    const distance = 800;
    const scale = distance / (distance + z2);
    
    return {
      x: x1 * scale,
      y: y1 * scale,
      z: z2,
      scale: scale
    };
  }

  // Render animation frame
  function render() {
    if (!imageLoaded || particles.length === 0) return;
    
    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Update animation time
    if (!prefersReducedMotion) {
      animationTime += config.animationSpeed;
    }
    
    // Render particles
    particles.forEach(particle => {
      const projected = project3D(
        particle.originalX,
        particle.originalY,
        particle.originalZ,
        mouse.x,
        mouse.y,
        animationTime
      );
      
      const screenX = projected.x + centerX;
      const screenY = projected.y + centerY;
      const size = config.pointSize * projected.scale;
      
      // Cull particles outside view
      if (screenX < 0 || screenX > canvas.width || 
          screenY < 0 || screenY > canvas.height || 
          size < 0.1) {
        return;
      }
      
      // Render particle
      const alpha = particle.alpha * projected.scale;
      ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  // Render static version (for reduced motion)
  function renderStatic() {
    if (!imageLoaded || particles.length === 0) return;
    
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    particles.forEach(particle => {
      const screenX = particle.originalX + centerX;
      const screenY = particle.originalY + centerY;
      
      if (screenX < 0 || screenX > canvas.width || 
          screenY < 0 || screenY > canvas.height) {
        return;
      }
      
      ctx.fillStyle = `rgba(${particle.r}, ${particle.g}, ${particle.b}, ${particle.alpha})`;
      ctx.beginPath();
      ctx.arc(screenX, screenY, config.pointSize, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Start animation loop
  function startAnimation() {
    if (prefersReducedMotion || animationFrame) return;
    animationFrame = requestAnimationFrame(render);
  }

  // Stop animation loop
  function stopAnimation() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  // Mouse move handler
  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  // Resize handler
  function handleResize() {
    initCanvas();
    if (prefersReducedMotion) {
      renderStatic();
    }
  }

  // Initialize
  initCanvas();
  loadImage();

  // Event listeners
  canvas.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('resize', handleResize);

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    stopAnimation();
    canvas.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('resize', handleResize);
  });
})();
