/**
 * Controlador de Customer para CRM
 * 
 * Maneja todas las operaciones relacionadas con la gestión de clientes,
 * segmentación, análisis y fidelización.
 */

import Customer from '../models/Customer.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Obtener todos los customers con filtros y paginación
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = async (req, res) => {
    try {
        const {
            segment,
            loyaltyLevel,
            status,
            churnRisk,
            isHighValue,
            search,
            sortBy = 'lifetimeValue',
            order = 'desc',
            page = 1,
            limit = 20
        } = req.query;

        // Construir filtros
        const filters = {};

        if (segment) filters.segment = segment;
        if (loyaltyLevel) filters.loyaltyLevel = loyaltyLevel;
        if (status) filters.status = status;
        if (churnRisk) filters.churnRisk = churnRisk;
        if (isHighValue !== undefined) filters.isHighValue = isHighValue === 'true';

        // Búsqueda por nombre, email o código de cliente
        if (search) {
            const users = await User.find({
                $or: [
                    { nombre: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);

            filters.$or = [
                { user: { $in: userIds } },
                { customerCode: { $regex: search, $options: 'i' } }
            ];
        }

        // Configurar ordenamiento
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        // Calcular skip
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Obtener customers
        const customers = await Customer.find(filters)
            .populate('user', 'nombre email fechaCreacion')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Contar total
        const total = await Customer.countDocuments(filters);

        res.status(200).json({
            success: true,
            data: customers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error al obtener customers:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener la lista de clientes'
        });
    }
};

// @desc    Obtener un customer por ID
// @route   GET /api/customers/:id
// @access  Private/Admin
export const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id)
            .populate('user', 'nombre email fechaCreacion activo rol')
            .populate({
                path: 'orders',
                options: { limit: 10, sort: { createdAt: -1 } },
                select: 'orderNumber total status createdAt'
            })
            .populate({
                path: 'wishlistInfo',
                populate: {
                    path: 'items.product',
                    select: 'name price brand'
                }
            });

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });

    } catch (error) {
        console.error('Error al obtener customer:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el cliente'
        });
    }
};

// @desc    Crear un nuevo customer manualmente
// @route   POST /api/customers
// @access  Private/Admin
export const createCustomer = async (req, res) => {
    try {
        const { userId, contactInfo, preferences, tags, notes, acquisitionSource } = req.body;

        // Verificar que el usuario existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        // Verificar que no exista ya un customer para este usuario
        const existingCustomer = await Customer.findOne({ user: userId });
        if (existingCustomer) {
            return res.status(400).json({
                success: false,
                error: 'Ya existe un perfil de cliente para este usuario'
            });
        }

        // Crear customer
        const customer = new Customer({
            user: userId,
            contactInfo,
            preferences,
            tags,
            notes,
            acquisitionSource: acquisitionSource || 'Directo'
        });

        // Actualizar métricas desde órdenes
        await customer.updateMetricsFromOrders();

        await customer.save();

        // Poblar datos del usuario
        await customer.populate('user', 'nombre email');

        res.status(201).json({
            success: true,
            data: customer,
            message: 'Cliente creado exitosamente'
        });

    } catch (error) {
        console.error('Error al crear customer:', error);
        res.status(500).json({
            success: false,
            error: 'Error al crear el cliente'
        });
    }
};

// @desc    Actualizar información de un customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
export const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Campos que no se deben actualizar directamente
        const restrictedFields = ['user', 'customerCode', 'metrics', 'lifetimeValue'];
        restrictedFields.forEach(field => delete updateData[field]);

        const customer = await Customer.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('user', 'nombre email');

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: customer,
            message: 'Cliente actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar customer:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar el cliente'
        });
    }
};

// @desc    Eliminar un customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findByIdAndDelete(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar customer:', error);
        res.status(500).json({
            success: false,
            error: 'Error al eliminar el cliente'
        });
    }
};

// @desc    Actualizar métricas de un customer desde sus órdenes
// @route   PUT /api/customers/:id/update-metrics
// @access  Private/Admin
export const updateCustomerMetrics = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        // Actualizar métricas
        await customer.updateMetricsFromOrders();

        res.status(200).json({
            success: true,
            data: customer,
            message: 'Métricas actualizadas exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar métricas:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar las métricas del cliente'
        });
    }
};

