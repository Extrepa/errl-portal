export type GalleryItem = {
  src: string;
  title: string;
};

export type GalleryAlbum = {
  id: string;
  title: string;
  items: GalleryItem[];
};

type Manifest = {
  default: string;
  albums: GalleryAlbum[];
};

function resolveAssetUrl(src: string): string {
  const base = typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/';
  return src.replace(/%BASE_URL%/g, base);
}

export async function loadGalleryManifest(limit = 10): Promise<GalleryItem[]> {
  const url =
    typeof window !== 'undefined'
      ? new URL('manifest.json', window.location.href).href
      : '/gallery/manifest.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gallery manifest failed: ${res.status}`);
  const data = (await res.json()) as Manifest;
  const album = data.albums.find((a) => a.id === data.default) ?? data.albums[0];
  if (!album) return [];
  return album.items.slice(0, limit).map((item) => ({
    src: resolveAssetUrl(item.src),
    title: item.title,
  }));
}
