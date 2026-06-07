import type { GalleryAlbum, GalleryItem } from './useGalleryManifest';

export function filenameFromItem(item: GalleryItem): string {
  const fromUrl = item.src.split('/').pop()?.split('?')[0];
  if (fromUrl) return fromUrl;
  const safe = item.title.replace(/[^\w.-]+/g, '_').replace(/_+/g, '_');
  return `${safe || 'errl-image'}.jpg`;
}

export async function downloadGalleryImage(item: GalleryItem): Promise<void> {
  const res = await fetch(item.src);
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filenameFromItem(item);
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function downloadGalleryAlbumZip(
  album: GalleryAlbum,
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const folder = zip.folder(album.title.replace(/[^\w.-]+/g, '_')) ?? zip;

  for (let i = 0; i < album.items.length; i++) {
    const item = album.items[i];
    const res = await fetch(item.src);
    if (!res.ok) throw new Error(`Failed to fetch ${filenameFromItem(item)}`);
    const blob = await res.blob();
    folder.file(filenameFromItem(item), blob);
    onProgress?.(i + 1, album.items.length);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${album.id}.zip`;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
