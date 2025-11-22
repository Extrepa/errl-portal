import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLegacyAssetBridge } from '../hooks/useLegacyAssetBridge';
import { resolvePortalPageUrl } from '../utils/portalPaths';
import PortalHeader from '../components/PortalHeader';
import './studio-detail.css';

const LEGACY_MATH_LAB_URL = resolvePortalPageUrl('pages/studio/math-lab/index.html');

export default function StudioMathLab() {
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
            <h1 className="studio-detail__title">Psychedelic Math Lab</h1>
            <p className="studio-detail__subtitle">
              This is the classic Math Lab experience, hosted inside the new Studio shell. We’re migrating its shader library and
              asset hooks into the shared runtime so you can sling creations directly into the Code Lab.
            </p>
            <div className="studio-detail__note studio-detail__note--legacy">
              Legacy mode: expect the original UI. Asset calls now proxy through the React hub so files can flow between Math Lab
              and Code Lab while we rebuild the front-end.
            </div>
          </header>

          <div className="studio-detail__frame">
            <iframe
              ref={iframeRef}
              title="Psychedelic Math Lab"
              src={LEGACY_MATH_LAB_URL}
              className="studio-detail__iframe"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </>
  );
}
