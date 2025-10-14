import paymentService from '../services/paymentService.js';
import Order from '../models/Order.js';
import mongoose from 'mongoose';

/**
 * Crear una transacción de pago con PayU
 * POST /api/payments/create-transaction
 */
export const createPayment = async (req, res) => {
    try {
        const { paymentMethod = 'CREDIT_CARD' } = req.body;
        
        // La orden ya fue validada por el middleware validateOrderForPayment
        const order = req.order;
        
        // Preparar datos del comprador
        const buyer = {
            id: order.user._id.toString(),
            fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            email: order.user.email,
            phone: order.shippingAddress.phone,
            document: order.user.documento || '123456789'
        };
        
        // Preparar dirección de envío
        const shippingAddress = {
            street1: order.shippingAddress.street,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            country: order.shippingAddress.country || 'CO',
            postalCode: order.shippingAddress.zipCode,
            phone: order.shippingAddress.phone
        };
        
        // Crear transacción en PayU
        const transaction = await paymentService.createPayUTransaction({
            orderId: order._id.toString(),
            amount: order.total,
            currency: 'COP',
            description: `Orden ${order.orderNumber} - ${order.items.length} productos`,
            buyer: buyer,
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod
        });
        
        // Registrar inicio de pago en la orden
        await order.logPaymentInitiation({
            transactionId: transaction.transactionId,
            payuOrderId: transaction.orderId,
            payuReferenceCode: transaction.referenceCode,
            paymentMethod: paymentMethod,
            amount: order.total,
            currency: 'COP'
        });
        
        res.status(200).json({
            success: true,
            data: {
                transactionId: transaction.transactionId,
                orderId: transaction.orderId,
                state: transaction.state,
                responseCode: transaction.responseCode,
                message: transaction.message,
                orderNumber: order.orderNumber
            }
        });
        
    } catch (error) {
        console.error('Error al crear pago:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar el pago'
        });
    }
};

/**
 * Generar formulario de pago de PayU
 * POST /api/payments/generate-form
 */
export const generatePaymentForm = async (req, res) => {
    try {
        // La orden ya fue validada por el middleware validateOrderForPayment
        const order = req.order;
        
        // Generar formulario
        const buyer = {
            fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
            email: order.user.email,
            phone: order.shippingAddress.phone
        };
        
        const formData = paymentService.generatePayUForm({
            orderId: order._id.toString(),
            amount: order.total,
            currency: 'COP',
            description: `Orden ${order.orderNumber}`,
            buyer: buyer
        });
        
        res.status(200).json({
            success: true,
            data: formData
        });
        
    } catch (error) {
        console.error('Error al generar formulario:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al generar formulario de pago'
        });
    }
};

/**
 * Obtener estado de una transacción
 * GET /api/payments/transaction/:transactionId
 */
export const getTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        if (!transactionId) {
            return res.status(400).json({
                success: false,
                error: 'El transactionId es requerido'
            });
        }
        
        const transaction = await paymentService.getPayUTransactionStatus(transactionId);
        
        res.status(200).json({
            success: true,
            data: transaction.transaction
        });
        
    } catch (error) {
        console.error('Error al obtener estado de transacción:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener estado de la transacción'
        });
    }
};

/**
 * Crear un reembolso
 * POST /api/payments/create-refund
 * Solo admin
 */
export const createRefund = async (req, res) => {
    try {
        const { reason = 'Cliente solicitó reembolso' } = req.body;
        
        // La orden ya fue validada por el middleware validateRefundData
        const order = req.order;
        const transactionId = order.paymentDetails.transactionId;
        
        // Crear reembolso en PayU
        const refund = await paymentService.createPayURefund(
            transactionId,
            order.paymentDetails.payuOrderId || transactionId,
            reason
        );
        
        // Actualizar la orden
        await order.processRefund(
            order.total,
            reason,
            req.user.id
        );
        
        res.status(200).json({
            success: true,
            data: refund,
            message: 'Reembolso procesado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al crear reembolso:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al procesar reembolso'
        });
    }
};

/**
 * Callback de PayU (página de confirmación)
 * POST /api/payments/payu-callback
 * Endpoint público (sin autenticación)
 */
export const handlePayUCallback = async (req, res) => {
    try {
        console.log('📥 Callback de PayU recibido:', req.body);
        
        // Procesar la confirmación
        const result = await paymentService.processPayUConfirmation(req.body);
        
        res.status(200).send('OK');
        
    } catch (error) {
        console.error('Error al procesar callback PayU:', error);
        res.status(200).send('OK'); // Siempre responder 200 para que PayU no reintente
    }
};

/**
 * Página de respuesta de PayU (donde el usuario es redirigido)
 * GET /api/payments/payu-response
 * Endpoint público
 */
export const handlePayUResponse = async (req, res) => {
    try {
        const {
            referenceCode,
            transactionState,
            lapTransactionState,
            message,
            TX_VALUE,
            currency
        } = req.query;
        
        console.log('📋 Respuesta de PayU:', {
            referenceCode,
            state: transactionState,
            lapState: lapTransactionState,
            message
        });
        
        // Redirigir al frontend con los parámetros
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const redirectUrl = `${frontendUrl}/payment-confirmation?` +
            `ref=${referenceCode || ''}&` +
            `state=${transactionState || lapTransactionState || ''}&` +
            `lapState=${lapTransactionState || ''}&` +
            `message=${encodeURIComponent(message || '')}&` +
            `value=${TX_VALUE || ''}&` +
            `currency=${currency || 'COP'}`;
        
        res.redirect(redirectUrl);
        
    } catch (error) {
        console.error('Error al procesar respuesta PayU:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/payment-confirmation?state=error&message=${encodeURIComponent('Error al procesar el pago')}`);
    }
};

/**
 * Obtener estado de pago de una orden
 * GET /api/payments/order/:orderId/status
 */
export const getOrderPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        
        // Validar formato de ObjectId
        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({
                success: false,
                error: 'Formato de orderId inválido'
            });
        }
        
        // Buscar la orden
        const order = await Order.findById(orderId)
            .select('orderNumber status paymentStatus paymentMethod paymentDetails total user')
            .populate('user', 'email nombre');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }
        
        // Verificar permisos
        if (order.user._id.toString() !== userId && req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para ver esta orden'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                orderNumber: order.orderNumber,
                orderStatus: order.statusFormatted,
                paymentStatus: order.paymentStatusFormatted,
                paymentMethod: order.paymentMethodFormatted,
                total: order.total,
                transactionId: order.paymentDetails.transactionId,
                paymentDate: order.paymentDetails.paymentDate
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estado de pago:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al obtener estado de pago'
        });
    }
};

/**
 * Obtener configuración de PayU para el frontend
 * GET /api/payments/config
 */
export const getPayUConfig = async (req, res) => {
    try {
        const merchantId = process.env.PAYU_MERCHANT_ID;
        const accountId = process.env.PAYU_ACCOUNT_ID;
        const isTest = process.env.NODE_ENV !== 'production';
        
        if (!merchantId || !accountId) {
            return res.status(500).json({
                success: false,
                error: 'Configuración de PayU no disponible'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                merchantId,
                accountId,
                isTest,
                checkoutUrl: isTest
                    ? 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/'
                    : 'https://checkout.payulatam.com/ppp-web-gateway-payu/'
            }
        });
        
    } catch (error) {
        console.error('Error al obtener configuración:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener configuración'
        });
    }
};

export default {
    createPayment,
    generatePaymentForm,
    getTransactionStatus,
    createRefund,
    handlePayUCallback,
    handlePayUResponse,
    getOrderPaymentStatus,
    getPayUConfig
};
