import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from './components/Toast';

// Lazy load the main page to reduce initial bundle size
const CultivatorHomepage = lazy(() => import('./pages/CultivatorHomepage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-dark-bg flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<CultivatorHomepage />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </>
  );
}

export default App;
