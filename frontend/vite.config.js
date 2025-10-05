import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    rollupOptions: {
      external: (id) => {
        // Excluir archivos de pruebas y Playwright
        if (id.includes('e2e/') || id.includes('test/') || id.includes('@playwright')) {
          return true;
        }
        return false;
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['axios', 'recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  // Excluir archivos de pruebas del procesamiento
  exclude: ['**/e2e/**', '**/test/**', '**/*.test.*', '**/*.spec.*']
})
