export interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export class CookieManager {
  /**
   * Set a cookie with optional configuration
   */
  static set(name: string, value: string, options: CookieOptions = {}): void {
    const {
      expires = 365, // Default: 1 year
      path = '/',
      domain,
      secure = window.location.protocol === 'https:',
      sameSite = 'lax'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    
    // Handle expires
    if (expires) {
      const expiresDate = typeof expires === 'number' 
        ? new Date(Date.now() + expires * 24 * 60 * 60 * 1000)
        : expires;
      cookieString += `; expires=${expiresDate.toUTCString()}`;
    }
    
    cookieString += `; path=${path}`;
    
    if (domain) cookieString += `; domain=${domain}`;
    if (secure) cookieString += `; secure`;
    if (sameSite) cookieString += `; samesite=${sameSite}`;
    
    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static get(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${encodeURIComponent(name)}=`);
    
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? decodeURIComponent(cookieValue) : null;
    }
    
    return null;
  }

  /**
   * Remove a cookie
   */
  static remove(name: string, path: string = '/'): void {
    this.set(name, '', { expires: new Date(0), path });
  }

  /**
   * Check if a cookie exists
   */
  static has(name: string): boolean {
    return this.get(name) !== null;
  }

  /**
   * Store an object as JSON
   */
  static setJSON(name: string, value: any, options?: CookieOptions): void {
    this.set(name, JSON.stringify(value), options);
  }

  /**
   * Get and parse a JSON cookie
   */
  static getJSON<T = any>(name: string): T | null {
    const value = this.get(name);
    if (!value) return null;
    
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
}

// Convenience functions for common use cases
export const cookies = {
  set: CookieManager.set.bind(CookieManager),
  get: CookieManager.get.bind(CookieManager),
  remove: CookieManager.remove.bind(CookieManager),
  has: CookieManager.has.bind(CookieManager),
  setJSON: CookieManager.setJSON.bind(CookieManager),
  getJSON: CookieManager.getJSON.bind(CookieManager)
};