import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { detectQualityTier } from '../landing/scene/quality';
import type { GalleryItem } from './useGalleryManifest';

type FrameProps = {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  title: string;
};

function ArtFrame({ url, position, rotation, title }: FrameProps) {
  const texture = useTexture(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  return (
    <group position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[2.6, 2.6]} />
        <meshStandardMaterial
          map={texture}
          emissive="#1a3355"
          emissiveIntensity={0.2}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[2.85, 2.85]} />
        <meshStandardMaterial color="#0c1628" emissive="#224466" emissiveIntensity={0.08} />
      </mesh>
      <pointLight position={[0, 0, 1.2]} intensity={0.35} color="#88ccff" distance={4} />
      <mesh visible={false} userData={{ title }} />
    </group>
  );
}

type Props = {
  items: GalleryItem[];
  scrollProgress: number;
};

export default function FloatingHall({ items, scrollProgress }: Props) {
  const tier = detectQualityTier();
  const maxItems = tier === 'low' ? 6 : tier === 'high' ? 12 : 8;
  const slice = useMemo(() => items.slice(0, maxItems), [items, maxItems]);

  const frames = useMemo(
    () =>
      slice.map((item, i) => {
        const t = slice.length > 1 ? i / (slice.length - 1) : 0.5;
        const angle = t * Math.PI * 0.75 - Math.PI * 0.375;
        const radius = 5.2 + scrollProgress * 0.8;
        const x = Math.sin(angle + scrollProgress * 0.4) * radius;
        const z = -Math.cos(angle) * radius - 1.5;
        const y = (i - slice.length / 2) * 0.42 + Math.sin(scrollProgress * Math.PI * 2 + i * 0.7) * 0.25;
        return {
          item,
          position: [x, y, z] as [number, number, number],
          rotation: [0, -angle - scrollProgress * 0.15, 0] as [number, number, number],
        };
      }),
    [slice, scrollProgress],
  );

  if (slice.length === 0) {
    return <div className="gallery-loading">Loading gallery…</div>;
  }

  return (
    <div className="gallery-hall__canvas" data-gallery-ready="true">
      <Canvas camera={{ position: [0, 0.2, 9], fov: 48 }} dpr={tier === 'low' ? 1 : [1, 1.75]}>
        <color attach="background" args={['#06080f']} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 6, 8]} intensity={0.9} color="#c8e8ff" />
        <Suspense fallback={null}>
          {frames.map(({ item, position, rotation }) => (
            <ArtFrame
              key={item.src}
              url={item.src}
              position={position}
              rotation={rotation}
              title={item.title}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}
