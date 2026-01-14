import { Link } from 'react-router-dom';
import { useMemo, useRef } from 'react';
import { useLegacyAssetBridge } from '../hooks/useLegacyAssetBridge';
import { resolvePortalPageUrl } from '../utils/portalPaths';
import StudioShell from '../../../features/live-studio/studio/app/layout/StudioShell';

export default function StudioPinDesigner() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  useLegacyAssetBridge(iframeRef);
  const legacyUrl = useMemo(() => {
    return resolvePortalPageUrl('pages/pin-designer/index.html');
  }, []);
  const breadcrumbs = [
    { label: 'Errl Hub', to: '/' },
    { label: 'Pin Designer' },
  ];

  return (
    <StudioShell
      title="Pin Designer"
      subtitle="Mock up enamel pins, glow finishes, and sticker packs while we migrate the legacy editor into the shared Studio runtime."
      breadcrumbs={breadcrumbs}
      status={<span className="inline-flex items-center rounded-full border border-amber-400/40 bg-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-200">Legacy Surface</span>}
      actions={
        <Link
          to="/"
          className="inline-flex h-9 items-center justify-center rounded-md border border-white/20 px-3 text-sm text-zinc-200 transition-colors hover:bg-white/10"
        >
          Back to Hub
        </Link>
      }
      className="space-y-6"
      navActiveKey="studio"
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-white/10 bg-[#090b1a]/90 shadow-2xl backdrop-blur">
          <iframe
            ref={iframeRef}
            title="Pin Designer"
            src={legacyUrl}
            className="w-full min-h-[78vh] bg-[#04060f] rounded-[inherit] border-0"
            allowFullScreen
          />
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-black/25 p-5 text-sm text-zinc-300">
          <h2 className="text-base font-semibold text-zinc-100">Workflow Notes</h2>
          <p>
            The legacy surface can now pull and save designs through the shared asset bridge. Start with the default Errl mold,
            recolor the regions, then export PNG/SVG or save to reopen in Code Lab.
          </p>
          <ul className="grid gap-1 text-xs text-zinc-400 md:grid-cols-2">
            <li>• Library panel → reload prior pins or duplicate variants.</li>
            <li>• Finish swatches update the plating stroke instantly.</li>
            <li>• JSON exports reopen directly in Live Studio.</li>
            <li>• Use Fit / Reset to re-center the working canvas.</li>
          </ul>
        </div>
      </div>
    </StudioShell>
  );
}
