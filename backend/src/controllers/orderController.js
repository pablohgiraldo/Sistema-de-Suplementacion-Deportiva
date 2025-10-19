import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Inventory from '../models/Inventory.js';
import mongoose from 'mongoose';
import { syncCustomerAfterOrder } from '../services/customerSyncService.js';
import webhookService from '../services/webhookService.js';
import notificationService from '../services/notificationService.js';

// Función helper para detectar la marca de tarjeta
function getCardBrand(cardNumber) {
    const number = cardNumber.replace(/\s/g, '');

    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';

    return 'other';
}

// Crear una nueva orden desde el carrito
export async function createOrder(req, res) {
    try {
        const userId = req.user.id;
        const {
            paymentMethod,
            shippingAddress,
            notes = ''
        } = req.body;

        // Validar datos requeridos
        if (!paymentMethod || !shippingAddress) {
            return res.status(400).json({
                success: false,
                error: 'Método de pago y dirección de envío son requeridos'
            });
        }

        // Obtener carrito del usuario
        const cart = await Cart.findOne({ user: userId }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'El carrito está vacío. Agrega productos al carrito antes de crear una orden.'
            });
        }

        // Verificar stock disponible para todos los productos
        const stockValidation = [];
        for (const item of cart.items) {
            const inventory = await Inventory.findOne({ product: item.product._id });
            if (!inventory || inventory.availableStock < item.quantity) {
                stockValidation.push({
                    product: item.product.name,
                    requested: item.quantity,
                    available: inventory ? inventory.availableStock : 0
                });
            }
        }

        if (stockValidation.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Stock insuficiente para algunos productos',
                details: stockValidation
            });
        }

        // Crear la orden con datos completos
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        }));

        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = Math.round((subtotal * 0.19) * 100) / 100; // IVA 19% sobre USD, redondeado a centavos
        const shipping = subtotal > 100 ? 0 : 2.5; // Envío gratis sobre $100 USD, costo $2.50 USD
        const total = Math.round((subtotal + tax + shipping) * 100) / 100; // Redondeado a centavos

        // Extraer datos de pago si es tarjeta de crédito
        let paymentDetails = {};
        if (paymentMethod === 'credit_card' && req.body.cardNumber) {
            const cardNumber = req.body.cardNumber.replace(/\s/g, '');
            paymentDetails = {
                cardLastFour: cardNumber.slice(-4),
                cardBrand: getCardBrand(cardNumber),
                currency: 'USD'
            };
        }

        const order = new Order({
            user: userId,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            total,
            paymentMethod,
            shippingAddress,
            billingAddress: req.body.billingAddress || null, // Opcional
            notes,
            paymentDetails,
            status: 'pending',
            paymentStatus: 'pending'
        });

        // Validar datos de la orden antes de guardar
        const validationErrors = order.validateOrderData();
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'Datos de la orden inválidos',
                details: validationErrors
            });
        }

        await order.save();

        // Disparar webhook de orden creada
        await webhookService.triggerEvent('order.created', {
            orderId: order._id.toString(),
            orderNumber: order.orderNumber,
            total: order.total,
            itemCount: order.items.length,
            customer: {
                userId: userId,
                email: user.email,
                name: user.nombre
            },
            createdAt: order.createdAt
        });

        // Actualizar inventario (reservar stock)
        for (const item of cart.items) {
            await Inventory.findOneAndUpdate(
                { product: item.product._id },
                {
                    $inc: {
                        availableStock: -item.quantity,
                        reservedStock: item.quantity
                    }
                }
            );
        }

        // Sincronizar customer automáticamente después de crear la orden
        try {
            await syncCustomerAfterOrder(userId, order);
            console.log(`📊 Customer sincronizado automáticamente para orden ${order.orderNumber}`);
        } catch (syncError) {
            console.error('⚠️  Error al sincronizar customer (no crítico):', syncError);
            // No bloqueamos la creación de la orden si falla la sincronización
        }

        // Limpiar carrito
        await cart.clearCart();

        // Poblar datos para respuesta
        await order.populate([
            { path: 'user', select: 'nombre email' },
            { path: 'items.product', select: 'name brand imageUrl' }
        ]);

        // Crear respuesta completa con resumen
        const orderSummary = order.getOrderSummary();

        res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            data: {
                ...order.toObject(),
                summary: orderSummary
            },
            metadata: {
                orderNumber: order.orderNumber,
                total: order.total,
                itemCount: order.itemCount,
                status: order.status,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
                estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 días estimados
            }
        });

    } catch (error) {
        console.error('Error al crear orden:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al crear la orden',
            details: error.message
        });
    }
}

