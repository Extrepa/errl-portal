import { Link } from 'react-router-dom';
import { resolvePortalPageUrl } from '../utils/portalPaths';
import './portal-header.css';

type NavItemKey = 'about' | 'gallery' | 'assets' | 'studio' | 'pin-designer' | 'events' | 'merch';

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
  const portalHome = resolvePortalPageUrl('index.html');

  const derivedKeyFromLocation = (): NavItemKey | undefined => {
    if (typeof window === 'undefined') return undefined;
    const { pathname, href } = window.location;
    const normalizedPath = pathname.toLowerCase();
    const normalizedHref = href.toLowerCase();

    if (normalizedHref.includes('/pages/assets/')) return 'assets';
    if (normalizedHref.includes('/pages/gallery/')) return 'gallery';
    if (normalizedHref.includes('/pages/events/')) return 'events';
    if (normalizedHref.includes('/pages/merch/')) return 'merch';
    if (normalizedHref.includes('/pages/about/')) return 'about';
    if (normalizedPath.includes('/pin-designer')) return 'pin-designer';
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
    if (activeKey && activeKey !== 'code-lab') return activeKey;
    return derivedKeyFromLocation();
  })();

  const navItems: NavItem[] = [
    { key: 'about', label: 'About Errl', href: resolvePortalPageUrl('pages/about/index.html'), type: 'external' },
    { key: 'gallery', label: 'Gallery', href: resolvePortalPageUrl('pages/gallery/index.html'), type: 'external' },
    { key: 'assets', label: 'Assets', href: resolvePortalPageUrl('pages/assets/index.html'), type: 'external' },
    { key: 'studio', label: 'Studio', to: '/', type: 'internal' },
    { key: 'pin-designer', label: 'Design', to: '/pin-designer', type: 'internal' },
    { key: 'events', label: 'Events', href: resolvePortalPageUrl('pages/events/index.html'), type: 'external' },
    { key: 'merch', label: 'Merch', href: resolvePortalPageUrl('pages/merch/index.html'), type: 'external' },
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
              <a key={item.key} href={item.href} className={className}>
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}


