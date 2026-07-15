import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Global error tracking listeners
window.addEventListener('error', (event) => {
  console.error('Global unhandled clinical exception:', event.error);
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.warn('Uncaught asynchronous rejection:', event.reason);
  event.preventDefault();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