// Obtener todas las órdenes (admin) o órdenes del usuario
export async function getOrders(req, res) {
    try {
        const {
            status,
            paymentStatus,
            startDate,
            endDate,
            limit = 20,
            page = 1
        } = req.query;

        const userId = req.user.id;
        const userRole = req.user.rol;

        // Construir query
        let query = {};

        // Si no es admin, solo mostrar órdenes del usuario
        if (userRole !== 'admin') {
            query.user = userId;
        }
        // Si es admin, query queda vacío para mostrar todas las órdenes

        // Filtros opcionales
        if (status) {
            query.status = status;
        }
        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // Configurar paginación
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;

        // Ejecutar consulta
        const orders = await Order.find(query)
            .populate('user', 'nombre email')
            .populate('items.product', 'name brand imageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalOrders = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalOrders / limitNum),
                totalOrders,
                hasNext: pageNum < Math.ceil(totalOrders / limitNum),
                hasPrev: pageNum > 1
            }
        });

    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener las órdenes'
        });
    }
}

// Obtener una orden específica
export async function getOrderById(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.rol;

        const order = await Order.findById(id)
            .populate('user', 'nombre email')
            .populate('items.product', 'name brand imageUrl description')
            .populate('processedBy', 'nombre email');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }

        // Verificar permisos
        if (userRole !== 'admin' && order.user._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para ver esta orden'
            });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error al obtener orden:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener la orden'
        });
    }
}

// Actualizar estado de una orden (solo admin)
export async function updateOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const userId = req.user.id;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }

        // Validar estado
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Estado de orden inválido'
            });
        }

        // Guardar estado anterior antes de actualizar
        const oldStatus = order.status;

        // Actualizar estado
        await order.updateStatus(status, userId);

        // Si se cancela la orden, liberar stock
        if (status === 'cancelled') {
            for (const item of order.items) {
                await Inventory.findOneAndUpdate(
                    { product: item.product },
                    {
                        $inc: {
                            availableStock: item.quantity,
                            reservedStock: -item.quantity
                        }
                    }
                );
            }
        }

        // Si se marca como entregada, liberar stock reservado
        if (status === 'delivered') {
            for (const item of order.items) {
                await Inventory.findOneAndUpdate(
                    { product: item.product },
                    { $inc: { reservedStock: -item.quantity } }
                );
            }
        }

        // Actualizar notas si se proporcionan
        if (notes) {
            order.notes = notes;
            await order.save();
        }

        // Sincronizar customer si la orden se completó o canceló
        if (['delivered', 'cancelled'].includes(status)) {
            try {
                await syncCustomerAfterOrder(order.user, order);
                console.log(`📊 Customer sincronizado automáticamente tras actualización de orden ${order.orderNumber}`);
            } catch (syncError) {
                console.error('⚠️  Error al sincronizar customer (no crítico):', syncError);
            }
        }

        // Disparar webhooks según el estado
        const webhookEvents = {
            'shipped': 'order.shipped',
            'delivered': 'order.delivered',
            'cancelled': 'order.cancelled'
        };

        if (webhookEvents[status]) {
            await webhookService.triggerEvent(webhookEvents[status], {
                orderId: order._id.toString(),
                orderNumber: order.orderNumber,
                status: order.statusFormatted,
                paymentStatus: order.paymentStatusFormatted,
                total: order.total,
                updatedBy: userId,
                updatedAt: new Date().toISOString()
            });
        }

        // Enviar notificación por email al cliente
        if (oldStatus !== status && ['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
            try {
                // Obtener datos del usuario antes de popular
                const user = await User.findById(order.user);
                if (user && user.email) {
                    notificationService.addToQueue({
                        type: 'order_status_change',
                        data: {
                            order: {
                                _id: order._id,
                                orderNumber: order.orderNumber,
                                total: order.total,
                                trackingNumber: order.trackingNumber,
                                carrier: order.carrier,
                                trackingUrl: order.trackingUrl,
                                shippingAddress: order.shippingAddress
                            },
                            customerEmail: user.email,
                            customerName: user.nombre || user.email,
                            oldStatus: oldStatus,
                            newStatus: status
                        }
                    });
                    console.log(`📧 Email de cambio de estado encolado para ${user.email}`);
                }
            } catch (emailError) {
                console.error('⚠️  Error al encolar email de cambio de estado (no crítico):', emailError);
            }
        }

        await order.populate([
            { path: 'user', select: 'nombre email' },
            { path: 'items.product', select: 'name brand imageUrl' },
            { path: 'processedBy', select: 'nombre email' }
        ]);

        res.json({
            success: true,
            message: 'Estado de orden actualizado exitosamente',
            data: order
        });

    } catch (error) {
        console.error('Error al actualizar estado de orden:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al actualizar la orden'
        });
    }
}

