/**
 * Rutas de Loyalty (Lealtad)
 * 
 * Define todos los endpoints para el sistema de puntos de lealtad
 */

import express from 'express';
import {
    getMyLoyaltyPoints,
    redeemLoyaltyPoints,
    calculateDiscount,
    getLoyaltyTransactions,
    cancelRedeem
} from '../controllers/loyaltyController.js';

// Middleware de autenticación
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// ==================== RUTAS DE PUNTOS DE LEALTAD ====================

// Obtener resumen de puntos del usuario actual
router.get('/me', getMyLoyaltyPoints);

// Obtener historial de transacciones
router.get('/transactions', getLoyaltyTransactions);

// Calcular descuento potencial (preview sin canjear)
router.post('/calculate-discount', calculateDiscount);

// Canjear puntos por descuento
router.post('/redeem', redeemLoyaltyPoints);

// Cancelar canje de puntos (reversar)
router.post('/cancel-redeem', cancelRedeem);

export default router;

