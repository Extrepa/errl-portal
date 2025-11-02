// ===== Canvas Particle Field (Stars) =====
const canvas = document.getElementById("bgParticles");
const ctx = canvas.getContext("2d");

// ===== Rising Bubbles (Canvas) =====
const rise = document.getElementById('riseBubbles');
const rctx = rise.getContext('2d');
let RB = {
  speed: 1.0,
  alpha: 0.95,
  density: 1.0,
  wobble: 1.0,
  freq: 1.0,
  minSize: 14,
  maxSize: 36,
  sizeHz: 0.0,
  jumboChance: 0.1,
  jumboScale: 1.6,
  layers: [ { kind:'pack', tex:null }, { kind:'proc', tex:null } ],
  items: [],
};
function rbResize(){ const DPR = Math.min(1.25, window.devicePixelRatio || 1); rise.width = Math.round(innerWidth * DPR); rise.height = Math.round(innerHeight * DPR); rise.style.width = innerWidth+'px'; rise.style.height = innerHeight+'px'; rctx.setTransform(DPR,0,0,DPR,0,0); }
rbResize(); addEventListener('resize', rbResize);
function rbTexFromPack(){
  // Safe base candidates (no import.meta so file:// works)
  const bases = [];
  if (location.pathname.includes('/errl-portal/')) bases.push('/errl-portal/assets/Bubbles_ErrlSiteDecor');
  bases.push('./assets/Bubbles_ErrlSiteDecor');
  bases.push('./portal/assets/Bubbles_ErrlSiteDecor');
  const makeImgFor = (idx)=>{
    let j=0; const im=new Image();
    function tryNext(){ if(j>=bases.length) return; const url = `${bases[j]}/Bubbles-${idx}.png`; im.src = url; j++; }
    im.onload = ()=>{ try{ rbRebuild(); }catch{} };
    im.onerror = tryNext;
    tryNext();
    return im;
  };
  const imgs = [1,2,3,4,5,6].map(makeImgFor);
  return imgs;
}
function rbMakeProc(size=64){ const c=document.createElement('canvas'); c.width=c.height=size; const g=c.getContext('2d'); const grd=g.createRadialGradient(size*0.45,size*0.42,size*0.05,size*0.5,size*0.5,size*0.48); grd.addColorStop(0,'rgba(255,255,255,0.95)'); grd.addColorStop(0.2,'rgba(130,200,255,0.9)'); grd.addColorStop(0.6,'rgba(110,160,255,0.4)'); grd.addColorStop(1,'rgba(110,160,255,0.0)'); g.fillStyle=grd; g.beginPath(); g.arc(size/2,size/2,size*0.48,0,Math.PI*2); g.fill(); return c; }
RB.layers[0].tex = [rbMakeProc(96)]; RB.layers[1].tex = [rbMakeProc(64)];
function rbRebuild(){ const base = Math.round(90 * RB.density * (window.GLOBAL_MOTION||1)); RB.items.length=0; for (let i=0;i<base;i++){ const layer=(i%2); const texArr=RB.layers[layer].tex; const tex = texArr[Math.floor(Math.random()*texArr.length)]; const s = RB.minSize + Math.random()*(RB.maxSize-RB.minSize); RB.items.push({ x: Math.random()*innerWidth, y: Math.random()*innerHeight, vx:(Math.random()-0.5)*0.3, vy: -(0.25+Math.random()*0.7), size:s, baseSize:s, phase:Math.random()*Math.PI*2, tex, layer }); } }
rbRebuild();
function rbDraw(){ rctx.clearRect(0,0,innerWidth,innerHeight); rctx.globalAlpha = RB.alpha; rctx.globalCompositeOperation='lighter'; for(const it of RB.items){ const wob = Math.sin((it.phase += 0.02*RB.freq)) * 1.2 * RB.wobble; it.x += wob; it.y += it.vy * RB.speed; // size jitter
  if (RB.sizeHz>0){ const k=1+0.12*Math.sin(it.phase*RB.sizeHz*3.2); it.size = it.baseSize*k; }
  // wrap to bottom
  if (it.y < -80){ it.y = innerHeight + 40 + Math.random()*80; it.x = Math.random()*innerWidth; }
  const s = it.size;
  if (it.tex instanceof HTMLImageElement && it.tex.complete) {
    rctx.drawImage(it.tex, Math.round(it.x - s/2), Math.round(it.y - s/2), s, s);
  } else if (it.tex && it.tex.getContext) {
    rctx.drawImage(it.tex, Math.round(it.x - s/2), Math.round(it.y - s/2), s, s);
  } else {
    // procedural circle fallback
    const grd=rctx.createRadialGradient(it.x-0.1*s,it.y-0.12*s, s*0.05, it.x, it.y, s*0.5);
    grd.addColorStop(0,'rgba(255,255,255,0.95)'); grd.addColorStop(0.25,'rgba(130,200,255,0.8)'); grd.addColorStop(0.7,'rgba(110,160,255,0.35)'); grd.addColorStop(1,'rgba(110,160,255,0)');
    rctx.fillStyle=grd; rctx.beginPath(); rctx.arc(it.x,it.y,s*0.5,0,Math.PI*2); rctx.fill();
  }
}
requestAnimationFrame(rbDraw);
}
rbDraw();

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const glCanvas = document.getElementById("errlWebGL");
  if (glCanvas) {
    glCanvas.width = window.innerWidth;
    glCanvas.height = window.innerHeight;
  }
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Tunables controlled by panel
let particleSpeedScale = 1.0;
let particleAlpha = 0.9;
let particleDensityScale = 1.0;

let BASE_PARTICLE_COUNT = (window.innerWidth * window.innerHeight < 800*800) ? 80 : 140;
let particles = [];

function initParticles() {
  const count = Math.floor(BASE_PARTICLE_COUNT * particleDensityScale * (window.GLOBAL_MOTION||1));
  particles = Array.from({ length: Math.max(20, count) }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    r: 1.5 + Math.random() * 2.5,
  }));
}
initParticles();

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mot = (window.GLOBAL_MOTION||1) * particleSpeedScale;
  for (const p of particles) {
    // physics
    p.x += p.vx * mot;
    p.y += p.vy * mot;

    if (p.mode === 'burst') {
      // bounce off edges with damping
      const damp = 0.72;
      if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx) * damp; p.bounces = (p.bounces||0)+1; }
      if (p.x > canvas.width) { p.x = canvas.width; p.vx = -Math.abs(p.vx) * damp; p.bounces = (p.bounces||0)+1; }
      if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy) * damp; p.bounces = (p.bounces||0)+1; }
      if (p.y > canvas.height) { p.y = canvas.height; p.vy = -Math.abs(p.vy) * damp; p.bounces = (p.bounces||0)+1; }
      // friction
      p.vx *= 0.992; p.vy *= 0.992;
      // after some time or bounces, convert to float mode
      if ((p.burstUntil && Date.now() > p.burstUntil) || (p.bounces||0) > 3) {
        p.mode = 'float';
        // gentle drift
        p.vx = (Math.random()-0.5) * 0.25;
        p.vy = (Math.random()-0.5) * 0.25;
      }
    } else {
      // default float: wrap
      if (p.x < 0) p.x += canvas.width;
      if (p.x > canvas.width) p.x -= canvas.width;
      if (p.y < 0) p.y += canvas.height;
      if (p.y > canvas.height) p.y -= canvas.height;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    if (p.h != null) {
      ctx.fillStyle = `hsla(${Math.round(p.h)}, 100%, 65%, ${particleAlpha})`;
      ctx.shadowColor = `hsla(${Math.round(p.h)}, 100%, 70%, 1)`;
    } else {
      ctx.fillStyle = `rgba(130,160,255,${particleAlpha})`;
      ctx.shadowColor = "rgba(130,160,255,1)";
    }
    ctx.shadowBlur = 6;
    ctx.fill();
  }

  requestAnimationFrame(drawParticles);
}
drawParticles();

// Burst (DNA double-helix, clockwise, 250→500px from center)
function burstParticlesDNA() {
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const steps = 30;
  const perStrand = 4; // particles per strand per step
const speed = 2.2 * (window.GLOBAL_MOTION || 1);
  let i = 0;
  const tick = () => {
    const t = i / steps; // 0..1
    const theta = -Math.PI/2 - (Math.PI*2) * t; // clockwise from up
    const r = 300 + 300 * t; // 300 -> 600 (further reach)
    const dirX = Math.cos(theta), dirY = Math.sin(theta);
    const baseX = cx + dirX * r, baseY = cy + dirY * r;
    const perpX = -dirY, perpY = dirX; // perpendicular to radial
    // sinusoidal offset for helix wrapping
    const A = 18 * Math.sin(theta * 6);
    const targets = [
      { x: baseX + perpX * A, y: baseY + perpY * A },  // strand A
      { x: baseX - perpX * A, y: baseY - perpY * A },  // strand B
    ];
    for (const tgt of targets) {
      for (let k = 0; k < perStrand; k++) {
        const jx = (Math.random()-0.5) * 10;
        const jy = (Math.random()-0.5) * 10;
        const dx = (tgt.x + jx) - cx;
        const dy = (tgt.y + jy) - cy;
        const d = Math.hypot(dx, dy) || 1;
        const vx = (dx/d) * speed * (0.9 + Math.random()*0.3);
        const vy = (dy/d) * speed * (0.9 + Math.random()*0.3);
        const hue = ( (theta * 180/Math.PI) % 360 + 360 ) % 360; // map angle to hue
        particles.push({ x: cx, y: cy, vx, vy, r: 2 + Math.random()*2.5, mode:'burst', burstUntil: Date.now()+1800, bounces:0, h: hue });
      }
    }
    i++;
    if (i <= steps) requestAnimationFrame(tick); else { /* keep particles; they will transition to float */ }
  };
  requestAnimationFrame(tick);
}


