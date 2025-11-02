import { Navigate, Route, Routes } from 'react-router-dom';
import StudioPage from '@/pages/Studio';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/" element={<StudioPage />} />
      <Route path="*" element={<Navigate to="/studio" replace />} />
    </Routes>
  );
}
