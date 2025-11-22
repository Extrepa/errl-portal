(() => {
  const NS: any = ((window as any).ErrlFX = (window as any).ErrlFX || {});

  // Pixi-based rising bubbles. Requires global PIXI and an existing Application.
  class BubblesFX {
    app: any;
    parent: any;
    opts: any;
    root: any;
    near: any;
    far: any;
    sprites: any[];
    _running: boolean;
    _speed: number;
    _wobbleMult: number;
    _freqMult: number;
    _tick: () => void;
    _raf: (ts: number) => void;
    _lastTS: number | null;
    _pointer: { x: number | null; y: number | null };
    _radius: number;
    _force: number;
    _influencer: { x: number; y: number } | null;
    _influenceRadius: number | null;
    _influenceForce: number | null;
    _si: any;
    _onResize: any;
    _motion: any;
    _onPointerMove?: (e: PointerEvent) => void;
    tex: any;
    count: number = 0;

    constructor(app: any, parent: any, opts: any = {}) {
      this.app = app;
      this.parent = parent || app.stage;
      this.opts = Object.assign(
        {
          textureUrl: null,
          minSize: 18,
          maxSize: 40,
          minSpeed: 0.3,
          maxSpeed: 0.9,
          minFreq: 0.6,
          maxFreq: 1.2,
          wobble: 1.2,
          alpha: 0.95,
          densityBase: 36,
          densityDivisor: 52000,
          farRatio: 0.33,
          blendMode: (PIXI as any).BLEND_MODES ? (PIXI as any).BLEND_MODES.SCREEN : 15,
          respectMotion: false,
          pointerInfluence: false, // disabled by default
          // size dynamics
          sizeJitterFreq: 0,      // Hz; 0 = off
          jumboChance: 0.0,       // 0..1 chance when size retargets
          jumboScale: 1.6,        // scale multiplier for jumbo
        },
        opts,
      );
      this.root = new (PIXI as any).Container();
      this.parent.addChild(this.root);
      this.near = new (PIXI as any).Container();
      this.far = new (PIXI as any).Container();
      this.root.addChild(this.far, this.near);
      this.sprites = [];
      this._running = true;
      this._speed = 1;
      this._wobbleMult = 1;
      this._freqMult = 1;
      this._tick = this._update.bind(this);
      this._raf = this._updateRAF.bind(this);
      this._lastTS = null;
      this._pointer = { x: null, y: null };
      this._radius = 180;
      this._force = 0.6;
      this._influencer = null;
      this._influenceRadius = null;
      this._influenceForce = null;
    }

    _fallbackTexture() {
      const dpr = (window.devicePixelRatio || 1) as number;
      const sz = 128;
      const c = document.createElement('canvas');
      c.width = sz * dpr;
      c.height = sz * dpr;
      const g = c.getContext('2d')!;
      g.scale(dpr, dpr);
      const cx = sz * 0.5,
        cy = sz * 0.5,
        R = sz * 0.48;
      let grd = g.createRadialGradient(cx * 0.92, cy * 0.8, R * 0.05, cx, cy, R);
      grd.addColorStop(0.0, 'rgba(255,255,255,0.95)');
      grd.addColorStop(0.18, 'rgba(123,92,255,0.90)');
      grd.addColorStop(0.38, 'rgba(0,229,255,0.70)');
      grd.addColorStop(0.70, 'rgba(100,160,255,0.35)');
      grd.addColorStop(1.0, 'rgba(100,160,255,0.00)');
      g.fillStyle = grd;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();
      g.globalCompositeOperation = 'lighter';
      let rim = g.createRadialGradient(cx, cy, R * 0.65, cx, cy, R);
      rim.addColorStop(0.0, 'rgba(123,92,255,0.00)');
      rim.addColorStop(0.8, 'rgba(123,92,255,0.18)');
      rim.addColorStop(1.0, 'rgba(0,229,255,0.22)');
      g.fillStyle = rim;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();
      const hx = cx - R * 0.18,
        hy = cy - R * 0.22;
      const hg = g.createRadialGradient(hx, hy, R * 0.02, hx, hy, R * 0.26);
      hg.addColorStop(0, 'rgba(255,255,255,0.9)');
      hg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = hg;
      g.beginPath();
      g.ellipse(hx, hy, R * 0.28, R * 0.2, -0.35, 0, Math.PI * 2);
      g.fill();
      g.globalCompositeOperation = 'source-over';
      const bt = (PIXI as any).BaseTexture.from(c, { resolution: dpr });
      return new (PIXI as any).Texture(bt);
    }

    async init() {
      if (this.opts.textureUrl) {
        try {
          const bt = (PIXI as any).BaseTexture.from(this.opts.textureUrl, { resourceOptions: { crossOrigin: undefined } });
          await new Promise((resolve, reject) => {
            if (bt.valid) resolve(true);
            else {
              bt.once('loaded', () => resolve(true));
              bt.once('error', (e: any) => reject(e || new Error('texture load failed')));
            }
          });
          this.tex = new (PIXI as any).Texture(bt);
        } catch (e) {
          this.tex = this._fallbackTexture();
        }
      } else {
        this.tex = this._fallbackTexture();
      }
      this.rebuild();
      this.app.ticker.maxFPS = 60;
      this.app.ticker.start();
      this.app.ticker.add(this._tick);
      requestAnimationFrame(this._raf);
      this._si = setInterval(() => this._advance(1), 1000 / 30);
      this._onResize = () => {
        const next = this._density();
        if (next !== this.count) this.rebuild();
      };
      addEventListener('resize', this._onResize);
      const mq = matchMedia('(prefers-reduced-motion: reduce)');
      this._motion = () => {
        if (this.opts.respectMotion) {
          (this as any)[mq.matches ? 'pause' : 'resume']();
        }
      };
      if ((mq as any).addEventListener) (mq as any).addEventListener('change', this._motion);
      if (this.opts.pointerInfluence) {
        this._onPointerMove = (e: PointerEvent) => {
          this._pointer.x = e.clientX;
          this._pointer.y = e.clientY;
        };
        addEventListener('pointermove', this._onPointerMove);
      }
      this.resume();
      return this as any;
    }

    destroy() {
      removeEventListener('resize', this._onResize);
      if (this._onPointerMove) removeEventListener('pointermove', this._onPointerMove);
      const mq = matchMedia('(prefers-reduced-motion: reduce)');
      (mq as any).removeEventListener && (mq as any).removeEventListener('change', this._motion);
      this.app.ticker.remove(this._tick);
      if (this._si) clearInterval(this._si);
      this.root.destroy({ children: true });
    }

    _density() {
      return Math.round(this.opts.densityBase + (innerWidth * innerHeight) / this.opts.densityDivisor);
    }

    rebuild() {
      this.count = this._density();
      this.near.removeChildren();
      this.far.removeChildren();
      this.sprites.length = 0;
      const W = this.app.screen.width,
        H = this.app.screen.height;
      for (let i = 0; i < this.count; i++) {
        const layer = i % Math.round(1 / this.opts.farRatio) === 0 ? this.far : this.near;
        const s = new (PIXI as any).Sprite(this.tex);
        if (s.texture && s.texture.baseTexture) {
          s.texture.baseTexture.scaleMode = (PIXI as any).SCALE_MODES.LINEAR;
          s.texture.baseTexture.mipmap = (PIXI as any).MIPMAP_MODES.ON;
        }
        s.anchor.set(0.5);
        s.roundPixels = true;
        s.blendMode = this.opts.blendMode;
        s.alpha = this.opts.alpha;
        s.x = Math.random() * W;
        s.y = Math.random() * H;
        const size = this.opts.minSize + Math.random() * (this.opts.maxSize - this.opts.minSize);
        const sc = size / ((this.tex && this.tex.width) || 64);
        s.scale.set(sc);
        s._scaleTarget = sc;
        s._szAcc = 0; // seconds accumulator for size changes
        s.v = this.opts.minSpeed + Math.random() * (this.opts.maxSpeed - this.opts.minSpeed);
        s.w = Math.random() * this.opts.wobble + 0.3;
        s.f = this.opts.minFreq + Math.random() * (this.opts.maxFreq - this.opts.minFreq);
        s.t = Math.random() * Math.PI * 2;
        s._dir = Math.random() < 0.5 ? -1 : 1;
        layer.addChild(s);
        this.sprites.push(s);
      }
    }

    _advance(dt: number) {
      if (!this._running) return;
      const sp = Math.max(0, this._speed);
      const wob = Math.max(0, this._wobbleMult);
      if (sp <= 0 && wob <= 0 && !(this._pointer && this._pointer.x) && !this._influencer && this.opts.sizeJitterFreq<=0) return;
      const W = this.app.screen.width,
        H = this.app.screen.height;
      const dtSec = dt / 60; // normalize to seconds (dt≈1 at 60fps)
      for (const s of this.sprites) {
        const parallax = s.parent === this.far ? 0.7 : 1.0;
        if (sp > 0) s.y -= s.v * dt * parallax * sp;
        if (wob > 0) {
          s.x += Math.sin((s.t += (s.f * this._freqMult) * 0.02 * dt)) * (s.w * wob) * parallax;
        }
        // Size dynamics
        if (this.opts.sizeJitterFreq > 0) {
          s._szAcc = (s._szAcc || 0) + dtSec;
          const period = 1 / Math.max(0.0001, this.opts.sizeJitterFreq);
          if (s._szAcc >= period) {
            s._szAcc = 0;
            let size = this.opts.minSize + Math.random() * (this.opts.maxSize - this.opts.minSize);
            if (Math.random() < (this.opts.jumboChance || 0)) size *= Math.max(1, this.opts.jumboScale || 1.6);
            s._scaleTarget = size / ((this.tex && this.tex.width) || 64);
          }
          if (s._scaleTarget != null) {
            const cur = s.scale.x;
            const next = cur + (s._scaleTarget - cur) * Math.min(1, 0.08 * dt);
            s.scale.set(next);
          }
        }
        // Pointer/influencer
        const p = this._influencer || this._pointer;
        if (p && p.x != null) {
          const effR = this._influenceRadius != null ? this._influenceRadius : this._radius;
          const effF = this._influenceForce != null ? this._influenceForce : this._force;
          const dx = p.x - s.x,
            dy = p.y - s.y;
          const d = Math.hypot(dx, dy);
          if (d < effR) {
            const inf = 1 - d / effR;
            const nx = dx / (d || 1),
              ny = dy / (d || 1);
            const m = effF * inf * parallax * dt;
            const sign = this._influencer ? 1 : s._dir;
            s.x += nx * m * sign;
            s.y += ny * m * sign;
          }
        }
        if (s.y < -80) {
          s.y = H + Math.random() * 120;
          s.x = Math.random() * W;
        }
      }
    }

    _update() {
      const deltaMS = (this.app.ticker && this.app.ticker.deltaMS) || 16.667;
      const dt = Math.max(0.5, Math.min(3, deltaMS / 16.667));
      this._advance(dt);
    }
    _updateRAF(ts: number) {
      if (this._lastTS == null) this._lastTS = ts;
      const ms = ts - this._lastTS;
      this._lastTS = ts;
      const dt = Math.max(0.5, Math.min(3, ms / 16.667));
      this._advance(dt);
      requestAnimationFrame(this._raf);
    }

    set(params: any = {}) {
      Object.assign(this.opts, params);
      if ('textureUrl' in params) {
        if (!params.textureUrl) {
          this.tex = this._fallbackTexture();
          this.rebuild();
          return Promise.resolve(true);
        }
        try {
          const bt = (PIXI as any).BaseTexture.from(params.textureUrl, { resourceOptions: { crossOrigin: undefined } });
          return new Promise((resolve, reject) => {
            const apply = () => {
              this.tex = new (PIXI as any).Texture(bt);
              this.rebuild();
              resolve(true);
            };
            if (bt.valid) {
              apply();
            } else {
              bt.once('loaded', apply);
              bt.once('error', (err: any) => {
                console.warn('BubblesFX texture load failed:', err);
                this.tex = this._fallbackTexture();
                this.rebuild();
                reject(err || new Error('load failed'));
              });
            }
          });
        } catch (e) {
          console.warn('BubblesFX texture from() error:', e);
          this.tex = this._fallbackTexture();
          this.rebuild();
          return Promise.reject(e);
        }
      }
      if ('alpha' in params) {
        for (const s of this.sprites) s.alpha = this.opts.alpha;
      }
      if ('blendMode' in params) {
        for (const s of this.sprites) s.blendMode = this.opts.blendMode;
      }
      const needsRebuildKeys = ['minSize', 'maxSize', 'farRatio', 'densityBase', 'densityDivisor'];
      if (needsRebuildKeys.some((k) => k in params)) this.rebuild();
      return Promise.resolve(true);
    }

    setSpeed(mult: number) {
      this._speed = Math.max(0, mult);
    }
    setCountFactor(f: number) {
      this.opts.densityBase = Math.round(50 * f);
      this.opts.densityDivisor = 40000 / Math.max(0.25, f);
      this.rebuild();
    }
    setWobbleMult(m: number) {
      this._wobbleMult = Math.max(0, m);
    }
    setFreqMult(m: number) {
      this._freqMult = Math.max(0, m);
    }
    setInfluencer(x: number, y: number, radius: number | null = null, force: number | null = null) {
      this._influencer = { x, y } as any;
      if (radius != null) this._influenceRadius = radius;
      if (force != null) this._influenceForce = force;
    }
    clearInfluencer() {
      this._influencer = null;
      this._influenceRadius = null;
      this._influenceForce = null;
    }
    pause() {
      this._running = false;
    }
    resume() {
      this._running = true;
    }
  }

  function register() {
    if (NS && (NS as any).Manager) {
      (NS as any)._registry = (NS as any)._registry || new Map<string, any>();
      (NS as any)._registry.set('bubbles', ({ app, root, opts }: any) => {
        const inst = new BubblesFX(app, root, opts);
        (inst as any).init();
        return inst;
      });
    }
  }
  register();
  (NS as any).Bubbles = BubblesFX;
})();
