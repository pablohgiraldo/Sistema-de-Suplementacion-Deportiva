import AlertConfig from '../models/AlertConfig.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';

// Obtener todas las configuraciones de alertas
export const getAllAlertConfigs = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'active' } = req.query;

        const query = status === 'all' ? {} : { status };

        const configs = await AlertConfig.find(query)
            .populate('product', 'name brand price imageUrl stock')
            .sort({ updatedAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await AlertConfig.countDocuments(query);

        res.json({
            success: true,
            data: configs,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Error getting alert configs:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuraciones de alertas',
            error: error.message
        });
    }
};

// Obtener configuración de alertas por producto
export const getAlertConfigByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const config = await AlertConfig.findOne({ product: productId })
            .populate('product', 'name brand price imageUrl stock');

        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Configuración de alertas no encontrada para este producto'
            });
        }

        res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error('Error getting alert config:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración de alertas',
            error: error.message
        });
    }
};

// Crear nueva configuración de alertas
export const createAlertConfig = async (req, res) => {
    try {
        const { productId } = req.params;
        const configData = req.body;

        // Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Verificar que no existe ya una configuración para este producto
        const existingConfig = await AlertConfig.findOne({ product: productId });
        if (existingConfig) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una configuración de alertas para este producto'
            });
        }

        // Crear nueva configuración
        const config = new AlertConfig({
            product: productId,
            ...configData
        });

        await config.save();
        await config.populate('product', 'name brand price imageUrl stock');

        res.status(201).json({
            success: true,
            message: 'Configuración de alertas creada exitosamente',
            data: config
        });
    } catch (error) {
        console.error('Error creating alert config:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear configuración de alertas',
            error: error.message
        });
    }
};

// Actualizar configuración de alertas
export const updateAlertConfig = async (req, res) => {
    try {
        const { productId } = req.params;
        const updateData = req.body;

        const config = await AlertConfig.findOneAndUpdate(
            { product: productId },
            updateData,
            { new: true, runValidators: true }
        ).populate('product', 'name brand price imageUrl stock');

        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Configuración de alertas no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Configuración de alertas actualizada exitosamente',
            data: config
        });
    } catch (error) {
        console.error('Error updating alert config:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar configuración de alertas',
            error: error.message
        });
    }
};

// Eliminar configuración de alertas
export const deleteAlertConfig = async (req, res) => {
    try {
        const { productId } = req.params;

        const config = await AlertConfig.findOneAndDelete({ product: productId });

        if (!config) {
            return res.status(404).json({
                success: false,
                message: 'Configuración de alertas no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Configuración de alertas eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting alert config:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar configuración de alertas',
            error: error.message
        });
    }
};

// Obtener productos con stock bajo según configuración de alertas
export const getLowStockAlerts = async (req, res) => {
    try {
        const { includeInactive = false } = req.query;

        const query = includeInactive === 'true' ? {} : { status: 'active' };

        const configs = await AlertConfig.find(query)
            .populate({
                path: 'product',
                select: 'name brand price imageUrl',
                populate: {
                    path: 'inventory',
                    model: 'Inventory',
                    select: 'currentStock minStock'
                }
            });

        const alerts = [];

        for (const config of configs) {
            const inventory = await Inventory.findOne({ product: config.product._id });
            if (!inventory) continue;

            const currentStock = inventory.currentStock;
            const alertsForProduct = [];

            // Verificar stock bajo
            if (currentStock <= config.lowStockThreshold && currentStock > config.criticalStockThreshold) {
                alertsForProduct.push({
                    type: 'low_stock',
                    threshold: config.lowStockThreshold,
                    currentStock,
                    severity: 'warning',
                    shouldAlert: config.shouldSendAlert('low_stock', currentStock)
                });
            }

            // Verificar stock crítico
            if (currentStock <= config.criticalStockThreshold && currentStock > config.outOfStockThreshold) {
                alertsForProduct.push({
                    type: 'critical_stock',
                    threshold: config.criticalStockThreshold,
                    currentStock,
                    severity: 'error',
                    shouldAlert: config.shouldSendAlert('critical_stock', currentStock)
                });
            }

            // Verificar stock agotado
            if (currentStock <= config.outOfStockThreshold) {
                alertsForProduct.push({
                    type: 'out_of_stock',
                    threshold: config.outOfStockThreshold,
                    currentStock,
                    severity: 'critical',
                    shouldAlert: config.shouldSendAlert('out_of_stock', currentStock)
                });
            }

            if (alertsForProduct.length > 0) {
                alerts.push({
                    product: config.product,
                    config: config,
                    alerts: alertsForProduct,
                    inventory: inventory
                });
            }
        }

        // Ordenar por severidad y stock actual
        alerts.sort((a, b) => {
            const severityOrder = { critical: 0, error: 1, warning: 2 };
            const aSeverity = Math.min(...a.alerts.map(alert => severityOrder[alert.severity]));
            const bSeverity = Math.min(...b.alerts.map(alert => severityOrder[alert.severity]));

            if (aSeverity !== bSeverity) {
                return aSeverity - bSeverity;
            }

            return a.inventory.currentStock - b.inventory.currentStock;
        });

        res.json({
            success: true,
            data: alerts,
            count: alerts.length
        });
    } catch (error) {
        console.error('Error getting low stock alerts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener alertas de stock bajo',
            error: error.message
        });
    }
};

