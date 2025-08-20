import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { PluginOption } from "vite";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [react()];
  
  if (mode === 'development') {
    try {
      const { componentTagger } = await import("lovable-tagger");
      plugins.push(componentTagger());
    } catch (e) {
      // lovable-tagger is optional for development
      console.warn("Could not load lovable-tagger:", e);
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            vendor: ['react', 'react-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-router': ['react-router-dom'],
            'vendor-forms': ['react-hook-form', '@hookform/resolvers'],
            'vendor-supabase': ['@supabase/supabase-js'],
          },
        },
      },
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: true,
      chunkSizeWarningLimit: 1000,
      reportCompressedSize: false, // Faster builds
      sourcemap: false, // Smaller files for production
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@tanstack/react-query'],
      force: true,
    },
    esbuild: {
      target: 'es2020',
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