// Actualizar estado de pago (solo admin)
export async function updatePaymentStatus(req, res) {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }

        // Validar estado de pago
        const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!validStatuses.includes(paymentStatus)) {
            return res.status(400).json({
                success: false,
                error: 'Estado de pago inválido'
            });
        }

        await order.updatePaymentStatus(paymentStatus);

        await order.populate([
            { path: 'user', select: 'nombre email' },
            { path: 'items.product', select: 'name brand imageUrl' }
        ]);

        res.json({
            success: true,
            message: 'Estado de pago actualizado exitosamente',
            data: order
        });

    } catch (error) {
        console.error('Error al actualizar estado de pago:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al actualizar el estado de pago'
        });
    }
}

// Obtener estadísticas de ventas (solo admin)
export async function getSalesStats(req, res) {
    try {
        const { startDate, endDate } = req.query;

        const stats = await Order.getSalesStats(startDate, endDate);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de ventas:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener estadísticas'
        });
    }
}

// Obtener ventas por período (solo admin)
export async function getSalesByPeriod(req, res) {
    try {
        const { startDate, endDate, groupBy = 'day' } = req.query;

        const sales = await Order.getSalesByPeriod(startDate, endDate, groupBy);

        res.json({
            success: true,
            data: sales
        });

    } catch (error) {
        console.error('Error al obtener ventas por período:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener ventas por período'
        });
    }
}

// Obtener productos más vendidos (solo admin)
export async function getTopSellingProducts(req, res) {
    try {
        const { startDate, endDate, limit = 10 } = req.query;

        const matchStage = {};
        if (startDate || endDate) {
            matchStage.createdAt = {};
            if (startDate) matchStage.createdAt.$gte = new Date(startDate);
            if (endDate) matchStage.createdAt.$lte = new Date(endDate);
        }

        const topProducts = await Order.aggregate([
            { $match: matchStage },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: '$items.subtotal' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    product: {
                        _id: '$product._id',
                        name: '$product.name',
                        brand: '$product.brand',
                        imageUrl: '$product.imageUrl'
                    },
                    totalQuantity: 1,
                    totalRevenue: 1,
                    orderCount: 1
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: parseInt(limit) || 10 }
        ]);

        res.json({
            success: true,
            data: topProducts
        });

    } catch (error) {
        console.error('Error al obtener productos más vendidos:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener productos más vendidos'
        });
    }
}

