import { isReducedMotion } from '../_shared/utils.js';

const en = document.getElementById('enamel');
const tw = document.getElementById('tw');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function applyFallback(){ en.classList.add('fallback'); }

let paintOk = false;
(async function init(){
  try {
    if ('paintWorklet' in CSS) {
      await CSS.paintWorklet.addModule('./sparkle.js');
      paintOk = true;
    }
  } catch (e) {
    paintOk = false;
  }
  if (!paintOk) applyFallback();
})();

(function tick(t){
  const base = parseFloat(tw.value) || 0;
  const v = reduce.matches ? Math.min(base, 2) : base + t/1000;
  en.style.setProperty('--twinkle', v.toFixed(2));
  requestAnimationFrame(tick);
})(0);
