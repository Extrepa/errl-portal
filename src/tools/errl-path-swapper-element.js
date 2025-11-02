import { ErrlPathSwapper } from "/tools/errl-path-swapper.js";

class ErrlPathSwapperElement extends HTMLElement {
  static get observedAttributes() { return ["preset","viewbox","controls","registry"]; }
  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({mode:"open"});
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="/tools/errl-path-swapper.css">
      <div class="mount"></div>
    `;
    this._mount();
  }
  attributeChangedCallback() { this._mount(true); }

  async _mount(update=false) {
    if (!this._swapper) {
      this._swapper = new ErrlPathSwapper(this.shadowRoot.querySelector(".mount"), {
        viewBox: this.getAttribute("viewbox") || "0 0 1100 1800",
        showControls: this.getAttribute("controls") !== "false",
        registryUrl: this.getAttribute("registry") || "/data/errl/registry.json",
        defaultPreset: this.getAttribute("preset") || null
      });
    } else {
      if (this.hasAttribute("viewbox")) this._swapper.setViewBox(this.getAttribute("viewbox"));
      if (this.hasAttribute("preset") && update) await this._swapper.loadPreset(this.getAttribute("preset"));
    }
  }
}
customElements.define("errl-path-swapper", ErrlPathSwapperElement);
