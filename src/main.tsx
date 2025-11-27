import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import LoadingSpinner from './components/LoadingSpinner.tsx';
import { reportWebVitals } from './utils/webVitals.ts';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);

// Report web vitals for performance monitoring
reportWebVitals();