// Obtener resumen básico de ventas (solo admin)
export async function getOrdersSummary(req, res) {
    try {
        const { startDate, endDate } = req.query;

        // Construir filtro de fecha si se proporciona
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // Obtener estadísticas básicas
        const [
            totalOrders,
            totalRevenue,
            ordersByStatus,
            ordersByPaymentStatus,
            recentOrders
        ] = await Promise.all([
            // Total de órdenes
            Order.countDocuments(dateFilter),

            // Ingresos totales
            Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: null, total: { $sum: '$total' } } }
            ]),

            // Órdenes por estado
            Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Órdenes por estado de pago
            Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]),

            // Órdenes recientes (últimas 5)
            Order.find(dateFilter)
                .populate('user', 'nombre email')
                .populate('items.product', 'name brand')
                .sort({ createdAt: -1 })
                .limit(5)
                .select('orderNumber user total status paymentStatus createdAt')
        ]);

        // Calcular ingresos totales
        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Calcular promedio por orden
        const averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;


        // Formatear datos de estado
        const statusSummary = ordersByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        const paymentStatusSummary = ordersByPaymentStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                summary: {
                    totalOrders,
                    totalRevenue: revenue,
                    averageOrderValue: Math.round(averageOrderValue * 100) / 100
                },
                statusBreakdown: {
                    orders: statusSummary,
                    payments: paymentStatusSummary
                },
                recentOrders: recentOrders.map(order => ({
                    orderNumber: order.orderNumber,
                    customer: order.user?.nombre || 'Usuario eliminado', // ✅ Validación para usuario eliminado
                    total: order.total,
                    status: order.status,
                    paymentStatus: order.paymentStatus,
                    createdAt: order.createdAt,
                    itemCount: order.items.length
                })),
                period: {
                    startDate: startDate || null,
                    endDate: endDate || null
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener resumen de órdenes:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener el resumen de órdenes'
        });
    }
}

// Cancelar orden (usuario o admin)
export async function cancelOrder(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.rol;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }

        // Verificar permisos
        if (userRole !== 'admin' && order.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para cancelar esta orden'
            });
        }

        // Solo permitir cancelar órdenes pendientes o en procesamiento
        if (!['pending', 'processing'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: 'Solo se pueden cancelar órdenes pendientes o en procesamiento'
            });
        }

        // Actualizar estado
        await order.updateStatus('cancelled', userId);

        // Liberar stock reservado
        for (const item of order.items) {
            await Inventory.findOneAndUpdate(
                { product: item.product },
                {
                    $inc: {
                        availableStock: item.quantity,
                        reservedStock: -item.quantity
                    }
                }
            );
        }

        // Sincronizar customer tras cancelación
        try {
            await syncCustomerAfterOrder(order.user, order);
            console.log(`📊 Customer sincronizado automáticamente tras cancelación de orden ${order.orderNumber}`);
        } catch (syncError) {
            console.error('⚠️  Error al sincronizar customer (no crítico):', syncError);
        }

        await order.populate([
            { path: 'user', select: 'nombre email' },
            { path: 'items.product', select: 'name brand imageUrl' }
        ]);

        res.json({
            success: true,
            message: 'Orden cancelada exitosamente',
            data: order
        });

    } catch (error) {
        console.error('Error al cancelar orden:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al cancelar la orden'
        });
    }
}

/**
 * Obtener estado detallado de una orden (tracking)
 * GET /api/orders/:id/status
 */
