/**
 * Returns a standalone HTML snippet that animates the Errl rig in vanilla JS.
 */
export const getErrlExportSnippet = (): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Errl Rig</title>
</head>
<body style="background:#050508; display:flex; align-items:center; justify-content:center; height:100vh;">
  <div id="errl-container" style="width: 300px; height: 300px; background: #050508; display: flex; align-items: center; justify-content: center; border-radius: 20px;">
    <svg id="errl-svg" viewBox="0 0 100 100" style="width: 80%; height: 80%; overflow: visible;">
      <path id="errl-shadow" d="M50 15 C70 15 85 35 85 55 S70 90 50 90 S15 75 15 55 S30 15 50 15" fill="rgba(176, 38, 255, 0.2)" />
      <path id="errl-body" d="M50 10 C75 10 90 30 90 55 S75 95 50 95 S10 80 10 55 S25 10 50 10" fill="none" stroke="#00ff9d" stroke-width="1.5" />
      <circle id="errl-bubble" cx="40" cy="40" r="4" fill="#00ff9d" opacity="0.6" />
      <path id="errl-trail" d="M10 0 C6 10 14 20 10 30 C6 40 14 50 10 60" transform="translate(45 60)" fill="none" stroke="#00ff9d" stroke-width="1" />
    </svg>
  </div>
  <script>
    (function() {
      const body = document.getElementById('errl-body');
      const bubble = document.getElementById('errl-bubble');
      const svg = document.getElementById('errl-svg');
      const start = performance.now();
      function animate() {
        const t = (performance.now() - start) / 1000;
        // Master float
        const floatY = Math.sin(t * 0.8) * 5;
        svg.style.transform = 'translateY(' + floatY + 'px)';
        // Breathe
        const breathe = 1 + Math.sin(t * 0.5) * 0.03;
        body.style.transform = 'scale(' + breathe + ')';
        body.style.transformOrigin = 'center';
        // Flicker
        const flicker = 0.4 + (Math.random() > 0.98 ? 0.4 : 0);
        bubble.style.opacity = flicker;
        // Color cycle
        const hue = (t * 20) % 360;
        body.style.stroke = 'hsl(' + hue + ', 100%, 50%)';
        requestAnimationFrame(animate);
      }
      animate();
    })();
  </script>
</body>
</html>`;
};
