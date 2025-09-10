import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Importar scripts de prueba en desarrollo
if (import.meta.env.DEV) {
  import('./test-auth.js');
  import('./test-jwt-storage.js');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
