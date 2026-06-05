import Lenis from 'lenis';
import { getScrollNavState, subscribeScrollNav } from './scrollBridge';

export type ScrollDirectorOptions = {
  wrapper?: HTMLElement;
  onProgress?: (progress: number) => void;
  /** When true, Lenis progress also feeds the nav scroll bus (future runway scroll). */
  syncNavBus?: boolean;
};

/**
 * Smooth scroll driver (Lenis). Nav bubble motion uses {@link scrollBridge} wheel bus on the landing page.
 */
export class ScrollDirector {
  private lenis: Lenis | null = null;
  private progress = 0;

  private unsubNav: (() => void) | null = null;

  constructor(private options: ScrollDirectorOptions = {}) {}

  mount() {
    if (this.lenis) return;
    if (this.options.syncNavBus) {
      this.unsubNav = subscribeScrollNav((s) => {
        this.progress = s.progress;
        this.options.onProgress?.(s.progress);
      });
    }
    this.lenis = new Lenis({
      wrapper: this.options.wrapper,
      smoothWheel: true,
      lerp: 0.08,
    });
    this.lenis.on('scroll', () => {
      const limit = this.lenis?.limit ?? 1;
      const scroll = this.lenis?.scroll ?? 0;
      this.progress = limit > 0 ? scroll / limit : 0;
      this.options.onProgress?.(this.progress);
      if (this.options.syncNavBus) {
        const nav = getScrollNavState();
        if (Math.abs(nav.progress - this.progress) > 0.02) {
          /* Lenis runway can drive bus in a later pass */
        }
      }
    });
    const raf = (time: number) => {
      this.lenis?.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  destroy() {
    this.unsubNav?.();
    this.unsubNav = null;
    this.lenis?.destroy();
    this.lenis = null;
  }

  getProgress() {
    return this.progress;
  }
}
