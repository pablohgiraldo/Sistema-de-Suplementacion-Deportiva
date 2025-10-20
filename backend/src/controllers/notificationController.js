import notificationService from '../services/notificationService.js';
import { verifyEmailConfig, sendTestEmail } from '../config/email.js';

// @desc    Verificar configuración de email
// @route   GET /api/notifications/verify
// @access  Private/Admin
export const verifyEmailConfiguration = async (req, res) => {
    try {
        const result = await verifyEmailConfig();

        res.json({
            success: result.success,
            message: result.message,
            data: {
                emailConfigured: result.success,
                adminEmail: process.env.ADMIN_EMAIL || 'admin@supergains.com',
                notificationsEnabled: process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true'
            }
        });
    } catch (error) {
        console.error('Error verificando configuración de email:', error);
        res.status(500).json({
            success: false,
            message: 'Error verificando configuración de email',
            error: error.message
        });
    }
};

// @desc    Enviar email de prueba
// @route   POST /api/notifications/test
// @access  Private/Admin
export const sendTestNotification = async (req, res) => {
    try {
        const { email, subject } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email es requerido'
            });
        }

        const result = await sendTestEmail(email, subject);

        res.json({
            success: result.success,
            message: result.success ? 'Email de prueba enviado exitosamente' : 'Error enviando email de prueba',
            data: {
                messageId: result.messageId,
                email: email
            }
        });
    } catch (error) {
        console.error('Error enviando email de prueba:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando email de prueba',
            error: error.message
        });
    }
};

// @desc    Procesar todas las alertas y enviar notificaciones
// @route   POST /api/notifications/process-alerts
// @access  Private/Admin
export const processAllAlerts = async (req, res) => {
    try {
        const result = await notificationService.processAllAlerts();

        res.json({
            success: result.success,
            message: result.success ? 'Alertas procesadas exitosamente' : 'Error procesando alertas',
            data: {
                individualAlerts: result.individualAlerts || 0,
                summarySent: result.summarySent || false
            }
        });
    } catch (error) {
        console.error('Error procesando alertas:', error);
        res.status(500).json({
            success: false,
            message: 'Error procesando alertas',
            error: error.message
        });
    }
};

// @desc    Obtener estado del servicio de notificaciones
// @route   GET /api/notifications/status
// @access  Private/Admin
export const getNotificationStatus = async (req, res) => {
    try {
        const status = notificationService.getStatus();

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error obteniendo estado de notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estado de notificaciones',
            error: error.message
        });
    }
};

// @desc    Enviar notificación de alerta específica
// @route   POST /api/notifications/send-alert
// @access  Private/Admin
export const sendSpecificAlert = async (req, res) => {
    try {
        const { productId, inventoryId, alertConfigId } = req.body;

        if (!productId || !inventoryId || !alertConfigId) {
            return res.status(400).json({
                success: false,
                message: 'productId, inventoryId y alertConfigId son requeridos'
            });
        }

        // Agregar a la cola de notificaciones
        notificationService.addToQueue({
            type: 'stock_alert',
            data: {
                productId,
                inventoryId,
                alertConfigId
            }
        });

        res.json({
            success: true,
            message: 'Alerta agregada a la cola de notificaciones',
            data: {
                productId,
                inventoryId,
                alertConfigId,
                queueLength: notificationService.notificationQueue.length
            }
        });
    } catch (error) {
        console.error('Error enviando alerta específica:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando alerta específica',
            error: error.message
        });
    }
};

// @desc    Enviar resumen de alertas
// @route   POST /api/notifications/send-summary
// @access  Private/Admin
export const sendAlertsSummary = async (req, res) => {
    try {
        const { totalAlerts, criticalAlerts, errorAlerts, warningAlerts, alertsList } = req.body;

        if (totalAlerts === undefined || criticalAlerts === undefined || errorAlerts === undefined || warningAlerts === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Datos de resumen requeridos: totalAlerts, criticalAlerts, errorAlerts, warningAlerts'
            });
        }

        // Agregar a la cola de notificaciones
        notificationService.addToQueue({
            type: 'alerts_summary',
            data: {
                totalAlerts,
                criticalAlerts,
                errorAlerts,
                warningAlerts,
                alertsList: alertsList || []
            }
        });

        res.json({
            success: true,
            message: 'Resumen agregado a la cola de notificaciones',
            data: {
                totalAlerts,
                criticalAlerts,
                errorAlerts,
                warningAlerts,
                queueLength: notificationService.notificationQueue.length
            }
        });
    } catch (error) {
        console.error('Error enviando resumen de alertas:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando resumen de alertas',
            error: error.message
        });
    }
};

// @desc    Notificar a admin cuando se inicia un chat de soporte
// @route   POST /api/notifications/chat-started
// @access  Public (se puede llamar sin autenticación desde el widget)
export const notifyChatStarted = async (req, res) => {
    try {
        const { visitorName, visitorEmail, userId, userName, timestamp } = req.body;

        // Validar datos mínimos
        if (!visitorName) {
            return res.status(400).json({
                success: false,
                message: 'Nombre del visitante es requerido'
            });
        }

        // Preparar información del visitante
        const visitorInfo = {
            name: visitorName,
            email: visitorEmail || 'No proporcionado',
            userId: userId || 'Visitante anónimo',
            userName: userName || visitorName,
            timestamp: timestamp || new Date().toISOString()
        };

        // Agregar a la cola de notificaciones
        notificationService.addToQueue({
            type: 'chat_started',
            data: {
                visitor: visitorInfo,
                message: `Nueva conversación de chat iniciada por ${visitorInfo.name}`,
                timestamp: visitorInfo.timestamp,
                priority: 'high' // Alta prioridad para chats
            }
        });

        console.log(`📧 Notificación de chat agregada a cola: ${visitorInfo.name} (${visitorInfo.email})`);

        res.json({
            success: true,
            message: 'Notificación de chat enviada al administrador',
            data: {
                visitor: visitorInfo.name,
                queueLength: notificationService.notificationQueue.length
            }
        });
    } catch (error) {
        console.error('Error notificando inicio de chat:', error);
        res.status(500).json({
            success: false,
            message: 'Error enviando notificación de chat',
            error: error.message
        });
    }
};