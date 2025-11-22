let cachedPortalRoot: string | null = null;

function computePortalRoot(): string {
  const env = (import.meta as any)?.env ?? {};
  const baseUrl: string = typeof env.BASE_URL === 'string' ? env.BASE_URL : '/';
  const prefix = 'portal';

  if (baseUrl === '/' || baseUrl === '') {
    return `/${prefix}`;
  }

  const trimmed = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${trimmed}/${prefix}`;
}

function getPortalRoot(): string {
  if (!cachedPortalRoot) {
    cachedPortalRoot = computePortalRoot();
  }
  return cachedPortalRoot;
}

export function resolvePortalPageUrl(relativePath: string): string {
  const root = getPortalRoot();
  const cleaned = relativePath.replace(/^\/+/, '');
  return `${root}/${cleaned}`;
}
