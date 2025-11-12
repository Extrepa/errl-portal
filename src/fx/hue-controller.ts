(() => {
  // Known layers and selectors
const LAYERS: Record<string, { label: string; selectors?: string[]; type?: string }> = {
    background: { label: 'Background', selectors: ['.errl-bg .base', '.errl-bg .shimmer', '.vignette-frame'] },
    riseBubbles: { label: 'Rising Bubbles', selectors: ['#riseBubbles'] },
    nav: { label: 'Navigation', selectors: ['.nav-orbit .bubble'] },
    glOverlay: { label: 'GL Overlay', type: 'webglOverlay' },
    bgBubbles: { label: 'GL Background Bubbles', type: 'webglBubbles' },
  };

const DEFAULT_LAYER_STATE = { hue: 0, saturation: 1.0, intensity: 1.0, enabled: false };

  const HueController: any = {
    layers: Object.keys(LAYERS).reduce((acc: any, k) => {
      acc[k] = { ...DEFAULT_LAYER_STATE };
      return acc;
    }, {} as any),
    currentTarget: 'nav',

    cssEnabled: true,
    webglEnabled: true,

    webglRefs: {
      bgBubbles: null,
      glOverlay: null,
    } as any,

    webglFilters: {
      bgBubbles: null,
      glOverlay: null,
    } as any,

    // Global master timeline (fixed speed)
    master: {
      playing: false,
      anchorTime: 0,
      baseHue: 0, // 0..360 starting hue when (re)anchored
      periodMs: 45000, // one full cycle every 45s
      raf: 0,
    },

    // Legacy per-layer animation (kept for compatibility)
    animation: {
      active: false,
      startTime: 0,
      speed: 1.0,
      layer: 'nav',
      mode: 'loop' as 'loop' | 'ping',
    },

    init() {
      this.loadSettings();
      this.ensureClasses();
      this.applyAllCSS();
      this.clearErrlFilters();
      // start master timeline
      this.master.anchorTime = Date.now();
      this.pauseTimeline();
      this.tickMaster();
      this.triggerUpdate(this.currentTarget);
      return this;
    },

    getLayers() {
      return Object.keys(LAYERS).map((k) => ({ key: k, label: (LAYERS as any)[k].label }));
    },

    setTarget(layer: string) {
      if ((LAYERS as any)[layer]) this.currentTarget = layer;
    },

    registerWebGLLayer(layerKey: 'bgBubbles' | 'glOverlay', ref: any) {
      if (!(layerKey in this.webglRefs)) return;
      this.webglRefs[layerKey] = ref;
      this.applyWebGLLayer(layerKey);
    },

    ensureClasses() {
      const addClass = (sel: string) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).classList.add('hue-controlled');
        });
      };
      for (const k of Object.keys(LAYERS)) {
        if ((LAYERS as any)[k].selectors) {
          for (const s of (LAYERS as any)[k].selectors as string[]) addClass(s);
        }
      }
    },

    layerFilterString(state: any) {
      const deg = ((state.hue % 360) + 360) % 360;
      const sat = Math.max(0, state.saturation);
      const mixBoost = 0.05 + 0.25 * state.intensity;
      return `hue-rotate(${deg}deg) saturate(${(sat * 100).toFixed(0)}%) brightness(${(100 + mixBoost * 10).toFixed(0)}%)`;
    },

    applyLayerCSS(layer: string) {
      if (!this.cssEnabled) return;
      const def = (LAYERS as any)[layer];
      if (!def || !def.selectors) return;
      const st = this.layers[layer];
      for (const sel of def.selectors as string[]) {
        document.querySelectorAll(sel).forEach((el) => {
          const f = st.enabled ? this.layerFilterString(st) : '';
          (el as HTMLElement).style.filter = f;
        });
      }
    },

    applyAllCSS() {
      for (const k of Object.keys(LAYERS)) this.applyLayerCSS(k);
    },

    clearErrlFilters() {
      const selectors = ['#errlCenter', '#errlInlineSVG', '.errl-svg'];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.removeProperty('filter');
          (el as HTMLElement).style.removeProperty('webkitFilter');
        });
      });
    },

    // Global master timeline: fixed-speed hue sweep
    tickMaster() {
      cancelAnimationFrame(this.master.raf);
      const step = () => {
        if (this.master.playing) {
          const now = Date.now();
          const t = (now - this.master.anchorTime) / this.master.periodMs; // cycles
          const h = (this.master.baseHue + (t * 360)) % 360;
          // apply same hue to all layers (respect enabled/intensity per layer)
          for (const k of Object.keys(this.layers)) {
            this.layers[k].hue = h;
            this.applyLayerCSS(k);
            this.applyWebGLLayer(k as any);
          }
        }
        this.master.raf = requestAnimationFrame(step);
      };
      this.master.raf = requestAnimationFrame(step);
    },

    setTimeline(hue: number) {
      // scrub global hue without changing speed
      const clamped = (((hue % 360) + 360) % 360);
      this.master.baseHue = clamped;
      this.master.anchorTime = Date.now();
      // apply immediately
      for (const k of Object.keys(this.layers)) {
        this.layers[k].hue = clamped;
        this.applyLayerCSS(k);
        this.applyWebGLLayer(k as any);
      }
      this.persist();
    },
    playTimeline() { if (!this.master.playing) { this.master.playing = true; this.master.anchorTime = Date.now(); } },
    pauseTimeline() { this.master.playing = false; },
    toggleTimeline() { this.master.playing ? this.pauseTimeline() : this.playTimeline(); },

    applyWebGLLayer(layer: 'bgBubbles' | 'glOverlay') {
      if (!this.webglEnabled || !(window as any).ErrlHueFilter) return;
      const st = this.layers[layer];
      if (layer === 'bgBubbles') {
        const fx = this.webglRefs.bgBubbles;
        const ensureFilter = () => {
          if (!this.webglFilters.bgBubbles) this.webglFilters.bgBubbles = new (window as any).ErrlHueFilter();
          const F = this.webglFilters.bgBubbles; F.hue = st.hue; F.saturation = st.saturation; F.intensity = st.intensity; return F;
        };
        const applyToSprites = (sprites: any[]) => {
          const F = ensureFilter();
          sprites.forEach((s: any) => {
            if (!s) return;
            s.filters = (s.filters || []).filter((f: any) => !(f instanceof (window as any).ErrlHueFilter));
            if (st.enabled) s.filters.push(F);
          });
        };
        if (Array.isArray(fx)) {
          fx.forEach((layer: any) => { if (layer && Array.isArray(layer.sprites)) applyToSprites(layer.sprites); });
        } else if (fx && Array.isArray(fx.sprites)) {
          applyToSprites(fx.sprites);
        }
      } else if (layer === 'glOverlay') {
        const spr = this.webglRefs.glOverlay;
        if (spr) {
          if (!this.webglFilters.glOverlay) this.webglFilters.glOverlay = new (window as any).ErrlHueFilter();
          const F = this.webglFilters.glOverlay;
          F.hue = st.hue; F.saturation = st.saturation; F.intensity = st.intensity;
          spr.filters = (spr.filters || []).filter((f: any) => !(f instanceof (window as any).ErrlHueFilter));
          if (st.enabled) spr.filters.push(F);
        }
      }
    },

    setHue(hue: number, layer: string = this.currentTarget) {
      this.layers[layer].hue = (((hue % 360) + 360) % 360);
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },
    setSaturation(sat: number, layer: string = this.currentTarget) {
      this.layers[layer].saturation = Math.max(0, Math.min(2, sat));
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },
    setIntensity(inten: number, layer: string = this.currentTarget) {
      this.layers[layer].intensity = Math.max(0, Math.min(1, inten));
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },
    setEnabled(on: boolean, layer: string = this.currentTarget) {
      this.layers[layer].enabled = !!on;
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },

    applyTheme(layer: string, theme: string) {
      const themes: Record<string, any> = {
        normal: { hue: 0, saturation: 1.0, intensity: 1.0 },
        warm: { hue: 30, saturation: 1.1, intensity: 1.0 },
        cool: { hue: 180, saturation: 1.05, intensity: 1.0 },
        electric: { hue: 270, saturation: 1.3, intensity: 1.0 },
        sunset: { hue: 15, saturation: 1.25, intensity: 1.0 },
        ocean: { hue: 200, saturation: 1.15, intensity: 1.0 },
        forest: { hue: 120, saturation: 1.1, intensity: 1.0 },
      };
      const cfg = themes[theme];
      if (!cfg) return;
      Object.assign(this.layers[layer], cfg);
      this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
    },

    toggleAnimation(speed = 1, layer: string = this.currentTarget) {
      if (this.animation.active) this.stopAnimation(); else this.startAnimation(speed, layer);
    },
    startAnimation(speed = 1, layer: string = this.currentTarget, mode: 'loop'|'ping' = 'loop') {
      this.animation.active = true; this.animation.startTime = Date.now(); this.animation.speed = speed; this.animation.layer = layer; this.animation.mode = mode; this.animationLoop();
    },
    stopAnimation() { this.animation.active = false; },
    animationLoop() {
      if (!this.animation.active) return;
      const elapsed = Date.now() - this.animation.startTime;
      const cycle = 15000 / this.animation.speed;
      const base = (elapsed % cycle) / cycle;
      const p = (this.animation.mode === 'ping') ? Math.abs(base*2 - 1) : base; // 0..1
      const h = p * 360;
      const L = this.animation.layer;
      this.layers[L].hue = h;
      this.applyLayerCSS(L); this.applyWebGLLayer(L); this.triggerUpdate(L);
      requestAnimationFrame(() => this.animationLoop());
    },

    triggerUpdate(layer: string) {
      const event = new CustomEvent('hueUpdate', { detail: { layer, state: { ...this.layers[layer] } } });
      document.dispatchEvent(event);
    },

    persist() {
      try {
        localStorage.setItem('errl_hue_layers', JSON.stringify(this.layers));
      } catch (e) {}
    },
    loadSettings() {
      try {
        const raw = localStorage.getItem('errl_hue_layers');
        if (raw) {
          const obj = JSON.parse(raw);
          for (const k of Object.keys(this.layers)) {
            if (obj[k]) {
              this.layers[k] = Object.assign({}, DEFAULT_LAYER_STATE, obj[k]);
              this.layers[k].enabled = false;
            }
          }
        }
      } catch (e) {}
    },

    reset(layer: string | null = null) {
      if (layer && this.layers[layer]) {
        this.layers[layer] = { ...DEFAULT_LAYER_STATE };
        this.persist(); this.applyLayerCSS(layer); this.applyWebGLLayer(layer); this.triggerUpdate(layer);
        return;
      }
      for (const k of Object.keys(this.layers)) {
        this.layers[k] = { ...DEFAULT_LAYER_STATE } as any;
        this.applyLayerCSS(k); this.applyWebGLLayer(k);
      }
      this.persist(); this.triggerUpdate(this.currentTarget);
    },

    // Allow registering additional DOM selectors as taggable layers
    registerDOMLayer(key: string, selectors: string[], label: string = key) {
      (LAYERS as any)[key] = { label, selectors };
      if (!this.layers[key]) this.layers[key] = { ...DEFAULT_LAYER_STATE };
      this.ensureClasses();
      this.applyLayerCSS(key);
    },
  };

  (window as any).ErrlHueController = HueController;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => HueController.init());
  } else {
    HueController.init();
  }
})();
