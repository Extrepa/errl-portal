// Minimal app glue for portal panel → effects wiring
(function(){
  function $(id){ return document.getElementById(id); }

  function on(el, ev, fn){ if (el) el.addEventListener(ev, fn); }

  // GL Overlay bindings
  on($("glAlpha"), 'input', ()=>{ window.errlGLSetOverlay && window.errlGLSetOverlay({ alpha: parseFloat($("glAlpha").value) }); });
  on($("glDX"), 'input', ()=>{ window.errlGLSetOverlay && window.errlGLSetOverlay({ dx: parseFloat($("glDX").value) }); });
  on($("glDY"), 'input', ()=>{ window.errlGLSetOverlay && window.errlGLSetOverlay({ dy: parseFloat($("glDY").value) }); });

  // GL background bubbles
  function setBubs(p){ window.errlGLSetBubbles && window.errlGLSetBubbles(p); }
  on($("bgSpeed"), 'input', ()=> setBubs({ speed: parseFloat($("bgSpeed").value) }));
  on($("bgDensity"), 'input', ()=> setBubs({ density: parseFloat($("bgDensity").value) }));
  on($("bgAlpha"), 'input', ()=> setBubs({ alpha: parseFloat($("bgAlpha").value) }));

  // Orbiting nav bubbles around Errl
  const errl = $("errl");
  const bubbles = Array.from(document.querySelectorAll('.bubble'));
  bubbles.forEach((b, i)=> { if (b && b.dataset) b.dataset.orbIndex = String(i); });
  let navOrbitSpeed = parseFloat($("navOrbitSpeed")?.value || '0.25');
  let navRadius = parseFloat($("navRadius")?.value || '1.0');
  on($("navOrbitSpeed"), 'input', ()=> navOrbitSpeed = parseFloat($("navOrbitSpeed").value||'1'));
  on($("navRadius"), 'input', ()=> navRadius = parseFloat($("navRadius").value||'1'));

  function updateBubbles(ts){
    if (!errl) return requestAnimationFrame(updateBubbles);
    const rect = errl.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    bubbles.forEach((el, i)=>{
      const base = parseFloat((el.dataset && el.dataset.angle) || '0');
      const dist = parseFloat((el.dataset && el.dataset.dist) || '160') * navRadius;
      const ang = base + (ts * 0.00003 * navOrbitSpeed * (i % 2 === 0 ? 1 : -1)) * 360;
      const rad = ang * Math.PI/180;
      const x = cx + Math.cos(rad)*dist;
      const y = cy + Math.sin(rad)*dist;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.transform = 'translate(-50%, -50%)';
    });
    window.errlGLSyncOrbs && window.errlGLSyncOrbs();
    requestAnimationFrame(updateBubbles);
  }
  requestAnimationFrame(updateBubbles);

  // Hover → GL orb squish
  bubbles.forEach((b,i)=>{
    b.addEventListener('mouseenter', ()=> window.errlGLOrbHover && window.errlGLOrbHover(i,true));
    b.addEventListener('mouseleave', ()=> window.errlGLOrbHover && window.errlGLOrbHover(i,false));
  });

  // GL Orbs toggle
  on($("glOrbsToggle"), 'change', ()=>{
    const el = $("glOrbsToggle");
    if (!el) return; window.errlGLShowOrbs && window.errlGLShowOrbs(!!el.checked);
  });

  // Burst button
  on($("burstBtn"), 'click', ()=> window.errlGLBurst ? window.errlGLBurst() : null);

  // Errl size slider
  on($("errlSize"), 'input', ()=>{
    const wrap = $("errl");
    if(!wrap) return; const v = parseFloat($("errlSize").value||'1');
    wrap.style.transform = `translate(-50%, -50%) scale(${v})`;
  });

  // Nav Goo (UI filter)
  (function navGoo(){
    const root = document.querySelector('.nav-orbit');
    const blur = document.getElementById('navGooBlur');
    const mult = document.getElementById('navGooMult');
    const thresh = document.getElementById('navGooThresh');
    const enabled = document.getElementById('navGooEnabled');
    const blurNode = document.getElementById('navGooBlurNode');
    const matNode = document.getElementById('navGooMatrixNode');
    function apply(){
      if (blurNode && blur) blurNode.setAttribute('stdDeviation', String(parseFloat(blur.value||'6')));
      if (matNode){
        const m = Math.max(1, parseFloat(mult?.value||'24'));
        const t = parseFloat(thresh?.value||'-14');
        // 4x5 matrix; only bottom-right row affects alpha mapping
        matNode.setAttribute('values', `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${m} ${t}`);
      }
      if (root) root.classList.toggle('goo-on', !!(enabled && enabled.checked));
    }
    ;[blur,mult,thresh,enabled].forEach(el=> el && el.addEventListener('input', apply));
    apply();
  })();

  // Hue Controller bindings
  (function hueBindings(){
    function withHue(cb){
      const H = window.ErrlHueController; if (H) return cb(H);
      setTimeout(()=> withHue(cb), 80);
    }
    const target = $("hueTarget"), onEl=$("hueEnabled"), h=$("hueShift"), s=$("hueSat"), i=$("hueInt"),
          timeline=$("hueTimeline"), playBtn=$("huePlayPause");
    // late WebGL registration bridge
    withHue(H=>{
      const refs = window.__ErrlWebGL;
      if (refs){
        try{ H.registerWebGLLayer('glOverlay', refs.overlay); }catch(e){}
        try{ H.registerWebGLLayer('bgBubbles', refs.bubbles); }catch(e){}
      }
      // apply current UI values once on load
      if (target) H.setTarget(target.value);
      if (onEl) H.setEnabled(!!onEl.checked, target?.value||H.currentTarget);
      if (h) H.setHue(+h.value, target?.value||H.currentTarget);
      if (s) H.setSaturation(+s.value, target?.value||H.currentTarget);
      if (i) H.setIntensity(+i.value, target?.value||H.currentTarget);
    });

    on(target,'change', ()=> withHue(H=> H.setTarget(target.value)));
    on(onEl,'change', ()=> withHue(H=> H.setEnabled(!!onEl.checked)));
    on(h,'input', ()=> withHue(H=> H.setHue(+h.value)));
    on(s,'input', ()=> withHue(H=> H.setSaturation(+s.value)));
    on(i,'input', ()=> withHue(H=> H.setIntensity(+i.value)));
    // Global timeline controls (fixed speed)
    on(timeline,'input', ()=> withHue(H=> H.setTimeline(+timeline.value)));
    on(playBtn,'click', ()=> withHue(H=> H.toggleTimeline()));
  })();

  // Background / Vignette controls
  (function bgVignette(){
    const frame = document.querySelector('.vignette-frame');
    const op = document.getElementById('vignetteOpacity');
    const en = document.getElementById('vignetteEnabled');
    const col = document.getElementById('vignetteColor');
    function apply(){ if (!frame) return; frame.style.opacity = en && en.checked ? (op?.value||'0.85') : '0'; if (col) frame.style.boxShadow = `0 40px 120px rgba(0,0,0,1) inset, 0 0 80px rgba(0,0,0,0.8) inset, 0 0 40px ${col.value}22`; }
    ;[op,en,col].forEach(el=> el && el.addEventListener('input', apply));
    apply();
  })();

  // Shimmer background toggling
  (function shimmer(){
    const t = document.getElementById('shimmerToggle');
    function mount(){ try{ if (window.ErrlBG && typeof window.ErrlBG.mount==='function'){ window.ErrlBG.mount({ headerVariant: 2, shimmer: true, parallax: true, hud: false, basePath: '.' }); } }catch(e){} }
    function hide(show){ const root = document.querySelector('.errl-bg'); if (root) root.style.display = show? 'block':'none'; }
    if (t){ t.addEventListener('change', ()=>{ if (t.checked){ const root=document.querySelector('.errl-bg'); if (!root) mount(); else hide(true); } else hide(false); }); if (t.checked) mount(); }
  })();
  // ===== Errl Phone UI (tabs, minimize, drag, scroll-to-top) =====
  (function phoneUI(){
    const panel = document.getElementById('errlPanel');
    if (!panel) return;
    const header = document.getElementById('errlPhoneHeader');
    const tabsWrap = document.getElementById('panelTabs');
    const minBtn = document.getElementById('phoneMinToggle');
    const sections = Array.from(panel.querySelectorAll('.panel-section'));
    const toTop = document.getElementById('panelScrollTop');

    function activateTab(key){
      // toggle buttons
      if (tabsWrap){
        Array.from(tabsWrap.querySelectorAll('.tab')).forEach(btn=>{
          const on = btn.getAttribute('data-tab') === key;
          btn.classList.toggle('active', on);
        });
      }
      // toggle sections
      sections.forEach(sec=>{
        const on = sec.getAttribute('data-tab') === key;
        sec.style.display = on ? 'block' : 'none';
      });
    }
    // initial tab
    activateTab('hud');
    // tab clicks
    if (tabsWrap){
      tabsWrap.addEventListener('click', (e)=>{
        const t = e.target.closest('.tab');
        if (!t) return;
        const key = t.getAttribute('data-tab');
        if (key) activateTab(key);
      });
    }

    // minimize toggle
    if (minBtn){
      minBtn.addEventListener('click', (e)=>{
        e.stopPropagation();
        panel.classList.toggle('minimized');
      });
    }
    // restore from minimized when clicking the bubble
    panel.addEventListener('click', ()=>{
      if (panel.classList.contains('minimized')) panel.classList.remove('minimized');
    });

    // drag move (fixed positioning)
    if (header){
      let dragging=false, sx=0, sy=0, startLeft=0, startTop=0;
      function px(v){ return Math.max(0, Math.round(v)); }
      header.addEventListener('pointerdown', (e)=>{
        dragging = true; panel.classList.add('dragging'); header.setPointerCapture(e.pointerId);
        const r = panel.getBoundingClientRect();
        // switch to left/top for free movement
        panel.style.left = px(r.left) + 'px';
        panel.style.top = px(r.top) + 'px';
        panel.style.right = 'auto';
        sx = e.clientX; sy = e.clientY; startLeft = r.left; startTop = r.top;
      });
      header.addEventListener('pointermove', (e)=>{
        if (!dragging) return;
        const dx = e.clientX - sx; const dy = e.clientY - sy;
        panel.style.left = px(startLeft + dx) + 'px';
        panel.style.top = px(startTop + dy) + 'px';
      });
      const end = (e)=>{ if (!dragging) return; dragging=false; panel.classList.remove('dragging'); header.releasePointerCapture?.(e.pointerId); };
      header.addEventListener('pointerup', end);
      header.addEventListener('pointercancel', end);
    }

    // scroll-to-top button
    panel.addEventListener('scroll', ()=>{
      if (!toTop) return;
      toTop.style.display = panel.scrollTop > 140 ? 'block' : 'none';
    });
    if (toTop){
      toTop.addEventListener('click', (e)=>{ e.stopPropagation(); panel.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
  })();
})();
