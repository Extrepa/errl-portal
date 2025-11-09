/**
 * Hue Effects Controller
 * Manages hue rotation across WebGL and CSS elements
 */
(function() {
  // Known layers and selectors
  const LAYERS = {
    background: { label: 'Background (L0)', selectors: ['.l0'] },
    motes:      { label: 'Motes (L2)', selectors: ['.l2 .mote', '#motesLayer .mote', '.mote'] },
    drip:       { label: 'Drip Frame (L3)', selectors: ['.l3 .drip'] },
    // Updated selectors to match current portal DOM
    errl:       { label: 'Errl (L4)', selectors: ['#errlCenter', '.errl-wrapper .errl-svg', '#errl-inline', '#errl-img'] },
    nav:        { label: 'Nav Bubbles (L5)', selectors: ['#navOrbit .bubble', '#navOrbit .menuOrb', '.bubble', '.menuOrb'] },
    awakening:  { label: 'Awakening (L6)', selectors: ['.l6 .portal-drip', '.l6 .sigil'] },
    hud:        { label: 'HUD', selectors: ['#hud', '#hud .bubble', '#hud .chip'] },
    backGlow:   { label: 'Back Glow', selectors: ['#errlGoo', '.errl-goo', '#halo'] },
    glOverlay:  { label: 'GL Overlay', type: 'webglOverlay' },
    bgBubbles:  { label: 'GL Background Bubbles', type: 'webglBubbles' },
    riseBubbles:{ label: 'Rising Bubbles (Canvas)', selectors: ['#riseBubbles'] },
  };

  const DEFAULT_LAYER_STATE = { hue: 0, saturation: 1.0, intensity: 1.0, enabled: true };

  const HueController = {
    // Per-layer settings
    layers: Object.keys(LAYERS).reduce((acc,k)=>{ acc[k] = { ...DEFAULT_LAYER_STATE }; return acc; }, {}),
    currentTarget: 'nav',

    // Global toggles
    cssEnabled: true,
    webglEnabled: true,

    // Registered WebGL refs
    webglRefs: {
      bgBubbles: null,
      glOverlay: null,
    },

    // WebGL filters per layer
    webglFilters: {
      bgBubbles: null,
      glOverlay: null,
    },

    // Animation state (applies to current target)
    animation: {
      active: false,
      startTime: 0,
      speed: 1.0,
      layer: 'nav',
    },

    init() {
      this.loadSettings();
      this.ensureClasses();
      // Apply all layers once
      this.applyAllCSS();
      this.triggerUpdate(this.currentTarget);
      return this;
    },

    getLayers(){ return Object.keys(LAYERS).map(k=>({ key:k, label:LAYERS[k].label })); },

    setTarget(layer){ if(LAYERS[layer]) this.currentTarget = layer; },

    // Register WebGL instances for targeted control
    registerWebGLLayer(layerKey, ref){ if(!(layerKey in this.webglRefs)) return; this.webglRefs[layerKey] = ref; this.applyWebGLLayer(layerKey); },

    // CSS helpers
    ensureClasses(){
      // Tag elements so we can safely override their filter without clobbering other styles
      const addClass = (sel)=>{ document.querySelectorAll(sel).forEach(el=>{ el.classList.add('hue-controlled'); }); };
      for(const k of Object.keys(LAYERS)){
        if(LAYERS[k].selectors){ for(const s of LAYERS[k].selectors){ addClass(s); } }
      }
    },

    layerFilterString(state){
      const deg = ((state.hue%360)+360)%360;
      const sat = Math.max(0, state.saturation);
      // Intensity used to blend; for CSS, approximate by mixing towards original via opacity using backdrop is not feasible; use intensity as overall multiplier by adding brightness/contrast subtly
      const mixBoost = 0.05 + 0.25*state.intensity; // subtle lift
      return `hue-rotate(${deg}deg) saturate(${(sat*100).toFixed(0)}%) brightness(${(100+mixBoost*10).toFixed(0)}%)`;
    },

    applyLayerCSS(layer){
      if(!this.cssEnabled) return;
      const def = LAYERS[layer]; if(!def || !def.selectors) return;
      const st = this.layers[layer];
      for(const sel of def.selectors){
        document.querySelectorAll(sel).forEach(el=>{
          let f = st.enabled ? this.layerFilterString(st) : '';
          // Preserve Errl's goo filter if present via class
          if((layer==='errl') && el.classList && el.classList.contains('goo')){
            f = f ? `url(#errl-goo) ${f}` : 'url(#errl-goo)';
          }
          el.style.filter = f;
        });
      }
    },

    applyAllCSS(){ for(const k of Object.keys(LAYERS)){ this.applyLayerCSS(k); } },

    // WebGL application for specific layers
    applyWebGLLayer(layer){
      if(!this.webglEnabled || !window.ErrlHueFilter) return;
      const st = this.layers[layer];
      if(layer==='bgBubbles'){
        const refs = this.webglRefs.bgBubbles;
        const list = Array.isArray(refs) ? refs : (refs? [refs] : []);
        if(!this.webglFilters.bgBubbles) this.webglFilters.bgBubbles = new window.ErrlHueFilter();
        const F = this.webglFilters.bgBubbles; F.hue = st.hue; F.saturation = st.saturation; F.intensity = st.intensity;
        const applyTo = (ref)=>{
          if(!ref) return;
          const applyOnce = (inst)=>{
            const target = inst.root || inst; // apply at container level so it survives rebuilds
            if(!target) return;
            const arr = (target.filters||[]).filter(f=>!(f instanceof window.ErrlHueFilter));
            if(st.enabled) arr.push(F);
            target.filters = arr;
          };
          if(typeof ref.then==='function'){ ref.then(applyOnce).catch(()=>{}); }
          else applyOnce(ref);
        };
        list.forEach(applyTo);
      } else if(layer==='glOverlay'){
        const spr = this.webglRefs.glOverlay;
        if(spr){ if(!this.webglFilters.glOverlay) this.webglFilters.glOverlay = new window.ErrlHueFilter(); const F = this.webglFilters.glOverlay; F.hue = st.hue; F.saturation = st.saturation; F.intensity = st.intensity; spr.filters = (spr.filters||[]).filter(f=>!(f instanceof window.ErrlHueFilter)); if(st.enabled){ spr.filters.push(F); } }
      }
    },

    // Public setters (operate on specific layer or current target)
    setHue(hue, layer=this.currentTarget){ this.layers[layer].hue = ((hue%360)+360)%360; this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },
    setSaturation(sat, layer=this.currentTarget){ this.layers[layer].saturation = Math.max(0, Math.min(2, sat)); this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },
    setIntensity(inten, layer=this.currentTarget){ this.layers[layer].intensity = Math.max(0, Math.min(1, inten)); this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },
    setEnabled(on, layer=this.currentTarget){ this.layers[layer].enabled = !!on; this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },

    // Temporary (non-persistent) setters for in-page phone UI
    setHueTemp(hue, layer=this.currentTarget){ this.layers[layer].hue = ((hue%360)+360)%360; this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },
    setSaturationTemp(sat, layer=this.currentTarget){ this.layers[layer].saturation = Math.max(0, Math.min(2, sat)); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },
    setIntensityTemp(inten, layer=this.currentTarget){ this.layers[layer].intensity = Math.max(0, Math.min(1, inten)); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },
    setEnabledTemp(on, layer=this.currentTarget){ this.layers[layer].enabled = !!on; this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },

    // Themes per-layer
    applyTheme(layer, theme){ const themes={ normal:{hue:0,saturation:1.0,intensity:1.0}, warm:{hue:30,saturation:1.1,intensity:1.0}, cool:{hue:180,saturation:1.05,intensity:1.0}, electric:{hue:270,saturation:1.3,intensity:1.0}, sunset:{hue:15,saturation:1.25,intensity:1.0}, ocean:{hue:200,saturation:1.15,intensity:1.0}, forest:{hue:120,saturation:1.1,intensity:1.0} }; const cfg=themes[theme]; if(!cfg) return; Object.assign(this.layers[layer], cfg); this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },
    applyThemeTemp(layer, theme){ const themes={ normal:{hue:0,saturation:1.0,intensity:1.0}, warm:{hue:30,saturation:1.1,intensity:1.0}, cool:{hue:180,saturation:1.05,intensity:1.0}, electric:{hue:270,saturation:1.3,intensity:1.0}, sunset:{hue:15,saturation:1.25,intensity:1.0}, ocean:{hue:200,saturation:1.15,intensity:1.0}, forest:{hue:120,saturation:1.1,intensity:1.0} }; const cfg=themes[theme]; if(!cfg) return; Object.assign(this.layers[layer], cfg); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); },

    // Animation controls (per-layer)
    toggleAnimation(speed=1, layer=this.currentTarget){ if(this.animation.active){ this.stopAnimation(); } else { this.startAnimation(speed, layer); } },
    startAnimation(speed=1, layer=this.currentTarget){ this.animation.active=true; this.animation.startTime=Date.now(); this.animation.speed=speed; this.animation.layer=layer; this.animationLoop(); },
    stopAnimation(){ this.animation.active=false; },
    animationLoop(){ if(!this.animation.active) return; const elapsed=Date.now()-this.animation.startTime; const cycle=15000/this.animation.speed; const p=(elapsed%cycle)/cycle; const h=p*360; const L=this.animation.layer; this.layers[L].hue=h; this.applyLayerCSS(L); this.applyWebGLLayer(L); this.triggerUpdate(L); requestAnimationFrame(()=>this.animationLoop()); },

    // Events
    triggerUpdate(layer){ const event = new CustomEvent('hueUpdate', { detail: { layer, state: { ...this.layers[layer] } } }); document.dispatchEvent(event); },

    // Persistence
    persist(){ try{ localStorage.setItem('errl_hue_layers', JSON.stringify(this.layers)); }catch(e){ console.warn('Hue persist failed', e); } },
    loadSettings(){ try{ const raw=localStorage.getItem('errl_hue_layers'); if(raw){ const obj=JSON.parse(raw); for(const k of Object.keys(this.layers)){ if(obj[k]) this.layers[k]=Object.assign({}, DEFAULT_LAYER_STATE, obj[k]); } } }catch(e){ }
    },

    // Reset
    reset(layer=null){ if(layer && this.layers[layer]){ this.layers[layer] = { ...DEFAULT_LAYER_STATE }; this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer); return; } for(const k of Object.keys(this.layers)){ this.layers[k] = { ...DEFAULT_LAYER_STATE }; this.applyLayerCSS(k); this.applyWebGLLayer(k); } this.persist(); this.triggerUpdate(this.currentTarget); },
  };

  // Export
  window.ErrlHueController = HueController;

  // Auto-init
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', () => HueController.init()); } else { HueController.init(); }

})();
