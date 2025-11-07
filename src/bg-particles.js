// L0 DOM starfield for #bgParticles
(function(){
  const canvas = document.getElementById('bgParticles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];
  let alpha = 0.16;
  let speed = 0.12;

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
    for(const s of stars){
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x += innerWidth; if (s.x > innerWidth) s.x -= innerWidth;
      if (s.y < 0) s.y += innerHeight; if (s.y > innerHeight) s.y -= innerHeight;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = `hsla(${s.hue},70%,70%,${alpha})`;
      ctx.shadowBlur = 8; ctx.shadowColor = `hsla(${s.hue},90%,70%,1)`;
      ctx.fill();
    }
    requestAnimationFrame(step);
  }
  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(step);
})();
