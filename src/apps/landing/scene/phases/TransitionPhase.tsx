import { useEffect } from 'react';
import gsap from 'gsap';

type Props = {
  onComplete: () => void;
};

export default function TransitionPhase({ onComplete }: Props) {
  useEffect(() => {
    const reduced =
      document.body.classList.contains('reduced-motion') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = document.querySelector('.scene-layer') as HTMLElement | null;
    const errl = document.getElementById('errl');
    const nav = document.getElementById('navOrbit');
    const bubbles = nav ? Array.from(nav.querySelectorAll('.bubble')) : [];

    if (reduced || !scene) {
      if (scene) scene.style.opacity = '1';
      onComplete();
      return;
    }

    gsap.set(scene, { opacity: 0, y: 12 });
    if (errl) gsap.set(errl, { opacity: 0, scale: 0.92 });
    bubbles.forEach((b) => gsap.set(b, { opacity: 0, scale: 0.85 }));

    const tl = gsap.timeline({ onComplete });
    tl.to(scene, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out' }, 0);
    if (errl) tl.to(errl, { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' }, 0.15);
    tl.to(
      bubbles,
      {
        opacity: 1,
        scale: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'elastic.out(1, 0.6)',
      },
      0.35,
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return null;
}
