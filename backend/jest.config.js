export default {
    // Configuración para ES modules
    testEnvironment: 'node',

    // Extensión de archivos de test
    testMatch: [
        '**/tests/**/*.simple.test.js',
        '**/tests/**/*.test.js'
    ],

    // Directorios a ignorar
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/coverage/'
    ],

    // Configuración para ES modules con Babel
    transform: {
        '^.+\\.js$': 'babel-jest'
    },

    // Configuración de cobertura
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js',
        '!src/config/db.js',
        '!**/node_modules/**'
    ],

    // Umbrales de cobertura
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 60,
            lines: 60,
            statements: 60
        }
    },

    // Setup para tests
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

    // Timeout para tests
    testTimeout: 15000,

    // Configuración de verbose
    verbose: true,

    // Configuración de clearMocks
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
