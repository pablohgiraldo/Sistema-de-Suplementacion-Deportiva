import axios from 'axios';
import crypto from 'crypto';
import Webhook from '../models/Webhook.js';

/**
 * Servicio de Webhooks para notificaciones automáticas
 */

/**
 * Enviar notificación a un webhook
 * @param {Object} webhook - Webhook al que enviar
 * @param {string} eventName - Nombre del evento
 * @param {Object} payload - Datos del evento
 * @returns {Promise<boolean>} - true si fue exitoso
 */
const sendWebhookNotification = async (webhook, eventName, payload) => {
    try {
        // Generar firma HMAC para verificación
        const timestamp = Date.now();
        const signature = generateSignature(webhook.secret, timestamp, payload);
        
        // Preparar headers
        const headers = {
            'Content-Type': 'application/json',
            'X-Webhook-Event': eventName,
            'X-Webhook-Signature': signature,
            'X-Webhook-Timestamp': timestamp.toString(),
            'User-Agent': 'SuperGains-Webhook/1.0',
            ...Object.fromEntries(webhook.headers || [])
        };
        
        // Preparar body
        const body = {
            event: eventName,
            timestamp: new Date(timestamp).toISOString(),
            data: payload
        };
        
        // Enviar webhook con timeout
        const response = await axios.post(webhook.url, body, {
            headers,
            timeout: 10000, // 10 segundos
            maxRedirects: 0 // No seguir redirects
        });
        
        // Registrar éxito
        await webhook.recordCall(true);
        
        console.log(`✅ Webhook enviado: ${eventName} → ${webhook.url} (${response.status})`);
        
        return true;
        
    } catch (error) {
        // Registrar fallo
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        await webhook.recordCall(false, errorMessage);
        
        console.error(`❌ Error al enviar webhook: ${eventName} → ${webhook.url}`);
        console.error(`   Razón: ${errorMessage}`);
        
        return false;
    }
};

/**
 * Enviar notificación con reintentos
 * @param {Object} webhook - Webhook al que enviar
 * @param {string} eventName - Nombre del evento
 * @param {Object} payload - Datos del evento
 * @returns {Promise<boolean>} - true si fue exitoso
 */
const sendWebhookWithRetry = async (webhook, eventName, payload) => {
    const maxRetries = webhook.retryPolicy?.maxRetries || 3;
    const retryDelay = webhook.retryPolicy?.retryDelay || 5000;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const success = await sendWebhookNotification(webhook, eventName, payload);
        
        if (success) {
            return true;
        }
        
        // Si no es el último intento, esperar antes de reintentar
        if (attempt < maxRetries) {
            console.log(`   🔄 Reintentando (${attempt}/${maxRetries}) en ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
    }
    
    console.error(`   ❌ Webhook falló después de ${maxRetries} intentos`);
    return false;
};

/**
 * Disparar evento a todos los webhooks suscritos
 * @param {string} eventName - Nombre del evento
 * @param {Object} payload - Datos del evento
 * @returns {Promise<Object>} - Resultado del envío
 */
export const triggerEvent = async (eventName, payload) => {
    try {
        // Buscar webhooks activos suscritos a este evento
        const webhooks = await Webhook.find({
            status: 'active',
            events: eventName
        });
        
        if (webhooks.length === 0) {
            console.log(`ℹ️ No hay webhooks suscritos al evento: ${eventName}`);
            return {
                success: true,
                message: 'No hay webhooks suscritos',
                sent: 0,
                failed: 0
            };
        }
        
        console.log(`📤 Disparando evento: ${eventName} (${webhooks.length} webhooks)`);
        
        // Enviar a todos los webhooks en paralelo
        const results = await Promise.allSettled(
            webhooks.map(webhook => sendWebhookWithRetry(webhook, eventName, payload))
        );
        
        // Contar resultados
        const sent = results.filter(r => r.status === 'fulfilled' && r.value === true).length;
        const failed = results.filter(r => r.status === 'rejected' || r.value === false).length;
        
        console.log(`📊 Webhooks enviados: ${sent}/${webhooks.length} exitosos, ${failed} fallidos`);
        
        return {
            success: true,
            event: eventName,
            sent,
            failed,
            total: webhooks.length
        };
        
    } catch (error) {
        console.error(`❌ Error al disparar evento ${eventName}:`, error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Generar firma HMAC-SHA256 para webhook
 * @param {string} secret - Secret del webhook
 * @param {number} timestamp - Timestamp de la petición
 * @param {Object} payload - Datos a enviar
 * @returns {string} - Firma en hexadecimal
 */
const generateSignature = (secret, timestamp, payload) => {
    const data = timestamp + '.' + JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
};

/**
 * Verificar firma de un webhook entrante
 * @param {string} secret - Secret del webhook
 * @param {string} signature - Firma recibida
 * @param {number} timestamp - Timestamp recibido
 * @param {Object} payload - Datos recibidos
 * @returns {boolean} - true si la firma es válida
 */
export const verifyWebhookSignature = (secret, signature, timestamp, payload) => {
    // Validar que el timestamp no sea muy antiguo (5 minutos)
    const now = Date.now();
    const age = now - timestamp;
    
    if (age > 5 * 60 * 1000) {
        console.error('❌ Webhook expirado (timestamp muy antiguo)');
        return false;
    }
    
    // Generar firma esperada
    const expectedSignature = generateSignature(secret, timestamp, payload);
    
    // Comparar firmas
    return signature === expectedSignature;
};

/**
 * Obtener webhooks activos para un evento
 * @param {string} eventName - Nombre del evento
 * @returns {Promise<Array>} - Lista de webhooks
 */
export const getActiveWebhooksForEvent = async (eventName) => {
    return await Webhook.find({
        status: 'active',
        events: eventName
    });
};

/**
 * Generar secret aleatorio para webhook
 * @returns {string} - Secret en hexadecimal
 */
export const generateWebhookSecret = () => {
    return crypto.randomBytes(32).toString('hex');
};

export default {
    triggerEvent,
    verifyWebhookSignature,
    getActiveWebhooksForEvent,
    generateWebhookSecret,
    sendWebhookNotification,
    sendWebhookWithRetry
};