// ===== Orbiting Menu Bubbles around Errl =====
const navOrbit = document.getElementById('navOrbit');
const bubbles = [...(navOrbit ? navOrbit.querySelectorAll('.bubble') : document.querySelectorAll('.bubble'))];
// index bubbles for GL sync
bubbles.forEach((b, i) => b.dataset.orbIndex = String(i));
const errl = document.getElementById("errl");

// Nav orbit controls
let navOrbitSpeed = 0.25; // slowed default (0..2)
let navRadiusScale = 1.0; // 0.6..1.6

// Generic slider sweep helper: sweep across full [min,max]
function sweepSlider(el, phase){ if(!el) return; const min=parseFloat(el.min??'0')||0; const max=parseFloat(el.max??'1')||1; const step=parseFloat(el.step??'0.01')||0.01; const v = min + (max-min) * (0.5*(1+Math.sin(phase))); const decimals = step>=1?0:(String(step).split('.')[1]?.length||2); el.value = v.toFixed(decimals); el.dispatchEvent(new Event('input')); }
function sweepSliderMode(el, t, mode){ if(!el) return; const min=parseFloat(el.min??'0')||0; const max=parseFloat(el.max??'1')||1; const step=parseFloat(el.step??'0.01')||0.01; let p=0; if(mode==='loop'){ p = (t%1+1)%1; } else { p = 0.5*(1+Math.sin(t*2*Math.PI)); } const v=min+(max-min)*p; const decimals = step>=1?0:(String(step).split('.')[1]?.length||2); el.value=v.toFixed(decimals); el.dispatchEvent(new Event('input')); }

// Simple sticky physics for nav bubbles (stick + bounce)
let navStick=0.002, navDamp=0.92, navDrip=0.0, navFlow=1.0;
const navVel = new Map();
function updateBubbles(t) {
  const rect = errl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  bubbles.forEach((b, i) => {
    const baseAngle = parseFloat(b.dataset.angle);
    const dist = parseFloat(b.dataset.dist) * navRadiusScale;

    // orbit: direction alternates per bubble
    const angleDeg = baseAngle + (t * 0.00003 * navOrbitSpeed * navFlow * (window.GLOBAL_MOTION||1) * (i % 2 === 0 ? 1 : -1)) * 360;
    const rad = (angleDeg * Math.PI) / 180;

    let x = cx + Math.cos(rad) * dist;
    let y = cy + Math.sin(rad) * dist;
    // sticky forces among neighbors
    const v = navVel.get(b) || {vx:0, vy:0};
    for (let j=0;j<bubbles.length;j++){
      if (j===i) continue; const bj=bubbles[j]; const rx=parseFloat(bj.style.left)||0; const ry=parseFloat(bj.style.top)||0; const dx=rx - x, dy=ry - y; const d=Math.hypot(dx,dy)||1;
      const target = 86; // desired bubble spacing
      const diff = target - d; // positive => attract, negative => repel
      if (Math.abs(diff) < 60){ const k = navStick*diff; v.vx += (dx/d)*k; v.vy += (dy/d)*k; }
    }
    // damping and apply
    v.vx *= navDamp; v.vy *= navDamp; x += v.vx; y += v.vy + navDrip*0.3; navVel.set(b, v);

    b.style.left = x + "px";
    b.style.top = y + "px";
b.style.transform = `translate(-50%, -50%) scale(${window.NAV_ORB_SCALE||1})`;
  });

  // notify GL layer to sync orb positions
  if (window.errlGLSyncOrbs) window.errlGLSyncOrbs();
  requestAnimationFrame(updateBubbles);
}
requestAnimationFrame(updateBubbles);

// Nav Goo+ wiring
(function(){
  const w=document.getElementById('navWiggle');
  const f=document.getElementById('navFlow');
  const d=document.getElementById('navDrip');
  const v=document.getElementById('navVisc');
  function apply(){ navStick = 0.0005 + parseFloat(w?.value||0.6)*0.004; navFlow = parseFloat(f?.value||1.0); navDrip=parseFloat(d?.value||0.0); navDamp = 0.80 + (parseFloat(v?.value||0.9)*0.18); }
  ;[w,f,d,v].forEach(el=> el && el.addEventListener('input', apply)); apply();
})();

// hover -> GL orb squish
bubbles.forEach(b => {
  b.addEventListener('mouseenter', () => { if (window.errlGLOrbHover) window.errlGLOrbHover(+b.dataset.orbIndex, true); });
  b.addEventListener('mouseleave', () => { if (window.errlGLOrbHover) window.errlGLOrbHover(+b.dataset.orbIndex, false); });
});


// ===== Aura / goo color shift driven by panel sliders =====
const auraEl = document.getElementById("errlGoo");
const auraPulseSlider = document.getElementById("auraPulse");
const auraHueSlider = document.getElementById("auraHue");

function updateAura() {
  if (!auraPulseSlider || !auraHueSlider) return;
  const hue = auraHueSlider.value; // 0-360
  const pulse = parseFloat(auraPulseSlider.value); // 0-1

  // masked aura follows Errl shape
  const auraMask = document.getElementById('errlAuraMask');
  if (auraMask) {
    auraMask.style.background = `radial-gradient(circle at 50% 35%, hsla(${hue},100%,60%,${0.25 + pulse * 0.6}) 0%, rgba(0,0,0,0) 66%)`;
    auraMask.style.filter = `blur(${24 + Math.round(32*pulse)}px)`;
    auraMask.style.opacity = String(0.45 + 0.4*pulse);
  }
  // legacy oval goo (kept for fallback)
  if (auraEl && auraPulseSlider) {
    auraEl.style.background = `radial-gradient(circle at 50% 30%, hsla(${hue},100%,60%,${0.3 + pulse * 0.6}) 0%, rgba(0,0,0,0) 70%)`;
    const gooAnim = auraEl.getAnimations()[0];
    if (gooAnim) gooAnim.playbackRate = 0.5 + pulse * 1.5;
  }
}
if (auraPulseSlider && auraHueSlider){
  [auraPulseSlider, auraHueSlider].forEach(slider => slider.addEventListener("input", updateAura));
  updateAura();
}


// ===== Panel -> particles & nav bindings =====
const bgSpeed = document.getElementById("bgSpeed");
const bgDensity = document.getElementById("bgDensity");
const bgAlpha = document.getElementById("bgAlpha");
const navOrbitSpeedEl = document.getElementById('navOrbitSpeed');
const navRadiusEl = document.getElementById('navRadius');
const navOrbSizeEl = document.getElementById('navOrbSize');
const glOrbsToggle = document.getElementById('glOrbsToggle');
const rotateSkinsBtn = document.getElementById('rotateSkins');
const glAlphaEl = document.getElementById('glAlpha');
const glDXEl = document.getElementById('glDX');
const glDYEl = document.getElementById('glDY');
// BG bubbles advanced controls
const bubWobble = document.getElementById('bubWobble');
const bubFreq   = document.getElementById('bubFreq');
const bubMin    = document.getElementById('bubMin');
const bubMax    = document.getElementById('bubMax');
const bubFar    = document.getElementById('bubFar');
const bubSizeHz = document.getElementById('bubSizeHz');
const bubJumboPct = document.getElementById('bubJumboPct');
const bubJumboScale = document.getElementById('bubJumboScale');
const bubTexSel = document.getElementById('bubTex');
const bubApplyTex = document.getElementById('bubApplyTex');
const bubUpload = document.getElementById('bubUpload');
const bubUploadBtn = document.getElementById('bubUploadBtn');
const bubPresetSel = document.getElementById('bubPresetSel');
const bubPresetSave = document.getElementById('bubPresetSave');
const bubPresetApply = document.getElementById('bubPresetApply');

bgSpeed.addEventListener("input", () => {
  particleSpeedScale = parseFloat(bgSpeed.value);
  if (window.errlGLSetBubbles) window.errlGLSetBubbles({ speed: particleSpeedScale });
});

bgDensity.addEventListener("input", () => {
  particleDensityScale = parseFloat(bgDensity.value);
  initParticles();
  if (window.errlGLSetBubbles) window.errlGLSetBubbles({ density: particleDensityScale });
});

bgAlpha.addEventListener("input", () => {
  particleAlpha = parseFloat(bgAlpha.value);
  if (window.errlGLSetBubbles) window.errlGLSetBubbles({ alpha: particleAlpha });
});

