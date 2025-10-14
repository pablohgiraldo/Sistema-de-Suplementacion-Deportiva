import orderAutomationService from '../services/orderAutomationService.js';
import Order from '../models/Order.js';

/**
 * Ejecutar automatizaciones de órdenes manualmente
 * POST /api/automations/run
 */
export const runAutomations = async (req, res) => {
    try {
        console.log('🤖 Ejecutando automatizaciones manualmente...');
        
        const result = await orderAutomationService.processOrderAutomations();
        
        res.status(200).json({
            success: true,
            data: result,
            message: 'Automatizaciones ejecutadas exitosamente'
        });
        
    } catch (error) {
        console.error('Error al ejecutar automatizaciones:', error);
        res.status(500).json({
            success: false,
            error: 'Error al ejecutar automatizaciones'
        });
    }
};

/**
 * Procesar órdenes vencidas
 * POST /api/automations/process-overdue
 */
export const processOverdue = async (req, res) => {
    try {
        const result = await orderAutomationService.processOverdueOrders();
        
        res.status(200).json({
            success: true,
            data: result,
            message: `${result.processed || 0} órdenes procesadas`
        });
        
    } catch (error) {
        console.error('Error al procesar órdenes vencidas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar órdenes vencidas'
        });
    }
};

/**
 * Cancelar órdenes expiradas
 * POST /api/automations/cancel-expired
 */
export const cancelExpired = async (req, res) => {
    try {
        const result = await orderAutomationService.cancelExpiredPendingOrders();
        
        res.status(200).json({
            success: true,
            data: result,
            message: `${result.cancelled || 0} órdenes canceladas`
        });
        
    } catch (error) {
        console.error('Error al cancelar órdenes expiradas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cancelar órdenes expiradas'
        });
    }
};

/**
 * Obtener estadísticas de automatizaciones
 * GET /api/automations/stats
 */
export const getAutomationStats = async (req, res) => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        
        // Órdenes pendientes antiguas (sin pago)
        const expiredPending = await Order.countDocuments({
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: { $lt: oneDayAgo }
        });
        
        // Órdenes enviadas hace más de 7 días
        const overdueShipped = await Order.countDocuments({
            status: 'shipped',
            shippedAt: { $lt: sevenDaysAgo }
        });
        
        // Órdenes procesadas hoy
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const processedToday = await Order.countDocuments({
            updatedAt: { $gte: startOfDay },
            $or: [
                { status: 'delivered', deliveredAt: { $gte: startOfDay } },
                { status: 'cancelled', cancelledAt: { $gte: startOfDay } }
            ]
        });
        
        res.status(200).json({
            success: true,
            data: {
                pendingAutomations: {
                    expiredOrders: expiredPending,
                    overdueOrders: overdueShipped
                },
                processedToday: processedToday,
                recommendations: []
            }
        });
        
        // Agregar recomendaciones
        const recommendations = [];
        if (expiredPending > 0) {
            recommendations.push(`${expiredPending} órdenes pendientes sin pago por más de 24h - considerar cancelar`);
        }
        if (overdueShipped > 0) {
            recommendations.push(`${overdueShipped} órdenes enviadas por más de 7 días - considerar marcar como entregadas`);
        }
        
        res.data.data.recommendations = recommendations;
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
};

export default {
    runAutomations,
    processOverdue,
    cancelExpired,
    getAutomationStats
};

