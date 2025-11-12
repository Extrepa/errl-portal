// === Utility ===
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

const PX_TO_MM = 0.2645833333; // 96dpi px→mm

function onReady(fn){ if (document.readyState!=='loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

// Clamp stack within viewport
function clampInViewport(el) {
  const r = el.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  let dx = 0, dy = 0;
  if (r.right > vw) dx = vw - r.right - 8;
  if (r.left < 0) dx = -r.left + 8;
  if (r.bottom > vh) dy = vh - r.bottom - 8;
  if (r.top < 0) dy = -r.top + 8;
  el.style.transform = `translate(${dx}px, ${dy}px)`;
  // Reset after a tick so further moves are measured relative to new pos
  setTimeout(()=>{ el.style.transform = ''; }, 150);
}

// === State ===
const state = {
  selectedIds: new Set(),
  styleMode: 'solid', // 'solid' | 'gradient'
  animated: false,
  useRainbow: false,
  usePalettes: false,
  chosenPalettes: [], // names
  paletteColors: [],  // flattened colors for choose color grid
  plating: '#e5eef7',
  thickness: { all: 6, body: 3, face: 3 },
  glitter: false,
  glow: false
};

// Regions (paths may live inside groups)
const regions = {
  'region-body': $('#region-body'),
  'region-face': $('#region-face'),
  'region-eyeL': $('#region-eyeL'),
  'region-eyeR': $('#region-eyeR'),
  'region-mouth': $('#region-mouth')
};

const outline = $('#outline-plating');
const svg = $('#errlSVG');

// Give each region a fill initial
Object.values(regions).forEach(g => {
  const p = g.querySelector('path');
  if (p) p.setAttribute('fill', '#000000');
});


// === UI wiring ===
const customizer = $('#customizer');
const toggleParts = $('#toggleParts');
const czMin = $('#czMin');
const czClose = $('#czClose');
const czHeader = $('#czHeader');

// Position the "Customize" button ~1in from Errl's bottom-right
function positionCustomizeBtn(){
  try{
    const btn = toggleParts; if(!btn) return;
    const svgBox = $('#errlSVG').getBoundingClientRect();
    const pxPerIn = 96; // CSS inches
    const margin = Math.max(64, Math.min(140, pxPerIn)); // clamp 64-140
    const btnRect = btn.getBoundingClientRect();
    let left = svgBox.right + margin;
    let top  = svgBox.bottom + margin;
    // Clamp to viewport
    left = Math.min(window.innerWidth - btnRect.width - 12, left);
    top  = Math.min(window.innerHeight - btnRect.height - 12, top);
    // If Errl is near right/bottom edges, keep inside with small offset
    left = Math.max(12, left);
    top  = Math.max(12, top);
    btn.style.left = left + 'px';
    btn.style.top  = top + 'px';
    btn.style.right = 'auto';
    btn.style.bottom = 'auto';
  }catch(_){/* ignore */}
}

window.addEventListener('resize', positionCustomizeBtn);
window.addEventListener('orientationchange', positionCustomizeBtn);
window.addEventListener('errl-customizer-change', positionCustomizeBtn, { passive:true });
window.addEventListener('load', positionCustomizeBtn);

toggleParts.addEventListener('click', () => {
  // open and un-minimize
  customizer.style.display = 'flex';
  customizer.dataset.minimized = 'false';
});

czClose.addEventListener('click', () => {
  customizer.style.display = 'none';
});

let lastPanelPos = null;
czMin.addEventListener('click', () => {
  const willMin = customizer.dataset.minimized !== 'true';
  if (willMin) {
    const r = customizer.getBoundingClientRect();
    lastPanelPos = { left: r.left, top: r.top };
    customizer.dataset.minimized = 'true';
  } else {
    customizer.dataset.minimized = 'false';
    if (lastPanelPos) {
      customizer.style.left = Math.max(8, lastPanelPos.left) + 'px';
      customizer.style.top = Math.max(8, lastPanelPos.top) + 'px';
      customizer.style.transform = '';
    }
  }
});

// Draggable
function makeDraggable(panel, handleSel){
  const handle = handleSel ? panel.querySelector(handleSel) : panel;
  if (!handle) return;
  let isDrag=false, sx=0, sy=0, ox=0, oy=0;
  handle.style.cursor = 'move';
  handle.addEventListener('mousedown', (e)=>{
    isDrag=true; sx=e.clientX; sy=e.clientY;
    const r = panel.getBoundingClientRect();
    ox=r.left; oy=r.top;
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!isDrag) return;
    const dx=e.clientX-sx, dy=e.clientY-sy;
    panel.style.position = 'fixed';
    panel.style.left = Math.max(8, Math.min(window.innerWidth-50, ox+dx))+'px';
    panel.style.top = Math.max(8, Math.min(window.innerHeight-50, oy+dy))+'px';
  });
  window.addEventListener('mouseup', ()=> isDrag=false);
}
(function makePanelDraggable(panel, handle){
  let isDrag=false, sx=0, sy=0, ox=0, oy=0;
  handle.addEventListener('mousedown', (e)=>{
    isDrag=true; sx=e.clientX; sy=e.clientY;
    const r = panel.getBoundingClientRect();
    ox=r.left; oy=r.top;
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!isDrag) return;
    const dx=e.clientX-sx, dy=e.clientY-sy;
    panel.style.left = Math.max(8, Math.min(window.innerWidth-100, ox+dx))+'px';
    panel.style.top = Math.max(8, Math.min(window.innerHeight-50, oy+dy))+'px';
  });
  window.addEventListener('mouseup', ()=> isDrag=false);
})(customizer, czHeader);

