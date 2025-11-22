/**
 * ErrlPathSwapper – v2
 * Adds: preset dropdown (registry.json), Copy Token Map, draggable/minimizable UI.
 *
 * Token keywords expected in JSON preset files:
 *   "@@ERRL_BODY@@", "@@ERRL_FACE@@", "@@ERRL_EYE_L@@", "@@ERRL_EYE_R@@", "@@ERRL_MOUTH@@", "@@ERRL_OUTLINE@@"
 *
 * Each preset JSON maps token -> path d string.
 */
export class ErrlPathSwapper {
  constructor(host, opts = {}) {
    this.host = host;
    this.opts = {
      viewBox: opts.viewBox || "0 0 1100 1800",
      showControls: opts.showControls !== false,
      registryUrl: opts.registryUrl || "/data/errl/registry.json",
      defaultPreset: opts.defaultPreset || null
    };
    this.tokens = {
      "@@ERRL_BODY@@": "",
      "@@ERRL_FACE@@": "",
      "@@ERRL_EYE_L@@": "",
      "@@ERRL_EYE_R@@": "",
      "@@ERRL_MOUTH@@": "",
      "@@ERRL_OUTLINE@@": ""
    };
    this._drag = { on:false, dx:0, dy:0, x:0, y:0 };

    this._mount();
    this._wireDrag();
    this._loadRegistry().then(async () => {
      if (this.opts.defaultPreset) {
        await this.loadPreset(this.opts.defaultPreset);
      } else if (this._select && this._select.value) {
        await this.loadPreset(this._select.value);
      } else {
        this._renderSVG(); // empty shell
      }
    });
  }

  setViewBox(vb) {
    this.opts.viewBox = vb;
    if (this._svg) this._svg.setAttribute("viewBox", vb);
  }

  async loadPreset(input) {
    // input can be a URL or an object mapping token -> d string
    let data = input;
    if (typeof input === "string") {
      const res = await fetch(input);
      data = await res.json();
    }
    // copy only known tokens
    Object.keys(this.tokens).forEach(k => {
      if (data[k]) this.tokens[k] = data[k];
    });
    this._renderSVG();
  }

  exportSVG() {
    const svg = this._svg.cloneNode(true);
    // inline styles not required; keep as-is for portability
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    this._downloadBlob(blob, "errl.svg");
  }

  copyTokenMap() {
    const txt = JSON.stringify(this.tokens, null, 2);
    navigator.clipboard.writeText(txt).then(() => {
      this._flash("Token map copied");
    }).catch(() => {
      this._flash("Copy failed");
    });
  }

  /* ---------- private ---------- */

  async _loadRegistry() {
    try {
      const res = await fetch(this.opts.registryUrl);
      if (!res.ok) throw 0;
      const registry = await res.json();
      this._registry = registry;
      if (this._select) {
        this._select.innerHTML = "";
        // Registry can be either {label:url,...} or [{label,url}] – handle both.
        const entries = Array.isArray(registry)
          ? registry
          : Object.entries(registry).map(([label, url]) => ({ label, url }));
        for (const item of entries) {
          const opt = document.createElement("option");
          opt.value = item.url || item;
          opt.textContent = item.label || item.url || item;
          this._select.appendChild(opt);
        }
      }
    } catch {
      // no registry – hide preset row
      if (this._presetRow) this._presetRow.style.display = "none";
    }
  }

