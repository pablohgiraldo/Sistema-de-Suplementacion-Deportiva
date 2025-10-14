import notificationService from './notificationService.js';
import AlertConfig from '../models/AlertConfig.js';
import Inventory from '../models/Inventory.js';

class SimpleAlertScheduler {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
        this.checkInterval = 5 * 60 * 1000; // 5 minutos
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ SimpleAlertScheduler ya está ejecutándose');
            return;
        }

        console.log('🚀 Iniciando SimpleAlertScheduler...');
        this.isRunning = true;

        // Ejecutar inmediatamente
        this.checkAndSendAlerts();

        // Programar ejecución periódica
        this.intervalId = setInterval(() => {
            this.checkAndSendAlerts();
        }, this.checkInterval);

        console.log(`✅ SimpleAlertScheduler iniciado - Verificando alertas cada ${this.checkInterval / 1000 / 60} minutos`);
    }

    stop() {
        if (!this.isRunning) {
            console.log('⚠️ SimpleAlertScheduler no está ejecutándose');
            return;
        }

        console.log('🛑 Deteniendo SimpleAlertScheduler...');

        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.isRunning = false;
        console.log('✅ SimpleAlertScheduler detenido');
    }

    async checkAndSendAlerts() {
        try {
            console.log('🔍 Verificando alertas automáticas...');

            // Obtener todas las configuraciones de alertas activas
            const alertConfigs = await AlertConfig.find({
                status: 'active',
                'emailAlerts.enabled': true
            }).populate('product', 'name brand');

            let alertsSent = 0;
            let alertsSkipped = 0;

            for (const config of alertConfigs) {
                // ✅ Validar que el producto existe y no fue eliminado
                if (!config.product || !config.product._id) {
                    console.warn(`AlertConfig ${config._id} tiene producto nulo o eliminado`);
                    continue;
                }
                
                const inventory = await Inventory.findOne({
                    product: config.product._id
                });

                if (!inventory) {
                    console.log(`   ⚠️ No se encontró inventario para: ${config.product.name}`);
                    continue;
                }

                const currentStock = inventory.currentStock;
                let alertType = null;
                let shouldSend = false;

                // Verificar tipo de alerta
                if (currentStock <= config.outOfStockThreshold) {
                    alertType = 'out_of_stock';
                    shouldSend = config.shouldSendAlert('out_of_stock', currentStock);
                } else if (currentStock <= config.criticalStockThreshold) {
                    alertType = 'critical_stock';
                    shouldSend = config.shouldSendAlert('critical_stock', currentStock);
                } else if (currentStock <= config.lowStockThreshold) {
                    alertType = 'low_stock';
                    shouldSend = config.shouldSendAlert('low_stock', currentStock);
                }

                if (shouldSend && alertType) {
                    console.log(`   🚨 Enviando alerta ${alertType} para: ${config.product.name} (Stock: ${currentStock})`);

                    const result = await notificationService.sendStockAlert({
                        productId: config.product._id,
                        inventoryId: inventory._id,
                        alertConfigId: config._id
                    });

                    if (result.success) {
                        // Actualizar lastAlertSent
                        await config.updateLastAlertSent(alertType);
                        alertsSent++;
                        console.log(`   ✅ Alerta enviada: ${result.messageId}`);
                    } else {
                        console.log(`   ❌ Error enviando alerta: ${result.message}`);
                    }
                } else {
                    alertsSkipped++;
                }
            }

            console.log(`📊 Resumen: ${alertsSent} alertas enviadas, ${alertsSkipped} omitidas`);

            // Enviar resumen si hay alertas críticas
            // if (alertsSent > 0) {
            //     const summaryResult = await notificationService.sendSummaryAlert();
            //     if (summaryResult.success) {
            //         console.log('✅ Resumen de alertas enviado');
            //     }
            // }

        } catch (error) {
            console.error('❌ Error en verificación automática de alertas:', error);
        }
    }

    // Método para ejecutar verificación manual
    async runManualCheck() {
        console.log('🔍 Ejecutando verificación manual de alertas...');
        await this.checkAndSendAlerts();
    }

    // Método para obtener estado del scheduler
    getStatus() {
        return {
            isRunning: this.isRunning,
            checkInterval: this.checkInterval,
            nextRun: this.isRunning ? `Cada ${this.checkInterval / 1000 / 60} minutos` : 'No programado'
        };
    }
}

// Crear instancia singleton
const simpleAlertScheduler = new SimpleAlertScheduler();

export default simpleAlertScheduler;
