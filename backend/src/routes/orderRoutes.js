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
    validateCreateOrder,
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

// Endpoint de prueba ultra básico (DEBE ir antes de /:id)
router.get('/test-basic', (req, res) => {
    console.log('🔥 Endpoint ultra básico llamado');
    res.json({
        success: true,
        data: {
            summary: {
                totalOrders: 15,
                totalRevenue: 2500000,
                averageOrderValue: 166667
            },
            statusBreakdown: {
                orders: {
                    pending: 3,
                    processing: 5,
                    shipped: 4,
                    delivered: 2,
                    cancelled: 1
                },
                payments: {
                    pending: 2,
                    paid: 10,
                    failed: 1,
                    refunded: 2
                }
            },
            recentOrders: [
                {
                    orderNumber: 'ORD-001',
                    customer: 'Juan Pérez',
                    total: 150000,
                    status: 'delivered',
                    paymentStatus: 'paid',
                    createdAt: new Date(),
                    itemCount: 2
                }
            ]
        }
    });
});

// Endpoint de prueba temporal (sin middlewares)
router.get('/summary-test',
    (req, res) => {
        console.log('🧪 Endpoint de prueba llamado');
        console.log('📝 Query params:', req.query);
        console.log('👤 Usuario:', req.user);

        res.json({
            success: true,
            message: 'Endpoint de prueba funcionando',
            data: {
                query: req.query,
                user: req.user
            }
        });
    }
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

// Resumen básico de ventas (solo admin)
router.get('/summary',
    authMiddleware,
    tokenExpirationMiddleware,
    tokenRefreshSuggestionMiddleware,
    requireAdmin,
    validateGetOrdersSummary,
    getOrdersSummary
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
