import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - solo en build
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ].filter(Boolean),
  server: {
    port: 5173,
    host: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    // Configuración de build para análisis
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['axios'],
          // Separar chunks por funcionalidad
          auth: ['./src/contexts/AuthContext.jsx'],
          cart: ['./src/contexts/CartContext.jsx'],
          admin: ['./src/pages/Admin.jsx'],
          products: ['./src/pages/ProductDetail.jsx'],
        }
      }
    },
    // Configuración de chunk size warnings
    chunkSizeWarningLimit: 1000,
  }
})
