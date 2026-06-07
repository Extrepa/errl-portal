import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { getMetaball, getSculpture, subscribeSceneControls } from '../bridge/sceneControls';
import type { SceneMetaballSettings, SceneSculptureSettings } from '../sceneTypes';
import { getScene3dBubbleRadiusPx, isErrlLayoutReady } from './orbitLayout';
import { NAV_ITEMS } from './navConfig';
import { useNavPhysicsContext } from './NavPhysicsContext';
import { prefetchWarpRoute, startWarpNav } from './warpNav';

export type MetaballNavLinksProps = {
  className?: string;
  /** Force horizontal labels and billboard orbs (no 3D spin). */
  flatLabels?: boolean;
};

type PointerNdc = { x: number; y: number; active: boolean };

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (_) {
    return false;
  }
}

function arcVarsForLabel(label: string, orbRadiusPx: number): CSSProperties {
  const n = label.length;
  const arcSpanDeg = Math.min(90, 14 * n);
  const stepDeg = n > 1 ? arcSpanDeg / (n - 1) : 0;
  const startDeg = -arcSpanDeg / 2;
  return {
    '--arc-start': `${startDeg}deg`,
    '--arc-step': `${stepDeg}deg`,
    '--orb-r': `${orbRadiusPx}px`,
    '--letter-count': String(n),
  } as CSSProperties;
}

function NavLabel({
  label,
  arc,
  orbRadiusPx,
}: {
  label: string;
  arc: boolean;
  orbRadiusPx: number;
}) {
  if (!arc) {
    return <span className="label errl-metaball-link__label errl-metaball-link__label--flat">{label}</span>;
  }
  return (
    <span
      className="label errl-metaball-link__label errl-metaball-link__label--arc"
      aria-hidden="true"
      style={arcVarsForLabel(label, orbRadiusPx) as CSSProperties}
    >
      <span className="errl-metaball-link__label-ring">
        {label.split('').map((ch, ci) => (
          <span key={`${label}-${ci}`} className="errl-metaball-link__letter" style={{ '--i': ci } as CSSProperties}>
            {ch}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * Scene3d nav: DOM hit targets + labels positioned by shared physics.
 * CSS orbs always render; WebGL shader (when mounted) adds glow on top.
 */
export default function MetaballNavLinks({
  className = 'errl-metaball-nav',
  flatLabels = false,
}: MetaballNavLinksProps) {
  const physics = useNavPhysicsContext();
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
  const [arcLabels, setArcLabels] = useState(() => (typeof window !== 'undefined' ? !prefersReducedMotion() : true));

  const ballDiamPx = Math.round(getScene3dBubbleRadiusPx(viewportWidth) * 2);
  const orbRadiusPx = ballDiamPx / 2;
  const useArcLabels = !flatLabels && arcLabels;

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
    if (flatLabels) return undefined;
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const sync = () => setArcLabels(!mq.matches);
      sync();
      mq.addEventListener('change', sync);
      return () => mq.removeEventListener('change', sync);
    } catch (_) {
      return undefined;
    }
  }, [flatLabels]);

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
    const onViewportChange = () => {
      setViewportWidth(window.innerWidth);
      if (isErrlLayoutReady()) physics.reanchor();
    };
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('orientationchange', onViewportChange);
    return () => {
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('orientationchange', onViewportChange);
    };
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
          const depthScale = 1 + s.z;
          if (!flatLabels) {
            const tSec = performance.now() * 0.001;
            el.style.setProperty('--ring-spin', `${tSec * 0.55 + i * 1.15}rad`);
            el.style.setProperty('--orb-spin', `${tSec * 0.42 + i * 0.9}rad`);
          }
          el.style.transform = `translate(-50%, -50%) scale(${depthScale})`;
          el.style.zIndex = String(6 + Math.round(s.z * 20));
          el.classList.add('errl-metaball-link--ready');
        });
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [physics, flatLabels]);

  const rootClass = [className, 'errl-scene-3d-nav', flatLabels ? 'errl-metaball-nav--flat' : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} aria-hidden={false}>
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
            aria-label={item.label}
            style={
              {
                '--nav-ball-color': item.color,
                '--nav-ball-diam': `${ballDiamPx}px`,
              } as CSSProperties
            }
            {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            onMouseEnter={item.external ? undefined : () => prefetchWarpRoute(item.href)}
            onFocus={item.external ? undefined : () => prefetchWarpRoute(item.href)}
            onClick={
              item.external
                ? undefined
                : (e) => {
                    e.preventDefault();
                    startWarpNav(item.href);
                  }
            }
          >
            <span className="errl-metaball-link__orb" aria-hidden="true" />
            <NavLabel label={item.label} arc={useArcLabels} orbRadiusPx={orbRadiusPx} />
          </a>
        ))}
      </div>
    </div>
  );
}
