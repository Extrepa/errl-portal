import { useEffect } from 'react';
import { getSculpture, subscribeSceneControls } from '../bridge/sceneControls';
import {
  mountScrollNavDrive,
  setScrollNavEnabled,
  setScrollNavInfluence,
  unmountScrollNavDrive,
} from './scrollBridge';
import { ScrollDirector } from './ScrollDirector';
import { applyScrollChapter } from './scrollChapters';

type Props = {
  active: boolean;
};

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
}

/** Wheel / Lenis runway scroll shifts nav bubble orbit (DOM + metaball via shared bus). */
export default function ScrollNavDrive({ active }: Props) {
  useEffect(() => {
    if (!active) {
      unmountScrollNavDrive();
      return;
    }

    const useRunway = !prefersReducedMotion();
    let runwayEl: HTMLDivElement | null = null;

    if (useRunway) {
      runwayEl = document.createElement('div');
      runwayEl.className = 'errl-scroll-runway';
      runwayEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(runwayEl);
    }

    const teardown = mountScrollNavDrive({
      influence: getSculpture().scrollInfluence,
      enabled: true,
    });
    const unsub = subscribeSceneControls((s) => {
      setScrollNavInfluence(s.sculpture.scrollInfluence);
    });

    let director: ScrollDirector | null = null;
    if (useRunway) {
      director = new ScrollDirector({
        syncNavBus: true,
        onProgress: (p) => applyScrollChapter(p),
      });
      director.mount();
    }

    return () => {
      director?.destroy();
      unsub();
      teardown();
      setScrollNavEnabled(true);
      runwayEl?.remove();
    };
  }, [active]);

  return null;
}