navOrbitSpeedEl && navOrbitSpeedEl.addEventListener('input', ()=>{
  navOrbitSpeed = parseFloat(navOrbitSpeedEl.value);
});
navRadiusEl && navRadiusEl.addEventListener('input', ()=>{
  navRadiusScale = parseFloat(navRadiusEl.value);
});
navOrbSizeEl && navOrbSizeEl.addEventListener('input', ()=>{
  const s = Math.max(0.4, Math.min(2.0, parseFloat(navOrbSizeEl.value||'1')));
  window.NAV_ORB_SCALE = s;
  // update DOM bubbles immediately
  bubbles.forEach(b=>{ b.style.transform = `translate(-50%, -50%) scale(${s})`; });
  // update GL orbs if present
  if (window.errlGLSetOrbScale) window.errlGLSetOrbScale(s);
});

glOrbsToggle && glOrbsToggle.addEventListener('change', ()=>{
  if (glOrbsToggle.checked) {
    try { if (window.enableErrlGL) window.enableErrlGL(); } catch {}
  }
  if (window.errlGLShowOrbs) window.errlGLShowOrbs(glOrbsToggle.checked);
});

// Nav orbit/radius animation
(function navAnim(){
  const btn = document.getElementById('navAnimate');
  const spd = document.getElementById('navAnimSpeed');
  let mode='ping';
  const bLoop=document.getElementById('navModeLoop');
  const bPing=document.getElementById('navModePing');
  if(bLoop) bLoop.addEventListener('click', ()=>{ mode='loop'; bLoop.classList.add('active'); bPing?.classList.remove('active'); });
  if(bPing) bPing.addEventListener('click', ()=>{ mode='ping'; bPing.classList.add('active'); bLoop?.classList.remove('active'); });
  let on=false, t=0;
  function tick(){ if(!on) return; t += 0.016 * (parseFloat(spd?.value||'0.10')||0.10);
    sweepSliderMode(navOrbitSpeedEl, t*0.2, mode);
    sweepSliderMode(navRadiusEl, t*0.2, mode);
    requestAnimationFrame(tick);
  }
  btn && btn.addEventListener('click', ()=>{ on=!on; btn.classList.toggle('animating', on); if(on) requestAnimationFrame(tick); });
})();

// Texture skins for nav bubbles with robust path + fallback
(function(){
  function assetsBases(){
    // Ordered by canonical location first; avoid import.meta for file://
    const bases = [];
    if (location.pathname.includes('/errl-portal/')) bases.push('/errl-portal/assets/Bubbles_ErrlSiteDecor');
    bases.push('./assets/Bubbles_ErrlSiteDecor');
    bases.push('./portal/assets/Bubbles_ErrlSiteDecor'); // legacy transitional
    return bases;
  }
  function trySkin(b, idx){
    const bases = assetsBases();
    let i=0;
    const next=()=>{
      if(i>=bases.length){ b.style.backgroundImage=''; b.classList.add('menuOrb'); return; }
      const url = `${bases[i]}/Bubbles-${idx}.png`;
      const im = new Image();
      im.onload=()=>{ b.classList.remove('menuOrb'); b.style.backgroundImage=`url("${url}")`; b.style.backgroundPosition='center'; b.style.backgroundRepeat='no-repeat'; b.style.backgroundSize='120%'; };
      im.onerror=()=>{ i++; next(); };
      im.src=url;
    };
    next();
  }
  const NAV_SKINS = [1,2,3,4,5,6];
  function assignSkins(start){
    for (let i=0;i<bubbles.length;i++){
      const idx = NAV_SKINS[(start+i)%NAV_SKINS.length];
      trySkin(bubbles[i], idx);
    }
  }
  let start = +(localStorage.getItem('nav_skin_idx')||0);
  assignSkins(start);
  rotateSkinsBtn && rotateSkinsBtn.addEventListener('click', ()=>{
    start = (start+1) % NAV_SKINS.length; localStorage.setItem('nav_skin_idx', String(start)); assignSkins(start);
  });
})();

// Mood state machine
(function moods(){
  const ENABLED = false; // temporarily disabled per request
  const defs = {
    calm:    { overlay:{alpha:0.18, dx:16, dy:12}, orbit:0.8, particles:0.6, hue:{layer:'backGlow', hue:200, sat:1.0, inten:0.8} },
    curious: { overlay:{alpha:0.22, dx:24, dy:16}, orbit:1.1, particles:0.9, hue:{layer:'nav', hue:160, sat:1.1, inten:1.0}, headTilt: 4 },
    excited: { overlay:{alpha:0.26, dx:36, dy:24}, orbit:1.5, particles:1.2, hue:{layer:'glOverlay', hue:25, sat:1.25, inten:1.0} },
    anxious: { overlay:{alpha:0.30, dx:52, dy:34}, orbit:1.9, particles:1.4, hue:{layer:'backGlow', hue:260, sat:0.9, inten:0.9}, jitter:true }
  };
  let current = localStorage.getItem('errlMood2') || 'calm';
  const reduce = document.getElementById('prefReduce') || {checked:false};
  function apply(name){
    const m = defs[name] || defs.calm; current = name; localStorage.setItem('errlMood2', name);
    if (window.errlGLSetOverlay) window.errlGLSetOverlay({ alpha:m.overlay.alpha, dx:m.overlay.dx, dy:m.overlay.dy });
    navOrbitSpeed = m.orbit * (reduce.checked? 0.4 : 1.0);
    particleSpeedScale = m.particles * (reduce.checked? 0.5 : 1.0);
    if (window.ErrlHueController){ const hc = window.ErrlHueController; hc.setTarget(m.hue.layer); hc.setHueTemp(m.hue.hue, m.hue.layer); hc.setSaturationTemp(m.hue.sat, m.hue.layer); hc.setIntensityTemp(m.hue.inten, m.hue.layer); }
    if (window.errlGLSetMood) window.errlGLSetMood(name==='excited'?'neon':(name==='anxious'?'alert':'calm'));
  }
  if (ENABLED) {
    document.querySelectorAll('.moodBtn2').forEach(b=> b.addEventListener('click', ()=> apply(b.dataset.mood2)));
    window.requestAnimationFrame(()=> apply(current));
  }
})();

// Randomize buttons
(function randomizers(){
  const R=(min,max)=> min + Math.random()*(max-min);
  const rbBtn=document.getElementById('rbRandom'); if(rbBtn) rbBtn.addEventListener('click', ()=>{
    ['rbSpeed','rbDensity','rbAlpha','rbWobble','rbFreq','rbMin','rbMax','rbJumboPct','rbJumboScale','rbSizeHz'].forEach(id=>{ const el=document.getElementById(id); if(!el) return; const map={rbSpeed:R(0.4,2.2), rbDensity:R(0.5,1.8), rbAlpha:R(0.6,1), rbWobble:R(0,2), rbFreq:R(0.4,2), rbMin:Math.round(R(10,22)), rbMax:Math.round(R(28,52)), rbJumboPct:R(0,0.4), rbJumboScale:R(1.1,2.2), rbSizeHz:R(0,0.6)}; el.value = map[id].toFixed(el.type==='number'?0:2); el.dispatchEvent(new Event('input')); });
  });
  const glbBtn=document.getElementById('glbRandom'); if(glbBtn) glbBtn.addEventListener('click', ()=>{
    const S=document.getElementById('bgSpeed'), D=document.getElementById('bgDensity'), A=document.getElementById('bgAlpha'); if(S){ S.value=R(0.4,2.2).toFixed(2); S.dispatchEvent(new Event('input')); } if(D){ D.value=R(0.4,1.5).toFixed(2); D.dispatchEvent(new Event('input')); } if(A){ A.value=R(0.5,1).toFixed(2); A.dispatchEvent(new Event('input')); }
  });
const nv=document.getElementById('navRandom'); if(nv) nv.addEventListener('click', ()=>{
    const o=document.getElementById('navOrbitSpeed'), r=document.getElementById('navRadius'), sz=document.getElementById('navOrbSize'); if(o){ o.value=R(0.6,1.6).toFixed(2); o.dispatchEvent(new Event('input')); } if(r){ r.value=R(0.7,1.4).toFixed(2); r.dispatchEvent(new Event('input')); } if(sz){ sz.value=R(0.7,1.4).toFixed(2); sz.dispatchEvent(new Event('input')); }
    const w=document.getElementById('navWiggle'), f=document.getElementById('navFlow'), d=document.getElementById('navDrip'), v=document.getElementById('navVisc');
    if(w){ w.value=R(0.2,1.0).toFixed(2); w.dispatchEvent(new Event('input')); }
    if(f){ f.value=R(0.6,1.6).toFixed(2); f.dispatchEvent(new Event('input')); }
    if(d){ d.value=R(-0.2,0.2).toFixed(2); d.dispatchEvent(new Event('input')); }
    if(v){ v.value=R(0.6,1.0).toFixed(2); v.dispatchEvent(new Event('input')); }
  });
  const gr=document.getElementById('overlayRandom'); if(gr) gr.addEventListener('click', ()=>{ const a=document.getElementById('glAlpha'), dx=document.getElementById('glDX'), dy=document.getElementById('glDY'); if(a){ a.value=R(0.05,0.35).toFixed(2); a.dispatchEvent(new Event('input')); } if(dx){ dx.value=Math.round(R(6,56)); dx.dispatchEvent(new Event('input')); } if(dy){ dy.value=Math.round(R(6,56)); dy.dispatchEvent(new Event('input')); } });
  const hr=document.getElementById('hueRandom'); if(hr) hr.addEventListener('click', ()=>{ const H=document.getElementById('hueShift'), S=document.getElementById('hueSat'), I=document.getElementById('hueInt'); if(H){ H.value=Math.round(R(0,360)); H.dispatchEvent(new Event('input')); } if(S){ S.value=R(0.6,1.6).toFixed(2); S.dispatchEvent(new Event('input')); } if(I){ I.value=R(0.5,1).toFixed(2); I.dispatchEvent(new Event('input')); } });
})();

