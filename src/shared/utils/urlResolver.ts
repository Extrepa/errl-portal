/**
 * Simple URL resolver for portal pages
 * Returns root-relative paths - same in dev and production
 */

/**
 * Resolve a portal page URL to a root-relative path
 * @param pagePath - Path like "about/index.html" or "pages/about/index.html"
 * @returns Root-relative path like "/about/"
 */
export function resolvePortalUrl(pagePath: string): string {
  // Remove 'pages/' prefix if present (legacy support)
  let clean = pagePath.replace(/^pages\//, '');
  
  // Remove leading slash if present
  clean = clean.replace(/^\//, '');
  
  // Remove trailing slash if present (to avoid double slashes)
  clean = clean.replace(/\/$/, '');
  
  // Remove index.html if present
  clean = clean.replace(/\/index\.html$/, '');
  clean = clean.replace(/index\.html$/, '');
  
  // Return root-relative path with single trailing slash
  return clean ? `/${clean}/` : '/';
}

/**
 * Get the base path for portal pages (always root in simplified structure)
 * @returns Always returns "/"
 */
export function getPortalBasePath(): string {
  return '/';
}