// Step 1: Pick Parts
$$('.pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.target;
    if (id === 'all') {
      const allIds = Object.keys(regions);
      const allSelected = allIds.every(k => state.selectedIds.has(k));
      if (allSelected) {
        state.selectedIds.clear();
        $$('.pill').forEach(b => b.classList.remove('active'));
      } else {
        allIds.forEach(k => state.selectedIds.add(k));
        $$('.pill').forEach(b => b.classList.add('active'));
      }
    } else {
      if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
        btn.classList.remove('active');
      } else {
        state.selectedIds.add(id);
        btn.classList.add('active');
      }
    }
    // highlight
    Object.entries(regions).forEach(([rid, g])=> {
      g.classList.toggle('selected-region', state.selectedIds.has(rid));
    });
  });
});

// Give each pill a unique hue/offset so they don't look identical
onReady(()=>{
  $$('.pill').forEach((el,i)=>{
    const deg = Math.floor(Math.random()*360);
    el.style.setProperty('--pill-h', deg+'deg');
    el.style.animationDelay = (Math.random()*-10).toFixed(2)+'s';
    el.style.backgroundPosition = `${Math.floor(Math.random()*100)}% ${Math.floor(Math.random()*100)}%`;
  });
});

// Step 2: Style selection
const btnSolid = $('#btnSolid');
const btnGradient = $('#btnGradient');
const gradientOptions = $('#gradientOptions');
const chkRainbow = $('#chkRainbow');
const chkUsePalettes = $('#chkUsePalettes');
const animatedGradient = $('#animatedGradient');

