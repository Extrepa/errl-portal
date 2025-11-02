// BroadcastChannel helper for shared state across tools/pages
export class ErrlBus {
  constructor(name = "errl-studio") {
    this.ch = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(name) : null;
    this.listeners = new Set();
    if (this.ch) this.ch.onmessage = (e) => this.listeners.forEach(cb => cb(e.data));
  }
  post(msg) { try { this.ch?.postMessage(msg); } catch {} }
  on(cb){ this.listeners.add(cb); return () => this.listeners.delete(cb); }
}
export const bus = new ErrlBus();