// @desc    Agregar interacción al historial del customer
// @route   POST /api/customers/:id/interactions
// @access  Private/Admin
export const addCustomerInteraction = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, description, metadata } = req.body;

        if (!type) {
            return res.status(400).json({
                success: false,
                error: 'El tipo de interacción es requerido'
            });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        // Agregar interacción
        customer.addInteraction(type, description || '', metadata || {});
        await customer.save();

        res.status(200).json({
            success: true,
            data: customer,
            message: 'Interacción registrada exitosamente'
        });

    } catch (error) {
        console.error('Error al agregar interacción:', error);
        res.status(500).json({
            success: false,
            error: 'Error al registrar la interacción'
        });
    }
};

// @desc    Obtener estadísticas de segmentos
// @route   GET /api/customers/stats/segments
// @access  Private/Admin
export const getSegmentStats = async (req, res) => {
    try {
        const stats = await Customer.getSegmentStats();

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error al obtener estadísticas de segmentos:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas de segmentos'
        });
    }
};

// @desc    Obtener clientes de alto valor
// @route   GET /api/customers/high-value
// @access  Private/Admin
export const getHighValueCustomers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const customers = await Customer.getHighValueCustomers(parseInt(limit));

        res.status(200).json({
            success: true,
            data: customers,
            count: customers.length
        });

    } catch (error) {
        console.error('Error al obtener clientes de alto valor:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener clientes de alto valor'
        });
    }
};

// @desc    Obtener clientes en riesgo de abandono
// @route   GET /api/customers/churn-risk
// @access  Private/Admin
export const getChurnRiskCustomers = async (req, res) => {
    try {
        const customers = await Customer.getChurnRiskCustomers();

        res.status(200).json({
            success: true,
            data: customers,
            count: customers.length
        });

    } catch (error) {
        console.error('Error al obtener clientes en riesgo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener clientes en riesgo de abandono'
        });
    }
};

// @desc    Obtener dashboard general del CRM
// @route   GET /api/customers/dashboard
// @access  Private/Admin
export const getCRMDashboard = async (req, res) => {
    try {
        // Métricas generales
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ status: 'Activo' });
        const highValueCustomers = await Customer.countDocuments({ isHighValue: true });

        // Distribución por segmento
        const segmentDistribution = await Customer.aggregate([
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$lifetimeValue' },
                    avgLifetimeValue: { $avg: '$lifetimeValue' }
                }
            },
            {
                $sort: { totalRevenue: -1 }
            }
        ]);

        // Distribución por nivel de fidelidad
        const loyaltyDistribution = await Customer.aggregate([
            {
                $group: {
                    _id: '$loyaltyLevel',
                    count: { $sum: 1 },
                    avgLTV: { $avg: '$lifetimeValue' }
                }
            },
            {
                $sort: { avgLTV: -1 }
            }
        ]);

        // LTV promedio y total
        const ltvStats = await Customer.aggregate([
            {
                $group: {
                    _id: null,
                    avgLifetimeValue: { $avg: '$lifetimeValue' },
                    totalRevenue: { $sum: '$lifetimeValue' },
                    avgOrderValue: { $avg: '$metrics.averageOrderValue' }
                }
            }
        ]);

        // Clientes en riesgo
        const churnRiskCount = await Customer.countDocuments({
            churnRisk: { $in: ['Medio', 'Alto'] },
            status: 'Activo'
        });

        // Nuevos clientes (últimos 30 días)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newCustomersCount = await Customer.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        // Top 5 clientes por LTV
        const topCustomers = await Customer.find({ status: 'Activo' })
            .sort({ lifetimeValue: -1 })
            .limit(5)
            .populate('user', 'nombre email')
            .select('customerCode lifetimeValue segment loyaltyLevel metrics.totalOrders');

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalCustomers,
                    activeCustomers,
                    highValueCustomers,
                    churnRiskCount,
                    newCustomersLast30Days: newCustomersCount
                },
                revenue: ltvStats[0] || {
                    avgLifetimeValue: 0,
                    totalRevenue: 0,
                    avgOrderValue: 0
                },
                segmentDistribution,
                loyaltyDistribution,
                topCustomers
            }
        });

    } catch (error) {
        console.error('Error al obtener dashboard CRM:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el dashboard del CRM'
        });
    }
};

