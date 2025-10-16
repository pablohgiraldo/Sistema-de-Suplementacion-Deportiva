import express from 'express';
import {
    getOmnichannelDashboard,
    getRealTimeMetrics,
    getExecutiveSummary
} from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';
import { adminRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// ==================== RUTAS DASHBOARD OMNICANAL ====================

// Dashboard principal omnicanal (solo administradores)
router.get('/omnichannel',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    adminRateLimit,
    getOmnichannelDashboard
);

// Métricas en tiempo real (solo administradores)
router.get('/realtime',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    adminRateLimit,
    getRealTimeMetrics
);

// Resumen ejecutivo (solo administradores)
router.get('/executive-summary',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    adminRateLimit,
    getExecutiveSummary
);

export default router;
