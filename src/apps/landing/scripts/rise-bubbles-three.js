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
      const navBubbles = document.querySelectorAll('.nav-orbit .bubble:not(.hidden-bubble)');
      const hidden = document.querySelector('.nav-orbit .bubble.hidden-bubble');
      return navBubbles.length + (hidden && hidden.style.display !== 'none' ? 1 : 0);
    }

    // Create multiple bubbles per nav position for richer effect
    // Match the 8 navigation bubble pages/positions
    const navCount = Math.max(8, countNavBubbles());
    const bubblesPerNav = 2; // 2 bubbles per nav position = 16 total bubbles (more visually interesting)
    const baseBubbleCount = navCount * bubblesPerNav;
    const maxCountMultiplier = 2; // matches Errl Phone rbDensity max
    const bubblePoolCount = Math.ceil(baseBubbleCount * maxCountMultiplier);

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
      const navBubbles = Array.from(document.querySelectorAll('.nav-orbit .bubble:not(.hidden-bubble)'));
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
      const bubblesPerNav = Math.ceil(bubblePoolCount / Math.max(navAngles.length, 1));
      
      for (let i = 0; i < bubblePoolCount; i++) {
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
      const navBubbles = Array.from(document.querySelectorAll('.nav-orbit .bubble:not(.hidden-bubble)'));
      const navAngles = navBubbles.map(b => parseFloat(b.dataset.angle || '0'));
      const navDists = navBubbles.map(b => parseFloat(b.dataset.dist || '180'));
      const bubblesPerNav = Math.ceil(bubblePoolCount / Math.max(navAngles.length, 1));
      
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
      // Reset dynamic state so we don't “jump” when wobble/impulses apply
      try {
        if (bubble.userData.impulse && bubble.userData.impulse.set) bubble.userData.impulse.set(0, 0, 0);
        if (bubble.userData.wobbleOffset && bubble.userData.wobbleOffset.set) bubble.userData.wobbleOffset.set(0, 0, 0);
        // Force re-roll sizing next frame (handled by refreshBubbleBaseScale in the main loop)
        bubble.userData.sizePx = null;
        bubble.userData.baseWorldScale = null;
      } catch (_) {}
    }

    // Control state
    // NOTE: `density` is now a COUNT multiplier (matches Errl Phone label). `scale` controls bubble size.
    let controls = {
      speed: 1.0,
      density: 1.0, // 0..2 count multiplier
      scale: 1.0,   // 0.5..2 size multiplier
      alpha: 0.95,
      wobble: 1.0,
      freq: 1.0,
      minSize: 14,  // px
      maxSize: 36,  // px
      sizeHz: 0.0,  // 0..1 Hz
      jumboPct: 0.1,
      jumboScale: 1.6,
      attract: true,
      attractIntensity: 1.0,
      ripples: false,
      rippleIntensity: 1.2
    };

    function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
    function safeNum(v, fallback){
      const n = (typeof v === 'number') ? v : parseFloat(String(v || ''));
      return Number.isFinite(n) ? n : fallback;
    }
    function normalizeMinMax(){
      controls.minSize = clamp(Math.round(safeNum(controls.minSize, 14)), 6, 256);
      controls.maxSize = clamp(Math.round(safeNum(controls.maxSize, 36)), 6, 256);
      if (controls.maxSize < controls.minSize) controls.maxSize = controls.minSize;
    }

    const pointer = { x: 0, y: 0, active: false }; // NDC (-1..1)
    const raycaster = new T.Raycaster();
    const pickRaycaster = new T.Raycaster();
    const tmpVel = new T.Vector3();
    const tmpDir = new T.Vector3();
    const tmpOrigin = new T.Vector3();
    const tmpPoint = new T.Vector3();
    const tmpGrab = new T.Vector3();
    const tmpOffset = new T.Vector3();
    let lastElapsedTime = 0;
    const rippleEvents = []; // { x, y, t }

    // Grab/throw interaction state (canvas-driven)
    const grabState = {
      active: false,
      pointerId: null,
      bubble: null,
      bubbleIndex: -1,
      grabZ: 0,
      offset: new T.Vector3(0, 0, 0),
      // Recent world points (for velocity estimate)
      history: [] // { x, y, tMs }
    };

    const flickState = {
      active: false,
      pointerId: null,
      history: [] // { x, y, tMs } in z=0 plane
    };

    function nowMs(){ return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
    function pushHistory(arr, x, y, tMs, max = 6){
      arr.push({ x, y, tMs });
      if (arr.length > max) arr.splice(0, arr.length - max);
    }
    function estimateVelocityWorldPerSec(arr){
      if (!arr || arr.length < 2) return { vx: 0, vy: 0 };
      const a = arr[arr.length - 1];
      // Find a previous sample with a meaningful dt.
      for (let i = arr.length - 2; i >= 0; i--) {
        const b = arr[i];
        const dt = (a.tMs - b.tMs) / 1000;
        if (dt > 0.016) {
          return { vx: (a.x - b.x) / dt, vy: (a.y - b.y) / dt };
        }
      }
      // Fallback: if all samples are too close in time, use the oldest sample for max dt.
      const b = arr[0];
      const dt = Math.max(1e-3, (a.tMs - b.tMs) / 1000);
      return { vx: (a.x - b.x) / dt, vy: (a.y - b.y) / dt };
    }
    function worldImpulseFromVelocity(vx, vy, clampMag){
      // Simulation integrates per-frame (no explicit dt), so convert world/sec -> world/frame.
      const fps = 60;
      let ix = (vx / fps);
      let iy = (vy / fps);
      const mag = Math.hypot(ix, iy);
      const m = (typeof clampMag === 'number') ? clampMag : 1.25;
      if (mag > m && mag > 1e-6) {
        const s = m / mag;
        ix *= s; iy *= s;
      }
      return { ix, iy };
    }
    function getNdcFromEvent(e){
      // Use canvas bounds to be robust even if canvas isn't full-viewport.
      const rect = cvs.getBoundingClientRect();
      const x = (e.clientX - rect.left) / Math.max(1, rect.width);
      const y = (e.clientY - rect.top) / Math.max(1, rect.height);
      return { x: x * 2 - 1, y: -(y * 2 - 1) };
    }
    function pointOnPlaneZ(ndc, planeZ, out){
      if (!camera) return null;
      pickRaycaster.setFromCamera(ndc, camera);
      const dir = pickRaycaster.ray.direction;
      const org = pickRaycaster.ray.origin;
      if (Math.abs(dir.z) < 1e-6) return null;
      const t = (planeZ - org.z) / dir.z;
      if (!Number.isFinite(t)) return null;
      out.copy(org).add(tmpDir.copy(dir).multiplyScalar(t));
      return out;
    }
    function computeBoundsAtZ(z){
      if (!camera) return { halfW: 20, halfH: 20 };
      const fov = (camera.fov * Math.PI) / 180;
      const dist = Math.max(0.01, camera.position.z - z);
      const halfH = Math.tan(fov / 2) * dist;
      const halfW = halfH * (camera.aspect || (window.innerWidth / Math.max(1, window.innerHeight)));
      return { halfW, halfH };
    }

    function getActiveCount(){
      const mult = clamp(safeNum(controls.density, 1.0), 0, maxCountMultiplier);
      return clamp(Math.round(baseBubbleCount * mult), 0, bubblePoolCount);
    }

    function updateBubbleVisibility(){
      const active = getActiveCount();
      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        if (!b) continue;
        const nextVisible = i < active;
        const wasVisible = b.visible !== false;
        b.visible = nextVisible;
        // If a bubble becomes newly active, reset it so it doesn't "pop" mid-field.
        if (nextVisible && !wasVisible) {
          resetBubble(b, i);
          refreshBubbleBaseScale(b, { reroll: true });
        }
      }
    }

    function computeWorldScaleForPx(px, z){
      if (!camera) return 1;
      const fov = (camera.fov * Math.PI) / 180;
      const dist = Math.max(0.01, camera.position.z - z);
      const worldH = 2 * Math.tan(fov / 2) * dist;
      const worldPerPx = worldH / Math.max(1, window.innerHeight || 1);
      const worldDiameter = px * worldPerPx;
      // Sphere geometry diameter is ~2 at scale=1
      return worldDiameter / 2;
    }

    function pickBaseSizePx(){
      normalizeMinMax();
      const span = Math.max(0, controls.maxSize - controls.minSize);
      let px = controls.minSize + Math.random() * span;
      if (Math.random() < clamp(controls.jumboPct, 0, 0.6)) {
        px *= clamp(controls.jumboScale, 1.0, 2.5);
      }
      return clamp(px, 6, 512);
    }

    function ensureBubbleState(b){
      if (!b || !b.userData) b.userData = {};
      if (!b.userData.baseVelocity && b.userData.velocity) {
        const vel = b.userData.velocity;
        b.userData.baseVelocity = new T.Vector3(vel.x, vel.y, vel.z);
      }
      if (!b.userData.baseVelocity) b.userData.baseVelocity = new T.Vector3(0, 0.02, 0);
      if (!b.userData.impulse) b.userData.impulse = new T.Vector3(0, 0, 0);
      if (!b.userData.wobbleOffset) b.userData.wobbleOffset = new T.Vector3(0, 0, 0);
      if (!Number.isFinite(b.userData.wobblePhase)) b.userData.wobblePhase = Math.random() * Math.PI * 2;
      if (!Number.isFinite(b.userData.sizePhase)) b.userData.sizePhase = Math.random() * Math.PI * 2;
      if (!Number.isFinite(b.userData.sizePx)) b.userData.sizePx = pickBaseSizePx();
      if (!Number.isFinite(b.userData.baseWorldScale)) {
        b.userData.baseWorldScale = computeWorldScaleForPx(b.userData.sizePx, b.position ? b.position.z : 0);
      }
    }

    function refreshBubbleBaseScale(b, { reroll = false } = {}){
      ensureBubbleState(b);
      if (reroll) b.userData.sizePx = pickBaseSizePx();
      // Clamp to new min/max (and also allow jumbo to exceed max)
      normalizeMinMax();
      const baseMax = Math.max(controls.maxSize, controls.minSize);
      const jumboMax = baseMax * clamp(safeNum(controls.jumboScale, 1.6), 1.0, 2.5);
      const upperPx = clamp(jumboMax, controls.minSize, 512);
      b.userData.sizePx = clamp(b.userData.sizePx, controls.minSize, upperPx);
      b.userData.baseWorldScale = computeWorldScaleForPx(b.userData.sizePx, b.position ? b.position.z : 0);
    }

    function refreshAllBubbleBaseScales({ reroll = false } = {}){
      bubbles.forEach((b) => {
        if (!b) return;
        refreshBubbleBaseScale(b, { reroll });
      });
    }

    function applyBubbleAlpha(){
      bubbles.forEach((b) => {
        if (!b || !b.material) return;
        b.material.transparent = true;
        b.material.opacity = clamp(safeNum(controls.alpha, 0.95), 0, 1);
      });
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      // Keep min/max size expressed in pixels consistent across resizes.
      refreshAllBubbleBaseScales({ reroll: false });
    }

    // Pointer tracking for attract/ripples
    window.addEventListener('pointermove', (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      pointer.x = (e.clientX / w) * 2 - 1;
      pointer.y = -(e.clientY / h) * 2 + 1;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
    window.addEventListener('pointerdown', (e) => {
      // If another handler intentionally consumed this press (e.g. grab/throw), don't emit ripples.
      try { if (e && e.defaultPrevented) return; } catch(_) {}
      if (!controls.ripples) return;
      if (!camera) return;
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const x = (e.clientX / w) * 2 - 1;
      const y = -(e.clientY / h) * 2 + 1;
      raycaster.setFromCamera({ x, y }, camera);
      const dir = raycaster.ray.direction;
      const org = raycaster.ray.origin;
      if (Math.abs(dir.z) < 1e-6) return;
      const t = (0 - org.z) / dir.z; // plane z=0
      if (!Number.isFinite(t)) return;
      const p = org.clone().add(dir.clone().multiplyScalar(t));
      rippleEvents.push({ x: p.x, y: p.y, t: lastElapsedTime });
      if (rippleEvents.length > 6) rippleEvents.shift();
    }, { passive: true });

    // Grab/throw + flick interactions (attach to canvas)
    // Note: requires CSS `touch-action: none` on #riseBubbles to feel right on mobile.
    cvs.addEventListener('pointerdown', (e) => {
      try {
        // Only primary contact
        if (e.isPrimary === false) return;
        // Prevent ripple handler + browser gestures during active interaction
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
          try { e.preventDefault(); } catch(_) {}
        }

        const ndc = getNdcFromEvent(e);
        // Sync global pointer for existing attract behavior (best-effort).
        pointer.x = ndc.x;
        pointer.y = ndc.y;
        pointer.active = true;

        // Raycast to find a bubble to grab.
        if (camera) {
          pickRaycaster.setFromCamera(ndc, camera);
          const hits = pickRaycaster.intersectObjects(bubbles, false);
          const hit = hits && hits.length ? hits.find(h => h && h.object && h.object.visible !== false) : null;
          if (hit && hit.object) {
            grabState.active = true;
            grabState.pointerId = e.pointerId;
            grabState.bubble = hit.object;
            grabState.bubbleIndex = bubbles.indexOf(hit.object);
            grabState.grabZ = hit.object.position.z;
            grabState.history = [];
            // Offset so bubble doesn't snap its center to pointer hit point.
            grabState.offset.copy(hit.object.position).sub(hit.point);
            // Stop existing impulses while grabbed.
            try {
              hit.object.userData = hit.object.userData || {};
              hit.object.userData.isGrabbed = true;
              hit.object.userData.isThrown = false;
              hit.object.userData.thrownAt = 0;
              if (hit.object.userData.impulse && hit.object.userData.impulse.set) hit.object.userData.impulse.set(0, 0, 0);
            } catch(_) {}
            // Capture pointer so release is reliable.
            try { cvs.setPointerCapture && cvs.setPointerCapture(e.pointerId); } catch(_) {}
            // Seed history with current position on grab plane.
            const p = pointOnPlaneZ(ndc, grabState.grabZ, tmpGrab);
            if (p) pushHistory(grabState.history, p.x, p.y, nowMs());
            return;
          }
        }

        // No bubble hit: track for flick impulse.
        flickState.active = true;
        flickState.pointerId = e.pointerId;
        flickState.history = [];
        const p0 = pointOnPlaneZ(ndc, 0, tmpPoint);
        if (p0) pushHistory(flickState.history, p0.x, p0.y, nowMs());
        try { cvs.setPointerCapture && cvs.setPointerCapture(e.pointerId); } catch(_) {}
      } catch(_) {}
    }, { passive: false });

    cvs.addEventListener('pointermove', (e) => {
      try {
        const ndc = getNdcFromEvent(e);
        pointer.x = ndc.x;
        pointer.y = ndc.y;
        pointer.active = true;

        if (grabState.active && grabState.pointerId === e.pointerId && grabState.bubble) {
          if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            try { e.preventDefault(); } catch(_) {}
          }
          const p = pointOnPlaneZ(ndc, grabState.grabZ, tmpGrab);
          if (!p) return;
          const tMs = nowMs();
          pushHistory(grabState.history, p.x, p.y, tMs);
          // Follow pointer on plane, preserving the original offset.
          grabState.bubble.position.x = p.x + grabState.offset.x;
          grabState.bubble.position.y = p.y + grabState.offset.y;
          // Keep z fixed.
          grabState.bubble.position.z = grabState.grabZ;
          // While dragging, zero impulse so it doesn't fight the hand.
          try {
            const ud = grabState.bubble.userData || (grabState.bubble.userData = {});
            if (ud.impulse && ud.impulse.set) ud.impulse.set(0, 0, 0);
          } catch(_) {}
          return;
        }

        if (flickState.active && flickState.pointerId === e.pointerId) {
          if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            try { e.preventDefault(); } catch(_) {}
          }
          const p = pointOnPlaneZ(ndc, 0, tmpPoint);
          if (p) pushHistory(flickState.history, p.x, p.y, nowMs());
        }
      } catch(_) {}
    }, { passive: false });

    function endInteraction(e){
      try {
        const ndc = e ? getNdcFromEvent(e) : null;
        if (ndc) { pointer.x = ndc.x; pointer.y = ndc.y; }

        // Release grab -> throw impulse.
        if (grabState.active && grabState.pointerId === (e && e.pointerId) && grabState.bubble) {
          const vel = estimateVelocityWorldPerSec(grabState.history);
          const imp = worldImpulseFromVelocity(vel.vx, vel.vy, 1.6);
          const b = grabState.bubble;
          try {
            b.userData = b.userData || {};
            b.userData.isGrabbed = false;
            // Mark "thrown" briefly so upward clamp doesn't prevent downward throws.
            b.userData.isThrown = true;
            b.userData.thrownAt = lastElapsedTime;
            if (!b.userData.impulse) b.userData.impulse = new T.Vector3(0, 0, 0);
            b.userData.impulse.x += imp.ix * 0.9;
            b.userData.impulse.y += imp.iy * 0.9;
          } catch(_) {}
          // Clear state.
          grabState.active = false;
          grabState.pointerId = null;
          grabState.bubble = null;
          grabState.bubbleIndex = -1;
          grabState.history = [];
        }

        // Flick impulse (no grab): apply to nearest bubble under pointer (or near pointer).
        if (flickState.active && flickState.pointerId === (e && e.pointerId)) {
          const vel = estimateVelocityWorldPerSec(flickState.history);
          const speed = Math.hypot(vel.vx, vel.vy);
          const fastEnough = speed > 12; // world/sec threshold
          if (fastEnough && camera && ndc) {
            // Prefer a direct hit under finger.
            pickRaycaster.setFromCamera(ndc, camera);
            const hits = pickRaycaster.intersectObjects(bubbles, false);
            let target = (hits && hits.length) ? hits.find(h => h && h.object && h.object.visible !== false) : null;

            // If no direct hit, pick closest bubble in screen space (small radius).
            if (!target) {
              let best = null;
              let bestD2 = Infinity;
              const rect = cvs.getBoundingClientRect();
              const px = e.clientX - rect.left;
              const py = e.clientY - rect.top;
              const maxPx = 70;
              for (let i = 0; i < bubbles.length; i++) {
                const b = bubbles[i];
                if (!b || b.visible === false) continue;
                tmpPoint.copy(b.position).project(camera);
                const sx = (tmpPoint.x * 0.5 + 0.5) * rect.width;
                const sy = (-tmpPoint.y * 0.5 + 0.5) * rect.height;
                const dx = sx - px;
                const dy = sy - py;
                const d2 = dx*dx + dy*dy;
                if (d2 < bestD2 && d2 <= maxPx * maxPx) { bestD2 = d2; best = b; }
              }
              if (best) target = { object: best };
            }

            if (target && target.object) {
              const imp = worldImpulseFromVelocity(vel.vx, vel.vy, 1.2);
              const b = target.object;
              try {
                b.userData = b.userData || {};
                b.userData.isThrown = true;
                b.userData.thrownAt = lastElapsedTime;
                if (!b.userData.impulse) b.userData.impulse = new T.Vector3(0, 0, 0);
                b.userData.impulse.x += imp.ix * 0.8;
                b.userData.impulse.y += imp.iy * 0.8;
              } catch(_) {}
            }
          }
          flickState.active = false;
          flickState.pointerId = null;
          flickState.history = [];
        }

        try { if (e && cvs.releasePointerCapture) cvs.releasePointerCapture(e.pointerId); } catch(_) {}
      } catch(_) {}
    }
    cvs.addEventListener('pointerup', endInteraction, { passive: true });
    cvs.addEventListener('pointercancel', endInteraction, { passive: true });
    cvs.addEventListener('lostpointercapture', endInteraction, { passive: true });

    const clock = new T.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      lastElapsedTime = elapsedTime;

      // Precompute pointer ray for attract (we project onto per-bubble z planes)
      let rayDir = null;
      let rayOrg = null;
      if (controls.attract && pointer.active && camera) {
        raycaster.setFromCamera(pointer, camera);
        rayDir = raycaster.ray.direction;
        rayOrg = raycaster.ray.origin;
        tmpOrigin.copy(rayOrg);
      }

      // Cull old ripple events
      for (let i = rippleEvents.length - 1; i >= 0; i--) {
        if (elapsedTime - rippleEvents[i].t > 2.5) rippleEvents.splice(i, 1);
      }

      const wobbleAmt = clamp(safeNum(controls.wobble, 1.0), 0, 2);
      const wobbleHz = 0.1 + clamp(safeNum(controls.freq, 1.0), 0, 2) * 0.7;
      const wobbleOmega = wobbleHz * Math.PI * 2;
      const scaleMult = clamp(safeNum(controls.scale, 1.0), 0.5, 2.0);
      const pulseHz = clamp(safeNum(controls.sizeHz, 0), 0, 1);
      const pulseOmega = pulseHz * Math.PI * 2;
      const attractK = clamp(safeNum(controls.attractIntensity, 1.0), 0, 2) * 0.0009;
      const rippleK = clamp(safeNum(controls.rippleIntensity, 1.2), 0, 2) * 0.06;

      // Update bubbles
      bubbles.forEach((bubble, index) => {
        if (!bubble || bubble.visible === false) return;
        ensureBubbleState(bubble);

        // If currently grabbed, let the pointer handlers own position (no wobble/forces).
        if (bubble.userData && bubble.userData.isGrabbed) {
          // Keep shader time + scale updates consistent.
          if (bubble.material && bubble.material.uniforms && bubble.material.uniforms.uTime) {
            bubble.material.uniforms.uTime.value = elapsedTime;
          }
          let s = (Number.isFinite(bubble.userData.baseWorldScale) ? bubble.userData.baseWorldScale : bubble.scale.x) * scaleMult;
          if (pulseHz > 0) {
            const p = bubble.userData.sizePhase;
            const amp = 0.12 * clamp(pulseHz, 0, 1);
            s *= (1 + amp * Math.sin(elapsedTime * pulseOmega + p));
          }
          bubble.scale.set(s, s, s);
          return;
        }

        // Wobble displacement (non-accumulating): apply delta from previous wobble offset
        const oldOff = bubble.userData.wobbleOffset;
        const phase = bubble.userData.wobblePhase;
        const wobX = Math.sin(elapsedTime * wobbleOmega + phase) * 0.15 * wobbleAmt;
        const wobZ = Math.cos(elapsedTime * wobbleOmega + phase * 1.13) * 0.12 * wobbleAmt;
        const nextOffX = wobX;
        const nextOffZ = wobZ;
        bubble.position.x += (nextOffX - oldOff.x);
        bubble.position.z += (nextOffZ - oldOff.z);
        oldOff.x = nextOffX;
        oldOff.z = nextOffZ;

        // Ripple impulses (radial push)
        if (controls.ripples && rippleEvents.length) {
          for (let i = 0; i < rippleEvents.length; i++) {
            const r = rippleEvents[i];
            const age = elapsedTime - r.t;
            if (age < 0) continue;
            const dx = bubble.position.x - r.x;
            const dy = bubble.position.y - r.y;
            const dist = Math.hypot(dx, dy);
            const waveSpeed = 8.0;
            const front = age * waveSpeed;
            const width = 1.6;
            const ring = Math.exp(-((dist - front) * (dist - front)) / (2 * width * width));
            const decay = Math.exp(-age * 1.2);
            const impulse = ring * decay * rippleK;
            if (impulse > 1e-6 && dist > 1e-4) {
              bubble.userData.impulse.x += (dx / dist) * impulse;
              bubble.userData.impulse.y += (dy / dist) * impulse * 0.6;
            }
          }
        }

        // Pointer attract (gentle drift toward cursor ray intersection)
        const thrownRecently = !!(bubble.userData && bubble.userData.isThrown && (elapsedTime - safeNum(bubble.userData.thrownAt, 0)) < 0.75);
        if (!thrownRecently && rayDir && rayOrg) {
          const dz = rayDir.z;
          if (Math.abs(dz) > 1e-6) {
            const t = (bubble.position.z - tmpOrigin.z) / dz;
            tmpPoint.copy(tmpOrigin).add(tmpDir.copy(rayDir).multiplyScalar(t));
            const dx = tmpPoint.x - bubble.position.x;
            const dy = tmpPoint.y - bubble.position.y;
            // Mostly lateral: keep attract meaningful without pulling bubbles downward.
            bubble.userData.impulse.x += dx * attractK;
            // Tiny Y component (clamped) to avoid counteracting the upward travel.
            const yAdd = clamp(dy * attractK * 0.05, -0.004, 0.004);
            bubble.userData.impulse.y += yAdd;
          }
        }

        // Compose velocity: base rise + impulses
        const baseVel = bubble.userData.baseVelocity;
        const speedMult = clamp(safeNum(controls.speed, 1.0), 0, 3);
        tmpVel.copy(baseVel).multiplyScalar(speedMult);
        tmpVel.add(bubble.userData.impulse);
        // Safety: don't allow attraction/impulses to stall or reverse upward travel when speed is enabled.
        // Skip this clamp briefly after a throw so users can fling bubbles downward.
        if (speedMult > 0 && !thrownRecently) {
          const baseRiseMin = Math.max(0.0015, safeNum(baseVel.y, 0.02) * speedMult * 0.35);
          if (tmpVel.y < baseRiseMin) tmpVel.y = baseRiseMin;
        }
        // decay impulse so pushes settle
        bubble.userData.impulse.multiplyScalar(0.96);
        bubble.position.add(tmpVel);

        // Update shader time
        if (bubble.material && bubble.material.uniforms && bubble.material.uniforms.uTime) {
          bubble.material.uniforms.uTime.value = elapsedTime;
        }

        // Size (px-based) + global scale + optional pulsing
        let s = (Number.isFinite(bubble.userData.baseWorldScale) ? bubble.userData.baseWorldScale : bubble.scale.x) * scaleMult;
        if (pulseHz > 0) {
          const p = bubble.userData.sizePhase;
          const amp = 0.12 * clamp(pulseHz, 0, 1);
          s *= (1 + amp * Math.sin(elapsedTime * pulseOmega + p));
        }
        bubble.scale.set(s, s, s);

        // Reset if out of bounds (top or flung off-screen)
        const bnd = computeBoundsAtZ(bubble.position.z);
        const outX = Math.abs(bubble.position.x) > (bnd.halfW * 1.25);
        const outY = bubble.position.y > (bnd.halfH * 1.35) || bubble.position.y < (-bnd.halfH * 1.35);
        if (bubble.position.y > 30 || outX || outY) {
          resetBubble(bubble, index);
          refreshBubbleBaseScale(bubble, { reroll: true });
          try {
            bubble.userData.isThrown = false;
            bubble.userData.thrownAt = 0;
            bubble.userData.isGrabbed = false;
          } catch(_) {}
        }
      });

      renderer.render(scene, camera);
    }

    // Initialize
    init();
    // After init, seed sizing/visibility/alpha for the pool
    refreshAllBubbleBaseScales({ reroll: true });
    updateBubbleVisibility();
    applyBubbleAlpha();

    window.addEventListener('resize', onWindowResize);
    animate();

    // Expose control interface
    window.errlRisingBubblesThree = {
      scene,
      camera,
      renderer,
      bubbles,
      setSpeed(value) {
        controls.speed = clamp(safeNum(value, 1), 0, 3);
      },
      // Repurposed: COUNT multiplier
      setDensity(value) {
        controls.density = clamp(safeNum(value, 1), 0, 2);
        updateBubbleVisibility();
      },
      setScale(value) {
        controls.scale = clamp(safeNum(value, 1.0), 0.5, 2.0);
      },
      setAlpha(value) {
        controls.alpha = clamp(safeNum(value, 0.95), 0, 1);
        applyBubbleAlpha();
      },
      setWobble(value) {
        controls.wobble = clamp(safeNum(value, 1), 0, 2);
      },
      setFreq(value) {
        controls.freq = clamp(safeNum(value, 1), 0, 2);
      },
      setMinSize(value) {
        controls.minSize = clamp(parseInt(String(value || '14'), 10) || 14, 6, 256);
        normalizeMinMax();
        refreshAllBubbleBaseScales({ reroll: false });
      },
      setMaxSize(value) {
        controls.maxSize = clamp(parseInt(String(value || '36'), 10) || 36, 6, 256);
        normalizeMinMax();
        refreshAllBubbleBaseScales({ reroll: false });
      },
      setSizeHz(value) {
        controls.sizeHz = clamp(safeNum(value, 0), 0, 1);
      },
      setJumboPct(value) {
        controls.jumboPct = clamp(safeNum(value, 0.1), 0, 0.6);
        refreshAllBubbleBaseScales({ reroll: true });
      },
      setJumboScale(value) {
        controls.jumboScale = clamp(safeNum(value, 1.6), 1.0, 2.5);
        refreshAllBubbleBaseScales({ reroll: true });
      },
      setAttract(value) {
        controls.attract = !!value;
      },
      setAttractIntensity(value) {
        controls.attractIntensity = clamp(safeNum(value, 1.0), 0, 2);
      },
      setRipples(value) {
        controls.ripples = !!value;
        if (!controls.ripples) rippleEvents.length = 0;
      },
      setRippleIntensity(value) {
        controls.rippleIntensity = clamp(safeNum(value, 1.2), 0, 2);
      },
      getControls() {
        // Provide both names for compatibility
        return {
          ...controls,
          count: controls.density
        };
      },
      getActiveCount() {
        return getActiveCount();
      },
      getPoolSize() {
        return bubblePoolCount;
      },
      stopAnimation() {
        // no-op (animation is always running; controls affect motion)
      }
    };
  }).catch(err => {
    console.error('[rise-bubbles-three] Failed to load Three.js:', err);
    // Fallback: keep canvas but hide it
    if (cvs) cvs.style.display = 'none';
  });
})();

