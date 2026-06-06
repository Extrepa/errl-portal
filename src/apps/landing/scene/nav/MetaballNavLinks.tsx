import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getMetaball, getSculpture, subscribeSceneControls } from '../bridge/sceneControls';
import type { SceneMetaballSettings, SceneSculptureSettings } from '../sceneTypes';
import { getScene3dBubbleRadiusPx, isErrlLayoutReady } from './orbitLayout';
import { NAV_ITEMS } from './navConfig';
import { useNavPhysics } from './useNavPhysics';

export type MetaballNavLinksProps = {
  className?: string;
};

type PointerNdc = { x: number; y: number; active: boolean };

/**
 * Scene3d nav built from the ground up: each link is one DOM node
 * (colored metaball orb + label), positioned together by shared physics.
 */
export default function MetaballNavLinks({ className = 'errl-metaball-nav' }: MetaballNavLinksProps) {
  const physics = useNavPhysics();
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const readyRef = useRef(false);
  const sculptureRef = useRef<SceneSculptureSettings>(getSculpture());
  const metaballRef = useRef<SceneMetaballSettings>(getMetaball());
  const pointerRef = useRef<PointerNdc>({ x: 0, y: 0, active: false });
  const [orbGlow, setOrbGlow] = useState(() => getMetaball().glow);
  const [orbMerge, setOrbMerge] = useState(() => getMetaball().mergeK);
  const [viewportWidth, setViewportWidth] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1440),
  );

  const ballDiamPx = Math.round(getScene3dBubbleRadiusPx(viewportWidth) * 2.2);

  useEffect(() => {
    const unsub = subscribeSceneControls((s) => {
      sculptureRef.current = s.sculpture;
      metaballRef.current = s.metaball;
      setOrbGlow(s.metaball.glow);
      setOrbMerge(s.metaball.mergeK);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const onMove = (ev: PointerEvent) => {
      pointerRef.current = {
        x: (ev.clientX / window.innerWidth) * 2 - 1,
        y: -((ev.clientY / window.innerHeight) * 2 - 1),
        active: true,
      };
    };
    const onLeave = () => {
      pointerRef.current = { ...pointerRef.current, active: false };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      if (isErrlLayoutReady()) physics.reanchor();
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [physics]);

  useEffect(() => {
    let rafId = 0;
    let lastTs = 0;

    const tick = (ts: number) => {
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;

      if (isErrlLayoutReady()) {
        if (!readyRef.current) {
          physics.reanchor();
          readyRef.current = true;
          document.body.classList.add('errl-layout-ready');
        }
        physics.step(
          dt,
          pointerRef.current,
          () => sculptureRef.current,
          () => metaballRef.current,
        );
        const states = physics.getStates();
        states.forEach((s, i) => {
          const el = linkRefs.current[i];
          if (!el) return;
          el.style.left = `${s.x}px`;
          el.style.top = `${s.y}px`;
          el.classList.add('errl-metaball-link--ready');
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [physics]);

  return (
    <div className={`${className} errl-scene-3d-nav`} aria-hidden={false}>
      <div
        className="errl-scene-3d-labels errl-metaball-nav__links"
        aria-hidden={false}
        style={
          {
            '--nav-orb-glow': String(orbGlow),
            '--nav-orb-merge': String(orbMerge),
          } as CSSProperties
        }
      >
        {NAV_ITEMS.map((item, i) => (
          <a
            key={item.key}
            ref={(el) => {
              linkRefs.current[i] = el;
            }}
            href={item.href}
            className="errl-metaball-link errl-scene-3d-label"
            data-nav-bubble-key={item.key}
            style={
              {
                '--nav-ball-color': item.color,
                '--nav-ball-diam': `${ballDiamPx}px`,
              } as CSSProperties
            }
            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span className="errl-metaball-link__orb" aria-hidden="true" />
            <span className="label errl-metaball-link__label">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
