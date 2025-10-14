import crypto from 'crypto';
import Webhook from '../models/Webhook.js';

/**
 * Middleware para validar firma HMAC de webhooks entrantes
 */
export const validateIncomingWebhookSignature = async (req, res, next) => {
    try {
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const webhookId = req.headers['x-webhook-id'];
        
        // Validar headers requeridos
        if (!signature) {
            return res.status(401).json({
                success: false,
                error: 'Header X-Webhook-Signature faltante'
            });
        }
        
        if (!timestamp) {
            return res.status(401).json({
                success: false,
                error: 'Header X-Webhook-Timestamp faltante'
            });
        }
        
        if (!webhookId) {
            return res.status(401).json({
                success: false,
                error: 'Header X-Webhook-Id faltante'
            });
        }
        
        // Validar timestamp (no más de 5 minutos de antigüedad)
        const now = Date.now();
        const age = now - parseInt(timestamp);
        const maxAge = 5 * 60 * 1000; // 5 minutos
        
        if (age > maxAge) {
            return res.status(401).json({
                success: false,
                error: 'Webhook expirado (timestamp muy antiguo)',
                age: Math.floor(age / 1000) + ' segundos',
                maxAge: Math.floor(maxAge / 1000) + ' segundos'
            });
        }
        
        if (age < 0) {
            return res.status(401).json({
                success: false,
                error: 'Timestamp inválido (fecha futura)'
            });
        }
        
        // Buscar webhook por ID para obtener el secret
        const webhook = await Webhook.findById(webhookId).select('+secret');
        
        if (!webhook) {
            return res.status(404).json({
                success: false,
                error: 'Webhook no encontrado'
            });
        }
        
        // Verificar que el webhook esté activo
        if (webhook.status !== 'active') {
            return res.status(403).json({
                success: false,
                error: `Webhook está en estado: ${webhook.status}`
            });
        }
        
        // Generar firma esperada
        const data = timestamp + '.' + JSON.stringify(req.body);
        const expectedSignature = crypto
            .createHmac('sha256', webhook.secret)
            .update(data)
            .digest('hex');
        
        // Comparar firmas (timing-safe comparison)
        const signaturesMatch = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
        
        if (!signaturesMatch) {
            console.error('❌ Firma de webhook inválida');
            console.error(`   Recibida: ${signature}`);
            console.error(`   Esperada: ${expectedSignature}`);
            
            return res.status(401).json({
                success: false,
                error: 'Firma de webhook inválida'
            });
        }
        
        console.log('✅ Firma de webhook validada correctamente');
        
        // Agregar webhook al request para uso posterior
        req.webhook = webhook;
        
        next();
        
    } catch (error) {
        console.error('Error al validar firma de webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar webhook'
        });
    }
};

/**
 * Validar datos de creación de webhook
 */
export const validateWebhookCreation = (req, res, next) => {
    try {
        const { name, url, events } = req.body;
        const errors = [];
        
        // Validar nombre
        if (!name || name.trim().length === 0) {
            errors.push('El nombre es requerido');
        } else if (name.length > 100) {
            errors.push('El nombre no puede exceder 100 caracteres');
        }
        
        // Validar URL
        if (!url || url.trim().length === 0) {
            errors.push('La URL es requerida');
        } else if (!/^https?:\/\/.+/.test(url)) {
            errors.push('La URL debe ser válida (http:// o https://)');
        }
        
        // Validar eventos
        if (!events || !Array.isArray(events) || events.length === 0) {
            errors.push('Debe seleccionar al menos un evento');
        }
        
        const validEvents = [
            'order.created',
            'order.paid',
            'order.shipped',
            'order.delivered',
            'order.cancelled',
            'payment.approved',
            'payment.rejected',
            'payment.refunded',
            'inventory.low_stock',
            'inventory.out_of_stock',
            'inventory.restocked',
            'user.registered',
            'customer.segment_changed',
            'alert.triggered'
        ];
        
        const invalidEvents = events?.filter(e => !validEvents.includes(e)) || [];
        if (invalidEvents.length > 0) {
            errors.push(`Eventos inválidos: ${invalidEvents.join(', ')}`);
        }
        
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Errores de validación',
                errors: errors,
                validEvents: validEvents
            });
        }
        
        next();
        
    } catch (error) {
        console.error('Error al validar webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar datos'
        });
    }
};

/**
 * Validar actualización de webhook
 */
export const validateWebhookUpdate = (req, res, next) => {
    try {
        const { name, url, events, status } = req.body;
        const errors = [];
        
        // Validar nombre si se proporciona
        if (name !== undefined) {
            if (name.trim().length === 0) {
                errors.push('El nombre no puede estar vacío');
            } else if (name.length > 100) {
                errors.push('El nombre no puede exceder 100 caracteres');
            }
        }
        
        // Validar URL si se proporciona
        if (url !== undefined) {
            if (url.trim().length === 0) {
                errors.push('La URL no puede estar vacía');
            } else if (!/^https?:\/\/.+/.test(url)) {
                errors.push('La URL debe ser válida (http:// o https://)');
            }
        }
        
        // Validar eventos si se proporcionan
        if (events !== undefined) {
            if (!Array.isArray(events) || events.length === 0) {
                errors.push('Debe haber al menos un evento');
            }
        }
        
        // Validar status si se proporciona
        if (status !== undefined) {
            const validStatuses = ['active', 'inactive', 'failed'];
            if (!validStatuses.includes(status)) {
                errors.push(`Status inválido. Valores válidos: ${validStatuses.join(', ')}`);
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
        console.error('Error al validar actualización:', error);
        res.status(500).json({
            success: false,
            error: 'Error al validar datos'
        });
    }
};

export default {
    validateIncomingWebhookSignature,
    validateWebhookCreation,
    validateWebhookUpdate
};

