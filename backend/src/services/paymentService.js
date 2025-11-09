import crypto from 'crypto';
import axios from 'axios';
import mongoose from 'mongoose';
import Order from '../models/Order.js';
import webhookService from './webhookService.js';
import orderAutomationService from './orderAutomationService.js';

/**
 * Servicio de Pagos con PayU (Colombia y Latinoamérica)
 * Documentación: https://developers.paymentsos.com/docs/api.html
 */

// Configuración de PayU
const getPayUConfig = () => {
    const config = {
        merchantId: process.env.PAYU_MERCHANT_ID,
        apiKey: process.env.PAYU_API_KEY,
        apiLogin: process.env.PAYU_API_LOGIN,
        accountId: process.env.PAYU_ACCOUNT_ID,
        baseUrl: process.env.NODE_ENV === 'production' 
            ? 'https://api.payulatam.com/payments-api/4.0/service.cgi'
            : 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi',
        isTest: process.env.NODE_ENV !== 'production'
    };
    
    // Validar configuración
    if (!config.merchantId || !config.apiKey || !config.apiLogin || !config.accountId) {
        throw new Error('Configuración de PayU incompleta. Verifica las variables de entorno.');
    }
    
    return config;
};

/**
 * Generar firma MD5 para PayU
 * @param {string} referenceCode - Referencia de la transacción
 * @param {number} amount - Monto total
 * @param {string} currency - Moneda (COP, USD, etc.)
 * @returns {string} - Firma MD5
 */
const normalizeAmount = (amount) => {
    if (typeof amount === 'number') {
        return amount.toFixed(2);
    }
    if (typeof amount === 'string') {
        const parsed = parseFloat(amount);
        if (!Number.isNaN(parsed)) {
            return parsed.toFixed(2);
        }
    }
    throw new Error('Monto inválido para generar firma');
};

const generateSignature = (referenceCode, amount, currency = 'USD') => {
    const config = getPayUConfig();
    const { apiKey, merchantId } = config;
    
    // Formato: ApiKey~merchantId~referenceCode~amount~currency
    const normalizedAmount = normalizeAmount(amount);
    const signatureString = `${apiKey}~${merchantId}~${referenceCode}~${normalizedAmount}~${currency}`;
    
    return crypto.createHash('md5').update(signatureString).digest('hex');
};

/**
 * Crear una transacción en PayU
 * @param {Object} orderData - Datos de la orden
 * @returns {Promise<Object>} - Respuesta de PayU
 */
