import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      // Permitir servir archivos desde directorios específicos
      allow: ['..', '../backend'],
      // Establecer límites estrictos para evitar conflictos
      strict: false
    },
    // Configuración para evitar conflictos con archivos estáticos
    middlewareMode: false,
    // Configuración de archivos estáticos
    static: {
      // Evitar servir archivos duplicados
      dotfiles: 'ignore'
    }
  },
  // Configuración para evitar conflictos con archivos públicos
  publicDir: 'public',
  // Configuración de resolución de archivos
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  // Configuración de build para evitar conflictos
  build: {
    // Evitar conflictos con archivos de distribución
    outDir: 'dist',
    // Configuración de assets
    assetsDir: 'assets'
  }
})
