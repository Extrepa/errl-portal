// L0 DOM starfield for #bgParticles
(function(){
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];
  let alpha = 0.16;
  let speed = 0.12;
  let boostUntil = 0;
  let boostAmount = 0;

  function resize(){
    const w = innerWidth, h = innerHeight;
    canvas.width = Math.max(1, Math.floor(w * DPR));
    canvas.height = Math.max(1, Math.floor(h * DPR));
    canvas.style.width = w+'px';
    canvas.style.height = h+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    build();
  }
  function build(){
    const count = Math.round((innerWidth*innerHeight)/22000);
    stars = Array.from({length: count}, ()=>({
      x: Math.random()*innerWidth,
      y: Math.random()*innerHeight,
      r: 0.6 + Math.random()*1.6,
      vx: (Math.random()-0.5)*speed,
      vy: (Math.random()-0.5)*speed,
      hue: 200 + Math.random()*120,
    }));
  }
  function step(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    const now = performance.now();
    const boostOn = now < boostUntil;
    const alphaScale = boostOn ? (1 + boostAmount * 0.7) : 1;
    for(const s of stars){
      s.x += s.vx; s.y += s.vy;
      if (boostOn) {
        s.x += (Math.random() - 0.5) * 0.2 * boostAmount;
        s.y += (Math.random() - 0.5) * 0.2 * boostAmount;
      }
      if (s.x < 0) s.x += innerWidth; if (s.x > innerWidth) s.x -= innerWidth;
      if (s.y < 0) s.y += innerHeight; if (s.y > innerHeight) s.y -= innerHeight;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue},70%,70%,${alpha * alphaScale})`;
      ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${s.hue},90%,70%,1)`;
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  window.errlBgParticlesBoost = function(opts){
    const o = opts || {};
    const amount = Math.max(0.1, Math.min(2, Number(o.amount) || 0.4));
    const durationMs = Math.max(180, Math.min(4000, Number(o.durationMs) || 900));
    boostAmount = amount;
    boostUntil = performance.now() + durationMs;
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      if (!s) continue;
      s.vx += (Math.random() - 0.5) * speed * amount * 0.9;
      s.vy += (Math.random() - 0.5) * speed * amount * 0.9;
    }
  };
  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
})();
