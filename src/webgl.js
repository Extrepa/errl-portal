/* Errl WebGL layer using PixiJS: goo distortion over serialized SVG texture */
(function(){
  const W = window;
  let app = null;
  let sprite = null;
  let filter = null;
  let started = false;
  let paused = true;
  let particles = null;
  let moodFilter = null;
  let orbContainer = null;
  let orbs = [];
  let orbFilter = null;
  let fxm = null; // ErrlFX manager
  let bubblesFX = null; // legacy single layer
  let bubblesFXLayers = null; // multi-layer array
  let overlay = null;
  let overlayFilter = null;
  let fxRoot = null;

  function getCanvas() {
    return document.getElementById('errlWebGL');
  }

  const DEBUG_DPR_KEY = 'errl_debug_dpr';
  let currentResolutionCap = null;

  function normalizeDprCap(value) {
    if (value === null || value === undefined) return null;
    if (value === '' || value === 'default' || value === 'auto') return null;
    const numeric = typeof value === 'number' ? value : parseFloat(String(value));
    if (Number.isNaN(numeric)) return null;
    return Math.max(0.5, Math.min(4, numeric));
  }

  function readInitialDprCap() {
    try {
      const stored = normalizeDprCap(localStorage.getItem(DEBUG_DPR_KEY));
      if (stored !== null) return stored;
    } catch (_) {
      /* ignore storage errors */
    }
    if (W.__ERRL_DEBUG && W.__ERRL_DEBUG.flags && typeof W.__ERRL_DEBUG.flags.dprCap === 'number') {
      return normalizeDprCap(W.__ERRL_DEBUG.flags.dprCap);
    }
    return null;
  }

  function resolveResolution(cap) {
    const limiter = cap !== null ? cap : 2;
    return Math.min(limiter, W.devicePixelRatio || 1);
  }

  currentResolutionCap = readInitialDprCap();

  function serializeErrlSVGToURL(size = 512) {
    const svg = document.getElementById('errlInlineSVG') || document.querySelector('.errl-wrapper svg');
    if (!svg) return null;
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', String(size));
    clone.setAttribute('height', String(size));
    const svgStr = clone.outerHTML;
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    return url;
  }

  function getErrlTextureURL() {
    // Prefer the on-page IMG (full body) for the WebGL texture so we get the whole character.
    const img = document.getElementById('errlCenter');
    if (img && img.getAttribute('src')) return img.getAttribute('src');
    // Fallback to canonical body asset if available
    if (window.ERRL_ASSETS && window.ERRL_ASSETS.body) return window.ERRL_ASSETS.body;
    // As a last resort, serialize whatever inline SVG is present.
    const inline = serializeErrlSVGToURL(768);
    if (inline) return inline;
    return '/portal/assets/L4_Central/errl-body-with-limbs.svg';
  }

  const vert = `
    precision mediump float;
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    uniform mat3 projectionMatrix;
    varying vec2 vTextureCoord;
    void main(void){
      vTextureCoord = aTextureCoord;
      gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    }
  `;

  const frag = `
    precision mediump float;
    varying vec2 vTextureCoord;
    uniform sampler2D uSampler;
    uniform vec2 uResolution;
    uniform float uTime;
    uniform float uDrip;      // 0-1 how melty
    uniform float uViscosity; // 0-1 smoothing factor
    uniform float uSpeed;     // animation speed multiplier
    uniform float uAmp;       // displacement amplitude 0..1
    uniform float uWiggle;    // extra sin wobble 0..1

    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
    }
    float noise(vec2 p){
      vec2 i = floor(p); vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0,0.0));
      float c = hash(i + vec2(0.0,1.0));
      float d = hash(i + vec2(1.0,1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
    }

    void main(){
      vec2 uv = vTextureCoord;

      float t = uTime * (0.4 + 1.6*uSpeed);
      vec2 n = vec2(
        noise(uv*4.0 + vec2(t*0.12, 0.0)),
        noise(uv*4.0 + vec2(0.0, t*0.15))
      );
      float amp = mix(0.02, 0.10, clamp(uAmp, 0.0, 1.0));
      n = (n - 0.5) * amp; // amplitude

      // additional sin wobble
      vec2 wob = vec2(
        sin(uv.y*8.0 + t*1.2),
        cos(uv.x*8.0 - t*1.1)
      ) * 0.003 * clamp(uWiggle, 0.0, 1.0);

      // gravity drip bias pulls down near the lower half
      float edge = smoothstep(0.1, 0.9, uv.y);
      float drip = uDrip * (edge);
      uv.y += drip * (0.02 + 0.10*noise(uv*2.0 + vec2(0.0, t*0.2)));

      // viscosity dampens displacement
      uv += (n + wob) * (1.0 - 0.6*uViscosity);

      vec4 col = texture2D(uSampler, uv);

      // subtle bloom-like lift for bright edges (stroke)
      float lum = dot(col.rgb, vec3(0.299,0.587,0.114));
      col.rgb += smoothstep(0.7, 1.0, lum) * 0.15;

      gl_FragColor = col;
    }
  `;

  function getErrlTargetSize(){
    const wrap = document.getElementById('errl');
    if (!wrap) return 320;
    const r = wrap.getBoundingClientRect();
    return Math.max(360, Math.min(900, Math.floor(Math.max(r.width, r.height))));
  }

  function gradientTexture(w, h){
    const g = new PIXI.Graphics();
    const grd = new PIXI.Graphics();
    const rt = PIXI.RenderTexture.create({width:w, height:h, resolution:1});
    const c = new PIXI.Container();
    // background radial gradient using multiple rects approximated
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.0).drawRect(0,0,w,h).endFill();
    c.addChild(bg);
    const mid = new PIXI.Graphics(); mid.beginFill(0xffffff, 0.12).drawCircle(w*0.5, h*0.45, Math.max(w,h)*0.25).endFill(); c.addChild(mid);
    const halo = new PIXI.Graphics(); halo.beginFill(0xff00ff, 0.05).drawCircle(w*0.5, h*0.45, Math.max(w,h)*0.35).endFill(); c.addChild(halo);
    const appTmp = app || new PIXI.Application({width:w, height:h, backgroundAlpha:0});
    appTmp.renderer.render(c, { renderTexture: rt });
    if(!app) appTmp.destroy(true);
    return rt;
  }

  function init() {
    if (started) return;
    const view = getCanvas();
    if (!view || !W.PIXI) return;

    const overrideRes = (W as any).__ERRL_RES_OVERRIDE;
    const baseRes = Math.min((W.devicePixelRatio || 1), 1.5);
    const effectiveRes = (typeof overrideRes === 'number' && isFinite(overrideRes) ? overrideRes : baseRes);

    app = new PIXI.Application({
      view,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: effectiveRes,
      powerPreference: 'high-performance'
    });

    // Ensure zIndex works and expose app for debug harness
    app.stage.sortableChildren = true;
    W.__ErrlPIXIApp = app;

    const url = getErrlTextureURL();
    if (!url) return;

    const img = new Image();
    img.onload = () => {
      const tex = PIXI.Texture.from(img);
      sprite = new PIXI.Sprite(tex);
      sprite.anchor.set(0.5);
      // stage graph: particles (first) + fxRoot (filters only here)
      particles = new PIXI.ParticleContainer(5000, { scale: true, alpha: true, position: true });
      app.stage.addChild(particles);
      fxRoot = new PIXI.Container();
      app.stage.addChild(fxRoot);

      // center sprite
      sprite.x = app.renderer.width / 2;
      sprite.y = app.renderer.height / 2;

      // scale sprite to Errl wrapper size
      const target = getErrlTargetSize();
      const maxDim = Math.max(tex.width, tex.height);
      const s = target / maxDim;
      sprite.scale.set(s);

      filter = new PIXI.Filter(vert, frag, {
        uResolution: new PIXI.Point(app.renderer.width, app.renderer.height),
        uTime: 0,
        uDrip: 0.25,
        uViscosity: 0.5,
        uSpeed: 0.5,
        uAmp: 0.7,
        uWiggle: 0.6,
      });
      sprite.filters = [filter];

      fxRoot.addChild(sprite);

      // WebGL iridescent orbs mirroring DOM bubbles
      orbContainer = new PIXI.Container();
      fxRoot.addChild(orbContainer);
      // simple circular texture
      const g = new PIXI.Graphics();
      g.beginFill(0xffffff, 1).drawCircle(0,0,36).endFill();
      const orbTex = app.renderer.generateTexture(g);
      // orb filter: fake iridescence via conic hue + edge lighting
      orbFilter = new PIXI.Filter(vert, `
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float uTime;
        uniform float uIOR; // index of refraction-ish (squish)
        void main(){
          vec2 uv = vTextureCoord;
          vec4 base = texture2D(uSampler, uv);
          // radial coords
          vec2 p = uv*2.0 - 1.0; float r = length(p);
          float edge = smoothstep(0.7, 1.0, r);
          float ang = atan(p.y, p.x);
          float hue = (ang/3.1415926 + 1.0) * 0.5 + uTime*0.05;
          vec3 oil = vec3(
            0.5 + 0.5*sin(6.2831*(hue+0.00)),
            0.5 + 0.5*sin(6.2831*(hue+0.33)),
            0.5 + 0.5*sin(6.2831*(hue+0.66))
          );
          vec3 col = mix(base.rgb, oil, 0.6*edge);
          // highlight rim
          col += vec3(1.0,1.0,1.0) * edge * 0.2;
          // inner squeeze
          float squeeze = 1.0 - 0.08*uIOR;
          vec2 uv2 = vec2(0.5) + (uv-vec2(0.5)) * vec2(squeeze, 1.0);
          vec4 c2 = texture2D(uSampler, uv2);
          gl_FragColor = vec4(mix(col, c2.rgb, 0.15), base.a * 0.9);
        }
      `, { uTime: 0, uIOR: 1.0 });

      buildOrbs(orbTex);

      // Overlay gradient + displacement
      const gradTex = gradientTexture(innerWidth, innerHeight);
      overlay = new PIXI.Sprite(gradTex); overlay.alpha = 0.20; overlay.blendMode = PIXI.BLEND_MODES.SCREEN; fxRoot.addChild(overlay);
      overlayFilter = new PIXI.Filter(vert, `
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform float uDX; // 0..64
        uniform float uDY; // 0..64
        uniform float uTime;
        uniform vec2 uPointer; // 0..1
        uniform float uAmp;
        void main(){
          vec2 uv = vTextureCoord;
          float t = uTime * 0.2;
          uv.x += sin((uv.y*6.2831) + t) * (uDX/1024.0);
          uv.y += cos((uv.x*6.2831) - t) * (uDY/1024.0);
          float d = distance(uv, uPointer);
          float ripple = sin(18.0*d - uTime*2.0) * exp(-3.0*d) * uAmp;
          uv += normalize(uv - uPointer) * ripple * 0.002;
          gl_FragColor = texture2D(uSampler, uv);
        }
      `, { uDX:24, uDY:18, uTime:0, uPointer: new PIXI.Point(0.5,0.5), uAmp: 0.0 });
      overlay.filters = [overlayFilter];

      // Mood/tint post filter
      // Use default vertex to avoid uniform mismatch on some platforms
      moodFilter = new PIXI.Filter(undefined, `
        precision mediump float;
        varying vec2 vTextureCoord;
        uniform sampler2D uSampler;
        uniform vec3 uTint; // 0-1 per channel
        uniform float uAmount; // 0(off)..1(full)
        uniform float uVig; // vignette strength
        void main(){
          vec2 uv = vTextureCoord;
          vec4 col = texture2D(uSampler, uv);
          // simple vignette
          vec2 c = uv - 0.5; float d = dot(c,c);
          float vig = 1.0 - uVig * smoothstep(0.2, 0.5, d);
          col.rgb *= vig;
          // tint blend
          col.rgb = mix(col.rgb, col.rgb * uTint, uAmount);
          gl_FragColor = col;
        }
      `, { uTint: new Float32Array([1,1,1]), uAmount: 0.0, uVig: 0.0 });
      fxRoot.filters = [moodFilter];

      // Background bubbles FX via ErrlFX; create multiple layers
      if (window.ErrlFX && (window.ErrlFX.Manager || window.ErrlFX.Bubbles)) {
        fxm = new window.ErrlFX.Manager({ app, rootContainer: app.stage });
        bubblesFXLayers = [];
        const base = {
          textureUrl: null, // use procedural to avoid missing asset squares
          alpha: 0.90,
          farRatio: 0.33,
          sizeJitterFreq: 0.0,
        };
        try {
          const L0 = fxm.enable('bubbles', base) || new window.ErrlFX.Bubbles(app, app.stage, base);
          if (L0 && L0.init) L0.init();
          bubblesFXLayers.push(L0);
          const L1 = new window.ErrlFX.Bubbles(app, app.stage, { ...base, textureUrl: null, alpha: 0.75 });
          if (L1 && L1.init) L1.init();
          bubblesFXLayers.push(L1);
          const L2 = new window.ErrlFX.Bubbles(app, app.stage, { ...base, textureUrl: null, alpha: 0.55 });
          if (L2 && L2.init) L2.init();
          bubblesFXLayers.push(L2);
        } catch (e) { console.warn('Bubbles init failed', e); }
      }

      // Expose refs for late Hue registration/debug harness
      window.__ErrlWebGL = { overlay, bubbles: bubblesFXLayers, fxRoot, moodFilter, overlayFilter };

      app.ticker.add((delta) => {
        if (paused) return;
        if (filter) filter.uniforms.uTime += 0.016 * delta;
        if (orbFilter) orbFilter.uniforms.uTime += 0.016 * delta;
        if (overlayFilter) overlayFilter.uniforms.uTime += 0.016 * delta;
      });
      // pointer -> overlay ripples
      window.addEventListener('pointermove', (e)=>{
        const x = e.clientX / app.renderer.width; const y = e.clientY / app.renderer.height;
        if (overlayFilter) { overlayFilter.uniforms.uPointer = new PIXI.Point(x,y); overlayFilter.uniforms.uAmp = 1.0; }
      });
      window.addEventListener('pointerleave', ()=>{ if(overlayFilter){ overlayFilter.uniforms.uAmp = 0.0; }});

      // keep centered/resized
      const onResize = () => {
        const w = Math.max(0, window.innerWidth|0);
        const h = Math.max(0, window.innerHeight|0);
        if (!w || !h) { requestAnimationFrame(onResize); return; }
        view.width = w;
        view.height = h;
        app.renderer.resize(w, h);
        if (sprite) {
          sprite.x = app.renderer.width / 2;
          sprite.y = app.renderer.height / 2;
          const target = getErrlTargetSize();
          const maxDim = Math.max(sprite.texture.width, sprite.texture.height);
          const s = target / maxDim;
          sprite.scale.set(s);
        }
        if (filter) {
          filter.uniforms.uResolution = new PIXI.Point(app.renderer.width, app.renderer.height);
        }
        if (overlay) {
          overlay.texture = gradientTexture(app.renderer.width, app.renderer.height);
          overlay.width = app.renderer.width; overlay.height = app.renderer.height;
        }
      };
      window.addEventListener('resize', onResize);

      // Register hue control layers if available
      if (window.ErrlHueController) {
        try { window.ErrlHueController.registerWebGLLayer('glOverlay', overlay); } catch(e){}
        try { window.ErrlHueController.registerWebGLLayer('bgBubbles', bubblesFXLayers); } catch(e){}
      }

      // hook panel sliders to uniforms
      const auraPulse = document.getElementById('auraPulse');
      if (auraPulse) {
        auraPulse.addEventListener('input', () => {
          const v = parseFloat(auraPulse.value);
          if (filter) {
            filter.uniforms.uSpeed = v;           // faster wobble
            filter.uniforms.uDrip = 0.15 + 0.7*v; // more melty
          }
        });
      }

      started = true;
      enable();
    };
    img.onerror = () => console.warn('Failed to load serialized Errl SVG for WebGL');
    img.src = url;
  }

  function enable(){
    paused = false;
  }
  function disable(){
    paused = true;
  }

  function spawnBurstGL(count = 600, clickX = null, clickY = null){
    if (!particles) return;
    // Use click position if provided, otherwise center
    const centerX = clickX !== null ? clickX : (app?.renderer?.width || window.innerWidth) / 2;
    const centerY = clickY !== null ? clickY : (app?.renderer?.height || window.innerHeight) / 2;
    
    // Rainbow color palette
    const rainbowColors = [
      0xff0080, 0xff4000, 0xff8000, 0xffc000, 0xffff00, 0xc0ff00,
      0x80ff00, 0x40ff00, 0x00ff00, 0x00ff40, 0x00ff80, 0x00ffc0,
      0x00ffff, 0x00c0ff, 0x0080ff, 0x0040ff, 0x0000ff, 0x4000ff,
      0x8000ff, 0xc000ff, 0xff00ff, 0xff00c0, 0xff0080
    ];
    
    for (let i=0;i<count;i++){
      const g = new PIXI.Graphics();
      const r = 1.5 + Math.random()*2.5;
      // Rainbow color cycling
      const hue = (i / count) * rainbowColors.length;
      const colorIdx = Math.floor(hue) % rainbowColors.length;
      const color = rainbowColors[colorIdx];
      g.beginFill(color, 0.95).drawCircle(0,0,r).endFill();
      const tex = app.renderer.generateTexture(g);
      const s = new PIXI.Sprite(tex);
      s.anchor.set(0.5);
      s.blendMode = PIXI.BLEND_MODES.ADD;
      s.x = centerX; s.y = centerY;
      
      // Hose-like effect: particles spread in a circle with vertical variation
      // Create a cone/spray pattern
      const baseAngle = (i / count) * Math.PI * 2; // Full circle
      const angleSpread = (Math.random() - 0.5) * 0.3; // Small spread per particle
      const angle = baseAngle + angleSpread;
      const verticalBias = (Math.random() - 0.5) * 0.4; // Up/down variation
      const speed = 2 + Math.random() * 4; // Faster particles
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + verticalBias * speed;
      
      s.alpha = 0.95;
      particles.addChild(s);
      // Shorter TTL for snappier effect
      const ttl = 30 + Math.random()*25;
      let t=0;
      app.ticker.add(function tick(delta){
        if (paused) return;
        t += delta;
        s.x += vx*delta; s.y += vy*delta;
        s.alpha = Math.max(0, 0.95 * (1 - t/ttl));
        s.scale.set(1 + t/ttl*0.5); // Slight growth
        if (t>=ttl){
          app.ticker.remove(tick);
          particles.removeChild(s);
          s.destroy({texture:true, baseTexture:true});
        }
      });
    }
  }

  function buildOrbs(tex){
    // create one orb per DOM bubble
    const doms = Array.from(document.querySelectorAll('.bubble'));
    orbs.forEach(s=>s.destroy({texture:false, baseTexture:false}));
    orbs = doms.map((_b,i)=>{
      const s = new PIXI.Sprite(tex);
      s.anchor.set(0.5);
      s.alpha = 0.85;
      s.scale.set(0.72);
      s.blendMode = PIXI.BLEND_MODES.SCREEN;
      s.filters = [orbFilter];
      s.filters[0].uniforms.uIOR = 1.0;
      orbContainer.addChild(s);
      return s;
    });
    syncOrbsPositions();
  }

  function syncOrbsPositions(){
    if (!orbs.length) return;
    const doms = Array.from(document.querySelectorAll('.bubble'));
    doms.forEach((b,i)=>{
      const r = b.getBoundingClientRect();
      const x = r.left + r.width/2;
      const y = r.top + r.height/2;
      // assume CSS pixels == renderer pixels in this setup
      orbs[i].x = x; orbs[i].y = y;
    });
  }

  function setMood(name){
    if (!moodFilter) return;
    const presets = {
      off:  { tint:[1,1,1], amt:0.0, vig:0.0 },
      calm: { tint:[0.8,0.7,1.0], amt:0.35, vig:0.15 },
      alert:{ tint:[1.0,0.55,0.55], amt:0.45, vig:0.25 },
      neon: { tint:[0.7,1.0,0.9], amt:0.5, vig:0.2 },
    };
    const p = presets[name] || presets.off;
    moodFilter.uniforms.uTint = new Float32Array(p.tint);
    moodFilter.uniforms.uAmount = p.amt;
    moodFilter.uniforms.uVig = p.vig;
  }

  // expose controls
  W.enableErrlGL = function(){ if (!started) init(); else enable(); };
  W.disableErrlGL = function(){ disable(); };
  W.errlGLBurst = function(x, y){ if (!started) init(); spawnBurstGL(600, x, y); };
  W.errlGLSetMood = function(name){ if (!started) init(); setMood(name); };
  W.errlGLSyncOrbs = function(){ if (!started) return; syncOrbsPositions(); };
  W.errlGLOrbHover = function(index, on){ if (!started || !orbs[index]) return; const f=orbs[index].filters && orbs[index].filters[0]; if (f) f.uniforms.uIOR = on ? 1.8 : 1.0; };
  W.errlGLSetOrbScale = function(scale){ if(!started||!orbs.length) return; const s = Math.max(0.2, Math.min(2.5, scale||1)); orbs.forEach(o=> o && o.scale && o.scale.set(0.72*s)); };
  W.errlGLShowOrbs = function(show){ if (!started) init(); if (orbContainer) orbContainer.visible = !!show; };
  W.errlGLSetGoo = function(p){ if(!started) init(); if(!filter||!p) return; if('intensity' in p) filter.uniforms.uAmp = Math.max(0, Math.min(1, p.intensity)); if('speed' in p) filter.uniforms.uSpeed = Math.max(0, p.speed); if('viscosity' in p) filter.uniforms.uViscosity = Math.max(0, Math.min(1, p.viscosity)); if('drip' in p) filter.uniforms.uDrip = Math.max(0, Math.min(1, p.drip)); if('wiggle' in p) filter.uniforms.uWiggle = Math.max(0, Math.min(1, p.wiggle)); };
  W.errlGLSetBubbles = function(params){
    if (!started) init(); if (!bubblesFXLayers || !params) return;
    const layers = bubblesFXLayers.filter(Boolean);
    if ('speed' in params) layers.forEach(l=> l.setSpeed && l.setSpeed(params.speed));
    if ('density' in params) layers.forEach(l=> l.setCountFactor && l.setCountFactor(params.density));
    const patch = {};
    if ('alpha' in params) patch.alpha = params.alpha;
    if ('minSize' in params) patch.minSize = params.minSize;
    if ('maxSize' in params) patch.maxSize = params.maxSize;
    if ('farRatio' in params) patch.farRatio = params.farRatio;
    if ('sizeJitterFreq' in params) patch.sizeJitterFreq = params.sizeJitterFreq;
    if ('jumboChance' in params) patch.jumboChance = params.jumboChance;
    if ('jumboScale' in params) patch.jumboScale = params.jumboScale;
    if (Object.keys(patch).length) layers.forEach(l=> l.set && l.set(patch));
    if ('wobble' in params) layers.forEach(l=> l.setWobbleMult && l.setWobbleMult(params.wobble));
    if ('freq' in params) layers.forEach(l=> l.setFreqMult && l.setFreqMult(params.freq));
  };
  W.errlGLSetBubblesTexture = function(kind, url){
    if (!started) init(); if (!bubblesFXLayers) return;
    const layers = bubblesFXLayers.filter(Boolean);
    const apply = (l,k,u)=>{ if(!l||!l.set) return; if (k==='orb') l.set({ textureUrl: '../src/assets/fx/Orb_NeedsFriends.png' }); else if (k==='proc') l.set({ textureUrl: null }); else if (k==='custom' && u) l.set({ textureUrl: u }); };
    layers.forEach(l=> apply(l, kind, url));
  };
  W.errlGLSetBubblesLayerTexture = function(index, kind, url){
    if (!started) init(); if (!bubblesFXLayers || bubblesFXLayers.length<=index) return;
    const l = bubblesFXLayers[index]; if (!l) return;
    if (kind==='orb') l.set({ textureUrl: '../src/assets/fx/Orb_NeedsFriends.png' });
    else if (kind==='proc') l.set({ textureUrl: null });
    else if (kind==='custom' && url) l.set({ textureUrl: url });
  };
  W.errlGLSetOverlay = function(params){ if (!started) init(); if (!overlay) return; if ('alpha' in params) overlay.alpha = params.alpha; if (overlayFilter){ if ('dx' in params) overlayFilter.uniforms.uDX = params.dx; if ('dy' in params) overlayFilter.uniforms.uDY = params.dy; } };
  W.errlGLGetOverlay = function(){ if (!started) return null; return { alpha: overlay ? overlay.alpha : null, dx: overlayFilter ? overlayFilter.uniforms.uDX : null, dy: overlayFilter ? overlayFilter.uniforms.uDY : null }; };
  W.errlGLSetDprCap = function(cap){
    const normalized = normalizeDprCap(cap);
    currentResolutionCap = normalized;
    try {
      if (normalized === null) {
        localStorage.removeItem(DEBUG_DPR_KEY);
      } else {
        localStorage.setItem(DEBUG_DPR_KEY, String(normalized));
      }
    } catch (_) {
      /* ignore */
    }
    if (W.__ERRL_DEBUG && W.__ERRL_DEBUG.flags) {
      W.__ERRL_DEBUG.flags.dprCap = normalized;
    }
    if (!app) return;
    const nextResolution = resolveResolution(currentResolutionCap);
    app.renderer.resolution = nextResolution;
    const width = window.innerWidth;
    const height = window.innerHeight;
    app.renderer.resize(width, height);
    const canvas = getCanvas();
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
    setTimeout(() => {
      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {
        /* ignore */
      }
    }, 0);
  };
})();