// @desc    Actualizar puntos de fidelidad de un customer
// @route   PUT /api/customers/:id/loyalty-points
// @access  Private/Admin
export const updateLoyaltyPoints = async (req, res) => {
    try {
        const { id } = req.params;
        const { points, operation = 'add' } = req.body;

        if (!points || points < 0) {
            return res.status(400).json({
                success: false,
                error: 'Los puntos deben ser un número positivo'
            });
        }

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        // Actualizar puntos
        if (operation === 'add') {
            customer.loyaltyPoints += parseInt(points);
        } else if (operation === 'subtract') {
            customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints - parseInt(points));
        } else if (operation === 'set') {
            customer.loyaltyPoints = parseInt(points);
        }

        // Registrar interacción
        customer.addInteraction(
            'Otro',
            `Puntos de fidelidad ${operation === 'add' ? 'añadidos' : operation === 'subtract' ? 'restados' : 'establecidos'}: ${points}`,
            { points, operation }
        );

        await customer.save();

        res.status(200).json({
            success: true,
            data: customer,
            message: 'Puntos de fidelidad actualizados exitosamente'
        });

    } catch (error) {
        console.error('Error al actualizar puntos de fidelidad:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar los puntos de fidelidad'
        });
    }
};

// @desc    Obtener customer por userId
// @route   GET /api/customers/user/:userId
// @access  Private
export const getCustomerByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const customer = await Customer.findOne({ user: userId })
            .populate('user', 'nombre email fechaCreacion');

        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Perfil de cliente no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: customer
        });

    } catch (error) {
        console.error('Error al obtener customer por userId:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el perfil del cliente'
        });
    }
};

