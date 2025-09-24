import express from 'express';
import {
    getAllAlertConfigs,
    getAlertConfigByProduct,
    createAlertConfig,
    updateAlertConfig,
    deleteAlertConfig,
    getLowStockAlerts,
    createDefaultAlertConfig,
    getAlertStats
} from '../controllers/alertController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas públicas para administradores
router.get('/stats', requireAdmin, getAlertStats);
router.get('/low-stock', requireAdmin, getLowStockAlerts);
router.get('/', requireAdmin, getAllAlertConfigs);

// Rutas específicas por producto
router.get('/product/:productId', requireAdmin, getAlertConfigByProduct);
router.post('/product/:productId', requireAdmin, createAlertConfig);
router.put('/product/:productId', requireAdmin, updateAlertConfig);
router.delete('/product/:productId', requireAdmin, deleteAlertConfig);

// Ruta para crear configuración por defecto
router.post('/product/:productId/default', requireAdmin, createDefaultAlertConfig);

export default router;
