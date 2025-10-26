(() => {
  // Lightweight DOM background + HUD drip initializer
  const ErrlBG: any = ((window as any).ErrlBG = (window as any).ErrlBG || {});

  function create(tag: string, cls?: string) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    return el;
  }
  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  ErrlBG.mount = function mount(opts: any = {}) {
    const opt = Object.assign(
      {
        headerVariant: 1, // 1 or 2
        shimmer: true,
        parallax: true,
        hud: true,
        basePath: '../..', // relative from app pages to src/
      },
      opts,
    );

    // Background stack
    const bg = create('div', 'errl-bg');
    const base = create('div', 'layer base');
    const shimmer = create('div', 'layer shimmer');
    const vig = create('div', 'layer vignette');
    bg.append(base);
    if (opt.shimmer) bg.append(shimmer);
    bg.append(vig);
    document.body.appendChild(bg);

    // HUD drip (optional)
    if (opt.hud) {
      const hud = create('div', 'errl-hud');
      hud.setAttribute('data-variant', String(opt.headerVariant === 2 ? 2 : 1));
      const img1 = new Image();
      img1.className = 'hdr1';
      img1.alt = '';
      img1.decoding = 'async';
      // Try multiple candidate filenames to match repo assets
      const hdr1Candidates = [
        opt.basePath + '/assets/BG/BG_Header.png',
        opt.basePath + '/assets/BG/BG_Header-.png',
        opt.basePath + '/assets/BG/BG_Header_Almost.png',
      ];
      const hdr2Candidates = [
        opt.basePath + '/assets/BG/BG_Header_2.png',
        opt.basePath + '/assets/BG/BG_Header--.png',
        opt.basePath + '/assets/BG/BG_Header-.png',
      ];
      function applyFallback(el: HTMLImageElement, list: string[]) {
        let i = 0;
        const next = () => {
          if (i < list.length) {
            el.src = list[i++];
          }
        };
        el.onerror = next as any;
        next();
      }
      applyFallback(img1, hdr1Candidates);
      const img2 = new Image();
      img2.className = 'hdr2';
      img2.alt = '';
      img2.decoding = 'async';
      applyFallback(img2, hdr2Candidates);
      hud.append(img1, img2);
      document.body.appendChild(hud);
    }

    // Parallax/pointer drift
    if (opt.parallax) {
      let px = 0,
        py = 0,
        tx = 0,
        ty = 0;
      function onMove(e: PointerEvent) {
        const r = window.innerWidth;
        const d = window.innerHeight;
        px = e.clientX / r - 0.5;
        py = e.clientY / d - 0.5;
      }
      window.addEventListener('pointermove', onMove);
      function tick() {
        tx = lerp(tx, px, 0.08);
        ty = lerp(ty, py, 0.08);
        const dx = tx * 8,
          dy = ty * 6; // pixels
        (base as HTMLElement).style.transform = `scale(1.03) translate3d(${dx}px, ${dy}px, 0)`;
        (shimmer as HTMLElement).style.transform = `translate3d(${dx * 1.6}px, ${dy * 1.2}px, 0)`;
        const hudEl = document.querySelector('.errl-hud') as HTMLElement | null;
        if (hudEl) hudEl.style.transform = `translate3d(${dx * 0.7}px, 0, 0)`;
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  };
})();