  _mount() {
    this.host.classList.add("errl-swapper");
    this.host.innerHTML = `
      <div class="errl-head" data-drag-handle>
        <div class="errl-title">Errl Path Swapper</div>
        <div class="errl-spacer"></div>
        <button class="errl-iconbtn" title="Minimize" data-min-btn>–</button>
      </div>
      <div class="errl-body">
        <div class="errl-row" data-preset-row>
          <select class="errl-select" data-preset></select>
          <button class="errl-btn" data-load>Load</button>
          <button class="errl-btn errl-codebtn" data-copy>Copy Token Map</button>
          <button class="errl-btn" data-export>Export SVG</button>
        </div>

        <div class="errl-canvas">
          <svg class="errl-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${this.opts.viewBox}"></svg>
        </div>
      </div>
    `;

    this._presetRow = this.host.querySelector("[data-preset-row]");
    this._select = this.host.querySelector("[data-preset]");
    this._loadBtn = this.host.querySelector("[data-load]");
    this._copyBtn = this.host.querySelector("[data-copy]");
    this._exportBtn = this.host.querySelector("[data-export]");
    this._minBtn = this.host.querySelector("[data-min-btn]");
    this._svg = this.host.querySelector(".errl-svg");

    this._loadBtn?.addEventListener("click", async () => {
      if (this._select?.value) await this.loadPreset(this._select.value);
    });
    this._copyBtn?.addEventListener("click", () => this.copyTokenMap());
    this._exportBtn?.addEventListener("click", () => this.exportSVG());
    this._minBtn?.addEventListener("click", () => {
      this.host.classList.toggle("minimized");
    });
  }

  _wireDrag() {
    const handle = this.host.querySelector("[data-drag-handle]");
    if (!handle) return;
    const root = this.host;
    root.style.position = root.style.position || "relative";

    const onDown = (e) => {
      const rect = root.getBoundingClientRect();
      // if position is not fixed, switch to fixed for portal overlay use
      if (getComputedStyle(root).position !== "fixed") {
        root.style.position = "fixed";
        root.style.left = rect.left + "px";
        root.style.top  = rect.top + "px";
      }
      this._drag.on = true;
      this._drag.dx = e.clientX - rect.left;
      this._drag.dy = e.clientY - rect.top;
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    };
    const onMove = (e) => {
      if (!this._drag.on) return;
      const x = Math.max(8, Math.min(window.innerWidth  - root.offsetWidth  - 8, e.clientX - this._drag.dx));
      const y = Math.max(8, Math.min(window.innerHeight - root.offsetHeight - 8, e.clientY - this._drag.dy));
      root.style.left = x + "px";
      root.style.top  = y + "px";
    };
    const onUp = () => {
      this._drag.on = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    handle.addEventListener("mousedown", onDown);
  }

  _renderSVG() {
    const svg = this._svg;
    svg.setAttribute("viewBox", this.opts.viewBox);
    svg.innerHTML = `
      <g id="region-body"><path d="${this.tokens['@@ERRL_BODY@@'] || ""}" fill="#000" stroke="#e5eef7" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/></g>
      <g id="region-face"><path d="${this.tokens['@@ERRL_FACE@@'] || ""}" fill="#000" stroke="#e5eef7" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></g>
      <g id="region-eyeL"><path d="${this.tokens['@@ERRL_EYE_L@@'] || ""}" fill="#000" stroke="#e5eef7" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></g>
      <g id="region-eyeR"><path d="${this.tokens['@@ERRL_EYE_R@@'] || ""}" fill="#000" stroke="#e5eef7" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></g>
      <g id="region-mouth"><path d="${this.tokens['@@ERRL_MOUTH@@'] || ""}" fill="#000" stroke="#e5eef7" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></g>
      <path id="outline-plating" fill="none" stroke="#e5eef7" stroke-width="9" stroke-linejoin="round" stroke-linecap="round" d="${this.tokens['@@ERRL_OUTLINE@@'] || ""}"/>
    `;
  }

  _downloadBlob(blob, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
  }

  _flash(msg) {
    const n = document.createElement("div");
    n.textContent = msg;
    Object.assign(n.style, {
      position:'fixed', right:'16px', bottom:'16px', padding:'10px 12px',
      background:'#122036', color:'#cfe3ff', border:'1px solid #2b3a55',
      borderRadius:'10px', zIndex:99999, boxShadow:'0 6px 24px rgba(0,0,0,.35)'
    });
    document.body.appendChild(n);
    setTimeout(()=>n.remove(), 1400);
  }
}
