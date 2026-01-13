/**
 * Simplified portal URL resolver - pages are now at root level
 * e.g., /about/, /gallery/, /assets/ instead of /portal/pages/...
 */

export function resolvePortalPageUrl(relativePath: string): string {
  // Remove 'pages/' prefix if present (legacy support)
  let clean = relativePath.replace(/^pages\//, '');
  
  // Remove leading slash if present
  clean = clean.replace(/^\/+/, '');
  
  // Remove trailing slash if present (to avoid double slashes)
  clean = clean.replace(/\/$/, '');
  
  // Remove index.html if present
  clean = clean.replace(/\/index\.html$/, '');
  clean = clean.replace(/index\.html$/, '');
  
  // Return root-relative path with single trailing slash
  return clean ? `/${clean}/` : '/';
}
