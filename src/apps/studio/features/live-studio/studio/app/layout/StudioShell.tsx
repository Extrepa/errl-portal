import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import PortalHeader, { type PortalNavKey } from '@/apps/studio/src/app/components/PortalHeader';

type Breadcrumb = {
  label: string;
  to?: string;
};

type StudioShellProps = {
  title: string;
  subtitle?: string;
  breadcrumbs: Breadcrumb[];
  actions?: ReactNode;
  status?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  navActiveKey?: PortalNavKey;
};

export default function StudioShell({
  title,
  subtitle,
  breadcrumbs,
  actions,
  status,
  children,
  footer,
  className,
  navActiveKey,
}: StudioShellProps) {
  return (
    <div className="min-h-screen bg-[#040510] text-zinc-100">
      <PortalHeader activeKey={navActiveKey ?? 'studio'} />
      <header className="border-b border-white/10 bg-black/30/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-5">
          <nav className="flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-zinc-400">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const node = crumb.to ? (
                <Link key={`${crumb.label}-${idx}`} to={crumb.to} className="hover:text-zinc-200">
                  {crumb.label}
                </Link>
              ) : (
                <span key={`${crumb.label}-${idx}`}>{crumb.label}</span>
              );

              return (
                <div key={`${crumb.label}-${idx}`} className="flex items-center gap-1">
                  {node}
                  {!isLast ? <span className="text-zinc-600">/</span> : null}
                </div>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">{title}</h1>
              {subtitle ? <p className="mt-1 max-w-2xl text-sm text-zinc-400">{subtitle}</p> : null}
            </div>
            <div className="flex flex-col items-end gap-2 text-right sm:flex-row sm:items-center sm:gap-3">
              {status ? <div className="text-xs uppercase tracking-widest text-zinc-400">{status}</div> : null}
              {actions}
            </div>
          </div>
        </div>
      </header>

      <main className={['mx-auto w-full max-w-7xl px-6 py-6', className].filter(Boolean).join(' ')}>{children}</main>

      {footer ? (
        <footer className="border-t border-white/10 bg-black/20">
          <div className="mx-auto w-full max-w-7xl px-6 py-4">{footer}</div>
        </footer>
      ) : null}
    </div>
  );
}

