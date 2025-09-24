import express from 'express';
import simpleAlertScheduler from '../services/simpleAlertScheduler.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de administrador
router.use(authMiddleware, requireAdmin);

// GET /api/scheduler/status - Obtener estado del scheduler
router.get('/status', (req, res) => {
    try {
        const status = simpleAlertScheduler.getStatus();
        res.json({
            success: true,
            data: status,
            message: 'Estado del scheduler obtenido exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener estado del scheduler'
        });
    }
});

// POST /api/scheduler/start - Iniciar scheduler
router.post('/start', (req, res) => {
    try {
        simpleAlertScheduler.start();
        res.json({
            success: true,
            message: 'Scheduler iniciado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al iniciar scheduler'
        });
    }
});

// POST /api/scheduler/stop - Detener scheduler
router.post('/stop', (req, res) => {
    try {
        simpleAlertScheduler.stop();
        res.json({
            success: true,
            message: 'Scheduler detenido exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al detener scheduler'
        });
    }
});

// POST /api/scheduler/check - Ejecutar verificación manual
router.post('/check', async (req, res) => {
    try {
        await simpleAlertScheduler.runManualCheck();
        res.json({
            success: true,
            message: 'Verificación manual ejecutada exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al ejecutar verificación manual'
        });
    }
});

export default router;
