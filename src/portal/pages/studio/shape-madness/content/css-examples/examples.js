// Extracted from html_css_sheets.html on 2025-11-11T18:05:21.512Z
// Example-specific CSS injected to keep snippets minimal in the code blocks
    const css = `
    .example-01 .btn{padding:10px 16px;border-radius:12px;border:1px solid #2a335f;background:#182048;color:#eaf7ff;box-shadow:0 0 0 0 rgba(124,240,255,.0);transition:box-shadow .25s, transform .15s}
    .example-01 .btn:hover{box-shadow:0 0 0 6px rgba(124,240,255,.15), 0 6px 18px rgba(0,0,0,.35);transform:translateY(-1px)}

    .example-02 .media-card{width:220px;border-radius:14px;overflow:hidden;border:1px solid #2a335f}
    .example-02 .media-card .img{height:120px;background: radial-gradient(120px 40px at 30% 30%, #7cf0ff, transparent 60%), radial-gradient(160px 50px at 70% 70%, #ffd36a, transparent 60%), #131836}
    .example-02 .media-card figcaption{padding:8px 10px;background:#0d1228}

    .example-03 .nav{display:flex; gap:10px; align-items:center; width:100%; padding:8px 10px; border:1px solid #2a335f; border-radius:10px;}
    .example-03 .nav .spacer{flex:1}
    .example-03 .nav a{padding:6px 8px; border-radius:8px}
    .example-03 .nav a:hover{background:#1a2044}

    .example-04 .grid4{width:240px; display:grid; grid-template-columns: repeat(3, 1fr); gap:8px}
    .example-04 .grid4 > div{aspect-ratio:1/1;border-radius:10px;background: conic-gradient(from 210deg, #7cf0ff, #ffd36a, #7cf0ff); filter:saturate(85%)}

    .example-05 .avatar{width:96px; aspect-ratio:1/1; border-radius:50%; border:3px solid #2a335f; background: radial-gradient(60% 40% at 30% 30%, rgba(124,240,255,.6), transparent 60%), url('https://picsum.photos/200?blur=1') center/cover no-repeat}

    .example-06 .bar{width:260px; height:12px; border-radius:999px; background:#0f1433; overflow:hidden}
    .example-06 .bar span{display:block; height:100%; width:var(--p); background:linear-gradient(90deg,#7cf0ff,#ffd36a); animation:shine 1.2s linear infinite; background-size:200% 100%}
    @keyframes shine{to{background-position:100% 0}}

    .example-07 .tip{position:relative; padding:8px 12px; border-radius:10px; border:1px solid #2a335f; background:#182048}
    .example-07 .tip::after{content:attr(data-tip); position:absolute; left:50%; transform:translateX(-50%) translateY(6px); bottom:100%; white-space:nowrap; padding:6px 8px; border-radius:8px; background:#0e1330; border:1px solid #2a335f; opacity:0; pointer-events:none; transition:.2s; font-size:12px}
    .example-07 .tip:hover::after{opacity:1; transform:translateX(-50%) translateY(2px)}

    .example-08 .accordion input{display:none}
    .example-08 .accordion label{display:block; padding:8px 10px; border:1px solid #2a335f; border-radius:8px; cursor:pointer; background:#161b39}
    .example-08 .accordion .panel{max-height:0; overflow:hidden; transition:max-height .25s ease; padding:0 10px; border-left:2px solid #2a335f; margin-top:6px}
    .example-08 .accordion input:checked ~ .panel{max-height:120px; padding:8px 10px}

    .example-09 .bubble{padding:10px 14px; border-radius:12px; background:#0e1330; border:1px solid #2a335f; position:relative; width:max-content}
    .example-09 .bubble::after{content:""; position:absolute; left:18px; top:100%; border:8px solid transparent; border-top-color:#0e1330; filter:drop-shadow(0 -1px 0 #2a335f)}

    .example-10 .heart{width:48px; height:48px; background:#ff6aa9; transform:rotate(45deg); position:relative; border-radius:8px}
    .example-10 .heart::before, .example-10 .heart::after{content:""; position:absolute; width:48px; height:48px; background:#ff6aa9; border-radius:50%}
    .example-10 .heart::before{left:-24px}
    .example-10 .heart::after{top:-24px}

    .example-11 .blob{display:block}

    .example-12 .theme-demo{display:flex; gap:10px}
    .example-12 .chip{ display:inline-block; padding:6px 10px; border:1px solid var(--chip-bd); background:var(--chip-bg); color:var(--chip-ink); border-radius:999px }
    .example-12 .alt{ --chip-bg:#1f2b13; --chip-ink:#f2ffe0; --chip-bd:#3f5a2a; background:var(--chip-bg); color:var(--chip-ink); border-color:var(--chip-bd) }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

// Preview-only JS for Sheet 4 toast button
    document.addEventListener('click', (e) => {
      if(e.target.matches('.showtoast')){
        const toast = e.target.nextElementSibling;
        toast.classList.add('on');
        setTimeout(()=>toast.classList.remove('on'), 1600);
      }
    });

// ====== GENERATORS FOR SHEETS 6 & 7 ======
  const TAU = Math.PI*2;

  function drawHypotrochoid(path, R=80, r=23, d=60, turns=8, steps=2200){
    let pts = [];
    for(let i=0;i<=steps;i++){
      const t = i/steps * (TAU*turns);
      const x = (R - r)*Math.cos(t) + d*Math.cos(((R - r)/r)*t);
      const y = (R - r)*Math.sin(t) - d*Math.sin(((R - r)/r)*t);
      pts.push(`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    path.setAttribute('d', pts.join(' '));
  }

  function drawPhyllotaxis(svg, n=500, angleDeg=137.5, c=3.2){
    const angle = angleDeg * Math.PI/180;
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    for(let i=0;i<n;i++){
      const r = c*Math.sqrt(i);
      const theta = i*angle;
      const x = r*Math.cos(theta);
      const y = r*Math.sin(theta);
      const hue = (i*0.75)%360;
      const dot = document.createElementNS("http://www.w3.org/2000/svg","circle");
      dot.setAttribute('cx', x.toFixed(2));
      dot.setAttribute('cy', y.toFixed(2));
      dot.setAttribute('r', 2.2);
      dot.setAttribute('fill', `hsl(${hue} 85% 70%)`);
      svg.appendChild(dot);
    }
  }

  function drawLissajous(path, ax=5, ay=4, delta=Math.PI/3, steps=1600){
    let pts = [];
    const A=90, B=90;
    for(let i=0;i<=steps;i++){
      const t = i/steps * TAU;
      const x = A*Math.sin(ax*t + 0);
      const y = B*Math.sin(ay*t + delta);
      pts.push(`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    path.setAttribute('d', pts.join(' '));
  }

  function drawSuperellipse(path, a=90, b=90, n=2.0, steps=900){
    // |x/a|^n + |y/b|^n = 1
    let pts = [];
    for(let i=0;i<=steps;i++){
      const t = i/steps * TAU;
      const ct = Math.cos(t), st = Math.sin(t);
      const x = Math.sign(ct) * a * Math.pow(Math.abs(ct), 2/n);
      const y = Math.sign(st) * b * Math.pow(Math.abs(st), 2/n);
      pts.push(`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    path.setAttribute('d', pts.join(' ') + ' Z');
  }

  function drawHarmonograph(path, opts){
    const {A1=70, A2=70, f1=2.01, f2=3.03, p1=0, p2=Math.PI/2, d1=0.004, d2=0.004, steps=4000} = opts||{};
    let pts = [];
    for(let i=0;i<=steps;i++){
      const t = i/steps * 40; // seconds-ish
      const x = A1*Math.sin(f1*t + p1) * Math.exp(-d1*t);
      const y = A2*Math.sin(f2*t + p2) * Math.exp(-d2*t);
      pts.push(`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    path.setAttribute('d', pts.join(' '));
  }

  function drawRoses(svg, roses=[{k:5,a:80},{k:7,a:60}], steps=1200){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    roses.forEach((r,i)=>{
      const path = document.createElementNS("http://www.w3.org/2000/svg","path");
      let d = "";
      for(let j=0;j<=steps;j++){
        const t = j/steps * TAU;
        const rad = r.a * Math.cos(r.k*t);
        const x = rad*Math.cos(t);
        const y = rad*Math.sin(t);
        d += `${j?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`;
      }
      path.setAttribute('d', d+" Z");
      path.setAttribute('fill','none');
      path.setAttribute('stroke', `hsl(${(i*140)%360} 85% 70%)`);
      path.setAttribute('stroke-width','1.4');
      path.setAttribute('opacity','0.9');
      svg.appendChild(path);
    });
  }

  function drawGirih(svg){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const ctxNS = "http://www.w3.org/2000/svg";
    function poly(points, fill, stroke){
      const p = document.createElementNS(ctxNS,'polygon');
      p.setAttribute('points', points.map(xy=>xy.join(',')).join(' '));
      p.setAttribute('fill', fill);
      p.setAttribute('stroke', stroke||'#2a335f');
      p.setAttribute('stroke-width','1');
      return p;
    }
    const cx=120, cy=60, R=40;
    const ring = 2;
    for(let r=0;r<=ring;r++){
      const rad = R + r*28;
      for(let i=0;i<10;i++){
        const ang = (i*TAU/10);
        const x = cx + rad*Math.cos(ang);
        const y = cy + rad*Math.sin(ang);
        const deca=[];
        for(let k=0;k<10;k++){
          const a2 = ang + k*TAU/10;
          deca.push([x+16*Math.cos(a2), y+16*Math.sin(a2)]);
        }
        svg.appendChild(poly(deca, 'none', '#4b5699'));
        // kites between rings (approx)
        if(r<ring){
          const ang2 = ang + TAU/20;
          const x2 = cx + (rad+28)*Math.cos(ang2);
          const y2 = cy + (rad+28)*Math.sin(ang2);
          svg.appendChild(poly([[x,y],[x2,y2],
            [x2+10*Math.cos(ang2+TAU/2.5), y2+10*Math.sin(ang2+TAU/2.5)],
            [x+10*Math.cos(ang+TAU/2.5), y+10*Math.sin(ang+TAU/2.5)]],
            'none', '#6673cc'));
        }
      }
    }
  }

  function drawFibonacci(svg, steps=7){
    while(svg.firstChild) svg.removeChild(svg.firstChild);
    const ns="http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns,'g');
    g.setAttribute('transform','translate(20,10)');
    svg.appendChild(g);
    let x=0,y=0, size=8, dir=0;
    function rect(x,y,w,h,color){const r=document.createElementNS(ns,'rect'); r.setAttribute('x',x); r.setAttribute('y',y); r.setAttribute('width',w); r.setAttribute('height',h); r.setAttribute('fill','none'); r.setAttribute('stroke','#2a335f'); g.appendChild(r);}
    function arc(x,y,r,startA){const p=document.createElementNS(ns,'path'); const endA=startA+Math.PI/2; const sx=x+r*Math.cos(startA), sy=y+r*Math.sin(startA); const ex=x+r*Math.cos(endA), ey=y+r*Math.sin(endA); p.setAttribute('d',`M${sx},${sy} A ${r},${r} 0 0 1 ${ex},${ey}`); p.setAttribute('fill','none'); p.setAttribute('stroke','#7cf0ff'); p.setAttribute('stroke-width','1.2'); g.appendChild(p);}
    let a=1,b=1;
    for(let i=0;i<steps;i++){
      const n=a+b; a=b; b=n;
    }
    a=1;b=1;
    for(let i=0;i<steps;i++){
      const n=a+b; a=b; b=n;
      const s=a*12; // scale
      if(i===0){ x=0; y=0; size=s; rect(x,y,size,size); arc(x+size,y+size,size,Math.PI);}
      else{
        if(dir===0){ x+=size; size=s; rect(x,y,size,size); arc(x,y+size,size,Math.PI*1.5); }
        else if(dir===1){ y+=-s; size=s; rect(x,y,size,size); arc(x,y,size,0); }
        else if(dir===2){ x+=-s; size=s; rect(x,y,size,size); arc(x+size,y,size,Math.PI/2); }
        else { y+=size; size=s; rect(x,y,size,size); arc(x+size,y+size,size,Math.PI); }
        dir=(dir+1)%4;
      }
    }
  }

  // Kick everything
  (function init(){
    const sp = document.querySelector('.example-31 .spiro-path');
    if(sp) drawHypotrochoid(sp, 80, 23, 60, 10);

    const phy = document.querySelector('.example-33 .phy');
    if(phy) drawPhyllotaxis(phy, 560, 137.5, 3.3);

    const lp = document.querySelector('.example-34 .lis-path');
    if(lp) drawLissajous(lp, 5, 4, Math.PI/3);

    // Superellipse morph
    const sup = document.querySelector('.example-38 .super-path');
    if(sup){
      let n=2, dir=1;
      function tick(){
        drawSuperellipse(sup, 90, 90, n);
        n += 0.02*dir;
        if(n>6 || n<2) dir*=-1;
        requestAnimationFrame(tick);
      }
      tick();
    }

    const har = document.querySelector('.example-40 .harm-path');
    if(har) drawHarmonograph(har, {A1:80,A2:80,f1:2.01,f2:3.03,p1:0,p2:Math.PI/2,d1:0.008,d2:0.006,steps:5000});

    const rose = document.querySelector('.example-41 .rose');
    if(rose) drawRoses(rose, [{k:5,a:78},{k:8,a:56},{k:11,a:40}]);

    const gir = document.querySelector('.example-39 .girih');
    if(gir) drawGirih(gir);

    const fib = document.querySelector('.example-42 .fib');
    if(fib) drawFibonacci(fib, 7);
  })();

// ====== SHEET 8 RENDERERS ======
  const TAU2 = Math.PI*2;

  // 43) Clifford attractor density plot
  (function(){
    const c = document.querySelector('.example-43 .attractor'); if(!c) return;
    const ctx = c.getContext('2d');
    const W=c.width, H=c.height;
    const img = ctx.createImageData(W,H);
    const buf = new Uint32Array(img.data.buffer);
    // parameters
    const a=1.7, b=1.7, cC=0.6, d=1.2;
    let x=0.1, y=0.0;
    for(let i=0;i<150000;i++){
      const nx = Math.sin(a*y) + cC*Math.cos(a*x);
      const ny = Math.sin(b*x) + d*Math.cos(b*y);
      x=nx; y=ny;
      const px = Math.floor((x+2)/(4)*W);
      const py = Math.floor((y+2)/(4)*H);
      if(px>=0 && px<W && py>=0 && py<H){
        const idx = py*W+px;
        // accumulate brightness
        const old = buf[idx] & 0xff;
        const nv = Math.min(255, old+3);
        // pack as ABGR (little endian)
        buf[idx] = (255<<24) | (nv<<16) | (200<<8) | (240);
      }
    }
    ctx.putImageData(img,0,0);
  })();

  // 44) 6-way kaleidoscope parallax
  (function(){
    const box = document.querySelector('.example-44 .k6'); if(!box) return;
    const tile = box.querySelector('.tile');
    box.addEventListener('pointermove', (e)=>{
      const r = box.getBoundingClientRect();
      const cx = (e.clientX - r.left)/r.width - 0.5;
      const cy = (e.clientY - r.top)/r.height - 0.5;
      tile.style.transform = `translate(${cx*-8}px, ${cy*-8}px) rotate(${cx*8}deg) rotateX(${cy*10}deg)`;
    });
    box.addEventListener('pointerleave', ()=> tile.style.transform = '');
  })();

  // 45) Voronoi jitter field
  (function(){
    const cv = document.querySelector('.example-45 .voro'); if(!cv) return;
    const ctx = cv.getContext('2d');
    const W=cv.width, H=cv.height, N=36;
    const seeds = Array.from({length:N}, ()=>({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()*2-1)*0.2, vy:(Math.random()*2-1)*0.2}));
    function frame(){
      const img = ctx.createImageData(W,H);
      const data = img.data;
      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          let best=1e9, id=0;
          for(let i=0;i<N;i++){
            const dx=x-seeds[i].x, dy=y-seeds[i].y;
            const d=dx*dx+dy*dy;
            if(d<best){best=d; id=i;}
          }
          const hue = (id*360/N)|0;
          const off = (y*W+x)*4;
          data[off]=hue; data[off+1]=180; data[off+2]=255; data[off+3]=255;
        }
      }
      // Convert H, S, V-ish fake to RGB simple mapping
      // Here we’ll just use hue→r/g/b cycling:
      for(let i=0;i<data.length;i+=4){
        const h = data[i];
        const s = data[i+1]/255, v = data[i+2]/255;
        const f = (n)=>{
          const k=(n + h/60)%6;
          return v*(1 - s*max(min(k,4-k,1),0));
        }
      }
      // Quick & dirty: recolor via canvas gradient overlay
      ctx.putImageData(img,0,0);
      const grd = ctx.createLinearGradient(0,0,W,0);
      grd.addColorStop(0,'#7cf0ff55');
      grd.addColorStop(0.5,'#ffd36a55');
      grd.addColorStop(1,'#7cf0ff55');
      ctx.globalCompositeOperation='overlay';
      ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation='source-over';
      // move seeds
      seeds.forEach(s=>{s.x+=s.vx; s.y+=s.vy; if(s.x<0||s.x>W) s.vx*=-1; if(s.y<0||s.y>H) s.vy*=-1;});
      requestAnimationFrame(frame);
    }
    frame();
  })();

  // 46) Prime rain spiral
  (function(){
    const svg = document.querySelector('.example-46 .primes'); if(!svg) return;
    const ns = "http://www.w3.org/2000/svg";
    const N=1200, phi=(1+Math.sqrt(5))/2, k=TAU2/phi;
    // simple sieve
    const isPrime = new Uint8Array(N+1); isPrime.fill(1); isPrime[0]=isPrime[1]=0;
    for(let p=2;p*p<=N;p++) if(isPrime[p]) for(let q=p*p;q<=N;q+=p) isPrime[q]=0;
    for(let n=2;n<=N;n++){
      const r = Math.sqrt(n)*0.12*100;
      const t = n*k;
      const x = r*Math.cos(t), y = r*Math.sin(t);
      const dot = document.createElementNS(ns,'circle');
      dot.setAttribute('cx',x.toFixed(2)); dot.setAttribute('cy',y.toFixed(2));
      dot.setAttribute('r', isPrime[n]? 1.8 : 1.0);
      dot.setAttribute('fill', isPrime[n]? '#7cf0ff' : '#334');
      dot.setAttribute('opacity', isPrime[n]? '0.95' : '0.7');
      svg.appendChild(dot);
    }
  })();

  // 47) Cycloid gear machine (epitrochoid)
  (function(){
    const path = document.querySelector('.example-47 .gear-trace'); if(!path) return;
    let t=0, R=50, r=17, d=35;
    function draw(){
      let dstr=''; const steps=1200;
      for(let i=0;i<=steps;i++){
        const ang = i/steps * TAU2;
        const x = (R+r)*Math.cos(ang) - d*Math.cos(((R+r)/r)*ang + t*0.3);
        const y = (R+r)*Math.sin(ang) - d*Math.sin(((R+r)/r)*ang + t*0.3);
        dstr += (i?'L':'M')+x.toFixed(2)+','+y.toFixed(2);
      }
      path.setAttribute('d', dstr);
      path.setAttribute('fill','none'); path.setAttribute('stroke','#ffd36a'); path.setAttribute('stroke-width','1.4'); path.setAttribute('opacity','0.9');
      // slowly modulate parameters
      t+=0.02; R=50+10*Math.sin(t*0.5); r=15+4*Math.cos(t*0.3); d=28+10*Math.sin(t*0.7);
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // 48) Diffraction lattice
  (function(){
    const cv = document.querySelector('.example-48 .diff'); if(!cv) return;
    const ctx = cv.getContext('2d');
    const W=cv.width, H=cv.height;
    const waves = [
      {kx:  2.4, ky:  0.0, phase:0},
      {kx: -1.2, ky:  2.0, phase:1.2},
      {kx:  0.8, ky: -2.2, phase:2.1},
    ];
    function frame(t){
      const img = ctx.createImageData(W,H);
      const d = img.data;
      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          let amp=1;
          for(const w of waves){
            const val = Math.sin(w.kx*x/30 + w.ky*y/30 + w.phase + t*0.0015);
            amp *= (val*val); // sin^2
          }
          const i=(y*W+x)*4;
          const c = Math.floor(255*Math.min(1, amp*1.6));
          d[i]=c; d[i+1]=c*0.9; d[i+2]=255; d[i+3]=255;
        }
      }
      ctx.putImageData(img,0,0);
      requestAnimationFrame(frame);
    }
    frame(0);
  })();

// ====== SHEETS 9 & 10 RENDERERS ======
  // 49) Fake reaction–diffusion via feedback
  (function(){
    const cv=document.querySelector('.example-49 .rd'); if(!cv) return;
    const ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    // seed noise
    const img = ctx.createImageData(W,H);
    for(let i=0;i<img.data.length;i+=4){
      const n = Math.random()*255;
      img.data[i]=n; img.data[i+1]=n; img.data[i+2]=n; img.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);
    function frame(t){
      // blur + high-pass
      ctx.filter='blur(1.2px)'; ctx.drawImage(cv,0,0);
      ctx.filter='none';
      const d = ctx.getImageData(0,0,W,H);
      const a = d.data;
      for(let i=0;i<a.length;i+=4){
        const v = a[i]; // grayscale
        const hp = Math.max(0, v-128)*1.3; // high-pass
        const th = hp>40 ? 255 : 0;       // threshold
        a[i]=a[i+1]=a[i+2]= (v*0.92 + th*0.25); // feedback
      }
      ctx.putImageData(d,0,0);
      // soft tint overlay
      ctx.globalCompositeOperation='screen';
      const g=ctx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,'#7cf0ff22'); g.addColorStop(1,'#ffd36a22');
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
      ctx.globalCompositeOperation='source-over';
      requestAnimationFrame(frame);
    }
    frame(0);
  })();

  // 51) Conformal grid illusion
  (function(){
    const svg = document.querySelector('.example-51 .conf'); if(!svg) return;
    const ns = "http://www.w3.org/2000/svg";
    const lines= [];
    function addLine(points,color){
      const p = document.createElementNS(ns,'polyline');
      p.setAttribute('points', points.map(p=>p.join(',')).join(' '));
      p.setAttribute('fill','none'); p.setAttribute('stroke', color); p.setAttribute('stroke-width','0.8');
      p.setAttribute('opacity','0.9'); svg.appendChild(p);
      lines.push(p);
    }
    const W=240, H=120;
    const cols=12, rows=6;
    const alpha = 3000; // strength
    function warp(x,y){
      const r2 = x*x + y*y + 1e-3;
      const s = alpha / r2;
      return [x + x*s*0.0002, y + y*s*0.0002];
    }
    // verticals
    for(let i=0;i<=cols;i++){
      const x = -120 + (i/cols)*240;
      const pts=[];
      for(let j=0;j<=240;j++){
        const y = -60 + j/240*120;
        pts.push(warp(x,y));
      }
      addLine(pts, i%2? '#2a335f':'#44518a');
    }
    // horizontals
    for(let j=0;j<=rows;j++){
      const y = -60 + (j/rows)*120;
      const pts=[];
      for(let i=0;i<=240;i++){
        const x = -120 + i/240*240;
        pts.push(warp(x,y));
      }
      addLine(pts, j%2? '#2a335f':'#44518a');
    }
  })();

  // 53) SuperShape
  (function(){
    const path = document.querySelector('.example-53 .ss-path'); if(!path) return;
    let m=5, n1=0.3, n2=1.7, n3=1.7, a=1, b=1;
    function r(phi){
      const t1 = Math.pow(Math.abs(Math.cos(m*phi/4)/a), n2);
      const t2 = Math.pow(Math.abs(Math.sin(m*phi/4)/b), n3);
      return Math.pow(t1+t2, -1/n1);
    }
    function draw(){
      let d=""; const steps=800, R=90;
      for(let i=0;i<=steps;i++){
        const t = i/steps * Math.PI*2;
        const rr = r(t)*R;
        const x = rr*Math.cos(t), y= rr*Math.sin(t);
        d += (i?'L':'M')+x.toFixed(2)+','+y.toFixed(2);
      }
      path.setAttribute('d', d+' Z');
      path.setAttribute('fill','none'); path.setAttribute('stroke','#7cf0ff'); path.setAttribute('stroke-width','1.6');
      // gentle parameter wander
      m += 0.003;
      n1 = 0.3 + 0.2*Math.sin(m*0.7);
      requestAnimationFrame(draw);
    }
    draw();
  })();

  // 54) Domain coloring f(z)=z^3 - 1
  (function(){
    const cv = document.querySelector('.example-54 .domain'); if(!cv) return;
    const ctx = cv.getContext('2d');
    const W=cv.width, H=cv.height;
    function render(t){
      const img=ctx.createImageData(W,H); const d=img.data;
      for(let y=0;y<H;y++){
        for(let x=0;x<W;x++){
          const zx = (x/W-0.5)*3.2; const zy = (y/H-0.5)*1.6;
          // f(z)=z^3 - 1
          const zx2=zx*zx - zy*zy; const zy2=2*zx*zy;
          let rx = zx*zx2 - zy*zy2 - 1;  // real
          let ry = zx*zy2 + zy*zx2;      // imag
          const mag = Math.hypot(rx,ry);
          const arg = Math.atan2(ry,rx); // -pi..pi
          const hue = (arg/ (Math.PI*2) + 0.5)*360;
          const v = (Math.sin(mag*2 + t*0.0015)*0.5+0.5)*0.8 + 0.2;
          const c = hsv(hue, 0.8, v);
          const i=(y*W+x)*4; d[i]=c[0]; d[i+1]=c[1]; d[i+2]=c[2]; d[i+3]=255;
        }
      }
      ctx.putImageData(img,0,0);
      requestAnimationFrame(render);
    }
    function hsv(h,s,v){
      const f=(n,k=(n+h/60)%6)=> v - v*s*max(min(k,4-k,1),0);
      const max=(a,b)=>a>b?a:b, min=(a,b,c)=>Math.min(a,Math.min(b,c));
      return [f(5)*255, f(3)*255, f(1)*255];
    }
    render(0);
  })();

  // 55) Rule 110
  (function(){
    const cv = document.querySelector('.example-55 .rule'); if(!cv) return;
    const ctx = cv.getContext('2d');
    const W=cv.width, H=cv.height, cell=2;
    const cols = Math.floor(W/cell), rows = Math.floor(H/cell);
    let row = new Uint8Array(cols);
    row[Math.floor(cols/2)]=1;
    const rule = 0b01101110; // 110
    function stepRow(prev){
      const next = new Uint8Array(prev.length);
      for(let i=0;i<prev.length;i++){
        const l=prev[(i-1+cols)%cols], c=prev[i], r=prev[(i+1)%cols];
        const idx = (l<<2)|(c<<1)|r;
        next[i] = (rule>>idx)&1;
      }
      return next;
    }
    for(let y=0;y<rows;y++){
      for(let x=0;x<cols;x++){
        ctx.fillStyle = row[x] ? '#7cf0ff' : '#101636';
        ctx.fillRect(x*cell,y*cell,cell,cell);
      }
      row = stepRow(row);
    }
  })();

  // 57) Magnetic orbs
  (function(){
    const cv=document.querySelector('.example-57 .orbs'); if(!cv) return;
    const ctx=cv.getContext('2d');
    const W=cv.width, H=cv.height;
    const N=28;
    const orbs = Array.from({length:N}, (_,i)=>{
      const x = (i%7+0.5)*(W/7);
      const y = (Math.floor(i/7)+0.5)*(H/4);
      return {ax:x, ay:y, x, y, vx:0, vy:0};
    });
    let mx=W/2, my=H/2;
    cv.addEventListener('pointermove',(e)=>{const r=cv.getBoundingClientRect(); mx=e.clientX-r.left; my=e.clientY-r.top;});
    function frame(){
      ctx.clearRect(0,0,W,H);
      orbs.forEach(o=>{
        const dx=o.x-mx, dy=o.y-my;
        const d2=dx*dx+dy*dy+1;
        const f = 5000/d2; // repulsion
        o.vx += dx/Math.sqrt(d2)*f*0.02 + (o.ax-o.x)*0.01;
        o.vy += dy/Math.sqrt(d2)*f*0.02 + (o.ay-o.y)*0.01;
        o.vx*=0.92; o.vy*=0.92;
        o.x+=o.vx; o.y+=o.vy;
        // draw
        const r=6;
        const grd = ctx.createRadialGradient(o.x-2,o.y-3,1,o.x,o.y,r+4);
        grd.addColorStop(0,'#fff'); grd.addColorStop(1,'#7cf0ff');
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(o.x,o.y,r,0,Math.PI*2); ctx.fill();
      });
      requestAnimationFrame(frame);
    }
    frame();
  })();

  // 58) Chromaburst pointer reactive
  (function(){
    const el=document.querySelector('.example-58 .chromatext'); if(!el) return;
    const box=el.parentElement;
    box.addEventListener('pointermove',(e)=>{
      const r=box.getBoundingClientRect();
      const cx=(e.clientX-r.left)/r.width-0.5;
      const cy=(e.clientY-r.top)/r.height-0.5;
      const angle = Math.atan2(cy,cx);
      el.style.background = `conic-gradient(from ${angle}rad, #7cf0ff, #ffd36a, #7cf0ff)`;
      el.style.transform = `rotateX(${cy*8}deg) rotateY(${cx*-8}deg)`;
    });
    box.addEventListener('pointerleave',()=>{el.style.transform=''; el.style.background='conic-gradient(#7cf0ff,#ffd36a,#7cf0ff)';});
  })();

  // 60) Poincaré-ish arcs
  (function(){
    const svg = document.querySelector('.example-60 .poin'); if(!svg) return;
    const ns="http://www.w3.org/2000/svg";
    function arc(cx,cy,r,start,end,color){
      const p=document.createElementNS(ns,'path');
      const sx=cx+r*Math.cos(start), sy=cy+r*Math.sin(start);
      const ex=cx+r*Math.cos(end),   ey=cy+r*Math.sin(end);
      const large = (end-start)% (Math.PI*2) > Math.PI ? 1:0;
      p.setAttribute('d',`M${sx},${sy} A ${r},${r} 0 ${large} 1 ${ex},${ey}`);
      p.setAttribute('fill','none'); p.setAttribute('stroke',color); p.setAttribute('opacity','0.9'); p.setAttribute('stroke-width','1');
      svg.appendChild(p);
    }
    // unit disk boundary
    const bd = document.createElementNS(ns,'circle');
    bd.setAttribute('cx',0); bd.setAttribute('cy',0); bd.setAttribute('r',100);
    bd.setAttribute('fill','none'); bd.setAttribute('stroke','#2a335f'); svg.appendChild(bd);
    // pack arcs roughly orthogonal
    for(let k=0;k<18;k++){
      const th = k*(Math.PI*2/18);
      const r = 100+ 30*Math.sin(k*2);
      arc(0,0,r, th-1.1, th+1.1, k%2? '#44518a':'#7cf0ff');
    }
  })();
  
  // Slow down all animations to reduce flashing
  (function() {
    const slowdown = 2; // Multiply animation durations by this factor
    
    // Actually modify computed styles - process each duration in comma-separated list
    const allElements = document.querySelectorAll('.preview *');
    allElements.forEach(el => {
      const computed = window.getComputedStyle(el);
      const animDuration = computed.animationDuration;
      if (animDuration && animDuration !== '0s' && animDuration !== 'none') {
        // Split by comma to handle multiple animations, then process each duration
        const durations = animDuration.split(',').map(d => d.trim()).filter(d => d && d !== 'none' && d !== '0s');
        if (durations.length === 0) return;
        
        const slowedDurations = durations.map(duration => {
          // Replace all duration values in this string (handles multiple durations like "1s 2s 3s")
          // Use replace with a function to replace all occurrences - the 'g' flag ensures all matches are replaced
          return duration.replace(/([\d.]+)([a-z]+)/g, (match, value, unit) => {
            const numValue = parseFloat(value);
            if (isNaN(numValue) || numValue <= 0) return match; // Skip invalid values
            const slowedValue = numValue * slowdown;
            return `${slowedValue}${unit}`;
          });
        });
        el.style.animationDuration = slowedDurations.join(', ');
      }
    });
  })();