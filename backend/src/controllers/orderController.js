import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Inventory from '../models/Inventory.js';

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
                error: 'El carrito está vacío'
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

        // Crear la orden
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.price * item.quantity
        }));

        const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        const tax = subtotal * 0.19; // IVA 19%
        const shipping = subtotal > 100000 ? 0 : 5000; // Envío gratis sobre $100,000
        const total = subtotal + tax + shipping;

        const order = new Order({
            user: userId,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            total,
            paymentMethod,
            shippingAddress,
            notes,
            status: 'pending',
            paymentStatus: 'pending'
        });

        await order.save();

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

        // Limpiar carrito
        await cart.clearCart();

        // Poblar datos para respuesta
        await order.populate([
            { path: 'user', select: 'nombre email' },
            { path: 'items.product', select: 'name brand imageUrl' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            data: order
        });

    } catch (error) {
        console.error('Error al crear orden:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor al crear la orden'
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
                    customer: order.user.nombre,
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
