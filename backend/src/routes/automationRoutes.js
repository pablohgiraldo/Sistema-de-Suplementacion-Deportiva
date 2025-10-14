import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import {
    runAutomations,
    processOverdue,
    cancelExpired,
    getAutomationStats
} from '../controllers/automationController.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol de admin

// Ejecutar todas las automatizaciones
// POST /api/automations/run
router.post('/run', authMiddleware, requireAdmin, runAutomations);

// Procesar órdenes vencidas
// POST /api/automations/process-overdue
router.post('/process-overdue', authMiddleware, requireAdmin, processOverdue);

// Cancelar órdenes expiradas
// POST /api/automations/cancel-expired
router.post('/cancel-expired', authMiddleware, requireAdmin, cancelExpired);

// Obtener estadísticas
// GET /api/automations/stats
router.get('/stats', authMiddleware, requireAdmin, getAutomationStats);

export default router;

