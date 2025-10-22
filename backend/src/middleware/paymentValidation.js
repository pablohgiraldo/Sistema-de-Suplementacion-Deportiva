import mongoose from 'mongoose';
import Order from '../models/Order.js';
import crypto from 'crypto';

/**
 * Middleware para validar datos de transacción
 */
export const validateTransactionData = (req, res, next) => {
    try {
        const { orderId, paymentMethod } = req.body;
        const errors = [];
        
        // Validar orderId
        if (!orderId) {
            errors.push('El orderId es requerido');
        } else if (!mongoose.Types.ObjectId.isValid(orderId)) {
            errors.push('Formato de orderId inválido');
        }
        
        // Validar paymentMethod si se proporciona
        if (paymentMethod) {
            const validMethods = [
                'CREDIT_CARD',
                'DEBIT_CARD',
                'PSE',
                'CASH',
                'BANK_TRANSFER',
                'REFERENCED'
            ];
            
            if (!validMethods.includes(paymentMethod)) {
                errors.push(`Método de pago inválido. Métodos válidos: ${validMethods.join(', ')}`);
            }
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Errores de validación',
                errors: errors
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Error en validación de transacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar datos de transacción'
        });
    }
};

/**
 * Middleware para validar estado de la orden antes de pagar
 */
export const validateOrderForPayment = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.id;
        
        // Buscar la orden
        const order = await Order.findById(orderId)
            .populate('user', '_id email nombre')
            .populate('items.product', '_id name price stock');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }
        
        // Verificar propiedad de la orden
        if (order.user._id.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para pagar esta orden'
            });
        }
        
        // Validar estado de la orden
        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                error: 'La orden está cancelada y no puede ser pagada'
            });
        }
        
        if (order.status === 'delivered') {
            return res.status(400).json({
                success: false,
                error: 'La orden ya fue entregada'
            });
        }
        
        // Validar estado de pago
        if (order.paymentStatus === 'paid') {
            return res.status(400).json({
                success: false,
                error: 'Esta orden ya fue pagada',
                paymentDetails: {
                    transactionId: order.paymentDetails.transactionId,
                    paymentDate: order.paymentDetails.paymentDate
                }
            });
        }
        
        if (order.paymentStatus === 'refunded') {
            return res.status(400).json({
                success: false,
                error: 'Esta orden fue reembolsada y no puede ser pagada nuevamente'
            });
        }
        
        // Validar que los productos tengan stock disponible
        const outOfStockItems = [];
        for (const item of order.items) {
            if (!item.product) {
                outOfStockItems.push({
                    message: 'Producto no encontrado o eliminado'
                });
                continue;
            }
            
            if (item.product.stock < item.quantity) {
                outOfStockItems.push({
                    productName: item.product.name,
                    requested: item.quantity,
                    available: item.product.stock
                });
            }
        }
        
        if (outOfStockItems.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Algunos productos no tienen stock suficiente',
                outOfStockItems: outOfStockItems
            });
        }
        
        // Validar que el total sea mayor que 0
        if (order.total <= 0) {
            return res.status(400).json({
                success: false,
                error: 'El monto total de la orden debe ser mayor a 0'
            });
        }
        
        // Agregar orden al request para uso posterior
        req.order = order;
        
        next();
        
    } catch (error) {
        console.error('Error al validar orden para pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar orden'
        });
    }
};

/**
 * Verificar que no exista una transacción en progreso para la orden
 */
export const preventDuplicateTransaction = async (req, res, next) => {
    try {
        const { orderId } = req.body;
        
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }
        
        // Si ya tiene un transactionId y el pago no está fallido o cancelado
        if (order.paymentDetails.transactionId && 
            order.paymentStatus !== 'failed' && 
            order.paymentStatus !== 'cancelled') {
            
            // Verificar si la transacción está pendiente
            if (order.paymentStatus === 'pending') {
                return res.status(409).json({
                    success: false,
                    error: 'Ya existe una transacción en progreso para esta orden',
                    transactionId: order.paymentDetails.transactionId,
                    message: 'Por favor espera a que se complete la transacción actual o contáctanos si tienes problemas'
                });
            }
        }
        
        next();
        
    } catch (error) {
        console.error('Error al verificar duplicado:', error);
        res.status(500).json({
            success: false,
            error: 'Error al verificar transacción'
        });
    }
};

/**
 * Validar firma de PayU en confirmaciones/callbacks
 */
export const validatePayUSignature = (req, res, next) => {
    try {
        const {
            merchant_id,
            state_pol,
            reference_sale,
            value,
            currency,
            sign
        } = req.body;
        
        // Validar que todos los campos requeridos estén presentes
        const requiredFields = ['merchant_id', 'state_pol', 'reference_sale', 'value', 'currency', 'sign'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.error('❌ Campos faltantes en confirmación PayU:', missingFields);
            return res.status(400).json({
                success: false,
                error: 'Datos incompletos en confirmación',
                missingFields: missingFields
            });
        }
        
        // Obtener API Key de PayU
        const apiKey = process.env.PAYU_API_KEY;
        
        if (!apiKey) {
            console.error('❌ PAYU_API_KEY no configurado');
            return res.status(500).json({
                success: false,
                error: 'Configuración de PayU incompleta'
            });
        }
        
        // Generar firma esperada
        const signatureString = `${apiKey}~${merchant_id}~${reference_sale}~${value}~${currency}~${state_pol}`;
        const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex');
        
        // Comparar firmas
        if (sign !== expectedSignature) {
            console.error('❌ Firma inválida en confirmación PayU');
            console.error('   Recibida:', sign);
            console.error('   Esperada:', expectedSignature);
            console.error('   String de firma:', signatureString);
            
            return res.status(400).json({
                success: false,
                error: 'Firma de confirmación inválida'
            });
        }
        
        console.log('✅ Firma de PayU validada correctamente');
        
        next();
        
    } catch (error) {
        console.error('Error al validar firma PayU:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar firma de confirmación'
        });
    }
};