// GL overlay bindings (ensure GL active)
function ensureGL(){ try{ if(window.enableErrlGL) window.enableErrlGL(); }catch{} }
if (glAlphaEl) glAlphaEl.addEventListener('input', ()=>{ ensureGL(); if(window.errlGLSetOverlay) window.errlGLSetOverlay({ alpha: parseFloat(glAlphaEl.value) }); });
if (glDXEl) glDXEl.addEventListener('input', ()=>{ ensureGL(); if(window.errlGLSetOverlay) window.errlGLSetOverlay({ dx: parseFloat(glDXEl.value) }); });
if (glDYEl) glDYEl.addEventListener('input', ()=>{ ensureGL(); if(window.errlGLSetOverlay) window.errlGLSetOverlay({ dy: parseFloat(glDYEl.value) }); });

// BG bubbles advanced bindings
function pushBubblesPatch(){
  if (!window.errlGLSetBubbles) return;
  window.errlGLSetBubbles({
    wobble: bubWobble? parseFloat(bubWobble.value): undefined,
    freq:   bubFreq? parseFloat(bubFreq.value): undefined,
    minSize: bubMin? parseFloat(bubMin.value): undefined,
    maxSize: bubMax? parseFloat(bubMax.value): undefined,
    farRatio: bubFar? parseFloat(bubFar.value): undefined,
    sizeJitterFreq: bubSizeHz? parseFloat(bubSizeHz.value): undefined,
    jumboChance: bubJumboPct? parseFloat(bubJumboPct.value): undefined,
    jumboScale: bubJumboScale? parseFloat(bubJumboScale.value): undefined,
  });
}
[bubWobble,bubFreq,bubMin,bubMax,bubFar,bubSizeHz,bubJumboPct,bubJumboScale].forEach(el=> el && el.addEventListener('input', pushBubblesPatch));

// Texture controls (global)
if (bubUploadBtn && bubUpload) {
  bubUploadBtn.addEventListener('click', ()=> bubUpload.click());
  bubUpload.addEventListener('change', ()=>{
    const f = bubUpload.files && bubUpload.files[0]; if(!f) return;
    const url = URL.createObjectURL(f);
    if (window.errlGLSetBubblesTexture) window.errlGLSetBubblesTexture('custom', url);
  });
}
if (bubApplyTex && bubTexSel) {
  bubApplyTex.addEventListener('click', ()=>{
    const v = bubTexSel.value;
    if (window.errlGLSetBubblesTexture) window.errlGLSetBubblesTexture(v, null);
  });
}
// Per-layer textures
(function texLayers(){
  const defs=[
    {sel:'A', idx:0},
    {sel:'B', idx:1},
    {sel:'C', idx:2},
  ];
  defs.forEach(({sel, idx})=>{
    const S=document.getElementById('bubTex'+sel), A=document.getElementById('bubApplyTex'+sel), U=document.getElementById('bubUpload'+sel), UB=document.getElementById('bubUploadBtn'+sel);
    if(UB && U){ UB.addEventListener('click', ()=> U.click()); U.addEventListener('change', ()=>{ const f=U.files && U.files[0]; if(!f) return; const url=URL.createObjectURL(f); window.errlGLSetBubblesLayerTexture && window.errlGLSetBubblesLayerTexture(idx,'custom',url); }); }
    if(A && S){ A.addEventListener('click', ()=>{ const v=S.value; window.errlGLSetBubblesLayerTexture && window.errlGLSetBubblesLayerTexture(idx, v, null); }); }
  });
})();

// GLB Particles per-control animate buttons
(function glbAnim(){
  const btnS=document.getElementById('glbAnimSpeedBtn');
  const btnD=document.getElementById('glbAnimDensityBtn');
  const btnA=document.getElementById('glbAnimAlphaBtn');
  const rateS=document.getElementById('glbAnimSpeedRate');
  const rateD=document.getElementById('glbAnimDensityRate');
  const rateA=document.getElementById('glbAnimAlphaRate');
  // mode buttons
  let modeS='ping', modeD='ping', modeA='ping';
  const sLoop=document.getElementById('glbModeSpeedLoop'); const sPing=document.getElementById('glbModeSpeedPing');
  const dLoop=document.getElementById('glbModeDensityLoop'); const dPing=document.getElementById('glbModeDensityPing');
  const aLoop=document.getElementById('glbModeAlphaLoop'); const aPing=document.getElementById('glbModeAlphaPing');
  function hookMode(btnLoop, btnPing, set){ if(btnLoop) btnLoop.addEventListener('click', ()=>{ set('loop'); btnLoop.classList.add('active'); btnPing?.classList.remove('active'); }); if(btnPing) btnPing.addEventListener('click', ()=>{ set('ping'); btnPing.classList.add('active'); btnLoop?.classList.remove('active'); }); }
  hookMode(sLoop, sPing, (m)=> modeS=m);
  hookMode(dLoop, dPing, (m)=> modeD=m);
  hookMode(aLoop, aPing, (m)=> modeA=m);
  let runS=false, runD=false, runA=false, tS=0, tD=0, tA=0;
  function loop(){ if(!(runS||runD||runA)) return;
    if(runS){ tS += 0.016 * (parseFloat(rateS?.value||'0.2')||0.2); sweepSliderMode(bgSpeed, tS*0.2, modeS); }
    if(runD){ tD += 0.016 * (parseFloat(rateD?.value||'0.2')||0.2); sweepSliderMode(bgDensity, tD*0.2, modeD); }
    if(runA){ tA += 0.016 * (parseFloat(rateA?.value||'0.2')||0.2); sweepSliderMode(bgAlpha, tA*0.2, modeA); }
    requestAnimationFrame(loop);
  }
  function toggle(which){ if(which==='s'){ runS=!runS; btnS.classList.toggle('animating', runS); }
    if(which==='d'){ runD=!runD; btnD.classList.toggle('animating', runD); }
    if(which==='a'){ runA=!runA; btnA.classList.toggle('animating', runA); }
    if(runS||runD||runA) requestAnimationFrame(loop);
  }
  btnS && btnS.addEventListener('click', ()=> toggle('s'));
  btnD && btnD.addEventListener('click', ()=> toggle('d'));
  btnA && btnA.addEventListener('click', ()=> toggle('a'));
})();

// Rising Bubbles bindings
(function rbBind(){
  const speed = document.getElementById('rbSpeed');
  const dens  = document.getElementById('rbDensity');
  const alpha = document.getElementById('rbAlpha');
  const wob   = document.getElementById('rbWobble');
  const freq  = document.getElementById('rbFreq');
  const smin  = document.getElementById('rbMin');
  const smax  = document.getElementById('rbMax');
  const szHz  = document.getElementById('rbSizeHz');
  const jPct  = document.getElementById('rbJumboPct');
  const jSc   = document.getElementById('rbJumboScale');
  // RB goo controls
  const gAmp=document.getElementById('rbWiggle');
  const gSpd=document.getElementById('rbFlow');
  const gDrip=document.getElementById('rbDrip');
  const gVisc=document.getElementById('rbVisc');
  const gBlur=document.getElementById('rbBlur');
  RB.goo = RB.goo || { amp:0.8, flow:0.4, drip:0.0, visc:0.5, blur:6 };
  // only rebuild when count/size bounds change to prevent stutter during animation
  let last = { density: RB.density, min: RB.minSize, max: RB.maxSize };
  function apply(){ RB.speed=parseFloat(speed.value); RB.density=parseFloat(dens.value); RB.alpha=parseFloat(alpha.value); RB.wobble=parseFloat(wob.value); RB.freq=parseFloat(freq.value); RB.minSize=parseFloat(smin.value); RB.maxSize=parseFloat(smax.value); RB.sizeHz=parseFloat(szHz.value); RB.jumboChance=parseFloat(jPct.value); RB.jumboScale=parseFloat(jSc.value);
    const need = (last.density!==RB.density) || (last.min!==RB.minSize) || (last.max!==RB.maxSize);
    if (need){ last = { density: RB.density, min: RB.minSize, max: RB.maxSize }; rbRebuild(); }
  }
  ;[speed,dens,alpha,wob,freq,smin,smax,szHz,jPct,jSc].forEach(el=> el && el.addEventListener('input', apply));
  function applyGoo(){
    RB.goo.amp  = parseFloat((gAmp?.value  ?? RB.goo.amp));
    RB.goo.flow = parseFloat((gSpd?.value  ?? RB.goo.flow));
    RB.goo.drip = parseFloat((gDrip?.value ?? RB.goo.drip));
    RB.goo.visc = parseFloat((gVisc?.value ?? RB.goo.visc));
    RB.goo.blur = parseFloat((gBlur?.value ?? RB.goo.blur));
  }
  ;[gAmp,gSpd,gDrip,gVisc,gBlur].forEach(el=> el && el.addEventListener('input', applyGoo)); applyGoo();
  // Advanced animate for wobble/freq
(function rbAdvAnim(){
    const btn=document.getElementById('rbAdvAnimate');
    const spd=document.getElementById('rbAdvAnimSpeed');
    let mode='ping';
    const bLoop=document.getElementById('rbAdvModeLoop');
    const bPing=document.getElementById('rbAdvModePing');
    if(bLoop) bLoop.addEventListener('click', ()=>{ mode='loop'; bLoop.classList.add('active'); bPing?.classList.remove('active'); });
    if(bPing) bPing.addEventListener('click', ()=>{ mode='ping'; bPing.classList.add('active'); bLoop?.classList.remove('active'); });
    let on=false, t=0;
    function tick(){ if(!on) return; t+=0.016*(parseFloat(spd?.value||'0.10')||0.10);
      sweepSliderMode(wob, t*0.2, mode);
      sweepSliderMode(freq, t*0.2, mode);
      requestAnimationFrame(tick);
    }
    btn && btn.addEventListener('click', ()=>{ on=!on; btn.classList.toggle('animating', on); if(on) requestAnimationFrame(tick); });
  })();
  // per-layer textures
  [{sel:'A',idx:0},{sel:'B',idx:1}].forEach(({sel,idx})=>{
    const S=document.getElementById('rbTex'+sel), A=document.getElementById('rbApplyTex'+sel), U=document.getElementById('rbUpload'+sel), UB=document.getElementById('rbUploadBtn'+sel);
    if(UB && U){ UB.addEventListener('click', ()=> U.click()); U.addEventListener('change', ()=>{ const f=U.files && U.files[0]; if(!f) return; const url=URL.createObjectURL(f); const im=new Image(); im.src=url; im.onload=()=>{ RB.layers[idx].tex=[im]; rbRebuild(); }; }); }
    if(A && S){ A.addEventListener('click', ()=>{ const v=S.value; if(v==='pack'){ RB.layers[idx].tex = rbTexFromPack(); } else if(v==='proc'){ RB.layers[idx].tex = [rbMakeProc()]; } rbRebuild(); }); }
  });
})();

