import Lenis from 'lenis';
import { setScrollProgress } from './scrollBridge';

export type ScrollDirectorOptions = {
  wrapper?: HTMLElement;
  content?: HTMLElement;
  onProgress?: (progress: number) => void;
  /** When true, Lenis progress feeds the nav scroll bus. */
  syncNavBus?: boolean;
};

/**
 * Smooth scroll driver (Lenis). When syncNavBus is on, drives {@link scrollBridge} from page scroll.
 */
export class ScrollDirector {
  private lenis: Lenis | null = null;
  private progress = 0;
  private rafId = 0;

  constructor(private options: ScrollDirectorOptions = {}) {}

  mount() {
    if (this.lenis) return;
    this.lenis = new Lenis({
      wrapper: this.options.wrapper,
      content: this.options.content,
      smoothWheel: true,
      lerp: 0.08,
    });
    this.lenis.on('scroll', () => {
      const limit = this.lenis?.limit ?? 1;
      const scroll = this.lenis?.scroll ?? 0;
      this.progress = limit > 0 ? scroll / limit : 0;
      this.options.onProgress?.(this.progress);
      if (this.options.syncNavBus) {
        setScrollProgress(this.progress, 0);
      }
    });
    const raf = (time: number) => {
      this.lenis?.raf(time);
      this.rafId = requestAnimationFrame(raf);
    };
    this.rafId = requestAnimationFrame(raf);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    this.lenis?.destroy();
    this.lenis = null;
  }

  getProgress() {
    return this.progress;
  }
}
