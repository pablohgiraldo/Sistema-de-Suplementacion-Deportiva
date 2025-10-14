import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import {
    validateIncomingWebhookSignature,
    validateWebhookCreation,
    validateWebhookUpdate
} from '../middleware/webhookValidation.js';
import {
    createWebhook,
    getWebhooks,
    getWebhookById,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    receiveWebhookEvent,
    getWebhookStats
} from '../controllers/webhookController.js';

const router = express.Router();

/**
 * Rutas públicas (sin autenticación)
 */

// Recibir evento de webhook externo
// POST /api/webhooks/receive/:event
// Validar firma HMAC-SHA256
router.post(
    '/receive/:event',
    express.json(),
    validateIncomingWebhookSignature,
    receiveWebhookEvent
);

/**
 * Rutas autenticadas (requieren login)
 */

// Crear webhook
// POST /api/webhooks
// Validar datos de creación
router.post(
    '/',
    authMiddleware,
    requireAdmin,
    validateWebhookCreation,
    createWebhook
);

// Obtener todos los webhooks
// GET /api/webhooks
router.get('/', authMiddleware, requireAdmin, getWebhooks);

// Obtener estadísticas
// GET /api/webhooks/stats
router.get('/stats', authMiddleware, requireAdmin, getWebhookStats);

// Obtener webhook por ID
// GET /api/webhooks/:id
router.get('/:id', authMiddleware, requireAdmin, getWebhookById);

// Actualizar webhook
// PUT /api/webhooks/:id
// Validar datos de actualización
router.put(
    '/:id',
    authMiddleware,
    requireAdmin,
    validateWebhookUpdate,
    updateWebhook
);

// Eliminar webhook
// DELETE /api/webhooks/:id
router.delete('/:id', authMiddleware, requireAdmin, deleteWebhook);

// Probar webhook
// POST /api/webhooks/:id/test
router.post('/:id/test', authMiddleware, requireAdmin, testWebhook);

export default router;

