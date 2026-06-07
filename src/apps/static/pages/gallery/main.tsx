import { createRoot } from 'react-dom/client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import GalleryCollectionHeader from '../../../gallery/GalleryCollectionHeader';
import GalleryAmbient from '../../../gallery/GalleryAmbient';
import GalleryCirclesView from '../../../gallery/GalleryCirclesView';
import GalleryDensitySlider, { tileSizePx } from '../../../gallery/GalleryDensitySlider';
import GalleryGridView from '../../../gallery/GalleryGridView';
import GalleryLightbox from '../../../gallery/GalleryLightbox';
import GalleryOrbitView from '../../../gallery/GalleryOrbitView';
import GalleryViewDial, { type GalleryViewMode } from '../../../gallery/GalleryViewDial';
import {
  fetchGalleryManifest,
  type GalleryAlbum,
  type GalleryItem,
} from '../../../gallery/useGalleryManifest';
import '../../../gallery/gallery.css';

const VIEW_KEY = 'errl_gallery_view';
const DENSITY_CIRCLES_KEY = 'errl_gallery_density_circles';
const DENSITY_GRID_KEY = 'errl_gallery_density_grid';
const DEFAULT_CIRCLES_DENSITY = 58;
const DEFAULT_GRID_DENSITY = 42;

function readStoredView(): GalleryViewMode {
  try {
    const v = sessionStorage.getItem(VIEW_KEY);
    if (v === 'scroll') return 'grid';
    if (v === 'circles' || v === 'orbit' || v === 'grid') return v;
  } catch (_) {}
  return 'grid';
}

function readStoredDensity(mode: GalleryViewMode): number {
  const key = mode === 'grid' ? DENSITY_GRID_KEY : DENSITY_CIRCLES_KEY;
  const fallback = mode === 'grid' ? DEFAULT_GRID_DENSITY : DEFAULT_CIRCLES_DENSITY;
  try {
    const legacy = sessionStorage.getItem('errl_gallery_density');
    const v = Number(sessionStorage.getItem(key) ?? legacy);
    if (Number.isFinite(v) && v >= 0 && v <= 100) return v;
  } catch (_) {}
  return fallback;
}

function pickRandomAlbumId(albums: GalleryAlbum[], fallbackId: string): string {
  if (albums.length === 0) return fallbackId;
  return albums[Math.floor(Math.random() * albums.length)].id;
}

function GalleryApp() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [activeAlbumId, setActiveAlbumId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<GalleryViewMode>(readStoredView);
  const [circlesDensity, setCirclesDensity] = useState(() => readStoredDensity('circles'));
  const [gridDensity, setGridDensity] = useState(() => readStoredDensity('grid'));
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGalleryManifest()
      .then(({ defaultAlbumId, albums: loaded }) => {
        setAlbums(loaded);
        setActiveAlbumId(pickRandomAlbumId(loaded, defaultAlbumId));
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load gallery');
        setLoading(false);
      });
  }, []);

  const items = useMemo(() => {
    const album = albums.find((a) => a.id === activeAlbumId);
    return album?.items ?? [];
  }, [albums, activeAlbumId]);

  const density = viewMode === 'grid' ? gridDensity : circlesDensity;
  const orbSizePx = useMemo(() => tileSizePx('circles', circlesDensity), [circlesDensity]);
  const gridCellPx = useMemo(() => tileSizePx('grid', gridDensity), [gridDensity]);

  const handleViewChange = useCallback((mode: GalleryViewMode) => {
    setViewMode(mode);
    try {
      sessionStorage.setItem(VIEW_KEY, mode);
    } catch (_) {}
  }, []);

  const handleDensityChange = useCallback(
    (value: number) => {
      if (viewMode === 'grid') {
        setGridDensity(value);
        try {
          sessionStorage.setItem(DENSITY_GRID_KEY, String(value));
        } catch (_) {}
      } else {
        setCirclesDensity(value);
        try {
          sessionStorage.setItem(DENSITY_CIRCLES_KEY, String(value));
        } catch (_) {}
      }
    },
    [viewMode],
  );

  const handleAlbumChange = useCallback((albumId: string) => {
    setActiveAlbumId(albumId);
  }, []);

  const handleSelect = useCallback((item: GalleryItem) => {
    setLightboxItem(item);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('errl-gallery-orbit-active', viewMode === 'orbit');
    document.body.classList.toggle('errl-gallery-circles-active', viewMode === 'circles');
    document.body.classList.toggle('errl-gallery-grid-active', viewMode === 'grid');
    if (viewMode === 'orbit') window.scrollTo(0, 0);
    return () => {
      document.body.classList.remove('errl-gallery-orbit-active');
      document.body.classList.remove('errl-gallery-circles-active');
      document.body.classList.remove('errl-gallery-grid-active');
    };
  }, [viewMode]);

  if (loading) {
    return <div className="gallery-loading" role="status">Loading gallery…</div>;
  }

  if (error) {
    return (
      <div className="gallery-loading gallery-loading--error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="gallery-shell" data-gallery-view={viewMode} data-gallery-ready="true">
      <GalleryAmbient />
      <div className="gallery-chrome">
        <GalleryCollectionHeader albums={albums} activeId={activeAlbumId} onChange={handleAlbumChange} />
        {viewMode !== 'orbit' ? (
          <div className="gallery-toolbar">
            <GalleryDensitySlider mode={viewMode} value={density} onChange={handleDensityChange} />
          </div>
        ) : null}
      </div>

      {viewMode === 'orbit' ? <GalleryOrbitView items={items} onSelect={handleSelect} /> : null}
      {viewMode === 'circles' ? (
        <GalleryCirclesView items={items} orbSizePx={orbSizePx} onSelect={handleSelect} />
      ) : null}
      {viewMode === 'grid' ? (
        <GalleryGridView items={items} cellMinPx={gridCellPx} onSelect={handleSelect} />
      ) : null}

      <footer className="gallery-dock">
        {viewMode === 'orbit' ? (
          <p className="gallery-dock__hint">Drag or scroll to speed up · Click a photo to open</p>
        ) : (
          <span className="gallery-dock__hint gallery-dock__hint--spacer" aria-hidden="true" />
        )}
        <GalleryViewDial mode={viewMode} onChange={handleViewChange} compact />
      </footer>

      <GalleryLightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
    </div>
  );
}

const mount = document.getElementById('gallery-root');
if (mount) {
  createRoot(mount).render(<GalleryApp />);
}