// Quick shock burst for rising bubbles (fallback if GL not present)
window.rbShockBurst = function(){
  const cx = innerWidth/2, cy = innerHeight/2;
  for(let i=0;i<140;i++){
    RB.items.push({ x: cx, y: cy, vx: (Math.random()-0.5)*2.2, vy: -(0.8+Math.random()*1.4), size: 12+Math.random()*18, baseSize: 16, phase: Math.random()*Math.PI*2, tex: (RB.layers[0].tex&&RB.layers[0].tex[0])||null, layer:0 });
  }
  setTimeout(()=>{ RB.items.splice(0, 140); }, 1200);
};

// Presets (stored in localStorage)
(function presets(){
  if(!bubPresetSel) return;
  const KEY='errl_bub_presets';
  const builtin={
    Calm:{ speed:0.6, density:0.8, alpha:0.85, wobble:0.6, freq:0.7, minSize:14, maxSize:34, farRatio:0.4, sizeJitterFreq:0.0 },
    Neon:{ speed:1.2, density:1.2, alpha:0.95, wobble:1.3, freq:1.2, minSize:16, maxSize:46, farRatio:0.33, sizeJitterFreq:0.2, jumboChance:0.12, jumboScale:1.7 },
    Dense:{ speed:0.9, density:1.5, alpha:0.9, wobble:1.0, freq:1.0, minSize:12, maxSize:38, farRatio:0.28 },
  };
  function load(){ try{ return Object.assign({}, builtin, JSON.parse(localStorage.getItem(KEY)||'{}')); }catch{ return {...builtin}; } }
  function save(map){ try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch{}
  }
  function fill(){ const map=load(); bubPresetSel.innerHTML=''; Object.keys(map).forEach(name=>{ const o=document.createElement('option'); o.value=name; o.textContent=name; bubPresetSel.appendChild(o); }); }
  function currentParams(){
    return {
      speed: parseFloat(bgSpeed.value), density: parseFloat(bgDensity.value), alpha: parseFloat(bgAlpha.value),
      wobble: parseFloat(bubWobble.value), freq: parseFloat(bubFreq.value),
      minSize: parseFloat(bubMin.value), maxSize: parseFloat(bubMax.value), farRatio: parseFloat(bubFar.value),
      sizeJitterFreq: parseFloat(bubSizeHz.value), jumboChance: parseFloat(bubJumboPct.value), jumboScale: parseFloat(bubJumboScale.value),
    };
  }
  function applyParams(p){
    if('speed' in p){ bgSpeed.value=p.speed; bgSpeed.dispatchEvent(new Event('input')); }
    if('density' in p){ bgDensity.value=p.density; bgDensity.dispatchEvent(new Event('input')); }
    if('alpha' in p){ bgAlpha.value=p.alpha; bgAlpha.dispatchEvent(new Event('input')); }
    if('wobble' in p){ bubWobble.value=p.wobble; }
    if('freq' in p){ bubFreq.value=p.freq; }
    if('minSize' in p){ bubMin.value=p.minSize; }
    if('maxSize' in p){ bubMax.value=p.maxSize; }
    if('farRatio' in p){ bubFar.value=p.farRatio; }
    if('sizeJitterFreq' in p){ bubSizeHz.value=p.sizeJitterFreq; }
    if('jumboChance' in p){ bubJumboPct.value=p.jumboChance; }
    if('jumboScale' in p){ bubJumboScale.value=p.jumboScale; }
    pushBubblesPatch();
  }
  fill();
  bubPresetApply && bubPresetApply.addEventListener('click', ()=>{ const map=load(); const name=bubPresetSel.value; const p=map[name]; if(p) applyParams(p); });
  bubPresetSave && bubPresetSave.addEventListener('click', ()=>{ const name=prompt('Preset name:'); if(!name) return; const map=load(); map[name]=currentParams(); save(map); fill(); bubPresetSel.value=name; });
})();

document.getElementById("burstBtn").addEventListener("click", () => {
  if (document.body.dataset.errlMode === 'errl' && typeof window.errlGLBurst === 'function') {
    window.errlGLBurst();
  } else {
    // Use the DNA burst on the BG particles (more controllable than RB canvas)
    burstParticlesDNA();
  }
});

// Dev exports: PNG snapshot + export HTML with current phone settings
(function devExports(){
  const pngBtn = document.getElementById('snapshotPngBtn');
  const expBtn = document.getElementById('exportHtmlBtn');
  function fileStamp(){
    const v = (window.ERRL_BUILD_VERSION || 'v0');
    const d = new Date();
    const pad = (n)=> String(n).padStart(2,'0');
    const tag = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}`;
    return `${v}_${tag}`;
  }
  if (pngBtn) pngBtn.addEventListener('click', ()=>{
    try {
      const url = (window.errlGLScreenshot && window.errlGLScreenshot()) || (canvas && canvas.toDataURL && canvas.toDataURL('image/png'));
      if(!url) throw new Error('No canvas or GL screenshot available');
      const a = document.createElement('a');
      a.href = url; a.download = `errl-portal_${fileStamp()}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch(e){ console.warn('Snapshot failed', e); }
  });
  if (expBtn) expBtn.addEventListener('click', ()=>{
    try{
      const state = {
        hue: (window.ErrlHueController && window.ErrlHueController.layers) || null,
        mode: document.body.dataset.errlMode || 'stable',
        prefs: {
          reduce: localStorage.getItem('prefReduce'),
          contrast: localStorage.getItem('prefContrast'),
        }
      };
      const html = document.documentElement.cloneNode(true);
      const inject = document.createElement('script');
      inject.textContent = `try{ localStorage.setItem('errl_hue_layers', ${JSON.stringify(JSON.stringify(state.hue))}); }catch{}; try{ if(${JSON.stringify(state.prefs.reduce)}!=null) localStorage.setItem('prefReduce', ${JSON.stringify(state.prefs.reduce)}); if(${JSON.stringify(state.prefs.contrast)}!=null) localStorage.setItem('prefContrast', ${JSON.stringify(state.prefs.contrast)}); }catch{}; document.addEventListener('DOMContentLoaded', function(){ try{ document.body.dataset.errlMode = ${JSON.stringify(state.mode)}; }catch{} });`;
      const body = html.querySelector('body'); body && body.appendChild(inject);
      const blob = new Blob(["<!DOCTYPE html>\n" + html.outerHTML], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`errl-portal_${fileStamp()}.html`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=> URL.revokeObjectURL(url), 2000);
    }catch(e){ console.warn('Export failed', e); }
  });
})();

