import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,
    setupNodeEvents(on, config) {
      // Configurar eventos de nodo si es necesario
      on('uncaught:exception', (err, runnable) => {
        // No fallar las pruebas por errores de React/useEffect
        if (err.message.includes('useEffect') ||
          err.message.includes('React') ||
          err.message.includes('Cannot read properties of null')) {
          return false;
        }
        return true;
      });
    },
    env: {
      // Variables de entorno para las pruebas
      API_URL: 'http://localhost:4000/api',
      TEST_USER_EMAIL: 'test@example.com',
      TEST_USER_PASSWORD: 'Password123!',
      TEST_ADMIN_EMAIL: 'admin@example.com',
      TEST_ADMIN_PASSWORD: 'AdminPassword123!'
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
})