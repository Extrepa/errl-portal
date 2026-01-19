import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolvePortalPageUrl } from '../utils/portalPaths';
import './portal-header.css';

type NavItemKey = 'about' | 'assets' | 'design' | 'forum' | 'gallery' | 'studio';

export type PortalNavKey = NavItemKey | 'code-lab';

type PortalHeaderProps = {
  activeKey?: PortalNavKey;
};

type NavItem =
  | {
      key: NavItemKey;
      label: string;
      to: string;
      type: 'internal';
    }
  | {
      key: NavItemKey;
      label: string;
      href: string;
      type: 'external';
    };

export default function PortalHeader({ activeKey }: PortalHeaderProps) {
  // Landing page is at root, not under /portal
  const portalHome = '/';

  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  useEffect(() => {
    if (!comingSoonVisible) return;
    const t = window.setTimeout(() => setComingSoonVisible(false), 1400);
    return () => window.clearTimeout(t);
  }, [comingSoonVisible]);

  const derivedKeyFromLocation = (): NavItemKey | undefined => {
    if (typeof window === 'undefined') return undefined;
    const { pathname, href } = window.location;
    const normalizedPath = pathname.toLowerCase();
    const normalizedHref = href.toLowerCase();

    if (normalizedHref.includes('/pages/assets/')) return 'assets';
    if (normalizedHref.includes('/pages/gallery/')) return 'gallery';
    if (normalizedHref.includes('/pages/about/')) return 'about';
    if (normalizedHref.includes('/pages/design/')) return 'design';
    if (normalizedPath === '/design' || normalizedPath === '/design/' || normalizedPath.startsWith('/design/')) return 'design';
    if (
      normalizedPath === '/studio' ||
      normalizedPath === '/studio/' ||
      normalizedPath.endsWith('/studio/index.html') ||
      normalizedPath.startsWith('/studio/')
    ) {
      return 'studio';
    }
    return undefined;
  };

  const highlightKey: NavItemKey | undefined = (() => {
    if (activeKey === 'code-lab') return 'studio';
    if (activeKey) return activeKey as NavItemKey;
    return derivedKeyFromLocation();
  })();

  const navItems: NavItem[] = [
    { key: 'about', label: 'About Errl', href: resolvePortalPageUrl('pages/about/index.html'), type: 'external' },
    { key: 'assets', label: 'Assets', href: resolvePortalPageUrl('pages/assets/index.html'), type: 'external' },
    { key: 'design', label: 'Design', href: resolvePortalPageUrl('pages/design/index.html'), type: 'external' },
    { key: 'forum', label: 'Forum', href: 'https://forum.errl.wtf', type: 'external' },
    { key: 'gallery', label: 'Gallery', href: resolvePortalPageUrl('pages/gallery/index.html'), type: 'external' },
    { key: 'studio', label: 'Studio', to: '/', type: 'internal' },
  ];

  return (
    <header className="errl-header">
      <div className="errl-header-content">
        <a className="errl-home-btn" href={portalHome}>
          <span className="chevron" aria-hidden>
            ←
          </span>
          Back to Portal
        </a>

        <nav className="errl-nav" aria-label="Errl primary">
          {navItems.map((item) => {
            const isActive = highlightKey === item.key;
            const className = ['errl-bubble-btn', isActive ? 'active' : ''].filter(Boolean).join(' ');

            if (item.type === 'internal') {
              return (
                <Link key={item.key} to={item.to} className={className} aria-current={isActive ? 'page' : undefined}>
                  {item.label}
                </Link>
              );
            }

            return (
              <a
                key={item.key}
                href={item.href}
                className={className}
                aria-disabled={item.key === 'design' ? 'true' : undefined}
                title={item.key === 'design' ? 'Coming soon' : undefined}
                onClick={(e) => {
                  if (item.key !== 'design') return;
                  e.preventDefault();
                  e.stopPropagation();
                  setComingSoonVisible(true);
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {comingSoonVisible ? (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 18,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            maxWidth: 'min(92vw, 520px)',
            padding: '10px 14px',
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.22)',
            background: 'rgba(10, 14, 24, 0.88)',
            backdropFilter: 'blur(10px)',
            color: 'rgba(240, 245, 255, 0.96)',
            font: "600 12px/1.2 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif",
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            boxShadow: '0 10px 24px rgba(0,0,0,0.45)',
          }}
        >
          Design — coming soon
        </div>
      ) : null}
    </header>
  );
}