function setStyle(mode) {
  state.styleMode = mode;
  gradientOptions.hidden = mode !== 'gradient';
  btnSolid.classList.toggle('active', mode==='solid');
  btnGradient.classList.toggle('active', mode==='gradient');
  if (mode !== 'gradient') {
    chkRainbow.checked = false;
    chkUsePalettes.checked = false;
    state.useRainbow = false;
    state.usePalettes = false;
  }
}
btnSolid.addEventListener('click', ()=> setStyle('solid'));
btnGradient.addEventListener('click', ()=> setStyle('gradient'));
function refreshDynamicGradient(){
  try{
    const cols = buildGradientColors();
    ensureGradient(cols);
    // Re-apply to any paths currently using the dynamic gradient
    const ids = Object.keys(regions).filter(id => {
      const p = regions[id]?.querySelector('path');
      return p && /url\(#dynamicGrad\)/.test(p.getAttribute('fill')||'');
    });
    if (ids.length) applyGradientToSelection(cols, ids);
  }catch(_){/* noop */}
}
animatedGradient.addEventListener('change', e => { state.animated = e.target.checked; refreshDynamicGradient(); });

// Toggle rainbow vs palettes exclusive
chkRainbow.addEventListener('change', (e)=> {
  if (e.target.checked) {
    chkUsePalettes.checked = false;
    state.useRainbow = true;
    state.usePalettes = false;
    $('#btnChoosePalettes').disabled = true;
  } else {
    state.useRainbow = false;
  }
  // If picker is open, rebuild with updated options
  if (!colorPopover.hidden) openColorPicker(btnChooseColor);
});
chkUsePalettes.addEventListener('change', (e)=> {
  if (e.target.checked) {
    chkRainbow.checked = false;
    state.useRainbow = false;
    state.usePalettes = true;
    // open palette picker via link too
    openPalettePickerAt($('#openPalettes') || e.currentTarget, true);
  } else {
    state.usePalettes = false;
    closePalettePopover();
  }
  if (!colorPopover.hidden) openColorPicker(btnChooseColor);
});

// Step 3: Color popover
const colorPopover = $('#colorPopover');
const palettePopover = $('#palettePopover');
const btnChooseColor = $('#btnChooseColor');
const btnRandomColor = $('#btnRandomColor');

function openPopoverAt(el, pop, contentBuilder, condense=false) {
  const r = el.getBoundingClientRect();
  pop.innerHTML = '';
  contentBuilder(pop);
  pop.hidden = false;
  let x = r.right - (condense ? 240 : pop.offsetWidth);
  let y = r.bottom + 8;
  pop.style.left = x + 'px';
  pop.style.top = y + 'px';
  // Enable dragging by top bar
  makeDraggable(pop, '.top-row');
  // Keep in viewport
  clampInViewport(pop);
}

function closeColorPopover(){ colorPopover.hidden = true; }
function closePalettePopover(){ palettePopover.hidden = true; }

// Palettes (names and 7-color arrays). Up to 15 total available.
const PALETTES = [
  {name:'Sunset', colors: ['#ff6b6b','#ff8e53','#ffb142','#ffd56b','#ffe66d','#ffa69e','#ff7eb9']},
  {name:'Pastel', colors: ['#ffd1dc','#ffe6cc','#e0ffe6','#d6eaff','#e6e6fa','#fce1ff','#e0f7ff']},
  {name:'Ocean', colors: ['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43']},
  {name:'Cyber', colors: ['#00f5d4','#00bbf9','#9b5de5','#f15bb5','#fee440','#00f5a0','#00f0ff']},
  {name:'Aurora', colors: ['#0aff99','#00f0ff','#88f7ff','#a3f3ff','#bdb2ff','#ffc6ff','#ffadad']},
  {name:'Berry', colors: ['#2b1331','#5e2750','#9f306b','#d94f70','#ff6f91','#ff9671','#ffc75f']},
  {name:'Forest', colors: ['#2a9d8f','#127475','#588157','#7f9172','#a3b18a','#b6ad90','#d9ae94']},
  {name:'Magma', colors: ['#4b0000','#7a0400','#b90e0a','#e63946','#ff7f50','#ffb703','#ffd166']},
  {name:'Neon', colors: ['#39ff14','#00e5ff','#ff2079','#b026ff','#ffe700','#00ffa6','#ff6b00']},
  {name:'Ice', colors: ['#e0fbfc','#98c1d9','#3d5a80','#293241','#ee6c4d','#7ad1e0','#bde0fe']},
  {name:'Rainbow', colors: ['#ff0040','#ff7f00','#ffef00','#00f11d','#00a2ff','#2b00ff','#e600ff']},
  {name:'Dawn', colors: ['#3a0ca3','#4361ee','#4895ef','#4cc9f0','#bde0fe','#ffc8dd','#ffafcc']},
  {name:'Grape', colors: ['#2d0a31','#4a0e4e','#6a1b9a','#8e24aa','#ab47bc','#ce93d8','#e1bee7']},
  {name:'Mint', colors: ['#0f766e','#137a83','#14b8a6','#2dd4bf','#5eead4','#a7f3d0','#ecfeff']}
];

// Build palette chooser
function openPalettePickerAt(el, fromCheckbox=false){
  openPopoverAt(el, palettePopover, (pop)=>{
    const top = document.createElement('div');
    top.className = 'top-row';
    const title = document.createElement('strong');
    title.textContent = 'Choose Palettes (max 5)';
    const close = document.createElement('button');
    close.className = 'btn'; close.textContent = 'Close';
    close.addEventListener('click', closePalettePopover);
    top.append(title, close);
    pop.appendChild(top);

    const grid = document.createElement('div');
    grid.className = 'palette-grid';
    PALETTES.forEach(pal => {
      const c = document.createElement('label');
      c.className = 'palette-card';
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = state.chosenPalettes.includes(pal.name);
      cb.addEventListener('change', (e)=>{
        if (e.target.checked) {
          if (state.chosenPalettes.length >= 5) {
            e.target.checked = false;
            alert('You can choose up to 5 palettes.');
            return;
          }
          state.chosenPalettes.push(pal.name);
        } else {
          state.chosenPalettes = state.chosenPalettes.filter(n => n !== pal.name);
        }
      });
      const name = document.createElement('div'); name.textContent = pal.name;
      const sw = document.createElement('div'); sw.className = 'palette-swatches';
      pal.colors.forEach(col => {
        const chip = document.createElement('div'); chip.className='chip'; chip.style.background = col;
        sw.appendChild(chip);
      });
      c.append(cb, name, sw);
      grid.appendChild(c);
    });
    pop.appendChild(grid);

    const save = document.createElement('button');
    save.className = 'btn primary';
    save.textContent = 'Save Palettes';
    save.addEventListener('click', ()=>{
      // flatten colors for choose-color grid
      state.paletteColors = [];
      state.chosenPalettes.forEach(name => {
        const p = PALETTES.find(x => x.name === name);
        if (p) state.paletteColors.push(...p.colors);
      });
      closePalettePopover();
    });
    pop.appendChild(save);
  }, true);
}

// Link-style opener for palettes word
const openPalettesLink = $('#openPalettes');
if (openPalettesLink) openPalettesLink.addEventListener('click', (e)=> openPalettePickerAt(e.currentTarget));

// Build color chooser
function buildColorGridColors() {
  if (state.styleMode === 'solid') {
    // full 8x8 rainbow grid — generate HS variants
    const cols = [];
    for (let r=0;r<8;r++) {
      for (let c=0;c<8;c++) {
        const h = Math.round((c/8)*360);
        const s = 70 + Math.round((r/8)*25);
        const l = 50 - Math.round((r/8)*20);
        cols.push(`hsl(${h} ${s}% ${l}%)`);
      }
    }
    return cols;
  } else {
    if (state.useRainbow) {
      // Use the Rainbow palette colors
      const rb = PALETTES.find(p=>p.name==='Rainbow');
      return rb ? rb.colors : [];
    }
    if (state.usePalettes) {
      return state.paletteColors.length ? state.paletteColors : [];
    }
    return []; // nothing selected yet
  }
}

function openColorPicker(el) {
  openPopoverAt(el, colorPopover, (pop)=>{
    // Top row: Save, Pick (eyedropper), Close
    const top = document.createElement('div');
    top.className = 'top-row';
    const saveBtn = document.createElement('button'); saveBtn.className='btn primary'; saveBtn.textContent='Save';
    const pickBtn = document.createElement('button'); pickBtn.className='btn'; pickBtn.textContent='Pick Screen';
    const closeBtn = document.createElement('button'); closeBtn.className='btn'; closeBtn.textContent='Close';
    top.append(saveBtn, pickBtn, closeBtn);
    pop.appendChild(top);

    // Grid
    const grid = document.createElement('div'); grid.className = 'color-grid';
    const colors = buildColorGridColors();
    if (!colors.length) {
      const msg = document.createElement('div');
      msg.textContent = (state.styleMode==='gradient')
        ? 'Select Full Rainbow or Use Palettes first.'
        : 'Solid: choose any cell below.';
      pop.appendChild(msg);
    }
    let current = null;

    colors.forEach(col => {
      const cell = document.createElement('div');
      cell.className = 'color-cell';
      cell.style.background = col;
      cell.addEventListener('dblclick', ()=>{ applyFillToSelection(col); closeColorPopover(); });
      cell.addEventListener('click', ()=>{ current = col; });
      grid.appendChild(cell);
    });
    pop.appendChild(grid);

    // Color input
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = '#ffffff';
    colorInput.style.marginTop = '8px';
    pop.appendChild(colorInput);

    saveBtn.addEventListener('click', ()=>{
      const chosen = current || colorInput.value;
      applyFillToSelection(chosen);
      closeColorPopover();
    });
    closeBtn.addEventListener('click', closeColorPopover);
    pickBtn.addEventListener('click', async ()=>{
      if ('EyeDropper' in window) {
        const ed = new window.EyeDropper();
        try {
          const res = await ed.open();
          applyFillToSelection(res.sRGBHex);
          closeColorPopover();
        } catch(_) {}
      } else {
        alert('Your browser does not support the EyeDropper API.');
      }
    });
  }, true);
}

btnChooseColor.addEventListener('click', (e)=> openColorPicker(e.currentTarget));

btnRandomColor.addEventListener('click', ()=>{
  let colors = [];
  if (state.styleMode === 'solid') {
    colors = buildColorGridColors();
  } else {
    if (state.useRainbow) {
      colors = PALETTES.find(p=>p.name==='Rainbow')?.colors ?? [];
    } else if (state.usePalettes) {
      colors = state.paletteColors;
    }
  }
  if (!colors.length) { alert('Pick Full Rainbow or Use Palettes first.'); return; }
  const col = colors[Math.floor(Math.random()*colors.length)];
  applyFillToSelection(col);
});

function ensureGradient(colors){
  const defs = svg.querySelector('defs') || (()=>{ const d=document.createElementNS('http://www.w3.org/2000/svg','defs'); svg.prepend(d); return d; })();
  let lg = svg.querySelector('#dynamicGrad');
  if (!lg) { lg = document.createElementNS('http://www.w3.org/2000/svg','linearGradient'); lg.id='dynamicGrad'; lg.setAttribute('x1','0%'); lg.setAttribute('y1','0%'); lg.setAttribute('x2','100%'); lg.setAttribute('y2','0%'); defs.appendChild(lg); }
  lg.innerHTML='';
  const cols = (colors && colors.length>=2) ? colors : ['#ff7eb9','#7afcff','#feff9c'];
  cols.forEach((c,i)=>{
    const stop = document.createElementNS('http://www.w3.org/2000/svg','stop');
    stop.setAttribute('offset', `${(i/(cols.length-1))*100}%`);
    stop.setAttribute('stop-color', c);
    lg.appendChild(stop);
  });
  // Animate gradient if requested
  let anim = lg.querySelector('animateTransform');
  if (state.animated) {
    if (!anim) { anim = document.createElementNS('http://www.w3.org/2000/svg','animateTransform'); lg.appendChild(anim); }
    anim.setAttribute('attributeName','gradientTransform');
    anim.setAttribute('type','rotate');
    anim.setAttribute('from','0 .5 .5');
    anim.setAttribute('to','360 .5 .5');
    anim.setAttribute('dur','12s');
    anim.setAttribute('repeatCount','indefinite');
  } else if (anim) { anim.remove(); }
  return 'url(#dynamicGrad)';
}
function buildGradientColors(){
  if (state.useRainbow) return PALETTES.find(p=>p.name==='Rainbow')?.colors ?? [];
  if (state.usePalettes && state.paletteColors.length) return state.paletteColors;
  return [];
}
function applyGradientToSelection(colors, idsOverride){
  const fill = ensureGradient(colors);
  const ids = idsOverride && idsOverride.length
    ? idsOverride
    : (state.selectedIds.size ? [...state.selectedIds] : Object.keys(regions));
  ids.forEach(id => { regions[id]?.querySelector('path')?.setAttribute('fill', fill); });
  dispatchChange();
}
function applyFillToSelection(color) {
  if (state.styleMode === 'gradient') {
    const cols = buildGradientColors();
    applyGradientToSelection(cols);
    return;
  }
  const ids = (state.selectedIds.size ? [...state.selectedIds] : Object.keys(regions));
  ids.forEach(id => {
    const p = regions[id]?.querySelector('path');
    if (p) p.setAttribute('fill', color);
  });
  dispatchChange();
}

// Step 4: plating
const platingRow = $('#platingRow');
const PLATING = [
  {name:'Silver', value:'#e5eef7'},
  {name:'Gold', value:'#d4af37'},
  {name:'Rose Gold', value:'#e6b7a1'},
  {name:'Copper', value:'#b87333'},
  {name:'Solid Black', value:'#000000'},
  {name:'Painted Black (Matte)', value:'#0a0a0c'},
  {name:'Mirror Silver', value:'url(#mirrorSilver)'},
  {name:'Iridescent Blue', value:'url(#irBlue)'},
  {name:'Iridescent Purple', value:'url(#irPurple)'}
];

// Create gradients used for plating previews/strokes
(function ensurePlatingGradients(){
  const svg = $('#errlSVG');
  const defs = svg.querySelector('defs') || (()=>{ const d=document.createElementNS('http://www.w3.org/2000/svg','defs'); svg.prepend(d); return d; })();
  function makeLG(id, stops){
    let g = svg.querySelector('#'+id);
    if(!g){ g=document.createElementNS('http://www.w3.org/2000/svg','linearGradient'); g.id=id; g.setAttribute('x1','0%'); g.setAttribute('y1','0%'); g.setAttribute('x2','100%'); g.setAttribute('y2','0%'); defs.appendChild(g); }
    g.innerHTML='';
    stops.forEach((c,i)=>{ const s=document.createElementNS('http://www.w3.org/2000/svg','stop'); s.setAttribute('offset', `${(i/(stops.length-1))*100}%`); s.setAttribute('stop-color', c); g.appendChild(s); });
  }
  // Existing anodized rainbow
  makeLG('anoGrad', ['#6ee7ff','#7bff8b','#ffe066','#ff7dd1','#7da0ff']);
  // Mirror silver (stronger banding)
  makeLG('mirrorSilver', ['#fefefe','#e9eef7','#cdd6e6','#a4adbf','#cdd6e6','#e9eef7','#fefefe']);
  // Iridescent blue and purple variants
  makeLG('irBlue', ['#60a5fa','#22d3ee','#7c3aed']);
  makeLG('irPurple', ['#c084fc','#7c3aed','#60a5fa']);
})();

function applyPlatingStroke(val){
  const strokeVal = val; // respect chosen gradient/color
  outline.setAttribute('stroke', strokeVal);
  ['region-face','region-eyeL','region-eyeR','region-mouth'].forEach(id => {
    const path = regions[id]?.querySelector('path');
    if (path) path.setAttribute('stroke', strokeVal);
  });
}

PLATING.forEach(p => {
  const sw = document.createElement('div');
  sw.className = 'swatch'; sw.title = p.name; sw.dataset.name = p.name;
  // Preview background for gradients
  (function(){
    const v=p.value;
    if(v.startsWith('url(')){
      const id=v.slice(v.indexOf('#')+1, v.indexOf(')')-1);
      let preview = v;
      if(id==='mirrorSilver') preview = 'linear-gradient(135deg, rgba(255,255,255,.32), rgba(255,255,255,0) 60%), linear-gradient(90deg,#fefefe,#e9eef7,#cdd6e6,#a4adbf,#cdd6e6,#e9eef7,#fefefe)';
      else if(id==='irBlue') preview = 'linear-gradient(90deg,#60a5fa,#22d3ee,#7c3aed)';
      else if(id==='irPurple') preview = 'linear-gradient(90deg,#c084fc,#7c3aed,#60a5fa)';
      else preview = 'linear-gradient(90deg,#6ee7ff,#7bff8b,#ffe066,#ff7dd1,#7da0ff)';
      sw.style.background = preview;
    } else {
      sw.style.background = v;
    }
  })();
  sw.addEventListener('mouseenter', ()=> sw.dataset.hover='1');
  sw.addEventListener('mouseleave', ()=> delete sw.dataset.hover);
  sw.addEventListener('click', ()=>{
    $$('.swatch', platingRow).forEach(x=>x.classList.remove('selected'));
    sw.classList.add('selected');
    applyPlatingStroke(p.value);
    state.plating = p.value;
    dispatchChange();
  });
  platingRow.appendChild(sw);
});

// Initialize plating to current outline on load
onReady(()=>{
  const curr = outline.getAttribute('stroke') || state.plating;
  applyPlatingStroke(curr);
});

// Sliders
function updateThk(id, px) {
  const mm = (px * PX_TO_MM).toFixed(2);
  $(`#px${id}`).textContent = px;
  $(`#mm${id}`).textContent = mm;
}
$('#thkAll').addEventListener('input', (e)=>{
  const v = +e.target.value;
  state.thickness.all = v;
  updateThk('All', v);
  outline.setAttribute('stroke-width', v);
  dispatchChange();
});
$('#thkBody').addEventListener('input', (e)=>{
  const v = +e.target.value;
  state.thickness.body = v;
  updateThk('Body', v);
  // Stroke width on body path stroke? Body is usually filled only; we simulate by duplicating stroke via filter? Keep simple: ignore.
});
$('#thkFace').addEventListener('input', (e)=>{
  const v = +e.target.value;
  state.thickness.face = v;
  updateThk('Face', v);
  // Similarly for eyes/mouth outlines if separate strokes exist — here we keep the global outline as primary stroke.
});
// Update face ring stroke with Body slider
$('#thkBody').addEventListener('input', (e)=>{
  const v = +e.target.value; state.thickness.body = v; updateThk('Body', v);
  const facePath = regions['region-face']?.querySelector('path');
  if (facePath) facePath.setAttribute('stroke-width', v);
  dispatchChange();
});
// Eyes & mouth strokes
$('#thkFace').addEventListener('input', (e)=>{
  const v = +e.target.value; state.thickness.face = v; updateThk('Face', v);
  ['region-eyeL','region-eyeR','region-mouth'].forEach(id => {
    const p = regions[id]?.querySelector('path');
    if (p) p.setAttribute('stroke-width', v);
  });
  dispatchChange();
});
// Initialize readouts
updateThk('All', state.thickness.all);
updateThk('Body', state.thickness.body);
updateThk('Face', state.thickness.face);

// Sync initial slider positions and apply default stroke widths
onReady(()=>{
  const thkAll = $('#thkAll'); if (thkAll) thkAll.value = String(state.thickness.all);
  const thkBody = $('#thkBody'); if (thkBody) thkBody.value = String(state.thickness.body);
  const thkFace = $('#thkFace'); if (thkFace) thkFace.value = String(state.thickness.face);
  const facePath = regions['region-face']?.querySelector('path');
  if (facePath) facePath.setAttribute('stroke-width', state.thickness.body);
  ['region-eyeL','region-eyeR','region-mouth'].forEach(id => {
    const p = regions[id]?.querySelector('path');
    if (p) p.setAttribute('stroke-width', state.thickness.face);
  });
  dispatchChange();
});

// Effects
$('#fxGlitter').addEventListener('change', (e)=>{
  state.glitter = e.target.checked;
  // Simulate by tiny noise overlay? Keep minimal for now.
});
$('#fxGlow').addEventListener('change', (e)=>{
  state.glow = e.target.checked;
  if (state.glow) {
    Object.values(regions).forEach(g => {
      const p = g.querySelector('path');
      if (p) p.setAttribute('filter', 'url(#glowFX)');
    });
  } else {
    Object.values(regions).forEach(g => {
      const p = g.querySelector('path');
      if (p) p.removeAttribute('filter');
    });
  }
});

// Export & Random stacks as flyouts attached to the customizer edge
const exportStack = $('#exportStack');
const randStack = $('#randStack');

const hoverCloseTimers = new Map();
function ensureStackControls(stackEl){
  const closeBtn = stackEl.querySelector('.stack-close');
  if (closeBtn && !closeBtn.dataset.wired){
    closeBtn.dataset.wired = '1';
    closeBtn.addEventListener('click', ()=> stackEl.hidden = true);
  }
  if (!stackEl.dataset.hoverWired){
    stackEl.dataset.hoverWired = '1';
    stackEl.addEventListener('mouseenter', ()=>{
      const t = hoverCloseTimers.get(stackEl);
      if (t) clearTimeout(t);
    });
    stackEl.addEventListener('mouseleave', ()=>{
      const t = setTimeout(()=> stackEl.hidden = true, 5000);
      hoverCloseTimers.set(stackEl, t);
    });
  }
}
function placeFlyoutSmart(stackEl, preferred) {
  if (stackEl.parentElement !== document.body) document.body.appendChild(stackEl);
  stackEl.classList.add('flyout');
  stackEl.hidden = false;
  ensureStackControls(stackEl);
  const czRect = customizer.getBoundingClientRect();
  const spaceLeft = czRect.left;
  const spaceRight = window.innerWidth - czRect.right;
  let side = preferred;
  if (preferred === 'left' && stackEl.offsetWidth + 16 > spaceLeft) side = 'right';
  if (preferred === 'right' && stackEl.offsetWidth + 16 > spaceRight) side = 'left';
  // If neither side fits, drop below aligned to the panel
  if (stackEl.offsetWidth + 16 > spaceLeft && stackEl.offsetWidth + 16 > spaceRight) {
    stackEl.style.left = Math.max(8, Math.min(czRect.left, window.innerWidth - stackEl.offsetWidth - 8)) + 'px';
    stackEl.style.top = Math.min(window.innerHeight - stackEl.offsetHeight - 8, czRect.bottom + 8) + 'px';
    return;
  }
  const left = side === 'right' ? (czRect.right + 8) : (czRect.left - stackEl.offsetWidth - 8);
  // Vertical alignment: try to bottom-align to panel, clamp to viewport
  const top = Math.min(window.innerHeight - stackEl.offsetHeight - 8, Math.max(8, czRect.bottom - stackEl.offsetHeight));
  stackEl.style.left = left + 'px';
  stackEl.style.top = top + 'px';
}
function toggleFlyout(stackEl, preferred) {
  const isOpen = !stackEl.hidden && stackEl.classList.contains('flyout');
  [exportStack, randStack].forEach(el => { el.hidden = true; });
  if (!isOpen) placeFlyoutSmart(stackEl, preferred);
}

$('#btnExport').addEventListener('click', ()=> toggleFlyout(exportStack, 'left'));
$('#btnRandomize').addEventListener('click', ()=> toggleFlyout(randStack, 'right'));

// Ensure closed on load
onReady(()=>{ 
  exportStack.hidden = true; randStack.hidden = true; 
  // Inject a Save-to-Portal action
  try {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'stack-item';
    saveBtn.dataset.export = 'save-portal';
    saveBtn.textContent = 'Save to Portal (errl-face-2.svg)';
    exportStack.appendChild(saveBtn);
  } catch(_){}
});

// Only one palette popover active
document.addEventListener('click', (e)=>{
  const id = e.target.id;
  if (!['palettePopover','btnChoosePalettes','chkUsePalettes'].includes(id) && !palettePopover.contains(e.target)) {
    closePalettePopover();
  }
  if (!colorPopover.contains(e.target) && e.target.id!=='btnChooseColor') {
    if (!colorPopover.hidden && !$('#btnChooseColor').contains(e.target)) closeColorPopover();
  }
  // Close flyouts when clicking outside stacks and their triggers
  const inExport = exportStack.contains(e.target) || $('#btnExport').contains(e.target);
  const inRand = randStack.contains(e.target) || $('#btnRandomize').contains(e.target);
  // Outside clicks no longer force-close; close via X or hover-timeout
}, true);

// Randomize behaviors
function randFrom(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function randomSolidFor(ids) {
  const colors = buildColorGridColors();
  if (!colors.length) return;
  ids.forEach(id => {
    const p = regions[id]?.querySelector('path');
    if (p) p.setAttribute('fill', randFrom(colors));
  });
}
function randomGradientFor(ids) {
  let colors = buildGradientColors();
  if (!colors.length) colors = PALETTES.find(p=>p.name==='Rainbow')?.colors ?? ['#ff7eb9','#7afcff','#feff9c'];
  applyGradientToSelection(colors, ids);
}

randStack.addEventListener('click', (e)=>{
  if (!e.target.closest('.stack-item')) return;
  const btn = e.target.closest('.stack-item');
  const kind = btn.dataset.rand;
  const idsAll = Object.keys(regions);
  if (kind === 'all') {
    idsAll.forEach(id => {
      const p = regions[id]?.querySelector('path');
      if (p) p.setAttribute('fill', randFrom(buildColorGridColors()));
    });
  }
  if (kind === 'all-solid') randomSolidFor(idsAll);
  if (kind === 'all-gradient') randomGradientFor(idsAll);
  if (kind === 'face-only') {
    const faceCol = randFrom(buildColorGridColors());
    regions['region-face'].querySelector('path')?.setAttribute('fill', faceCol);
    const eyesMouthCol = randFrom(buildColorGridColors());
    ['region-eyeL','region-eyeR','region-mouth'].forEach(id => regions[id].querySelector('path')?.setAttribute('fill', eyesMouthCol));
  }
  if (kind === 'eyes-mouth') {
    const col = randFrom(buildColorGridColors());
    ['region-eyeL','region-eyeR','region-mouth'].forEach(id => regions[id].querySelector('path')?.setAttribute('fill', col));
  }
  // keep stack open for rapid re-clicks
  // randStack.hidden = true;
});

// Export
exportStack.addEventListener('click', async (e)=>{
  if (!e.target.closest('.stack-item')) return;
  const kind = e.target.closest('.stack-item').dataset.export;
  if (kind === 'svg') {
    // no-op here; actual serialization below
  }
  if (kind === 'save-portal') {
    // Try File System Access API to save directly to your repo; fallback to download
    try {
      const s = new XMLSerializer().serializeToString($('#errlSVG'));
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'errl-face-2.svg',
          types: [{ description: 'SVG', accept: { 'image/svg+xml': ['.svg'] } }]
        });
        const w = await handle.createWritable();
        await w.write(s);
        await w.close();
      } else {
        downloadText('errl-face-2.svg', s, 'image/svg+xml');
      }
    } catch(_) {
      const s = new XMLSerializer().serializeToString($('#errlSVG'));
      downloadText('errl-face-2.svg', s, 'image/svg+xml');
    }
    return;
  }
  if (kind === 'png' || kind === 'svg' || kind === 'json') {
    const svg = $('#errlSVG');
    if (kind === 'svg') {
      const s = new XMLSerializer().serializeToString(svg);
      downloadText('errl-custom.svg', s, 'image/svg+xml');
    } else if (kind === 'json') {
      const data = {
        fills: Object.fromEntries(Object.entries(regions).map(([id, g]) => [id, g.querySelector('path')?.getAttribute('fill')])),
        plating: outline.getAttribute('stroke'),
        thickness: state.thickness,
        effects: { glitter: state.glitter, glow: state.glow },
        styleMode: state.styleMode,
        palettes: { useRainbow: state.useRainbow, usePalettes: state.usePalettes, chosen: state.chosenPalettes }
      };
      downloadText('errl-custom.json', JSON.stringify(data, null, 2), 'application/json');
    } else {
      // PNG via canvas rasterization
      const s = new XMLSerializer().serializeToString(svg);
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
      const img = new Image();
      img.onload = ()=>{
        const canvas = document.createElement('canvas');
        canvas.width = 1024; canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob)=>{
          const a=document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = 'errl-custom.png';
          a.click();
          URL.revokeObjectURL(a.href);
        }, 'image/png');
      };
      img.src = url;
    }
  }
  // keep export stack open for multiple actions
  // exportStack.hidden = true;
});

