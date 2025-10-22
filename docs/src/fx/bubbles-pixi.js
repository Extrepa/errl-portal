(function(){
  const NS = window.ErrlFX = window.ErrlFX || {};

  // Pixi-based rising bubbles. Requires global PIXI and an existing Application.
class BubblesFX{
    constructor(app, parent, opts={}){
      this.app = app; this.parent = parent || app.stage; this.opts = Object.assign({
        textureUrl: null,
        minSize: 18, maxSize: 40,
        minSpeed: 0.30, maxSpeed: 0.90,
        minFreq: 0.6, maxFreq: 1.2,
        wobble: 1.2, alpha: 0.95,
        densityBase: 36, densityDivisor: 52000,
        farRatio: 0.33, blendMode: (PIXI.BLEND_MODES && PIXI.BLEND_MODES.SCREEN) || 15,
        respectMotion: false,
        pointerInfluence: false // disable pointer push/pull by default
      }, opts);
      this.root = new PIXI.Container();
      // Insert near back (caller decides z-index by providing parent)
      this.parent.addChild(this.root);
      this.near = new PIXI.Container(); this.far = new PIXI.Container();
      this.root.addChild(this.far, this.near);
      this.sprites = []; this._running = true; this._speed = 1; this._wobbleMult = 1; this._freqMult = 1; this._tick = this._update.bind(this); this._raf = this._updateRAF.bind(this); this._lastTS = null; this._pointer = {x:null,y:null}; this._radius = 180; this._force = 0.6; this._influencer = null; this._influenceRadius = null; this._influenceForce = null;
    }
    _fallbackTexture(){
      const dpr = (window.devicePixelRatio || 1);
      const sz=128; const c=document.createElement('canvas'); c.width=sz*dpr; c.height=sz*dpr; const g=c.getContext('2d'); g.scale(dpr,dpr);
      const cx=sz*0.5, cy=sz*0.5, R=sz*0.48;
      // Core orb gradient (purple/teal glow → transparent edge)
      let grd=g.createRadialGradient(cx*0.92, cy*0.80, R*0.05, cx, cy, R);
      grd.addColorStop(0.00, 'rgba(255,255,255,0.95)');
      grd.addColorStop(0.18, 'rgba(123,92,255,0.90)');
      grd.addColorStop(0.38, 'rgba(0,229,255,0.70)');
      grd.addColorStop(0.70, 'rgba(100,160,255,0.35)');
      grd.addColorStop(1.00, 'rgba(100,160,255,0.00)');
      g.fillStyle=grd; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill();
      // Rim glow
      g.globalCompositeOperation='lighter';
      let rim=g.createRadialGradient(cx, cy, R*0.65, cx, cy, R);
      rim.addColorStop(0.0,'rgba(123,92,255,0.00)');
      rim.addColorStop(0.8,'rgba(123,92,255,0.18)');
      rim.addColorStop(1.0,'rgba(0,229,255,0.22)');
      g.fillStyle=rim; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill();
      // Specular highlight
      const hx=cx-R*0.18, hy=cy-R*0.22;
      const hg=g.createRadialGradient(hx,hy,R*0.02, hx,hy,R*0.26);
      hg.addColorStop(0,'rgba(255,255,255,0.9)');
      hg.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle=hg; g.beginPath(); g.ellipse(hx,hy,R*0.28,R*0.20, -0.35, 0, Math.PI*2); g.fill();
      g.globalCompositeOperation='source-over';
      const bt = PIXI.BaseTexture.from(c, { resolution: dpr });
      return new PIXI.Texture(bt);
    }
    async init(){
      // Load without fetch() so file:// works; fallback to procedural if unavailable
      if(this.opts.textureUrl){
        try{
          const bt = PIXI.BaseTexture.from(this.opts.textureUrl, { resourceOptions:{ crossOrigin: undefined } });
          await new Promise((resolve, reject)=>{ if(bt.valid) resolve(true); else { bt.once('loaded', ()=>resolve(true)); bt.once('error', (e)=>reject(e||new Error('texture load failed'))); } });
          this.tex = new PIXI.Texture(bt);
        }catch(e){ this.tex = this._fallbackTexture(); }
      }else{
        this.tex = this._fallbackTexture();
      }
      this.rebuild();
      this.app.ticker.maxFPS = 60; this.app.ticker.start();
      this.app.ticker.add(this._tick);
      // Also drive via rAF to be resilient if ticker stalls
      requestAnimationFrame(this._raf);
      // Final safety: a 30fps interval driver
      this._si = setInterval(()=> this._advance(1), 1000/30);
      this._onResize = ()=>{ const next=this._density(); if(next!==this.count) this.rebuild(); };
      addEventListener('resize', this._onResize);
      const mq=matchMedia('(prefers-reduced-motion: reduce)');
      this._motion = ()=>{ if(this.opts.respectMotion){ this[mq.matches?'pause':'resume'](); } };
      if(mq.addEventListener) mq.addEventListener('change', this._motion);
      // Pointer influence
      if(this.opts.pointerInfluence){
        this._onPointerMove = (e)=>{ this._pointer.x = e.clientX; this._pointer.y = e.clientY; };
        addEventListener('pointermove', this._onPointerMove);
      }
      this.resume();
      return this;
    }
    destroy(){ removeEventListener('resize', this._onResize); if(this._onPointerMove) removeEventListener('pointermove', this._onPointerMove); const mq=matchMedia('(prefers-reduced-motion: reduce)'); mq.removeEventListener && mq.removeEventListener('change', this._motion); this.app.ticker.remove(this._tick); if(this._si) clearInterval(this._si); this.root.destroy({children:true}); }
    _density(){ return Math.round(this.opts.densityBase + (innerWidth*innerHeight)/this.opts.densityDivisor); }
    rebuild(){ this.count=this._density(); this.near.removeChildren(); this.far.removeChildren(); this.sprites.length=0; const W=this.app.screen.width, H=this.app.screen.height;
      for(let i=0;i<this.count;i++){
        const layer=(i%Math.round(1/this.opts.farRatio)===0)?this.far:this.near;
        const s=new PIXI.Sprite(this.tex);
        if(s.texture?.baseTexture){ s.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR; s.texture.baseTexture.mipmap = PIXI.MIPMAP_MODES.ON; }
        s.anchor.set(.5); s.roundPixels = true; s.blendMode=this.opts.blendMode; s.alpha=this.opts.alpha;
        s.x=Math.random()*W; s.y=Math.random()*H;
        const size=this.opts.minSize+Math.random()*(this.opts.maxSize-this.opts.minSize);
        // since we crop to square, scale from tex width
        s.scale.set(size / (this.tex?.width||64));
        s.v=this.opts.minSpeed+Math.random()*(this.opts.maxSpeed-this.opts.minSpeed);
        s.w=Math.random()*this.opts.wobble+.3; s.f=this.opts.minFreq+Math.random()*(this.opts.maxFreq-this.opts.minFreq); s.t=Math.random()*Math.PI*2; s._dir = (Math.random() < 0.5 ? -1 : 1);
        layer.addChild(s); this.sprites.push(s);
      }
    }
    _advance(dt){ const sp = Math.max(0, this._speed); const wob = Math.max(0, this._wobbleMult); if(sp<=0 && wob<=0 && !this._pointer?.x && !this._influencer) return; const W=this.app.screen.width, H=this.app.screen.height; for(const s of this.sprites){ const parallax=(s.parent===this.far)?0.7:1.0; if(sp>0) s.y -= s.v*dt*parallax*sp; if(wob>0){ s.x += Math.sin((s.t += (s.f*this._freqMult)*0.02*dt)) * (s.w*wob) * parallax; }
        // Pointer or external influencer push/pull influence (gentle). Influencer repels.
        const p = this._influencer || this._pointer; if(p && p.x!=null){ const effR = (this._influenceRadius!=null? this._influenceRadius : this._radius); const effF = (this._influenceForce!=null? this._influenceForce : this._force); const dx=p.x - s.x, dy=p.y - s.y; const d=Math.hypot(dx,dy); if(d < effR){ const inf = 1 - d/effR; const nx = dx/(d||1), ny = dy/(d||1); const m = effF * inf * parallax * dt; const sign = (this._influencer ? 1 : s._dir); s.x += nx * m * sign; s.y += ny * m * sign; } }
        if(s.y<-80){ s.y=H+Math.random()*120; s.x=Math.random()*W; }
      } }
    _update(){ const dt = Math.max(0.5, Math.min(3, (this.app.ticker?.deltaMS || 16.667)/16.667)); this._advance(dt); }
    _updateRAF(ts){ if(this._lastTS==null) this._lastTS=ts; const ms = ts - this._lastTS; this._lastTS = ts; const dt = Math.max(0.5, Math.min(3, ms/16.667)); this._advance(dt); requestAnimationFrame(this._raf); }
    set(params={}){
      const prev = { ...this.opts };
      Object.assign(this.opts, params);
      // Texture swap
      if('textureUrl' in params){
        if(!params.textureUrl){ this.tex = this._fallbackTexture(); this.rebuild(); return Promise.resolve(true); }
        try{
          const bt = PIXI.BaseTexture.from(params.textureUrl, { resourceOptions:{ crossOrigin: undefined } });
          return new Promise((resolve, reject)=>{
            const apply = ()=>{ this.tex = new PIXI.Texture(bt); this.rebuild(); resolve(true); };
            if(bt.valid){ apply(); }
            else{ bt.once('loaded', apply); bt.once('error', (err)=>{ console.warn('BubblesFX texture load failed:', err); this.tex = this._fallbackTexture(); this.rebuild(); reject(err||new Error('load failed')); }); }
          });
        }catch(e){ console.warn('BubblesFX texture from() error:', e); this.tex = this._fallbackTexture(); this.rebuild(); return Promise.reject(e); }
      }
      // Live updates that don't need rebuild
      if('alpha' in params){ for(const s of this.sprites){ s.alpha = this.opts.alpha; } }
      if('blendMode' in params){ for(const s of this.sprites){ s.blendMode = this.opts.blendMode; } }
      // Rebuild when sizing/layering/density changed
      const needsRebuildKeys = ['minSize','maxSize','farRatio','densityBase','densityDivisor'];
      if(needsRebuildKeys.some(k=> k in params)) this.rebuild();
      return Promise.resolve(true);
    }
    setSpeed(mult){ this._speed=Math.max(0,mult); }
    setCountFactor(f){ this.opts.densityBase=Math.round(50*f); this.opts.densityDivisor=40000/Math.max(.25,f); this.rebuild(); }
    setWobbleMult(m){ this._wobbleMult=Math.max(0,m); }
    setFreqMult(m){ this._freqMult=Math.max(0,m); }
    setInfluencer(x, y, radius=null, force=null){ this._influencer = { x, y }; if(radius!=null) this._influenceRadius = radius; if(force!=null) this._influenceForce = force; }
    clearInfluencer(){ this._influencer = null; this._influenceRadius = null; this._influenceForce = null; }
    pause(){ this._running=false; }
    resume(){ this._running=true; }
  }

  // Auto register with FX core if present
  function register(){ if(NS && NS.Manager){ NS._registry = NS._registry || new Map(); NS._registry.set('bubbles', ({app, root, opts})=>{ const inst = new BubblesFX(app, root, opts); inst.init(); return inst; }); } }
  register();
  NS.Bubbles = BubblesFX;

  // (no atlas cropping; treat image as a single sprite)
})();
