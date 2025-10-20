import { sendStockAlertEmail, sendAlertsSummaryEmail, sendTestEmail, sendOrderStatusChangeEmail } from '../config/email.js';
import AlertConfig from '../models/AlertConfig.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

class NotificationService {
    constructor() {
        this.isEnabled = process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';
        this.adminEmail = process.env.ADMIN_EMAIL || 'admin@supergains.com';
        this.notificationQueue = [];
        this.processing = false;
    }

    // Verificar si las notificaciones están habilitadas
    isNotificationEnabled() {
        return this.isEnabled && process.env.EMAIL_USER && process.env.EMAIL_PASS;
    }

    // Agregar notificación a la cola
    addToQueue(notification) {
        this.notificationQueue.push({
            ...notification,
            timestamp: new Date(),
            id: Math.random().toString(36).substr(2, 9)
        });

        // Procesar cola si no está en proceso
        if (!this.processing) {
            this.processQueue();
        }
    }

    // Procesar cola de notificaciones
    async processQueue() {
        if (this.processing || this.notificationQueue.length === 0) {
            return;
        }

        this.processing = true;
        console.log(`📧 Procesando ${this.notificationQueue.length} notificaciones...`);

        while (this.notificationQueue.length > 0) {
            const notification = this.notificationQueue.shift();
            await this.sendNotification(notification);
        }

        this.processing = false;
        console.log('✅ Cola de notificaciones procesada');
    }

    // Enviar notificación individual
    async sendNotification(notification) {
        try {
            if (!this.isNotificationEnabled()) {
                console.log('⚠️ Notificaciones por email deshabilitadas');
                return { success: false, message: 'Notificaciones deshabilitadas' };
            }

            switch (notification.type) {
                case 'stock_alert':
                    return await this.sendStockAlert(notification.data);
                case 'alerts_summary':
                    return await this.sendAlertsSummary(notification.data);
                case 'chat_started':
                    return await this.sendChatNotification(notification.data);
                case 'test_email':
                    return await this.sendTest(notification.data);
                case 'order_status_change':
                    return await this.sendOrderStatusChange(notification.data);
                default:
                    console.log(`⚠️ Tipo de notificación no reconocido: ${notification.type}`);
                    return { success: false, message: 'Tipo de notificación no reconocido' };
            }
        } catch (error) {
            console.error('❌ Error enviando notificación:', error);
            return { success: false, message: error.message };
        }
    }

    // Enviar alerta de stock individual
    async sendStockAlert(alertData) {
        const { productId, inventoryId, alertConfigId } = alertData;

        try {
            // Obtener datos completos
            const product = await Product.findById(productId);
            const inventory = await Inventory.findById(inventoryId);
            const alertConfig = await AlertConfig.findById(alertConfigId);

            if (!product || !inventory || !alertConfig) {
                throw new Error('Datos de alerta no encontrados');
            }

            // Verificar si se debe enviar la alerta
            if (!alertConfig.emailAlerts || alertConfig.status !== 'active') {
                console.log(`⏭️ Email deshabilitado para ${product.name}`);
                return { success: false, message: 'Email deshabilitado para este producto' };
            }

            // Verificar frecuencia de envío
            if (!alertConfig.shouldSendAlert('low_stock', inventory.currentStock)) {
                console.log(`⏭️ Alerta no debe enviarse según frecuencia para ${product.name}`);
                return { success: false, message: 'Alerta no debe enviarse según frecuencia' };
            }

            // Determinar alertas activas
            const alerts = [];
            if (inventory.currentStock <= alertConfig.outOfStockThreshold) {
                alerts.push({
                    type: 'out_of_stock',
                    severity: 'critical',
                    threshold: alertConfig.outOfStockThreshold,
                    currentStock: inventory.currentStock
                });
            } else if (inventory.currentStock <= alertConfig.criticalStockThreshold) {
                alerts.push({
                    type: 'critical_stock',
                    severity: 'error',
                    threshold: alertConfig.criticalStockThreshold,
                    currentStock: inventory.currentStock
                });
            } else if (inventory.currentStock <= alertConfig.lowStockThreshold) {
                alerts.push({
                    type: 'low_stock',
                    severity: 'warning',
                    threshold: alertConfig.lowStockThreshold,
                    currentStock: inventory.currentStock
                });
            }

            if (alerts.length === 0) {
                console.log(`⏭️ No hay alertas activas para ${product.name}`);
                return { success: false, message: 'No hay alertas activas' };
            }

            // Enviar email
            const result = await sendStockAlertEmail({
                product,
                inventory,
                alerts,
                adminEmail: this.adminEmail
            });

            // Actualizar timestamp de última alerta enviada
            if (result.success) {
                alertConfig.lastAlertSent = new Date();
                await alertConfig.save();
            }

            return result;
        } catch (error) {
            console.error('❌ Error enviando alerta de stock:', error);
            return { success: false, message: error.message };
        }
    }

    // Enviar resumen de alertas
    async sendAlertsSummary(summaryData) {
        try {
            const result = await sendAlertsSummaryEmail({
                ...summaryData,
                adminEmail: this.adminEmail
            });

            return result;
        } catch (error) {
            console.error('❌ Error enviando resumen de alertas:', error);
            return { success: false, message: error.message };
        }
    }