function downloadText(name, text, mime){
  const blob = new Blob([text], {type: mime || 'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(()=> URL.revokeObjectURL(a.href), 1000);
}

// Tooltips (hover tips)
(function addTitles(){
  btnSolid.title = 'Use solid color fills';
  btnGradient.title = 'Use gradient/palette-driven fills';
  animatedGradient.title = 'Animate gradient fills';
  btnChooseColor.title = 'Open color picker';
  btnRandomColor.title = 'Apply a random color from selected palette options';
  $('#thkAll').title = 'Set global outline thickness';
  $('#thkBody').title = 'Set body stroke thickness';
  $('#thkFace').title = 'Set eyes & mouth stroke thickness';
  $('#btnExport').title = 'Export PNG/SVG/JSON';
  $('#btnRandomize').title = 'Randomize fills';
  $$('.pill').forEach(p=> p.title = 'Select/deselect this region');
})();

// Integration API for main portal
function getConfig(){
  return {
    fills: Object.fromEntries(Object.entries(regions).map(([id, g]) => [id, g.querySelector('path')?.getAttribute('fill')])) ,
    plating: outline.getAttribute('stroke'),
    thickness: {...state.thickness},
    effects: { glitter: state.glitter, glow: state.glow },
    styleMode: state.styleMode,
    palettes: { useRainbow: state.useRainbow, usePalettes: state.usePalettes, chosen: [...state.chosenPalettes] }
  };
}
function recenterSVG(){
  try {
    const bodyPath = regions['region-body']?.querySelector('path');
    if (!bodyPath) return;
    const bBody = bodyPath.getBBox();
    const bodySW = parseFloat(bodyPath.getAttribute('stroke-width')||'0');
    const cx = bBody.x + bBody.width/2;
    const cy = bBody.y + bBody.height/2;
    const items = [
      regions['region-body']?.querySelector('path'),
      regions['region-face']?.querySelector('path'),
      regions['region-eyeL']?.querySelector('path'),
      regions['region-eyeR']?.querySelector('path'),
      regions['region-mouth']?.querySelector('path'),
      outline
    ].filter(Boolean);
    let half = 0;
    items.forEach(p=>{
      const bb = p.getBBox();
      const sw = parseFloat(p.getAttribute('stroke-width')||'0');
      const left = cx - bb.x; // distance from left edge to center
      const right = (bb.x + bb.width) - cx;
      const top = cy - bb.y;
      const bottom = (bb.y + bb.height) - cy;
      half = Math.max(half, left, right, top, bottom);
      half = Math.max(half, sw/2); // include stroke outward
    });
    const pad = Math.max(24, half*0.05 + 2); // small breathing room
    const s = Math.ceil((half + pad) * 2);
    const vx = Math.round(cx - s/2);
    const vy = Math.round(cy - s/2);
    svg.setAttribute('viewBox', `${vx} ${vy} ${s} ${s}`);
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  } catch(_) {}
}

function dispatchChange(){
  recenterSVG();
  const detail = getConfig();
  window.dispatchEvent(new CustomEvent('errl-customizer-change', { detail }));
  // If embedded, notify parent for live-sync
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'errl:customizer-change', payload: detail }, '*');
    }
  } catch(_) {}
}
window.ErrlCustomizer = { getConfig };