// Crear configuración por defecto para un producto
export const createDefaultAlertConfig = async (req, res) => {
    try {
        const { productId } = req.params;

        // Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        // Verificar que no existe ya una configuración
        const existingConfig = await AlertConfig.findOne({ product: productId });
        if (existingConfig) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe una configuración de alertas para este producto'
            });
        }

        // Crear configuración por defecto
        const defaultConfig = new AlertConfig({
            product: productId,
            lowStockThreshold: 10,
            criticalStockThreshold: 5,
            outOfStockThreshold: 0,
            emailAlerts: {
                enabled: true,
                lowStock: true,
                criticalStock: true,
                outOfStock: true,
                recipients: []
            },
            appAlerts: {
                enabled: true,
                lowStock: true,
                criticalStock: true,
                outOfStock: true
            },
            alertFrequency: 'immediate',
            status: 'active'
        });

        await defaultConfig.save();
        await defaultConfig.populate('product', 'name brand price imageUrl stock');

        res.status(201).json({
            success: true,
            message: 'Configuración de alertas por defecto creada exitosamente',
            data: defaultConfig
        });
    } catch (error) {
        console.error('Error creating default alert config:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear configuración de alertas por defecto',
            error: error.message
        });
    }
};

// Obtener estadísticas de alertas
export const getAlertStats = async (req, res) => {
    try {
        const totalConfigs = await AlertConfig.countDocuments();
        const activeConfigs = await AlertConfig.countDocuments({ status: 'active' });

        // Contar alertas activas
        const lowStockCount = await AlertConfig.countDocuments({
            status: 'active',
            $expr: { $lte: ['$lowStockThreshold', '$currentStock'] }
        });

        const criticalStockCount = await AlertConfig.countDocuments({
            status: 'active',
            $expr: { $lte: ['$criticalStockThreshold', '$currentStock'] }
        });

        const outOfStockCount = await AlertConfig.countDocuments({
            status: 'active',
            $expr: { $lte: ['$outOfStockThreshold', '$currentStock'] }
        });

        res.json({
            success: true,
            data: {
                totalConfigs,
                activeConfigs,
                alerts: {
                    lowStock: lowStockCount,
                    criticalStock: criticalStockCount,
                    outOfStock: outOfStockCount,
                    total: lowStockCount + criticalStockCount + outOfStockCount
                }
            }
        });
    } catch (error) {
        console.error('Error getting alert stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de alertas',
            error: error.message
        });
    }
};
