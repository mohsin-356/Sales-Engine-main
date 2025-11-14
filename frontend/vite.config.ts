import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2018',
    sourcemap: false,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // Group by top-level package for better splitting
            const parts = id.split('node_modules/')[1].split('/');
            const pkg = parts[0].startsWith('@') ? parts.slice(0,2).join('/') : parts[0];
            return `vendor-${pkg.replace(/[@/]/g, '_')}`;
          }
        },
      },
    },
  },
}));
