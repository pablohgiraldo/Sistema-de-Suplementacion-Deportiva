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

// ==================== MÉTODOS OMNICANALES ====================

// Obtener discrepancias entre canales
export async function getChannelDiscrepancies(req, res) {
    try {
        const { limit = 50, page = 1 } = req.query;

        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;

        const discrepancies = await Inventory.getChannelDiscrepancies()
            .skip(skip)
            .limit(limitNum)
            .sort({ 'channels.physical.lastUpdated': -1 });

        const totalCount = await Inventory.countDocuments({
            $expr: {
                $ne: ['$channels.physical.stock', '$channels.digital.stock']
            },
            status: 'active'
        });

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            count: discrepancies.length,
            totalCount,
            data: discrepancies.map(item => ({
                ...item.toObject(),
                channelDifferences: item.getChannelDifferences()
            })),
            pagination: {
                currentPage: pageNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Error getting channel discrepancies:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener discrepancias entre canales'
        });
    }
}

// Actualizar stock físico
export async function updatePhysicalStock(req, res) {
    try {
        const { id } = req.params;
        const { quantity, location } = req.body;

        if (!quantity && quantity !== 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad es obligatoria'
            });
        }

        const inventory = await Inventory.findById(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        await inventory.updatePhysicalStock(quantity, location);

        res.json({
            success: true,
            message: 'Stock físico actualizado correctamente',
            data: {
                inventory: inventory.toObject(),
                channelDifferences: inventory.getChannelDifferences()
            }
        });

    } catch (error) {
        console.error('Error updating physical stock:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al actualizar stock físico'
        });
    }
}

// Actualizar stock digital
export async function updateDigitalStock(req, res) {
    try {
        const { id } = req.params;
        const { quantity, platform = 'website' } = req.body;

        if (!quantity && quantity !== 0) {
            return res.status(400).json({
                success: false,
                message: 'La cantidad es obligatoria'
            });
        }

        const inventory = await Inventory.findById(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        await inventory.updateDigitalStock(quantity, platform);

        res.json({
            success: true,
            message: 'Stock digital actualizado correctamente',
            data: {
                inventory: inventory.toObject(),
                channelDifferences: inventory.getChannelDifferences()
            }
        });

    } catch (error) {
        console.error('Error updating digital stock:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al actualizar stock digital'
        });
    }
}

// Sincronizar canales
export async function syncChannels(req, res) {
    try {
        const { id } = req.params;

        const inventory = await Inventory.findById(id);
        if (!inventory) {
            return res.status(404).json({
                success: false,
                message: 'Inventario no encontrado'
            });
        }

        await inventory.syncChannels();

        res.json({
            success: true,
            message: 'Canales sincronizados correctamente',
            data: {
                inventory: inventory.toObject(),
                channelDifferences: inventory.getChannelDifferences()
            }
        });

    } catch (error) {
        console.error('Error syncing channels:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al sincronizar canales'
        });
    }
}

// Obtener estadísticas omnicanales
export async function getOmnichannelStats(req, res) {
    try {
        const stats = await Inventory.getOmnichannelStats();
        const result = stats[0] || {
            totalProducts: 0,
            totalPhysicalStock: 0,
            totalDigitalStock: 0,
            totalStock: 0,
            productsWithDiscrepancies: 0,
            productsPendingSync: 0,
            productsWithSyncErrors: 0
        };

        // Calcular porcentajes
        const discrepancyRate = result.totalProducts > 0
            ? (result.productsWithDiscrepancies / result.totalProducts * 100).toFixed(2)
            : 0;

        const syncErrorRate = result.totalProducts > 0
            ? (result.productsWithSyncErrors / result.totalProducts * 100).toFixed(2)
            : 0;

        res.json({
            success: true,
            data: {
                ...result,
                discrepancyRate: parseFloat(discrepancyRate),
                syncErrorRate: parseFloat(syncErrorRate),
                lastUpdated: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Error getting omnichannel stats:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener estadísticas omnicanales'
        });
    }
}

// Obtener productos con stock físico bajo
export async function getLowPhysicalStockProducts(req, res) {
    try {
        const { limit = 50, page = 1 } = req.query;

        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;

        const products = await Inventory.getLowPhysicalStockProducts()
            .skip(skip)
            .limit(limitNum)
            .sort({ 'channels.physical.stock': 1 });

        const totalCount = await Inventory.countDocuments({
            $expr: { $lte: ['$channels.physical.stock', '$minStock'] },
            status: 'active'
        });

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            count: products.length,
            totalCount,
            data: products,
            pagination: {
                currentPage: pageNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Error getting low physical stock products:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener productos con stock físico bajo'
        });
    }
}

