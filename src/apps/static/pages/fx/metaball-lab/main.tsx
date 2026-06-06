import { createRoot } from 'react-dom/client';
import MetaballNavCanvas from '../../../../landing/scene/effects/MetaballNavCanvas';
import { mountSceneControlsGlobal } from '../../../../landing/scene/bridge/sceneControls';

mountSceneControlsGlobal();

const mount = document.getElementById('metaball-lab-root');
if (mount) {
  createRoot(mount).render(
    <MetaballNavCanvas showPost className="metaball-lab-canvas" />,
  );
}