// Errl goo controls + mask binds to Errl SVG src
(function gooCtrls(){
  const goo=document.getElementById('errlGoo');
  const mask=document.getElementById('errlAuraMask');
  const targetImg=document.getElementById('errlCenter');
  // Classic CSS/SVG goo nodes + controls
  const classicNoise = document.getElementById('classicGooNoise');
  const classicDisp  = document.getElementById('classicGooDisp');
  const classicVisc  = document.getElementById('classicGooVisc');
  const classicDrip  = document.getElementById('classicGooDrip');
  const cOn   = document.getElementById('classicGooEnabled');
  const cStr  = document.getElementById('classicGooStrength');
  const cWob  = document.getElementById('classicGooWobble');
  const cSpd  = document.getElementById('classicGooSpeed');
  const cAnim = document.getElementById('classicGooAnimate');
  const cRand = document.getElementById('classicGooRandom');
  const sizeSlider = document.getElementById('errlSize');

  // helper to set/remove SVG filter reliably
  function setFilterOnTarget(){
    const classicOn = cOn ? cOn.checked : true;
    if (targetImg){
      // Prefer class-based filter to match working Pixi/GL variant
      targetImg.classList.toggle('goo', !!classicOn);
      // Fallback explicit style for engines that ignore class
      const val = classicOn ? 'url(#classicGoo)' : 'none';
      targetImg.style.filter = val; targetImg.style.webkitFilter = val; targetImg.style.opacity = '1';
    }
  }

  let wobblePhase = 0; let animOn = true; // animate classic by default
  let uiAnimOn = false, uiPhase = 0;
  function uiAnimLoop(){
    if(!uiAnimOn) return;
    uiPhase += 0.016 * uiSpeed;
    // sweep full ranges
    sweepSlider(cStr, uiPhase*0.6);
    sweepSlider(cWob, uiPhase*0.5+1.2);
    if(cSpd){ const v = 0.6 + 0.40*Math.sin(uiPhase*0.7 + 2.3); cSpd.value = v.toFixed(2); cSpd.dispatchEvent(new Event('input')); }
    requestAnimationFrame(uiAnimLoop);
  }
const uiSpeedEl = document.getElementById('classicGooAnimSpeed');
  let uiSpeed = parseFloat(uiSpeedEl?.value||'0.3')||0.3;
  uiSpeedEl && uiSpeedEl.addEventListener('change', ()=>{ uiSpeed = parseFloat(uiSpeedEl.value||'0.3')||0.3; });
if(cAnim){ cAnim.addEventListener('click', ()=>{ animOn = !animOn; uiAnimOn = !uiAnimOn; cAnim.classList.toggle('animating', uiAnimOn); if(uiAnimOn) requestAnimationFrame(uiAnimLoop); }); }
  // bump buttons for classic goo
  (function(){ const dec=document.getElementById('classicGooAnimDec'), inc=document.getElementById('classicGooAnimInc'), inp=document.getElementById('classicGooAnimSpeed');
    if(!inp) return; const step=parseFloat(inp.step||'0.05')||0.05; const mn=parseFloat(inp.min||'0.05'), mx=parseFloat(inp.max||'2'); const d=(step.toString().split('.')[1]||'').length; const clamp=(v)=> Math.min(mx, Math.max(mn, parseFloat(v.toFixed(d))));
    dec && dec.addEventListener('click', ()=>{ inp.value = String(clamp(parseFloat(inp.value||String(mn)) - step)); inp.dispatchEvent(new Event('change')); });
    inc && inc.addEventListener('click', ()=>{ inp.value = String(clamp(parseFloat(inp.value||String(mn)) + step)); inp.dispatchEvent(new Event('change')); });
  })();
  if(cRand){ cRand.addEventListener('click', ()=>{
      if(classicNoise){ classicNoise.setAttribute('seed', String(2+Math.floor(Math.random()*1000))); }
      if(cStr){ cStr.value = (0.6 + Math.random()*1.4).toFixed(2); }
      if(cWob){ cWob.value = (0.6 + Math.random()*1.4).toFixed(2); }
      if(cSpd){ cSpd.value = (0.6 + Math.random()*1.2).toFixed(2); }
      applyClassic();
    });
  }

  function raf(){
    // Classic wobble + flow
    const spd = parseFloat(cSpd?.value||1.0);
    if(classicNoise){
      const wobSp = (parseFloat(cWob?.value||1.0)) * (0.6 + 1.2*spd);
      if(animOn){ wobblePhase += 0.016 * wobSp; }
      const bx = 0.0035 + 0.0045*Math.sin(wobblePhase*1.1);
      const by = 0.0050 + 0.0060*Math.cos(wobblePhase*0.9);
      classicNoise.setAttribute('baseFrequency', `${bx.toFixed(4)} ${by.toFixed(4)}`);
    }
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  function applyClassic(){
    const enabled = cOn ? cOn.checked : true;
    const wig = parseFloat(cStr?.value||'1.0');
    const visc = 0.35; // fixed smoothing for public classic
    const drip = 0.12; // gentle downward bias by default
    // wiggle amplitude via displacement scale (reduced by viscosity)
    if(classicDisp){ const k = 12 * wig * (1.0 - 0.5*visc); classicDisp.setAttribute('scale', String(Math.max(0,k))); }
    // viscosity smooths noise
    if(classicVisc){ const sdev = 0 + 3.0*visc; classicVisc.setAttribute('stdDeviation', sdev.toFixed(2)); }
    // drip biases downward
    if(classicDrip){ const dy = 0 + 28.0 * drip; classicDrip.setAttribute('dy', dy.toFixed(2)); }
    setFilterOnTarget();
  }

  function apply(){
    // Hide legacy aura/mask visual if present
    if(mask){ mask.style.display = 'none'; }
    if(goo){ goo.style.display = 'none'; }
    // Apply classic filter state and show/hide DOM Errl appropriately
    setFilterOnTarget();
  }
  ;[cOn,cStr,cWob,cSpd].forEach(el=> el && el.addEventListener('input', ()=>{ applyClassic(); }));
  // size control (scale the visible Errl image)
  if (sizeSlider && targetImg){
    const applySize=()=>{ const s=parseFloat(sizeSlider.value||'1'); targetImg.style.transformOrigin='center'; targetImg.style.transform = `scale(${s})`; };
    sizeSlider.addEventListener('input', applySize); applySize();
  }
  applyClassic();
  apply();
})();

// Particle-driven input (RB): attract/repel + shockwave
(function rbInput(){
  if(!window.addEventListener) return;
  const attractEl=document.getElementById('rbAttract');
  const rippleEl=document.getElementById('rbRipples');
  const rings=[];
  let pointer={x:innerWidth/2, y:innerHeight/2};
  addEventListener('pointermove', (e)=>{ pointer.x=e.clientX; pointer.y=e.clientY; });
  addEventListener('click', ()=>{ if(!rippleEl||!rippleEl.checked) return; rings.push({x:pointer.x,y:pointer.y,r:4, t:0}); });
  const oldAdvance = RB && RB.items ? null : null;
  // integrate into rbDraw: adjust velocities
  const origDraw = rbDraw;
  window.rbDraw = function(){ rctx.clearRect(0,0,innerWidth,innerHeight); rctx.globalAlpha = RB.alpha; rctx.globalCompositeOperation='lighter'; rctx.shadowBlur = RB.goo ? RB.goo.blur : 6;
    // update rings
    for(const ring of rings){ ring.r += 6; ring.t += 1; }
    while(rings.length && rings[0].r>Math.max(innerWidth,innerHeight)) rings.shift();
    const attract = !attractEl || attractEl.checked;
    for(const it of RB.items){
      const dx = pointer.x - it.x, dy = pointer.y - it.y; const d = Math.hypot(dx,dy)||1;
      const forceBase = Math.max(0, 140-d)/140 * 0.6;
      const visc = (RB.goo? RB.goo.visc:0.5);
      const force = (attract? 1 : -1) * forceBase * (1.0 - visc*0.7);
      it.x += (dx/d) * force; it.y += (dy/d) * force;
      for(const ring of rings){ const rd=Math.hypot(it.x-ring.x, it.y-ring.y); const edge = Math.abs(rd - ring.r); if(edge<18){ const k = (18-edge)/18 * 3.2 * (1.0 - visc*0.6); const rx=(it.x-ring.x)/(rd||1), ry=(it.y-ring.y)/(rd||1); it.x += rx*k; it.y += ry*k; } }
      // drip bias
      it.y += (RB.goo? RB.goo.drip:0.0);
    }
    // draw same as before with goo amp/flow
    const flow = (RB.goo? (0.6 + RB.goo.flow*1.4) : 1.0);
    const ampF = (RB.goo? (0.5 + RB.goo.amp*1.5) : 1.0);
    for(const it of RB.items){ const wob = Math.sin((it.phase += 0.02*RB.freq*flow*(window.GLOBAL_MOTION||1))) * 1.2 * RB.wobble * ampF; it.x += wob; it.y += it.vy * RB.speed * flow * (window.GLOBAL_MOTION||1); if (RB.sizeHz>0){ const k=1+0.12*Math.sin(it.phase*RB.sizeHz*3.2); it.size = it.baseSize*k; } if (it.y < -80){ it.y = innerHeight + 40 + Math.random()*80; it.x = Math.random()*innerWidth; } const s=it.size; if (it.tex instanceof HTMLImageElement && it.tex.complete) rctx.drawImage(it.tex, Math.round(it.x - s/2), Math.round(it.y - s/2), s, s); else if (it.tex && it.tex.getContext) rctx.drawImage(it.tex, Math.round(it.x - s/2), Math.round(it.y - s/2), s, s); else { const grd=rctx.createRadialGradient(it.x-0.1*s,it.y-0.12*s, s*0.05, it.x, it.y, s*0.5); grd.addColorStop(0,'rgba(255,255,255,0.95)'); grd.addColorStop(0.25,'rgba(130,200,255,0.8)'); grd.addColorStop(0.7,'rgba(110,160,255,0.35)'); grd.addColorStop(1,'rgba(110,160,255,0)'); rctx.fillStyle=grd; rctx.beginPath(); rctx.arc(it.x,it.y,s*0.5,0,Math.PI*2); rctx.fill(); } }
    requestAnimationFrame(rbDraw);
  };
})();

// ===== Shimmer toggle =====
const shimmerToggle = document.getElementById('shimmerToggle');
if (shimmerToggle) {
  shimmerToggle.addEventListener('change', () => {
    const root = document.querySelector('.errl-bg');
    if (!root && shimmerToggle.checked) {
      if (window.ErrlBG && typeof ErrlBG.mount === 'function') {
        ErrlBG.mount({ headerVariant: 2, shimmer: true, parallax: true, hud: false, basePath: '../src' });
      }
    } else if (root) {
      root.style.display = shimmerToggle.checked ? 'block' : 'none';
    }
  });
}

// ===== Audio engine =====
(function audio(){
  const toggle = document.getElementById('audioEnabled');
  const master = document.getElementById('audioMaster');
  const A = { ctx:null, master:null, sub:null, subGain:null, enabled:false };
  function noiseBuffer(ctx){ const len=ctx.sampleRate*0.2; const buf=ctx.createBuffer(1, len, ctx.sampleRate); const data=buf.getChannelData(0); for(let i=0;i<len;i++){ data[i]=(Math.random()*2-1)*Math.pow(1-i/len,2); } return buf; }
  function ensure(){ if(A.ctx) return; const C=window.AudioContext||window.webkitAudioContext; if(!C) return; A.ctx=new C(); A.master=A.ctx.createGain(); A.master.gain.value = parseFloat(master?.value||0.4);
    // compressor + low-shelf bass EQ + gentle lowpass
    const comp=A.ctx.createDynamicsCompressor(); comp.threshold.value=-24; comp.knee.value=30; comp.ratio.value=4; comp.attack.value=0.003; comp.release.value=0.25;
    A.bassEQ=A.ctx.createBiquadFilter(); A.bassEQ.type='lowshelf'; A.bassEQ.frequency.value=160; A.bassEQ.gain.value=0; // dB
    const lp=A.ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=12000;
    A.master.connect(comp); comp.connect(A.bassEQ); A.bassEQ.connect(lp); lp.connect(A.ctx.destination);
  }
  function setEnabled(on){ ensure(); A.enabled=on; if(!A.ctx) return; if(on){ try{ A.ctx.resume(); }catch{} } }
  toggle && toggle.addEventListener('change', ()=> setEnabled(toggle.checked)); master && master.addEventListener('input', ()=>{ ensure(); if(A.master) A.master.gain.value=parseFloat(master.value); });
  const bass = document.getElementById('audioBass');
  bass && bass.addEventListener('input', ()=>{ ensure(); if(A.bassEQ){ const v = Math.max(0, Math.min(1, parseFloat(bass.value||'0'))); const gain = -6 + 18*v; A.bassEQ.gain.value = gain; } });
  // auto-enable on load and resume on first interaction
  if (toggle) toggle.checked = true;
  setEnabled(true);
  const resume = ()=>{ try { ensure(); if (A.ctx && A.ctx.state !== 'running') A.ctx.resume(); } catch {} window.removeEventListener('pointerdown', resume); window.removeEventListener('touchstart', resume); window.removeEventListener('keydown', resume); };
  window.addEventListener('pointerdown', resume, { once:false });
  window.addEventListener('touchstart', resume, { once:false });
  window.addEventListener('keydown', resume, { once:false });
  // bubble plop on hover (noise burst only; bass is EQ, not a separate tone)
  bubbles.forEach((b,i)=>{
    b.addEventListener('mouseenter', ()=>{ if(!A.enabled) return; ensure(); const t=A.ctx.currentTime; const src=A.ctx.createBufferSource(); src.buffer=noiseBuffer(A.ctx); const bp=A.ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=320 + i*25; bp.Q.value=6; const g=A.ctx.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(0.08, t+0.02); g.gain.exponentialRampToValueAtTime(0.0001, t+0.22); src.connect(bp); bp.connect(g); g.connect(A.master); src.start(); });
  });
})();

// ===== Draggable & minimize phone =====
(function phoneDrag(){
  const panel = document.getElementById('errlPanel');
  const header = document.getElementById('errlPhoneHeader');
  const minBtn = document.getElementById('phoneMinToggle');
  if(!panel || !header) return;
  let drag=false, sx=0, sy=0, startL=null, startT=null;
  function toPx(n){ return Math.round(n) + 'px'; }
  function onDown(e){ drag=true; panel.classList.add('dragging'); header.style.cursor='grabbing';
    const r=panel.getBoundingClientRect(); sx=e.clientX; sy=e.clientY; startL=r.left; startT=r.top; panel.style.right='auto'; panel.style.left=toPx(startL); panel.style.top=toPx(startT); }
  function onMove(e){ if(!drag) return; const nx = startL + (e.clientX - sx); const ny = startT + (e.clientY - sy);
    const margin = 20; const maxX = window.innerWidth - panel.offsetWidth - margin; const maxY = window.innerHeight - panel.offsetHeight - margin; panel.style.left = toPx(Math.max(margin, Math.min(maxX, nx))); panel.style.top = toPx(Math.max(margin, Math.min(maxY, ny))); }
  function onUp(){ if(!drag) return; drag=false; panel.classList.remove('dragging'); header.style.cursor='grab'; }
  header.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
function setMinIcon(url){ try{ const im=new Image(); im.onload=()=>{ panel.style.setProperty('--minIcon', `url("${url}")`); }; im.src=url; }catch{} }
  // Optional custom icon path (drop your icon at this path to use it)
  setMinIcon('./portal/assets/ui/phone-tabs/phone-icon.png');

  function minimizeToTopRight(){
    const r = panel.getBoundingClientRect();
    panel.classList.add('minimized');
    // place icon at previous top-right corner
    requestAnimationFrame(()=>{
      const iw = panel.offsetWidth || 44;
      const ih = panel.offsetHeight || 44;
      const left = Math.min(window.innerWidth - iw - 20, Math.max(20, r.right - iw));
      const top  = Math.min(window.innerHeight - ih - 20, Math.max(20, r.top));
      panel.style.right = 'auto';
      panel.style.left = Math.round(left) + 'px';
      panel.style.top  = Math.round(top) + 'px';
      localStorage.setItem('errl_phone_min','1');
    });
  }
  function restoreFromIcon(){
    const iconRect = panel.getBoundingClientRect();
    panel.classList.remove('minimized');
    requestAnimationFrame(()=>{
      const w = panel.offsetWidth; const h = panel.offsetHeight;
      const left = Math.min(window.innerWidth - w - 20, Math.max(20, iconRect.left + iconRect.width - w));
      const top  = Math.min(window.innerHeight - h - 20, Math.max(20, iconRect.top));
      panel.style.left = Math.round(left) + 'px';
      panel.style.top  = Math.round(top) + 'px';
      panel.style.right = 'auto';
      localStorage.setItem('errl_phone_min','0');
    });
  }

  minBtn && minBtn.addEventListener('click', (e)=>{
    // Prevent this click from bubbling to the panel and instantly restoring
    e.stopPropagation();
    if (panel.classList.contains('minimized')) {
      restoreFromIcon();
    } else {
      minimizeToTopRight();
    }
  });
  // Click on the minimized icon restores
  panel.addEventListener('click', (e)=>{
    if (panel.classList.contains('minimized')) { e.stopPropagation(); restoreFromIcon(); }
  });
  // restore minimized: default to minimized icon if not set yet
  const minPref = localStorage.getItem('errl_phone_min');
  if (minPref === '0') {
    panel.classList.remove('minimized');
  } else {
    minimizeToTopRight();
    localStorage.setItem('errl_phone_min','1');
  }
  // show by default; toggle visibility with 'P'
  panel.style.display = 'block';
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'p' || e.key === 'P'){
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  });
})();

