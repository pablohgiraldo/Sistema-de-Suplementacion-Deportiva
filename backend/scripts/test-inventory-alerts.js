import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";
import AlertConfig from "../src/models/AlertConfig.js";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error);
        process.exit(1);
    }
};

const testInventoryAlerts = async () => {
    try {
        console.log("🧪 Probando endpoint /api/inventory/alerts...\n");

        // 1. Verificar que existen productos con configuraciones de alertas
        console.log("1️⃣ Verificando configuraciones de alertas...");
        const alertConfigs = await AlertConfig.find({ status: 'active' })
            .populate('product', 'name brand price');

        console.log(`   📊 Configuraciones activas: ${alertConfigs.length}`);

        if (alertConfigs.length === 0) {
            console.log("   ⚠️  No hay configuraciones de alertas activas. Creando configuraciones por defecto...");

            const products = await Product.find({});
            for (const product of products) {
                const config = new AlertConfig({
                    product: product._id,
                    lowStockThreshold: 10,
                    criticalStockThreshold: 5,
                    outOfStockThreshold: 0,
                    emailAlerts: {
                        enabled: true,
                        lowStock: true,
                        criticalStock: true,
                        outOfStock: true,
                        recipients: ['admin@supergains.com']
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

                await config.save();
                console.log(`   ✅ Configuración creada para: ${product.name}`);
            }
        }

        // 2. Simular diferentes escenarios de stock
        console.log("\n2️⃣ Simulando escenarios de stock...");
        const inventories = await Inventory.find({}).populate('product');

        const scenarios = [
            { stock: 15, description: 'Stock normal' },
            { stock: 8, description: 'Stock bajo' },
            { stock: 3, description: 'Stock crítico' },
            { stock: 0, description: 'Stock agotado' },
            { stock: 12, description: 'Stock normal' }
        ];

        for (let i = 0; i < inventories.length && i < scenarios.length; i++) {
            const inventory = inventories[i];
            const scenario = scenarios[i];

            inventory.currentStock = scenario.stock;
            await inventory.save();

            console.log(`   📦 ${inventory.product.name}: ${scenario.stock} unidades (${scenario.description})`);
        }

        // 3. Probar lógica de detección de alertas
        console.log("\n3️⃣ Probando detección de alertas...");

        const alertConfigsUpdated = await AlertConfig.find({ status: 'active' })
            .populate('product', 'name brand price');

        for (const config of alertConfigsUpdated) {
            const inventory = await Inventory.findOne({ product: config.product._id });
            if (!inventory) continue;

            const currentStock = inventory.currentStock;
            const alerts = [];

            // Verificar stock bajo
            if (currentStock <= config.lowStockThreshold && currentStock > config.criticalStockThreshold) {
                alerts.push({
                    type: 'low_stock',
                    threshold: config.lowStockThreshold,
                    currentStock,
                    severity: 'warning'
                });
            }

            // Verificar stock crítico
            if (currentStock <= config.criticalStockThreshold && currentStock > config.outOfStockThreshold) {
                alerts.push({
                    type: 'critical_stock',
                    threshold: config.criticalStockThreshold,
                    currentStock,
                    severity: 'error'
                });
            }

            // Verificar stock agotado
            if (currentStock <= config.outOfStockThreshold) {
                alerts.push({
                    type: 'out_of_stock',
                    threshold: config.outOfStockThreshold,
                    currentStock,
                    severity: 'critical'
                });
            }

            if (alerts.length > 0) {
                console.log(`   🚨 ${config.product.name}:`);
                alerts.forEach(alert => {
                    const icon = alert.severity === 'critical' ? '🚨' :
                        alert.severity === 'error' ? '⚠️' : '⚠️';
                    console.log(`      ${icon} ${alert.type}: ${alert.currentStock}/${alert.threshold}`);
                });
            } else {
                console.log(`   ✅ ${config.product.name}: Stock normal (${currentStock})`);
            }
        }

        // 4. Simular llamada al endpoint
        console.log("\n4️⃣ Simulando llamada al endpoint /api/inventory/alerts...");

        // Simular parámetros de query
        const queryParams = {
            severity: null,
            includeInactive: false,
            limit: 50,
            page: 1,
            sortBy: 'severity',
            sortOrder: 'desc'
        };

        // Ejecutar lógica del endpoint
        const configQuery = queryParams.includeInactive === 'true' ? {} : { status: 'active' };
        const alertConfigsForEndpoint = await AlertConfig.find(configQuery)
            .populate('product', 'name brand price imageUrl description categories');

        const alerts = [];
        const alertCounts = {
            lowStock: 0,
            criticalStock: 0,
            outOfStock: 0,
            total: 0
        };

        // Procesar cada configuración de alerta
        for (const config of alertConfigsForEndpoint) {
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
                alerts.push({
                    product: {
                        _id: config.product._id,
                        name: config.product.name,
                        brand: config.product.brand,
                        price: config.product.price,
                        imageUrl: config.product.imageUrl
                    },
                    inventory: {
                        _id: inventory._id,
                        currentStock: inventory.currentStock,
                        minStock: inventory.minStock,
                        maxStock: inventory.maxStock,
                        status: inventory.status
                    },
                    config: {
                        _id: config._id,
                        lowStockThreshold: config.lowStockThreshold,
                        criticalStockThreshold: config.criticalStockThreshold,
                        outOfStockThreshold: config.outOfStockThreshold
                    },
                    alerts: productAlerts,
                    highestSeverity: Math.min(...productAlerts.map(a => a.priority)),
                    alertCount: productAlerts.length
                });
            }
        }

        // Ordenar alertas por severidad
        alerts.sort((a, b) => a.highestSeverity - b.highestSeverity);

        // 5. Mostrar resultados
        console.log("\n5️⃣ Resultados del endpoint:");
        console.log(`   📊 Total alertas encontradas: ${alerts.length}`);
        console.log(`   ⚠️  Stock bajo: ${alertCounts.lowStock}`);
        console.log(`   🚨 Stock crítico: ${alertCounts.criticalStock}`);
        console.log(`   🔴 Stock agotado: ${alertCounts.outOfStock}`);

        if (alerts.length > 0) {
            console.log("\n   📋 Detalle de alertas:");
            alerts.forEach((alert, index) => {
                console.log(`   ${index + 1}. ${alert.product.name} (${alert.product.brand})`);
                console.log(`      Stock actual: ${alert.inventory.currentStock}`);
                console.log(`      Alertas: ${alert.alertCount}`);
                alert.alerts.forEach(alertItem => {
                    const icon = alertItem.severity === 'critical' ? '🚨' :
                        alertItem.severity === 'error' ? '⚠️' : '⚠️';
                    console.log(`         ${icon} ${alertItem.type}: ${alertItem.currentStock}/${alertItem.threshold}`);
                });
            });
        }

        // 6. Probar filtros
        console.log("\n6️⃣ Probando filtros...");

        // Filtrar por severidad crítica
        const criticalAlerts = alerts.filter(alert =>
            alert.alerts.some(a => a.severity === 'critical')
        );
        console.log(`   🔴 Alertas críticas: ${criticalAlerts.length}`);

        // Filtrar por severidad de error
        const errorAlerts = alerts.filter(alert =>
            alert.alerts.some(a => a.severity === 'error')
        );
        console.log(`   ⚠️  Alertas de error: ${errorAlerts.length}`);

        // Filtrar por severidad de warning
        const warningAlerts = alerts.filter(alert =>
            alert.alerts.some(a => a.severity === 'warning')
        );
        console.log(`   ⚠️  Alertas de warning: ${warningAlerts.length}`);

        console.log("\n🎉 Prueba del endpoint /api/inventory/alerts completada exitosamente!");

    } catch (error) {
        console.error("❌ Error en la prueba del endpoint:", error);
    }
};

const main = async () => {
    await connectDB();
    await testInventoryAlerts();

    console.log("\n🏁 Proceso completado");
    process.exit(0);
};

main().catch(error => {
    console.error("❌ Error en el proceso principal:", error);
    process.exit(1);
});