// Body image fill
const btnBodyImage = $('#btnBodyImage');
const bodyImageInput = $('#bodyImageInput');
function ensureBodyPattern(){
  let defs = svg.querySelector('defs');
  if (!defs) { defs = document.createElementNS('http://www.w3.org/2000/svg','defs'); svg.prepend(defs); }
  let pat = svg.querySelector('#bodyImgPattern');
  if (!pat) {
    pat = document.createElementNS('http://www.w3.org/2000/svg','pattern');
    pat.id = 'bodyImgPattern';
    pat.setAttribute('patternUnits','userSpaceOnUse');
    const vb = svg.viewBox.baseVal; const w = vb ? vb.width : 1024; const h = vb ? vb.height : 1024;
    pat.setAttribute('x','0'); pat.setAttribute('y','0'); pat.setAttribute('width', w); pat.setAttribute('height', h);
    const img = document.createElementNS('http://www.w3.org/2000/svg','image');
    img.id = 'bodyImg'; img.setAttribute('x','0'); img.setAttribute('y','0'); img.setAttribute('width', w); img.setAttribute('height', h);
    img.setAttribute('preserveAspectRatio','xMidYMid slice');
    pat.appendChild(img); defs.appendChild(pat);
  }
  return pat;
}
function setBodyImage(url){
  const pat = ensureBodyPattern();
  const img = svg.querySelector('#bodyImg');
  img.setAttributeNS('http://www.w3.org/1999/xlink','href', url);
  const bodyPath = regions['region-body']?.querySelector('path');
  if (bodyPath) bodyPath.setAttribute('fill','url(#bodyImgPattern)');
  dispatchChange();
}
if (btnBodyImage && bodyImageInput){
  btnBodyImage.addEventListener('click', ()=> bodyImageInput.click());
  bodyImageInput.addEventListener('change', ()=>{
    const file = bodyImageInput.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBodyImage(url);
    // Revoke later
    setTimeout(()=> URL.revokeObjectURL(url), 60_000);
  });
}

