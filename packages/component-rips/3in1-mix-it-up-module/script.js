(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // tab logic
  const views = { ripple: "view-ripple", kaleido: "view-kaleido", moire: "view-moire" };
  function show(tab) {
    for (const k in views) {
      document.getElementById(views[k]).classList.toggle("active", k === tab);
    }
  }
  document.querySelectorAll(".btn[data-tab]").forEach((b) => (b.onclick = () => show(b.dataset.tab)));
  addEventListener("keydown", (e) => {
    if (e.key === "1") show("ripple");
    if (e.key === "2") show("kaleido");
    if (e.key === "3") show("moire");
    if (e.key.toLowerCase() === "g") document.documentElement.classList.toggle("glow");
    if (e.key.toLowerCase() === "r") location.reload();
  });

  // 1) RIPPLE — minimal height-field (no images, no CORS)
  (function () {
    const c = document.getElementById("rip"),
      x = c.getContext("2d", { alpha: false });
    let w, h, A, B;
    const damp = 0.988;
    function fit() {
      w = c.width = c.parentElement.clientWidth;
      h = c.height = c.parentElement.clientHeight;
      A = new Float32Array(w * h);
      B = new Float32Array(w * h);
    }
    new ResizeObserver(fit).observe(c.parentElement);
    fit();
    function disturb(X, Y, r, s) {
      X |= 0;
      Y |= 0;
      for (let j = -r; j <= r; j++)
        for (let i = -r; i <= r; i++) {
          if (i * i + j * j <= r * r) {
            const id = (Y + j) * w + (X + i);
            if (id >= 0 && id < A.length) A[id] += s;
          }
        }
    }
    c.addEventListener("pointerdown", (e) => {
      const rect = c.getBoundingClientRect();
      disturb(e.clientX - rect.left, e.clientY - rect.top, 16, 1000);
    });
    c.addEventListener("pointermove", (e) => {
      if (e.buttons & 1) {
        const rect = c.getBoundingClientRect();
        disturb(e.clientX - rect.left, e.clientY - rect.top, 10, 350);
      }
    });

    // gentle intro ripples
    if (!reducedMotion) {
      setTimeout(() => {
        disturb(w * 0.3, h * 0.4, 24, 1200);
        disturb(w * 0.65, h * 0.55, 18, 900);
      }, 300);
    }

    function step() {
      if (reducedMotion) return;
      for (let y = 1; y < h - 1; y++) {
        for (let x0 = 1; x0 < w - 1; x0++) {
          const id = y * w + x0;
          B[id] = ((A[id - 1] + A[id + 1] + A[id - w] + A[id + w]) * 0.5 - B[id]) * damp;
        }
      }
      [A, B] = [B, A];
    }
    function draw() {
      if (reducedMotion) {
        x.fillStyle = "#070711";
        x.fillRect(0, 0, w, h);
        return;
      }
      const img = x.getImageData(0, 0, w, h),
        d = img.data;
      for (let y = 1; y < h - 1; y++) {
        for (let x0 = 1; x0 < w - 1; x0++) {
          const id = y * w + x0,
            di = id * 4;
          const nx = A[id] - A[id - 1],
            ny = A[id] - A[id - w];
          const shade = nx + ny;
          d[di] = 25 + shade * 200; // R
          d[di + 1] = 50 + shade * 140; // G
          d[di + 2] = 120 + shade * 220; // B
          d[di + 3] = 255;
        }
      }
      x.putImageData(img, 0, 0);
    }
    function loop() {
      step();
      draw();
      if (!reducedMotion) {
        requestAnimationFrame(loop);
      }
    }
    // Start loop only if not reduced motion, otherwise draw static state once
    if (!reducedMotion) {
      requestAnimationFrame(loop);
    } else {
      draw(); // Draw static state once
    }
  })();

  // 2) KALEIDO — pure canvas lines (always visible, no inputs)
  (function () {
    const cv = document.getElementById("kal"),
      cx = cv.getContext("2d", { alpha: false });
    function fit() {
      cv.width = cv.parentElement.clientWidth;
      cv.height = cv.parentElement.clientHeight;
    }
    new ResizeObserver(fit).observe(cv.parentElement);
    fit();
    let t = 0;
    function loop() {
      if (reducedMotion) {
        cx.fillStyle = "#070711";
        cx.fillRect(0, 0, cv.width, cv.height);
        return;
      }
      const W = cv.width,
        H = cv.height;
      cx.fillStyle = "#070711";
      cx.fillRect(0, 0, W, H);
      const cx0 = W / 2,
        cy0 = H / 2;
      for (let i = 0; i < 160; i++) {
        const a = (i / 160) * Math.PI * 2 + t / 1800;
        const rr = 180 + 120 * Math.sin(i / 7 + t / 900);
        const x = cx0 + Math.cos(a) * rr * 1.5;
        const y = cy0 + Math.sin(a) * rr * 0.9;
        const hue = (i * 3 + t / 40) % 360;
        cx.strokeStyle = `hsl(${hue},90%,60%)`;
        cx.lineWidth = 1.5;
        cx.beginPath();
        cx.arc(x, y, 10 + 6 * Math.sin(a * 2 + t / 700), 0, 7);
        cx.stroke();
      }
      t += 16;
      requestAnimationFrame(loop);
    }
    // Start loop only if not reduced motion, otherwise draw static state once
    if (!reducedMotion) {
      requestAnimationFrame(loop);
    } else {
      loop(); // Draw static state once
    }
  })();

  // 3) MOIRÉ — SVG rotating pattern (always safe)
  (function () {
    const svg = document.getElementById("mr");
    const NS = svg.namespaceURI;

    // base pattern
    const defs = document.createElementNS(NS, "defs");
    const pat = document.createElementNS(NS, "pattern");
    pat.setAttribute("id", "p");
    pat.setAttribute("patternUnits", "userSpaceOnUse");
    pat.setAttribute("width", "44");
    pat.setAttribute("height", "44");
    const r = document.createElementNS(NS, "rect");
    r.setAttribute("width", "44");
    r.setAttribute("height", "44");
    r.setAttribute("fill", "#0b0b14");
    const c = document.createElementNS(NS, "circle");
    c.setAttribute("cx", "22");
    c.setAttribute("cy", "22");
    c.setAttribute("r", "10");
    c.setAttribute("fill", "#242449");
    const ring = document.createElementNS(NS, "circle");
    ring.setAttribute("cx", "22");
    ring.setAttribute("cy", "22");
    ring.setAttribute("r", "18");
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "#393979");
    ring.setAttribute("stroke-width", "1.2");
    pat.append(r, c, ring);
    defs.append(pat);
    svg.append(defs);

    const A = document.createElementNS(NS, "rect");
    A.setAttribute("width", "100%");
    A.setAttribute("height", "100%");
    A.setAttribute("fill", "url(#p)");
    const B = document.createElementNS(NS, "rect");
    B.setAttribute("width", "100%");
    B.setAttribute("height", "100%");
    B.setAttribute("fill", "url(#p)");
    B.style.mixBlendMode = "screen";
    B.style.opacity = ".7";
    svg.append(A, B);

    let t = 0;
    function loop() {
      if (!reducedMotion) {
        B.setAttribute("transform", `rotate(${t / 100} 500 350)`);
        t += 16;
        requestAnimationFrame(loop);
      }
    }
    // Start loop only if not reduced motion
    if (!reducedMotion) {
      requestAnimationFrame(loop);
    }
  })();
})();

