// L2 Three.js rising bubbles for #riseBubbles - positioned behind Errl and between nav bubbles
(function(){
  const cvs = document.getElementById('riseBubbles');
  if (!cvs) return;

  // Import Three.js
  import('https://esm.run/three').then((THREE) => {
    const T = THREE.default || THREE;
    
    let scene, camera, renderer;
    let bubbles = [];
    // Count actual navigation bubbles (8 total: 7 visible + 1 hidden)
    function countNavBubbles() {
      const navBubbles = document.querySelectorAll('.bubble:not(.hidden-bubble)');
      const hidden = document.querySelector('.bubble.hidden-bubble');
      return navBubbles.length + (hidden && hidden.style.display !== 'none' ? 1 : 0);
    }

    // Create multiple bubbles per nav position for richer effect
    // Match the 8 navigation bubble pages/positions
    const navCount = Math.max(8, countNavBubbles());
    const bubblesPerNav = 2; // 2 bubbles per nav position = 16 total bubbles (more visually interesting)
    const bubbleCount = navCount * bubblesPerNav;

    // Shader materials for iridescent bubbles
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform float uTime;

      // HSV to RGB conversion
      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }
      
      // Simple noise
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = 1.0 - dot(viewDir, vNormal);
        fresnel = pow(fresnel, 2.0);

        // Rainbow colors based on view angle and time
        float hue = vNormal.y * 0.2 + uTime * 0.1 + noise(vNormal.xy * 5.0) * 0.1;
        vec3 rainbow = hsv2rgb(vec3(hue, 0.7, 1.0));
        
        vec3 finalColor = mix(vec3(0.1, 0.1, 0.2), rainbow, fresnel);
        
        // Specular highlight
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float specular = pow(max(dot(reflect(-lightDir, vNormal), viewDir), 0.0), 32.0);
        
        gl_FragColor = vec4(finalColor + specular * 0.8, fresnel * 0.4 + 0.15);
      }
    `;

    function init() {
      // Scene
      scene = new T.Scene();
      scene.fog = new T.Fog(0x000510, 10, 100);

      // Camera - positioned to match the scene's perspective
      camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 25); // Looking at center

      // Renderer - use existing canvas
      renderer = new T.WebGLRenderer({ 
        canvas: cvs, 
        antialias: true, 
        alpha: true,
        premultipliedAlpha: false 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0); // Transparent background

      // Lights
      const ambientLight = new T.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new T.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Bubble material (shared)
      const bubbleGeometry = new T.SphereGeometry(1, 32, 32);
      const bubbleMaterial = new T.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0.0 }
        },
        transparent: true,
        blending: T.AdditiveBlending,
        depthWrite: false,
        side: T.DoubleSide
      });

      // Get nav bubble orbital data from actual DOM elements
      const navBubbles = Array.from(document.querySelectorAll('.bubble:not(.hidden-bubble)'));
      const navAngles = navBubbles.map(b => parseFloat(b.dataset.angle || '0'));
      const navDists = navBubbles.map(b => parseFloat(b.dataset.dist || '180'));
      
      // Calculate screen-to-3D scaling factor
      // Nav bubbles use screen pixels (dist ~150-200px), convert to 3D world units
      // Typical nav bubble distance is ~180px, which we'll map to ~10-15 world units
      const screenToWorldScale = 12 / 180; // Scale factor: 12 world units per 180px

      // Create bubbles positioned in 3D space
      // Some behind Errl (negative z), some in front/behind nav bubbles (positive/negative z)
      // Positioned to match nav bubble orbital regions
      // Create bubbles per nav position for better distribution
      const bubblesPerNav = Math.ceil(bubbleCount / Math.max(navAngles.length, 1));
      
      for (let i = 0; i < bubbleCount; i++) {
        const bubble = new T.Mesh(bubbleGeometry, bubbleMaterial.clone());
        
        // Use nav bubble positions as reference
        const navIndex = Math.floor(i / bubblesPerNav) % Math.max(navAngles.length, 1);
        const angle = navAngles[navIndex] || (360 * navIndex / Math.max(navAngles.length, 8));
        const angleRad = (angle * Math.PI) / 180;
        
        // Distance from center (similar to nav bubbles but varied)
        // Convert nav bubble screen distance to 3D world distance
        const baseDist = navDists[navIndex] || 180;
        const screenDist = baseDist * screenToWorldScale; // Convert to 3D units
        const dist = screenDist * (0.8 + Math.random() * 0.4); // Vary 80-120% of nav distance (smaller scale)
        
        // Z position: distribute between layers
        // Layer 0: Behind Errl (z: -20 to -10)
        // Layer 1: Behind nav bubbles (z: -10 to 0) 
        // Layer 2: In front of nav bubbles but behind camera plane (z: 0 to 10)
        // Layer 3: In front of nav bubbles closer to camera (z: 10 to 20)
        const layer = i % 4;
        let zPos;
        if (layer === 0) {
          // Far behind Errl
          zPos = -20 - Math.random() * 5;
        } else if (layer === 1) {
          // Behind Errl, behind nav bubble plane
          zPos = -10 + Math.random() * 5;
        } else if (layer === 2) {
          // In front of Errl, behind nav bubble plane
          zPos = -2 + Math.random() * 4;
        } else {
          // In front of nav bubble plane (closer to camera)
          zPos = 2 + Math.random() * 8;
        }
        
        // X and Y positions based on orbital angle with some variation
        const angleVariation = (Math.random() - 0.5) * 30; // ±15 degrees
        const finalAngle = angleRad + (angleVariation * Math.PI / 180);
        const x = Math.cos(finalAngle) * dist + (Math.random() - 0.5) * 3;
        const y = Math.sin(finalAngle) * dist + (Math.random() - 0.5) * 3;
        
        // Start at bottom with random offset
        bubble.position.set(x, -25 - Math.random() * 20, zPos);
        
        // Random scale (smaller bubbles for depth effect)
        const baseScale = 0.4 + Math.random() * 1.2;
        // Scale down based on z distance (farther = smaller)
        const zScale = Math.max(0.5, 1 - (Math.abs(zPos) / 30));
        const scale = baseScale * zScale;
        bubble.scale.set(scale, scale, scale);
        // Store base scale for density updates
        bubble.userData.baseScale = baseScale;
        bubble.userData.zScale = zScale;
        
        // Velocity (slowly rising with slight orbital drift)
        const drift = (Math.random() - 0.5) * 0.008;
        const baseVelY = Math.random() * 0.04 + 0.015; // Base rise speed
        bubble.userData.velocity = new T.Vector3(
          Math.cos(finalAngle + Math.PI/2) * drift + (Math.random() - 0.5) * 0.003,
          baseVelY, // Base rise speed (will be multiplied by speed control)
          (Math.random() - 0.5) * 0.004
        );
        bubble.userData.baseVelocity = new T.Vector3(
          Math.cos(finalAngle + Math.PI/2) * drift + (Math.random() - 0.5) * 0.003,
          baseVelY,
          (Math.random() - 0.5) * 0.004
        );
        
        // Store original data
        bubble.userData.angle = angle;
        bubble.userData.dist = dist;
        bubble.userData.layer = layer;
        
        bubbles.push(bubble);
        scene.add(bubble);
      }
    }

    function resetBubble(bubble, index) {
      // Reset bubble to bottom maintaining its layer and nav association
      const navBubbles = Array.from(document.querySelectorAll('.bubble:not(.hidden-bubble)'));
      const navAngles = navBubbles.map(b => parseFloat(b.dataset.angle || '0'));
      const navDists = navBubbles.map(b => parseFloat(b.dataset.dist || '180'));
      const bubblesPerNav = Math.ceil(bubbleCount / Math.max(navAngles.length, 1));
      
      const navIndex = Math.floor(index / bubblesPerNav) % Math.max(navAngles.length, 1);
      const angle = navAngles[navIndex] || (360 * navIndex / Math.max(navAngles.length, 8));
      const angleRad = (angle * Math.PI) / 180;
      
      const screenToWorldScale = 12 / 180;
      const baseDist = navDists[navIndex] || 180;
      const screenDist = baseDist * screenToWorldScale;
      const dist = screenDist * (0.8 + Math.random() * 0.4);
      
      // Maintain original layer
      const layer = bubble.userData.layer !== undefined ? bubble.userData.layer : (index % 4);
      let zPos;
      if (layer === 0) {
        zPos = -20 - Math.random() * 5;
      } else if (layer === 1) {
        zPos = -10 + Math.random() * 5;
      } else if (layer === 2) {
        zPos = -2 + Math.random() * 4;
      } else {
        zPos = 2 + Math.random() * 8;
      }
      
      const angleVariation = (Math.random() - 0.5) * 30;
      const finalAngle = angleRad + (angleVariation * Math.PI / 180);
      const x = Math.cos(finalAngle) * dist + (Math.random() - 0.5) * 3;
      const y = Math.sin(finalAngle) * dist + (Math.random() - 0.5) * 3;
      
      bubble.position.set(x, -25 - Math.random() * 20, zPos);
      
      const baseScale = 0.4 + Math.random() * 1.2;
      const zScale = Math.max(0.5, 1 - (Math.abs(zPos) / 30));
      const scale = baseScale * zScale;
      bubble.scale.set(scale, scale, scale);
      // Store base scale for density updates
      bubble.userData.baseScale = baseScale;
      bubble.userData.zScale = zScale;
      
      const drift = (Math.random() - 0.5) * 0.008;
      const baseVelY = Math.random() * 0.04 + 0.015;
      bubble.userData.velocity = new T.Vector3(
        Math.cos(finalAngle + Math.PI/2) * drift + (Math.random() - 0.5) * 0.003,
        baseVelY,
        (Math.random() - 0.5) * 0.004
      );
      bubble.userData.baseVelocity = new T.Vector3(
        Math.cos(finalAngle + Math.PI/2) * drift + (Math.random() - 0.5) * 0.003,
        baseVelY,
        (Math.random() - 0.5) * 0.004
      );
      
      bubble.userData.layer = layer;
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const clock = new T.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update bubbles
      bubbles.forEach((bubble, index) => {
        // Add velocity (speed is applied in updateBubbleSpeeds when control changes)
        bubble.position.add(bubble.userData.velocity);
        
        // Update shader time
        bubble.material.uniforms.uTime.value = elapsedTime;
        
        // Reset if too high
        if (bubble.position.y > 30) {
          resetBubble(bubble, index);
        }
      });

      renderer.render(scene, camera);
    }

    // Initialize
    init();
    window.addEventListener('resize', onWindowResize);
    animate();

    // Control state
    let controls = {
      speed: 1.0,
      density: 1.0,
      alpha: 0.95,
      wobble: 1.0,
      freq: 1.0,
      minSize: 14,
      maxSize: 36,
      sizeHz: 0.0,
      jumboPct: 0.1,
      jumboScale: 1.6,
      attract: true,
      attractIntensity: 1.0,
      ripples: false,
      rippleIntensity: 1.2
    };

    // Update bubble velocities based on speed
    function updateBubbleSpeeds() {
      bubbles.forEach((bubble) => {
        // Initialize baseVelocity if missing (for bubbles created before controls were added)
        if (!bubble.userData.baseVelocity && bubble.userData.velocity) {
          // Clone the velocity vector to preserve original values
          const vel = bubble.userData.velocity;
          bubble.userData.baseVelocity = new T.Vector3(vel.x, vel.y, vel.z);
        }
        const baseVel = bubble.userData.baseVelocity || bubble.userData.velocity;
        if (baseVel && bubble.userData.velocity) {
          bubble.userData.velocity.x = baseVel.x * controls.speed;
          bubble.userData.velocity.y = baseVel.y * controls.speed;
          bubble.userData.velocity.z = baseVel.z * controls.speed;
        }
      });
    }

    // Update bubble alpha
    function updateBubbleAlpha() {
      bubbles.forEach((bubble) => {
        if (bubble.material) {
          bubble.material.transparent = true;
          // Alpha is controlled in shader, but we can adjust opacity
          bubble.material.opacity = controls.alpha;
        }
      });
    }

    // Update bubble sizes (for new bubbles)
    function updateBubbleSizes() {
      bubbles.forEach((bubble) => {
        const baseScale = bubble.userData.baseScale || 1.0;
        const zScale = bubble.userData.zScale || 1.0;
        const sizeMultiplier = controls.density;
        const scale = baseScale * zScale * sizeMultiplier;
        bubble.scale.set(scale, scale, scale);
      });
    }

    // Expose control interface
    window.errlRisingBubblesThree = {
      scene,
      camera,
      renderer,
      bubbles,
      setSpeed(value) {
        controls.speed = Math.max(0, Math.min(3, parseFloat(value) || 1));
        updateBubbleSpeeds();
      },
      setDensity(value) {
        controls.density = Math.max(0, Math.min(2, parseFloat(value) || 1));
        updateBubbleSizes();
      },
      setAlpha(value) {
        controls.alpha = Math.max(0, Math.min(1, parseFloat(value) || 0.95));
        updateBubbleAlpha();
      },
      setWobble(value) {
        controls.wobble = Math.max(0, Math.min(2, parseFloat(value) || 1));
      },
      setFreq(value) {
        controls.freq = Math.max(0, Math.min(2, parseFloat(value) || 1));
      },
      setMinSize(value) {
        controls.minSize = Math.max(6, Math.min(256, parseInt(value) || 14));
      },
      setMaxSize(value) {
        controls.maxSize = Math.max(6, Math.min(256, parseInt(value) || 36));
      },
      setSizeHz(value) {
        controls.sizeHz = Math.max(0, Math.min(1, parseFloat(value) || 0));
      },
      setJumboPct(value) {
        controls.jumboPct = Math.max(0, Math.min(0.6, parseFloat(value) || 0.1));
      },
      setJumboScale(value) {
        controls.jumboScale = Math.max(1.0, Math.min(2.5, parseFloat(value) || 1.6));
      },
      setAttract(value) {
        controls.attract = !!value;
      },
      setAttractIntensity(value) {
        controls.attractIntensity = Math.max(0, Math.min(2, parseFloat(value) || 1.0));
      },
      setRipples(value) {
        controls.ripples = !!value;
      },
      setRippleIntensity(value) {
        controls.rippleIntensity = Math.max(0, Math.min(2, parseFloat(value) || 1.2));
      },
      getControls() {
        return { ...controls };
      },
      stopAnimation() {
        // This is a no-op for now, but can be used to stop any future animations
        // Currently animations are handled in portal-app.js
      }
    };
  }).catch(err => {
    console.error('[rise-bubbles-three] Failed to load Three.js:', err);
    // Fallback: keep canvas but hide it
    if (cvs) cvs.style.display = 'none';
  });
})();

