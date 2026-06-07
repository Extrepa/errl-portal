import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @ts-expect-error — shared scroll helper ships as .mjs
import { bindHeaderScroll } from '../../../../../shared/scripts/portal-header-scroll.mjs';
import { resolvePortalPageUrl } from '../utils/portalPaths';
import './portal-header.css';

type NavItemKey = 'about' | 'forum' | 'gallery' | 'studio';

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

  const [pendingExternalHref, setPendingExternalHref] = useState<string | null>(null);

  const derivedKeyFromLocation = (): NavItemKey | undefined => {
    if (typeof window === 'undefined') return undefined;
    const { pathname, href } = window.location;
    const normalizedPath = pathname.toLowerCase();
    const normalizedHref = href.toLowerCase();

    if (normalizedHref.includes('/pages/gallery/')) return 'gallery';
    if (normalizedHref.includes('/pages/about/')) return 'about';
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
    { key: 'forum', label: 'Forum', href: 'https://forum.errl.wtf', type: 'external' },
    { key: 'about', label: 'About', href: resolvePortalPageUrl('pages/about/index.html'), type: 'external' },
    { key: 'gallery', label: 'Gallery', href: resolvePortalPageUrl('pages/gallery/index.html'), type: 'external' },
    { key: 'studio', label: 'Studio', to: '/', type: 'internal' },
  ];
  const visibleNavItems = navItems;

  useEffect(() => bindHeaderScroll(), []);

  return (
    <header className="errl-header">
      <div className="errl-header-content">
        <a className="errl-home-btn" href={portalHome} aria-label="Back to portal">
          <span className="chevron" aria-hidden>
            ←
          </span>
          <span className="errl-home-btn__label">Portal</span>
        </a>

        <nav className="errl-nav" aria-label="Errl primary">
          {visibleNavItems.map((item) => {
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
                onClick={(e) => {
                  if (item.key === 'forum') {
                    e.preventDefault();
                    e.stopPropagation();
                    setPendingExternalHref(item.href);
                  }
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>

      {pendingExternalHref ? (
        <div className="errl-external-modal">
          <div
            className="errl-external-modal__overlay"
            onClick={() => setPendingExternalHref(null)}
            aria-hidden
          />
          <div className="errl-external-modal__dialog" role="dialog" aria-modal="true" aria-labelledby="errl-forum-leave-title">
            <h2 id="errl-forum-leave-title" className="errl-external-modal__title">
              Leave portal?
            </h2>
            <p className="errl-external-modal__copy">You are leaving the Errl Portal and heading to the forum.</p>
            <div className="errl-external-modal__actions">
              <button
                type="button"
                className="errl-external-modal__btn"
                onClick={() => setPendingExternalHref(null)}
              >
                Stay here
              </button>
              <button
                type="button"
                className="errl-external-modal__btn errl-external-modal__btn--confirm"
                onClick={() => {
                  const href = pendingExternalHref;
                  setPendingExternalHref(null);
                  if (href) window.location.assign(href);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}


