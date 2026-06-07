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
  albums: Array<{
    id: string;
    title: string;
    items: GalleryItem[];
  }>;
};

function resolveAssetUrl(src: string): string {
  const base = typeof import.meta.env?.BASE_URL === 'string' ? import.meta.env.BASE_URL : '/';
  return src.replace(/%BASE_URL%/g, base);
}

function resolveItems(items: GalleryItem[]): GalleryItem[] {
  return items.map((item) => ({
    src: resolveAssetUrl(item.src),
    title: item.title,
  }));
}

async function fetchManifest(): Promise<Manifest> {
  const url =
    typeof window !== 'undefined'
      ? new URL('manifest.json', window.location.href).href
      : '/gallery/manifest.json';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gallery manifest failed: ${res.status}`);
  return (await res.json()) as Manifest;
}

export async function fetchGalleryManifest(): Promise<{
  defaultAlbumId: string;
  albums: GalleryAlbum[];
}> {
  const data = await fetchManifest();
  const albums = data.albums.map((album) => ({
    id: album.id,
    title: album.title,
    items: resolveItems(album.items),
  }));
  return { defaultAlbumId: data.default, albums };
}

/** @param limit Max items from default album; 0 = all */
export async function loadGalleryManifest(limit = 48): Promise<GalleryItem[]> {
  const { defaultAlbumId, albums } = await fetchGalleryManifest();
  const album = albums.find((a) => a.id === defaultAlbumId) ?? albums[0];
  if (!album) return [];
  return limit > 0 ? album.items.slice(0, limit) : album.items;
}
