import { useEffect, useState } from 'react';
import { downloadGalleryImage } from './galleryDownload';
import type { GalleryItem } from './useGalleryManifest';

type Props = {
  item: GalleryItem | null;
  onClose: () => void;
};

export default function GalleryLightbox({ item, onClose }: Props) {
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadGalleryImage(item);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={item.title}>
      <button type="button" className="gallery-lightbox__backdrop" aria-label="Close" onClick={onClose} />
      <figure className="gallery-lightbox__panel">
        <img className="gallery-lightbox__img" src={item.src} alt={item.title} />
        <figcaption className="gallery-lightbox__caption">{item.title}</figcaption>
        <div className="gallery-lightbox__actions">
          <button type="button" className="gallery-lightbox__download" disabled={downloading} onClick={handleDownload}>
            {downloading ? 'Downloading…' : 'Download full quality'}
          </button>
          <button type="button" className="gallery-lightbox__close" onClick={onClose}>
            Close
          </button>
        </div>
      </figure>
    </div>
  );
}
