import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-router': ['react-router-dom'],
        },
      },
    },
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
