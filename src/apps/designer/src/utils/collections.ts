/**
 * Collections System
 * Groups projects/scenes for sharing and organization
 */

export interface Collection {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string; // Base64 data URL
  projectIds: string[]; // References to projects (stored separately)
  tags: string[];
  shareable: boolean;
  shareUrl?: string; // Generated URL for sharing
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
}

const STORAGE_KEY = 'multi_tool_collections';

/**
 * Load all collections
 */
export function loadCollections(): Collection[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save collections to storage
 */
function saveCollections(collections: Collection[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch (error) {
    console.error('Failed to save collections:', error);
  }
}

/**
 * Create a new collection
 */
export function createCollection(
  name: string,
  description?: string,
  projectIds: string[] = [],
  tags: string[] = []
): string {
  const collections = loadCollections();

  const collection: Collection = {
    id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    projectIds,
    tags,
    shareable: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  collections.push(collection);
  saveCollections(collections);

  return collection.id;
}

/**
 * Get a collection by ID
 */
export function getCollection(id: string): Collection | null {
  const collections = loadCollections();
  return collections.find((c) => c.id === id) || null;
}

/**
 * Update a collection
 */
export function updateCollection(id: string, updates: Partial<Collection>): boolean {
  const collections = loadCollections();
  const index = collections.findIndex((c) => c.id === id);

  if (index === -1) return false;

  collections[index] = {
    ...collections[index],
    ...updates,
    updatedAt: Date.now(),
  };

  saveCollections(collections);
  return true;
}

/**
 * Delete a collection
 */
export function deleteCollection(id: string): boolean {
  const collections = loadCollections();
  const filtered = collections.filter((c) => c.id !== id);

  if (filtered.length === collections.length) {
    return false; // Collection not found
  }

  saveCollections(filtered);
  return true;
}

/**
 * Generate a shareable URL for a collection
 */
export function generateShareUrl(collectionId: string): string {
  // In a production app, this would generate a unique URL
  // For now, return a local URL with the collection ID
  return `${window.location.origin}/share/${collectionId}`;
}

/**
 * Enable sharing for a collection
 */
export function enableCollectionSharing(collectionId: string): string | null {
  const collection = getCollection(collectionId);
  if (!collection) return null;

  const shareUrl = generateShareUrl(collectionId);
  updateCollection(collectionId, { shareable: true, shareUrl });

  return shareUrl;
}

/**
 * Disable sharing for a collection
 */
export function disableCollectionSharing(collectionId: string): boolean {
  return updateCollection(collectionId, { shareable: false, shareUrl: undefined });
}

/**
 * Search collections
 */
export function searchCollections(query: string): Collection[] {
  const collections = loadCollections();
  const lowerQuery = query.toLowerCase();

  return collections.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description?.toLowerCase().includes(lowerQuery) ||
      c.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

