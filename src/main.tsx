import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './presentation/components/ErrorBoundary';
import { DIProvider } from './presentation/context/DIContext';

import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <DIProvider>
        <App />
      </DIProvider>
    </ErrorBoundary>
  </StrictMode>,
);
