import { createRoot } from 'react-dom/client';
import App from './src/app/App';
import '../../shared/styles/tailwind.css';
import '@errl-design-system/styles/errlDesignSystem.css';
import { ThemeProvider } from '@errl-design-system';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);
