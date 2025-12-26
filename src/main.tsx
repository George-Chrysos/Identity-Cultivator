import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { syncPathsToDatabase } from './services/pathSyncService'
import { logger } from './utils/logger'

// Add dark class to html element for dark mode
document.documentElement.classList.add('dark');

// Sync path data from temperingPath.ts constants to database
// This ensures DB has latest path configurations
syncPathsToDatabase().catch(err => {
  logger.warn('Path sync failed on startup, using client-side constants as fallback', { error: err });
});

// Global error handler for uncaught errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', { message, source, lineno, colno, error });
  // Show error in DOM if React hasn't rendered
  const root = document.getElementById('root');
  if (root && root.children.length === 0) {
    root.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0B0B1A; color: white; padding: 20px; font-family: system-ui;">
        <div style="text-align: center; max-width: 500px;">
          <h1 style="color: #ef4444; margin-bottom: 16px;">Application Error</h1>
          <p style="margin-bottom: 8px;">${message}</p>
          <p style="color: #9ca3af; font-size: 14px;">Please try refreshing the page or contact support.</p>
          <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #7c3aed; border: none; border-radius: 8px; color: white; cursor: pointer;">Reload Page</button>
        </div>
      </div>
    `;
  }
};

// Handle unhandled promise rejections
window.onunhandledrejection = (event) => {
  console.error('Unhandled promise rejection:', event.reason);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
