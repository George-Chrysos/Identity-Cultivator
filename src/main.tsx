import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// Add dark class to html element for dark mode
document.documentElement.classList.add('dark');

// Expose cleanup utility for manual database fixes (dev/debug only)
if (import.meta.env.DEV) {
  import('./utils/cleanupDatabase').then(({ cleanupDatabase }) => {
    (window as any).cleanupDatabase = cleanupDatabase;
    console.log('🔧 Debug utility loaded: Run cleanupDatabase() to fix database issues');
  });
  
  import('./utils/clearLocalStorageCache').then(({ clearLocalStorageCache }) => {
    (window as any).clearLocalStorageCache = clearLocalStorageCache;
    console.log('🗑️  Cache utility loaded: Run clearLocalStorageCache() to clear cached data');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
