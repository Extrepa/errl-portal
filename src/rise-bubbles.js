// L2 DOM rising bubbles for #riseBubbles
(function(){
  const cvs = document.getElementById('riseBubbles');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const RB = {
    speed: 1.0,
    alpha: 0.95,
    density: 1.0,
    wobble: 1.0,
    freq: 1.0,
    min: 14,
    max: 36,
    sizeHz: 0.0,
    jumboPct: 0.1,
    jumboScale: 1.6,
    items: [],
    pointer: {x: null, y: null},
    attract: true,
    attractIntensity: 1.0,
    rippleIntensity: 1.2,
    ripples: [],
  };
  const MAX_RINGS = 3;      // performantly cap ripple count
  const EDGE_BAND = 12;     // px band where impulse applies
  const MAX_RING_DIAM = 320; // px visual cap to keep draws cheap
  const RING_FADE = 0.92;   // per-frame fade for ring alpha
  const RING_ALPHA = 0.55;  // initial ring alpha
  

  function bubbleTexture(size=96){
    const c=document.createElement('canvas'); c.width=c.height=size; const g=c.getContext('2d');
    const grd=g.createRadialGradient(size*0.45,size*0.42,size*0.05,size*0.5,size*0.5,size*0.48);
    grd.addColorStop(0,'rgba(255,255,255,0.95)');
    grd.addColorStop(0.2,'rgba(130,200,255,0.9)');
    grd.addColorStop(0.6,'rgba(110,160,255,0.4)');
    grd.addColorStop(1,'rgba(110,160,255,0.0)');
    g.fillStyle=grd; g.beginPath(); g.arc(size/2,size/2,size*0.48,0,Math.PI*2); g.fill();
    return c;
  }
  const TEX = bubbleTexture(96);

  function resize(){
    const w = innerWidth, h = innerHeight;
    cvs.width = Math.max(1, Math.floor(w * DPR));
    cvs.height = Math.max(1, Math.floor(h * DPR));
    cvs.style.width = w+'px';
    cvs.style.height = h+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    rebuild();
  }

  function density(){
    // base tuned for ~1080p
    const base = Math.round(140 * RB.density);
    const scale = Math.max(0.6, Math.min(1.8, (innerWidth*innerHeight)/(1920*1080)));
    return Math.round(base * scale);
  }

  function rebuild(){
    const count = density();
    const items = [];
    for(let i=0;i<count;i++){
      const size = RB.min + Math.random()*(RB.max-RB.min);
      items.push({
        x: Math.random()*innerWidth,
        y: Math.random()*innerHeight,
        vx: 0,
        vy: -(0.30+Math.random()*0.9),
        w: 0.6 + Math.random()*1.2,
        f: 0.6 + Math.random()*1.2,
        t: Math.random()*Math.PI*2,
        base: size,
        size: size,
      });
    }
    RB.items = items;
  }

  function advance(dt){
    const flow = 1.0;
    for(const it of RB.items){
      // pointer influence (attracts or repels based on RB.attract)
      if (RB.pointer.x != null && RB.pointer.y != null && RB.attractIntensity > 0){
        const dx = RB.pointer.x - it.x;
        const dy = RB.pointer.y - it.y;
        const d = Math.hypot(dx,dy) || 1;
        if (d < 160){
          // Use positive multiplier for attraction, negative for repulsion
          const direction = RB.attract ? 1 : -1;
          const pull = (1 - d/160) * 0.8 * RB.attractIntensity * direction;
          it.x += (dx/d) * pull * dt;
          it.y += (dy/d) * pull * dt;
        }
      }
      // ripple rings (bounded & lighter math)
      for(const r of RB.ripples){
        const dx = it.x - r.x, dy = it.y - r.y;
        // quick reject by axis
        if (Math.abs(dx) > r.r + EDGE_BAND || Math.abs(dy) > r.r + EDGE_BAND) continue;
        const dd = dx*dx + dy*dy;
        const rd = Math.sqrt(dd);
        const edge = Math.abs(rd - r.r);
        if (edge < EDGE_BAND){
          const inv = rd > 0.0001 ? 1/rd : 0;
          const nx = dx * inv, ny = dy * inv;
          const m = (EDGE_BAND - edge) / EDGE_BAND * 1.6 * RB.rippleIntensity; // apply intensity multiplier
          it.x += nx * m * dt;
          it.y += ny * m * dt;
        }
      }
      // wobble + rise
      it.t += 0.02 * RB.freq * flow * dt;
      it.x += Math.sin(it.t) * it.w * RB.wobble * flow * dt;
      it.y += it.vy * RB.speed * flow * dt;
      if (RB.sizeHz > 0){ const k=1+0.12*Math.sin(it.t*RB.sizeHz*3.2); it.size = it.base*k; }
      if (Math.random() < RB.jumboPct/600){ it.base *= RB.jumboScale; }
      if (it.y < -80){ it.y = innerHeight + 40 + Math.random()*80; it.x = Math.random()*innerWidth; it.base = RB.min + Math.random()*(RB.max-RB.min); it.size = it.base; }
    }
  }

  // pre-render a ring texture to reduce per-frame gradient cost
  const RING_TEX = (function(){
    const S = 128; const c=document.createElement('canvas'); c.width=c.height=S; const g=c.getContext('2d');
    const grad = g.createRadialGradient(S/2,S/2,S*0.38, S/2,S/2,S*0.50);
    grad.addColorStop(0,'rgba(160,190,255,1.0)'); grad.addColorStop(1,'rgba(160,190,255,0)');
    g.fillStyle=grad; g.beginPath(); g.arc(S/2,S/2,S*0.50,0,Math.PI*2); g.fill();
    return c;
  })();

  function draw(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ctx.globalAlpha = RB.alpha;
    ctx.globalCompositeOperation = 'lighter';
    for(const it of RB.items){
      const s = it.size;
      ctx.drawImage(TEX, Math.round(it.x - s/2), Math.round(it.y - s/2), s, s);
    }
    // draw ripples (capped & cached) with intensity multiplier
    if (RB.ripples.length > MAX_RINGS) RB.ripples.length = MAX_RINGS;
    for(const r of RB.ripples){
      const rd = Math.min(r.r+10, MAX_RING_DIAM*0.5);
      const d = rd * 2;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, r.a * RB.rippleIntensity));
      ctx.drawImage(RING_TEX, Math.round(r.x - d/2), Math.round(r.y - d/2), d, d);
      ctx.restore();
    }
  }

  let last = performance.now();
  let slow = false; let acc = 0; let phase = 0;
  function loop(ts){
    const dt = Math.max(0.5, Math.min(3, (ts-last)/16.667));
    last = ts;
    acc = acc*0.9 + dt*0.1; slow = acc > 1.4; // simple perf heuristic
    phase = (phase+1) & 1; // toggle 0/1
    advance(dt);
    draw();
    // advance ripples (slower on slow frames)
    const ringStep = slow ? 4 : 6;
    RB.ripples.forEach(r=> { r.r += ringStep*dt; r.a *= RING_FADE; });
    // remove when faded or too large
    while (RB.ripples.length && (RB.ripples[0].a < 0.04 || RB.ripples[0].r > Math.max(innerWidth, innerHeight, MAX_RING_DIAM))) RB.ripples.shift();
    requestAnimationFrame(loop);
  }

  // Controls
  const bind = (id, fn)=>{ const el=document.getElementById(id); if(!el) return; el.addEventListener('input', ()=> fn(el)); fn(el); };
  bind('rbSpeed', el=> RB.speed = parseFloat(el.value));
  bind('rbDensity', el=>{ RB.density = parseFloat(el.value); rebuild(); });
  bind('rbAlpha', el=> RB.alpha = parseFloat(el.value));
  bind('rbWobble', el=> RB.wobble = parseFloat(el.value));
  bind('rbFreq', el=> RB.freq = parseFloat(el.value));
  bind('rbMin', el=> { RB.min = parseFloat(el.value); rebuild(); });
  bind('rbMax', el=> { RB.max = parseFloat(el.value); rebuild(); });
  bind('rbJumboPct', el=> RB.jumboPct = parseFloat(el.value));
  bind('rbJumboScale', el=> RB.jumboScale = parseFloat(el.value));
  bind('rbSizeHz', el=> RB.sizeHz = parseFloat(el.value));
  bind('rbAttractIntensity', el=> RB.attractIntensity = parseFloat(el.value));
  bind('rbRippleIntensity', el=> RB.rippleIntensity = parseFloat(el.value));
  const at=document.getElementById('rbAttract'); if(at) at.addEventListener('change', ()=> RB.attract = !!(at).checked);
  const rp=document.getElementById('rbRipples');

  const RB_PARAM_IDS = {
    speed: 'rbSpeed',
    density: 'rbDensity',
    alpha: 'rbAlpha',
  };

  function setRBParam(key, value, { syncInput = true } = {}){
    const id = RB_PARAM_IDS[key];
    if (!id) return RB[key];
    const el = document.getElementById(id);
    if (!el) return RB[key];
    const num = Number(value);
    if (Number.isNaN(num)) return RB[key];
    if (syncInput){
      el.value = String(num);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      RB[key] = num;
      if (key === 'density') rebuild();
    }
    return RB[key];
  }

  window.errlRisingBubbles = {
    getState(){
      return {
        speed: RB.speed,
        density: RB.density,
        alpha: RB.alpha,
      };
    },
    setSpeed(value, opts){
      return setRBParam('speed', value, opts);
    },
    setDensity(value, opts){
      return setRBParam('density', value, opts);
    },
    setAlpha(value, opts){
      return setRBParam('alpha', value, opts);
    },
  };

  const isPanelEvent = (e)=> e?.target?.closest && e.target.closest('#errlPanel');

  addEventListener('pointermove', e=>{
    if (isPanelEvent(e)) return;
    RB.pointer.x=e.clientX; RB.pointer.y=e.clientY;
  });
  addEventListener('click', e=>{ 
    if (isPanelEvent(e)) return;
    if(rp && rp.checked) {
      // Ripples enabled - show ripple effect
      if (RB.ripples.length >= MAX_RINGS) RB.ripples.shift(); 
      RB.ripples.push({x:e.clientX, y:e.clientY, r:4, a:RING_ALPHA}); 
    }
  });
  addEventListener('resize', resize);

  resize();
  requestAnimationFrame(loop);
})();