// Scale panel to fit viewport width gracefully
function getBaseWidth(){
  const v = getComputedStyle(document.documentElement).getPropertyValue('--cz-width');
  const n = parseFloat(v) || 340;
  return n;
}
function applyPanelScale(){
  const baseW = getBaseWidth();
  const margin = 24 + 8; // left plus breathing room
  const availW = Math.max(240, window.innerWidth - margin*2);
  const s = Math.min(1, availW / baseW);
  document.documentElement.style.setProperty('--cz-scale', String(s));
  // Clamp inside viewport after scale
  const r = customizer.getBoundingClientRect();
  const maxLeft = window.innerWidth - r.width - 8;
  const maxTop = window.innerHeight - r.height - 8;
  if (parseFloat(customizer.style.left) > maxLeft) customizer.style.left = Math.max(8, maxLeft) + 'px';
  if (parseFloat(customizer.style.top) > maxTop) customizer.style.top = Math.max(8, Math.min(customizer.style.top||0, maxTop)) + 'px';
}
window.addEventListener('resize', applyPanelScale);
window.addEventListener('orientationchange', applyPanelScale);
applyPanelScale();

// Resize via drag handle
const czResizer = $('#czResizer');
if (czResizer) {
  czResizer.addEventListener('mousedown', (e)=>{
    const startX = e.clientX;
    const startW = getBaseWidth();
    function mm(ev){
      const dx = ev.clientX - startX;
      const newW = Math.max(280, Math.min(560, startW + dx));
      document.documentElement.style.setProperty('--cz-width', newW + 'px');
      applyPanelScale();
    }
    function up(){ window.removeEventListener('mousemove', mm); }
    window.addEventListener('mousemove', mm);
    window.addEventListener('mouseup', up, { once: true });
  });
}

// Initial: panel closed; open via Parts button
customizer.style.display = 'none';

// Auto-center using the BODY center as the fixed anchor so strokes/filters don't push position
onReady(()=>{ recenterSVG(); });

// Palette rotation on big action buttons
(function setupPaletteRotation(){
  const cycle = ['palette-pastel','palette-iridescent','palette-spooky','palette-royal'];
  const buttons = [
    $('#btnChooseColor'),
    $('#btnRandomColor'),
    $('#btnBodyImage'),
    $('#btnExport')
  ].filter(Boolean);
  function rotate(el){
    const idx = cycle.findIndex(c => el.classList.contains(c));
    const next = cycle[(idx+1+cycle.length)%cycle.length];
    cycle.forEach(c => el.classList.remove(c));
    el.classList.add(next);
  }
  setInterval(()=> buttons.forEach(rotate), 20000);
})();
