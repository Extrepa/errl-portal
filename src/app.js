// Minimal app glue for portal panel → effects wiring
(function(){
  function $(id){ return document.getElementById(id); }

  function on(el, ev, fn){ if (el) el.addEventListener(ev, fn); }

  // GL Overlay bindings + persist
  function persistOverlay(){
    const obj = { alpha: parseFloat($("glAlpha")?.value||'0.2'), dx: parseFloat($("glDX")?.value||'24'), dy: parseFloat($("glDY")?.value||'18') };
    try{ localStorage.setItem('errl_gl_overlay', JSON.stringify(obj)); }catch(e){}
  }
  on($("glAlpha"), 'input', ()=>{ const v=parseFloat($("glAlpha").value); window.errlGLSetOverlay && window.errlGLSetOverlay({ alpha: v }); persistOverlay(); });
  on($("glDX"), 'input', ()=>{ const v=parseFloat($("glDX").value); window.errlGLSetOverlay && window.errlGLSetOverlay({ dx: v }); persistOverlay(); });
  on($("glDY"), 'input', ()=>{ const v=parseFloat($("glDY").value); window.errlGLSetOverlay && window.errlGLSetOverlay({ dy: v }); persistOverlay(); });

  // GL background bubbles + persist minimal defaults
  function setBubs(p){ window.errlGLSetBubbles && window.errlGLSetBubbles(p); }
  function persistBubs(){
    const obj = { speed: parseFloat($("bgSpeed")?.value||'1'), density: parseFloat($("bgDensity")?.value||'1'), alpha: parseFloat($("bgAlpha")?.value||'0.9') };
    try{ localStorage.setItem('errl_gl_bubbles', JSON.stringify(obj)); }catch(e){}
  }
  on($("bgSpeed"), 'input', ()=> { setBubs({ speed: parseFloat($("bgSpeed").value) }); persistBubs(); });
  on($("bgDensity"), 'input', ()=> { setBubs({ density: parseFloat($("bgDensity").value) }); persistBubs(); });
  on($("bgAlpha"), 'input', ()=> { setBubs({ alpha: parseFloat($("bgAlpha").value) }); persistBubs(); });

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

  // Nav Goo+ WebGL controls (wiggle, flow, grip, drip, viscosity)
  (function navGooPlus(){
    const w = document.getElementById('navWiggle');
    const f = document.getElementById('navFlow');
    const g = document.getElementById('navGrip');
    const d = document.getElementById('navDrip');
    const v = document.getElementById('navVisc');
    function apply(){
      if (!window.errlGLSetGoo) return;
      const params = {};
      if (w) params.wiggle = parseFloat(w.value);
      if (f) params.speed = parseFloat(f.value);
      // Grip affects viscosity - higher grip = more resistance = more visible animation
      // Use grip if available, otherwise fall back to viscosity
      if (g) {
        params.viscosity = parseFloat(g.value);
      } else if (v) {
        params.viscosity = parseFloat(v.value);
      }
      if (d) params.drip = (parseFloat(d.value) + 1) / 2; // convert -1..1 to 0..1
      window.errlGLSetGoo(params);
    }
    ;[w,f,g,d,v].forEach(el=> el && el.addEventListener('input', apply));
    apply();
  })();

  // Slow Gradient button
  on($("navSlowGradient"), 'click', ()=>{
    if (!window.errlGLSetGoo) return;
    // Apply slow, gentle gradient animation
    window.errlGLSetGoo({ speed: 0.3, wiggle: 0.2, viscosity: 0.7, drip: 0.1 });
    // Also update UI sliders to reflect the change
    const f = $("navFlow"); if (f) f.value = 0.3;
    const w = $("navWiggle"); if (w) w.value = 0.2;
    const g = $("navGrip"); if (g) g.value = 0.7;
    const d = $("navDrip"); if (d) d.value = 0.1;
  });

  // Rotate Skins - cycle through fun textures
  let skinIndex = 0;
  const skinKinds = ['proc', 'orb', 'proc', 'orb']; // Simple cycle for now
  on($("rotateSkins"), 'click', ()=>{
    if (!window.errlGLSetBubblesLayerTexture) return;
    skinIndex = (skinIndex + 1) % skinKinds.length;
    const kind = skinKinds[skinIndex];
    // Apply to all bubble layers
    for (let i = 0; i < 6; i++) {
      window.errlGLSetBubblesLayerTexture(i, kind, null);
    }
  });

  // Apply persisted defaults on load (overlay + gl bubbles + nav goo + RB + Goo)
  (function loadPersisted(){
    try{
      const ov = JSON.parse(localStorage.getItem('errl_gl_overlay')||'null');
      if (ov && window.errlGLSetOverlay) window.errlGLSetOverlay(ov);
      const gb = JSON.parse(localStorage.getItem('errl_gl_bubbles')||'null');
      if (gb && window.errlGLSetBubbles) window.errlGLSetBubbles(gb);
      const ng = JSON.parse(localStorage.getItem('errl_nav_goo_cfg')||'null');
      if (ng){ const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value = String(v); el.dispatchEvent(new Event('input')); } }; const c=(id,v)=>{ const el=document.getElementById(id); if(el){ el.checked=!!v; el.dispatchEvent(new Event('input')); } }; c('navGooEnabled', ng.enabled); e('navGooBlur', ng.blur); e('navGooMult', ng.mult); e('navGooThresh', ng.thresh); }
      const rb = JSON.parse(localStorage.getItem('errl_rb_settings')||'null');
      if (rb){ const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value=String(v); el.dispatchEvent(new Event('input')); } }; e('rbSpeed', rb.speed); e('rbDensity', rb.density); e('rbAlpha', rb.alpha); e('rbWobble', rb.wobble); e('rbFreq', rb.freq); e('rbMin', rb.min); e('rbMax', rb.max); e('rbSizeHz', rb.sizeHz); e('rbJumboPct', rb.jumboPct); e('rbJumboScale', rb.jumboScale); }
      const cg = JSON.parse(localStorage.getItem('errl_goo_cfg')||'null');
      if (cg){ const c=(id,v)=>{ const el=document.getElementById(id); if(el){ el.checked=!!v; el.dispatchEvent(new Event('input')); } }; const e=(id,v)=>{ const el=document.getElementById(id); if(el){ el.value=String(v); el.dispatchEvent(new Event('input')); } }; c('classicGooEnabled', cg.enabled); e('classicGooStrength', cg.mult); e('classicGooWobble', cg.wobble); e('classicGooSpeed', cg.speed); }
    }catch(e){}
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
      // apply current UI values once on load - ensure enabled state is properly initialized
      if (target) H.setTarget(target.value);
      // Force initialization by toggling enabled state if needed
      if (onEl) {
        const wasChecked = onEl.checked;
        // Temporarily uncheck to ensure proper initialization
        onEl.checked = false;
        H.setEnabled(false, target?.value||H.currentTarget);
        // Then set to desired state
        onEl.checked = wasChecked;
        H.setEnabled(wasChecked, target?.value||H.currentTarget);
      }
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

  // Save/Reset defaults buttons and quick-save
  function saveDefaults(){
    try{
      const H = window.ErrlHueController; if (H) localStorage.setItem('errl_hue_layers', JSON.stringify(H.layers));
      // overlay/bubbles saved on change already
      const ng={ enabled: document.getElementById('navGooEnabled')?.checked, blur:+(document.getElementById('navGooBlur')?.value||6), mult:+(document.getElementById('navGooMult')?.value||24), thresh:+(document.getElementById('navGooThresh')?.value||-14) };
      localStorage.setItem('errl_nav_goo_cfg', JSON.stringify(ng));
      const rb={ speed:+(document.getElementById('rbSpeed')?.value||1), density:+(document.getElementById('rbDensity')?.value||1), alpha:+(document.getElementById('rbAlpha')?.value||0.95), wobble:+(document.getElementById('rbWobble')?.value||1), freq:+(document.getElementById('rbFreq')?.value||1), min:+(document.getElementById('rbMin')?.value||14), max:+(document.getElementById('rbMax')?.value||36), sizeHz:+(document.getElementById('rbSizeHz')?.value||0), jumboPct:+(document.getElementById('rbJumboPct')?.value||0.1), jumboScale:+(document.getElementById('rbJumboScale')?.value||1.6) };
      localStorage.setItem('errl_rb_settings', JSON.stringify(rb));
      const cg={ enabled: document.getElementById('classicGooEnabled')?.checked, mult:+(document.getElementById('classicGooStrength')?.value||1), wobble:+(document.getElementById('classicGooWobble')?.value||1), speed:+(document.getElementById('classicGooSpeed')?.value||1) };
      localStorage.setItem('errl_goo_cfg', JSON.stringify(cg));
      alert('Defaults saved.');
    }catch(e){ alert('Could not save defaults.'); }
  }
  function resetDefaults(){
    ['errl_hue_layers','errl_gl_overlay','errl_gl_bubbles','errl_nav_goo_cfg','errl_rb_settings','errl_goo_cfg'].forEach(k=>{ try{ localStorage.removeItem(k); }catch(e){} });
    alert('Defaults cleared. Reload to see stock settings.');
  }
  const saveBtn=document.getElementById('saveDefaultsBtn'); if (saveBtn) saveBtn.addEventListener('click', saveDefaults);
  const rstBtn=document.getElementById('resetDefaultsBtn'); if (rstBtn) rstBtn.addEventListener('click', resetDefaults);
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'S' && e.shiftKey){ saveDefaults(); }
  });
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
