import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import {
    createPayment,
    generatePaymentForm,
    getTransactionStatus,
    createRefund,
    handlePayUCallback,
    handlePayUResponse,
    getOrderPaymentStatus,
    getPayUConfig
} from '../controllers/paymentController.js';

const router = express.Router();

/**
 * Rutas públicas (sin autenticación)
 */

// Callback de PayU (POST desde servidor de PayU)
router.post('/payu-callback', express.urlencoded({ extended: true }), handlePayUCallback);

// Respuesta de PayU (GET - redirige al usuario después del pago)
router.get('/payu-response', handlePayUResponse);

// Obtener configuración de PayU (para el frontend)
router.get('/config', getPayUConfig);

/**
 * Rutas autenticadas (requieren login)
 */

// Crear transacción de pago
router.post('/create-transaction', authMiddleware, createPayment);

// Generar formulario de pago HTML
router.post('/generate-form', authMiddleware, generatePaymentForm);

// Obtener estado de pago de una orden
router.get('/order/:orderId/status', authMiddleware, getOrderPaymentStatus);

// Obtener estado de una transacción
router.get('/transaction/:transactionId', authMiddleware, getTransactionStatus);

/**
 * Rutas de administrador
 */

// Crear un reembolso
router.post('/create-refund', authMiddleware, requireAdmin, createRefund);

export default router;