// ===== Mode toggle buttons (removed) =====
function webglSupported(){
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl') || c.getContext('experimental-webgl'));
  } catch { return false; }
}

// (mode buttons removed)

// (legacy mood buttons removed — using .moodBtn2)

// Hue controls wiring (if controller present)
(function hueWire(){
  const HT = document.getElementById('hueTarget');
  const H  = document.getElementById('hueShift');
  const S  = document.getElementById('hueSat');
  const I  = document.getElementById('hueInt');
  const E  = document.getElementById('hueEnabled');
  const A  = document.getElementById('hueAnimate');
const AS = document.getElementById('hueAnimSpeed');
  // bumpers for Hue
  (function(){ const dec=document.getElementById('hueAnimDec'), inc=document.getElementById('hueAnimInc'); if(AS){ const step=parseFloat(AS.step||'0.05')||0.05; const mn=parseFloat(AS.min||'0.05'), mx=parseFloat(AS.max||'2'); const d=(step.toString().split('.')[1]||'').length; const clamp=(v)=> Math.min(mx, Math.max(mn, parseFloat(v.toFixed(d)))); dec&&dec.addEventListener('click', ()=>{ AS.value=String(clamp(parseFloat(AS.value||String(mn))-step)); AS.dispatchEvent(new Event('change')); }); inc&&inc.addEventListener('click', ()=>{ AS.value=String(clamp(parseFloat(AS.value||String(mn))+step)); AS.dispatchEvent(new Event('change')); }); }})();
  function apply(){
    if(!window.ErrlHueController) return;
    const L = HT.value;
    window.ErrlHueController.setTarget(L);
    window.ErrlHueController.setEnabled(!!E.checked, L);
    window.ErrlHueController.setHue(parseFloat(H.value), L);
    window.ErrlHueController.setSaturation(parseFloat(S.value), L);
    window.ErrlHueController.setIntensity(parseFloat(I.value), L);
  }
  // Keep sliders in sync when animated externally
  document.addEventListener('hueUpdate', (ev)=>{
    try {
      const d = ev.detail || {}; const layer = d.layer; const st = d.state || {};
      if (layer === HT.value) {
        if (H) { H.value = String(st.hue ?? H.value); }
        if (S) { S.value = String(st.saturation ?? S.value); }
        if (I) { I.value = String(st.intensity ?? I.value); }
      }
    } catch {}
  });
  HT && HT.addEventListener('change', apply);
  H && H.addEventListener('input', apply);
  S && S.addEventListener('input', apply);
  I && I.addEventListener('input', apply);
  E && E.addEventListener('change', apply);
  function syncHueAnimBtn(){ try{ const c=window.ErrlHueController; if(!c||!A) return; const on = !!c.animation?.active && c.animation.layer===HT.value; A.classList.toggle('animating', on); }catch{}
  }
  // hue mode buttons
  let HMODE='loop';
  const hueLoop=document.getElementById('hueModeLoop'); const huePing=document.getElementById('hueModePing');
  hueLoop && hueLoop.addEventListener('click', ()=>{ HMODE='loop'; hueLoop.classList.add('active'); huePing?.classList.remove('active'); });
  huePing && huePing.addEventListener('click', ()=>{ HMODE='ping'; huePing.classList.add('active'); hueLoop?.classList.remove('active'); });
  A && A.addEventListener('click', ()=>{
    if(!window.ErrlHueController) return;
    const c=window.ErrlHueController; const sp = parseFloat(AS?.value||'0.6')||0.6; const layer=HT.value; const mode=HMODE;
    if (c.animation?.active && c.animation.layer===layer) { c.stopAnimation(); }
    else { c.startAnimation(sp, layer, mode); }
    syncHueAnimBtn();
  });
  AS && AS.addEventListener('change', ()=>{ const c=window.ErrlHueController; if(c && c.animation?.active){ c.startAnimation(parseFloat(AS.value||'0.6')||0.6, HT.value, HMODE); }});
  function syncHueUI(){
    try{
      const c=window.ErrlHueController; if(!c) return; const L=HT.value; const st=c.layers && c.layers[L];
      if(!st) return; if(E) E.checked = !!st.enabled; if(H) H.value=String(st.hue??0); if(S) S.value=String(st.saturation??1); if(I) I.value=String(st.intensity??1);
    }catch{}
  }
  HT && HT.addEventListener('change', ()=>{ apply(); syncHueUI(); syncHueAnimBtn(); });
  // initial sync
  syncHueUI();
})();

