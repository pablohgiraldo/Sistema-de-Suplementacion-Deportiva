import express from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    updatePaymentStatus,
    getSalesStats,
    getSalesByPeriod,
    getTopSellingProducts,
    getOrdersSummary,
    cancelOrder
} from '../controllers/orderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';
import { orderCreateRateLimit, adminRateLimit } from '../middleware/rateLimitMiddleware.js';
import {
    validateOrderBusinessRules,
    validateColombianAddress,
    validateUserLimits
} from '../middleware/orderBusinessValidation.js';
import {
    validateCreateOrder,
    validateGetOrders,
    validateGetOrderById,
    validateUpdateOrderStatus,
    validateUpdatePaymentStatus,
    validateGetSalesStats,
    validateGetSalesByPeriod,
    validateGetTopSellingProducts,
    validateGetOrdersSummary,
    validateCancelOrder
} from '../validators/orderValidators.js';

const router = express.Router();

// Rutas protegidas (requieren autenticación)
// Crear orden desde carrito
router.post('/',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    orderCreateRateLimit,
    validateUserLimits,
    validateCreateOrder,
    validateColombianAddress,
    validateOrderBusinessRules,
    createOrder
);

// Obtener órdenes (usuario ve sus órdenes, admin ve todas)
router.get('/',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    validateGetOrders,
    getOrders
);

// Resumen básico de ventas (solo admin) - DEBE ir antes de /:id
router.get('/summary',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    validateGetOrdersSummary,
    getOrdersSummary
);

// Obtener orden específica
router.get('/:id',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    validateGetOrderById,
    getOrderById
);

// Cancelar orden
router.patch('/:id/cancel',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    validateCancelOrder,
    cancelOrder
);

// Rutas solo para administradores
// Actualizar estado de orden
router.patch('/:id/status',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    validateUpdateOrderStatus,
    updateOrderStatus
);

// Actualizar estado de pago
router.patch('/:id/payment',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    validateUpdatePaymentStatus,
    updatePaymentStatus
);



// Reportes de ventas (solo admin)
router.get('/reports/stats',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    validateGetSalesStats,
    getSalesStats
);

router.get('/reports/sales-by-period',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    validateGetSalesByPeriod,
    getSalesByPeriod
);

router.get('/reports/top-products',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    validateGetTopSellingProducts,
    getTopSellingProducts
);

export default router;
