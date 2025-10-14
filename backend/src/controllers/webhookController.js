import Webhook from '../models/Webhook.js';
import webhookService from '../services/webhookService.js';
import mongoose from 'mongoose';

/**
 * Crear un nuevo webhook
 * POST /api/webhooks
 */
export const createWebhook = async (req, res) => {
    try {
        const { name, url, events, headers } = req.body;
        const userId = req.user.id;
        
        // Validar datos requeridos
        if (!name || !url || !events || events.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, URL y al menos un evento son requeridos'
            });
        }
        
        // Generar secret único
        const secret = webhookService.generateWebhookSecret();
        
        // Crear webhook
        const webhook = new Webhook({
            name,
            url,
            events,
            secret,
            headers: headers || {},
            createdBy: userId,
            status: 'active'
        });
        
        await webhook.save();
        
        // Devolver webhook con el secret (solo una vez)
        const webhookData = webhook.toObject();
        webhookData.secret = secret; // Incluir secret en la respuesta
        
        res.status(201).json({
            success: true,
            data: webhookData,
            message: 'Webhook creado exitosamente. Guarda el secret de forma segura, no se mostrará de nuevo.'
        });
        
    } catch (error) {
        console.error('Error al crear webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al crear webhook'
        });
    }
};

/**
 * Obtener todos los webhooks
 * GET /api/webhooks
 */
export const getWebhooks = async (req, res) => {
    try {
        const { status, event } = req.query;
        
        const query = {};
        
        // Filtrar por status si se proporciona
        if (status) {
            query.status = status;
        }
        
        // Filtrar por evento si se proporciona
        if (event) {
            query.events = event;
        }
        
        // Si no es admin, solo mostrar webhooks propios
        if (req.user.rol !== 'admin') {
            query.createdBy = req.user.id;
        }
        
        const webhooks = await Webhook.find(query)
            .populate('createdBy', 'nombre email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            data: webhooks,
            count: webhooks.length
        });
        
    } catch (error) {
        console.error('Error al obtener webhooks:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener webhooks'
        });
    }
};

/**
 * Obtener un webhook por ID
 * GET /api/webhooks/:id
 */
export const getWebhookById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID de webhook inválido'
            });
        }
        
        const webhook = await Webhook.findById(id)
            .populate('createdBy', 'nombre email');
        
        if (!webhook) {
            return res.status(404).json({
                success: false,
                error: 'Webhook no encontrado'
            });
        }
        
        // Verificar permisos
        if (req.user.rol !== 'admin' && webhook.createdBy._id.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para ver este webhook'
            });
        }
        
        res.status(200).json({
            success: true,
            data: webhook
        });
        
    } catch (error) {
        console.error('Error al obtener webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener webhook'
        });
    }
};

/**
 * Actualizar un webhook
 * PUT /api/webhooks/:id
 */
export const updateWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, url, events, headers, status } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID de webhook inválido'
            });
        }
        
        const webhook = await Webhook.findById(id);
        
        if (!webhook) {
            return res.status(404).json({
                success: false,
                error: 'Webhook no encontrado'
            });
        }
        
        // Verificar permisos
        if (req.user.rol !== 'admin' && webhook.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para modificar este webhook'
            });
        }
        
        // Actualizar campos permitidos
        if (name) webhook.name = name;
        if (url) webhook.url = url;
        if (events) webhook.events = events;
        if (headers) webhook.headers = headers;
        if (status) webhook.status = status;
        
        await webhook.save();
        
        res.status(200).json({
            success: true,
            data: webhook,
            message: 'Webhook actualizado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al actualizar webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al actualizar webhook'
        });
    }
};

/**
 * Eliminar un webhook
 * DELETE /api/webhooks/:id
 */
