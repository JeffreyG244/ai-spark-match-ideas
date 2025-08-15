import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize bundle splitting for better performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Supabase into its own chunk to improve caching
          supabase: ['@supabase/supabase-js'],
          // Split React into vendor chunk
          vendor: ['react', 'react-dom']
        }
      }
    },
    // Enable compression and minification
    minify: 'terser',
    target: 'es2015', // Better browser compatibility
    sourcemap: false // Disable sourcemaps for smaller build
  }
})
