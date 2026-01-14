import { Navigate, Route, Routes } from 'react-router-dom';
import StudioPage from './pages/Studio';
import StudioProjects from './pages/StudioProjects';
import StudioComponentLibrary from './pages/StudioComponentLibrary';
import ErrlLiveStudio from '../../features/live-studio/studio/app/ErrlLiveStudio';

export default function AppRouter() {
  return (
    <Routes>
      {/* Primary Studio routes */}
      <Route path="/" element={<StudioPage />} />
      <Route path="code-lab" element={<ErrlLiveStudio />} />
      <Route path="projects" element={<StudioProjects />} />
      <Route path="component-library" element={<StudioComponentLibrary />} />

      {/* Backward-compat redirects: tools → studio */}
      <Route path="tools/*" element={<Navigate to="/" replace />} />
      <Route path="studio/*" element={<Navigate to="/" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
