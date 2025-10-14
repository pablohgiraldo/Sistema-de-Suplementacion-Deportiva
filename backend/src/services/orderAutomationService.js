import Order from '../models/Order.js';
import webhookService from './webhookService.js';

/**
 * Servicio de Automatización de Órdenes
 * Maneja transiciones automáticas de estado
 */

/**
 * Transiciones de estado permitidas
 */
const VALID_TRANSITIONS = {
    'pending': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered', 'cancelled'],
    'delivered': [], // Estado final
    'cancelled': []  // Estado final
};

/**
 * Validar si una transición de estado es válida
 */
const isValidTransition = (currentStatus, newStatus) => {
    return VALID_TRANSITIONS[currentStatus]?.includes(newStatus);
};

/**
 * Actualizar estado de orden automáticamente después del pago
 * @param {Object} order - Orden a actualizar
 * @returns {Promise<Object>} - Orden actualizada
 */
export const processOrderAfterPayment = async (order) => {
    try {
        // Si el pago fue exitoso y la orden está en pending
        if (order.paymentStatus === 'paid' && order.status === 'pending') {
            console.log(`🔄 Auto-transición: ${order.orderNumber} pending → processing`);
            
            await order.updateStatus('processing');
            
            // Disparar webhook
            await webhookService.triggerEvent('order.processing', {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                previousStatus: 'pending',
                currentStatus: 'processing',
                reason: 'Payment confirmed',
                triggeredBy: 'system',
                updatedAt: new Date().toISOString()
            });
            
            console.log(`✅ Orden ${order.orderNumber} actualizada a: En Proceso`);
        }
        
        return order;
        
    } catch (error) {
        console.error(`❌ Error al procesar orden después del pago:`, error);
        throw error;
    }
};

/**
 * Procesar órdenes con entrega estimada vencida
 * @returns {Promise<Object>} - Resultado del procesamiento
 */
export const processOverdueOrders = async () => {
    try {
        const now = new Date();
        
        // Buscar órdenes shipped con más de 7 días
        const overdueOrders = await Order.find({
            status: 'shipped',
            shippedAt: { $lt: new Date(now - 7 * 24 * 60 * 60 * 1000) }
        });
        
        let processed = 0;
        
        for (const order of overdueOrders) {
            console.log(`⏰ Orden vencida detectada: ${order.orderNumber} (enviada hace ${getDaysAgo(order.shippedAt)} días)`);
            
            // Auto-marcar como entregada si tiene más de 7 días enviada
            await order.updateStatus('delivered');
            
            // Disparar webhook
            await webhookService.triggerEvent('order.delivered', {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                status: 'Entregada',
                deliveredAt: new Date().toISOString(),
                autoDelivered: true,
                reason: 'Entrega automática después de 7 días'
            });
            
            processed++;
        }
        
        if (processed > 0) {
            console.log(`✅ ${processed} órdenes marcadas como entregadas automáticamente`);
        }
        
        return {
            success: true,
            processed
        };
        
    } catch (error) {
        console.error('❌ Error al procesar órdenes vencidas:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Procesar órdenes pendientes de pago expiradas
 * @returns {Promise<Object>} - Resultado del procesamiento
 */
export const cancelExpiredPendingOrders = async () => {
    try {
        const now = new Date();
        
        // Buscar órdenes pending con más de 24 horas sin pago
        const expiredOrders = await Order.find({
            status: 'pending',
            paymentStatus: 'pending',
            createdAt: { $lt: new Date(now - 24 * 60 * 60 * 1000) }
        });
        
        let cancelled = 0;
        
        for (const order of expiredOrders) {
            console.log(`⏰ Orden expirada detectada: ${order.orderNumber} (creada hace ${getDaysAgo(order.createdAt)} días)`);
            
            // Auto-cancelar
            await order.cancelOrder('Pago no completado en 24 horas', null);
            
            // Disparar webhook
            await webhookService.triggerEvent('order.cancelled', {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                status: 'Cancelada',
                cancelledAt: new Date().toISOString(),
                autoCancelled: true,
                reason: 'Pago no completado en 24 horas'
            });
            
            cancelled++;
        }
        
        if (cancelled > 0) {
            console.log(`✅ ${cancelled} órdenes canceladas automáticamente por expiración`);
        }
        
        return {
            success: true,
            cancelled
        };
        
    } catch (error) {
        console.error('❌ Error al cancelar órdenes expiradas:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Procesar todas las automatizaciones de órdenes
 * @returns {Promise<Object>} - Resultado completo
 */
export const processOrderAutomations = async () => {
    try {
        console.log('\n🤖 Iniciando automatizaciones de órdenes...');
        
        const [overdueResult, expiredResult] = await Promise.all([
            processOverdueOrders(),
            cancelExpiredPendingOrders()
        ]);
        
        console.log('✅ Automatizaciones completadas\n');
        
        return {
            success: true,
            overdue: overdueResult,
            expired: expiredResult
        };
        
    } catch (error) {
        console.error('❌ Error en automatizaciones:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Helper para calcular días transcurridos
 */
const getDaysAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

/**
 * Validar transición de estado antes de ejecutar
 * @param {Object} order - Orden
 * @param {string} newStatus - Nuevo estado
 * @returns {Object} - { valid: boolean, reason: string }
 */
export const validateStatusTransition = (order, newStatus) => {
    const currentStatus = order.status;
    
    // Validar que la transición esté permitida
    if (!isValidTransition(currentStatus, newStatus)) {
        return {
            valid: false,
            reason: `No se puede cambiar de "${currentStatus}" a "${newStatus}". Transiciones permitidas: ${VALID_TRANSITIONS[currentStatus].join(', ') || 'ninguna'}`
        };
    }
    
    // Validaciones específicas por estado
    if (newStatus === 'shipped') {
        if (order.paymentStatus !== 'paid') {
            return {
                valid: false,
                reason: 'No se puede enviar una orden que no ha sido pagada'
            };
        }
    }
    
    if (newStatus === 'delivered') {
        if (order.status !== 'shipped') {
            return {
                valid: false,
                reason: 'Solo se pueden marcar como entregadas las órdenes enviadas'
            };
        }
    }
    
    return {
        valid: true,
        reason: 'Transición válida'
    };
};

export default {
    processOrderAfterPayment,
    processOverdueOrders,
    cancelExpiredPendingOrders,
    processOrderAutomations,
    validateStatusTransition,
    isValidTransition
};