export async function getOrderStatus(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.rol;

        // Buscar la orden
        const order = await Order.findById(id)
            .populate('user', 'nombre email')
            .populate('items.product', 'name brand imageUrl')
            .populate('processedBy', 'nombre')
            .populate({
                path: 'statusHistory.updatedBy',
                select: 'nombre'
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }

        // Verificar permisos (solo el dueño de la orden o admin)
        if (userRole !== 'admin' && order.user._id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'No tienes permisos para ver esta orden'
            });
        }

        // Calcular progreso
        const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = statusOrder.indexOf(order.status);
        const progress = order.status === 'cancelled' ? 0 : ((currentIndex + 1) / statusOrder.length * 100);

        // Preparar respuesta con tracking completo
        const trackingInfo = {
            orderNumber: order.orderNumber,
            currentStatus: order.statusFormatted,
            paymentStatus: order.paymentStatusFormatted,
            progress: Math.round(progress),

            // Información de tracking
            trackingNumber: order.trackingNumber || null,
            carrier: order.carrier || null,
            trackingUrl: order.trackingUrl || null,
            estimatedDeliveryDate: order.estimatedDeliveryDate || null,

            // Fechas importantes
            createdAt: order.createdAt,
            processedAt: order.processedAt,
            shippedAt: order.shippedAt,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,

            // Historial completo de estados
            statusHistory: order.statusHistory.map(entry => ({
                status: entry.status,
                statusFormatted: getStatusFormatted(entry.status),
                timestamp: entry.timestamp,
                updatedBy: entry.updatedBy?.nombre || 'Sistema',
                notes: entry.notes,
                location: entry.location
            })),

            // Información del pedido
            items: order.items.map(item => ({
                productId: item.product?._id || null,
                name: item.product?.name || 'Producto no disponible',
                brand: item.product?.brand || 'Marca no disponible',
                imageUrl: item.product?.imageUrl || null,
                quantity: item.quantity,
                price: item.price
            })),

            total: order.total,

            // Dirección de envío
            shippingAddress: order.shippingAddress ? {
                fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
                street: order.shippingAddress.street,
                city: order.shippingAddress.city,
                state: order.shippingAddress.state,
                zipCode: order.shippingAddress.zipCode,
                phone: order.shippingAddress.phone
            } : null,

            // Próximo estado esperado
            nextStatus: getNextExpectedStatus(order.status, order.paymentStatus),

            // Mensaje para el cliente
            customerMessage: getCustomerMessage(order)
        };

        res.json({
            success: true,
            data: trackingInfo
        });

    } catch (error) {
        console.error('Error al obtener estado de orden:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al obtener estado de la orden'
        });
    }
}

// Helper: Formatear estado
function getStatusFormatted(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'processing': 'En Proceso',
        'shipped': 'Enviada',
        'delivered': 'Entregada',
        'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
}

// Helper: Obtener próximo estado esperado
function getNextExpectedStatus(currentStatus, paymentStatus) {
    if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
        return null; // Estados finales
    }

    if (currentStatus === 'pending' && paymentStatus !== 'paid') {
        return 'Esperando confirmación de pago';
    }

    const nextSteps = {
        'pending': 'En Proceso',
        'processing': 'Enviada',
        'shipped': 'Entregada'
    };

    return nextSteps[currentStatus] || null;
}

// Helper: Mensaje personalizado para el cliente
function getCustomerMessage(order) {
    switch (order.status) {
        case 'pending':
            return order.paymentStatus === 'paid'
                ? '¡Gracias por tu compra! Estamos preparando tu pedido.'
                : 'Estamos esperando la confirmación de tu pago.';
        case 'processing':
            return 'Tu pedido está siendo preparado y será enviado pronto.';
        case 'shipped':
            return `Tu pedido está en camino. ${order.trackingNumber ? `Número de seguimiento: ${order.trackingNumber}` : 'Te notificaremos cuando sea despachado.'}`;
        case 'delivered':
            return '¡Tu pedido ha sido entregado! Esperamos que disfrutes tus productos.';
        case 'cancelled':
            return `Tu pedido ha sido cancelado. ${order.cancellationReason || 'Contáctanos si tienes dudas.'}`;
        default:
            return 'Información de tu pedido';
    }
}