    // Enviar notificación de inicio de chat
    async sendChatNotification(chatData) {
        try {
            const { visitor, message, timestamp } = chatData;
            
            const emailResult = await sendEmail({
                to: this.adminEmail,
                subject: `🆕 Nueva conversación de chat - ${visitor.name}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
                            .label { font-weight: bold; color: #667eea; }
                            .value { color: #333; margin-left: 10px; }
                            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1 style="margin: 0;">💬 Nueva Conversación de Chat</h1>
                                <p style="margin: 10px 0 0 0;">SuperGains - Soporte al Cliente</p>
                            </div>
                            <div class="content">
                                <p><strong>${message}</strong></p>
                                
                                <div class="info-box">
                                    <h3 style="margin-top: 0; color: #667eea;">Información del Visitante</h3>
                                    <p><span class="label">Nombre:</span><span class="value">${visitor.name}</span></p>
                                    <p><span class="label">Email:</span><span class="value">${visitor.email}</span></p>
                                    <p><span class="label">Usuario ID:</span><span class="value">${visitor.userId}</span></p>
                                    <p><span class="label">Hora:</span><span class="value">${new Date(timestamp).toLocaleString('es-CO')}</span></p>
                                </div>

                                <p style="text-align: center;">
                                    <a href="https://dashboard.tawk.to/" class="btn" target="_blank">
                                        Abrir Dashboard de Tawk.to →
                                    </a>
                                </p>

                                <p style="color: #666; font-size: 14px; margin-top: 20px;">
                                    <strong>Nota:</strong> Accede a tu dashboard de Tawk.to para responder esta conversación en tiempo real.
                                </p>
                            </div>
                            <div class="footer">
                                <p>SuperGains - Sistema de Notificaciones</p>
                                <p>Esta es una notificación automática del sistema de chat</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });

            if (emailResult.success) {
                console.log(`✅ Notificación de chat enviada a ${this.adminEmail}`);
            }

            return emailResult;
        } catch (error) {
            console.error('❌ Error enviando notificación de chat:', error);
            return { success: false, message: error.message };
        }
    }

    // Enviar email de prueba
    async sendTest(testData) {
        try {
            const { email, subject } = testData;
            const result = await sendTestEmail(email, subject);
            return result;
        } catch (error) {
            console.error('❌ Error enviando email de prueba:', error);
            return { success: false, message: error.message };
        }
    }

    // Enviar notificación de cambio de estado de orden
    async sendOrderStatusChange(orderData) {
        try {
            const result = await sendOrderStatusChangeEmail(orderData);
            return result;
        } catch (error) {
            console.error('❌ Error enviando notificación de cambio de estado:', error);
            return { success: false, message: error.message };
        }
    }

    // Procesar todas las alertas activas y enviar notificaciones
    async processAllAlerts() {
        try {
            console.log('🔍 Procesando todas las alertas activas...');

            const alertConfigs = await AlertConfig.find({
                status: 'active',
                emailAlerts: true
            }).populate('product');

            const alertsToSend = [];
            const summaryData = {
                totalAlerts: 0,
                criticalAlerts: 0,
                errorAlerts: 0,
                warningAlerts: 0,
                alertsList: []
            };

            for (const config of alertConfigs) {
                const inventory = await Inventory.findOne({ product: config.product._id });
                if (!inventory) continue;

                const currentStock = inventory.currentStock;
                const alerts = [];

                // Verificar cada tipo de alerta
                if (currentStock <= config.outOfStockThreshold) {
                    alerts.push({
                        type: 'out_of_stock',
                        severity: 'critical',
                        threshold: config.outOfStockThreshold,
                        currentStock
                    });
                } else if (currentStock <= config.criticalStockThreshold) {
                    alerts.push({
                        type: 'critical_stock',
                        severity: 'error',
                        threshold: config.criticalStockThreshold,
                        currentStock
                    });
                } else if (currentStock <= config.lowStockThreshold) {
                    alerts.push({
                        type: 'low_stock',
                        severity: 'warning',
                        threshold: config.lowStockThreshold,
                        currentStock
                    });
                }

                if (alerts.length > 0) {
                    // Verificar si debe enviarse según frecuencia
                    const shouldSend = config.shouldSendAlert('low_stock', currentStock);

                    if (shouldSend) {
                        alertsToSend.push({
                            type: 'stock_alert',
                            data: {
                                productId: config.product._id,
                                inventoryId: inventory._id,
                                alertConfigId: config._id
                            }
                        });

                        // Agregar al resumen
                        summaryData.totalAlerts += alerts.length;
                        summaryData.criticalAlerts += alerts.filter(a => a.severity === 'critical').length;
                        summaryData.errorAlerts += alerts.filter(a => a.severity === 'error').length;
                        summaryData.warningAlerts += alerts.filter(a => a.severity === 'warning').length;

                        summaryData.alertsList.push({
                            product: config.product,
                            inventory,
                            alerts,
                            highestSeverity: Math.min(...alerts.map(a => a.severity === 'critical' ? 1 : a.severity === 'error' ? 2 : 3))
                        });
                    }
                }
            }

            // Enviar alertas individuales
            for (const alert of alertsToSend) {
                this.addToQueue(alert);
            }

            // Enviar resumen si hay alertas
            if (summaryData.totalAlerts > 0) {
                this.addToQueue({
                    type: 'alerts_summary',
                    data: summaryData
                });
            }

            console.log(`📊 Procesadas ${alertsToSend.length} alertas individuales y 1 resumen`);
            return {
                success: true,
                individualAlerts: alertsToSend.length,
                summarySent: summaryData.totalAlerts > 0
            };

        } catch (error) {
            console.error('❌ Error procesando alertas:', error);
            return { success: false, message: error.message };
        }
    }

    // Obtener estado del servicio
    getStatus() {
        return {
            enabled: this.isNotificationEnabled(),
            queueLength: this.notificationQueue.length,
            processing: this.processing,
            adminEmail: this.adminEmail,
            emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
        };
    }
}

// Instancia singleton del servicio
const notificationService = new NotificationService();

export default notificationService;