// @desc    Obtener historial de compras completo de un customer
// @route   GET /api/customers/:id/purchase-history
// @access  Private/Admin
export const getCustomerPurchaseHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            page = 1,
            limit = 10,
            status,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        // Verificar que el customer existe
        const customer = await Customer.findById(id);
        if (!customer) {
            return res.status(404).json({
                success: false,
                error: 'Cliente no encontrado'
            });
        }

        // Construir filtros para las órdenes
        const filters = { user: customer.user };
        if (status) {
            filters.status = status;
        }

        // Configurar ordenamiento
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        // Calcular skip
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Obtener órdenes con paginación
        const orders = await Order.find(filters)
            .populate('items.product', 'name brand image price')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Contar total de órdenes
        const totalOrders = await Order.countDocuments(filters);

        // Calcular estadísticas del historial
        const orderStats = await Order.aggregate([
            { $match: { user: customer.user } },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' },
                    totalItems: { $sum: { $size: '$items' } }
                }
            }
        ]);

        // Productos más comprados
        const topProducts = await Order.aggregate([
            { $match: { user: customer.user } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalSpent: { $sum: '$items.subtotal' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    productId: '$_id',
                    productName: '$productInfo.name',
                    productBrand: '$productInfo.brand',
                    productImage: '$productInfo.image',
                    totalQuantity: 1,
                    totalSpent: 1,
                    orderCount: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                orders,
                stats: orderStats[0] || {
                    totalSpent: 0,
                    totalOrders: 0,
                    avgOrderValue: 0,
                    totalItems: 0
                },
                topProducts,
                customer: {
                    id: customer._id,
                    customerCode: customer.customerCode,
                    segment: customer.segment,
                    loyaltyLevel: customer.loyaltyLevel,
                    loyaltyPoints: customer.loyaltyPoints
                }
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalOrders,
                pages: Math.ceil(totalOrders / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error al obtener historial de compras:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener el historial de compras'
        });
    }
};

// @desc    Sincronizar todos los customers con sus órdenes
// @route   POST /api/customers/sync-orders
// @access  Private/Admin
export const syncCustomersWithOrders = async (req, res) => {
    try {
        // PASO 1: Crear customers para usuarios que no tengan uno
        console.log('📊 Paso 1: Creando customers faltantes...');
        
        // Obtener usuarios únicos que tienen órdenes
        const usersWithOrders = await Order.distinct('user');
        console.log(`🔍 Encontrados ${usersWithOrders.length} usuarios con órdenes`);
        
        const results = {
            created: 0,
            updated: 0,
            errors: 0
        };
        
        // ⚡ OPTIMIZACIÓN: Procesar en lotes de 10 en paralelo para mayor velocidad
        const BATCH_SIZE = 10;
        for (let i = 0; i < usersWithOrders.length; i += BATCH_SIZE) {
            const batch = usersWithOrders.slice(i, i + BATCH_SIZE);
            
            const batchResults = await Promise.all(batch.map(async (userId) => {
                try {
                    // Verificar si ya existe un customer para este usuario
                    let customer = await Customer.findOne({ user: userId });
                    let wasCreated = false;
                    
                    if (!customer) {
                        // Crear nuevo customer
                        const user = await User.findById(userId);
                        if (!user) {
                            console.warn(`⚠️ Usuario ${userId} no encontrado, omitiendo...`);
                            return { status: 'skipped' };
                        }
                        
                        customer = new Customer({
                            user: userId,
                            segment: 'Nuevo',
                            loyaltyLevel: 'Bronce',
                            status: 'Activo',
                            acquisitionSource: 'Directo'
                        });
                        
                        await customer.save();
                        console.log(`✅ Customer creado: ${customer.customerCode}`);
                        wasCreated = true;
                    }
                    
                    // PASO 2: Actualizar métricas desde órdenes
                    await customer.updateMetricsFromOrders();
                    
                    return { 
                        status: 'success',
                        created: wasCreated,
                        updated: true
                    };
                    
                } catch (error) {
                    console.error(`❌ Error procesando usuario ${userId}:`, error);
                    return { status: 'error' };
                }
            }));
            
            // Contar resultados del batch
            batchResults.forEach(result => {
                if (result.status === 'success') {
                    if (result.created) results.created++;
                    if (result.updated) results.updated++;
                } else if (result.status === 'error') {
                    results.errors++;
                }
            });
        }
        
        console.log(`📊 Sincronización completada: ${results.created} creados, ${results.updated} actualizados, ${results.errors} errores`);

        res.status(200).json({
            success: true,
            message: 'Sincronización completada',
            results: {
                total: usersWithOrders.length,
                success: results.updated,
                created: results.created,
                errors: results.errors
            }
        });

    } catch (error) {
        console.error('Error al sincronizar customers:', error);
        res.status(500).json({
            success: false,
            error: 'Error al sincronizar clientes con órdenes'
        });
    }
};

// @desc    Obtener customers por segmento específico
// @route   GET /api/customers/segment/:segment
// @access  Private/Admin
export const getCustomersBySegment = async (req, res) => {
    try {
        const { segment } = req.params;
        const { page = 1, limit = 20, sortBy = 'lifetimeValue', order = 'desc' } = req.query;

        // Validar segmento
        const validSegments = ['VIP', 'Frecuente', 'Ocasional', 'Nuevo', 'Inactivo', 'En Riesgo'];
        if (!validSegments.includes(segment)) {
            return res.status(400).json({
                success: false,
                error: `Segmento inválido. Válidos: ${validSegments.join(', ')}`
            });
        }

        // Construir query
        const filters = { segment, status: 'Activo' };

        // Configurar ordenamiento
        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        // Calcular skip
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Obtener customers
        const customers = await Customer.find(filters)
            .populate('user', 'nombre email fechaCreacion')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Contar total
        const total = await Customer.countDocuments(filters);

        // Calcular estadísticas del segmento
        const stats = await Customer.aggregate([
            { $match: filters },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    avgLifetimeValue: { $avg: '$lifetimeValue' },
                    totalRevenue: { $sum: '$lifetimeValue' },
                    avgOrders: { $avg: '$metrics.totalOrders' },
                    avgDaysSinceLastOrder: { $avg: '$metrics.daysSinceLastOrder' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: customers,
            stats: stats[0] || {
                count: 0,
                avgLifetimeValue: 0,
                totalRevenue: 0,
                avgOrders: 0,
                avgDaysSinceLastOrder: 0
            },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            segment: {
                name: segment,
                description: getSegmentDescription(segment)
            }
        });

    } catch (error) {
        console.error('Error al obtener customers por segmento:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener clientes del segmento'
        });
    }
};

// @desc    Re-segmentar todos los customers
// @route   POST /api/customers/resegment
// @access  Private/Admin
export const resegmentAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        let successCount = 0;
        let errorCount = 0;
        const segmentChanges = {};

        for (const customer of customers) {
            try {
                const oldSegment = customer.segment;

                // Actualizar métricas y re-segmentar
                await customer.updateMetricsFromOrders();

                const newSegment = customer.segment;

                // Registrar cambios
                if (oldSegment !== newSegment) {
                    const key = `${oldSegment} → ${newSegment}`;
                    segmentChanges[key] = (segmentChanges[key] || 0) + 1;
                }

                successCount++;
            } catch (error) {
                console.error(`Error al re-segmentar customer ${customer.customerCode}:`, error);
                errorCount++;
            }
        }

        // Obtener distribución actualizada
        const distribution = await Customer.aggregate([
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            success: true,
            message: 'Re-segmentación completada',
            results: {
                total: customers.length,
                success: successCount,
                errors: errorCount,
                changes: segmentChanges,
                distribution: distribution.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });

    } catch (error) {
        console.error('Error al re-segmentar customers:', error);
        res.status(500).json({
            success: false,
            error: 'Error al re-segmentar clientes'
        });
    }
};