export const createPayUTransaction = async (orderData) => {
    try {
        const config = getPayUConfig();
        
        const {
            orderId,
            amount,
            currency = 'USD',
            description,
            buyer,
            shippingAddress,
            paymentMethod = 'CREDIT_CARD'
        } = orderData;
        
        // Generar referencia única
        const referenceCode = orderId || `ORD-${Date.now()}`;
        
        // Generar firma
        const signature = generateSignature(referenceCode, amount, currency);
        
        // Construir request para PayU
        const payuRequest = {
            language: 'es',
            command: 'SUBMIT_TRANSACTION',
            merchant: {
                apiKey: config.apiKey,
                apiLogin: config.apiLogin
            },
            transaction: {
                order: {
                    accountId: config.accountId,
                    referenceCode: referenceCode,
                    description: description || `Orden SuperGains ${referenceCode}`,
                    language: 'es',
                    signature: signature,
                    notifyUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/payu-callback`,
                    additionalValues: {
                        TX_VALUE: {
                            value: parseFloat(normalizeAmount(amount)),
                            currency: currency
                        }
                    },
                    buyer: {
                        merchantBuyerId: buyer.id || '1',
                        fullName: buyer.fullName,
                        emailAddress: buyer.email,
                        contactPhone: buyer.phone || '3001234567',
                        dniNumber: buyer.document || '123456789',
                        shippingAddress: shippingAddress
                    }
                },
                type: 'AUTHORIZATION_AND_CAPTURE',
                paymentCountry: 'CO',
                ipAddress: '127.0.0.1',
                cookie: 'cookie_' + Date.now(),
                userAgent: 'SuperGains/1.0'
            },
            test: config.isTest
        };

        if (paymentMethod === 'PSE') {
            payuRequest.transaction.paymentMethod = 'PSE';
        }
        
        console.log(`📤 Creando transacción PayU: ${referenceCode} por $${amount} ${currency}`);
        
        // Enviar request a PayU
        const response = await axios.post(config.baseUrl, payuRequest, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const result = response.data;
        
        if (result.code === 'SUCCESS') {
            console.log(`✅ Transacción PayU creada: ${result.transactionResponse?.transactionId}`);
            
            return {
                success: true,
                transactionId: result.transactionResponse.transactionId,
                orderId: result.transactionResponse.orderId,
                state: result.transactionResponse.state,
                responseCode: result.transactionResponse.responseCode,
                paymentNetworkResponseCode: result.transactionResponse.paymentNetworkResponseCode,
                operationDate: result.transactionResponse.operationDate,
                referenceCode: referenceCode,
                message: result.transactionResponse.responseMessage || 'Transacción procesada'
            };
        } else {
            console.error(`❌ Error en transacción PayU: ${result.error}`);
            throw new Error(result.error || 'Error al procesar el pago');
        }
        
    } catch (error) {
        console.error('❌ Error al crear transacción PayU:', error.message);
        throw error;
    }
};

/**
 * Consultar el estado de una transacción
 * @param {string} transactionId - ID de la transacción en PayU
 * @returns {Promise<Object>} - Estado de la transacción
 */
export const getPayUTransactionStatus = async (transactionId) => {
    try {
        const config = getPayUConfig();
        
        const payuRequest = {
            language: 'es',
            command: 'TRANSACTION_RESPONSE_DETAIL',
            merchant: {
                apiKey: config.apiKey,
                apiLogin: config.apiLogin
            },
            details: {
                transactionId: transactionId
            },
            test: config.isTest
        };
        
        const response = await axios.post(config.baseUrl, payuRequest, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = response.data;
        
        if (result.code === 'SUCCESS') {
            return {
                success: true,
                transaction: result.result.payload
            };
        } else {
            throw new Error(result.error || 'Error al consultar transacción');
        }
        
    } catch (error) {
        console.error('❌ Error al consultar transacción PayU:', error.message);
        throw error;
    }
};

/**
 * Crear un reembolso (void o refund)
 * @param {string} transactionId - ID de la transacción
 * @param {string} orderId - ID de la orden en PayU
 * @param {string} reason - Razón del reembolso
 * @returns {Promise<Object>} - Resultado del reembolso
 */
export const createPayURefund = async (transactionId, orderId, reason = 'Cliente solicitó reembolso') => {
    try {
        const config = getPayUConfig();
        
        const payuRequest = {
            language: 'es',
            command: 'SUBMIT_TRANSACTION',
            merchant: {
                apiKey: config.apiKey,
                apiLogin: config.apiLogin
            },
            transaction: {
                order: {
                    id: orderId
                },
                type: 'REFUND',
                reason: reason,
                parentTransactionId: transactionId
            },
            test: config.isTest
        };
        
        const response = await axios.post(config.baseUrl, payuRequest, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = response.data;
        
        if (result.code === 'SUCCESS') {
            console.log(`✅ Reembolso PayU creado: ${result.transactionResponse?.transactionId}`);
            
            return {
                success: true,
                transactionId: result.transactionResponse.transactionId,
                state: result.transactionResponse.state,
                message: result.transactionResponse.responseMessage
            };
        } else {
            throw new Error(result.error || 'Error al procesar reembolso');
        }
        
    } catch (error) {
        console.error('❌ Error al crear reembolso PayU:', error.message);
        throw error;
    }
};

/**
 * Procesar confirmación de pago desde PayU (callback/webhook)
 * @param {Object} payuData - Datos de la confirmación
 * @returns {Promise<Object>} - Resultado del procesamiento
 */
export const processPayUConfirmation = async (payuData) => {
    try {
        const {
            merchant_id,
            state_pol,
            risk,
            response_code_pol,
            reference_sale,
            reference_pol,
            sign,
            value,
            currency,
            transaction_id,
            transaction_date
        } = payuData;
        
        console.log(`📥 Confirmación PayU recibida: ${reference_sale} - Estado: ${state_pol}`);
        
        // Verificar firma
        const config = getPayUConfig();
        const expectedSignature = crypto
            .createHash('md5')
            .update(`${config.apiKey}~${merchant_id}~${reference_sale}~${value}~${currency}~${state_pol}`)
            .digest('hex');
        
        if (sign !== expectedSignature) {
            console.error('❌ Firma inválida en confirmación PayU');
            throw new Error('Firma inválida');
        }
        
        // Buscar la orden por referencia
        const order = await Order.findById(reference_sale);
        
        if (!order) {
            console.warn(`⚠️ Orden no encontrada: ${reference_sale}`);
            return { success: false, message: 'Orden no encontrada' };
        }
        
        // Procesar según el estado
        switch (state_pol) {
            case '4': // Aprobada
                await handlePaymentSuccess(order, {
                    transactionId: transaction_id,
                    referenceCode: reference_pol,
                    amount: parseFloat(value),
                    currency: currency,
                    transactionDate: transaction_date,
                    responseCode: response_code_pol
                });
                break;
                
            case '6': // Rechazada
                await handlePaymentFailure(order, {
                    transactionId: transaction_id,
                    responseCode: response_code_pol,
                    transactionDate: transaction_date
                });
                break;
                
            case '5': // Expirada
            case '7': // Pendiente
                console.log(`ℹ️ Transacción en estado: ${state_pol} para orden ${order.orderNumber}`);
                break;
                
            default:
                console.warn(`⚠️ Estado desconocido: ${state_pol}`);
        }
        
        return {
            success: true,
            message: 'Confirmación procesada',
            orderId: order._id,
            orderNumber: order.orderNumber
        };
        
    } catch (error) {
        console.error('❌ Error al procesar confirmación PayU:', error);
        throw error;
    }
};

/**
 * Manejar pago exitoso
 * @private
 */
async function handlePaymentSuccess(order, paymentData) {
    try {
        // Actualizar estado de pago con toda la información
        await order.updatePaymentStatus('paid', {
            transactionId: paymentData.transactionId,
            payuReferenceCode: paymentData.referenceCode,
            payuResponseCode: paymentData.responseCode,
            amountPaid: paymentData.amount,
            paymentDate: new Date(paymentData.transactionDate),
            currency: paymentData.currency,
            cardLastFour: paymentData.cardLastFour,
            cardBrand: paymentData.cardBrand
        }, 'payu');
        
        // Procesar orden después del pago (transición automática de estado)
        await orderAutomationService.processOrderAfterPayment(order);
        
        // Actualizar inventario (descontar stock vendido)
        await updateInventoryAfterPayment(order);
        
        console.log(`✅ Orden ${order.orderNumber} marcada como PAGADA (PayU)`);
        console.log(`   Transaction ID: ${paymentData.transactionId}`);
        console.log(`   Monto: $${paymentData.amount} ${paymentData.currency}`);
        
        // Disparar webhooks de pago aprobado y orden pagada
        await Promise.all([
            webhookService.triggerEvent('payment.approved', {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                transactionId: paymentData.transactionId,
                amount: paymentData.amount,
                currency: paymentData.currency,
                paymentDate: paymentData.transactionDate,
                customer: {
                    userId: order.user._id?.toString() || order.user.toString(),
                    email: order.user.email || null
                }
            }),
            webhookService.triggerEvent('order.paid', {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                total: order.total,
                paymentStatus: 'Pagado',
                transactionId: paymentData.transactionId,
                paidAt: paymentData.transactionDate
            })
        ]);
        
        return {
            success: true,
            message: 'Pago procesado exitosamente',
            orderId: order._id,
            orderNumber: order.orderNumber
        };
    } catch (error) {
        console.error('❌ Error al procesar pago exitoso:', error);
        throw error;
    }
}

/**
 * Actualizar inventario después de un pago exitoso
 * @private
 */
async function updateInventoryAfterPayment(order) {
    try {
        const Inventory = mongoose.model('Inventory');
        
        for (const item of order.items) {
            if (!item.product) continue;
            
            const inventory = await Inventory.findOne({ product: item.product._id || item.product });
            
            if (inventory) {
                // Descontar el stock vendido
                inventory.quantityAvailable -= item.quantity;
                
                // Registrar movimiento
                inventory.movements.push({
                    type: 'sale',
                    quantity: item.quantity,
                    reason: `Venta - Orden ${order.orderNumber}`,
                    performedBy: order.user,
                    reference: order._id
                });
                
                await inventory.save();
                
                console.log(`   📦 Inventario actualizado: ${item.quantity} unidades descontadas`);
            }
        }
    } catch (error) {
        console.error('⚠️ Error al actualizar inventario después del pago:', error);
        // No lanzar error para no bloquear el proceso de pago
    }
}

/**
 * Manejar pago fallido
 * @private
 */
async function handlePaymentFailure(order, paymentData) {
    try {
        await order.updatePaymentStatus('failed', {
            transactionId: paymentData.transactionId,
            payuReferenceCode: paymentData.referenceCode,
            payuResponseCode: paymentData.responseCode,
            paymentDate: new Date(paymentData.transactionDate)
        }, 'payu');
        
        console.log(`❌ Pago fallido para orden ${order.orderNumber} (PayU)`);
        console.log(`   Transaction ID: ${paymentData.transactionId}`);
        console.log(`   Response Code: ${paymentData.responseCode}`);
        
        // Disparar webhook de pago rechazado
        await webhookService.triggerEvent('payment.rejected', {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            transactionId: paymentData.transactionId,
            responseCode: paymentData.responseCode,
            reason: 'Payment rejected by PayU',
            paymentDate: paymentData.transactionDate,
            customer: {
                userId: order.user._id?.toString() || order.user.toString(),
                email: order.user.email || null
            }
        });
        
        return {
            success: true,
            message: 'Pago fallido registrado',
            orderId: order._id,
            orderNumber: order.orderNumber
        };
    } catch (error) {
        console.error('❌ Error al procesar pago fallido:', error);
        throw error;
    }
}

/**
 * Generar formulario de pago HTML para PayU
 * @param {Object} orderData - Datos de la orden
 * @returns {string} - HTML del formulario
 */
export const generatePayUForm = (orderData) => {
    const config = getPayUConfig();
    const {
        orderId,
        amount,
        currency = 'USD',
        description,
        buyer,
        paymentMethod
    } = orderData;
    
    const referenceCode = orderId;
    const signature = generateSignature(referenceCode, amount, currency);
    
    const formUrl = config.isTest
        ? 'https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/'
        : 'https://checkout.payulatam.com/ppp-web-gateway-payu/';
    
    const confirmationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-confirmation`;
    const responseUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/payu-callback`;
    
    const baseFormData = {
        formUrl,
        formData: {
            merchantId: config.merchantId,
            accountId: config.accountId,
            description: description || `Orden SuperGains ${referenceCode}`,
            referenceCode: referenceCode,
            amount: normalizeAmount(amount),
            tax: '0',
            taxReturnBase: '0',
            currency: currency,
            signature: signature,
            test: config.isTest ? '1' : '0',
            buyerEmail: buyer.email,
            buyerFullName: buyer.fullName,
            telephone: buyer.phone || '3001234567',
            responseUrl: responseUrl,
            confirmationUrl: confirmationUrl
        }
    };

    if (paymentMethod === 'PSE') {
        baseFormData.formData.paymentMethod = 'PSE';
    }

    return baseFormData;
};

export default {
    createPayUTransaction,
    getPayUTransactionStatus,
    createPayURefund,
    processPayUConfirmation,
    generatePayUForm,
    generateSignature
};