/**
 * Validar monto de la transacción contra el total de la orden
 */
export const validateTransactionAmount = async (req, res, next) => {
    try {
        const { reference_sale, value, currency } = req.body;
        
        // Buscar la orden por referencia
        const order = await Order.findById(reference_sale);
        
        if (!order) {
            console.warn(`⚠️ Orden no encontrada en validación de monto: ${reference_sale}`);
            // No bloqueamos la confirmación, solo logueamos
            return next();
        }
        
        const transactionAmount = parseFloat(value);
        const orderTotal = order.total;
        
        // Validar que los montos coincidan (con tolerancia de 1 peso por redondeo)
        const difference = Math.abs(transactionAmount - orderTotal);
        
        if (difference > 1) {
            console.error('❌ Discrepancia en monto de transacción:');
            console.error(`   Orden: $${orderTotal} ${currency}`);
            console.error(`   Transacción: $${transactionAmount} ${currency}`);
            console.error(`   Diferencia: $${difference}`);
            
            return res.status(400).json({
                success: false,
                error: 'El monto de la transacción no coincide con el total de la orden',
                expected: orderTotal,
                received: transactionAmount,
                difference: difference
            });
        }
        
        // Validar moneda
        if (currency !== 'COP') {
            console.warn(`⚠️ Moneda diferente a COP: ${currency}`);
        }
        
        next();
        
    } catch (error) {
        console.error('Error al validar monto:', error);
        // No bloqueamos por error de validación, solo logueamos
        next();
    }
};

/**
 * Validar que el merchantId coincida
 */
export const validateMerchantId = (req, res, next) => {
    try {
        const { merchant_id } = req.body;
        const expectedMerchantId = process.env.PAYU_MERCHANT_ID;
        
        if (!expectedMerchantId) {
            console.error('❌ PAYU_MERCHANT_ID no configurado');
            return res.status(500).json({
                success: false,
                error: 'Configuración de PayU incompleta'
            });
        }
        
        if (merchant_id !== expectedMerchantId) {
            console.error('❌ Merchant ID no coincide:');
            console.error(`   Recibido: ${merchant_id}`);
            console.error(`   Esperado: ${expectedMerchantId}`);
            
            return res.status(400).json({
                success: false,
                error: 'Merchant ID inválido'
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Error al validar merchant ID:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar merchant'
        });
    }
};

/**
 * Validar datos de reembolso
 */
export const validateRefundData = async (req, res, next) => {
    try {
        const { orderId, amount, reason } = req.body;
        const errors = [];
        
        // Validar orderId
        if (!orderId) {
            errors.push('El orderId es requerido');
        } else if (!mongoose.Types.ObjectId.isValid(orderId)) {
            errors.push('Formato de orderId inválido');
        }
        
        // Validar amount si se proporciona
        if (amount !== undefined && amount !== null) {
            if (typeof amount !== 'number' || amount <= 0) {
                errors.push('El monto debe ser un número mayor a 0');
            }
        }
        
        // Validar reason si se proporciona
        if (reason && typeof reason !== 'string') {
            errors.push('La razón debe ser un texto');
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Errores de validación',
                errors: errors
            });
        }
        
        // Si orderId es válido, buscar la orden
        if (orderId) {
            const order = await Order.findById(orderId);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    error: 'Orden no encontrada'
                });
            }
            
            // Validar que la orden tenga un pago exitoso
            if (order.paymentStatus !== 'paid') {
                return res.status(400).json({
                    success: false,
                    error: `No se puede reembolsar una orden con estado: ${order.paymentStatusFormatted}`
                });
            }
            
            // Validar que tenga transactionId
            if (!order.paymentDetails.transactionId) {
                return res.status(400).json({
                    success: false,
                    error: 'La orden no tiene información de transacción'
                });
            }
            
            // Validar que el monto no exceda el total pagado
            if (amount && amount > order.total) {
                return res.status(400).json({
                    success: false,
                    error: `El monto de reembolso ($${amount}) excede el total pagado ($${order.total})`
                });
            }
            
            req.order = order;
        }
        
        next();
        
    } catch (error) {
        console.error('Error al validar datos de reembolso:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar reembolso'
        });
    }
};

/**
 * Rate limiting específico para transacciones de pago
 * (más restrictivo que otros endpoints)
 */
export const paymentRateLimit = (req, res, next) => {
    // Implementación básica - puede mejorarse con redis
    const userId = req.user?.id;
    
    if (!userId) {
        return next();
    }
    
    // Aquí podrías implementar lógica de rate limiting más sofisticada
    // Por ahora solo pasamos al siguiente middleware
    next();
};

export default {
    validateTransactionData,
    validateOrderForPayment,
    preventDuplicateTransaction,
    validatePayUSignature,
    validateTransactionAmount,
    validateMerchantId,
    validateRefundData,
    paymentRateLimit
};

