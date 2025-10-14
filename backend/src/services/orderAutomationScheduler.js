import orderAutomationService from './orderAutomationService.js';

/**
 * Scheduler para automatizaciones de órdenes
 * Ejecuta tareas periódicamente
 */
class OrderAutomationScheduler {
    constructor() {
        this.interval = null;
        this.isRunning = false;
        // Ejecutar cada hora (60 minutos)
        this.intervalTime = 60 * 60 * 1000;
    }

    /**
     * Iniciar el scheduler
     */
    start() {
        if (this.isRunning) {
            console.log('⚠️ OrderAutomationScheduler ya está corriendo');
            return;
        }

        console.log('🤖 Iniciando OrderAutomationScheduler...');
        console.log(`   ⏰ Ejecutando automatizaciones cada ${this.intervalTime / 1000 / 60} minutos`);

        // Ejecutar inmediatamente al iniciar
        this.runAutomations();

        // Configurar intervalo
        this.interval = setInterval(() => {
            this.runAutomations();
        }, this.intervalTime);

        this.isRunning = true;
        console.log('✅ OrderAutomationScheduler iniciado');
    }

    /**
     * Detener el scheduler
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.isRunning = false;
            console.log('🛑 OrderAutomationScheduler detenido');
        }
    }

    /**
     * Ejecutar automatizaciones
     */
    async runAutomations() {
        try {
            console.log('\n🤖 Ejecutando automatizaciones de órdenes...');
            
            const result = await orderAutomationService.processOrderAutomations();
            
            if (result.success) {
                const overdueProcessed = result.overdue?.processed || 0;
                const expiredCancelled = result.expired?.cancelled || 0;
                
                console.log(`✅ Automatizaciones completadas:`);
                console.log(`   📦 Órdenes vencidas procesadas: ${overdueProcessed}`);
                console.log(`   ❌ Órdenes expiradas canceladas: ${expiredCancelled}`);
            } else {
                console.error('❌ Error en automatizaciones:', result.error);
            }
            
        } catch (error) {
            console.error('❌ Error al ejecutar automatizaciones:', error);
        }
    }
}

// Crear instancia única
const scheduler = new OrderAutomationScheduler();

export default scheduler;