// ==================== CONTROLADORES PARA VENTAS FÍSICAS ====================

// Crear orden para venta física
export async function createPhysicalSale(req, res) {
    try {
        const {
            items,
            customerInfo,
            cashierInfo,
            paymentMethod = 'cash',
            notes = ''
        } = req.body;

        // Validar datos requeridos
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Los items de la venta son requeridos'
            });
        }

        if (!customerInfo || !customerInfo.firstName || !customerInfo.lastName) {
            return res.status(400).json({
                success: false,
                error: 'La información del cliente es requerida'
            });
        }

        // Validar que los productos existan y tengan stock
        const productIds = items.map(item => item.product);
        const products = await Product.find({ _id: { $in: productIds } });

        if (products.length !== productIds.length) {
            return res.status(400).json({
                success: false,
                error: 'Uno o más productos no existen'
            });
        }

        // Verificar stock físico disponible
        const stockChecks = [];
        for (const item of items) {
            const inventory = await Inventory.findOne({ product: item.product });
            if (!inventory) {
                return res.status(400).json({
                    success: false,
                    error: `Inventario no encontrado para el producto ${item.product}`
                });
            }

            if (inventory.channels.physical.stock < item.quantity) {
                stockChecks.push({
                    productId: item.product,
                    requested: item.quantity,
                    available: inventory.channels.physical.stock,
                    insufficient: true
                });
            }
        }

        if (stockChecks.some(check => check.insufficient)) {
            return res.status(400).json({
                success: false,
                error: 'Stock físico insuficiente para algunos productos',
                stockIssues: stockChecks.filter(check => check.insufficient)
            });
        }

        // Crear o encontrar usuario para la venta física
        let customer;
        if (customerInfo.email) {
            customer = await User.findOne({ email: customerInfo.email });
            if (!customer) {
                // Crear usuario temporal para venta física
                customer = new User({
                    nombre: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
                    email: customerInfo.email,
                    contraseña: 'temp_physical_sale_' + Date.now(), // Contraseña temporal
                    rol: 'usuario', // Usar el campo correcto del modelo
                    activo: true
                });
                await customer.save();
            }
        } else {
            // Usuario anónimo para ventas físicas sin email
            // Generar email temporal único
            const tempEmail = `temp_${Date.now()}@physical.sale`;
            customer = new User({
                nombre: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
                email: tempEmail,
                contraseña: 'temp_physical_sale_' + Date.now(),
                rol: 'usuario',
                activo: true
            });
            await customer.save();
        }

        // Calcular totales
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = products.find(p => p._id.toString() === item.product);
            const itemSubtotal = product.price * item.quantity;

            orderItems.push({
                product: item.product,
                quantity: item.quantity,
                price: product.price,
                subtotal: itemSubtotal
            });

            subtotal += itemSubtotal;
        }

        const tax = Math.round((subtotal * 0.19) * 100) / 100; // IVA 19% sobre USD, redondeado a centavos
        // Para ventas físicas: total = subtotal + tax + shipping (donde shipping = 0)
        const total = Math.round((subtotal + tax + 0) * 100) / 100; // Redondeado a centavos

        // Crear la orden
        const order = new Order({
            user: customer._id,
            items: orderItems,
            subtotal,
            tax,
            shipping: 0, // Sin envío para ventas físicas
            total,
            paymentMethod,
            salesChannel: 'physical_store',
            physicalSale: {
                storeLocation: cashierInfo.storeLocation || 'Tienda Principal',
                cashierId: req.user.id,
                cashierName: cashierInfo.cashierName || req.user.nombre || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim(),
                registerNumber: cashierInfo.registerNumber || 'Caja 1',
                receiptNumber: cashierInfo.receiptNumber || `REC-${Date.now()}`
            },
            shippingAddress: {
                firstName: customerInfo.firstName,
                lastName: customerInfo.lastName,
                street: customerInfo.address || 'Retiro en tienda',
                city: customerInfo.city || 'Ciudad',
                state: customerInfo.state || 'Estado',
                zipCode: customerInfo.zipCode || '00000',
                country: customerInfo.country || 'Colombia',
                phone: customerInfo.phone || ''
            },
            notes: notes,
            paymentStatus: 'paid', // Pagado inmediatamente
            status: 'processing'
        });

        // Procesar la venta física y ajustar stock
        const result = await order.processPhysicalSale(cashierInfo);

        // Enviar notificación si el cliente tiene email válido
        if (customer.email && !customer.email.includes('temp_')) {
            try {
                await notificationService.sendOrderConfirmation(customer.email, {
                    orderNumber: order.orderNumber,
                    total: order.total,
                    items: orderItems,
                    salesChannel: 'physical_store'
                });
            } catch (notificationError) {
                console.warn('Error enviando notificación de venta física:', notificationError.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Venta física registrada exitosamente',
            data: {
                order: order.toObject(),
                stockAdjustments: result.stockAdjustments,
                customer: {
                    id: customer._id,
                    name: customer.nombre,
                    email: customer.email,
                    phone: customerInfo.phone
                },
                cashier: {
                    id: req.user.id,
                    name: req.user.nombre || `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim()
                }
            }
        });

    } catch (error) {
        console.error('Error creating physical sale:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al registrar venta física'
        });
    }
}

// Obtener ventas físicas
export async function getPhysicalSales(req, res) {
    try {
        const {
            startDate,
            endDate,
            cashierId,
            storeLocation,
            limit = 50,
            page = 1
        } = req.query;

        // Construir filtros
        const filters = {};

        if (startDate && endDate) {
            filters.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        if (cashierId) {
            filters['physicalSale.cashierId'] = cashierId;
        }

        if (storeLocation) {
            filters['physicalSale.storeLocation'] = storeLocation;
        }

        // Configurar paginación
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;

        // Obtener ventas físicas
        const physicalSales = await Order.getPhysicalSales(filters)
            .skip(skip)
            .limit(limitNum);

        const totalCount = await Order.countDocuments({
            salesChannel: 'physical_store',
            ...filters
        });

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            count: physicalSales.length,
            totalCount,
            data: physicalSales,
            pagination: {
                currentPage: pageNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Error getting physical sales:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener ventas físicas'
        });
    }
}

// Obtener estadísticas de ventas por canal
export async function getSalesChannelStats(req, res) {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Las fechas de inicio y fin son requeridas'
            });
        }

        const stats = await Order.getSalesChannelStats(startDate, endDate);

        // Calcular totales generales
        const totals = stats.reduce((acc, stat) => {
            acc.totalOrders += stat.totalOrders;
            acc.totalRevenue += stat.totalRevenue;
            acc.totalItems += stat.totalItems;
            return acc;
        }, { totalOrders: 0, totalRevenue: 0, totalItems: 0 });

        res.json({
            success: true,
            data: {
                channelStats: stats,
                totals,
                period: {
                    startDate,
                    endDate
                },
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting sales channel stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener estadísticas de canales de venta'
        });
    }
}

// Obtener información de una venta física específica
export async function getPhysicalSaleById(req, res) {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate('user', 'firstName lastName email phone')
            .populate('items.product', 'name brand price imageUrl')
            .populate('physicalSale.cashierId', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Orden no encontrada'
            });
        }

        if (!order.isPhysicalSale()) {
            return res.status(400).json({
                success: false,
                error: 'Esta no es una venta física'
            });
        }

        res.json({
            success: true,
            data: {
                order: order.toObject(),
                cashierInfo: order.getCashierInfo(),
                isPhysicalSale: order.isPhysicalSale()
            }
        });

    } catch (error) {
        console.error('Error getting physical sale by id:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener venta física'
        });
    }
}