// Tabs
(function tabs(){
  const tabs = document.getElementById('panelTabs');
  if(!tabs) return;
  function showTab(key){
    tabs.querySelectorAll('.tab').forEach(t=> t.classList.toggle('active', t.dataset.tab===key));
    document.querySelectorAll('.errl-panel .panel-section').forEach(sec=>{
      const tab=sec.getAttribute('data-tab');
      sec.style.display = (tab===key)? 'block':'none';
    });
  }
  tabs.addEventListener('click', (e)=>{ const btn=e.target.closest('button[data-tab]'); if(btn) showTab(btn.dataset.tab); });
  // initialize HUD by default and ensure sections exist
  const defaultTab = (tabs.querySelector('.tab.active')||tabs.querySelector('[data-tab="hud"]')||tabs.querySelector('button[data-tab]')).dataset.tab;
  showTab(defaultTab);
})();

// Vignette controls (HUD)
(function vignetteCtrl(){
  const s = document.getElementById('vignetteOpacity');
  const on = document.getElementById('vignetteEnabled');
  const color = document.getElementById('vignetteColor');
  const vg = document.querySelector('.vignette-frame');
  if(!vg) return;
  const stored = {
    op: localStorage.getItem('vignette_opacity'),
    en: localStorage.getItem('vignette_enabled'),
    col: localStorage.getItem('vignette_color')
  };
  if (s && stored.op!=null) s.value = stored.op;
  if (on) on.checked = stored.en==null ? true : stored.en==='1';
  if (color && stored.col) color.value = stored.col;
  function apply(){
    const v = s ? Math.max(0, Math.min(1, parseFloat(s.value||'1'))) : 1;
    const enabled = on ? !!on.checked : true;
    const c = (color && color.value) || '#000000';
    vg.style.display = enabled ? 'block' : 'none';
    vg.style.opacity = String(v);
    vg.style.background = `radial-gradient(circle at 50% 50%, ${c} 0%, rgba(0,0,0,0) 70%)`;
    if (s) localStorage.setItem('vignette_opacity', String(v));
    if (on) localStorage.setItem('vignette_enabled', enabled?'1':'0');
    if (color) localStorage.setItem('vignette_color', c);
  }
  ;[s,on,color].forEach(el=> el && el.addEventListener('input', apply));
  apply();
})();

// Nav Goo controls
(function navGoo(){
  const wrap = document.getElementById('navOrbit'); if(!wrap) return;
  const on = document.getElementById('navGooEnabled');
  const blur = document.getElementById('navGooBlur');
  const mult = document.getElementById('navGooMult');
  const thr = document.getElementById('navGooThresh');
  function apply(){
    const enabled = on && on.checked;
    wrap.classList.toggle('goo-on', !!enabled);
    wrap.style.filter = enabled ? 'url(#uiGoo)' : 'none';
    const blurNode = document.getElementById('navGooBlurNode'); if(blurNode && blur) blurNode.setAttribute('stdDeviation', String(parseFloat(blur.value)));
    const mat = document.getElementById('navGooMatrixNode');
    if(mat && mult && thr){ const m = Math.max(1, parseFloat(mult.value)||24); const t = parseFloat(thr.value)||-14; mat.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${m} ${t}`); }
  }
  ;[on,blur,mult,thr].forEach(el=> el && el.addEventListener('input', apply));
  apply();
})();

// Accessibility
(function accessibility(){
  const prefReduce = document.getElementById('prefReduce');
  const prefContrast = document.getElementById('prefContrast');
  const prefInvert = document.getElementById('prefInvert');
  window.GLOBAL_MOTION = 1.0;
  function apply(){
    // Reduced motion slows everything globally
    if (prefReduce){
      const on = !!prefReduce.checked; window.GLOBAL_MOTION = on ? 0.25 : 1.0;
      document.body.classList.toggle('reduced-motion', on);
      localStorage.setItem('prefReduce', on?'1':'0');
      // Notify GL layer if present
      if (window.errlGLSetMotionScale) window.errlGLSetMotionScale(window.GLOBAL_MOTION);
      // Downshift densities immediately
      try{ initParticles(); rbRebuild(); }catch{}
    }
    // High contrast reduces contrast globally via body filter
    if (prefContrast){
      const on = !!prefContrast.checked; document.body.classList.toggle('high-contrast', on); localStorage.setItem('prefContrast', on?'1':'0');
    }
    // Invert colors (global CSS filter)
    if (prefInvert){
      const on = !!prefInvert.checked; document.body.classList.toggle('invert-colors', on); localStorage.setItem('prefInvert', on?'1':'0');
    }
  }
  prefReduce && prefReduce.addEventListener('change', apply);
  prefContrast && prefContrast.addEventListener('change', apply);
  prefInvert && prefInvert.addEventListener('change', apply);
  // initialize from storage
  const rm = localStorage.getItem('prefReduce')==='1'; const hc = localStorage.getItem('prefContrast')==='1'; const ic = localStorage.getItem('prefInvert')==='1';
  if (prefReduce) prefReduce.checked = rm; if (prefContrast) prefContrast.checked = hc; if (prefInvert) prefInvert.checked = ic; apply();
})();

// Device tilt parallax
(function tilt(){
  const layer = document.querySelector('.scene-layer'); if(!layer) return;
  function apply(dx,dy){ layer.style.transform = `translate3d(${dx}px, ${dy}px, 0)`; }
  window.addEventListener('deviceorientation', (e)=>{
    if(e.beta==null && e.gamma==null) return;
    const dx = (e.gamma||0) * 0.4; const dy = (e.beta||0) * -0.2; apply(dx, dy);
  });
})();

// restore mode + mood
(function restore(){
  // Respect mode set in HTML or stored preference; do not auto-enable WebGL to save GPU
  const saved = localStorage.getItem('errl_mode');
  if (saved) document.body.dataset.errlMode = saved;
  // Only enable GL if explicitly in 'errl' mode
  if (document.body.dataset.errlMode === 'errl' && window.enableErrlGL) window.enableErrlGL();
  const mood = localStorage.getItem('errlMood');
  if (mood && window.errlGLSetMood) window.errlGLSetMood(mood);
  // leave phone minimized/expanded state as set by phoneDrag()
})();
