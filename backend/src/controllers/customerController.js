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
                    totalRevenue: { $sum: '$lifetimeValue' }
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
    getCustomerByUserId
};

