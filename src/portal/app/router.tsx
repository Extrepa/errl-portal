import { Navigate, Route, Routes } from 'react-router-dom';
import StudioPage from './pages/Studio';
import StudioMathLab from './pages/StudioMathLab';
import StudioShapeMadness from './pages/StudioShapeMadness';
import StudioPinDesigner from './pages/StudioPinDesigner';
import StudioProjects from './pages/StudioProjects';
import ErrlLiveStudio from '@studio/app/ErrlLiveStudio';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<StudioPage />} />
      <Route path="code-lab" element={<ErrlLiveStudio />} />
      <Route path="math-lab" element={<StudioMathLab />} />
      <Route path="shape-madness" element={<StudioShapeMadness />} />
      <Route path="pin-designer" element={<StudioPinDesigner />} />
      <Route path="projects" element={<StudioProjects />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
