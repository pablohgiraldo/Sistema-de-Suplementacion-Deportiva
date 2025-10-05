export default {
    // Configuración para pruebas de integración
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/tests/**/*.integration.test.js'
    ],
    collectCoverageFrom: [
        'src/**/*.js',
        '!src/server.js', // Excluir archivo principal del servidor
        '!src/config/**', // Excluir configuración
        '!**/node_modules/**'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    // Timeout para pruebas de integración
    testTimeout: 30000,
    // Configuración para ES modules con Babel
    transform: {
        '^.+\\.js$': 'babel-jest'
    },
    // Configuración para módulos
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1'
    }
};