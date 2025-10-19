import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { clearLocalStorageCache } from './utils/clearLocalStorageCache'
import { cleanupDatabase } from './utils/cleanupDatabase'

// Add dark class to html element for dark mode
document.documentElement.classList.add('dark');

// Expose cleanup utilities for manual fixes (dev/debug only)
if (import.meta.env.DEV || true) { // Keep available in production for existing users with cache issues
  (window as any).clearLocalStorageCache = clearLocalStorageCache;
  (window as any).cleanupDatabase = cleanupDatabase;
  console.log('� Debug utilities loaded:');
  console.log('  - clearLocalStorageCache() → Clear cached identity data');
  console.log('  - cleanupDatabase() → Fix database issues');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
