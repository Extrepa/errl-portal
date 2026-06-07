import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ScreenQuad } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getMetaball, getSculpture, subscribeSceneControls } from '../bridge/sceneControls';
import type { SceneMetaballSettings, SceneSculptureSettings } from '../sceneTypes';
import { detectQualityTier, maxDpr } from '../quality';
import {
  hexToColorVec3,
  metaballFragmentShader,
  metaballVertexShader,
  screenPxToBallUniform,
} from './shaders/metaballSDF';
import { NAV_ITEMS } from '../nav/navConfig';
import { getErrlShaderCutout, getScene3dBubbleRadiusPx, isErrlLayoutReady } from '../nav/orbitLayout';
import { useNavPhysics, type NavPhysicsApi } from '../nav/useNavPhysics';

/** WebGL SDF metaball layer — landing hybrid nav + metaball lab. */

type NavSimProps = {
  physics: NavPhysicsApi;
  bubbleRadiusPx: number;
  stepSimulation?: boolean;
  onReady?: () => void;
};

function NavSimulation({ physics, bubbleRadiusPx, stepSimulation = true, onReady }: NavSimProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { gl } = useThree();
  const metaballRef = useRef<SceneMetaballSettings>(getMetaball());
  const sculptureRef = useRef<SceneSculptureSettings>(getSculpture());
  const readyRef = useRef(false);
  const reportedReadyRef = useRef(false);
  const ballRadiusPx = bubbleRadiusPx * 1.35;

  useEffect(() => {
    const unsub = subscribeSceneControls((s) => {
      metaballRef.current = s.metaball;
      sculptureRef.current = s.sculpture;
    });
    return () => {
      unsub();
    };
  }, []);

  const colorUniforms = useMemo(
    () =>
      NAV_ITEMS.map((item) => {
        const [r, g, b] = hexToColorVec3(item.color);
        return new THREE.Vector3(r, g, b);
      }),
    [],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerActive: { value: 0 },
      uErrlCenter: { value: new THREE.Vector2(0, 0.08) },
      uErrlRadius: { value: 0.38 },
      uBall0: { value: new THREE.Vector4() },
      uBall1: { value: new THREE.Vector4() },
      uBall2: { value: new THREE.Vector4() },
      uBall3: { value: new THREE.Vector4() },
      uColor0: { value: colorUniforms[0] },
      uColor1: { value: colorUniforms[1] },
      uColor2: { value: colorUniforms[2] },
      uColor3: { value: colorUniforms[3] },
      uMergeK: { value: metaballRef.current.mergeK * 0.012 },
      uGlow: { value: metaballRef.current.glow },
      uPointerPull: { value: metaballRef.current.pointerPull },
    }),
    [colorUniforms],
  );

  useFrame((state, dt) => {
    if (!isErrlLayoutReady()) return;

    if (!readyRef.current) {
      physics.reanchor();
      readyRef.current = true;
    }

    if (stepSimulation) {
      physics.step(
        Math.min(dt, 0.05),
        {
          x: state.pointer.x,
          y: state.pointer.y,
          active: Math.abs(state.pointer.x) > 0.02 || Math.abs(state.pointer.y) > 0.02,
        },
        () => sculptureRef.current,
      );
    }

    if (!matRef.current) return;
    const mb = metaballRef.current;
    const u = matRef.current.uniforms;
    const canvas = gl.domElement;
    const vw = canvas.clientWidth;
    const vh = canvas.clientHeight;
    if (vw <= 0 || vh <= 0) return;

    u.uTime.value = state.clock.elapsedTime;
    const dbSize = new THREE.Vector2();
    gl.getDrawingBufferSize(dbSize);
    u.uResolution.value.copy(dbSize);
    u.uPointer.value.set((state.pointer.x + 1) * 0.5, (state.pointer.y + 1) * 0.5);
    u.uPointerActive.value = state.pointer.x !== 0 || state.pointer.y !== 0 ? 1 : 0;
    u.uMergeK.value = mb.mergeK * 0.012;
    u.uGlow.value = mb.glow;
    u.uPointerPull.value = mb.pointerPull;

    const cutout = getErrlShaderCutout();
    u.uErrlCenter.value.set(cutout.center.x, cutout.center.y);
    u.uErrlRadius.value = cutout.radius;

    const states = physics.getStates();
    const balls = [u.uBall0, u.uBall1, u.uBall2, u.uBall3];
    states.forEach((s, i) => {
      if (!balls[i]) return;
      const ball = screenPxToBallUniform(s.x, s.y, ballRadiusPx, vw, vh);
      balls[i].value.set(ball.x, ball.y, ball.z, ball.w);
    });

    if (!reportedReadyRef.current && onReady) {
      reportedReadyRef.current = true;
      onReady();
    }
  });

  return (
    <ScreenQuad frustumCulled={false} renderOrder={999}>
      <shaderMaterial
        ref={matRef}
        vertexShader={metaballVertexShader}
        fragmentShader={metaballFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </ScreenQuad>
  );
}

export type MetaballNavCanvasProps = {
  showPost?: boolean;
  className?: string;
  physics?: NavPhysicsApi;
  /** When physics is shared with MetaballNavLinks, set false so only one loop steps. */
  stepSimulation?: boolean;
  onReady?: () => void;
};

export default function MetaballNavCanvas({
  showPost: _showPost = true,
  className = 'metaball-lab-canvas',
  physics: physicsProp,
  stepSimulation = true,
  onReady,
}: MetaballNavCanvasProps) {
  void _showPost;
  const tier = detectQualityTier();
  const dpr = maxDpr(tier);
  const internalPhysics = useNavPhysics();
  const physics = physicsProp ?? internalPhysics;
  const shouldStep = physicsProp ? stepSimulation : true;
  const bubbleRadiusPx = getScene3dBubbleRadiusPx(
    typeof window !== 'undefined' ? window.innerWidth : 1440,
  );

  return (
    <div className={className} aria-hidden={false}>
      <Canvas
        dpr={dpr}
        frameloop="always"
        gl={{ alpha: true, antialias: tier !== 'low', premultipliedAlpha: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      >
        <NavSimulation
          physics={physics}
          bubbleRadiusPx={bubbleRadiusPx}
          stepSimulation={shouldStep}
          onReady={onReady}
        />
      </Canvas>
    </div>
  );
}
