import Order from '../models/Order.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { checkRedisHealth } from '../config/redis.js';

// ==================== DASHBOARD OMNICANAL ====================

// Obtener dashboard consolidado omnicanal
export async function getOmnichannelDashboard(req, res) {
    try {
        const {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días por defecto
            endDate = new Date(),
            period = 'daily' // daily, weekly, monthly
        } = req.query;

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Ejecutar todas las consultas en paralelo
        const [
            salesChannelStats,
            inventoryStats,
            stockDiscrepancies,
            pendingSyncProducts,
            recentPhysicalSales,
            topSellingProducts,
            lowStockAlerts,
            systemHealth
        ] = await Promise.all([
            getSalesChannelMetrics(start, end),
            getInventoryMetrics(),
            getStockDiscrepancyMetrics(),
            getPendingSyncMetrics(),
            getRecentPhysicalSales(10),
            getTopSellingProductsByChannel(start, end),
            getLowStockAlerts(),
            getSystemHealthMetrics()
        ]);

        // Calcular métricas consolidadas
        const consolidatedMetrics = calculateConsolidatedMetrics(salesChannelStats, inventoryStats);

        res.json({
            success: true,
            data: {
                period: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                    days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
                },
                sales: {
                    channelStats: salesChannelStats,
                    consolidated: consolidatedMetrics.sales,
                    topProducts: topSellingProducts,
                    recentPhysicalSales
                },
                inventory: {
                    overview: inventoryStats,
                    discrepancies: stockDiscrepancies,
                    pendingSync: pendingSyncProducts,
                    lowStockAlerts
                },
                system: {
                    health: systemHealth,
                    syncStatus: consolidatedMetrics.sync
                },
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting omnichannel dashboard:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener dashboard omnicanal'
        });
    }
}

// Métricas de ventas por canal
async function getSalesChannelMetrics(startDate, endDate) {
    const stats = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: '$salesChannel',
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                totalItems: { $sum: { $sum: '$items.quantity' } },
                averageOrderValue: { $avg: '$total' },
                uniqueCustomers: { $addToSet: '$user' }
            }
        },
        {
            $project: {
                channel: '$_id',
                totalOrders: 1,
                totalRevenue: 1,
                totalItems: 1,
                averageOrderValue: { $round: ['$averageOrderValue', 2] },
                uniqueCustomers: { $size: '$uniqueCustomers' }
            }
        },
        { $sort: { totalRevenue: -1 } }
    ]);

    // Agregar métricas adicionales
    const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
    const totalOrders = stats.reduce((sum, stat) => sum + stat.totalOrders, 0);

    return stats.map(stat => ({
        ...stat,
        revenuePercentage: totalRevenue > 0 ? ((stat.totalRevenue / totalRevenue) * 100).toFixed(2) : 0,
        orderPercentage: totalOrders > 0 ? ((stat.totalOrders / totalOrders) * 100).toFixed(2) : 0
    }));
}

// Métricas de inventario
async function getInventoryMetrics() {
    const stats = await Inventory.getOmnichannelStats();
    const result = stats[0] || {};

    // Obtener productos por estado
    const productsByStatus = await Inventory.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    return {
        totalProducts: result.totalProducts || 0,
        totalPhysicalStock: result.totalPhysicalStock || 0,
        totalDigitalStock: result.totalDigitalStock || 0,
        totalStock: result.totalStock || 0,
        productsWithDiscrepancies: result.productsWithDiscrepancies || 0,
        productsPendingSync: result.productsPendingSync || 0,
        productsWithSyncErrors: result.productsWithSyncErrors || 0,
        productsByStatus: productsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {}),
        discrepancyRate: result.totalProducts > 0
            ? ((result.productsWithDiscrepancies / result.totalProducts) * 100).toFixed(2)
            : 0,
        syncErrorRate: result.totalProducts > 0
            ? ((result.productsWithSyncErrors / result.totalProducts) * 100).toFixed(2)
            : 0
    };
}

// Métricas de discrepancias de stock
async function getStockDiscrepancyMetrics() {
    const discrepancies = await Inventory.find({
        $expr: {
            $ne: ['$channels.physical.stock', '$channels.digital.stock']
        },
        status: 'active'
    }).populate('product', 'name brand price').limit(20);

    return discrepancies
        .filter(item => item.product && item.product._id) // Filtrar productos nulos
        .map(item => ({
            productId: item.product._id,
            productName: item.product.name,
            brand: item.product.brand,
            physicalStock: item.channels.physical.stock,
            digitalStock: item.channels.digital.stock,
            difference: Math.abs(item.channels.physical.stock - item.channels.digital.stock),
            lastPhysicalUpdate: item.channels.physical.lastUpdated,
            lastDigitalUpdate: item.channels.digital.lastUpdated
        }));
}

