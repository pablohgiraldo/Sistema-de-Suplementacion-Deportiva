import express from 'express';
const router = express.Router();

/**
 * Rutas de salud y monitoreo
 * SuperGains - Endpoints para pruebas de estrés
 */

// Endpoint de salud básica
router.get('/health', async (req, res) => {
    try {
        const healthData = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            cpu: {
                usage: process.cpuUsage()
            },
            environment: process.env.NODE_ENV || 'development',
            version: process.version,
            platform: process.platform,
            arch: process.arch
        };

        res.status(200).json({
            success: true,
            data: healthData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas de salud',
            details: error.message
        });
    }
});

// Endpoint de salud de la base de datos
router.get('/health/database', async (req, res) => {
    try {
        const mongoose = await import('mongoose');
        const db = mongoose.default.connection;

        const dbHealth = {
            status: db.readyState === 1 ? 'connected' : 'disconnected',
            readyState: db.readyState,
            host: db.host,
            port: db.port,
            name: db.name,
            collections: Object.keys(db.collections).length,
            timestamp: new Date().toISOString()
        };

        res.status(200).json({
            success: true,
            data: dbHealth
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas de base de datos',
            details: error.message
        });
    }
});

// Endpoint de métricas de rendimiento
router.get('/health/performance', async (req, res) => {
    try {
        const performanceData = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
                heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                external: Math.round(process.memoryUsage().external / 1024 / 1024)
            },
            cpu: process.cpuUsage(),
            loadAverage: process.platform !== 'win32' ? (await import('os')).default.loadavg() : [0, 0, 0],
            eventLoopLag: Date.now() - process.hrtime()[0] * 1000
        };

        res.status(200).json({
            success: true,
            data: performanceData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error obteniendo métricas de rendimiento',
            details: error.message
        });
    }
});

// Endpoint de estrés (para pruebas)
router.get('/health/stress', async (req, res) => {
    try {
        const startTime = Date.now();

        // Simular carga de trabajo
        const iterations = 1000000;
        let result = 0;
        for (let i = 0; i < iterations; i++) {
            result += Math.sqrt(i);
        }

        const endTime = Date.now();
        const processingTime = endTime - startTime;

        res.status(200).json({
            success: true,
            data: {
                timestamp: new Date().toISOString(),
                processingTime: `${processingTime}ms`,
                iterations: iterations,
                result: result,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error en endpoint de estrés',
            details: error.message
        });
    }
});

export default router;
