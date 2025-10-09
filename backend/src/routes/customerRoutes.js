/**
 * Rutas de Customer para CRM
 * 
 * Define todos los endpoints para la gestión de clientes,
 * segmentación y análisis del CRM.
 */

import express from 'express';
import {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerMetrics,
    addCustomerInteraction,
    getSegmentStats,
    getHighValueCustomers,
    getChurnRiskCustomers,
    getCRMDashboard,
    updateLoyaltyPoints,
    getCustomerByUserId,
    getCustomerPurchaseHistory,
    syncCustomersWithOrders,
    getCustomersBySegment,
    resegmentAllCustomers,
    getSegmentationAnalysis
} from '../controllers/customerController.js';

// Middleware de autenticación y autorización
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

// Middleware de validación
import {
    validateCreateCustomer,
    validateUpdateCustomer,
    validateAddInteraction,
    validateUpdateLoyaltyPoints,
    handleValidationErrors
} from '../validators/customerValidators.js';

// Middleware de rate limiting
import { adminRateLimit } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// ==================== RUTAS DE ESTADÍSTICAS Y DASHBOARD ====================
// Deben ir antes de las rutas con parámetros para evitar conflictos

// Dashboard general del CRM
router.get(
    '/dashboard',
    requireAdmin,
    adminRateLimit,
    getCRMDashboard
);

// Estadísticas de segmentos
router.get(
    '/stats/segments',
    requireAdmin,
    adminRateLimit,
    getSegmentStats
);

// Clientes de alto valor
router.get(
    '/high-value',
    requireAdmin,
    adminRateLimit,
    getHighValueCustomers
);

// Clientes en riesgo de abandono
router.get(
    '/churn-risk',
    requireAdmin,
    adminRateLimit,
    getChurnRiskCustomers
);

// ==================== RUTAS DE SEGMENTACIÓN ====================

// Análisis de segmentación completo
router.get(
    '/segmentation/analysis',
    requireAdmin,
    adminRateLimit,
    getSegmentationAnalysis
);

// Obtener customers de un segmento específico
router.get(
    '/segment/:segment',
    requireAdmin,
    adminRateLimit,
    getCustomersBySegment
);

// ==================== RUTAS CRUD ====================

// Obtener todos los customers (con filtros y paginación)
router.get(
    '/',
    requireAdmin,
    adminRateLimit,
    getCustomers
);

// Crear nuevo customer manualmente
router.post(
    '/',
    requireAdmin,
    adminRateLimit,
    validateCreateCustomer,
    handleValidationErrors,
    createCustomer
);

// ==================== RUTAS POR USER ID ====================

// Obtener customer por userId (puede ser usado por el propio usuario)
router.get(
    '/user/:userId',
    getCustomerByUserId
);

// ==================== RUTAS POR ID ====================

// Obtener customer por ID
router.get(
    '/:id',
    requireAdmin,
    adminRateLimit,
    getCustomerById
);

// Actualizar customer
router.put(
    '/:id',
    requireAdmin,
    adminRateLimit,
    validateUpdateCustomer,
    handleValidationErrors,
    updateCustomer
);

// Eliminar customer
router.delete(
    '/:id',
    requireAdmin,
    adminRateLimit,
    deleteCustomer
);

// ==================== RUTAS DE ACCIONES ESPECÍFICAS ====================

// Actualizar métricas de un customer
router.put(
    '/:id/update-metrics',
    requireAdmin,
    adminRateLimit,
    updateCustomerMetrics
);

// Agregar interacción al historial
router.post(
    '/:id/interactions',
    requireAdmin,
    adminRateLimit,
    validateAddInteraction,
    handleValidationErrors,
    addCustomerInteraction
);

// Actualizar puntos de fidelidad
router.put(
    '/:id/loyalty-points',
    requireAdmin,
    adminRateLimit,
    validateUpdateLoyaltyPoints,
    handleValidationErrors,
    updateLoyaltyPoints
);

// Obtener historial de compras completo de un customer
router.get(
    '/:id/purchase-history',
    requireAdmin,
    adminRateLimit,
    getCustomerPurchaseHistory
);

// ==================== RUTAS DE SINCRONIZACIÓN ====================

// Sincronizar todos los customers con sus órdenes
router.post(
    '/sync-orders',
    requireAdmin,
    adminRateLimit,
    syncCustomersWithOrders
);

// Re-segmentar todos los customers
router.post(
    '/resegment',
    requireAdmin,
    adminRateLimit,
    resegmentAllCustomers
);

export default router;

