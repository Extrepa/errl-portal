// 3D Effect 3D Object Prop
// Extracted and rebuilt from Framer component
// WebGL displacement mapping with chromatic aberration

(function() {
  'use strict';

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const canvas = document.querySelector('canvas');
  if (!canvas) return;

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    console.warn('WebGL not supported');
    return;
  }

  // Configuration
  const config = {
    imageSrc: 'https://framerusercontent.com/images/V6Xv9WJAViymy26IrRJOcxxT8.png?width=800&height=800',
    displacementSrc: 'https://framerusercontent.com/images/GfGkADagM4KEibNcIiRUWlfrR0.jpg', // Default displacement map
    preset: 'medium', // 'subtle', 'medium', 'intense', 'custom'
    strength: 50,
    scale: 1,
    softness: 0.5,
    chromaticIntensity: 12.5,
    hoverTransition: 0.3,
    borderRadius: 0
  };

  // Preset configurations
  const presets = {
    subtle: { strength: 25, scale: 0.8, softness: 0.7, chromaticIntensity: 5, hoverTransition: 0.5 },
    medium: { strength: 50, scale: 1, softness: 0.5, chromaticIntensity: 12.5, hoverTransition: 0.3 },
    intense: { strength: 100, scale: 1.5, softness: 0.3, chromaticIntensity: 25, hoverTransition: 0.2 }
  };

  // State
  let program = null;
  let imageTexture = null;
  let displacementTexture = null;
  let isHovered = false;
  let effectProgress = 0;
  let animationFrame = null;
  let transitionStartTime = 0;
  let transitionStartProgress = 0;

  // Shader source code
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform sampler2D u_displacement;
    uniform vec2 u_resolution;
    uniform float u_strength;
    uniform float u_scale;
    uniform float u_softness;
    uniform float u_chromaticIntensity;
    uniform float u_effectProgress;
    varying vec2 v_texCoord;

    vec4 chromaticAberration(vec2 coord, vec2 displacement) {
      vec2 offset = displacement * u_chromaticIntensity * 0.01;
      float r = texture2D(u_image, coord + offset).r;
      float g = texture2D(u_image, coord).g;
      float b = texture2D(u_image, coord - offset).b;
      float a = texture2D(u_image, coord).a;
      return vec4(r, g, b, a);
    }

    void main() {
      vec2 coord = v_texCoord;
      vec4 displacementColor = texture2D(u_displacement, coord * u_scale);
      
      vec2 displacement = (displacementColor.rg - 0.5) * u_strength * 0.01 * u_effectProgress;
      displacement = mix(vec2(0.0), displacement, u_softness);
      
      vec4 originalColor = texture2D(u_image, coord);
      vec4 effectColor = chromaticAberration(coord, displacement);
      
      // Mix between original and effect based on progress
      vec4 finalColor = mix(originalColor, effectColor, u_effectProgress);
      
      gl_FragColor = finalColor;
    }
  `;

  // Get preset values
  function getPresetValues() {
    if (config.preset === 'custom') {
      return {
        strength: config.strength,
        scale: config.scale,
        softness: config.softness,
        chromaticIntensity: config.chromaticIntensity,
        hoverTransition: config.hoverTransition
      };
    }
    return presets[config.preset] || presets.medium;
  }

  // Initialize canvas
  function initCanvas() {
    const container = canvas.parentElement;
    if (container && window.devicePixelRatio) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }

  // Create shader
  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }

  // Create program
  function createProgram(vertexSource, fragmentSource) {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
    
    if (!vertexShader || !fragmentShader) return null;
    
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    
    return program;
  }

  // Load image
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Create texture from image
  function createTexture(image) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    } catch (error) {
      console.error('Error creating texture:', error);
      return null;
    }
    
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    
    return texture;
  }

  // Setup geometry
  function setupGeometry() {
    const aspect = canvas.width / canvas.height;
    const imageAspect = 1; // Assume square image for now
    
    let width = 1;
    let height = 1;
    let offsetX = 0;
    let offsetY = 0;
    
    if (imageAspect > aspect) {
      height = 1;
      width = aspect / imageAspect;
      offsetX = (1 - width) / 2;
    } else {
      width = 1;
      height = imageAspect / aspect;
      offsetY = (1 - height) / 2;
    }
    
    const vertices = new Float32Array([
      -1, -1, offsetX, offsetY + height,
       1, -1, offsetX + width, offsetY + height,
      -1,  1, offsetX, offsetY,
       1,  1, offsetX + width, offsetY
    ]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');
    
    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);
  }

  // Render frame
  function render() {
    if (!program || !imageTexture || !displacementTexture) return;
    
    // Update effect progress with smooth transition
    if (!prefersReducedMotion) {
      const now = Date.now();
      const elapsed = (now - transitionStartTime) / 1000;
      const preset = getPresetValues();
      const targetProgress = isHovered ? 1 : 0;
      const duration = preset.hoverTransition;
      
      if (elapsed < duration) {
        const t = elapsed / duration;
        // Easing function (ease-in-out cubic)
        const eased = t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
        effectProgress = transitionStartProgress + (targetProgress - transitionStartProgress) * eased;
      } else {
        effectProgress = targetProgress;
      }
    } else {
      effectProgress = 0;
    }
    
    // Clear
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Use program
    gl.useProgram(program);
    
    // Bind textures
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, imageTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, displacementTexture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_displacement'), 1);
    
    // Set uniforms
    const preset = getPresetValues();
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform1f(gl.getUniformLocation(program, 'u_strength'), preset.strength);
    gl.uniform1f(gl.getUniformLocation(program, 'u_scale'), preset.scale);
    gl.uniform1f(gl.getUniformLocation(program, 'u_softness'), preset.softness);
    gl.uniform1f(gl.getUniformLocation(program, 'u_chromaticIntensity'), preset.chromaticIntensity);
    gl.uniform1f(gl.getUniformLocation(program, 'u_effectProgress'), effectProgress);
    
    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  // Start hover transition
  function startHoverTransition() {
    transitionStartTime = Date.now();
    transitionStartProgress = effectProgress;
    isHovered = true;
    if (!prefersReducedMotion && !animationFrame) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  // End hover transition
  function endHoverTransition() {
    transitionStartTime = Date.now();
    transitionStartProgress = effectProgress;
    isHovered = false;
    if (!prefersReducedMotion && !animationFrame) {
      animationFrame = requestAnimationFrame(render);
    }
  }

  // Initialize
  async function init() {
    initCanvas();
    
    // Create program
    program = createProgram(vertexShaderSource, fragmentShaderSource);
    if (!program) return;
    
    // Load images
    try {
      const [image, displacement] = await Promise.all([
        loadImage(config.imageSrc),
        loadImage(config.displacementSrc)
      ]);
      
      imageTexture = createTexture(image);
      displacementTexture = createTexture(displacement);
      
      if (!imageTexture || !displacementTexture) return;
      
      setupGeometry();
      
      // Start render loop
      if (!prefersReducedMotion) {
        animationFrame = requestAnimationFrame(render);
      } else {
        render();
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  // Event listeners
  const container = canvas.parentElement;
  if (container) {
    container.addEventListener('mouseenter', startHoverTransition);
    container.addEventListener('mouseleave', endHoverTransition);
  }
  
  window.addEventListener('resize', () => {
    initCanvas();
    setupGeometry();
  });

  // Initialize
  init();
})();
