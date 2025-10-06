import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.js'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules/',
                'src/test/',
                'src/**/*.test.{js,jsx}',
                'src/**/*.spec.{js,jsx}',
                'src/**/__tests__/**',
                'src/**/test-utils/**',
                'src/main.jsx',
                'src/vite-env.d.ts',
                'coverage/**',
                'dist/**',
                'cypress/**',
                '**/*.config.js',
                '**/*.config.ts'
            ],
            include: [
                'src/**/*.{js,jsx}'
            ],
            thresholds: {
                global: {
                    branches: 50,
                    functions: 50,
                    lines: 50,
                    statements: 50
                }
            }
        },
        exclude: [
            'node_modules',
            'dist',
            '.git',
            '.cache',
            'coverage',
            'cypress'
        ]
    },
    resolve: {
        alias: {
            '@': '/src'
        }
    },
    optimizeDeps: {
        include: ['react', 'react-dom']
    }
})