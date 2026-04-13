/**
 * Pre-ES-module Safari bootstrap: positions nav orbit bubbles around #errl.
 * ES5-only (no const/let/arrows/template strings/optional chaining).
 * Loaded with nomodule; module-capable browsers skip this file.
 */
(function () {
  var navOrbitSpeed = 1;
  var navRadius = 1;
  var navOrbScale = 1;
  var bubblesInitialized = false;
  var bubbles = [];
  var lastOrbitUpdate = 0;

  var rAF =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (cb) {
      return window.setTimeout(function () {
        cb(new Date().getTime());
      }, 16);
    };

  function $(id) {
    return document.getElementById(id);
  }

  function clamp(value, min, max) {
    if (typeof value !== 'number' || value !== value) return min;
    if (min > max) return value;
    return Math.min(max, Math.max(min, value));
  }

  function isFin(v) {
    return typeof v === 'number' && isFinite(v) && !isNaN(v);
  }

  function getEstimatedBubbleRadiusPx(scale) {
    var w = window.innerWidth;
    var base = clamp(w * 0.096, 67, 118);
    var s = isFin(scale) ? scale : 1;
    return 0.5 * base * s;
  }

  function initializeBubbles() {
    if (bubblesInitialized) return true;
    var errl = $('errl');
    if (!errl) return false;
    var list = document.querySelectorAll('.nav-orbit .bubble');
    bubbles = [];
    var i;
    for (i = 0; i < list.length; i++) {
      bubbles.push(list[i]);
    }
    if (bubbles.length === 0) return false;
    var orbitFront = $('navOrbit');
    var orbitBehind = $('navOrbitBehind');
    if (orbitFront) orbitFront.style.zIndex = '2';
    if (orbitBehind) orbitBehind.style.zIndex = '0';
    errl.style.zIndex = '1';
    bubblesInitialized = true;
    return true;
  }

  function placeBubble(el, index, count, cx, cy, tSec, pad, bubbleRadiusPx, viewportScale, orbitFront, orbitBehind) {
    var baseAngleDeg = parseFloat(el.getAttribute('data-angle') || '');
    var baseDist = parseFloat(el.getAttribute('data-dist') || '160');
    var speedDegPerSec = 12 * navOrbitSpeed;
    var wobbleAmpDeg = 3.5 * clamp(navOrbitSpeed, 0, 2);
    var radiusWobble = 10 * viewportScale * clamp(navOrbitSpeed, 0, 2);
    var angleDeg =
      (isFin(baseAngleDeg) ? baseAngleDeg : (index / Math.max(1, count)) * 360) +
      tSec * speedDegPerSec +
      Math.sin(tSec * 0.65 + index * 1.7) * wobbleAmpDeg;
    var rad = (angleDeg * Math.PI) / 180;
    var dist =
      (isFin(baseDist) ? baseDist : 160) * navRadius * viewportScale +
      Math.sin(tSec * 0.9 + index * 1.3) * radiusWobble;
    var rawX = cx + Math.cos(rad) * dist;
    var rawY = cy + Math.sin(rad) * dist;
    if (!isFin(rawX) || !isFin(rawY)) return;
    var x = clamp(rawX, pad + bubbleRadiusPx, window.innerWidth - pad - bubbleRadiusPx);
    var y = clamp(rawY, pad + bubbleRadiusPx, window.innerHeight - pad - bubbleRadiusPx);
    var hysteresis = 10;
    var currentlyBehind = el.parentNode === orbitBehind;
    var shouldBeBehind = currentlyBehind;
    if (y > cy + hysteresis) shouldBeBehind = true;
    else if (y < cy - hysteresis) shouldBeBehind = false;
    var targetParent = shouldBeBehind ? orbitBehind : orbitFront;
    if (targetParent && el.parentNode !== targetParent) {
      targetParent.appendChild(el);
    }
    el.style.position = 'absolute';
    el.style.left = x.toFixed(2) + 'px';
    el.style.top = y.toFixed(2) + 'px';
    el.style.pointerEvents = 'auto';
    if (el.classList) {
      if (shouldBeBehind) el.classList.add('bubble--behind');
      else el.classList.remove('bubble--behind');
    } else {
      if (shouldBeBehind) {
        if ((' ' + el.className + ' ').indexOf(' bubble--behind ') < 0) {
          el.className = el.className ? el.className + ' bubble--behind' : 'bubble--behind';
        }
      } else {
        el.className = (' ' + el.className + ' ')
          .replace(/\s+bubble--behind\s+/g, ' ')
          .replace(/^\s+|\s+$/g, '');
      }
    }
  }

  function updateBubbles(ts) {
    if (ts == null || ts !== ts) ts = new Date().getTime();
    if (!bubblesInitialized) {
      if (!initializeBubbles()) {
        rAF(updateBubbles);
        return;
      }
    }
    var errl = $('errl');
    if (!errl) {
      bubblesInitialized = false;
      rAF(updateBubbles);
      return;
    }
    var orbitIntervalMs = 16;
    try {
      if (document.body && document.body.className.indexOf('perf-safe') >= 0) {
        orbitIntervalMs = 33;
      }
    } catch (e1) {}
    if (ts - lastOrbitUpdate < orbitIntervalMs) {
      rAF(updateBubbles);
      return;
    }
    lastOrbitUpdate = ts;
    var rect = errl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      rAF(updateBubbles);
      return;
    }
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var minViewport = Math.min(window.innerWidth, window.innerHeight);
    var viewportScale = clamp(minViewport / 900, 0.55, 1.05);
    var active = [];
    var j;
    for (j = 0; j < bubbles.length; j++) {
      var bel = bubbles[j];
      if (bel && bel.style.display !== 'none') active.push(bel);
    }
    var orbitFront = $('navOrbit');
    var orbitBehind = $('navOrbitBehind');
    if (!orbitFront || !orbitBehind) {
      rAF(updateBubbles);
      return;
    }
    orbitFront.style.zIndex = '2';
    orbitBehind.style.zIndex = '0';
    errl.style.zIndex = '1';
    var pad = 10;
    var tSec = ts * 0.001;
    var bubbleRadiusPx = getEstimatedBubbleRadiusPx(navOrbScale);
    var k;
    for (k = 0; k < active.length; k++) {
      placeBubble(
        active[k],
        k,
        active.length,
        cx,
        cy,
        tSec,
        pad,
        bubbleRadiusPx,
        viewportScale,
        orbitFront,
        orbitBehind
      );
    }
    rAF(updateBubbles);
  }

  var html = document.documentElement;
  html.className = (html.className ? html.className + ' ' : '') + 'portal-legacy';

  var orbitFrontInit = $('navOrbit');
  var orbitBehindInit = $('navOrbitBehind');
  var errlInit = $('errl');
  if (orbitFrontInit) orbitFrontInit.style.zIndex = '2';
  if (orbitBehindInit) orbitBehindInit.style.zIndex = '0';
  if (errlInit) errlInit.style.zIndex = '1';

  rAF(updateBubbles);
})();
