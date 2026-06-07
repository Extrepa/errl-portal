import { useEffect } from 'react';
import gsap from 'gsap';

type Props = {
  onComplete: () => void;
};

function isMetaballNav(): boolean {
  return document.body.classList.contains('errl-nav-mode-metaball');
}

function waitForMetaballLinks(maxMs = 2400): Promise<HTMLElement[]> {
  return new Promise((resolve) => {
    const start = performance.now();
    const poll = () => {
      const links = Array.from(document.querySelectorAll<HTMLElement>('.errl-metaball-link'));
      if (links.length >= 4 || performance.now() - start > maxMs) {
        resolve(links);
        return;
      }
      requestAnimationFrame(poll);
    };
    poll();
  });
}

export default function TransitionPhase({ onComplete }: Props) {
  useEffect(() => {
    let killed = false;
    let tl: gsap.core.Timeline | null = null;

    const run = async () => {
      const reduced =
        document.body.classList.contains('reduced-motion') ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const scene = document.querySelector('.scene-layer') as HTMLElement | null;
      const errl = document.getElementById('errl');
      const metaball = isMetaballNav();

      if (reduced || !scene) {
        if (scene) scene.style.opacity = '1';
        window.dispatchEvent(new CustomEvent('errl:nav-intro-done'));
        document.body.classList.add('errl-nav-intro-done');
        if (!killed) onComplete();
        return;
      }

      const links = metaball ? await waitForMetaballLinks() : [];
      const gooOrbs = metaball
        ? Array.from(document.querySelectorAll<HTMLElement>('.errl-metaball-goo-orb'))
        : [];
      if (killed) return;

      window.dispatchEvent(new CustomEvent('errl:nav-snap-intro'));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      if (killed) return;

      const legacyBubbles = metaball
        ? []
        : Array.from(document.querySelectorAll('#navOrbit .bubble, #navOrbitBehind .bubble'));

      gsap.set(scene, { opacity: 0, y: 10 });
      if (errl) gsap.set(errl, { opacity: 0, scale: 0.94 });
      if (metaball && links.length) {
        gsap.set(links, { opacity: 0, scale: 0.96 });
        if (gooOrbs.length) gsap.set(gooOrbs, { opacity: 0, scale: 0.96 });
      } else if (legacyBubbles.length) {
        gsap.set(legacyBubbles, { opacity: 0, scale: 0.9 });
      }

      tl = gsap.timeline({
        onComplete: () => {
          if (metaball && links.length) {
            gsap.set(links, { clearProps: 'transform,opacity' });
            if (gooOrbs.length) gsap.set(gooOrbs, { clearProps: 'transform,opacity' });
          }
          window.dispatchEvent(new CustomEvent('errl:nav-intro-done'));
          document.body.classList.add('errl-nav-intro-done');
          if (!killed) onComplete();
        },
      });

      tl.to(scene, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0);
      if (errl) tl.to(errl, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }, 0.12);

      const fadeTargets =
        metaball && links.length ? [...gooOrbs, ...links] : legacyBubbles;
      if (fadeTargets.length) {
        tl.to(
          fadeTargets,
          {
            opacity: 1,
            scale: 1,
            duration: 0.75,
            stagger: 0.07,
            ease: 'power2.out',
          },
          0.28,
        );
      } else {
        tl.call(() => {}, [], 0.9);
      }
    };

    run();

    return () => {
      killed = true;
      tl?.kill();
    };
  }, [onComplete]);

  return null;
}
