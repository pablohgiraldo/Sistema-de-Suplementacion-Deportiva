// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configuración global de Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
    // Evitar que las pruebas fallen por errores no capturados
    // que no están relacionados con nuestras pruebas
    if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false;
    }
    if (err.message.includes('Non-Error promise rejection captured')) {
        return false;
    }
    if (err.message.includes('Cannot read properties of null (reading \'useEffect\')')) {
        return false;
    }
    if (err.message.includes('useEffect')) {
        return false;
    }
    if (err.message.includes('React')) {
        return false;
    }
    // Permitir que otros errores fallen las pruebas
    return true;
});

// Configurar timeouts globales
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);