const cssInput = document.getElementById('cssInput');
const htmlInput = document.getElementById('htmlInput');
const jsInput = document.getElementById('jsInput');
const liveToggle = document.getElementById('liveToggle');
const compileBtn = document.getElementById('compileBtn');
const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
const downloadCssBtn = document.getElementById('downloadCssBtn');
const downloadJsBtn = document.getElementById('downloadJsBtn');
const preview = /** @type {HTMLIFrameElement} */ (document.getElementById('preview'));
const statusEl = document.getElementById('status');
let currentPreviewUrl = '';
function setPreviewDocument(html) {
  let succeeded = false;
  // Primary: srcdoc
  try { preview.srcdoc = html; succeeded = true; } catch {}
  // Fallback: Blob URL
  if (!succeeded) {
    try {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      preview.addEventListener('load', () => {
        if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
        currentPreviewUrl = url;
      }, { once: true });
      preview.src = url;
      succeeded = true;
    } catch {}
  }
  // Ultimate fallback: direct document.write
  if (!succeeded) {
    try {
      const doc = preview.contentWindow && preview.contentWindow.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
        succeeded = true;
      }
    } catch {}
  }
  if (!succeeded) setStatus('Failed to render preview', true);
}

const LS_KEY = 'errl-asset-builder-v1';

function setStatus(msg, isError = false) {
  statusEl.textContent = msg || '';
  statusEl.classList.toggle('error', !!isError);
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return;
    const { css, js, html } = JSON.parse(raw);
    if (typeof css === 'string') cssInput.value = css;
    if (typeof js === 'string') jsInput.value = js;
    if (typeof html === 'string' && htmlInput) htmlInput.value = html;
  } catch {}
}

function saveState() {
  try {
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ css: cssInput.value, js: jsInput.value, html: htmlInput ? htmlInput.value : '' })
    );
  } catch {}
}

async function minifyCSS(code) {
  try {
    if (window.csso && typeof window.csso.minify === 'function') {
      return window.csso.minify(code).css;
    }
  } catch (e) {
    console.error(e);
  }
  return code; // fallback
}

async function minifyJS(code) {
  try {
    if (window.Terser && typeof window.Terser.minify === 'function') {
      const result = await window.Terser.minify(code);
      if (result.code) return result.code;
    }
  } catch (e) {
    console.error(e);
  }
  return code; // fallback
}

function buildSrcDoc(css, html, js) {
  return `<!doctype html>\n<html><head><meta charset="utf-8"/><style>${css}</style></head><body>${html}<script>${js}<\/script></body></html>`;
}

async function compileAndPreview() {
  setStatus('Compiling...');
  saveState();
  try {
    const [mc, mj] = await Promise.all([minifyCSS(cssInput.value), minifyJS(jsInput.value)]);
    const html = htmlInput ? htmlInput.value : '';
    const doc = buildSrcDoc(mc, html, mj);
    setPreviewDocument(doc);
    setStatus(`Compiled successfully. CSS:${mc.length} HTML:${(html||'').length} JS:${mj.length}`);
    return { css: mc, html, js: mj };
  } catch (e) {
    console.error(e);
    setStatus(String(e?.message || e), true);
    return { css: cssInput.value, html: htmlInput.value, js: jsInput.value };
  }
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Wire up
loadState();
compileBtn.addEventListener('click', compileAndPreview);
liveToggle.addEventListener('change', () => {
  if (liveToggle.checked) compileAndPreview();
});

let liveTimer = 0;
function scheduleLive() {
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    if (liveToggle.checked) compileAndPreview();
  }, 250);
}

cssInput.addEventListener('input', scheduleLive);
if (htmlInput) htmlInput.addEventListener('input', scheduleLive);
jsInput.addEventListener('input', scheduleLive);

// Initial preview
compileAndPreview();
// Also re-run after window load in case CDN minifiers arrive later
window.addEventListener('load', () => {
  compileAndPreview();
});

downloadCssBtn.addEventListener('click', async () => {
  const { css } = await compileAndPreview();
  download('styles.min.css', css, 'text/css');
});

downloadHtmlBtn.addEventListener('click', async () => {
  const { css, html, js } = await compileAndPreview();
  const doc = buildSrcDoc(css, html, js);
  download('index.min.html', doc, 'text/html');
});

downloadJsBtn.addEventListener('click', async () => {
  const { js } = await compileAndPreview();
  download('script.min.js', js, 'application/javascript');
});
