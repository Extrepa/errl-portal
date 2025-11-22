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

  // GL Overlay controls removed

  // GL background bubbles + persist minimal defaults
  function setBubs(p){ window.errlGLSetBubbles && window.errlGLSetBubbles(p); }
  function persistBubs(){
    const obj = { speed: parseFloat($("bgSpeed")?.value||'1'), density: parseFloat($("bgDensity")?.value||'1'), alpha: parseFloat($("glAlpha")?.value||'0.9') };
    try{ localStorage.setItem('errl_gl_bubbles', JSON.stringify(obj)); }catch(e){}
  }
  on($("bgSpeed"), 'input', ()=> { setBubs({ speed: parseFloat($("bgSpeed").value) }); persistBubs(); });
  on($("bgDensity"), 'input', ()=> { setBubs({ density: parseFloat($("bgDensity").value) }); persistBubs(); });
  on($("glAlpha"), 'input', ()=> { setBubs({ alpha: parseFloat($("glAlpha").value) }); persistBubs(); });

  // Orbiting nav bubbles around Errl
  const errl = $("errl");
  let bubbles = Array.from(document.querySelectorAll('.bubble:not(.hidden-bubble)'));
  const hiddenBubble = document.getElementById('gamesBubble');
  const navOrbitSpeedInput = $("navOrbitSpeed");
  const navRadiusInput = $("navRadius");
  const navOrbSizeInput = $("navOrbSize");
  let gamesVisible = false;
  let navOrbitSpeed = parseFloat(navOrbitSpeedInput?.value || '1');
  let navRadius = parseFloat(navRadiusInput?.value || '1.0');
  let navOrbScale = parseFloat(navOrbSizeInput?.value || '1');
  let keyboardNavActive = false;
  let keyboardNavIndex = -1;

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

  function getActiveBubbles(){
    return bubbles.filter((el)=> el && el.style.display !== 'none');
  }
  function focusKeyboardBubble(nextIndex){
    const active = getActiveBubbles();
    if (!active.length) return;
    keyboardNavIndex = (nextIndex + active.length) % active.length;
    active.forEach((el)=> el.classList.remove('bubble--focus'));
    const target = active[keyboardNavIndex];
    target.classList.add('bubble--focus');
    target.focus({ preventScroll: true });
  }
  function deactivateKeyboardNav(){
    keyboardNavActive = false;
    keyboardNavIndex = -1;
    bubbles.forEach((el)=> el && el.classList && el.classList.remove('bubble--focus'));
  }
  function activateKeyboardNav(){
    const active = getActiveBubbles();
    if (!active.length) return;
    keyboardNavActive = true;
    focusKeyboardBubble(0);
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

  // Throttle orbit updates to ~30 FPS and avoid heavy DOM queries every frame
  let lastOrbitUpdate = 0;
  const orbitIntervalMs = 33; // ~30fps
  function updateBubbles(ts){
    if (!errl) return requestAnimationFrame(updateBubbles);
    if (ts - lastOrbitUpdate < orbitIntervalMs){
      return requestAnimationFrame(updateBubbles);
    }
    lastOrbitUpdate = ts;

    const rect = errl.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const minViewport = Math.min(window.innerWidth, window.innerHeight);
    const viewportScale = clamp(minViewport / 900, 0.55, 1.05);

    // Refresh bubble list only if count changed (e.g., toggled games bubble)
    const currentCount = document.querySelectorAll('.bubble').length;
    if (currentCount !== bubbles.length){
      bubbles = Array.from(document.querySelectorAll('.bubble'));
    }

    // Track visible index separately to maintain alternating orbit direction
    let visibleIndex = 0;
    bubbles.forEach((el)=>{
      if (!el || el.style.display === 'none') return; // Skip hidden bubbles
      const base = parseFloat((el.dataset && el.dataset.angle) || '0');
      const baseDist = parseFloat((el.dataset && el.dataset.dist) || '160');
      const dist = baseDist * navRadius * viewportScale;
      // Use visibleIndex instead of i to maintain proper alternating pattern
      const ang = base + (ts * 0.00003 * navOrbitSpeed * (visibleIndex % 2 === 0 ? 1 : -1)) * 360;
      const rad = ang * Math.PI/180;
      const x = cx + Math.cos(rad)*dist;
      const y = cy + Math.sin(rad)*dist;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.transform = `translate(-50%, -50%) scale(${navOrbScale})`;
      const isBehind = Math.sin(rad) < 0;
      if (isBehind) {
        el.classList.add('bubble--behind');
        el.style.zIndex = '0';
      } else {
        el.classList.remove('bubble--behind');
        el.style.zIndex = '5';
      }
      visibleIndex++;
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
      b.addEventListener('click', ()=>{
        if (keyboardNavActive) deactivateKeyboardNav();
      });
    });
    if (keyboardNavActive) {
      const nextIndex = keyboardNavIndex >= 0 ? keyboardNavIndex : 0;
      focusKeyboardBubble(nextIndex);
    }
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

  const keyboardNavHandler = (e)=>{
    if ((e.key === 'k' || e.key === 'K') && e.metaKey && !e.shiftKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      if (keyboardNavActive) {
        deactivateKeyboardNav();
      } else {
        activateKeyboardNav();
      }
      return;
    }
    if (!keyboardNavActive) return;
    const active = getActiveBubbles();
    if (!active.length) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      deactivateKeyboardNav();
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusKeyboardBubble(keyboardNavIndex + 1);
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusKeyboardBubble(keyboardNavIndex - 1);
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      focusKeyboardBubble(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      focusKeyboardBubble(active.length - 1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = active[keyboardNavIndex];
      if (target) target.click();
    }
  };
  window.addEventListener('keydown', keyboardNavHandler);

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
      // Only apply if WebGL goo setter exists; do NOT auto-initialize GL
      if (!window.errlGLSetGoo) return;
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
    // No delayed auto-apply; wait for user to enable GL explicitly
  })();

  // Classic SVG goo controls (Errl tab)
  (function classicGooControls(){
    const CFG_KEY = 'errl_goo_cfg';
    const enabled = $("classicGooEnabled");
    const strength = $("classicGooStrength");
    const wobble = $("classicGooWobble");
    const speed = $("classicGooSpeed");
    const strengthAuto = $("classicGooStrengthAuto");
    const wobbleAuto = $("classicGooWobbleAuto");
    const speedAuto = $("classicGooSpeedAuto");
    const autoSpeed = $("classicGooAutoSpeed");
    const mouseReactive = $("classicGooMouseReact");
    const errlImg = $("errlCenter");
    const aura = $("errlAuraMask");
    const nodes = {
      noise: document.getElementById('classicGooNoise'),
      blur: document.getElementById('classicGooVisc'),
      disp: document.getElementById('classicGooDisp'),
      drip: document.getElementById('classicGooDrip')
    };
    const autoDescriptors = [
      { key: 'strength', slider: strength, toggle: strengthAuto },
      { key: 'wobble', slider: wobble, toggle: wobbleAuto },
      { key: 'speed', slider: speed, toggle: speedAuto },
    ];
    let animating = false;
    let raf = null;
    let lastTs = 0;
    let pointerBoost = 0;
    let pointerDecayRaf = null;

    function toggleClass(on){
      if (errlImg) errlImg.classList.toggle('goo', on);
      if (aura) aura.classList.toggle('goo', on);
    }
    function apply(){
      const on = !!enabled?.checked;
      toggleClass(on);
      if (!on) return;
      const boost = pointerBoost;
      const mult = parseFloat(strength?.value || '0');
      const wob = parseFloat(wobble?.value || '0');
      const spd = parseFloat(speed?.value || '0');
      const dispScale = 6 + mult * 18 + boost * 10;
      const wobBlur = (wob + boost * 0.4) * 6;
      const noiseWob = 0.004 + (wob + boost * 0.3) * 0.01;
      const noiseSpd = 0.006 + (spd + boost * 0.5) * 0.01;
      const dripVal = (spd + boost * 0.7) * 6;
      if (nodes.disp) nodes.disp.setAttribute('scale', dispScale.toFixed(2));
      if (nodes.blur) nodes.blur.setAttribute('stdDeviation', wobBlur.toFixed(2));
      if (nodes.noise) nodes.noise.setAttribute('baseFrequency', `${noiseWob.toFixed(4)} ${noiseSpd.toFixed(4)}`);
      if (nodes.drip) nodes.drip.setAttribute('dy', dripVal.toFixed(2));
    }
    const autoStates = new Map();

    function advanceSlider(descriptor, delta){
      const slider = descriptor.slider;
      if (!slider) return;
      const min = parseFloat(slider.min || '0');
      const max = parseFloat(slider.max || '1');
      const span = Math.max(0.0001, max - min);
      const currentValue = parseFloat(slider.value || String(min));
      const currentNorm = Math.min(1, Math.max(0, (currentValue - min) / span));
      let state = autoStates.get(descriptor.key);
      if (!state) {
        state = { target: null, direction: 1 };
        autoStates.set(descriptor.key, state);
      }
      if (state.target == null || Math.abs(state.target - currentNorm) < 0.01) {
        let nextTarget = Math.random();
        // avoid tiny jitter by ensuring meaningful distance
        if (Math.abs(nextTarget - currentNorm) < 0.05) {
          nextTarget = Math.min(1, Math.max(0, currentNorm + (Math.random() > 0.5 ? 0.15 : -0.15)));
        }
        state.target = Math.min(1, Math.max(0, nextTarget));
        state.direction = state.target >= currentNorm ? 1 : -1;
      }
      const step = Math.min(delta, 0.2);
      let nextNorm = currentNorm + state.direction * step;
      const overshootForward = state.direction > 0 && nextNorm > state.target;
      const overshootBackward = state.direction < 0 && nextNorm < state.target;
      if (overshootForward || overshootBackward) {
        nextNorm = state.target;
        state.target = null;
      }
      nextNorm = Math.min(1, Math.max(0, nextNorm));
      const nextValue = min + nextNorm * span;
      slider.value = nextValue.toFixed(2);
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function anyAutoEnabled(){
      return autoDescriptors.some(({ toggle }) => !!toggle?.checked);
    }

    function startAnimation(){
      if (animating) return;
      animating = true;
      lastTs = 0;
      raf = requestAnimationFrame(step);
    }

    function stopAnimation(){
      if (!animating) return;
      animating = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      lastTs = 0;
    }

    function syncAnimationState(){
      if (anyAutoEnabled() && enabled?.checked !== false) {
        startAnimation();
      } else {
        stopAnimation();
      }
    }

    function step(timestamp){
      if (!animating) return;
      if (!enabled?.checked){
        stopAnimation();
        return;
      }
      if (!anyAutoEnabled()){
        stopAnimation();
        return;
      }
      if (!lastTs) lastTs = timestamp;
      const deltaSeconds = (timestamp - lastTs) / 1000;
      lastTs = timestamp;
      const rate = clamp(parseFloat(autoSpeed?.value || '0.05'), 0.01, 0.5);
      const delta = Math.max(0.0002, rate) * deltaSeconds;
      autoDescriptors.forEach((descriptor) => {
        const { toggle } = descriptor;
        if (toggle?.checked) {
          advanceSlider(descriptor, delta);
        } else {
          autoStates.delete(descriptor.key);
        }
      });
      raf = requestAnimationFrame(step);
    }

    function saveAutoConfig(){
      try{
        const cfg = JSON.parse(localStorage.getItem(CFG_KEY)||'{}');
        cfg.auto = {
          rate: parseFloat(autoSpeed?.value || '0.05'),
          strength: !!strengthAuto?.checked,
          wobble: !!wobbleAuto?.checked,
          speed: !!speedAuto?.checked,
        };
        cfg.mouseReactive = !!mouseReactive?.checked;
        localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
      }catch(e){}
    }

    function loadAutoConfig(){
      try{
        const cfg = JSON.parse(localStorage.getItem(CFG_KEY)||'{}');
        const auto = cfg.auto || {};
        if (autoSpeed && typeof auto.rate === 'number') {
          autoSpeed.value = String(auto.rate);
        }
        if (strengthAuto && typeof auto.strength === 'boolean') strengthAuto.checked = auto.strength;
        if (wobbleAuto && typeof auto.wobble === 'boolean') wobbleAuto.checked = auto.wobble;
        if (speedAuto && typeof auto.speed === 'boolean') speedAuto.checked = auto.speed;
        if (mouseReactive && typeof cfg.mouseReactive === 'boolean') {
          mouseReactive.checked = cfg.mouseReactive;
        }
      }catch(e){}
    }

    function setPointerBoost(value){
      const clamped = Math.max(0, Math.min(1, value));
      if (Math.abs(clamped - pointerBoost) < 0.005) return;
      pointerBoost = clamped;
      if (enabled?.checked) apply();
    }

    function pointerMoveHandler(event){
      if (!mouseReactive?.checked || !enabled?.checked) return;
      const target = errlImg || aura;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const maxDim = Math.max(rect.width, rect.height) || 1;
      const dist = Math.min(Math.hypot(dx, dy) / maxDim, 1);
      setPointerBoost(dist);
      if (pointerDecayRaf) cancelAnimationFrame(pointerDecayRaf);
      pointerDecayRaf = null;
    }

    function pointerLeaveHandler(){
      if (pointerDecayRaf) cancelAnimationFrame(pointerDecayRaf);
      const decay = () => {
        pointerBoost = Math.max(0, pointerBoost - 0.02);
        if (pointerBoost > 0.01) {
          apply();
          pointerDecayRaf = requestAnimationFrame(decay);
        } else {
          pointerBoost = 0;
          pointerDecayRaf = null;
          apply();
        }
      };
      pointerDecayRaf = requestAnimationFrame(decay);
    }

    ;[enabled,strength,wobble,speed].forEach(el=> el && el.addEventListener('input', apply));
    autoDescriptors.forEach((descriptor) => {
      const { toggle } = descriptor;
      if (!toggle) return;
      on(toggle, 'change', () => {
        if (toggle.checked) {
          if (enabled && !enabled.checked) {
            enabled.checked = true;
            enabled.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else {
          autoStates.delete(descriptor.key);
        }
        saveAutoConfig();
        syncAnimationState();
      });
    });
    on(autoSpeed, 'input', () => {
      saveAutoConfig();
    });
    on(mouseReactive, 'change', () => {
      if (!mouseReactive?.checked) {
        setPointerBoost(0);
      }
      saveAutoConfig();
    });
    on(enabled, 'change', ()=>{
      if (!enabled.checked) {
        stopAnimation();
        setPointerBoost(0);
      }
      apply();
      syncAnimationState();
    });
    loadAutoConfig();
    apply();
    syncAnimationState();
    window.addEventListener('pointermove', pointerMoveHandler, { passive: true });
    window.addEventListener('pointerleave', pointerLeaveHandler, { passive: true });
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
  const userSkinGlob = import.meta.glob('../../shared/assets/shared/orb-skins/**/*.{png,jpg,jpeg,webp,avif,gif,svg}', {
    eager: true,
    import: 'default',
    query: '?url'
  });
  const userSkins = Object.values(userSkinGlob);
  const defaultSkins = [
    '../../shared/assets/shared/fx/Orb_NeedsFriends.png',
    '../../shared/assets/shared/Bubbles_ErrlSiteDecor/Bubble-Purp-1.png',
    '../../shared/assets/shared/Bubbles_ErrlSiteDecor/Bubble-Purp-2.png',
    '../../shared/assets/shared/Bubbles_ErrlSiteDecor/Bubbles-1.png',
    '../../shared/assets/shared/Bubbles_ErrlSiteDecor/Bubbles-2.png',
    '../../shared/assets/shared/BubbleSheets/Bubble_Sheet-Rainbow.png',
    '../../shared/assets/shared/BubbleSheets/Bubble_Sheet-PinkRed.png'
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
      // Do not auto-apply GL bubbles on load to avoid initializing WebGL implicitly
      const ng = JSON.parse(localStorage.getItem('errl_nav_goo_cfg')||'null');
      if (ng){ const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value = String(v); el.dispatchEvent(new Event('input')); } }; const c=(id,v)=>{ const el=document.getElementById(id); if(el){ el.checked=!!v; el.dispatchEvent(new Event('input')); } }; c('navGooEnabled', ng.enabled); e('navGooBlur', ng.blur); e('navGooMult', ng.mult); e('navGooThresh', ng.thresh); }
      const rb = JSON.parse(localStorage.getItem('errl_rb_settings')||'null');
      if (rb){ const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value=String(v); el.dispatchEvent(new Event('input')); } }; e('rbSpeed', rb.speed); e('rbDensity', rb.density); e('rbAlpha', rb.alpha); e('rbWobble', rb.wobble); e('rbFreq', rb.freq); e('rbMin', rb.min); e('rbMax', rb.max); e('rbSizeHz', rb.sizeHz); e('rbJumboPct', rb.jumboPct); e('rbJumboScale', rb.jumboScale); }
      const cg = JSON.parse(localStorage.getItem('errl_goo_cfg')||'null');
      if (cg){ const c=(id,v)=>{ const el=document.getElementById(id); if(el){ el.checked=!!v; el.dispatchEvent(new Event('input')); } }; const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value=String(v); el.dispatchEvent(new Event('input')); } }; c('classicGooEnabled', cg.enabled); e('classicGooStrength', cg.mult); e('classicGooWobble', cg.wobble); e('classicGooSpeed', cg.speed); }
    }catch(e){}
    // Always apply current UI values once on load (acts as baked defaults when nothing persisted)
    const kick = (id) => { const el = document.getElementById(id); if (el) el.dispatchEvent(new Event('input')); };
    kick('bgSpeed'); kick('bgDensity'); kick('glAlpha');
    kick('navOrbitSpeed');
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
    const ensureTimelineInit = (() => {
      let done = false;
      return (H) => {
        if (done) return;
        H.pauseTimeline();
        done = true;
      };
    })();
    const syncPlayButton = (H) => {
      if (!playBtn || !H || !H.master) return;
      const playing = !!H.master.playing;
      playBtn.textContent = playing ? 'Pause' : 'Play';
      playBtn.setAttribute('aria-pressed', playing ? 'true' : 'false');
      playBtn.title = playing ? 'Pause hue animation' : 'Play hue animation';
    };
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
      ensureTimelineInit(H);
      syncPlayButton(H);
    });

    on(target,'change', ()=> withHue(H=> H.setTarget(target.value)));
    on(onEl,'change', ()=> withHue(H=> H.setEnabled(!!onEl.checked)));
    on(h,'input', ()=> withHue(H=> H.setHue(+h.value)));
    on(s,'input', ()=> withHue(H=> H.setSaturation(+s.value)));
    on(i,'input', ()=> withHue(H=> H.setIntensity(+i.value)));
    // Global timeline controls (fixed speed)
    on(timeline,'input', ()=> withHue(H=> H.setTimeline(+timeline.value)));
    on(playBtn,'click', ()=> withHue(H=> { H.toggleTimeline(); syncPlayButton(H); }));
  })();

  // Background vignette, shimmer removed

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
  // Overlay randomizer removed
  
  on($("glbRandom"), 'click', ()=>{
    const speed = Math.random() * 3;
    const density = Math.random() * 1.5;
    const alpha = Math.random();
    const s = $("bgSpeed"); if(s) { s.value = speed.toFixed(2); s.dispatchEvent(new Event('input')); }
    const d = $("bgDensity"); if(d) { d.value = density.toFixed(2); d.dispatchEvent(new Event('input')); }
    const a = $("glAlpha"); if(a) { a.value = alpha.toFixed(2); a.dispatchEvent(new Event('input')); }
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
    // Rely on CSS for minimized styling; avoid inline !important that can block restoring.
    try { localStorage.removeItem('errl_phone_min'); } catch(_) {}
    panel.classList.add('minimized');
    // no inline size constraints; CSS .errl-panel.minimized handles the bubble look
    
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

    // Helper: clear any inline minimized constraints (from previous versions or HTML)
    function clearMinimizedInlineStyles(){
      const props = ['width','height','padding','border-radius','overflow','right','top','left','bottom','min-width','max-width','max-height'];
      props.forEach(p => { try { panel.style.removeProperty(p); } catch(_) {} });
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
          clearMinimizedInlineStyles();
          // Show content again (CSS handles layout)
          const headerEl = panel.querySelector('.panel-header');
          const tabsEl = panel.querySelector('.panel-tabs');
          const sectionsEl = panel.querySelectorAll('.panel-section');
          if (headerEl) headerEl.style.display = '';
          if (tabsEl) tabsEl.style.display = '';
          sectionsEl.forEach(s => s.style.display = '');
          try { localStorage.setItem('errl_phone_min', '0'); } catch(_) {}
        } else {
          // Minimize
          panel.classList.add('minimized');
          // Ensure no stale inline constraints linger
          clearMinimizedInlineStyles();
          try { localStorage.setItem('errl_phone_min', '1'); } catch(_) {}
        }
      });
    }
    // restore from minimized when clicking the bubble
    panel.addEventListener('click', (e)=>{
      if (panel.classList.contains('minimized')) {
        // Only expand if clicking the panel itself (not child elements)
        if (e.target === panel || e.target.classList.contains('errl-panel')) {
          panel.classList.remove('minimized');
          clearMinimizedInlineStyles();
          // Show content again
          const headerEl = panel.querySelector('.panel-header');
          const tabsEl = panel.querySelector('.panel-tabs');
          const sectionsEl = panel.querySelectorAll('.panel-section');
          if (headerEl) headerEl.style.display = '';
          if (tabsEl) tabsEl.style.display = '';
          sectionsEl.forEach(s => s.style.display = '');
          try { localStorage.setItem('errl_phone_min', '0'); } catch(_) {}
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

  // ------------------------------------------------------------
  // Debug harness: toggle heavy layers / adjust DPR cap safely
  // ------------------------------------------------------------
  (function debugHarness(){
    const DEBUG_KEY = 'errl_debug_flags_v1';
    const DEFAULT_FLAGS = {
      overlay: false,
      orbs: false,
      risingBubbles: false,
      vignette: false,
      dprCap: 1.0,
      perfSafe: false,
    };

    let flags = { ...DEFAULT_FLAGS };
    let overlayCache = null;

    function loadFlags() {
      try {
        const stored = JSON.parse(localStorage.getItem(DEBUG_KEY) || 'null');
        if (stored && typeof stored === 'object') {
          flags = { ...DEFAULT_FLAGS, ...stored };
        }
      } catch (_) {
        flags = { ...DEFAULT_FLAGS };
      }
    }

    function saveFlags() {
      try {
        localStorage.setItem(DEBUG_KEY, JSON.stringify(flags));
      } catch (_) {
        // ignore storage failures
      }
    }

    loadFlags();

    function withGL(fn, attempt = 0) {
      if (typeof window.errlGLSetOverlay === 'function' || typeof window.errlGLShowOrbs === 'function') {
        fn();
        return;
      }
      if (attempt > 40) return;
      setTimeout(() => withGL(fn, attempt + 1), 250);
    }

    function setOverlayEnabled(enabled) {
      if (enabled) {
        withGL(() => {
          if (overlayCache && typeof overlayCache === 'object' && typeof overlayCache.alpha === 'number' && window.errlGLSetOverlay) {
            window.errlGLSetOverlay(overlayCache);
          }
        });
        return;
      }
      // Do NOT initialize WebGL just to disable overlay; apply lazily if GL exists
      withGL(() => {
        if (!overlayCache && typeof window.errlGLGetOverlay === 'function') {
          overlayCache = window.errlGLGetOverlay();
        }
        if (!overlayCache) overlayCache = { alpha: 0.28 };
        window.errlGLSetOverlay && window.errlGLSetOverlay({ alpha: 0 });
      });
    }

    function setOrbsEnabled(enabled) {
      if (!enabled) {
        withGL(() => window.errlGLShowOrbs && window.errlGLShowOrbs(false));
        return;
      }
      window.enableErrlGL && window.enableErrlGL();
      withGL(() => window.errlGLShowOrbs && window.errlGLShowOrbs(true));
    }

    function setRisingBubblesEnabled(enabled) {
      const canvas = document.getElementById('riseBubbles');
      if (canvas) canvas.style.display = enabled ? '' : 'none';
    }

    function setVignetteEnabled(enabled) {
      document.querySelectorAll('.vignette-frame').forEach((el) => {
        el.style.display = enabled ? '' : 'none';
      });
    }

    function applyDprCap(cap, { persist = true } = {}) {
      const numeric = typeof cap === 'number' && !Number.isNaN(cap)
        ? Math.max(0.5, Math.min(4, cap))
        : null;
      flags.dprCap = numeric;
      if (persist) saveFlags();
      try {
        if (numeric === null) {
          localStorage.removeItem('errl_debug_dpr');
        } else {
          localStorage.setItem('errl_debug_dpr', String(numeric));
        }
      } catch (_) {
        /* ignore */
      }
      if (typeof window.errlGLSetDprCap === 'function') {
        window.errlGLSetDprCap(numeric);
      }
    }

    function setPerfSafeEnabled(enabled) {
      const on = !!enabled;
      document.body.classList.toggle('perf-safe', on);
    }

    function applyAllFlags() {
      setPerfSafeEnabled(flags.perfSafe);
      setOverlayEnabled(flags.overlay);
      setOrbsEnabled(flags.orbs);
      setRisingBubblesEnabled(flags.risingBubbles);
      setVignetteEnabled(flags.vignette);
      applyDprCap(flags.dprCap, { persist: false });
    }

    function applyFlag(name, value) {
      switch (name) {
        case 'overlay':
          setOverlayEnabled(value);
          break;
        case 'orbs':
          setOrbsEnabled(value);
          break;
        case 'risingBubbles':
          setRisingBubblesEnabled(value);
          break;
        case 'vignette':
          setVignetteEnabled(value);
          break;
        case 'perfSafe':
          setPerfSafeEnabled(value);
          break;
        default:
          break;
      }
    }

    function setFlag(name, value) {
      if (!(name in flags)) {
        console.warn('[errlDebug] Unknown flag:', name);
        return { ...flags };
      }
      if (name === 'dprCap') {
        applyDprCap(value);
        console.info('[errlDebug] DPR cap set to', value === null ? 'default' : value);
        return { ...flags };
      }
      const boolValue = !!value;
      flags[name] = boolValue;
      saveFlags();
      applyFlag(name, boolValue);
      console.info('[errlDebug]', name, '=>', boolValue);
      return { ...flags };
    }

    const debugAPI = {
      config() {
        return { ...flags };
      },
      set(name, value) {
        return setFlag(name, value);
      },
      toggle(name) {
        if (!(name in flags) || name === 'dprCap') return { ...flags };
        return setFlag(name, !flags[name]);
      },
      perfSafe(on) {
        return setFlag('perfSafe', on == null ? !flags.perfSafe : !!on);
      },
      setDprCap(value, { reload = false } = {}) {
        applyDprCap(value);
        if (reload) setTimeout(() => window.location.reload(), 50);
        return { ...flags };
      },
      reset({ reload = false } = {}) {
        flags = { ...DEFAULT_FLAGS };
        overlayCache = null;
        saveFlags();
        try { localStorage.removeItem('errl_debug_dpr'); } catch (_) {}
        applyAllFlags();
        if (reload) setTimeout(() => window.location.reload(), 50);
        return { ...flags };
      },
      log() {
        console.table([{ ...flags }]);
        return { ...flags };
      },
    };

    try {
      Object.defineProperty(window, 'errlDebug', {
        value: debugAPI,
        configurable: true,
        enumerable: false,
      });
    } catch (e) {
      window.errlDebug = debugAPI;
    }

    window.__ERRL_DEBUG = window.__ERRL_DEBUG || {};
    window.__ERRL_DEBUG.flags = flags;

    applyAllFlags();

    if (!flags.overlay || !flags.orbs || !flags.risingBubbles || !flags.vignette || flags.dprCap !== null) {
      console.info('[errlDebug] Active flags:', { ...flags });
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
    import('../../shared/devpanel/runtime.ts')
      .then((mod) => mod.mountDevPanel())
      .catch((err) => console.warn('[devpanel] failed to mount', err));
  })();
})();
