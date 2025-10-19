import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@', replacement: '/src' }
      ],
    },
    // Explicitly define environment variables for client-side access
    // This is required for Vercel to inject env vars at build time
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
      ),
    },
    build: {
      // Increase chunk size warning limit to 1000kb (from default 500kb)
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // Separate vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'animation-vendor': ['framer-motion'],
            'supabase-vendor': ['@supabase/supabase-js'],
            'ui-vendor': ['lucide-react'],
            // If recharts is used heavily, separate it
            // 'charts-vendor': ['recharts'],
            
            // Separate store logic
            'store': [
              './src/store/cultivatorStore.ts',
              './src/store/authStore.ts',
              './src/store/toastStore.ts',
            ],
            
            // Separate API/services
            'services': [
              './src/api/cultivatorDatabase.ts',
              './src/api/supabaseService.ts',
              './src/services/storageService.ts',
            ],
          },
        },
      },
      // Enable minification
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.logs in production
          drop_debugger: true,
        },
      },
    },
  }
})
