// Particle Shapes Module
// Extracted and rebuilt from Framer component
// 2D canvas particle system with 3D math and perspective projection

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
    mode: 'sphere', // 20 different modes available
    particleColor: '#FFFFFF',
    particleSize: 2,
    particleCount: 5000,
    mouseInfluence: 0.5,
    rotationSpeed: 0.001,
    backgroundColor: '#000000',
    physicsEnabled: false,
    gravity: 0,
    mouseRepulsion: 0,
    mouseAttraction: 0,
    damping: 0.95,
    turbulence: 0,
    cameraX: 0,
    cameraY: 0,
    cameraZ: 300,
    cameraZoom: 1,
    fieldOfView: 300,
    transitionDuration: 2
  };

  // State
  let particles = [];
  let mouse = { x: 0, y: 0 };
  let rotation = { x: 0, y: 0 };
  let animationId = null;
  let transitionProgress = 1;
  let currentMode = config.mode;
  let targetMode = config.mode;

  // Shape modes
  const modes = [
    { id: 'sphere', label: 'Sphere' },
    { id: 'cube', label: 'Cube' },
    { id: 'torus', label: 'Torus' },
    { id: 'helix', label: 'Helix' },
    { id: 'wave', label: 'Wave' },
    { id: 'pyramid', label: 'Pyramid' },
    { id: 'cylinder', label: 'Cylinder' },
    { id: 'cone', label: 'Cone' },
    { id: 'ring', label: 'Ring' },
    { id: 'spiral', label: 'Spiral' },
    { id: 'galaxy', label: 'Galaxy' },
    { id: 'dna', label: 'DNA' },
    { id: 'heart', label: 'Heart' },
    { id: 'star', label: 'Star' },
    { id: 'flower', label: 'Flower' },
    { id: 'grid', label: 'Grid' },
    { id: 'random', label: 'Random' },
    { id: 'explosion', label: 'Explosion' },
    { id: 'vortex', label: 'Vortex' },
    { id: 'mobius', label: 'Mobius' }
  ];

  // Generate particle positions for a given mode
  function generateParticles(mode, count) {
    const positions = [];
    for (let i = 0; i < count; i++) {
      let x = 0, y = 0, z = 0;
      
      switch (mode) {
        case 'sphere': {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = 80 + Math.random() * 40;
          x = radius * Math.sin(phi) * Math.cos(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(phi);
          break;
        }
        case 'cube':
          x = (Math.random() - 0.5) * 120;
          y = (Math.random() - 0.5) * 120;
          z = (Math.random() - 0.5) * 120;
          break;
        case 'torus': {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI * 2;
          x = (80 + 40 * Math.cos(phi)) * Math.cos(theta);
          y = (80 + 40 * Math.cos(phi)) * Math.sin(theta);
          z = 40 * Math.sin(phi);
          break;
        }
        case 'helix': {
          const t = i / count * Math.PI * 8;
          x = 60 * Math.cos(t);
          y = (i / count - 0.5) * 200;
          z = 60 * Math.sin(t);
          break;
        }
        case 'wave': {
          const size = Math.sqrt(count);
          const row = Math.floor(i / size);
          x = (i % size / size - 0.5) * 200;
          z = (row / size - 0.5) * 200;
          y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 30;
          break;
        }
        case 'pyramid': {
          const size = Math.floor(Math.sqrt(i));
          const height = (1 - size / Math.sqrt(count)) * 100;
          x = (Math.random() - 0.5) * height;
          z = (Math.random() - 0.5) * height;
          y = -size * 5 + 50;
          break;
        }
        case 'cylinder': {
          const theta = Math.random() * Math.PI * 2;
          x = 60 * Math.cos(theta);
          y = (Math.random() - 0.5) * 150;
          z = 60 * Math.sin(theta);
          break;
        }
        case 'cone': {
          const theta = Math.random() * Math.PI * 2;
          const t = Math.random();
          const radius = 80 * (1 - t);
          x = radius * Math.cos(theta);
          y = t * 150 - 75;
          z = radius * Math.sin(theta);
          break;
        }
        case 'ring': {
          const theta = Math.random() * Math.PI * 2;
          const radius = 80 + (Math.random() - 0.5) * 20;
          x = radius * Math.cos(theta);
          y = (Math.random() - 0.5) * 20;
          z = radius * Math.sin(theta);
          break;
        }
        case 'spiral': {
          const t = i / count * Math.PI * 10;
          const radius = t * 5;
          x = radius * Math.cos(t);
          y = (i / count - 0.5) * 150;
          z = radius * Math.sin(t);
          break;
        }
        case 'galaxy': {
          const theta = Math.random() * Math.PI * 2;
          const radius = Math.pow(Math.random(), 0.5) * 100;
          const offset = radius * 0.3;
          x = radius * Math.cos(theta + offset);
          y = (Math.random() - 0.5) * 20;
          z = radius * Math.sin(theta + offset);
          break;
        }
        case 'dna': {
          const t = i / count * Math.PI * 8;
          const side = i % 2;
          x = 40 * Math.cos(t + side * Math.PI);
          y = (i / count - 0.5) * 200;
          z = 40 * Math.sin(t + side * Math.PI);
          break;
        }
        case 'heart': {
          const t = i / count * Math.PI * 2;
          const scale = Math.min(canvas.width, canvas.height) * 0.005;
          x = scale * 16 * Math.pow(Math.sin(t), 3);
          y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
          z = (Math.random() - 0.5) * scale * 0.6;
          break;
        }
        case 'star': {
          const theta = i / count * Math.PI * 2;
          const radius = Math.floor(i / (count / 10)) % 2 === 0 ? 100 : 40;
          x = radius * Math.cos(theta);
          y = radius * Math.sin(theta);
          z = (Math.random() - 0.5) * 20;
          break;
        }
        case 'flower': {
          const theta = i / count * Math.PI * 2;
          const radius = 50 + 40 * Math.sin(6 * theta);
          x = radius * Math.cos(theta);
          y = radius * Math.sin(theta);
          z = (Math.random() - 0.5) * 30;
          break;
        }
        case 'grid': {
          const size = Math.cbrt(count);
          const index = i;
          const xIdx = index % size;
          const yIdx = Math.floor(index / size) % size;
          const zIdx = Math.floor(index / (size * size));
          x = (xIdx / size - 0.5) * 150;
          y = (yIdx / size - 0.5) * 150;
          z = (zIdx / size - 0.5) * 150;
          break;
        }
        case 'random':
          x = (Math.random() - 0.5) * 200;
          y = (Math.random() - 0.5) * 200;
          z = (Math.random() - 0.5) * 200;
          break;
        case 'explosion': {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = Math.pow(Math.random(), 0.3) * 120;
          x = radius * Math.sin(phi) * Math.cos(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(phi);
          break;
        }
        case 'vortex': {
          const t = i / count * Math.PI * 6;
          const radius = i / count * 100;
          x = radius * Math.cos(t);
          y = (i / count - 0.5) * 150;
          z = radius * Math.sin(t);
          break;
        }
        case 'mobius': {
          const t = i / count * Math.PI * 2;
          const u = (Math.random() - 0.5) * 0.4;
          x = (60 + u * Math.cos(t / 2)) * Math.cos(t);
          y = (60 + u * Math.cos(t / 2)) * Math.sin(t);
          z = u * Math.sin(t / 2);
          break;
        }
        default:
          // Default to sphere
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = 80 + Math.random() * 40;
          x = radius * Math.sin(phi) * Math.cos(theta);
          y = radius * Math.sin(phi) * Math.sin(theta);
          z = radius * Math.cos(phi);
      }
      
      positions.push({ x, y, z });
    }
    return positions;
  }

  // Initialize canvas
  function initCanvas() {
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);
  }

  // Initialize particles
  function initParticles() {
    const positions = generateParticles(currentMode, config.particleCount);
    particles = positions.map(pos => ({
      x: pos.x,
      y: pos.y,
      z: pos.z,
      baseX: pos.x,
      baseY: pos.y,
      baseZ: pos.z,
      targetX: pos.x,
      targetY: pos.y,
      targetZ: pos.z,
      vx: 0,
      vy: 0,
      vz: 0
    }));
    transitionProgress = 1;
  }

  // Easing function (ease-in-out cubic)
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Update particles
  function updateParticles() {
    // Handle mode transition
    if (currentMode !== targetMode) {
      const targetPositions = generateParticles(targetMode, config.particleCount);
      
      if (transitionProgress < 1) {
        transitionProgress += 1 / (config.transitionDuration * 60);
        if (transitionProgress > 1) transitionProgress = 1;
      }
      
      const eased = easeInOutCubic(transitionProgress);
      
      particles.forEach((particle, i) => {
        if (i < targetPositions.length) {
          particle.targetX = targetPositions[i].x;
          particle.targetY = targetPositions[i].y;
          particle.targetZ = targetPositions[i].z;
          
          if (transitionProgress < 1) {
            particle.baseX += (particle.targetX - particle.baseX) * eased * 0.1;
            particle.baseY += (particle.targetY - particle.baseY) * eased * 0.1;
            particle.baseZ += (particle.targetZ - particle.baseZ) * eased * 0.1;
          } else {
            particle.baseX = particle.targetX;
            particle.baseY = particle.targetY;
            particle.baseZ = particle.targetZ;
          }
        }
      });
      
      if (transitionProgress >= 1) {
        currentMode = targetMode;
      }
    }

    // Update mouse influence
    const mouseX = mouse.y * config.mouseInfluence;
    const mouseY = mouse.x * config.mouseInfluence;
    rotation.x += (mouseX - rotation.x) * 0.05;
    rotation.y += (mouseY - rotation.y) * 0.05;
    rotation.y += config.rotationSpeed;

    // Update particles
    particles.forEach(particle => {
      if (config.physicsEnabled) {
        // Apply gravity
        particle.vy += config.gravity * 0.1;

        // Mouse interaction
        const mouseWorldX = mouse.x * 100;
        const mouseWorldY = mouse.y * 100;
        const dx = particle.x - mouseWorldX;
        const dy = particle.y - mouseWorldY;
        const dz = particle.z - 0;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Repulsion
        if (config.mouseRepulsion > 0 && dist > 0 && dist < 200) {
          const force = config.mouseRepulsion * 100 / (dist * dist + 1);
          particle.vx += (dx / dist) * force;
          particle.vy += (dy / dist) * force;
          particle.vz += (dz / dist) * force;
        }

        // Attraction
        if (config.mouseAttraction > 0 && dist > 0) {
          const force = config.mouseAttraction * 0.5 / (dist + 1);
          particle.vx -= (dx / dist) * force;
          particle.vy -= (dy / dist) * force;
          particle.vz -= (dz / dist) * force;
        }

        // Turbulence
        if (config.turbulence > 0) {
          particle.vx += (Math.random() - 0.5) * config.turbulence * 0.5;
          particle.vy += (Math.random() - 0.5) * config.turbulence * 0.5;
          particle.vz += (Math.random() - 0.5) * config.turbulence * 0.5;
        }

        // Spring to base position
        const spring = 0.01;
        particle.vx += (particle.baseX - particle.x) * spring;
        particle.vy += (particle.baseY - particle.y) * spring;
        particle.vz += (particle.baseZ - particle.z) * spring;

        // Apply damping
        particle.vx *= config.damping;
        particle.vy *= config.damping;
        particle.vz *= config.damping;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.z += particle.vz;
      } else {
        particle.x = particle.baseX;
        particle.y = particle.baseY;
        particle.z = particle.baseZ;
      }
    });
  }

  // Render particles
  function render() {
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

    // Transform particles to 3D space
    const transformed = particles.map(particle => {
      let x = particle.x;
      let y = particle.y;
      let z = particle.z;

      // Rotate around Y axis
      const cosY = Math.cos(rotation.y);
      const sinY = Math.sin(rotation.y);
      const tempX = x * cosY - z * sinY;
      z = x * sinY + z * cosY;
      x = tempX;

      // Rotate around X axis
      const cosX = Math.cos(rotation.x);
      const sinX = Math.sin(rotation.x);
      const tempY = y * cosX - z * sinX;
      z = y * sinX + z * cosX;
      y = tempY;

      // Apply camera
      x -= config.cameraX;
      y -= config.cameraY;
      z -= config.cameraZ;

      return { x, y, z };
    });

    // Sort by depth (z)
    transformed.sort((a, b) => b.z - a.z);

    // Render particles
    ctx.fillStyle = config.particleColor;
    transformed.forEach(particle => {
      const scale = config.fieldOfView / (config.fieldOfView + particle.z) * config.cameraZoom;
      const screenX = particle.x * scale + canvas.width / 4;
      const screenY = particle.y * scale + canvas.height / 4;
      const size = Math.max(0.1, config.particleSize * scale);

      ctx.beginPath();
      ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Animation loop
  function animate() {
    if (prefersReducedMotion) {
      render();
      return;
    }

    updateParticles();
    render();
    animationId = requestAnimationFrame(animate);
  }

  // Mouse handler
  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  // Initialize
  initCanvas();
  initParticles();
  
  // Start animation
  if (!prefersReducedMotion) {
    canvas.addEventListener('mousemove', handleMouseMove);
    animate();
  } else {
    render();
  }

  // Handle resize
  window.addEventListener('resize', () => {
    initCanvas();
  });

  // Cleanup
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    canvas.removeEventListener('mousemove', handleMouseMove);
  });

  // Expose mode switching for controls
  window.particleShapesModule = {
    setMode: (mode) => {
      if (modes.find(m => m.id === mode)) {
        targetMode = mode;
        transitionProgress = 0;
      }
    },
    getModes: () => modes,
    getCurrentMode: () => currentMode
  };
})();
