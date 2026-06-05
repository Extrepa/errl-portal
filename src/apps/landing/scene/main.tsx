import { createRoot } from 'react-dom/client';
import { mountSceneControlsGlobal } from './bridge/sceneControls';
import App from './App';

mountSceneControlsGlobal();

const mount = document.getElementById('errl-scene-root');
if (mount) {
  createRoot(mount).render(<App />);
}
