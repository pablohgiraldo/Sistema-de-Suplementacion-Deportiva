import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import AlertConfig from "../models/AlertConfig.js";
import webhookService from "../services/webhookService.js";

// Obtener todos los registros de inventario con filtros
export async function getInventories(req, res) {
    try {
        const {
            status,
            stock_min,
            stock_max,
            needs_restock,
            limit = 50,
            page = 1,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Construir query de filtros
        let query = {};

        // Filtro por estado
        if (status) {
            query.status = status;
        }

        // Filtro por rango de stock
        if (stock_min || stock_max) {
            query.currentStock = {};
            if (stock_min) {
                query.currentStock.$gte = parseInt(stock_min);
            }
            if (stock_max) {
                query.currentStock.$lte = parseInt(stock_max);
            }
        }

        // Filtro por productos que necesitan reabastecimiento
        if (needs_restock === 'true') {
            query.$expr = { $lte: ['$currentStock', '$minStock'] };
        }

        // Configurar paginación
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;

        // Configurar ordenamiento
        const sortOptions = {
            'createdAt': { createdAt: sortOrder === 'desc' ? -1 : 1 },
            'updatedAt': { updatedAt: sortOrder === 'desc' ? -1 : 1 },
            'currentStock': { currentStock: sortOrder === 'desc' ? -1 : 1 },
            'productName': { 'product.name': sortOrder === 'desc' ? -1 : 1 },
            'totalSold': { totalSold: sortOrder === 'desc' ? -1 : 1 }
        };
        const sortQuery = sortOptions[sortBy] || { createdAt: -1 };

        // Ejecutar consulta con populate
        const [inventories, totalCount] = await Promise.all([
            Inventory.find(query)
                .populate('product', 'name brand price imageUrl description categories')
                .sort(sortQuery)
                .skip(skip)
                .limit(limitNum)
                .lean(),
            Inventory.countDocuments(query)
        ]);

        // Calcular metadatos de paginación
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;
        const nextPage = hasNextPage ? pageNum + 1 : null;
        const prevPage = hasPrevPage ? pageNum - 1 : null;
        const startIndex = skip + 1;
        const endIndex = Math.min(skip + limitNum, totalCount);

        res.json({
            success: true,
            count: inventories.length,
            totalCount,
            data: inventories,
            pagination: {
                currentPage: pageNum,
                totalPages,
                hasNextPage,
                hasPrevPage,
                nextPage,
                prevPage,
                limit: limitNum,
                startIndex,
                endIndex,
                showing: `${startIndex}-${endIndex} de ${totalCount} registros`
            },
            filters: {
                status: status || null,
                stock_min: stock_min || null,
                stock_max: stock_max || null,
                needs_restock: needs_restock || null,
                sortBy,
                sortOrder
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Obtener un registro de inventario por ID
export async function getInventoryById(req, res) {
    try {
        const inventory = await Inventory.findById(req.params.id)
            .populate('product', 'name brand price imageUrl description categories');

        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "Registro de inventario no encontrado"
            });
        }

        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Obtener inventario por ID de producto
export async function getInventoryByProductId(req, res) {
    try {
        const inventory = await Inventory.findOne({ product: req.params.productId })
            .populate('product', 'name brand price imageUrl description categories');

        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "No se encontró inventario para este producto"
            });
        }

        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Crear un nuevo registro de inventario
export async function createInventory(req, res) {
    try {
        const { productId, currentStock, minStock, maxStock, notes } = req.body;

        // Verificar que el producto existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                error: "Producto no encontrado"
            });
        }

        // Verificar que no existe inventario para este producto
        const existingInventory = await Inventory.findOne({ product: productId });
        if (existingInventory) {
            return res.status(400).json({
                success: false,
                error: "Ya existe un registro de inventario para este producto"
            });
        }

        // Crear nuevo inventario
        const inventoryData = {
            product: productId,
            currentStock: currentStock || 0,
            minStock: minStock || 5,
            maxStock: maxStock || 100,
            reservedStock: 0,
            availableStock: currentStock || 0,
            status: (currentStock > 0) ? 'active' : 'out_of_stock',
            notes: notes || ''
        };

        const inventory = new Inventory(inventoryData);
        const savedInventory = await inventory.save();

        // Populate para respuesta
        await savedInventory.populate('product', 'name brand price imageUrl description categories');

        res.status(201).json({
            success: true,
            data: savedInventory,
            message: "Registro de inventario creado exitosamente"
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Actualizar un registro de inventario
export async function updateInventory(req, res) {
    try {
        const { currentStock, minStock, maxStock, status, notes } = req.body;

        const updateData = {};
        if (currentStock !== undefined) updateData.currentStock = currentStock;
        if (minStock !== undefined) updateData.minStock = minStock;
        if (maxStock !== undefined) updateData.maxStock = maxStock;
        if (status !== undefined) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;

        const inventory = await Inventory.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('product', 'name brand price imageUrl description categories');

        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "Registro de inventario no encontrado"
            });
        }

        res.json({
            success: true,
            data: inventory,
            message: "Registro de inventario actualizado exitosamente"
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Eliminar un registro de inventario
export async function deleteInventory(req, res) {
    try {
        const inventory = await Inventory.findByIdAndDelete(req.params.id);

        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "Registro de inventario no encontrado"
            });
        }

        res.json({
            success: true,
            message: "Registro de inventario eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Endpoint de prueba para debuggear
export async function testRestock(req, res) {
    console.log('=== TEST RESTOCK ENDPOINT ===');
    console.log('Request received:', {
        method: req.method,
        url: req.url,
        params: req.params,
        body: req.body,
        headers: req.headers
    });

    res.json({
        success: true,
        message: 'Test endpoint funcionando',
        data: {
            timestamp: new Date().toISOString(),
            params: req.params,
            body: req.body
        }
    });
}

// Reabastecer stock de un producto - Versión simplificada
export async function restockInventory(req, res) {
    try {
        const { quantity, notes } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "La cantidad debe ser mayor a 0"
            });
        }

        console.log(`Iniciando reabastecimiento: ${quantity} unidades para inventario ${req.params.id}`);

        // Operación simplificada sin populate inicial
        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "Registro de inventario no encontrado"
            });
        }

        console.log(`Inventario encontrado: ${inventory._id}, stock actual: ${inventory.currentStock}`);

        // Actualizar campos directamente
        inventory.currentStock += quantity;
        inventory.availableStock = Math.max(0, inventory.currentStock - inventory.reservedStock);
        inventory.lastRestocked = new Date();

        if (notes) {
            inventory.notes = notes;
        }

        // Cambiar status si estaba agotado
        if (inventory.status === 'out_of_stock' && inventory.currentStock > 0) {
            inventory.status = 'active';
        }

        console.log(`Guardando inventario con nuevo stock: ${inventory.currentStock}`);

        // Guardar sin validaciones complejas
        await inventory.save();

        console.log(`Inventario guardado exitosamente`);

        // Disparar webhook de restock
        const product = await Product.findById(inventory.product);
        if (product) {
            await webhookService.triggerEvent('inventory.restocked', {
                productId: inventory.product.toString(),
                productName: product.name,
                productBrand: product.brand,
                quantityRestocked: quantity,
                currentStock: inventory.currentStock,
                availableStock: inventory.availableStock,
                inventoryId: inventory._id.toString(),
                restockedAt: new Date().toISOString(),
                notes: notes || null
            });
        }

        // Respuesta simple sin populate para evitar problemas
        res.json({
            success: true,
            data: {
                _id: inventory._id,
                currentStock: inventory.currentStock,
                availableStock: inventory.availableStock,
                status: inventory.status,
                lastRestocked: inventory.lastRestocked,
                notes: inventory.notes
            },
            message: `Stock reabastecido exitosamente. ${quantity} unidades agregadas.`
        });

    } catch (error) {
        console.error('Error en restockInventory:', error);
        res.status(500).json({
            success: false,
            error: error.message || "Error interno del servidor"
        });
    }
}

// Reservar stock de un producto
export async function reserveStock(req, res) {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "La cantidad debe ser mayor a 0"
            });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "Registro de inventario no encontrado"
            });
        }

        await inventory.reserveStock(quantity);
        await inventory.populate('product', 'name brand price imageUrl description categories');

        res.json({
            success: true,
            data: inventory,
            message: `Stock reservado exitosamente. ${quantity} unidades reservadas.`
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Liberar stock reservado
export async function releaseStock(req, res) {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "La cantidad debe ser mayor a 0"
            });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "Registro de inventario no encontrado"
            });
        }

        await inventory.releaseStock(quantity);
        await inventory.populate('product', 'name brand price imageUrl description categories');

        res.json({
            success: true,
            data: inventory,
            message: `Stock liberado exitosamente. ${quantity} unidades liberadas.`
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Vender stock de un producto
export async function sellStock(req, res) {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                success: false,
                error: "La cantidad debe ser mayor a 0"
            });
        }

        const inventory = await Inventory.findById(req.params.id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                error: "Registro de inventario no encontrado"
            });
        }

        await inventory.sellStock(quantity);
        await inventory.populate('product', 'name brand price imageUrl description categories');

        res.json({
            success: true,
            data: inventory,
            message: `Venta procesada exitosamente. ${quantity} unidades vendidas.`
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
}

// Obtener productos con stock bajo
export async function getLowStockProducts(req, res) {
    try {
        const products = await Inventory.getLowStockProducts();

        res.json({
            success: true,
            count: products.length,
            data: products,
            message: `Se encontraron ${products.length} productos con stock bajo`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Obtener productos agotados
export async function getOutOfStockProducts(req, res) {
    try {
        const products = await Inventory.getOutOfStockProducts();

        res.json({
            success: true,
            count: products.length,
            data: products,
            message: `Se encontraron ${products.length} productos agotados`
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Obtener estadísticas de inventario
export async function getInventoryStats(req, res) {
    try {
        const stats = await Inventory.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    totalStock: { $sum: '$currentStock' },
                    totalReserved: { $sum: '$reservedStock' },
                    totalAvailable: { $sum: '$availableStock' },
                    totalSold: { $sum: '$totalSold' },
                    avgStock: { $avg: '$currentStock' },
                    minStock: { $min: '$currentStock' },
                    maxStock: { $max: '$currentStock' }
                }
            }
        ]);

        const statusStats = await Inventory.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const lowStockCount = await Inventory.countDocuments({
            $expr: { $lte: ['$currentStock', '$minStock'] }
        });

        const outOfStockCount = await Inventory.countDocuments({
            currentStock: 0
        });

        res.json({
            success: true,
            data: {
                general: stats[0] || {},
                statusBreakdown: statusStats,
                alerts: {
                    lowStock: lowStockCount,
                    outOfStock: outOfStockCount
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Obtener alertas de inventario con configuraciones de alertas
export async function getInventoryAlerts(req, res) {
    try {
        const {
            severity,
            includeInactive = false,
            limit = 50,
            page = 1,
            sortBy = 'severity',
            sortOrder = 'desc'
        } = req.query;

        // Construir query para configuraciones de alertas
        const configQuery = includeInactive === 'true' ? {} : { status: 'active' };

        // Obtener configuraciones de alertas activas
        const alertConfigs = await AlertConfig.find(configQuery)
            .populate('product', 'name brand price imageUrl description categories');

        const alerts = [];
        const alertCounts = {
            lowStock: 0,
            criticalStock: 0,
            outOfStock: 0,
            total: 0
        };

        // Procesar cada configuración de alerta
        for (const config of alertConfigs) {
            // ✅ Validar que el producto existe y no fue eliminado
            if (!config.product || !config.product._id) {
                console.warn(`AlertConfig ${config._id} tiene producto nulo o eliminado`);
                continue;
            }

            const inventory = await Inventory.findOne({ product: config.product._id });
            if (!inventory) continue;

            const currentStock = inventory.currentStock;
            const productAlerts = [];

            // Verificar stock bajo
            if (currentStock <= config.lowStockThreshold && currentStock > config.criticalStockThreshold) {
                const alert = {
                    type: 'low_stock',
                    threshold: config.lowStockThreshold,
                    currentStock,
                    severity: 'warning',
                    shouldAlert: config.shouldSendAlert('low_stock', currentStock),
                    priority: 3
                };
                productAlerts.push(alert);
                alertCounts.lowStock++;
            }

            // Verificar stock crítico
            if (currentStock <= config.criticalStockThreshold && currentStock > config.outOfStockThreshold) {
                const alert = {
                    type: 'critical_stock',
                    threshold: config.criticalStockThreshold,
                    currentStock,
                    severity: 'error',
                    shouldAlert: config.shouldSendAlert('critical_stock', currentStock),
                    priority: 2
                };
                productAlerts.push(alert);
                alertCounts.criticalStock++;
            }

            // Verificar stock agotado
            if (currentStock <= config.outOfStockThreshold) {
                const alert = {
                    type: 'out_of_stock',
                    threshold: config.outOfStockThreshold,
                    currentStock,
                    severity: 'critical',
                    shouldAlert: config.shouldSendAlert('out_of_stock', currentStock),
                    priority: 1
                };
                productAlerts.push(alert);
                alertCounts.outOfStock++;
            }

            // Si hay alertas para este producto, agregarlo a la lista
            if (productAlerts.length > 0) {
                // Filtrar por severidad si se especifica
                let filteredAlerts = productAlerts;
                if (severity) {
                    filteredAlerts = productAlerts.filter(alert => alert.severity === severity);
                }

                if (filteredAlerts.length > 0) {
                    alerts.push({
                        product: {
                            _id: config.product._id,
                            name: config.product.name,
                            brand: config.product.brand,
                            price: config.product.price,
                            imageUrl: config.product.imageUrl,
                            description: config.product.description,
                            categories: config.product.categories
                        },
                        inventory: {
                            _id: inventory._id,
                            currentStock: inventory.currentStock,
                            minStock: inventory.minStock,
                            maxStock: inventory.maxStock,
                            availableStock: inventory.availableStock,
                            reservedStock: inventory.reservedStock,
                            status: inventory.status,
                            lastRestocked: inventory.lastRestocked,
                            lastSold: inventory.lastSold,
                            totalSold: inventory.totalSold
                        },
                        config: {
                            _id: config._id,
                            lowStockThreshold: config.lowStockThreshold,
                            criticalStockThreshold: config.criticalStockThreshold,
                            outOfStockThreshold: config.outOfStockThreshold,
                            emailAlerts: config.emailAlerts,
                            appAlerts: config.appAlerts,
                            alertFrequency: config.alertFrequency,
                            status: config.status
                        },
                        alerts: filteredAlerts,
                        highestSeverity: Math.min(...filteredAlerts.map(a => a.priority)),
                        alertCount: filteredAlerts.length
                    });
                }
            }
        }

        // Ordenar alertas
        const sortOptions = {
            'severity': (a, b) => a.highestSeverity - b.highestSeverity,
            'stock': (a, b) => a.inventory.currentStock - b.inventory.currentStock,
            'product': (a, b) => a.product.name.localeCompare(b.product.name),
            'alerts': (a, b) => b.alertCount - a.alertCount,
            'lastRestocked': (a, b) => new Date(b.inventory.lastRestocked) - new Date(a.inventory.lastRestocked)
        };

        const sortFunction = sortOptions[sortBy] || sortOptions['severity'];
        alerts.sort(sortFunction);

        if (sortOrder === 'desc' && sortBy !== 'severity') {
            alerts.reverse();
        }

        // Aplicar paginación
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;
        const paginatedAlerts = alerts.slice(skip, skip + limitNum);

        // Calcular metadatos de paginación
        const totalCount = alerts.length;
        const totalPages = Math.ceil(totalCount / limitNum);
        const hasNextPage = pageNum < totalPages;
        const hasPrevPage = pageNum > 1;

        // Calcular estadísticas adicionales
        const activeAlerts = alerts.filter(alert =>
            alert.alerts.some(a => a.shouldAlert)
        ).length;

        const criticalAlerts = alerts.filter(alert =>
            alert.alerts.some(a => a.severity === 'critical' && a.shouldAlert)
        ).length;

        res.json({
            success: true,
            count: paginatedAlerts.length,
            totalCount,
            data: paginatedAlerts,
            pagination: {
                currentPage: pageNum,
                totalPages,
                hasNextPage,
                hasPrevPage,
                nextPage: hasNextPage ? pageNum + 1 : null,
                prevPage: hasPrevPage ? pageNum - 1 : null,
                limit: limitNum,
                showing: `${skip + 1}-${Math.min(skip + limitNum, totalCount)} de ${totalCount} alertas`
            },
            statistics: {
                alertCounts,
                activeAlerts,
                criticalAlerts,
                totalProducts: alertConfigs.length,
                lastUpdated: new Date().toISOString()
            },
            filters: {
                severity: severity || null,
                includeInactive: includeInactive === 'true',
                sortBy,
                sortOrder
            }
        });

    } catch (error) {
        console.error('Error getting inventory alerts:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener alertas de inventario'
        });
    }
}