// Obtener productos con stock digital bajo
export async function getLowDigitalStockProducts(req, res) {
    try {
        const { limit = 50, page = 1 } = req.query;

        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;

        const products = await Inventory.getLowDigitalStockProducts()
            .skip(skip)
            .limit(limitNum)
            .sort({ 'channels.digital.stock': 1 });

        const totalCount = await Inventory.countDocuments({
            $expr: { $lte: ['$channels.digital.stock', '$minStock'] },
            status: 'active'
        });

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            count: products.length,
            totalCount,
            data: products,
            pagination: {
                currentPage: pageNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Error getting low digital stock products:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener productos con stock digital bajo'
        });
    }
}

// Obtener productos pendientes de sincronización
export async function getPendingSyncProducts(req, res) {
    try {
        const { limit = 50, page = 1 } = req.query;

        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
        const pageNum = Math.max(1, parseInt(page) || 1);
        const skip = (pageNum - 1) * limitNum;

        const products = await Inventory.getPendingSyncProducts()
            .skip(skip)
            .limit(limitNum)
            .sort({ 'channels.physical.lastUpdated': -1 });

        const totalCount = await Inventory.countDocuments({
            $or: [
                { 'channels.physical.syncStatus': 'pending' },
                { 'channels.digital.syncStatus': 'pending' }
            ],
            status: 'active'
        });

        const totalPages = Math.ceil(totalCount / limitNum);

        res.json({
            success: true,
            count: products.length,
            totalCount,
            data: products.map(item => ({
                ...item.toObject(),
                channelDifferences: item.getChannelDifferences()
            })),
            pagination: {
                currentPage: pageNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error('Error getting pending sync products:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al obtener productos pendientes de sincronización'
        });
    }
}

// Sincronizar todos los canales (endpoint principal /api/inventory/sync)
export async function syncAllChannels(req, res) {
    try {
        const {
            force = false,
            channel = 'both',
            dryRun = false,
            batchSize = 50
        } = req.body || {};

        console.log(`🔄 Iniciando sincronización omnicanal - Canal: ${channel}, Forzar: ${force}, Dry Run: ${dryRun}`);

        // Obtener productos que necesitan sincronización
        let query = {};

        if (!force) {
            query = {
                $or: [
                    { 'channels.physical.syncStatus': 'pending' },
                    { 'channels.digital.syncStatus': 'pending' },
                    { 'channels.physical.syncStatus': 'error' },
                    { 'channels.digital.syncStatus': 'error' }
                ],
                status: 'active'
            };
        } else {
            query = { status: 'active' };
        }

        const totalProducts = await Inventory.countDocuments(query);

        if (totalProducts === 0) {
            return res.json({
                success: true,
                message: 'No hay productos que requieran sincronización',
                data: {
                    totalProcessed: 0,
                    synced: 0,
                    errors: 0,
                    discrepancies: 0,
                    dryRun
                }
            });
        }

        const batchSizeNum = Math.min(100, Math.max(1, parseInt(batchSize) || 50));
        const totalBatches = Math.ceil(totalProducts / batchSizeNum);

        let processed = 0;
        let synced = 0;
        let errors = 0;
        let discrepancies = 0;
        const errorDetails = [];
        const discrepancyDetails = [];

        // Procesar en lotes
        for (let batch = 0; batch < totalBatches; batch++) {
            const skip = batch * batchSizeNum;
            const inventories = await Inventory.find(query)
                .skip(skip)
                .limit(batchSizeNum)
                .populate('product', 'name brand');

            for (const inventory of inventories) {
                try {
                    processed++;

                    // Verificar que el producto existe
                    if (!inventory.product || !inventory.product._id) {
                        console.log(`⚠️ Inventario ${inventory._id} sin producto válido, saltando...`);
                        errors++;
                        errorDetails.push({
                            inventoryId: inventory._id,
                            error: 'Producto no encontrado o referencia inválida'
                        });
                        continue;
                    }

                    // Obtener diferencias antes de sincronizar
                    const differences = inventory.getChannelDifferences();

                    if (differences.hasDiscrepancy) {
                        discrepancies++;
                        discrepancyDetails.push({
                            productId: inventory.product._id,
                            productName: inventory.product.name || 'Producto sin nombre',
                            physicalStock: differences.physicalStock,
                            digitalStock: differences.digitalStock,
                            difference: differences.difference
                        });
                    }

                    if (!dryRun) {
                        // CORRECCIÓN: En un inventario unificado, ambos canales deben reflejar el stock real
                        // No hay transferencia entre canales, sino sincronización al stock actual real
                        if (differences.hasDiscrepancy) {
                            // Obtener el documento actualizado del inventario
                            const inventoryDoc = await Inventory.findById(inventory._id);
                            if (inventoryDoc) {
                                // Sincronizar ambos canales al stock total (que es la realidad física)
                                const realStock = inventoryDoc.currentStock;
                                inventoryDoc.channels.physical.stock = realStock;
                                inventoryDoc.channels.digital.stock = realStock;
                                
                                // Marcar como sincronizado
                                const now = new Date();
                                inventoryDoc.channels.physical.lastSync = now;
                                inventoryDoc.channels.digital.lastSync = now;
                                inventoryDoc.channels.physical.lastUpdated = now;
                                inventoryDoc.channels.digital.lastUpdated = now;
                                inventoryDoc.channels.physical.syncStatus = 'synced';
                                inventoryDoc.channels.digital.syncStatus = 'synced';
                                
                                await inventoryDoc.save();
                            }
                        }

                        synced++;
                    } else {
                        // En modo dry run, solo contar
                        synced++;
                    }

                } catch (error) {
                    errors++;
                    errorDetails.push({
                        productId: inventory.product._id,
                        productName: inventory.product.name,
                        error: error.message
                    });
                    console.error(`Error sincronizando producto ${inventory.product.name}:`, error.message);
                }
            }

            // Pequeña pausa entre lotes para no sobrecargar la BD
            if (batch < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        // Obtener estadísticas finales
        const finalStats = await Inventory.getOmnichannelStats();
        const finalResult = finalStats[0] || {};

        const response = {
            success: true,
            message: dryRun
                ? `Dry run completado: ${processed} productos analizados`
                : `Sincronización completada: ${synced} productos sincronizados`,
            data: {
                totalProcessed: processed,
                synced,
                errors,
                discrepancies,
                dryRun,
                channel,
                batchSize: batchSizeNum,
                totalBatches,
                finalStats: {
                    totalProducts: finalResult.totalProducts || 0,
                    productsWithDiscrepancies: finalResult.productsWithDiscrepancies || 0,
                    productsPendingSync: finalResult.productsPendingSync || 0,
                    productsWithSyncErrors: finalResult.productsWithSyncErrors || 0
                },
                errorDetails: errors > 0 ? errorDetails : undefined,
                discrepancyDetails: discrepancies > 0 ? discrepancyDetails : undefined
            },
            timestamp: new Date().toISOString()
        };

        // Log del resultado
        console.log(`✅ Sincronización omnicanal completada:`, {
            processed,
            synced,
            errors,
            discrepancies,
            dryRun
        });

        res.json(response);

    } catch (error) {
        console.error('Error in sync all channels:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Error al sincronizar todos los canales'
        });
    }
}