export const deleteWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID de webhook inválido'
            });
        }
        
        const webhook = await Webhook.findById(id);
        
        if (!webhook) {
            return res.status(404).json({
                success: false,
                error: 'Webhook no encontrado'
            });
        }
        
        // Verificar permisos
        if (req.user.rol !== 'admin' && webhook.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para eliminar este webhook'
            });
        }
        
        await Webhook.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Webhook eliminado exitosamente'
        });
        
    } catch (error) {
        console.error('Error al eliminar webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar webhook'
        });
    }
};

/**
 * Probar un webhook (enviar evento de prueba)
 * POST /api/webhooks/:id/test
 */
export const testWebhook = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: 'ID de webhook inválido'
            });
        }
        
        const webhook = await Webhook.findById(id);
        
        if (!webhook) {
            return res.status(404).json({
                success: false,
                error: 'Webhook no encontrado'
            });
        }
        
        // Verificar permisos
        if (req.user.rol !== 'admin' && webhook.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para probar este webhook'
            });
        }
        
        // Enviar evento de prueba
        const testPayload = {
            message: 'Este es un evento de prueba',
            timestamp: new Date().toISOString(),
            webhookId: webhook._id,
            webhookName: webhook.name
        };
        
        const success = await webhookService.sendWebhookNotification(
            webhook,
            'test.event',
            testPayload
        );
        
        if (success) {
            res.status(200).json({
                success: true,
                message: 'Webhook de prueba enviado exitosamente',
                data: {
                    url: webhook.url,
                    sent: true
                }
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Error al enviar webhook de prueba',
                lastError: webhook.statistics.lastError
            });
        }
        
    } catch (error) {
        console.error('Error al probar webhook:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al probar webhook'
        });
    }
};

/**
 * Recibir evento de webhook externo
 * POST /api/webhooks/receive/:event
 * Endpoint público pero requiere firma válida
 */
export const receiveWebhookEvent = async (req, res) => {
    try {
        const { event } = req.params;
        const signature = req.headers['x-webhook-signature'];
        const timestamp = req.headers['x-webhook-timestamp'];
        const webhookSecret = req.headers['x-webhook-secret'];
        
        // Validar headers requeridos
        if (!signature || !timestamp || !webhookSecret) {
            return res.status(400).json({
                success: false,
                error: 'Headers de webhook faltantes (x-webhook-signature, x-webhook-timestamp, x-webhook-secret)'
            });
        }
        
        // Verificar firma
        const isValid = webhookService.verifyWebhookSignature(
            webhookSecret,
            signature,
            parseInt(timestamp),
            req.body
        );
        
        if (!isValid) {
            return res.status(401).json({
                success: false,
                error: 'Firma de webhook inválida'
            });
        }
        
        console.log(`📥 Webhook recibido: ${event}`);
        console.log('   Datos:', req.body);
        
        // Aquí puedes procesar el evento según sea necesario
        // Por ahora solo lo registramos
        
        res.status(200).json({
            success: true,
            message: 'Webhook recibido y procesado',
            event,
            receivedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error al recibir webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar webhook'
        });
    }
};

/**
 * Obtener estadísticas de webhooks
 * GET /api/webhooks/stats
 */
export const getWebhookStats = async (req, res) => {
    try {
        const stats = await Webhook.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalCalls: { $sum: '$statistics.totalCalls' },
                    successfulCalls: { $sum: '$statistics.successfulCalls' },
                    failedCalls: { $sum: '$statistics.failedCalls' }
                }
            }
        ]);
        
        // Contar eventos únicos
        const eventStats = await Webhook.aggregate([
            { $unwind: '$events' },
            {
                $group: {
                    _id: '$events',
                    webhookCount: { $sum: 1 }
                }
            },
            { $sort: { webhookCount: -1 } }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                byStatus: stats,
                byEvent: eventStats,
                totalWebhooks: await Webhook.countDocuments()
            }
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas'
        });
    }
};

export default {
    createWebhook,
    getWebhooks,
    getWebhookById,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    receiveWebhookEvent,
    getWebhookStats
};

