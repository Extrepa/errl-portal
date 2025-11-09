// Minimal app glue for portal panel → effects wiring
(function(){
  function $(id){ return document.getElementById(id); }

  function on(el, ev, fn){ if (el) el.addEventListener(ev, fn); }
  function clamp(value, min, max){
    if (typeof value !== 'number' || Number.isNaN(value)) return min;
    if (min > max) return value;
    return Math.min(max, Math.max(min, value));
  }

  // Lightweight audio engine for nav bubble hover pings
  const audioEngine = (function(){
    const Ctor = window.AudioContext || window.webkitAudioContext;
    let ctx = null;
    let masterGain = null;
    let bassFilter = null;
    let enabled = !!$("audioEnabled")?.checked;
    let master = parseFloat($("audioMaster")?.value || '0.4');
    let bass = parseFloat($("audioBass")?.value || '0.2');

    function ensure(){
      if (!enabled || !Ctor) return null;
      if (!ctx){
        try{
          ctx = new Ctor();
          masterGain = ctx.createGain();
          masterGain.gain.value = master;
          bassFilter = ctx.createBiquadFilter();
          bassFilter.type = 'lowshelf';
          bassFilter.frequency.value = 160;
          bassFilter.gain.value = (bass * 24) - 12;
          bassFilter.connect(masterGain);
          masterGain.connect(ctx.destination);
        }catch(e){
          console.warn('AudioContext unavailable', e);
          enabled = false;
          return null;
        }
      }
      if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
      return { ctx, destination: bassFilter || masterGain || ctx.destination };
    }

    return {
      playHover(index){
        const chain = ensure();
        if (!chain) return;
        const { ctx, destination } = chain;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        osc.type = 'sine';
        osc.frequency.value = 320 + index * 28;
        osc.connect(gain);
        gain.connect(destination);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.05, master * 0.25), now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
        osc.start(now);
        osc.stop(now + 0.5);
      },
      setEnabled(on){
        enabled = !!on;
        if (!enabled && ctx && ctx.state !== 'closed'){
          ctx.suspend().catch(()=>{});
        } else if (enabled && ctx){
          ctx.resume().catch(()=>{});
        }
      },
      setMaster(value){
        master = value;
        if (masterGain) masterGain.gain.value = value;
      },
      setBass(value){
        bass = value;
        if (bassFilter) bassFilter.gain.value = (value * 24) - 12;
      }
    };
  })();

  const MOTION = { base: 1.35, reduced: 4 };
  function setMotionMultiplier(mult){
    document.documentElement.style.setProperty('--motionMultiplier', String(mult));
  }
  setMotionMultiplier(MOTION.base);

  const audioEnabledToggle = $("audioEnabled");
  const audioMasterSlider = $("audioMaster");
  const audioBassSlider = $("audioBass");
  on(audioEnabledToggle, 'change', ()=> audioEngine.setEnabled(!!audioEnabledToggle.checked));
  on(audioMasterSlider, 'input', ()=> audioEngine.setMaster(parseFloat(audioMasterSlider.value || '0')));
  on(audioBassSlider, 'input', ()=> audioEngine.setBass(parseFloat(audioBassSlider.value || '0')));

  // GL Overlay bindings + persist
  function persistOverlay(){
    const obj = { alpha: parseFloat($("glAlpha")?.value||'0.2'), dx: parseFloat($("glDX")?.value||'24'), dy: parseFloat($("glDY")?.value||'18') };
    try{ localStorage.setItem('errl_gl_overlay', JSON.stringify(obj)); }catch(e){}
  }
  on($("glAlpha"), 'input', ()=>{ const v=parseFloat($("glAlpha").value); window.errlGLSetOverlay && window.errlGLSetOverlay({ alpha: v }); persistOverlay(); });
  on($("glDX"), 'input', ()=>{ const v=parseFloat($("glDX").value); window.errlGLSetOverlay && window.errlGLSetOverlay({ dx: v }); persistOverlay(); });
  on($("glDY"), 'input', ()=>{ const v=parseFloat($("glDY").value); window.errlGLSetOverlay && window.errlGLSetOverlay({ dy: v }); persistOverlay(); });

  // GL background bubbles + persist minimal defaults
  function setBubs(p){ window.errlGLSetBubbles && window.errlGLSetBubbles(p); }
  function persistBubs(){
    const obj = { speed: parseFloat($("bgSpeed")?.value||'1'), density: parseFloat($("bgDensity")?.value||'1'), alpha: parseFloat($("bgAlpha")?.value||'0.9') };
    try{ localStorage.setItem('errl_gl_bubbles', JSON.stringify(obj)); }catch(e){}
  }
  on($("bgSpeed"), 'input', ()=> { setBubs({ speed: parseFloat($("bgSpeed").value) }); persistBubs(); });
  on($("bgDensity"), 'input', ()=> { setBubs({ density: parseFloat($("bgDensity").value) }); persistBubs(); });
  on($("bgAlpha"), 'input', ()=> { setBubs({ alpha: parseFloat($("bgAlpha").value) }); persistBubs(); });

  // Orbiting nav bubbles around Errl
  const errl = $("errl");
  let bubbles = Array.from(document.querySelectorAll('.bubble:not(.hidden-bubble)'));
  const hiddenBubble = document.getElementById('gamesBubble');
  const navOrbitSpeedInput = $("navOrbitSpeed");
  const navRadiusInput = $("navRadius");
  const navOrbSizeInput = $("navOrbSize");
  let gamesVisible = false;
  let navOrbitSpeed = parseFloat(navOrbitSpeedInput?.value || '0.25');
  let navRadius = parseFloat(navRadiusInput?.value || '1.0');
  let navOrbScale = parseFloat(navOrbSizeInput?.value || '1');

  function setNavOrbitSpeed(value, { syncInput = true } = {}){
    const min = parseFloat(navOrbitSpeedInput?.min ?? '0');
    const max = parseFloat(navOrbitSpeedInput?.max ?? '2');
    navOrbitSpeed = clamp(Number(value), min, max);
    if (syncInput && navOrbitSpeedInput) navOrbitSpeedInput.value = String(navOrbitSpeed);
    return navOrbitSpeed;
  }
  function setNavRadius(value, { syncInput = true } = {}){
    const min = parseFloat(navRadiusInput?.min ?? '0.6');
    const max = parseFloat(navRadiusInput?.max ?? '1.6');
    navRadius = clamp(Number(value), min, max);
    if (syncInput && navRadiusInput) navRadiusInput.value = String(navRadius);
    return navRadius;
  }
  function setNavOrbScale(value, { syncInput = true } = {}){
    const min = parseFloat(navOrbSizeInput?.min ?? '0.6');
    const max = parseFloat(navOrbSizeInput?.max ?? '1.6');
    navOrbScale = clamp(Number(value), min, max);
    if (syncInput && navOrbSizeInput) navOrbSizeInput.value = String(navOrbScale);
    if (window.errlGLSetOrbScale) window.errlGLSetOrbScale(navOrbScale);
    window.errlGLSyncOrbs && window.errlGLSyncOrbs();
    return navOrbScale;
  }
  function setGamesVisible(next, { skipListenerReset = false } = {}){
    gamesVisible = !!next;
    if (hiddenBubble) hiddenBubble.style.display = gamesVisible ? 'block' : 'none';
    if (!skipListenerReset){
      bubbles = Array.from(document.querySelectorAll('.bubble'));
      bubbles.forEach((b, i)=> {
        if (b && b.dataset){
          b.dataset.orbIndex = String(i);
          delete b.dataset.listenersAttached;
        }
      });
      attachBubbleListeners();
    }
    return gamesVisible;
  }

  on(navOrbitSpeedInput, 'input', ()=>{
    const next = parseFloat(navOrbitSpeedInput?.value || '0');
    setNavOrbitSpeed(next, { syncInput: false });
  });
  on(navRadiusInput, 'input', ()=>{
    const next = parseFloat(navRadiusInput?.value || '1');
    setNavRadius(next, { syncInput: false });
  });
  on(navOrbSizeInput, 'input', ()=>{
    const next = parseFloat(navOrbSizeInput?.value || '1');
    setNavOrbScale(next, { syncInput: false });
  });

  function updateBubbles(ts){
    if (!errl) return requestAnimationFrame(updateBubbles);
    const rect = errl.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    // Update bubbles array in case hidden bubble was toggled
    bubbles = Array.from(document.querySelectorAll('.bubble'));
    // Track visible index separately to maintain alternating orbit direction
    let visibleIndex = 0;
    bubbles.forEach((el, i)=>{
      if (el.style.display === 'none') return; // Skip hidden bubbles
      const base = parseFloat((el.dataset && el.dataset.angle) || '0');
      const dist = parseFloat((el.dataset && el.dataset.dist) || '160') * navRadius;
      // Use visibleIndex instead of i to maintain proper alternating pattern
      const ang = base + (ts * 0.00003 * navOrbitSpeed * (visibleIndex % 2 === 0 ? 1 : -1)) * 360;
      const rad = ang * Math.PI/180;
      const x = cx + Math.cos(rad)*dist;
      const y = cy + Math.sin(rad)*dist;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${navOrbScale})`;
      visibleIndex++; // Only increment for visible bubbles
    });
    window.errlGLSyncOrbs && window.errlGLSyncOrbs();
    requestAnimationFrame(updateBubbles);
  }
  requestAnimationFrame(updateBubbles);

  // Hover → GL orb squish + audio + background color glow
  function attachBubbleListeners(){
    bubbles = Array.from(document.querySelectorAll('.bubble'));
    bubbles.forEach((b,i)=>{
      // Skip if listeners already attached
      if (b.dataset.listenersAttached) return;
      b.dataset.listenersAttached = 'true';
      
      b.addEventListener('mouseenter', ()=>{
        // Get background color from body or errl-bg
        let bgColor = 'rgba(0,200,255,0.7)'; // default
        try {
          const bgEl = document.querySelector('.errl-bg .base') || document.body;
          const computed = window.getComputedStyle(bgEl);
          const bg = computed.background || computed.backgroundColor;
          // Try to extract color from gradient or solid color
          if (bg.includes('radial-gradient')) {
            // Extract color from gradient - use a prominent color from the gradient
            const match = bg.match(/rgba?\([^)]+\)/);
            if (match) {
              bgColor = match[0].replace(/\)$/, ',0.7)');
            }
          } else if (bg && !bg.includes('url')) {
            bgColor = bg.replace(/\)$/, ',0.7)').replace(/rgb\(/, 'rgba(');
          }
        } catch(e) {}
        
        // Apply glow & audio
        b.style.setProperty('--hover-glow', bgColor);
        b.style.boxShadow = `0 0 30px rgba(255,255,255,0.9), 0 0 60px ${bgColor}`;
        audioEngine.playHover(i);
        window.errlGLOrbHover && window.errlGLOrbHover(i,true);
      });
      b.addEventListener('mouseleave', ()=> {
        // Reset glow
        b.style.boxShadow = '';
        window.errlGLOrbHover && window.errlGLOrbHover(i,false);
      });
    });
  }
  attachBubbleListeners();

  window.errlNavControls = {
    getState: () => ({
      speed: navOrbitSpeed,
      radius: navRadius,
      orbScale: navOrbScale,
      gamesVisible,
    }),
    setSpeed: (value, opts) => setNavOrbitSpeed(Number(value), opts),
    setRadius: (value, opts) => setNavRadius(Number(value), opts),
    setOrbScale: (value, opts) => setNavOrbScale(Number(value), opts),
    setGamesVisible: (value, opts) => setGamesVisible(value, opts),
    toggleGames: () => setGamesVisible(!gamesVisible),
  };
  
  // Shift-B handler to toggle hidden Games bubble and re-attach listeners
  const shiftBHandler = (e)=>{
    if (e.key === 'B' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setGamesVisible(!gamesVisible);
    }
  };
  window.addEventListener('keydown', shiftBHandler);

  // GL Orbs toggle
  on($("glOrbsToggle"), 'change', ()=>{
    const el = $("glOrbsToggle");
    if (!el) return; window.errlGLShowOrbs && window.errlGLShowOrbs(!!el.checked);
  });

  // Burst button - stop propagation so it doesn't trigger canvas click
  on($("burstBtn"), 'click', (e)=>{
    e.stopPropagation();
    e.preventDefault();
    e.stopImmediatePropagation();
    window.enableErrlGL && window.enableErrlGL();
    if (window.errlGLBurst) {
      // Get center of viewport for burst
      const x = window.innerWidth / 2;
      const y = window.innerHeight / 2;
      window.errlGLBurst(x, y);
    } else {
      console.warn('errlGLBurst not available');
    }
  });

  // Errl size slider - drive CSS custom property so all layers stay in sync
  on($("errlSize"), 'input', ()=>{
    const wrap = $("errl");
    if(!wrap) return;
    const v = parseFloat($("errlSize").value||'1');
    wrap.style.setProperty('--errlScale', v.toString());
    window.errlGLSyncOrbs && window.errlGLSyncOrbs();
  });

  // Nav Goo (UI filter)
  (function navGoo(){
    const root = document.querySelector('.nav-orbit');
    const blur = document.getElementById('navGooBlur');
    const mult = document.getElementById('navGooMult');
    const thresh = document.getElementById('navGooThresh');
    const enabled = document.getElementById('navGooEnabled');
    const blurNode = document.getElementById('navGooBlurNode');
    const matNode = document.getElementById('navGooMatrixNode');
    function apply(){
      if (blurNode && blur) blurNode.setAttribute('stdDeviation', String(parseFloat(blur.value||'6')));
      if (matNode){
        const m = Math.max(1, parseFloat(mult?.value||'24'));
        const t = parseFloat(thresh?.value||'-14');
        // 4x5 matrix; only bottom-right row affects alpha mapping
        matNode.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${m} ${t}`);
      }
      if (root) root.classList.toggle('goo-on', !!(enabled && enabled.checked));
    }
    ;[blur,mult,thresh,enabled].forEach(el=> el && el.addEventListener('input', apply));
    apply();
  })();

  // Nav Goo+ WebGL controls (wiggle, flow, grip, drip, viscosity)
  (function navGooPlus(){
    const w = document.getElementById('navWiggle');
    const f = document.getElementById('navFlow');
    const g = document.getElementById('navGrip');
    const d = document.getElementById('navDrip');
    const v = document.getElementById('navVisc');
    function apply(){
      // Ensure WebGL is initialized before applying goo effects
      if (!window.errlGLSetGoo) {
        // Try to initialize WebGL if available
        if (window.enableErrlGL) {
          window.enableErrlGL();
          // Wait a frame for initialization
          requestAnimationFrame(() => {
            if (window.errlGLSetGoo) apply();
          });
        }
        return;
      }
      const params = {};
      if (w) params.wiggle = parseFloat(w.value);
      if (f) params.speed = parseFloat(f.value);
      // Grip affects viscosity - higher grip = more resistance = more visible animation
      // Use grip if available, otherwise fall back to viscosity
      if (g) {
        params.viscosity = parseFloat(g.value);
      } else if (v) {
        params.viscosity = parseFloat(v.value);
      }
      if (d) params.drip = (parseFloat(d.value) + 1) / 2; // convert -1..1 to 0..1
      window.errlGLSetGoo(params);
    }
    ;[w,f,g,d,v].forEach(el=> el && el.addEventListener('input', apply));
    // Delay initial apply to ensure WebGL is ready
    setTimeout(apply, 100);
  })();

  // Classic SVG goo controls (Errl tab)
  (function classicGooControls(){
    const CFG_KEY = 'errl_goo_cfg';
    const enabled = $("classicGooEnabled");
    const strength = $("classicGooStrength");
    const wobble = $("classicGooWobble");
    const speed = $("classicGooSpeed");
    const modeSel = $("classicGooAnimMode");
    const animSpeed = $("classicGooAnimSpeed");
    const animateBtn = $("classicGooAnimate");
    const errlImg = $("errlCenter");
    const aura = $("errlAuraMask");
    const nodes = {
      noise: document.getElementById('classicGooNoise'),
      blur: document.getElementById('classicGooVisc'),
      disp: document.getElementById('classicGooDisp'),
      drip: document.getElementById('classicGooDrip')
    };
    let animating = false;
    let phase = 0;
    let dir = 1;
    let raf = null;

    function toggleClass(on){
      if (errlImg) errlImg.classList.toggle('goo', on);
      if (aura) aura.classList.toggle('goo', on);
    }
    function apply(){
      const on = !!enabled?.checked;
      toggleClass(on);
      if (!on) return;
      const mult = parseFloat(strength?.value || '0');
      const wob = parseFloat(wobble?.value || '0');
      const spd = parseFloat(speed?.value || '0');
      if (nodes.disp) nodes.disp.setAttribute('scale', (6 + mult * 18).toFixed(2));
      if (nodes.blur) nodes.blur.setAttribute('stdDeviation', (wob * 6).toFixed(2));
      if (nodes.noise) nodes.noise.setAttribute('baseFrequency', `${(0.004 + wob * 0.01).toFixed(4)} ${(0.006 + spd * 0.01).toFixed(4)}`);
      if (nodes.drip) nodes.drip.setAttribute('dy', (spd * 6).toFixed(2));
    }
    function stopAnim(){
      animating = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      if (animateBtn){
        animateBtn.classList.remove('active');
        animateBtn.textContent = 'Animate';
      }
    }
    function step(){
      if (!animating) return;
      const mode = modeSel?.value || 'ping';
      const speedFactor = Math.max(0.02, parseFloat(animSpeed?.value || '0.1')) * 0.5;
      phase += speedFactor * dir;
      if (mode === 'ping'){
        if (phase > 1){ phase = 1; dir = -1; }
        if (phase < 0){ phase = 0; dir = 1; }
      } else {
        if (phase > 1) phase -= 1;
      }
      const swing = mode === 'loop' ? phase : Math.sin(phase * Math.PI);
      const baseMult = parseFloat(strength?.value || '0');
      if (nodes.disp) nodes.disp.setAttribute('scale', (6 + baseMult * 18 + swing * 5).toFixed(2));
      if (nodes.noise) nodes.noise.setAttribute('seed', String(2 + Math.floor(swing * 60)));
      raf = requestAnimationFrame(step);
    }

    ;[enabled,strength,wobble,speed].forEach(el=> el && el.addEventListener('input', apply));
    on(modeSel, 'change', ()=>{
      phase = 0;
      dir = 1;
    });
    on(animSpeed, 'input', ()=>{
      // keep animation responsive without restarting
    });
    on(animateBtn, 'click', (evt)=>{
      evt.preventDefault();
      if (!enabled || !enabled.checked){
        enabled.checked = true;
        apply();
      }
      animating = !animating;
      if (animateBtn){
        animateBtn.classList.toggle('active', animating);
        animateBtn.textContent = animating ? 'Stop' : 'Animate';
      }
      if (animating){
        phase = 0;
        dir = 1;
        raf = requestAnimationFrame(step);
      } else {
        stopAnim();
      }
      // Persist animation state
      try{
        let cfg = JSON.parse(localStorage.getItem(CFG_KEY)||'{}');
        cfg.classicAnimating = animating;
        localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
      }catch(e){}
    });
    on(enabled, 'change', ()=>{
      if (!enabled.checked) stopAnim();
      apply();
    });
    apply();

    // Auto-start animation if persisted or default to ON
    try{
      let cfg = JSON.parse(localStorage.getItem(CFG_KEY)||'{}');
      if (cfg.classicAnimating === undefined) {
        cfg.classicAnimating = true; // default ON
        localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
      }
      if (cfg.classicAnimating && enabled?.checked !== false) {
        animating = true;
        if (animateBtn){
          animateBtn.classList.add('active');
          animateBtn.textContent = 'Stop';
        }
        phase = 0;
        dir = 1;
        raf = requestAnimationFrame(step);
      }
    }catch(e){}
  })();

  // Slow Gradient button
  on($("navSlowGradient"), 'click', ()=>{
    if (!window.errlGLSetGoo) return;
    // Apply slow, gentle gradient animation
    window.errlGLSetGoo({ speed: 0.3, wiggle: 0.2, viscosity: 0.7, drip: 0.1 });
    // Also update UI sliders to reflect the change
    const f = $("navFlow"); if (f) f.value = 0.3;
    const w = $("navWiggle"); if (w) w.value = 0.2;
    const g = $("navGrip"); if (g) g.value = 0.7;
    const d = $("navDrip"); if (d) d.value = 0.1;
  });

  // Rotate Skins - load randomly from assets folder (with globbed user overrides)
  const userSkinGlob = import.meta.glob('./assets/orb-skins/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
    eager: true,
    import: 'default',
    query: '?url'
  });
  const userSkins = Object.values(userSkinGlob);
  const defaultSkins = [
    './assets/fx/Orb_NeedsFriends.png',
    './assets/Bubbles_ErrlSiteDecor/Bubble-Purp-1.png',
    './assets/Bubbles_ErrlSiteDecor/Bubble-Purp-2.png',
    './assets/Bubbles_ErrlSiteDecor/Bubbles-1.png',
    './assets/Bubbles_ErrlSiteDecor/Bubbles-2.png',
    './assets/BubbleSheets/Bubble_Sheet-Rainbow.png',
    './assets/BubbleSheets/Bubble_Sheet-PinkRed.png'
  ];
  const skinFiles = [...new Set([...userSkins, ...defaultSkins])];
  skinFiles.push(null); // null = procedural fallback
  
  on($("rotateSkins"), 'click', ()=>{
    if (!window.errlGLSetBubblesLayerTexture || skinFiles.length === 0) return;
    // Pick random skin
    const randomSkin = skinFiles[Math.floor(Math.random() * skinFiles.length)];
    const kind = randomSkin ? 'custom' : 'proc';
    // Apply to all bubble layers
    for (let i = 0; i < 6; i++) {
      window.errlGLSetBubblesLayerTexture(i, kind, randomSkin);
    }
  });

  // Apply persisted defaults on load (overlay + gl bubbles + nav goo + RB + Goo)
  (function loadPersisted(){
    try{
      const ov = JSON.parse(localStorage.getItem('errl_gl_overlay')||'null');
      if (ov && window.errlGLSetOverlay) window.errlGLSetOverlay(ov);
      const gb = JSON.parse(localStorage.getItem('errl_gl_bubbles')||'null');
      if (gb && window.errlGLSetBubbles) window.errlGLSetBubbles(gb);
      const ng = JSON.parse(localStorage.getItem('errl_nav_goo_cfg')||'null');
      if (ng){ const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value = String(v); el.dispatchEvent(new Event('input')); } }; const c=(id,v)=>{ const el=document.getElementById(id); if(el){ el.checked=!!v; el.dispatchEvent(new Event('input')); } }; c('navGooEnabled', ng.enabled); e('navGooBlur', ng.blur); e('navGooMult', ng.mult); e('navGooThresh', ng.thresh); }
      const rb = JSON.parse(localStorage.getItem('errl_rb_settings')||'null');
      if (rb){ const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value=String(v); el.dispatchEvent(new Event('input')); } }; e('rbSpeed', rb.speed); e('rbDensity', rb.density); e('rbAlpha', rb.alpha); e('rbWobble', rb.wobble); e('rbFreq', rb.freq); e('rbMin', rb.min); e('rbMax', rb.max); e('rbSizeHz', rb.sizeHz); e('rbJumboPct', rb.jumboPct); e('rbJumboScale', rb.jumboScale); }
      const cg = JSON.parse(localStorage.getItem('errl_goo_cfg')||'null');
      if (cg){ const c=(id,v)=>{ const el=document.getElementById(id); if(el){ el.checked=!!v; el.dispatchEvent(new Event('input')); } }; const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value=String(v); el.dispatchEvent(new Event('input')); } }; c('classicGooEnabled', cg.enabled); e('classicGooStrength', cg.mult); e('classicGooWobble', cg.wobble); e('classicGooSpeed', cg.speed); }
    }catch(e){}
    // Always apply current UI values once on load (acts as baked defaults when nothing persisted)
    const kick = (id) => { const el = document.getElementById(id); if (el) el.dispatchEvent(new Event('input')); };
    kick('glAlpha'); kick('glDX'); kick('glDY');
    kick('bgSpeed'); kick('bgDensity'); kick('bgAlpha');
    kick('errlSize');
  })();

  // Hue Controller bindings
  (function hueBindings(){
    function withHue(cb){
      const H = window.ErrlHueController; if (H) return cb(H);
      setTimeout(()=> withHue(cb), 80);
    }
    const target = $("hueTarget"), onEl=$("hueEnabled"), h=$("hueShift"), s=$("hueSat"), i=$("hueInt"),
          timeline=$("hueTimeline"), playBtn=$("huePlayPause");
    // late WebGL registration bridge
    withHue(H=>{
      const refs = window.__ErrlWebGL;
      if (refs){
        try{ H.registerWebGLLayer('glOverlay', refs.overlay); }catch(e){}
        try{ H.registerWebGLLayer('bgBubbles', refs.bubbles); }catch(e){}
      }
      // apply current UI values once on load - ensure enabled state is properly initialized
      if (target) H.setTarget(target.value);
      // Force initialization by toggling enabled state if needed
      if (onEl) {
        const wasChecked = onEl.checked;
        // Temporarily uncheck to ensure proper initialization
        onEl.checked = false;
        H.setEnabled(false, target?.value||H.currentTarget);
        // Then set to desired state
        onEl.checked = wasChecked;
        H.setEnabled(wasChecked, target?.value||H.currentTarget);
      }
      if (h) H.setHue(+h.value, target?.value||H.currentTarget);
      if (s) H.setSaturation(+s.value, target?.value||H.currentTarget);
      if (i) H.setIntensity(+i.value, target?.value||H.currentTarget);
    });

    on(target,'change', ()=> withHue(H=> H.setTarget(target.value)));
    on(onEl,'change', ()=> withHue(H=> H.setEnabled(!!onEl.checked)));
    on(h,'input', ()=> withHue(H=> H.setHue(+h.value)));
    on(s,'input', ()=> withHue(H=> H.setSaturation(+s.value)));
    on(i,'input', ()=> withHue(H=> H.setIntensity(+i.value)));
    // Global timeline controls (fixed speed)
    on(timeline,'input', ()=> withHue(H=> H.setTimeline(+timeline.value)));
    on(playBtn,'click', ()=> withHue(H=> H.toggleTimeline()));
  })();

  // Background / Vignette controls
  (function bgVignette(){
    const frame = document.querySelector('.vignette-frame');
    const op = document.getElementById('vignetteOpacity');
    const en = document.getElementById('vignetteEnabled');
    const col = document.getElementById('vignetteColor');
    function apply(){ if (!frame) return; frame.style.opacity = en && en.checked ? (op?.value||'0.85') : '0'; if (col) frame.style.boxShadow = `0 40px 120px rgba(0,0,0,1) inset, 0 0 80px rgba(0,0,0,0.8) inset, 0 0 40px ${col.value}22`; }
    ;[op,en,col].forEach(el=> el && el.addEventListener('input', apply));
    apply();
  })();

  // Shimmer background toggling
  (function shimmer(){
    const t = document.getElementById('shimmerToggle');
    function mount(){ try{ if (window.ErrlBG && typeof window.ErrlBG.mount==='function'){ window.ErrlBG.mount({ headerVariant: 2, shimmer: true, parallax: true, hud: false, basePath: '.' }); } }catch(e){} }
    function hide(show){ const root = document.querySelector('.errl-bg'); if (root) root.style.display = show? 'block':'none'; }
    if (t){ t.addEventListener('change', ()=>{ if (t.checked){ const root=document.querySelector('.errl-bg'); if (!root) mount(); else hide(true); } else hide(false); }); if (t.checked) mount(); }
  })();

  // Accessibility toggles
  (function a11y(){
    const body=document.body;
    const reduce=document.getElementById('prefReduce');
    const contrast=document.getElementById('prefContrast');
    const invert=document.getElementById('prefInvert');
    
    function apply(){
      const rm = !!reduce?.checked;
      body.classList.toggle('reduced-motion', rm);
      setMotionMultiplier(rm ? MOTION.reduced : MOTION.base);
      body.classList.toggle('high-contrast', !!contrast?.checked);
      body.classList.toggle('invert-colors', !!invert?.checked);
      const st={ reduce: !!reduce?.checked, contrast: !!contrast?.checked, invert: !!invert?.checked };
      try{ localStorage.setItem('errl_a11y', JSON.stringify(st)); }catch(e){}
    }
    
    [reduce,contrast,invert].forEach(el=> el && el.addEventListener('change', apply));
    try{ 
      const st=JSON.parse(localStorage.getItem('errl_a11y')||'null'); 
      if(st){
        if(reduce){ reduce.checked=!!st.reduce; }
        if(contrast){ contrast.checked=!!st.contrast; } 
        if(invert){ invert.checked=!!st.invert; } 
      } else {
        // Default: reduced motion OFF, but baseline motion multiplier stays gentle
        if(reduce) reduce.checked = false;
        if(contrast) contrast.checked = false;
        if(invert) invert.checked = false;
      }
    }catch(e){}
    apply();
  })();
  
  // Random buttons
  on($("overlayRandom"), 'click', ()=>{
    const alpha = Math.random();
    const dx = Math.floor(Math.random() * 64);
    const dy = Math.floor(Math.random() * 64);
    const a = $("glAlpha"); if(a) { a.value = alpha.toFixed(2); a.dispatchEvent(new Event('input')); }
    const x = $("glDX"); if(x) { x.value = dx; x.dispatchEvent(new Event('input')); }
    const y = $("glDY"); if(y) { y.value = dy; y.dispatchEvent(new Event('input')); }
  });
  
  on($("glbRandom"), 'click', ()=>{
    const speed = Math.random() * 3;
    const density = Math.random() * 1.5;
    const alpha = Math.random();
    const s = $("bgSpeed"); if(s) { s.value = speed.toFixed(2); s.dispatchEvent(new Event('input')); }
    const d = $("bgDensity"); if(d) { d.value = density.toFixed(2); d.dispatchEvent(new Event('input')); }
    const a = $("bgAlpha"); if(a) { a.value = alpha.toFixed(2); a.dispatchEvent(new Event('input')); }
  });
  
  on($("navRandom"), 'click', ()=>{
    const wiggle = Math.random();
    const flow = Math.random() * 2;
    const grip = Math.random();
    const drip = (Math.random() - 0.5) * 2;
    const visc = Math.random();
    const w = $("navWiggle"); if(w) { w.value = wiggle.toFixed(2); w.dispatchEvent(new Event('input')); }
    const f = $("navFlow"); if(f) { f.value = flow.toFixed(2); f.dispatchEvent(new Event('input')); }
    const g = $("navGrip"); if(g) { g.value = grip.toFixed(2); g.dispatchEvent(new Event('input')); }
    const d = $("navDrip"); if(d) { d.value = drip.toFixed(2); d.dispatchEvent(new Event('input')); }
    const v = $("navVisc"); if(v) { v.value = visc.toFixed(2); v.dispatchEvent(new Event('input')); }
  });
  
  on($("classicGooRandom"), 'click', ()=>{
    const mult = Math.random() * 2;
    const wobble = Math.random() * 2;
    const speed = Math.random() * 2;
    const m = $("classicGooStrength"); if(m) { m.value = mult.toFixed(2); m.dispatchEvent(new Event('input')); }
    const w = $("classicGooWobble"); if(w) { w.value = wobble.toFixed(2); w.dispatchEvent(new Event('input')); }
    const s = $("classicGooSpeed"); if(s) { s.value = speed.toFixed(2); s.dispatchEvent(new Event('input')); }
  });
  
  let html2CanvasLoader = null;
  async function ensureHtml2Canvas(){
    if (typeof html2canvas !== 'undefined') return html2canvas;
    if (!html2CanvasLoader){
      html2CanvasLoader = new Promise((resolve, reject)=>{
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
        script.crossOrigin = 'anonymous';
        const timeout = setTimeout(()=> reject(new Error('Timed out loading html2canvas')), 12000);
        script.onload = ()=>{ clearTimeout(timeout); resolve(window.html2canvas); };
        script.onerror = (err)=>{ clearTimeout(timeout); reject(err); };
        document.head.appendChild(script);
      }).catch(err=>{
        console.warn('html2canvas failed to load', err);
        return null;
      });
    }
    return html2CanvasLoader;
  }

  on($("snapshotPngBtn"), 'click', async ()=>{
    const btn = $("snapshotPngBtn");
    if (!btn) return;
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Rendering…';
    try {
      window.enableErrlGL && window.enableErrlGL();
      let dataUrl = window.errlGLScreenshot ? window.errlGLScreenshot() : null;
      if (!dataUrl){
        const html2canvas = await ensureHtml2Canvas();
        if (!html2canvas) throw new Error('html2canvas unavailable (offline?)');
        const phone = document.querySelector('.errl-panel');
        const prevDisplay = phone?.style.display;
        if (phone) phone.style.display = 'none';
        try{
          const canvas = await html2canvas(document.body, {
            useCORS: true,
            logging: false,
            backgroundColor: '#05070d',
            scale: window.devicePixelRatio || 1
          });
          dataUrl = canvas.toDataURL('image/png', 0.98);
        } finally {
          if (phone) phone.style.display = prevDisplay || '';
        }
      }
      if (!dataUrl) throw new Error('No pixels captured');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `errl-portal_${new Date().toISOString().replace(/[:.]/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch(e) {
      console.warn('PNG snapshot failed', e);
      alert('Screenshot failed: ' + (e.message || 'Unknown error'));
    } finally {
      btn.disabled = false;
      btn.textContent = label || '📷 PNG';
    }
  });
  
  // Developer tools: HTML snapshot
  on($("exportHtmlBtn"), 'click', ()=>{
    try {
      // Export current state as HTML with embedded settings
      const settings = {
        hue: {},
        overlay: {},
        bubbles: {},
        nav: {},
        rb: {},
        goo: {},
        timestamp: new Date().toISOString()
      };
      
      // Collect all settings
      try {
        const H = window.ErrlHueController;
        if (H) settings.hue = H.layers;
      } catch(e) {}
      
      try {
        settings.overlay = JSON.parse(localStorage.getItem('errl_gl_overlay') || '{}');
        settings.bubbles = JSON.parse(localStorage.getItem('errl_gl_bubbles') || '{}');
        settings.nav = JSON.parse(localStorage.getItem('errl_nav_goo_cfg') || '{}');
        settings.rb = JSON.parse(localStorage.getItem('errl_rb_settings') || '{}');
        settings.goo = JSON.parse(localStorage.getItem('errl_goo_cfg') || '{}');
      } catch(e) {}
      
      const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Errl Portal Snapshot</title>
  <style>
    body { margin: 0; padding: 20px; font-family: system-ui; background: #0a0f18; color: #e5eaf1; }
    pre { background: #151a2e; padding: 1rem; border-radius: 8px; overflow: auto; }
  </style>
</head>
<body>
  <h1>Errl Portal Snapshot</h1>
  <p>Generated: ${settings.timestamp}</p>
  <h2>Settings</h2>
  <pre>${JSON.stringify(settings, null, 2)}</pre>
  <p>To restore these settings, copy the JSON above and use the "Apply Settings" feature (if available).</p>
</body>
</html>`;
      
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `errl-portal-snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch(e) {
      console.warn('HTML snapshot failed', e);
      alert('Export failed. Please check console for details.');
    }
  });
  

  // Save/Reset defaults buttons and quick-save
  function saveDefaults(){
    try{
      const H = window.ErrlHueController; if (H) localStorage.setItem('errl_hue_layers', JSON.stringify(H.layers));
      // overlay/bubbles saved on change already
      const ng={ enabled: document.getElementById('navGooEnabled')?.checked, blur:+(document.getElementById('navGooBlur')?.value||6), mult:+(document.getElementById('navGooMult')?.value||24), thresh:+(document.getElementById('navGooThresh')?.value||-14) };
      localStorage.setItem('errl_nav_goo_cfg', JSON.stringify(ng));
      const rb={ speed:+(document.getElementById('rbSpeed')?.value||1), density:+(document.getElementById('rbDensity')?.value||1), alpha:+(document.getElementById('rbAlpha')?.value||0.95), wobble:+(document.getElementById('rbWobble')?.value||1), freq:+(document.getElementById('rbFreq')?.value||1), min:+(document.getElementById('rbMin')?.value||14), max:+(document.getElementById('rbMax')?.value||36), sizeHz:+(document.getElementById('rbSizeHz')?.value||0), jumboPct:+(document.getElementById('rbJumboPct')?.value||0.1), jumboScale:+(document.getElementById('rbJumboScale')?.value||1.6) };
      localStorage.setItem('errl_rb_settings', JSON.stringify(rb));
      const cg={ enabled: document.getElementById('classicGooEnabled')?.checked, mult:+(document.getElementById('classicGooStrength')?.value||1), wobble:+(document.getElementById('classicGooWobble')?.value||1), speed:+(document.getElementById('classicGooSpeed')?.value||1) };
      localStorage.setItem('errl_goo_cfg', JSON.stringify(cg));
      alert('Defaults saved.');
    }catch(e){ alert('Could not save defaults.'); }
  }
  function resetDefaults(){
    ['errl_hue_layers','errl_gl_overlay','errl_gl_bubbles','errl_nav_goo_cfg','errl_rb_settings','errl_goo_cfg'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
    alert('Defaults cleared. Reload to see stock settings.');
  }
  const saveBtn=document.getElementById('saveDefaultsBtn'); if (saveBtn) saveBtn.addEventListener('click', saveDefaults);
  const rstBtn=document.getElementById('resetDefaultsBtn'); if (rstBtn) rstBtn.addEventListener('click', resetDefaults);
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'S' && e.shiftKey){ saveDefaults(); }
  });
  // ===== Errl Phone UI (tabs, minimize, drag, scroll-to-top) =====
  (function phoneUI(){
    const panel = document.getElementById('errlPanel');
    if (!panel) return;
    
    // Initialize: ALWAYS start minimized by default (user must click to expand)
    // Force minimized state - ignore localStorage on initial load
    // Clear any stored expanded state to ensure it starts minimized
    localStorage.removeItem('errl_phone_min');
    panel.classList.add('minimized');
    panel.style.setProperty('width', '44px', 'important');
    panel.style.setProperty('height', '44px', 'important');
    panel.style.setProperty('padding', '0', 'important');
    panel.style.setProperty('border-radius', '999px', 'important');
    panel.style.setProperty('overflow', 'hidden', 'important');
    panel.style.setProperty('right', '20px', 'important');
    panel.style.setProperty('top', '20px', 'important');
    panel.style.setProperty('left', 'auto', 'important');
    panel.style.setProperty('bottom', 'auto', 'important');
    panel.style.setProperty('min-width', '44px', 'important');
    panel.style.setProperty('max-width', '44px', 'important');
    panel.style.setProperty('max-height', '44px', 'important');
    // Hide all content inside when minimized
    const headerEl = panel.querySelector('.panel-header');
    const tabsEl = panel.querySelector('.panel-tabs');
    const sectionsEl = panel.querySelectorAll('.panel-section');
    if (headerEl) headerEl.style.display = 'none';
    if (tabsEl) tabsEl.style.display = 'none';
    sectionsEl.forEach(s => s.style.display = 'none');
    
    const header = document.getElementById('errlPhoneHeader');
    const tabsWrap = document.getElementById('panelTabs');
    const minBtn = document.getElementById('phoneMinToggle');
    const sections = Array.from(panel.querySelectorAll('.panel-section'));
    const toTop = document.getElementById('panelScrollTop');

    function activateTab(key){
      // toggle buttons
      if (tabsWrap){
        Array.from(tabsWrap.querySelectorAll('.tab')).forEach(btn=>{
          const on = btn.getAttribute('data-tab') === key;
          btn.classList.toggle('active', on);
        });
      }
      // toggle sections
      sections.forEach(sec=>{
        const on = sec.getAttribute('data-tab') === key;
        sec.style.display = on ? 'block' : 'none';
      });
    }
    // initial tab
    activateTab('hud');
    // tab clicks
    if (tabsWrap){
      tabsWrap.addEventListener('click', (e)=>{
        const t = e.target.closest('.tab');
        if (!t) return;
        const key = t.getAttribute('data-tab');
        if (key) activateTab(key);
      });
    }

    // minimize toggle - minimize to top right corner
    if (minBtn){
      minBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        if (panel.classList.contains('minimized')) {
          // Restore
          panel.classList.remove('minimized');
          panel.style.width = '';
          panel.style.height = '';
          panel.style.padding = '';
          panel.style.borderRadius = '';
          panel.style.overflow = '';
          // Show content again
          const headerEl = panel.querySelector('.panel-header');
          const tabsEl = panel.querySelector('.panel-tabs');
          const sectionsEl = panel.querySelectorAll('.panel-section');
          if (headerEl) headerEl.style.display = '';
          if (tabsEl) tabsEl.style.display = '';
          sectionsEl.forEach(s => s.style.display = '');
          localStorage.setItem('errl_phone_min', '0');
        } else {
          // Minimize to top right
          panel.classList.add('minimized');
          panel.style.width = '44px';
          panel.style.height = '44px';
          panel.style.padding = '0';
          panel.style.borderRadius = '999px';
          panel.style.overflow = 'hidden';
          panel.style.right = '20px';
          panel.style.top = '20px';
          panel.style.left = 'auto';
          panel.style.bottom = 'auto';
          localStorage.setItem('errl_phone_min', '1');
        }
      });
    }
    // restore from minimized when clicking the bubble
    panel.addEventListener('click', (e)=>{
      if (panel.classList.contains('minimized')) {
        // Only expand if clicking the panel itself (not child elements)
        if (e.target === panel || e.target.classList.contains('errl-panel')) {
          panel.classList.remove('minimized');
          panel.style.width = '';
          panel.style.height = '';
          panel.style.padding = '';
          panel.style.borderRadius = '';
          panel.style.overflow = '';
          // Show content again
          const headerEl = panel.querySelector('.panel-header');
          const tabsEl = panel.querySelector('.panel-tabs');
          const sectionsEl = panel.querySelectorAll('.panel-section');
          if (headerEl) headerEl.style.display = '';
          if (tabsEl) tabsEl.style.display = '';
          sectionsEl.forEach(s => s.style.display = '');
          localStorage.setItem('errl_phone_min', '0');
        }
      }
    });

    // drag move (fixed positioning)
    if (header){
      let dragging=false, sx=0, sy=0, startLeft=0, startTop=0;
      function px(v){ return Math.max(0, Math.round(v)); }
      header.addEventListener('pointerdown', (e)=>{
        dragging = true; panel.classList.add('dragging'); header.setPointerCapture(e.pointerId);
        const r = panel.getBoundingClientRect();
        // switch to left/top for free movement
        panel.style.left = px(r.left) + 'px';
        panel.style.top = px(r.top) + 'px';
        panel.style.right = 'auto';
        sx = e.clientX; sy = e.clientY; startLeft = r.left; startTop = r.top;
      });
      header.addEventListener('pointermove', (e)=>{
        if (!dragging) return;
        const dx = e.clientX - sx; const dy = e.clientY - sy;
        panel.style.left = px(startLeft + dx) + 'px';
        panel.style.top = px(startTop + dy) + 'px';
      });
      const end = (e)=>{ if (!dragging) return; dragging=false; panel.classList.remove('dragging'); header.releasePointerCapture?.(e.pointerId); };
      header.addEventListener('pointerup', end);
      header.addEventListener('pointercancel', end);
    }

    // scroll-to-top button
    panel.addEventListener('scroll', ()=>{
      if (!toTop) return;
      toTop.style.display = panel.scrollTop > 140 ? 'block' : 'none';
    });
    if (toTop){
      toTop.addEventListener('click', (e)=>{ e.stopPropagation(); panel.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
  })();

  // Lightweight dev panel bootstrap (only loads when requested)
  (function bootstrapDevPanel(){
    let auto = false;
    try {
      auto = localStorage.getItem('errl_devpanel_auto') === '1';
    } catch (e) {
      auto = false;
    }
    const params = new URLSearchParams(window.location.search);
    if (!auto && !params.has('devpanel')) return;
    import('./devpanel/runtime.ts')
      .then((mod) => mod.mountDevPanel())
      .catch((err) => console.warn('[devpanel] failed to mount', err));
  })();
})();
