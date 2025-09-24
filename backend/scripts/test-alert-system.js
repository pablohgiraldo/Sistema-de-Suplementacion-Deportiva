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

const testAlertSystem = async () => {
    try {
        console.log("🧪 Iniciando pruebas del sistema de alertas...\n");

        // 1. Crear configuraciones de alertas por defecto
        console.log("1️⃣ Creando configuraciones de alertas por defecto...");
        const products = await Product.find({});

        for (const product of products) {
            const existingConfig = await AlertConfig.findOne({ product: product._id });
            if (!existingConfig) {
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
            } else {
                console.log(`   ⏭️  Configuración ya existe para: ${product.name}`);
            }
        }

        // 2. Simular diferentes niveles de stock
        console.log("\n2️⃣ Simulando diferentes niveles de stock...");

        const inventories = await Inventory.find({}).populate('product');

        for (let i = 0; i < inventories.length; i++) {
            const inventory = inventories[i];
            const config = await AlertConfig.findOne({ product: inventory.product._id });

            if (config) {
                // Simular diferentes escenarios
                const scenarios = [
                    { stock: 15, description: 'Stock normal' },
                    { stock: 8, description: 'Stock bajo' },
                    { stock: 3, description: 'Stock crítico' },
                    { stock: 0, description: 'Stock agotado' }
                ];

                const scenario = scenarios[i % scenarios.length];
                inventory.currentStock = scenario.stock;
                await inventory.save();

                console.log(`   📦 ${inventory.product.name}: ${scenario.stock} unidades (${scenario.description})`);
            }
        }

        // 3. Probar detección de alertas
        console.log("\n3️⃣ Probando detección de alertas...");

        const alertConfigs = await AlertConfig.find({ status: 'active' })
            .populate('product', 'name brand');

        for (const config of alertConfigs) {
            const inventory = await Inventory.findOne({ product: config.product._id });
            if (inventory) {
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
        }

        // 4. Probar métodos estáticos del modelo
        console.log("\n4️⃣ Probando métodos estáticos del modelo...");

        const lowStockProducts = await AlertConfig.getProductsNeedingAlerts(10);
        console.log(`   📊 Productos con stock bajo (≤10): ${lowStockProducts.length}`);

        const activeConfigs = await AlertConfig.getActiveConfigs();
        console.log(`   ⚙️  Configuraciones activas: ${activeConfigs.length}`);

        // 5. Probar virtuals y métodos
        console.log("\n5️⃣ Probando virtuals y métodos del modelo...");

        const testConfig = await AlertConfig.findOne().populate('product');
        if (testConfig) {
            console.log(`   📋 Configuración de prueba: ${testConfig.product.name}`);
            console.log(`   🔔 Alertas activas: ${testConfig.hasActiveAlerts ? 'Sí' : 'No'}`);
            console.log(`   📊 Thresholds:`, testConfig.thresholds);

            // Probar método shouldSendAlert
            const shouldSend = testConfig.shouldSendAlert('low_stock', 5);
            console.log(`   📤 Debe enviar alerta de stock bajo: ${shouldSend ? 'Sí' : 'No'}`);
        }

        // 6. Estadísticas finales
        console.log("\n6️⃣ Estadísticas finales...");

        const totalConfigs = await AlertConfig.countDocuments();
        const activeConfigsCount = await AlertConfig.countDocuments({ status: 'active' });
        const totalProducts = await Product.countDocuments();
        const totalInventories = await Inventory.countDocuments();

        console.log(`   📦 Total productos: ${totalProducts}`);
        console.log(`   📊 Total inventarios: ${totalInventories}`);
        console.log(`   ⚙️  Total configuraciones: ${totalConfigs}`);
        console.log(`   ✅ Configuraciones activas: ${activeConfigsCount}`);

        // Contar alertas por tipo
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

        console.log(`   ⚠️  Alertas de stock bajo: ${lowStockCount}`);
        console.log(`   🚨 Alertas de stock crítico: ${criticalStockCount}`);
        console.log(`   🔴 Alertas de stock agotado: ${outOfStockCount}`);

        console.log("\n🎉 Pruebas del sistema de alertas completadas exitosamente!");

    } catch (error) {
        console.error("❌ Error en las pruebas del sistema de alertas:", error);
    }
};

const main = async () => {
    await connectDB();
    await testAlertSystem();

    console.log("\n🏁 Proceso completado");
    process.exit(0);
};

main().catch(error => {
    console.error("❌ Error en el proceso principal:", error);
    process.exit(1);
});
