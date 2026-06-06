import { createRoot } from 'react-dom/client';
import { mountSceneControlsGlobal } from '../../../../landing/scene/bridge/sceneControls';

mountSceneControlsGlobal();

const mount = document.getElementById('metaball-lab-root');
if (mount) {
  void import('../../../../landing/scene/effects/MetaballNavCanvas').then(({ default: MetaballNavCanvas }) => {
    createRoot(mount).render(
      <MetaballNavCanvas showPost className="metaball-lab-canvas" />,
    );
  });
}
