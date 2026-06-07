import { Suspense, useMemo, useRef } from 'react';
import { Canvas, type ThreeEvent, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { detectQualityTier } from '../landing/scene/quality';
import { poseOnPath, windowSlice } from './orbitPath';
import type { GalleryItem } from './useGalleryManifest';

const ORBIT_FOV = 88;

type FrameProps = {
  item: GalleryItem;
  size: number;
  onSelect?: (item: GalleryItem) => void;
  setGroup: (group: THREE.Group | null) => void;
};

function ArtFrame({ item, size, onSelect, setGroup }: FrameProps) {
  const texture = useTexture(item.src);
  texture.colorSpace = THREE.SRGBColorSpace;

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect?.(item);
  };

  return (
    <group ref={setGroup}>
      <mesh
        onClick={handleClick}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = '';
        }}
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}

type SceneProps = {
  items: GalleryItem[];
  progressRef: React.RefObject<number>;
  windowKey: number;
  onSelectItem?: (item: GalleryItem) => void;
};

function OrbitScene({ items, progressRef, windowKey, onSelectItem }: SceneProps) {
  const tier = detectQualityTier();
  const maxItems = tier === 'low' ? 10 : tier === 'high' ? 16 : 13;
  const slice = useMemo(
    () => windowSlice(items, progressRef.current ?? 0, maxItems),
    [items, maxItems, windowKey, progressRef],
  );
  const groupsRef = useRef<Array<THREE.Group | null>>([]);

  const sizes = useMemo(
    () => slice.map((_, i) => poseOnPath(0, i, slice.length).size),
    [slice.length],
  );

  useFrame(() => {
    const progress = progressRef.current ?? 0;
    slice.forEach((_, i) => {
      const group = groupsRef.current[i];
      if (!group) return;
      const pose = poseOnPath(progress, i, slice.length);
      group.position.set(...pose.position);
      group.rotation.set(...pose.rotation);
    });
  });

  if (slice.length === 0) return null;

  return (
    <>
      {slice.map((item, i) => (
        <ArtFrame
          key={item.src}
          item={item}
          size={sizes[i]}
          onSelect={onSelectItem}
          setGroup={(g) => {
            groupsRef.current[i] = g;
          }}
        />
      ))}
    </>
  );
}

type Props = {
  items: GalleryItem[];
  progressRef: React.RefObject<number>;
  windowKey: number;
  onSelectItem?: (item: GalleryItem) => void;
};

export default function FloatingHall({ items, progressRef, windowKey, onSelectItem }: Props) {
  const tier = detectQualityTier();

  if (items.length === 0) {
    return <div className="gallery-loading">No photos in this collection.</div>;
  }

  const tierDpr: 1 | [number, number] = tier === 'low' ? 1 : [1, 1.75];

  return (
    <div className="gallery-hall__canvas" data-gallery-ready="true">
      <Canvas
        camera={{ position: [0, 0.08, 0], fov: ORBIT_FOV, near: 0.05, far: 50 }}
        dpr={tierDpr}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1} />
        <Suspense fallback={null}>
          <OrbitScene
            items={items}
            progressRef={progressRef}
            windowKey={windowKey}
            onSelectItem={onSelectItem}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
