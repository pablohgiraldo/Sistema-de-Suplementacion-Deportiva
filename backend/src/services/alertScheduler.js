import cron from 'node-cron';
import notificationService from './notificationService.js';
import AlertConfig from '../models/AlertConfig.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';

class AlertScheduler {
    constructor() {
        this.isRunning = false;
        this.jobs = new Map();
        this.startScheduler();
    }

    startScheduler() {
        if (this.isRunning) {
            console.log('⚠️ AlertScheduler ya está ejecutándose');
            return;
        }

        console.log('🚀 Iniciando AlertScheduler...');
        this.isRunning = true;

        // Ejecutar cada 5 minutos
        const job = cron.schedule('*/5 * * * *', async () => {
            console.log('🔍 Ejecutando verificación automática de alertas...');
            await this.checkAndSendAlerts();
        }, {
            scheduled: false
        });

        this.jobs.set('main', job);
        job.start();

        console.log('✅ AlertScheduler iniciado - Verificando alertas cada 5 minutos');
    }

    stopScheduler() {
        if (!this.isRunning) {
            console.log('⚠️ AlertScheduler no está ejecutándose');
            return;
        }

        console.log('🛑 Deteniendo AlertScheduler...');

        this.jobs.forEach((job, name) => {
            job.stop();
            console.log(`   ✅ Job ${name} detenido`);
        });

        this.jobs.clear();
        this.isRunning = false;
        console.log('✅ AlertScheduler detenido');
    }

    async checkAndSendAlerts() {
        try {
            console.log('🔍 Verificando alertas automáticas...');

            // Obtener todas las configuraciones de alertas activas
            const alertConfigs = await AlertConfig.find({
                status: 'active',
                emailAlerts: true
            }).populate('product', 'name brand');

            let alertsSent = 0;
            let alertsSkipped = 0;

            for (const config of alertConfigs) {
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
                        config.lastAlertSent = new Date();
                        await config.save();
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
            if (alertsSent > 0) {
                const summaryResult = await notificationService.sendSummaryAlert();
                if (summaryResult.success) {
                    console.log('✅ Resumen de alertas enviado');
                }
            }

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
            activeJobs: this.jobs.size,
            nextRun: this.isRunning ? 'Cada 5 minutos' : 'No programado'
        };
    }
}

// Crear instancia singleton
const alertScheduler = new AlertScheduler();

export default alertScheduler;