// Métricas de productos pendientes de sincronización
async function getPendingSyncMetrics() {
    const pendingSync = await Inventory.find({
        $or: [
            { 'channels.physical.syncStatus': 'pending' },
            { 'channels.digital.syncStatus': 'pending' }
        ],
        status: 'active'
    }).populate('product', 'name brand').limit(20);

    return pendingSync
        .filter(item => item.product && item.product._id) // Filtrar productos nulos
        .map(item => ({
            productId: item.product._id,
            productName: item.product.name,
            brand: item.product.brand,
            physicalSyncStatus: item.channels.physical.syncStatus,
            digitalSyncStatus: item.channels.digital.syncStatus,
            lastPhysicalUpdate: item.channels.physical.lastUpdated,
            lastDigitalUpdate: item.channels.digital.lastUpdated
        }));
}

// Ventas físicas recientes
async function getRecentPhysicalSales(limit = 10) {
    const sales = await Order.find({
        salesChannel: 'physical_store',
        status: { $ne: 'cancelled' }
    })
        .populate('user', 'firstName lastName')
        .populate('items.product', 'name brand')
        .populate('physicalSale.cashierId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(limit);

    return sales
        .filter(sale => sale.user && sale.user._id) // Filtrar usuarios nulos
        .map(sale => ({
            orderId: sale._id,
            orderNumber: sale.orderNumber,
            customer: {
                name: `${sale.user.firstName} ${sale.user.lastName}`,
                id: sale.user._id
            },
            cashier: {
                name: sale.physicalSale.cashierName,
                id: sale.physicalSale.cashierId
            },
            total: sale.total,
            itemsCount: sale.items.length,
            createdAt: sale.createdAt,
            storeLocation: sale.physicalSale.storeLocation
        }));
}

// Productos más vendidos por canal
async function getTopSellingProductsByChannel(startDate, endDate) {
    const pipeline = [
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $ne: 'cancelled' }
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: {
                    product: '$items.product',
                    channel: '$salesChannel'
                },
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id.product',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $group: {
                _id: '$_id.channel',
                topProducts: {
                    $push: {
                        productId: '$_id.product',
                        productName: '$product.name',
                        brand: '$product.brand',
                        totalSold: '$totalSold',
                        totalRevenue: '$totalRevenue'
                    }
                }
            }
        },
        {
            $project: {
                channel: '$_id',
                topProducts: {
                    $slice: [
                        {
                            $sortArray: {
                                input: '$topProducts',
                                sortBy: { totalSold: -1 }
                            }
                        },
                        5
                    ]
                }
            }
        }
    ];

    return await Order.aggregate(pipeline);
}

// Alertas de stock bajo
async function getLowStockAlerts() {
    const lowStockProducts = await Inventory.find({
        $expr: {
            $or: [
                { $lte: ['$channels.physical.stock', '$minStock'] },
                { $lte: ['$channels.digital.stock', '$minStock'] }
            ]
        },
        status: 'active'
    }).populate('product', 'name brand price').limit(20);

    return lowStockProducts
        .filter(item => item.product && item.product._id) // Filtrar productos nulos
        .map(item => ({
            productId: item.product._id,
            productName: item.product.name,
            brand: item.product.brand,
            physicalStock: item.channels.physical.stock,
            digitalStock: item.channels.digital.stock,
            minStock: item.minStock,
            needsRestock: item.needsRestock,
            stockStatus: item.stockStatus
        }));
}

// Métricas de salud del sistema
async function getSystemHealthMetrics() {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Verificar salud de MongoDB
    const mongoHealth = mongoose.connection.readyState === 1;

    // Verificar salud de Redis
    const redisHealth = await checkRedisHealth();

    const [
        totalOrders,
        recentOrders,
        totalProducts,
        activeProducts,
        totalUsers,
        recentUsers
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ createdAt: { $gte: last24Hours } }),
        Product.countDocuments(),
        Product.countDocuments({ status: 'active' }),
        User.countDocuments(),
        User.countDocuments({ createdAt: { $gte: last24Hours } })
    ]);

    return {
        database: {
            mongodb: mongoHealth,
            redis: redisHealth
        },
        orders: {
            total: totalOrders,
            last24Hours: recentOrders
        },
        products: {
            total: totalProducts,
            active: activeProducts,
            inactive: totalProducts - activeProducts
        },
        users: {
            total: totalUsers,
            last24Hours: recentUsers
        },
        systemUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: now.toISOString()
    };
}

