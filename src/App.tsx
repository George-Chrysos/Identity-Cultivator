import { Suspense, lazy, Component, ReactNode } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from './components/notifications/Toast';

// Lazy load pages to reduce initial bundle size
const Homepage = lazy(() => import('./pages/Homepage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const InventoryPage = lazy(() => import('./pages/InventoryPage'));
const PathTreePage = lazy(() => import('./pages/PathTreePage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-dark-bg flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white text-lg">Loading...</p>
    </div>
  </div>
);

// Global Error Boundary for the entire app
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-300 mb-2">Something went wrong</h1>
            <p className="text-slate-400 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl text-white font-semibold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/path-tree" element={<PathTreePage />} />
        </Routes>
      </Suspense>
      <ToastContainer />
    </AppErrorBoundary>
  );
}

export default App;
