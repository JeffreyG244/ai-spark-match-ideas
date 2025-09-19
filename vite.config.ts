import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // componentTagger will be automatically injected by Lovable runtime when needed
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - always needed
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-core';
          }
          // Router - only load when routing is needed
          if (id.includes('react-router')) {
            return 'router';
          }
          // UI components - split by usage
          if (id.includes('@radix-ui')) {
            return 'ui-components';
          }
          // Query client - only when data fetching is needed
          if (id.includes('@tanstack/react-query')) {
            return 'query-client';
          }
          // Forms - only when forms are used
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          // Supabase auth - separate from main supabase
          if (id.includes('@supabase/supabase-js') && id.includes('auth')) {
            return 'supabase-auth';
          }
          // Supabase core - only load when database is accessed
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase-core';
          }
          // Security and monitoring - defer loading
          if (id.includes('security') || id.includes('monitoring') || id.includes('audit')) {
            return 'security-vendor';
          }
          // Utilities
          if (id.includes('lodash') || id.includes('date-fns') || id.includes('uuid')) {
            return 'utils';
          }
        },
        // Optimize asset filenames for long-term caching
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/img/[name].[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name].[hash][extname]`;
          }
          return `assets/[name].[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
      },
    },
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false, // Faster builds
    sourcemap: false, // Smaller files for production
    cssCodeSplit: true, // Enable CSS code splitting for better loading
    modulePreload: {
      polyfill: false // Disable polyfill for faster loading on modern browsers
    },
  },
    optimizeDeps: {
      include: ['react', 'react-dom', '@tanstack/react-query'],
      force: true,
    },
    esbuild: {
      target: 'es2020',
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
}));