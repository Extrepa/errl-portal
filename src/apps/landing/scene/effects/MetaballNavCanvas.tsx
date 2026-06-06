import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { getMetaball, getSculpture, subscribeSceneControls } from '../bridge/sceneControls';
import type { SceneMetaballSettings, SceneSculptureSettings } from '../sceneTypes';
import { detectQualityTier, maxDpr, sdfMarchSteps } from '../quality';
import { metaballFragmentShader, metaballVertexShader, physicsToBall } from './shaders/metaballSDF';
import { NAV_ITEMS } from '../nav/navConfig';
import { clampNormToViewport, getOrbitWorldScale } from '../nav/orbitLayout';
import { useNavPhysics, type NavPhysicsApi } from '../nav/useNavPhysics';

function vec4Uniform(ball: { x: number; y: number; z: number; w: number }) {
  return new THREE.Vector4(ball.x, ball.y, ball.z, ball.w);
}

type MetaballQuadProps = {
  steps: number;
  physics: NavPhysicsApi;
  worldScale: number;
};

function MetaballQuad({ steps, physics, worldScale }: MetaballQuadProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { size, pointer } = useThree();
  const metaballRef = useRef<SceneMetaballSettings>(getMetaball());

  useEffect(() => {
    const unsub = subscribeSceneControls((s) => {
      metaballRef.current = s.metaball;
      if (matRef.current) {
        matRef.current.uniforms.uSteps.value = Math.min(96, Math.max(16, Math.round(s.metaball.steps)));
      }
    });
    return () => {
      unsub();
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerActive: { value: 0 },
      uSteps: { value: steps },
      uBall0: { value: vec4Uniform(physicsToBall(0, 0.1, 0, 0.2, worldScale)) },
      uBall1: { value: vec4Uniform(physicsToBall(0.5, 0.2, 0, 0.2, worldScale)) },
      uBall2: { value: vec4Uniform(physicsToBall(-0.5, 0.2, 0, 0.2, worldScale)) },
      uBall3: { value: vec4Uniform(physicsToBall(0, -0.4, 0, 0.2, worldScale)) },
      uMergeK: { value: metaballRef.current.mergeK },
      uGlow: { value: metaballRef.current.glow },
      uPointerPull: { value: metaballRef.current.pointerPull },
    }),
    [steps, worldScale],
  );

  useFrame((state) => {
    if (!matRef.current) return;
    const mb = metaballRef.current;
    const u = matRef.current.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    u.uResolution.value.set(size.width, size.height);
    u.uPointer.value.set((pointer.x + 1) * 0.5, (pointer.y + 1) * 0.5);
    u.uPointerActive.value = pointer.x !== 0 || pointer.y !== 0 ? 1 : 0;
    u.uMergeK.value = mb.mergeK;
    u.uGlow.value = mb.glow;
    u.uPointerPull.value = mb.pointerPull;

    const states = physics.getStates();
    const balls = [u.uBall0, u.uBall1, u.uBall2, u.uBall3];
    states.forEach((s, i) => {
      if (!balls[i]) return;
      const b = physicsToBall(s.x, s.y, s.z, 0.2, worldScale);
      balls[i].value.set(b.x, b.y, b.z, b.w);
    });
  });

  return (
    <mesh>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={metaballVertexShader}
        fragmentShader={metaballFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

type NavLabelsProps = {
  physics: NavPhysicsApi;
  getSculpture: () => SceneSculptureSettings;
  worldScale: number;
};

function NavLabels({ physics, getSculpture, worldScale }: NavLabelsProps) {
  const [, tick] = useState(0);
  const sculptureRef = useRef(getSculpture());

  useEffect(() => {
    const unsub = subscribeSceneControls((s) => {
      sculptureRef.current = s.sculpture;
    });
    return () => {
      unsub();
    };
  }, []);

  useFrame((_, dt) => {
    physics.step(Math.min(dt, 0.05), undefined, () => sculptureRef.current);
    tick((n) => n + 1);
  });

  const states = physics.getStates();

  return (
    <>
      {states.map((s, i) => {
        const item = NAV_ITEMS[i];
        const clamped = clampNormToViewport(s.x, s.y, worldScale);
        return (
          <Html
            key={item.key}
            position={[clamped.x * worldScale, clamped.y * worldScale, s.z]}
            center
            style={{ pointerEvents: 'auto' }}
          >
            <a
              href={item.href}
              className="bubble menuOrb errl-scene-3d-label"
              data-nav-bubble-key={item.key}
              style={{ textDecoration: 'none', opacity: 0.95 }}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="label">{item.label}</span>
            </a>
          </Html>
        );
      })}
    </>
  );
}

export type MetaballNavCanvasProps = {
  showLabels?: boolean;
  showPost?: boolean;
  className?: string;
};

export default function MetaballNavCanvas({
  showLabels = true,
  showPost = true,
  className = 'errl-scene-3d-nav',
}: MetaballNavCanvasProps) {
  const tier = detectQualityTier();
  const steps = sdfMarchSteps(tier);
  const dpr = maxDpr(tier);
  const physics = useNavPhysics();
  const worldScale = getOrbitWorldScale(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const [post, setPost] = useState({ bloomIntensity: 0.4, bloomThreshold: 0.6, vignetteDarkness: 0.7 });

  useEffect(() => {
    const unsub = subscribeSceneControls((s) => {
      setPost({
        bloomIntensity: s.metaball.bloomIntensity,
        bloomThreshold: s.metaball.bloomThreshold,
        vignetteDarkness: s.metaball.vignetteDarkness,
      });
    });
    return () => {
      unsub();
    };
  }, []);

  return (
    <div className={className} aria-hidden={false}>
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 2.2], fov: 50 }}
        gl={{ alpha: true, antialias: tier !== 'low' }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <MetaballQuad steps={steps} physics={physics} worldScale={worldScale} />
        {showLabels ? <NavLabels physics={physics} getSculpture={getSculpture} worldScale={worldScale} /> : null}
        {showPost && tier !== 'low' ? (
          <EffectComposer>
            <Bloom luminanceThreshold={post.bloomThreshold} intensity={post.bloomIntensity} />
            <Vignette eskil offset={0.2} darkness={post.vignetteDarkness} />
          </EffectComposer>
        ) : null}
      </Canvas>
    </div>
  );
}
