import { useEffect, useRef, useState } from 'react';
import { downloadGalleryAlbumZip } from './galleryDownload';
import type { GalleryAlbum } from './useGalleryManifest';

type Props = {
  albums: GalleryAlbum[];
  activeId: string;
  onChange: (albumId: string) => void;
};

export default function GalleryCollectionHeader({ albums, activeId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const active = albums.find((a) => a.id === activeId) ?? albums[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleDownloadAlbum = async () => {
    if (!active || downloading) return;
    setDownloading(true);
    setProgress('0%');
    try {
      await downloadGalleryAlbumZip(active, (done, total) => {
        setProgress(`${Math.round((done / total) * 100)}%`);
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Download failed';
      setProgress(msg);
      setTimeout(() => setProgress(''), 3000);
    } finally {
      setDownloading(false);
    }
  };

  if (!active) return null;

  return (
    <div className="gallery-collection" ref={rootRef}>
      <span className="gallery-collection__watermark" aria-hidden="true">
        {active.title}
      </span>

      <button
        type="button"
        className="gallery-collection__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="gallery-collection__title">{active.title}</span>
        <span className="gallery-collection__meta">
          {active.items.length} photos · click to switch
        </span>
      </button>

      {open ? (
        <div className="gallery-collection__picker" role="listbox" aria-label="Collections">
          {albums.map((album) => (
            <button
              key={album.id}
              type="button"
              role="option"
              aria-selected={album.id === activeId}
              className={`gallery-collection__option${album.id === activeId ? ' gallery-collection__option--active' : ''}`}
              onClick={() => {
                onChange(album.id);
                setOpen(false);
              }}
            >
              <span className="gallery-collection__option-title">{album.title}</span>
              <span className="gallery-collection__option-count">{album.items.length}</span>
            </button>
          ))}
          <button
            type="button"
            className="gallery-collection__download"
            disabled={downloading}
            onClick={handleDownloadAlbum}
          >
            {downloading ? `Zipping… ${progress}` : 'Download collection'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
