// Minimal app glue for portal panel → effects wiring
(function(){
  function $(id){ return document.getElementById(id); }

  function on(el, ev, fn){ if (el) el.addEventListener(ev, fn); }
  function clamp(value, min, max){
    if (typeof value !== 'number' || Number.isNaN(value)) return min;
    if (min > max) return value;
    return Math.min(max, Math.max(min, value));
  }

  // ===== Unified settings bundle (single JSON) =====
  // Source of truth key (everything in one place)
  const SETTINGS_KEY = 'errl_portal_settings_v1';
  // Repo defaults (served from public/)
  const DEFAULTS_URL = './apps/landing/config/errl-defaults.json';

  function normalizeBundle(bundle){
    const b = (bundle && typeof bundle === 'object') ? bundle : {};
    if (typeof b.version !== 'number') b.version = 1;
    if (!b.ui || typeof b.ui !== 'object') b.ui = {};
    if (!b.hue || typeof b.hue !== 'object') b.hue = {};
    if (!b.hue.layers || typeof b.hue.layers !== 'object') b.hue.layers = {};
    return b;
  }

  function readJson(key){
    try{
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    }catch(_){
      return null;
    }
  }
  function writeJson(key, value){
    try{
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    }catch(_){
      return false;
    }
  }

  function getBundle(){
    return normalizeBundle(readJson(SETTINGS_KEY));
  }
  function setBundle(bundle){
    return writeJson(SETTINGS_KEY, normalizeBundle(bundle));
  }
  function updateBundle(mutator){
    const bundle = getBundle();
    try{ mutator && mutator(bundle); }catch(_){}
    bundle.version = 1;
    setBundle(bundle);
    return bundle;
  }
  function deepMerge(base, override){
    if (!override || typeof override !== 'object') return base;
    if (!base || typeof base !== 'object') base = Array.isArray(override) ? [] : {};
    const out = Array.isArray(base) ? base.slice() : { ...base };
    Object.keys(override).forEach((k) => {
      const bv = out[k];
      const ov = override[k];
      if (ov && typeof ov === 'object' && !Array.isArray(ov) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
        out[k] = deepMerge(bv, ov);
      } else {
        out[k] = ov;
      }
    });
    return out;
  }

  function snapshotUiControls(){
    const ui = {};
    const root = document.getElementById('errlPanel') || document;
    const inputs = root.querySelectorAll('input[id], select[id], textarea[id]');
    inputs.forEach((el) => {
      if (!el || !el.id) return;
      if (el.tagName === 'INPUT' && el.type === 'button') return;
      if (el.type === 'checkbox') ui[el.id] = !!el.checked;
      else ui[el.id] = el.value;
    });
    return ui;
  }

  function buildBundleFromLegacy(){
    // If any legacy key exists, bundle it.
    const legacy = {
      hue_layers: readJson('errl_hue_layers'),
      gl_overlay: readJson('errl_gl_overlay'),
      gl_bubbles: readJson('errl_gl_bubbles'),
      nav_goo_cfg: readJson('errl_nav_goo_cfg'),
      rb_settings: readJson('errl_rb_settings'),
      goo_cfg: readJson('errl_goo_cfg'),
      ui: readJson('errl_ui_defaults')
    };
    const hasAny =
      legacy.hue_layers || legacy.gl_overlay || legacy.gl_bubbles || legacy.nav_goo_cfg ||
      legacy.rb_settings || legacy.goo_cfg || legacy.ui;
    if (!hasAny) return null;
    return {
      version: 1,
      ui: legacy.ui || {},
      hue: { layers: legacy.hue_layers || {} },
      gl: { overlay: legacy.gl_overlay || {}, bubbles: legacy.gl_bubbles || {} },
      nav: { goo: legacy.nav_goo_cfg || {} },
      rb: legacy.rb_settings || {},
      goo: legacy.goo_cfg || {}
    };
  }

  async function loadRepoDefaults(){
    try{
      const res = await fetch(DEFAULTS_URL, { cache: 'no-cache' });
      if (!res.ok) return null;
      return await res.json();
    }catch(_){
      return null;
    }
  }

  function bundleFromRepoDefaults(repo){
    if (!repo || typeof repo !== 'object') return null;
    const ui = (repo.ui && typeof repo.ui === 'object') ? repo.ui : {};
    return {
      version: 1,
      ui,
      hue: (repo.hue && typeof repo.hue === 'object') ? repo.hue : { layers: {} },
      gl: (repo.gl && typeof repo.gl === 'object') ? repo.gl : { overlay: {}, bubbles: {} },
      nav: (repo.nav && typeof repo.nav === 'object') ? repo.nav : { goo: {} },
      rb: (repo.rb && typeof repo.rb === 'object') ? repo.rb : {},
      goo: (repo.goo && typeof repo.goo === 'object') ? repo.goo : {}
    };
  }

  function applyUiSnapshot(ui){
    if (!ui || typeof ui !== 'object') return;
    Object.keys(ui).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const v = ui[id];
      if (el.type === 'checkbox') {
        el.checked = !!v;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        el.value = String(v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  // Bootstrap: ensure we have a unified bundle, and keep legacy keys in sync so the rest of the code continues working.
  // This runs early (before most bindings) so existing per-feature loaders still pick up values.
  const settingsReady = (async function bootstrapSettingsBundle(){
    try{
      let bundle = readJson(SETTINGS_KEY);
      if (!bundle) {
        bundle = buildBundleFromLegacy();
        if (!bundle) {
          const repo = await loadRepoDefaults();
          bundle = bundleFromRepoDefaults(repo);
        }
        if (bundle) setBundle(bundle);

        // Now that we've migrated into the unified key, clear legacy keys so we don't drift.
        [
          'errl_hue_layers','errl_gl_overlay','errl_gl_bubbles','errl_nav_goo_cfg','errl_rb_settings',
          'errl_goo_cfg','errl_ui_defaults','errl_a11y'
        ].forEach((k)=>{ try{ localStorage.removeItem(k); }catch(_){} });
      }
    }catch(_){}
  })();

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

  // Shimmer toggle control (BG tab)
  (function shimmerControl(){
    const toggle = $("shimmerToggle");
    if (!toggle) return;

    function ensureBackgroundMounted(){
      if (document.querySelector('.errl-bg')) return true;
      if (window.ErrlBG && typeof window.ErrlBG.mount === 'function') {
        try{
          // Mount with shimmer present so we can hide/show it.
          window.ErrlBG.mount({ headerVariant: 2, shimmer: true, parallax: true, hud: false, basePath: '.' });
          return true;
        }catch(e){
          console.warn('Shimmer mount failed:', e);
          return false;
        }
      }
      return false;
    }

    function apply(){
      // Only mount when enabling (avoid creating background just to disable).
      if (toggle.checked) ensureBackgroundMounted();
      const shimmer = document.querySelector('.errl-bg .shimmer');
      if (shimmer && shimmer.style) shimmer.style.display = toggle.checked ? '' : 'none';
    }

    on(toggle, 'change', apply);
    // Apply once on load (covers default checked state even before persistence runs).
    apply();
  })();

  // Vignette toggle control (BG tab)
  (function vignetteControl(){
    const toggle = $("vignetteToggle");
    if (!toggle) return;

    function ensureBackgroundMounted(){
      if (document.querySelector('.errl-bg')) return true;
      if (window.ErrlBG && typeof window.ErrlBG.mount === 'function') {
        try{
          // Mount with shimmer present so controls can hide/show layers independently.
          window.ErrlBG.mount({ headerVariant: 2, shimmer: true, parallax: true, hud: false, basePath: '.' });
          // Respect current shimmer toggle if present.
          const shimmerToggle = document.getElementById('shimmerToggle');
          if (shimmerToggle && shimmerToggle.type === 'checkbox' && !shimmerToggle.checked) {
            const shimmer = document.querySelector('.errl-bg .shimmer');
            if (shimmer && shimmer.style) shimmer.style.display = 'none';
          }
          return true;
        }catch(e){
          console.warn('Vignette mount failed:', e);
          return false;
        }
      }
      return false;
    }

    function apply(){
      if (toggle.checked) ensureBackgroundMounted();
      const bgVig = document.querySelector('.errl-bg .vignette');
      if (bgVig && bgVig.style) bgVig.style.display = toggle.checked ? '' : 'none';
      document.querySelectorAll('.vignette-frame').forEach((el) => {
        if (el && el.style) el.style.display = toggle.checked ? '' : 'none';
      });
    }

    on(toggle, 'change', apply);
    apply();
  })();

  // GL Overlay controls (BG tab)
  (function glOverlayControls(){
    const alpha = $("glOverlayAlpha");
    const dx = $("glOverlayDX");
    const dy = $("glOverlayDY");
    if (!alpha || !dx || !dy) return;

    function withOverlay(fn, attempt = 0){
      if (typeof window.errlGLSetOverlay === 'function') {
        try{ fn(); }catch(_){}
        return;
      }
      if (attempt > 40) return;
      setTimeout(() => withOverlay(fn, attempt + 1), 250);
    }

    function apply(){
      const a = parseFloat(alpha.value || '0.28');
      const x = parseFloat(dx.value || '24');
      const y = parseFloat(dy.value || '18');
      withOverlay(() => {
        window.errlGLSetOverlay({ alpha: a, dx: x, dy: y });
      });
    }

    ;[alpha, dx, dy].forEach((el) => on(el, 'input', apply));
    apply();
  })();

  // GL background bubbles + persist minimal defaults
  function setBubs(p){ window.errlGLSetBubbles && window.errlGLSetBubbles(p); }
  function persistBubs(){
    const obj = { speed: parseFloat($("bgSpeed")?.value||'1'), density: parseFloat($("bgDensity")?.value||'1'), alpha: parseFloat($("glAlpha")?.value||'0.9') };
    updateBundle((b)=> {
      b.gl = b.gl || {};
      b.gl.bubbles = obj;
    });
  }
  on($("bgSpeed"), 'input', ()=> { setBubs({ speed: parseFloat($("bgSpeed").value) }); persistBubs(); });
  on($("bgDensity"), 'input', ()=> { setBubs({ density: parseFloat($("bgDensity").value) }); persistBubs(); });
  on($("glAlpha"), 'input', ()=> { setBubs({ alpha: parseFloat($("glAlpha").value) }); persistBubs(); });

  // Orbiting nav bubbles around Errl
  // Initialize variables - will be set when DOM is ready
  let errl = null;
  let bubbles = [];
  let navOrbitSpeedInput = null;
  let navRadiusInput = null;
  let navOrbSizeInput = null;
  let navOrbitSpeed = 1;
  let navRadius = 1.0;
  let navOrbScale = 1;
  let keyboardNavActive = false;
  let keyboardNavIndex = -1;
  let bubblesInitialized = false;
  // Track hovered bubbles and their frozen positions
  const hoveredBubbles = new Map(); // Map<bubble element, {x, y}>

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
    // Use CSS variable so animation (wobble) can compose with scale.
    const orbits = Array.from(document.querySelectorAll('.nav-orbit'));
    orbits.forEach((orbit) => {
      if (orbit && orbit.style) orbit.style.setProperty('--navOrbScale', String(navOrbScale));
    });
    window.errlGLSyncOrbs && window.errlGLSyncOrbs();
    return navOrbScale;
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

  // Event listeners are now attached in initializeBubbles()

  // Initialize bubble system - ensures DOM is ready
  function initializeBubbles() {
    if (bubblesInitialized) return true;
    
    // Check for required elements
    errl = $("errl");
    if (!errl) {
      console.warn('[portal-app] Errl element (#errl) not found, retrying...');
      return false;
    }
    
    bubbles = Array.from(document.querySelectorAll('.nav-orbit .bubble'));
    navOrbitSpeedInput = $("navOrbitSpeed");
    navRadiusInput = $("navRadius");
    navOrbSizeInput = $("navOrbSize");
    
    // Check for bubbles
    if (bubbles.length === 0) {
      console.warn('[portal-app] No nav bubbles found, retrying...');
      return false;
    }
    
    // Initialize values from inputs
    navOrbitSpeed = parseFloat(navOrbitSpeedInput?.value || '1');
    navRadius = parseFloat(navRadiusInput?.value || '1.0');
    navOrbScale = parseFloat(navOrbSizeInput?.value || '1');
    // Apply initial scale via CSS variable so it's visible immediately.
    const orbits = Array.from(document.querySelectorAll('.nav-orbit'));
    orbits.forEach((orbit) => {
      if (orbit && orbit.style) orbit.style.setProperty('--navOrbScale', String(navOrbScale));
    });
    
    // Attach event listeners
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
    
    // Attach bubble listeners
    attachBubbleListeners();
    
    // Set z-index immediately on initialization to ensure layering works
    const orbitFront = document.getElementById('navOrbit');
    const orbitBehind = document.getElementById('navOrbitBehind');
    if (orbitFront) orbitFront.style.zIndex = '2';
    if (orbitBehind) orbitBehind.style.zIndex = '0';
    if (errl) errl.style.zIndex = '1';
    
    bubblesInitialized = true;
    console.log('[portal-app] Nav bubbles initialized:', bubbles.length, 'bubbles found');
    return true;
  }

  // Throttle orbit updates to ~30 FPS and avoid heavy DOM queries every frame
  let lastOrbitUpdate = 0;
  function getOrbitIntervalMs(){
    // Default to smooth ~60fps; allow perf-safe mode to cap updates.
    // (perf-safe is controlled by the debug harness / body class)
    try{
      return document.body && document.body.classList.contains('perf-safe') ? 33 : 16;
    }catch(_){
      return 16;
    }
  }
  function getEstimatedBubbleRadiusPx(navOrbScaleValue){
    // Bubble size is: clamp(67px, 9.6vw, 118px) * --navOrbScale
    const base = clamp(window.innerWidth * 0.096, 67, 118);
    const scale = (typeof navOrbScaleValue === 'number' && Number.isFinite(navOrbScaleValue)) ? navOrbScaleValue : 1;
    return 0.5 * base * scale;
  }
  function updateBubbles(ts){
    // Ensure initialization before updating
    if (!bubblesInitialized) {
      if (!initializeBubbles()) {
        return requestAnimationFrame(updateBubbles);
      }
    }
    
    if (!errl) {
      bubblesInitialized = false;
      return requestAnimationFrame(updateBubbles);
    }
    
    const orbitIntervalMs = getOrbitIntervalMs();
    if (ts - lastOrbitUpdate < orbitIntervalMs){
      return requestAnimationFrame(updateBubbles);
    }
    lastOrbitUpdate = ts;

    const rect = errl.getBoundingClientRect();
    // Ensure we have valid dimensions before calculating center
    if (rect.width === 0 || rect.height === 0) {
      return requestAnimationFrame(updateBubbles);
    }
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const minViewport = Math.min(window.innerWidth, window.innerHeight);
    const viewportScale = clamp(minViewport / 900, 0.55, 1.05);

    // Orbit layout: bubbles orbit around Errl using their data-angle/data-dist.
    // As they orbit, bubbles above Errl render in front; below Errl render behind.
    const active = bubbles.filter((el)=> el && el.style.display !== 'none');
    if (!active.length) {
      window.errlGLSyncOrbs && window.errlGLSyncOrbs();
      return requestAnimationFrame(updateBubbles);
    }

    // Verify containers exist before proceeding
    const orbitFront = document.getElementById('navOrbit');
    const orbitBehind = document.getElementById('navOrbitBehind');
    if (!orbitFront || !orbitBehind) {
      console.warn('[portal-app] Orbit containers missing, retrying...');
      return requestAnimationFrame(updateBubbles);
    }
    
    // Explicitly set z-index via JavaScript inline styles to ensure it applies
    // Inline styles have higher specificity than CSS classes
    orbitFront.style.zIndex = '2';
    orbitBehind.style.zIndex = '0';
    // Also ensure Errl has correct z-index (inline style overrides CSS)
    if (errl) {
      errl.style.zIndex = '1';
    }
    const pad = 10;
    const tSec = ts * 0.001;
    const speedDegPerSec = 12 * navOrbitSpeed; // baseline orbit rate (slower default)
    const wobbleAmpDeg = 3.5 * clamp(navOrbitSpeed, 0, 2);
    const radiusWobble = 10 * viewportScale * clamp(navOrbitSpeed, 0, 2);
    const bubbleRadiusPx = getEstimatedBubbleRadiusPx(navOrbScale);

    function placeBubble(el, index, count){
      // Check if this bubble is hovered - if so, use frozen position
      const hoveredPos = hoveredBubbles.get(el);
      if (hoveredPos && Number.isFinite(hoveredPos.x) && Number.isFinite(hoveredPos.y)) {
        // Use frozen position, but still update layering
        const x = hoveredPos.x;
        const y = hoveredPos.y;
        
        // Dynamic layering based on orbit position:
        // above center => front; below center => behind. Use a small band to avoid jitter.
        const hysteresis = 10;
        const currentlyBehind = el.parentElement === orbitBehind;
        let shouldBeBehind = currentlyBehind;
        if (y > cy + hysteresis) shouldBeBehind = true;
        else if (y < cy - hysteresis) shouldBeBehind = false;

        const targetParent = shouldBeBehind ? orbitBehind : orbitFront;
        if (targetParent && el.parentElement !== targetParent) {
          targetParent.appendChild(el);
        }

        el.style.position = 'absolute';
        el.style.left = x.toFixed(2) + 'px';
        el.style.top = y.toFixed(2) + 'px';
        el.style.pointerEvents = 'auto';

        if (shouldBeBehind) el.classList.add('bubble--behind');
        else el.classList.remove('bubble--behind');

        return; // Skip normal movement calculation
      }

      const baseAngleDeg = parseFloat((el.dataset && el.dataset.angle) || '');
      const baseDist = parseFloat((el.dataset && el.dataset.dist) || '160');
      const angleDeg = (Number.isFinite(baseAngleDeg) ? baseAngleDeg : ((index / Math.max(1, count)) * 360))
        + (tSec * speedDegPerSec)
        + Math.sin(tSec * 0.65 + index * 1.7) * wobbleAmpDeg;
      const rad = angleDeg * Math.PI / 180;
      const dist = (Number.isFinite(baseDist) ? baseDist : 160) * navRadius * viewportScale
        + Math.sin(tSec * 0.9 + index * 1.3) * radiusWobble;

      const rawX = cx + Math.cos(rad) * dist;
      const rawY = cy + Math.sin(rad) * dist;

      // Validate before touching the DOM (avoid writing "NaNpx" / invalid values).
      if (!Number.isFinite(rawX) || !Number.isFinite(rawY)) return;

      // Soft clamp to viewport without forcing layout reads (prevents jitter/choppiness).
      const x = clamp(rawX, pad + bubbleRadiusPx, window.innerWidth - pad - bubbleRadiusPx);
      const y = clamp(rawY, pad + bubbleRadiusPx, window.innerHeight - pad - bubbleRadiusPx);

      // Dynamic layering based on orbit position:
      // above center => front; below center => behind. Use a small band to avoid jitter.
      const hysteresis = 10;
      const currentlyBehind = el.parentElement === orbitBehind;
      let shouldBeBehind = currentlyBehind;
      if (y > cy + hysteresis) shouldBeBehind = true;
      else if (y < cy - hysteresis) shouldBeBehind = false;

      const targetParent = shouldBeBehind ? orbitBehind : orbitFront;
      if (targetParent && el.parentElement !== targetParent) {
        targetParent.appendChild(el);
      }

      el.style.position = 'absolute';
      // Keep subpixel precision for smoother motion (avoid Math.round stutter).
      el.style.left = x.toFixed(2) + 'px';
      el.style.top = y.toFixed(2) + 'px';
      el.style.pointerEvents = 'auto';

      if (shouldBeBehind) el.classList.add('bubble--behind');
      else el.classList.remove('bubble--behind');

      // NOTE: transform is owned by CSS wobble animation; do not set it here.
    }

    for (let i = 0; i < active.length; i++) {
      placeBubble(active[i], i, active.length);
    }

    window.errlGLSyncOrbs && window.errlGLSyncOrbs();
    requestAnimationFrame(updateBubbles);
  }
  
  // Start the bubble update loop - will wait for DOM if needed
  // Set initial z-index immediately (don't wait for first frame)
  const orbitFrontInit = document.getElementById('navOrbit');
  const orbitBehindInit = document.getElementById('navOrbitBehind');
  const errlInit = document.getElementById('errl');
  if (orbitFrontInit) orbitFrontInit.style.zIndex = '2';
  if (orbitBehindInit) orbitBehindInit.style.zIndex = '0';
  if (errlInit) errlInit.style.zIndex = '1';
  requestAnimationFrame(updateBubbles);
  
  // Additional safeguard: Try to initialize on DOMContentLoaded if not already done
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!bubblesInitialized) {
        initializeBubbles();
      }
    });
  } else {
    // DOM already loaded, try initialization immediately
    if (!bubblesInitialized) {
      initializeBubbles();
    }
  }

  // Hover → GL orb squish + audio + background color glow
  function attachBubbleListeners(){
    bubbles = Array.from(document.querySelectorAll('.nav-orbit .bubble'));
    bubbles.forEach((b,i)=>{
      // Skip if listeners already attached
      if (b.dataset.listenersAttached) return;
      b.dataset.listenersAttached = 'true';

      function applyHoldHover(){
        // Freeze bubble position when hovering/holding
        const currentX = parseFloat(b.style.left) || 0;
        const currentY = parseFloat(b.style.top) || 0;
        if (Number.isFinite(currentX) && Number.isFinite(currentY)) {
          hoveredBubbles.set(b, { x: currentX, y: currentY });
        }

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
      }

      function clearHoldHover(){
        // Unfreeze bubble position when leaving hover/hold
        hoveredBubbles.delete(b);
        // Reset glow
        b.style.boxShadow = '';
        window.errlGLOrbHover && window.errlGLOrbHover(i,false);
      }

      // Desktop mouse hover remains as-is.
      b.addEventListener('mouseenter', applyHoldHover);
      b.addEventListener('mouseleave', clearHoldHover);

      // Touch/pen: press-and-hold hover (active while pointer is down).
      b.addEventListener('pointerdown', (e)=>{
        try{
          if (!e || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
          // Only primary contact.
          if (e.isPrimary === false) return;
          b.dataset.holdPointerId = String(e.pointerId);
          try { b.setPointerCapture && b.setPointerCapture(e.pointerId); } catch(_) {}
          applyHoldHover();
        } catch(_) {}
      });
      function onPointerUpCancel(e){
        try{
          const pid = b.dataset.holdPointerId ? Number(b.dataset.holdPointerId) : null;
          if (pid != null && e && typeof e.pointerId === 'number' && e.pointerId !== pid) return;
          delete b.dataset.holdPointerId;
          clearHoldHover();
          try { b.releasePointerCapture && b.releasePointerCapture(e.pointerId); } catch(_) {}
        } catch(_) {}
      }
      b.addEventListener('pointerup', onPointerUpCancel);
      b.addEventListener('pointercancel', onPointerUpCancel);
      b.addEventListener('lostpointercapture', onPointerUpCancel);

      b.addEventListener('click', ()=>{
        if (keyboardNavActive) deactivateKeyboardNav();
      });
    });
    if (keyboardNavActive) {
      const nextIndex = keyboardNavIndex >= 0 ? keyboardNavIndex : 0;
      focusKeyboardBubble(nextIndex);
    }
  }

  window.errlNavControls = {
    getState: () => ({
      speed: navOrbitSpeed,
      radius: navRadius,
      orbScale: navOrbScale,
    }),
    setSpeed: (value, opts) => setNavOrbitSpeed(Number(value), opts),
    setRadius: (value, opts) => setNavRadius(Number(value), opts),
    setOrbScale: (value, opts) => setNavOrbScale(Number(value), opts),
  };

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

  // Errl size slider - use CSS zoom for crisp scaling (with Firefox fallback)
  on($("errlSize"), 'input', ()=>{
    const wrap = $("errl");
    if(!wrap) return;
    const v = parseFloat($("errlSize").value||'1');
    // Use zoom for crisp scaling (Chrome/Safari/Edge) or transform scale for Firefox
    if (CSS.supports('zoom', '1')) {
      wrap.style.zoom = v.toString();
      wrap.style.setProperty('--errlScale', '1');
    } else {
      // Firefox fallback: use transform scale with better rendering
      wrap.style.zoom = '';
      wrap.style.setProperty('--errlScale', v.toString());
    }
    window.errlGLSyncOrbs && window.errlGLSyncOrbs();
  });

  // Nav Goo (UI filter)
  (function navGoo(){
    const roots = Array.from(document.querySelectorAll('.nav-orbit'));
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
      roots.forEach((root) => {
        if (root) root.classList.toggle('goo-on', !!(enabled && enabled.checked));
      });
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
    function gradientAnimating(){
      return !!window.__errlNavGradientAnimating;
    }
    function apply(){
      // Only apply if WebGL goo setter exists; do NOT auto-initialize GL
      if (!window.errlGLSetGoo) return;
      const params = {};
      if (w) params.wiggle = parseFloat(w.value);
      // Keep goo static unless Slow Gradient is active.
      if (f) params.speed = gradientAnimating() ? parseFloat(f.value) : 0;
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
    let pointerMoveRaf = null;
    let pendingPointerEvent = null;

    function toggleClass(on){
      if (errlImg) errlImg.classList.toggle('goo', on);
      if (aura) aura.classList.toggle('goo', on);
    }
    function apply(){
      const on = !!enabled?.checked;
      toggleClass(on);
      if (!on) return;
      // pointerBoost represents how close mouse is to center (0 = far, 1 = center)
      // When close to center, reduce goo effects to make it more "normal"
      const normalizationFactor = pointerBoost; // 1 = at center (reduce goo), 0 = far away (normal goo)
      const mult = parseFloat(strength?.value || '0');
      const wob = parseFloat(wobble?.value || '0');
      const spd = parseFloat(speed?.value || '0');
      // Reduce goo effects when mouse is close to center
      // Tuned for 0..1 sliders with a subtle midpoint at 0.5.
      // Keep some visible character at mid, but avoid the old “too strong” feel.
      // Increase range so 1.0 is clearly visible, while 0.5 stays subtle.
      const dispScale = 5 + mult * 18 * (1 - normalizationFactor * 0.6);
      const wobBlur = wob * (1 - normalizationFactor * 0.5) * 5.5;
      const noiseWob = 0.0035 + wob * (1 - normalizationFactor * 0.4) * 0.010;
      const noiseSpd = 0.0040 + spd * (1 - normalizationFactor * 0.5) * 0.012;
      const dripVal = spd * (1 - normalizationFactor * 0.6) * 5.5;
      if (nodes.disp) nodes.disp.setAttribute('scale', dispScale.toFixed(2));
      if (nodes.blur) nodes.blur.setAttribute('stdDeviation', wobBlur.toFixed(2));
      if (nodes.noise) nodes.noise.setAttribute('baseFrequency', `${noiseWob.toFixed(4)} ${noiseSpd.toFixed(4)}`);
      if (nodes.drip) nodes.drip.setAttribute('dy', dripVal.toFixed(2));
    }
    const autoStates = new Map();

    function getSliderStepInfo(slider){
      const raw = (slider && typeof slider.step === 'string') ? slider.step : '';
      const step = parseFloat(raw || '0');
      if (!Number.isFinite(step) || step <= 0) return { step: null, decimals: 0 };
      const decimals = raw.includes('.') ? (raw.split('.')[1] || '').length : 0;
      return { step, decimals };
    }
    function roundToStep(value, step){
      return step ? (Math.round(value / step) * step) : value;
    }

    function advanceSlider(descriptor, delta){
      const slider = descriptor.slider;
      if (!slider) return;
      const min = parseFloat(slider.min || '0');
      const max = parseFloat(slider.max || '1');
      const span = Math.max(0.0001, max - min);
      let state = autoStates.get(descriptor.key);
      if (!state) {
        state = { target: null, direction: 1, norm: null };
        autoStates.set(descriptor.key, state);
      }
      // Maintain an internal high-precision value so small deltas accumulate even
      // when the input has a coarse step (otherwise the slider may never move).
      const sliderValue = parseFloat(slider.value || String(min));
      const sliderNorm = Math.min(1, Math.max(0, (sliderValue - min) / span));
      if (state.norm == null || !Number.isFinite(state.norm)) {
        state.norm = sliderNorm;
      } else {
        // If user moved the slider manually, sync our internal value.
        const { step: stepSize } = getSliderStepInfo(slider);
        const stepNorm = stepSize ? (stepSize / span) : 0;
        if (stepNorm > 0 && Math.abs(sliderNorm - state.norm) > stepNorm * 0.75) {
          state.norm = sliderNorm;
        }
      }
      const currentNorm = Math.min(1, Math.max(0, Number(state.norm) || 0));
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
      state.norm = nextNorm;
      const nextValue = min + nextNorm * span;
      const { step: stepSize, decimals } = getSliderStepInfo(slider);
      const rounded = stepSize ? roundToStep(nextValue, stepSize) : nextValue;
      slider.value = stepSize ? rounded.toFixed(decimals) : String(rounded);
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
      if (!lastTs) {
        lastTs = timestamp;
        raf = requestAnimationFrame(step);
        return;
      }
      // Use fixed timestep for smoother animation (cap at 60fps equivalent)
      const deltaSeconds = Math.min((timestamp - lastTs) / 1000, 1/60);
      lastTs = timestamp;
      // Auto speed controls how quickly we sweep sliders. Keep it linear so users
      // can feel the effect immediately (0 = stop).
      const rate = clamp(parseFloat(autoSpeed?.value || '0.05'), 0, 0.25);
      // Allow true stop at 0.
      if (rate <= 0) {
        raf = requestAnimationFrame(step);
        return;
      }
      const delta = rate * deltaSeconds;
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
      // Persistence is handled by the unified bundle auto-sync (and Save Defaults).
      // Keep this function for wiring, but only update the bundle's semantic goo section best-effort.
      try{
        updateBundle((b)=>{
          b.goo = b.goo || {};
          b.goo.auto = {
            rate: parseFloat(autoSpeed?.value || '0.05'),
            strength: !!strengthAuto?.checked,
            wobble: !!wobbleAuto?.checked,
            speed: !!speedAuto?.checked,
          };
          b.goo.mouseReactive = !!mouseReactive?.checked;
        });
      }catch(_){}
    }

    function loadAutoConfig(){
      // Inputs are restored via bundle.ui snapshot in loadPersisted(). Nothing to do here.
    }

    function setPointerBoost(value){
      const clamped = Math.max(0, Math.min(1, value));
      if (Math.abs(clamped - pointerBoost) < 0.005) return;
      pointerBoost = clamped;
      if (enabled?.checked) apply();
    }

    function pointerMoveHandler(event){
      if (!mouseReactive?.checked || !enabled?.checked) return;
      // Store the latest event for processing in the next frame
      pendingPointerEvent = event;
      // Throttle updates to requestAnimationFrame for smooth rendering
      if (!pointerMoveRaf) {
        pointerMoveRaf = requestAnimationFrame(() => {
          pointerMoveRaf = null;
          if (!pendingPointerEvent) return;
          const evt = pendingPointerEvent;
          pendingPointerEvent = null;
          const target = errlImg || aura;
          if (!target) return;
          const rect = target.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dx = evt.clientX - cx;
          const dy = evt.clientY - cy;
          const maxDim = Math.max(rect.width, rect.height) || 1;
          const dist = Math.min(Math.hypot(dx, dy) / maxDim, 1);
          // Invert: closer to center (dist closer to 0) = higher normalization factor
          // This will reduce goo effects when mouse is close to center
          const normalizationFactor = 1 - dist;
          setPointerBoost(normalizationFactor);
          if (pointerDecayRaf) cancelAnimationFrame(pointerDecayRaf);
          pointerDecayRaf = null;
        });
      }
    }

    function pointerLeaveHandler(){
      // Cancel any pending pointer move updates
      if (pointerMoveRaf) {
        cancelAnimationFrame(pointerMoveRaf);
        pointerMoveRaf = null;
      }
      pendingPointerEvent = null;
      if (pointerDecayRaf) cancelAnimationFrame(pointerDecayRaf);
      const decay = () => {
        // Decay normalization factor back to 0 (normal goo state)
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
    // Play/pause button for auto-fade
    const autoPlayPause = $("classicGooAutoPlayPause");
    function updateAutoPlayPauseButton() {
      if (!autoPlayPause) return;
      const hasAuto = anyAutoEnabled();
      // Always show button when auto is enabled, hide when disabled
      autoPlayPause.style.display = hasAuto ? 'block' : 'none';
      if (hasAuto) {
        autoPlayPause.textContent = animating ? 'Pause' : 'Play';
        autoPlayPause.setAttribute('aria-pressed', animating ? 'true' : 'false');
        autoPlayPause.title = animating ? 'Pause auto-fade animation' : 'Play auto-fade animation';
        // Add/remove animating class for visual feedback
        if (animating) {
          autoPlayPause.classList.add('animating');
        } else {
          autoPlayPause.classList.remove('animating');
        }
      }
    }
    if (autoPlayPause) {
      on(autoPlayPause, 'click', ()=>{
        if (animating) {
          stopAnimation();
        } else {
          if (anyAutoEnabled() && enabled?.checked) {
            startAnimation();
          }
        }
        updateAutoPlayPauseButton();
      });
    }
    // Update button visibility when auto toggles change
    autoDescriptors.forEach(({ toggle }) => {
      if (toggle) {
        on(toggle, 'change', updateAutoPlayPauseButton);
      }
    });
    on(enabled, 'change', updateAutoPlayPauseButton);

    // Expose stop function for reset
    window.__errlStopGooAuto = function() {
      stopAnimation();
    };
    
    // Defer bundle-based restoration until settings are ready.
    settingsReady.then(()=>{
      const bundle = getBundle();
      if (bundle && bundle.ui) {
        // Apply UI snapshot (includes auto speed + toggles). This will dispatch events and sync animation state.
        applyUiSnapshot(bundle.ui);
      }
    }).catch(()=>{});

    loadAutoConfig();
    // Ensure goo is enabled by default if checkbox is checked (even before loadPersisted runs)
    if (enabled && enabled.checked) {
      apply();
    }
    syncAnimationState();
    updateAutoPlayPauseButton();
    window.addEventListener('pointermove', pointerMoveHandler, { passive: true });
    window.addEventListener('pointerleave', pointerLeaveHandler, { passive: true });
  })();

  // Slow Gradient button with play/pause
  (function navGradientControls(){
    let gradientAnimating = false;
    let gradientRaf = null;
    const slowGradientBtn = $("navSlowGradient");
    const gradientPlayPause = $("navGradientPlayPause");
    // Global flag used by Nav Goo+ controls to gate animation.
    window.__errlNavGradientAnimating = false;
    
    // Expose stop function for reset
    window.__errlStopNavGradient = function() {
      stopGradientAnimation();
    };
    
    function startGradientAnimation(){
      if (gradientAnimating || !window.errlGLSetGoo) return;
      gradientAnimating = true;
      window.__errlNavGradientAnimating = true;
      const startTime = Date.now();
      const period = 8000; // 8 second cycle
      
      function clamp(n, a, b){
        n = Number(n);
        if (!Number.isFinite(n)) return a;
        return Math.max(a, Math.min(b, n));
      }
      function readBaseParams(){
        const fEl = $("navFlow");
        const wEl = $("navWiggle");
        const gEl = $("navGrip") || $("navVisc");
        const dEl = $("navDrip");
        const baseSpeed = clamp(parseFloat(fEl?.value || '0.3'), 0, 2);
        const baseWiggle = clamp(parseFloat(wEl?.value || '0.2'), 0, 1);
        const baseVisc = clamp(parseFloat(gEl?.value || '0.7'), 0, 1);
        const baseDrip = dEl
          ? clamp((parseFloat(dEl.value || '0') + 1) / 2, 0, 1)
          : 0.1;
        return { baseSpeed, baseWiggle, baseVisc, baseDrip };
      }

      function animate(){
        if (!gradientAnimating) return;
        const elapsed = (Date.now() - startTime) % period;
        const t = elapsed / period; // 0 to 1
        const { baseSpeed, baseWiggle, baseVisc, baseDrip } = readBaseParams();
        const wave = t * Math.PI * 2;
        // Respect sliders as the baseline; animate gently around them.
        const speed = clamp(baseSpeed + Math.sin(wave) * 0.10, 0, 2);
        const wiggle = clamp(baseWiggle + Math.cos(wave) * 0.10, 0, 1);
        const drip = clamp(baseDrip + Math.sin(wave) * 0.05, 0, 1);
        window.errlGLSetGoo({
          speed,
          wiggle,
          viscosity: baseVisc,
          drip
        });
        
        gradientRaf = requestAnimationFrame(animate);
      }
      gradientRaf = requestAnimationFrame(animate);
      updateGradientButton();
    }
    
    function stopGradientAnimation(){
      gradientAnimating = false;
      window.__errlNavGradientAnimating = false;
      if (gradientRaf) {
        cancelAnimationFrame(gradientRaf);
        gradientRaf = null;
      }
      // Immediately stop motion by forcing speed to 0 (keep other params).
      if (typeof window.errlGLSetGoo === 'function') {
        const w = $("navWiggle");
        const g = $("navGrip") || $("navVisc");
        const d = $("navDrip");
        const params = { speed: 0 };
        if (w) {
          const wig = parseFloat(w.value || '0');
          if (Number.isFinite(wig)) params.wiggle = wig;
        }
        if (g) {
          const vis = parseFloat(g.value || '0');
          if (Number.isFinite(vis)) params.viscosity = vis;
        }
        if (d) {
          const dr = (parseFloat(d.value || '0') + 1) / 2;
          if (Number.isFinite(dr)) params.drip = dr;
        }
        window.errlGLSetGoo(params);
      }
      updateGradientButton();
    }
    
    function updateGradientButton(){
      if (!gradientPlayPause) return;
      gradientPlayPause.style.display = gradientAnimating ? 'block' : 'none';
      if (gradientAnimating) {
        gradientPlayPause.textContent = 'Pause';
        gradientPlayPause.setAttribute('aria-pressed', 'true');
        gradientPlayPause.title = 'Pause gradient animation';
      } else {
        gradientPlayPause.textContent = 'Play';
        gradientPlayPause.setAttribute('aria-pressed', 'false');
        gradientPlayPause.title = 'Play gradient animation';
      }
    }
    
    if (slowGradientBtn) {
      on(slowGradientBtn, 'click', ()=>{
        if (!window.errlGLSetGoo) return;
        // Set a pleasant baseline and start animation (animation respects sliders).
        const f = $("navFlow"); if (f) f.value = 0.3;
        const w = $("navWiggle"); if (w) w.value = 0.2;
        const g = $("navGrip"); if (g) g.value = 0.7;
        // navDrip slider is -1..1 mapped to 0..1 drip; 0.1 => -0.8
        const d = $("navDrip"); if (d) d.value = -0.8;

        // Persist + update any derived handlers by dispatching input events,
        // consistent with other buttons (e.g. Randomize).
        const bump = (el) => {
          try { el && el.dispatchEvent(new Event('input', { bubbles: true })); } catch (_) {}
        };
        bump(f); bump(w); bump(g); bump(d);

        // Start animation
        startGradientAnimation();
      });
    }
    
    if (gradientPlayPause) {
      on(gradientPlayPause, 'click', ()=>{
        if (gradientAnimating) {
          stopGradientAnimation();
        } else {
          startGradientAnimation();
        }
      });
    }
  })();

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

  // Rising Bubbles (Three.js) controls
  (function risingBubblesControls(){
    function withRB(cb){
      const RB = window.errlRisingBubblesThree;
      if (RB && typeof RB.setSpeed === 'function') return cb(RB);
      setTimeout(()=> withRB(cb), 100);
    }

    // Basic controls
    const speed = $("rbSpeed");
    const density = $("rbDensity");
    const scale = $("rbScale");
    const alpha = $("rbAlpha");
    const wobble = $("rbWobble");
    const freq = $("rbFreq");
    const minSize = $("rbMin");
    const maxSize = $("rbMax");
    const sizeHz = $("rbSizeHz");
    const jumboPct = $("rbJumboPct");
    const jumboScale = $("rbJumboScale");
    const attract = $("rbAttract");
    const attractIntensity = $("rbAttractIntensity");
    const ripples = $("rbRipples");
    const rippleIntensity = $("rbRippleIntensity");

    function persistRB(){
      try{
        const obj = {
          speed: parseFloat(speed?.value || '1'),
          // Note: rbDensity is now bubble COUNT multiplier (see RB tab label).
          density: parseFloat(density?.value || '1'),
          scale: parseFloat(scale?.value || '1.0'),
          alpha: parseFloat(alpha?.value || '0.95'),
          wobble: parseFloat(wobble?.value || '1'),
          freq: parseFloat(freq?.value || '1'),
          min: parseInt(minSize?.value || '14'),
          max: parseInt(maxSize?.value || '36'),
          sizeHz: parseFloat(sizeHz?.value || '0'),
          jumboPct: parseFloat(jumboPct?.value || '0.1'),
          jumboScale: parseFloat(jumboScale?.value || '1.6'),
          attract: !!attract?.checked,
          attractIntensity: parseFloat(attractIntensity?.value || '1.0'),
          ripples: !!ripples?.checked,
          rippleIntensity: parseFloat(rippleIntensity?.value || '1.2')
        };
        updateBundle((b)=> { b.rb = obj; });
      }catch(e){}
    }

    if (speed) on(speed, 'input', ()=> { withRB(RB=> RB.setSpeed && RB.setSpeed(speed.value)); persistRB(); });
    // Repurposed: count multiplier.
    if (density) on(density, 'input', ()=> { withRB(RB=> RB.setDensity && RB.setDensity(density.value)); persistRB(); });
    if (scale) on(scale, 'input', ()=> { withRB(RB=> RB.setScale && RB.setScale(scale.value)); persistRB(); });
    if (alpha) on(alpha, 'input', ()=> { withRB(RB=> RB.setAlpha && RB.setAlpha(alpha.value)); persistRB(); });
    if (wobble) on(wobble, 'input', ()=> { withRB(RB=> RB.setWobble && RB.setWobble(wobble.value)); persistRB(); });
    if (freq) on(freq, 'input', ()=> { withRB(RB=> RB.setFreq && RB.setFreq(freq.value)); persistRB(); });
    if (minSize) on(minSize, 'input', ()=> { withRB(RB=> RB.setMinSize && RB.setMinSize(minSize.value)); persistRB(); });
    if (maxSize) on(maxSize, 'input', ()=> { withRB(RB=> RB.setMaxSize && RB.setMaxSize(maxSize.value)); persistRB(); });
    if (sizeHz) on(sizeHz, 'input', ()=> { withRB(RB=> RB.setSizeHz && RB.setSizeHz(sizeHz.value)); persistRB(); });
    if (jumboPct) on(jumboPct, 'input', ()=> { withRB(RB=> RB.setJumboPct && RB.setJumboPct(jumboPct.value)); persistRB(); });
    if (jumboScale) on(jumboScale, 'input', ()=> { withRB(RB=> RB.setJumboScale && RB.setJumboScale(jumboScale.value)); persistRB(); });
    if (attract) on(attract, 'change', ()=> { withRB(RB=> RB.setAttract && RB.setAttract(attract.checked)); persistRB(); });
    if (attractIntensity) on(attractIntensity, 'input', ()=> { withRB(RB=> RB.setAttractIntensity && RB.setAttractIntensity(attractIntensity.value)); persistRB(); });
    if (ripples) on(ripples, 'change', ()=> { withRB(RB=> RB.setRipples && RB.setRipples(ripples.checked)); persistRB(); });
    if (rippleIntensity) on(rippleIntensity, 'input', ()=> { withRB(RB=> RB.setRippleIntensity && RB.setRippleIntensity(rippleIntensity.value)); persistRB(); });

    // Apply initial values on load
    setTimeout(()=> {
      withRB(RB=> {
        if (speed && RB.setSpeed) RB.setSpeed(speed.value);
        if (density && RB.setDensity) RB.setDensity(density.value);
        if (scale && RB.setScale) RB.setScale(scale.value);
        if (alpha && RB.setAlpha) RB.setAlpha(alpha.value);
        if (wobble && RB.setWobble) RB.setWobble(wobble.value);
        if (freq && RB.setFreq) RB.setFreq(freq.value);
        if (minSize && RB.setMinSize) RB.setMinSize(minSize.value);
        if (maxSize && RB.setMaxSize) RB.setMaxSize(maxSize.value);
        if (sizeHz && RB.setSizeHz) RB.setSizeHz(sizeHz.value);
        if (jumboPct && RB.setJumboPct) RB.setJumboPct(jumboPct.value);
        if (jumboScale && RB.setJumboScale) RB.setJumboScale(jumboScale.value);
        if (attract && RB.setAttract) RB.setAttract(attract.checked);
        if (attractIntensity && RB.setAttractIntensity) RB.setAttractIntensity(attractIntensity.value);
        if (ripples && RB.setRipples) RB.setRipples(ripples.checked);
        if (rippleIntensity && RB.setRippleIntensity) RB.setRippleIntensity(rippleIntensity.value);
      });
    }, 500);

    // RB Advanced Animation controls
    const rbAdvModeLoop = $("rbAdvModeLoop");
    const rbAdvModePing = $("rbAdvModePing");
    const rbAdvAnimSpeed = $("rbAdvAnimSpeed");
    const rbAdvPlayPause = $("rbAdvPlayPause");
    let rbAnimating = false;
    let rbAnimMode = 'loop'; // 'loop' or 'ping'
    let rbAnimRaf = null;
    let rbAnimStartTime = 0;
    
    // Expose stop function for reset
    window.__errlStopRBAnimation = function() {
      stopRBAnimation();
    };

    function startRBAnimation(){
      if (rbAnimating) return;
      rbAnimating = true;
      rbAnimStartTime = Date.now();
      updateRBPlayPauseButton();
      animateRB();
    }

    function stopRBAnimation(){
      rbAnimating = false;
      if (rbAnimRaf) {
        cancelAnimationFrame(rbAnimRaf);
        rbAnimRaf = null;
      }
      updateRBPlayPauseButton();
    }

    function animateRB(){
      if (!rbAnimating) return;
      const speed = parseFloat(rbAdvAnimSpeed?.value || '0.1');
      const period = 10000 / speed; // Period in ms based on speed
      const elapsed = (Date.now() - rbAnimStartTime) % period;
      const t = elapsed / period; // 0 to 1
      
      let normalizedT = t;
      if (rbAnimMode === 'ping') {
        // Ping-pong: 0 -> 1 -> 0
        normalizedT = t < 0.5 ? t * 2 : 2 - (t * 2);
      }
      
      // Animate wobble and freq together
      const wobbleBase = parseFloat(wobble?.value || '1');
      const freqBase = parseFloat(freq?.value || '1');
      const wobbleRange = 0.5;
      const freqRange = 0.5;
      
      const animatedWobble = wobbleBase + (normalizedT - 0.5) * wobbleRange;
      const animatedFreq = freqBase + (normalizedT - 0.5) * freqRange;
      
      withRB(RB=> {
        RB.setWobble(Math.max(0, Math.min(2, animatedWobble)));
        RB.setFreq(Math.max(0, Math.min(2, animatedFreq)));
      });
      
      if (wobble) wobble.value = String(Math.max(0, Math.min(2, animatedWobble)).toFixed(2));
      if (freq) freq.value = String(Math.max(0, Math.min(2, animatedFreq)).toFixed(2));
      
      rbAnimRaf = requestAnimationFrame(animateRB);
    }

    function updateRBPlayPauseButton(){
      if (!rbAdvPlayPause) return;
      rbAdvPlayPause.textContent = rbAnimating ? 'Pause' : 'Play';
      rbAdvPlayPause.setAttribute('aria-pressed', rbAnimating ? 'true' : 'false');
      rbAdvPlayPause.title = rbAnimating ? 'Pause animation' : 'Play animation';
    }

    // Initialize loop mode as active by default
    if (rbAdvModeLoop) {
      rbAdvModeLoop.classList.add('active');
      on(rbAdvModeLoop, 'click', ()=>{
        rbAnimMode = 'loop';
        rbAdvModeLoop.classList.add('active');
        if (rbAdvModePing) rbAdvModePing.classList.remove('active');
      });
    }

    if (rbAdvModePing) {
      on(rbAdvModePing, 'click', ()=>{
        rbAnimMode = 'ping';
        rbAdvModePing.classList.add('active');
        if (rbAdvModeLoop) rbAdvModeLoop.classList.remove('active');
      });
    }

    if (rbAdvPlayPause) {
      updateRBPlayPauseButton(); // Initialize button state
      on(rbAdvPlayPause, 'click', ()=>{
        if (rbAnimating) {
          stopRBAnimation();
        } else {
          startRBAnimation();
        }
      });
    }
  })();

  function applyDefaultsFromBundleOrRepo(){
    // Try bundle first. If empty, try repo defaults JSON. If that fails, no-op.
    try{
      const bundle = getBundle();
      if (bundle && bundle.ui && Object.keys(bundle.ui).length) {
        applyUiSnapshot(bundle.ui);
        return;
      }
    }catch(_){}
    // If bundle had nothing, fall back to repo defaults (async) and apply.
    loadRepoDefaults().then((repo)=>{
      try{
        if (repo && repo.ui) applyUiSnapshot(repo.ui);
      }catch(_){}
    }).catch(()=>{});
  }

  // Apply persisted defaults on load (prefer unified bundle UI snapshot)
  (function loadPersisted(){
    settingsReady.then(()=>{
      applyDefaultsFromBundleOrRepo();
    }).catch(()=>{ applyDefaultsFromBundleOrRepo(); });
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

    on(target,'change', ()=> withHue(H=> { H.setTarget(target.value); H.applyLayerCSS(target.value); }));
    on(onEl,'change', ()=> withHue(H=> { 
      const layer = target?.value || H.currentTarget;
      H.setEnabled(!!onEl.checked, layer);
      H.applyLayerCSS(layer);
    }));
    on(h,'input', ()=> withHue(H=> { 
      const layer = target?.value || H.currentTarget;
      H.setHue(+h.value, layer);
      H.applyLayerCSS(layer);
    }));
    on(s,'input', ()=> withHue(H=> { 
      const layer = target?.value || H.currentTarget;
      H.setSaturation(+s.value, layer);
      H.applyLayerCSS(layer);
    }));
    on(i,'input', ()=> withHue(H=> { 
      const layer = target?.value || H.currentTarget;
      H.setIntensity(+i.value, layer);
      H.applyLayerCSS(layer);
    }));
    // Global timeline controls (fixed speed)
    on(timeline,'input', ()=> withHue(H=> { H.setTimeline(+timeline.value); H.applyAllCSS(); }));
    on(playBtn,'click', ()=> withHue(H=> { H.toggleTimeline(); syncPlayButton(H); H.applyAllCSS(); }));
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
    }
    
    [reduce,contrast,invert].forEach(el=> el && el.addEventListener('change', apply));
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
    const mult = Math.random();
    const wobble = Math.random();
    const speed = Math.random();
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
        bundle: {},
        timestamp: new Date().toISOString()
      };
      
      // Collect all settings
      try {
        const H = window.ErrlHueController;
        if (H && H.layers) {
          settings.hue = H.layers;
        } else {
          // Fallback: use unified bundle hue layers if controller isn't ready
          settings.hue = (getBundle().hue && getBundle().hue.layers) ? getBundle().hue.layers : {};
        }
      } catch(e) {}
      
      try {
        // Keep a raw bundle of the keys that map to "defaults" easiest.
        settings._storage = {
          errl_portal_settings_v1: localStorage.getItem(SETTINGS_KEY),
          errlCustomizedSvg: localStorage.getItem('errlCustomizedSvg')
        };
        settings.bundle = getBundle();
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

      // Also export a JSON bundle (easier to paste into defaults in code).
      try {
        const jblob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const jurl = URL.createObjectURL(jblob);
        const ja = document.createElement('a');
        ja.href = jurl;
        ja.download = `errl-portal-snapshot_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        document.body.appendChild(ja);
        ja.click();
        document.body.removeChild(ja);
        URL.revokeObjectURL(jurl);
      } catch(_) {}
    } catch(e) {
      console.warn('HTML snapshot failed', e);
      alert('Export failed. Please check console for details.');
    }
  });
  

  // Save/Reset defaults buttons and quick-save
  function saveDefaults(){
    try{
      const bundle = buildBundleFromCurrent();
      bundle.meta = bundle.meta || {};
      bundle.meta.savedAt = new Date().toISOString();
      setBundle(bundle);
      alert('Defaults saved.');
    }catch(e){ alert('Could not save defaults.'); }
  }
  async function resetDefaults(){
    try {
      // Stop all animations first
      // Stop RB advanced animation
      if (window.__errlStopRBAnimation) {
        window.__errlStopRBAnimation();
      }
      // Stop nav gradient animation
      if (window.__errlStopNavGradient) {
        window.__errlStopNavGradient();
      }
      // Stop Errl goo auto-fade
      if (window.__errlStopGooAuto) {
        window.__errlStopGooAuto();
      }
      // Stop hue timeline
      if (window.ErrlHueController && window.ErrlHueController.pauseTimeline) {
        window.ErrlHueController.pauseTimeline();
      }
      
      // Clear unified settings + any legacy keys (best-effort)
      ['errl_portal_settings_v1','errl_hue_layers','errl_gl_overlay','errl_gl_bubbles','errl_nav_goo_cfg','errl_rb_settings','errl_goo_cfg','errl_a11y','errl_ui_defaults'].forEach(k=>{
        try{ localStorage.removeItem(k); }catch(e){}
      });
      
      // Reset hue controller
      if (window.ErrlHueController) {
        window.ErrlHueController.reset();
      }
      
      // Reset UI to repo defaults (JSON) when available; fall back to baked defaults
      let defaults = null;
      try{
        const repo = await loadRepoDefaults();
        defaults = repo && repo.ui ? repo.ui : null;
      }catch(_){}
      if (!defaults){
        defaults = {
          // RB defaults
          rbSpeed: '1.03', rbDensity: '1.46', rbScale: '1', rbAlpha: '0.87', rbWobble: '0.98', rbFreq: '0.95',
          rbMin: '14', rbMax: '36', rbSizeHz: '0.67', rbJumboPct: '0.33', rbJumboScale: '1.95',
          rbAttract: false, rbAttractIntensity: '0.4',
          rbRipples: false, rbRippleIntensity: '0.8',
          rbAdvAnimSpeed: '0.10',
          // Goo defaults
          classicGooEnabled: true, classicGooStrength: '0.187', classicGooWobble: '0.432', classicGooSpeed: '0.201',
          classicGooStrengthAuto: true, classicGooWobbleAuto: true, classicGooSpeedAuto: true,
          classicGooAutoSpeed: '0.16', classicGooMouseReact: true,
          // Nav defaults
          navOrbitSpeed: '1', navRadius: '1.26', navOrbSize: '1.22',
          navWiggle: '0.57', navFlow: '1.07', navGrip: '0.35', navDrip: '-0.02', navVisc: '0.26',
          glOrbsToggle: true,
          // GLB defaults
          bgSpeed: '0.9', bgDensity: '1.2', glAlpha: '0.85',
          // BG defaults
          shimmerToggle: false, vignetteToggle: false,
          glOverlayAlpha: '0.28', glOverlayDX: '24', glOverlayDY: '18',
          // Errl defaults
          errlSize: '1', errlOutlineThickness: '2.5',
          // Hue defaults
          hueEnabled: false, hueShift: '158', hueSat: '0.9', hueInt: '1', hueTimeline: '0',
          // Audio defaults
          audioEnabled: true, audioMaster: '0.4', audioBass: '0.2',
          // A11y defaults
          prefReduce: false, prefContrast: false, prefInvert: false
        };
      }
      
      // Apply defaults
      Object.keys(defaults).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const value = defaults[id];
        if (el.type === 'checkbox') {
          el.checked = !!value;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          el.value = String(value);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      
      // Update play/pause button states and UI after reset
      setTimeout(() => {
        // Update hue play/pause button
        if (window.ErrlHueController && window.ErrlHueController.master) {
          const huePlayPause = document.getElementById('huePlayPause');
          if (huePlayPause) {
            huePlayPause.textContent = 'Play';
            huePlayPause.setAttribute('aria-pressed', 'false');
          }
        }
        // Reset RB animation mode buttons
        const rbAdvModeLoop = document.getElementById('rbAdvModeLoop');
        const rbAdvModePing = document.getElementById('rbAdvModePing');
        if (rbAdvModeLoop) rbAdvModeLoop.classList.add('active');
        if (rbAdvModePing) rbAdvModePing.classList.remove('active');
        // RB, Nav, and Errl play/pause buttons will update via their own update functions
      }, 100);

      // Persist bundle so Reset behaves like a clean baseline.
      try{
        const ui = (defaults && typeof defaults === 'object') ? defaults : {};
        setBundle({ version: 1, ui, hue: { layers: {} } });
      }catch(_){}
      
      alert('Defaults reset. All settings restored to stock values.');
    } catch(e) {
      console.error('Reset failed:', e);
      alert('Reset failed. Please reload the page.');
    }
  }
  const saveBtn=document.getElementById('saveDefaultsBtn'); if (saveBtn) saveBtn.addEventListener('click', saveDefaults);
  const rstBtn=document.getElementById('resetDefaultsBtn'); if (rstBtn) rstBtn.addEventListener('click', ()=>{ resetDefaults(); });
  const exportBtn = document.getElementById('exportSettingsBtn');
  const importBtn = document.getElementById('importSettingsBtn');
  const importFile = document.getElementById('importSettingsFile');

  function buildBundleFromCurrent(){
    const existing = getBundle();
    const ui = snapshotUiControls();
    const H = window.ErrlHueController;
    const hueLayers = (H && H.layers) ? H.layers : (existing.hue && existing.hue.layers ? existing.hue.layers : {});
    existing.version = 1;
    existing.ui = ui;
    existing.hue = existing.hue || {};
    existing.hue.layers = hueLayers || {};
    // Keep best-effort semantic copies for export/import readability.
    existing.gl = existing.gl || {};
    existing.gl.bubbles = existing.gl.bubbles || {};
    existing.rb = existing.rb || {};
    existing.goo = existing.goo || {};
    existing.nav = existing.nav || {};
    existing.nav.goo = existing.nav.goo || {};
    return existing;
  }

  function applyBundle(bundle){
    if (!bundle || typeof bundle !== 'object') return;
    // Persist unified bundle
    setBundle(bundle);
    // Apply UI immediately
    if (bundle.ui) applyUiSnapshot(bundle.ui);
    // Re-apply derived effects from current inputs
    const kick = (id) => { const el = document.getElementById(id); if (el) el.dispatchEvent(new Event('input')); };
    kick('bgSpeed'); kick('bgDensity'); kick('glAlpha');
    kick('navOrbitSpeed');
    kick('errlSize');
  }

  function exportSettings(){
    try{
      const bundle = buildBundleFromCurrent();
      const payload = {
        ...bundle,
        meta: {
          exportedAt: new Date().toISOString()
        }
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `errl-portal-settings_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }catch(e){
      console.warn('Export settings failed', e);
      alert('Export failed. Please check console for details.');
    }
  }

  function requestImport(){
    if (importFile) importFile.click();
  }

  async function handleImportFile(){
    if (!importFile || !importFile.files || !importFile.files[0]) return;
    const file = importFile.files[0];
    try{
      const text = await file.text();
      const obj = JSON.parse(text);
      if (!obj || typeof obj !== 'object') throw new Error('Invalid JSON');
      const v = (typeof obj.version === 'number') ? obj.version : 1;
      if (v !== 1) throw new Error('Unsupported settings version: ' + v);
      const bundle = {
        version: 1,
        ui: (obj.ui && typeof obj.ui === 'object') ? obj.ui : {},
        hue: (obj.hue && typeof obj.hue === 'object') ? obj.hue : { layers: {} },
        gl: (obj.gl && typeof obj.gl === 'object') ? obj.gl : { overlay: {}, bubbles: {} },
        nav: (obj.nav && typeof obj.nav === 'object') ? obj.nav : { goo: {} },
        rb: (obj.rb && typeof obj.rb === 'object') ? obj.rb : {},
        goo: (obj.goo && typeof obj.goo === 'object') ? obj.goo : {}
      };
      applyBundle(bundle);
      alert('Settings imported.');
    }catch(e){
      console.warn('Import settings failed', e);
      alert('Import failed: ' + (e.message || 'Unknown error'));
    } finally {
      try { importFile.value = ''; } catch(_) {}
    }
  }

  if (exportBtn) exportBtn.addEventListener('click', exportSettings);
  if (importBtn) importBtn.addEventListener('click', requestImport);
  if (importFile) importFile.addEventListener('change', handleImportFile);

  // Keep the unified bundle "fresh" as you tweak sliders (no need to click Save Defaults).
  (function autoSyncBundle(){
    const panel = document.getElementById('errlPanel');
    if (!panel) return;
    let t = null;
    function schedule(){
      if (t) clearTimeout(t);
      t = setTimeout(()=>{
        try{
          const existing = getBundle();
          existing.ui = snapshotUiControls();
          // Keep hue layers updated when available (best-effort)
          try{
            const H = window.ErrlHueController;
            if (H && H.layers){
              existing.hue = existing.hue || {};
              existing.hue.layers = H.layers;
            }
          }catch(_){}
          setBundle(existing);
        }catch(_){}
      }, 250);
    }
    panel.addEventListener('input', schedule, true);
    panel.addEventListener('change', schedule, true);
  })();

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
    const closeBtn = document.getElementById('phone-close-button');
    const expandBtn = document.getElementById('phone-expand-button');
    const vibeBar = document.getElementById('phone-vibe-bar');
    const sections = Array.from(panel.querySelectorAll('.panel-section'));
    const toTop = document.getElementById('panelScrollTop');

    const EXPANDED_KEY = 'errl_phone_expanded_v1';
    const POS_KEY = 'errl_phone_expanded_pos_v1';
    let expanded = false;
    let dragging = false;
    let dragPid = null;
    let dragSX = 0, dragSY = 0, startLeft = 0, startTop = 0;

    function lockPanelToCorner() {
      panel.style.left = 'auto';
      panel.style.top = 'auto';
      panel.style.right = '10px';
      panel.style.bottom = '10px';
    }

    function enforcePanelInViewport(margin){
      const m = (typeof margin === 'number') ? margin : 10;
      const vw = window.innerWidth || document.documentElement.clientWidth || 1200;
      const vh = window.innerHeight || document.documentElement.clientHeight || 800;
      const r = panel.getBoundingClientRect();
      if (!r || !Number.isFinite(r.width) || !Number.isFinite(r.height)) return;
      const left = Math.max(m, Math.min(r.left, vw - r.width - m));
      const top = Math.max(m, Math.min(r.top, vh - r.height - m));
      panel.style.left = Math.round(left) + 'px';
      panel.style.top = Math.round(top) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    function undockFromCorner(){
      // Convert current corner-locked position into explicit left/top so dragging works.
      const r = panel.getBoundingClientRect();
      panel.style.left = Math.round(r.left) + 'px';
      panel.style.top = Math.round(r.top) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
    }

    function applyExpandedState(){
      panel.classList.toggle('expanded', expanded);
      if (expandBtn) {
        expandBtn.textContent = expanded ? '⤡' : '⤢';
        expandBtn.title = expanded ? 'Collapse to corner' : 'Expand (desktop drag)';
      }
      if (!expanded) {
        // Back to docked behavior.
        try { localStorage.setItem(EXPANDED_KEY, '0'); } catch(_) {}
        lockPanelToCorner();
        return;
      }
      try { localStorage.setItem(EXPANDED_KEY, '1'); } catch(_) {}
      undockFromCorner();
      // Restore last position if present.
      try {
        const raw = localStorage.getItem(POS_KEY);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && Number.isFinite(p.left) && Number.isFinite(p.top)) {
            panel.style.left = Math.round(p.left) + 'px';
            panel.style.top = Math.round(p.top) + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
          }
        }
      } catch(_) {}
      enforcePanelInViewport(10);
    }

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

    // Helper function to minimize the panel
    function minimizePanel() {
      panel.classList.add('minimized');
      clearMinimizedInlineStyles();
      lockPanelToCorner();
      try { localStorage.setItem('errl_phone_min', '1'); } catch(_) {}
    }

    // Helper function to restore the panel
    function restorePanel() {
      panel.classList.remove('minimized');
      clearMinimizedInlineStyles();
      if (!expanded) lockPanelToCorner();
      // Show content again (CSS handles layout)
      const headerEl = panel.querySelector('.panel-header');
      const tabsEl = panel.querySelector('.panel-tabs');
      if (headerEl) headerEl.style.display = '';
      if (tabsEl) tabsEl.style.display = '';
      // Activate default tab to show content immediately (this will handle section visibility)
      // Use setTimeout to ensure CSS has updated after removing minimized class
      setTimeout(() => {
        activateTab('hud');
      }, 0);
      try { localStorage.setItem('errl_phone_min', '0'); } catch(_) {}
    }

    // minimize toggle - minimize to bottom right corner
    if (minBtn){
      minBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        if (panel.classList.contains('minimized')) {
          restorePanel();
        } else {
          minimizePanel();
        }
      });
    }

    // close button - toggle minimize/restore
    if (closeBtn){
      closeBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        e.preventDefault();
        if (panel.classList.contains('minimized')) {
          restorePanel();
        } else {
          minimizePanel();
        }
      });
    }

    // expand button - toggle expanded mode (desktop-focused)
    if (expandBtn){
      expandBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        e.preventDefault();
        if (panel.classList.contains('minimized')) restorePanel();
        expanded = !expanded;
        applyExpandedState();
      });
    }
    // restore from minimized when clicking the bubble
    panel.addEventListener('click', (e)=>{
      if (panel.classList.contains('minimized')) {
        // Only expand if clicking the panel itself (not child elements)
        if (e.target === panel || e.target.classList.contains('errl-panel') || e.target.id === 'phone-vibe-bar') {
          restorePanel();
        }
      }
    });

    // Keep the main phone panel locked to the corner.
    // Load persisted expanded state (best-effort)
    try { expanded = localStorage.getItem(EXPANDED_KEY) === '1'; } catch(_) { expanded = false; }
    applyExpandedState();
    if (!expanded) lockPanelToCorner();
    window.addEventListener('resize', ()=>{
      if (expanded) enforcePanelInViewport(10);
      else lockPanelToCorner();
    });

    // Drag handle (desktop): vibe bar
    function isDesktopPointer(e){
      return e && (e.pointerType === 'mouse');
    }
    function onDown(e){
      if (!expanded) return;
      if (panel.classList.contains('minimized')) return;
      if (!isDesktopPointer(e)) return;
      dragging = true;
      dragPid = e.pointerId;
      const r = panel.getBoundingClientRect();
      dragSX = e.clientX;
      dragSY = e.clientY;
      startLeft = r.left;
      startTop = r.top;
      undockFromCorner();
      try { vibeBar && vibeBar.setPointerCapture && vibeBar.setPointerCapture(e.pointerId); } catch(_) {}
      panel.classList.add('dragging');
    }
    function onMove(e){
      if (!dragging) return;
      if (e.pointerId !== dragPid) return;
      const dx = e.clientX - dragSX;
      const dy = e.clientY - dragSY;
      panel.style.left = Math.round(startLeft + dx) + 'px';
      panel.style.top = Math.round(startTop + dy) + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = 'auto';
      enforcePanelInViewport(10);
    }
    function onUp(e){
      if (!dragging) return;
      if (e.pointerId !== dragPid) return;
      dragging = false;
      panel.classList.remove('dragging');
      try { vibeBar && vibeBar.releasePointerCapture && vibeBar.releasePointerCapture(e.pointerId); } catch(_) {}
      // Persist expanded position
      try {
        const r = panel.getBoundingClientRect();
        localStorage.setItem(POS_KEY, JSON.stringify({ left: r.left, top: r.top }));
      } catch(_) {}
    }
    if (vibeBar){
      vibeBar.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
    }

    // scroll-to-top button - use content wrapper for scrolling
    const contentWrapper = panel.querySelector('.panel-content-wrapper');
    if (contentWrapper) {
      contentWrapper.addEventListener('scroll', ()=>{
        if (!toTop) return;
        toTop.style.display = contentWrapper.scrollTop > 40 ? 'block' : 'none';
      });
      if (toTop){
        toTop.addEventListener('click', (e)=>{ 
          e.stopPropagation(); 
          contentWrapper.scrollTo({ top: 0, behavior: 'smooth' }); 
        });
      }
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
    import('@shared/devpanel/runtime.ts')
      .then((mod) => mod.mountDevPanel())
      .catch((err) => console.warn('[devpanel] failed to mount', err));
  })();
})();