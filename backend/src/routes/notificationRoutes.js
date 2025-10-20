import express from 'express';
import {
    verifyEmailConfiguration,
    sendTestNotification,
    processAllAlerts,
    getNotificationStatus,
    sendSpecificAlert,
    sendAlertsSummary,
    notifyChatStarted
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Ruta pública para notificaciones de chat (sin autenticación)
router.post('/chat-started', notifyChatStarted);

// Todas las rutas siguientes requieren autenticación y rol de administrador
router.use(authMiddleware, requireAdmin);

// Verificar configuración de email
router.get('/verify', verifyEmailConfiguration);

// Obtener estado del servicio de notificaciones
router.get('/status', getNotificationStatus);

// Enviar email de prueba
router.post('/test', sendTestNotification);

// Procesar todas las alertas y enviar notificaciones
router.post('/process-alerts', processAllAlerts);

// Enviar alerta específica
router.post('/send-alert', sendSpecificAlert);

// Enviar resumen de alertas
router.post('/send-summary', sendAlertsSummary);

export default router;
