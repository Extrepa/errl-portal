import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import FloatingHall from '../../../gallery/FloatingHall';
import { loadGalleryManifest, type GalleryItem } from '../../../gallery/useGalleryManifest';
import '../../../gallery/gallery.css';

function GalleryApp() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGalleryManifest(12)
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load gallery'));
  }, []);

  useEffect(() => {
    let reduced = false;
    try {
      reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch (_) {}

    if (reduced) {
      const onScroll = () => {
        const limit = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        setScrollProgress(window.scrollY / limit);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }

    const lenis = new Lenis({ smoothWheel: true, lerp: 0.08 });
    lenis.on('scroll', () => {
      const limit = lenis.limit || 1;
      setScrollProgress((lenis.scroll || 0) / limit);
    });
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  if (error) {
    return <div className="gallery-loading">{error}</div>;
  }

  return (
    <div className="gallery-hall">
      <FloatingHall items={items} scrollProgress={scrollProgress} />
      <div className="gallery-scroll-spacer" aria-hidden="true" />
    </div>
  );
}

const mount = document.getElementById('gallery-root');
if (mount) {
  createRoot(mount).render(<GalleryApp />);
}
