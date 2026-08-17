import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const isProd = mode === 'production';

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      hmr:
        process.env.DISABLE_HMR !== 'true'
          ? {
              protocol: 'ws',
              host: 'localhost',
            }
          : false,
    },
    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssMinify: true,
      sourcemap: false,
      modulePreload: {
        polyfill: false,
        resolveDependencies: (_filename, deps) =>
          deps.filter(
            (dep) =>
              !dep.includes('vendor-export') &&
              !dep.includes('vendor-firebase') &&
              !dep.includes('vendor-charts') &&
              !dep.includes('vendor-maps') &&
              !dep.includes('AdminDashboard')
          ),
      },
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;

            // Ne pas mélanger le helper Vite avec jspdf/xlsx (sinon ~850 kB au boot).
            if (id.includes('vite') && id.includes('preload')) return;
            if (id.includes('firebase')) return 'vendor-firebase';
            if (id.includes('recharts') || id.includes('highcharts')) return 'vendor-charts';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
            // jspdf/xlsx/html2canvas : pas de manualChunk — chargés uniquement via import() dynamique.
            if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('@google/genai')) return 'vendor-ai';
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/react/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('zustand') || id.includes('sonner') || id.includes('dompurify')) {
              return 'vendor-ui';
            }
          },
        },
      },
    },
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
  };
});