// @desc    Obtener análisis de segmentación
// @route   GET /api/customers/segmentation/analysis
// @access  Private/Admin
export const getSegmentationAnalysis = async (req, res) => {
    try {
        // Distribución por segmento
        const distribution = await Customer.aggregate([
            { $match: { status: 'Activo' } },
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 },
                    avgLifetimeValue: { $avg: '$lifetimeValue' },
                    totalRevenue: { $sum: '$lifetimeValue' },
                    avgOrders: { $avg: '$metrics.totalOrders' },
                    avgOrderValue: { $avg: '$metrics.averageOrderValue' }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        // Total de customers
        const totalCustomers = await Customer.countDocuments({ status: 'Activo' });

        // Agregar porcentajes y descripción
        const enrichedDistribution = distribution.map(segment => ({
            segment: segment._id,
            count: segment.count,
            percentage: ((segment.count / totalCustomers) * 100).toFixed(2),
            avgLifetimeValue: segment.avgLifetimeValue,
            totalRevenue: segment.totalRevenue,
            avgOrders: segment.avgOrders,
            avgOrderValue: segment.avgOrderValue,
            description: getSegmentDescription(segment._id),
            revenuePercentage: ((segment.totalRevenue / distribution.reduce((sum, s) => sum + s.totalRevenue, 0)) * 100).toFixed(2)
        }));

        // Tendencias (últimos 30 días vs anteriores)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentChanges = await Customer.aggregate([
            { $match: { updatedAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total: totalCustomers,
                distribution: enrichedDistribution,
                recentActivity: recentChanges,
                recommendations: generateSegmentRecommendations(enrichedDistribution)
            }
        });

    } catch (error) {
        console.error('Error al obtener análisis de segmentación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener análisis de segmentación'
        });
    }
};

// Helper: Obtener descripción del segmento
function getSegmentDescription(segment) {
    const descriptions = {
        'VIP': 'Clientes de máximo valor (>$2M y 10+ órdenes). Prioridad máxima.',
        'Frecuente': 'Compradores regulares (5+ órdenes, activos últimos 30 días)',
        'Ocasional': 'Compradores esporádicos (2+ órdenes, activos últimos 90 días)',
        'Nuevo': 'Sin historial de compras. Oportunidad de conversión.',
        'Inactivo': 'Sin compras en 180+ días. Requiere reactivación.',
        'En Riesgo': 'Sin compras en 90-180 días. Necesita atención.'
    };
    return descriptions[segment] || 'Descripción no disponible';
}

// Helper: Generar recomendaciones por segmento
function generateSegmentRecommendations(distribution) {
    const recommendations = [];

    distribution.forEach(segment => {
        const percentage = parseFloat(segment.percentage);

        if (segment.segment === 'Inactivo' && percentage > 20) {
            recommendations.push({
                priority: 'Alta',
                segment: 'Inactivo',
                issue: `${percentage}% de customers inactivos`,
                action: 'Implementar campaña de reactivación con ofertas especiales'
            });
        }

        if (segment.segment === 'En Riesgo' && percentage > 15) {
            recommendations.push({
                priority: 'Media',
                segment: 'En Riesgo',
                issue: `${percentage}% de customers en riesgo de abandono`,
                action: 'Contactar proactivamente con descuentos personalizados'
            });
        }

        if (segment.segment === 'Nuevo' && percentage > 40) {
            recommendations.push({
                priority: 'Media',
                segment: 'Nuevo',
                issue: `${percentage}% son nuevos sin compras`,
                action: 'Mejorar estrategia de onboarding y primera compra'
            });
        }

        if (segment.segment === 'VIP' && segment.count > 0) {
            recommendations.push({
                priority: 'Alta',
                segment: 'VIP',
                issue: `${segment.count} customers VIP generan ${segment.revenuePercentage}% del revenue`,
                action: 'Programa de fidelización exclusivo y atención premium'
            });
        }

        if (segment.segment === 'Frecuente' && percentage < 10) {
            recommendations.push({
                priority: 'Media',
                segment: 'Frecuente',
                issue: `Solo ${percentage}% son compradores frecuentes`,
                action: 'Implementar incentivos para aumentar frecuencia de compra'
            });
        }
    });

    return recommendations;
}

export default {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerMetrics,
    addCustomerInteraction,
    getSegmentStats,
    getHighValueCustomers,
    getChurnRiskCustomers,
    getCRMDashboard,
    updateLoyaltyPoints,
    getCustomerByUserId,
    getCustomerPurchaseHistory,
    syncCustomersWithOrders,
    getCustomersBySegment,
    resegmentAllCustomers,
    getSegmentationAnalysis
};

