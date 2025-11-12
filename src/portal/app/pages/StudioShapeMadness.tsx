import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLegacyAssetBridge } from '../hooks/useLegacyAssetBridge';
import { resolvePortalPageUrl } from '../utils/portalPaths';
import PortalHeader from '../components/PortalHeader';
import './studio-detail.css';

const LEGACY_SHAPE_MADNESS_URL = resolvePortalPageUrl('pages/studio/shape-madness/index.html');

export default function StudioShapeMadness() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  useLegacyAssetBridge(iframeRef);

  return (
    <>
      <PortalHeader activeKey="studio" />
      <div className="studio-detail">
        <div className="studio-detail__container">
          <Link to="/" className="studio-detail__back">
            <span aria-hidden>←</span>
            Back to Studio Hub
          </Link>

          <header className="studio-detail__header">
            <h1 className="studio-detail__title">Shape Madness</h1>
            <p className="studio-detail__subtitle">
              Browse 38+ generative shape experiments from the original collection. We’re gradually wiring them into the shared
              asset pipeline so presets and exports sync with the Code Lab.
            </p>
            <div className="studio-detail__note studio-detail__note--legacy">
              Legacy mode with a live bridge: asset lookups proxy through the React hub. Once the React rewrite lands, this view
              will render natively.
            </div>
          </header>

          <div className="studio-detail__frame">
            <iframe
              ref={iframeRef}
              title="Shape Madness"
              src={LEGACY_SHAPE_MADNESS_URL}
              className="studio-detail__iframe"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}
