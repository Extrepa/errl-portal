(function(){
  // Lightweight DOM background + HUD drip initializer
  const ErrlBG = window.ErrlBG = window.ErrlBG || {};

  function create(tag, cls){ const el=document.createElement(tag); if(cls) el.className=cls; return el; }
  function lerp(a,b,t){ return a + (b-a)*t; }

  ErrlBG.mount = function mount(opts={}){
    const opt = Object.assign({
      headerVariant: 1, // 1 or 2
      shimmer: true,
      parallax: true,
      hud: true,
      basePath: '../..', // relative from app pages to src/
    }, opts);

    // Background stack
    const bg = create('div','errl-bg');
    const base = create('div','layer base');
    const shimmer = create('div','layer shimmer');
    const vig = create('div','layer vignette');
    bg.append(base); if(opt.shimmer) bg.append(shimmer); bg.append(vig);
    document.body.appendChild(bg);

    // HUD drip (optional)
    if(opt.hud){
      const hud = create('div','errl-hud');
      hud.setAttribute('data-variant', String(opt.headerVariant===2?2:1));
      const img1 = new Image(); img1.className='hdr1';
      img1.alt=''; img1.decoding='async'; img1.src = opt.basePath + '/ErrlSite_Assets/BG/BG_Header.png';
      const img2 = new Image(); img2.className='hdr2';
      img2.alt=''; img2.decoding='async'; img2.src = opt.basePath + '/ErrlSite_Assets/BG/BG_Header_2.png';
      hud.append(img1, img2); document.body.appendChild(hud);
    }

    // Parallax/pointer drift
    if(opt.parallax){
      let px=0, py=0, tx=0, ty=0;
      function onMove(e){ const r=window.innerWidth; const d=window.innerHeight; px = (e.clientX/r - .5); py = (e.clientY/d - .5); }
      window.addEventListener('pointermove', onMove);
      function tick(){ tx = lerp(tx, px, 0.08); ty = lerp(ty, py, 0.08);
        const dx = tx*8, dy = ty*6; // pixels
        base.style.transform = `scale(1.03) translate3d(${dx}px, ${dy}px, 0)`;
        shimmer.style.transform = `translate3d(${dx*1.6}px, ${dy*1.2}px, 0)`;
        const hudEl = document.querySelector('.errl-hud');
        if(hudEl) hudEl.style.transform = `translate3d(${dx*0.7}px, 0, 0)`;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  };
})();