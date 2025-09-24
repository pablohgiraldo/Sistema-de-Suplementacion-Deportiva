import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Configuración avanzada de chunks para optimización
const chunkConfig = {
    // Separar vendor libraries
    vendor: {
        react: ['react', 'react-dom'],
        router: ['react-router-dom'],
        query: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
        utils: ['axios']
    },

    // Separar por funcionalidad
    features: {
        auth: [
            './src/contexts/AuthContext.jsx',
            './src/pages/Login.jsx',
            './src/pages/Register.jsx',
            './src/pages/Profile.jsx'
        ],
        cart: [
            './src/contexts/CartContext.jsx',
            './src/pages/Cart.jsx',
            './src/components/ShoppingCart.jsx'
        ],
        admin: [
            './src/pages/Admin.jsx',
            './src/components/AdminRoute.jsx',
            './src/components/AdminHeader.jsx',
            './src/components/InventoryTable.jsx',
            './src/components/InventoryStats.jsx',
            './src/components/StockAlerts.jsx'
        ],
        products: [
            './src/pages/ProductDetail.jsx',
            './src/components/ProductModal.jsx',
            './src/components/ProductCarousel.jsx',
            './src/components/productCard.jsx'
        ],
        common: [
            './src/components/Header.jsx',
            './src/components/Footer.jsx',
            './src/components/HeroBanner.jsx',
            './src/components/LoadingSpinner.jsx',
            './src/components/PageLoader.jsx'
        ]
    }
};

// Generar configuración de chunks dinámicamente
function generateChunkConfig() {
    const chunks = {};

    // Agregar vendor chunks
    Object.entries(chunkConfig.vendor).forEach(([name, modules]) => {
        chunks[name] = modules;
    });

    // Agregar feature chunks
    Object.entries(chunkConfig.features).forEach(([name, modules]) => {
        chunks[name] = modules;
    });

    return chunks;
}

export default defineConfig({
    plugins: [
        react(),
        // Bundle analyzer con configuración avanzada
        process.env.ANALYZE && visualizer({
            filename: 'dist/bundle-analysis.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
            template: 'treemap', // 'treemap', 'sunburst', 'network'
            title: 'SuperGains Bundle Analysis',
            projectRoot: process.cwd(),
            metadata: {
                buildTime: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0'
            }
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
        // Configuración optimizada de build
        target: 'es2015',
        minify: 'terser',
        sourcemap: false,

        rollupOptions: {
            output: {
                // Configuración manual de chunks
                manualChunks: generateChunkConfig(),

                // Configuración de nombres de archivos
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId;
                    if (facadeModuleId) {
                        if (facadeModuleId.includes('node_modules')) {
                            return 'vendor/[name]-[hash].js';
                        } else if (facadeModuleId.includes('src/pages')) {
                            return 'pages/[name]-[hash].js';
                        } else if (facadeModuleId.includes('src/components')) {
                            return 'components/[name]-[hash].js';
                        }
                    }
                    return 'chunks/[name]-[hash].js';
                },

                entryFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]'
            },

            // Configuración de externalización (si es necesario)
            external: [],

            // Configuración de treeshaking
            treeshake: {
                moduleSideEffects: false,
                propertyReadSideEffects: false,
                tryCatchDeoptimization: false
            }
        },

        // Configuración de chunk size warnings
        chunkSizeWarningLimit: 1000,

        // Configuración de CSS
        cssCodeSplit: true,

        // Configuración de assets
        assetsInlineLimit: 4096,

        // Configuración de reportCompressedSize
        reportCompressedSize: true
    },

    // Configuración de optimización de dependencias
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            '@tanstack/react-query',
            'axios'
        ],
        exclude: [
            '@tanstack/react-query-devtools'
        ]
    }
});