// Calcular métricas consolidadas
function calculateConsolidatedMetrics(salesStats, inventoryStats) {
    const totalRevenue = salesStats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
    const totalOrders = salesStats.reduce((sum, stat) => sum + stat.totalOrders, 0);
    const totalItems = salesStats.reduce((sum, stat) => sum + stat.totalItems, 0);

    const onlineChannel = salesStats.find(s => s.channel === 'online');
    const physicalChannel = salesStats.find(s => s.channel === 'physical_store');

    return {
        sales: {
            totalRevenue,
            totalOrders,
            totalItems,
            averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0,
            onlineVsPhysical: {
                onlineRevenue: onlineChannel?.totalRevenue || 0,
                physicalRevenue: physicalChannel?.totalRevenue || 0,
                onlineOrders: onlineChannel?.totalOrders || 0,
                physicalOrders: physicalChannel?.totalOrders || 0
            }
        },
        sync: {
            discrepancyRate: inventoryStats.discrepancyRate,
            syncErrorRate: inventoryStats.syncErrorRate,
            productsPendingSync: inventoryStats.productsPendingSync,
            productsWithDiscrepancies: inventoryStats.productsWithDiscrepancies
        }
    };
}

// Obtener métricas en tiempo real
export async function getRealTimeMetrics(req, res) {
    try {
        const [
            currentStockDiscrepancies,
            pendingSyncCount,
            recentPhysicalSales,
            systemHealth
        ] = await Promise.all([
            Inventory.countDocuments({
                $expr: {
                    $ne: ['$channels.physical.stock', '$channels.digital.stock']
                },
                status: 'active'
            }),
            Inventory.countDocuments({
                $or: [
                    { 'channels.physical.syncStatus': 'pending' },
                    { 'channels.digital.syncStatus': 'pending' }
                ],
                status: 'active'
            }),
            Order.countDocuments({
                salesChannel: 'physical_store',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            }),
            getSystemHealthMetrics()
        ]);

        res.json({
            success: true,
            data: {
                stockDiscrepancies: currentStockDiscrepancies,
                pendingSync: pendingSyncCount,
                physicalSalesLast24h: recentPhysicalSales,
                systemHealth,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting real-time metrics:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener métricas en tiempo real'
        });
    }
}

// Obtener resumen ejecutivo
export async function getExecutiveSummary(req, res) {
    try {
        const {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate = new Date()
        } = req.query;

        const start = new Date(startDate);
        const end = new Date(endDate);

        const [
            salesChannelStats,
            inventoryStats,
            topProducts,
            recentActivity
        ] = await Promise.all([
            getSalesChannelMetrics(start, end),
            getInventoryMetrics(),
            getTopSellingProductsByChannel(start, end),
            getRecentPhysicalSales(5)
        ]);

        const consolidatedMetrics = calculateConsolidatedMetrics(salesChannelStats, inventoryStats);

        res.json({
            success: true,
            data: {
                period: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                },
                summary: {
                    totalRevenue: consolidatedMetrics.sales.totalRevenue,
                    totalOrders: consolidatedMetrics.sales.totalOrders,
                    averageOrderValue: consolidatedMetrics.sales.averageOrderValue,
                    onlineVsPhysicalRatio: {
                        revenue: consolidatedMetrics.sales.onlineVsPhysical,
                        orders: {
                            online: consolidatedMetrics.sales.onlineVsPhysical.onlineOrders,
                            physical: consolidatedMetrics.sales.onlineVsPhysical.physicalOrders
                        }
                    }
                },
                inventory: {
                    totalProducts: inventoryStats.totalProducts,
                    totalStock: inventoryStats.totalStock,
                    discrepancyRate: inventoryStats.discrepancyRate,
                    syncErrorRate: inventoryStats.syncErrorRate
                },
                topProducts: topProducts,
                recentActivity: recentActivity,
                recommendations: generateRecommendations(consolidatedMetrics, inventoryStats),
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting executive summary:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener resumen ejecutivo'
        });
    }
}

// Generar recomendaciones basadas en métricas
function generateRecommendations(salesMetrics, inventoryMetrics) {
    const recommendations = [];

    // Recomendaciones de sincronización
    if (parseFloat(inventoryMetrics.discrepancyRate) > 10) {
        recommendations.push({
            type: 'sync',
            priority: 'high',
            message: `Alto porcentaje de discrepancias de stock (${inventoryMetrics.discrepancyRate}%). Se recomienda ejecutar sincronización inmediata.`,
            action: 'Ejecutar /api/inventory/sync'
        });
    }

    // Recomendaciones de ventas
    const physicalRevenue = salesMetrics.sales.onlineVsPhysical.physicalRevenue;
    const onlineRevenue = salesMetrics.sales.onlineVsPhysical.onlineRevenue;

    if (physicalRevenue > onlineRevenue * 1.5) {
        recommendations.push({
            type: 'sales',
            priority: 'medium',
            message: 'Las ventas físicas superan significativamente las ventas online. Considerar estrategias de marketing digital.',
            action: 'Revisar estrategia de ventas online'
        });
    }

    // Recomendaciones de inventario
    if (inventoryMetrics.productsPendingSync > 20) {
        recommendations.push({
            type: 'inventory',
            priority: 'high',
            message: `${inventoryMetrics.productsPendingSync} productos pendientes de sincronización. Priorizar sincronización.`,
            action: 'Revisar productos pendientes de sincronización'
        });
    }

    return recommendations;
}
