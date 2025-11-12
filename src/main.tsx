import { createRoot } from 'react-dom/client';
import App from '@portal/app/App';
import './tailwind.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(<App />);
