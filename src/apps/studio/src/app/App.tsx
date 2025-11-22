import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';

export default function App() {
  // Studio is served at /studio.html, but we want routes to work at /studio/*
  // The vite rewrite plugin handles /studio -> /studio.html
  // So we use /studio as basename for client-side routing
  return (
    <BrowserRouter basename="/studio">
      <AppRouter />
    </BrowserRouter>
  );
}
