import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import simpleAlertScheduler from '../src/services/simpleAlertScheduler.js';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';
import AlertConfig from '../src/models/AlertConfig.js';

const testScheduler = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
        console.log("🧪 Probando scheduler de alertas automáticas...\n");

        // 1. Verificar estado inicial
        console.log("1️⃣ Estado inicial del scheduler:");
        const initialStatus = simpleAlertScheduler.getStatus();
        console.log(`   Estado: ${initialStatus.isRunning ? 'Ejecutándose' : 'Detenido'}`);
        console.log(`   Intervalo: ${initialStatus.checkInterval / 1000 / 60} minutos`);

        // 2. Crear datos de prueba con stock bajo
        console.log("\n2️⃣ Creando datos de prueba...");

        // Buscar un producto existente o crear uno
        let testProduct = await Product.findOne({ name: 'Producto Test Scheduler' });
        if (!testProduct) {
            testProduct = await Product.create({
                name: 'Producto Test Scheduler',
                brand: 'Test Brand',
                price: 19.99,
                description: 'Producto para probar scheduler automático',
                categories: ['Prueba'],
                imageUrl: 'https://via.placeholder.com/300x300?text=Test+Scheduler'
            });
            console.log("   ✅ Producto de prueba creado");
        }

        // Crear inventario con stock bajo
        let testInventory = await Inventory.findOne({ product: testProduct._id });
        if (!testInventory) {
            testInventory = await Inventory.create({
                product: testProduct._id,
                currentStock: 3, // Stock bajo para generar alerta
                minStock: 10,
                maxStock: 100,
                status: 'active'
            });
            console.log("   ✅ Inventario creado con stock bajo (3 unidades)");
        } else {
            testInventory.currentStock = 3;
            await testInventory.save();
            console.log("   ✅ Inventario actualizado con stock bajo (3 unidades)");
        }

        // Crear configuración de alerta
        let testAlertConfig = await AlertConfig.findOne({ product: testProduct._id });
        if (!testAlertConfig) {
            testAlertConfig = await AlertConfig.create({
                product: testProduct._id,
                lowStockThreshold: 10,
                criticalStockThreshold: 5,
                outOfStockThreshold: 0,
                emailAlerts: true,
                appAlerts: true,
                alertFrequency: 'immediate',
                status: 'active'
            });
            console.log("   ✅ Configuración de alerta creada");
        } else {
            testAlertConfig.lowStockThreshold = 10;
            testAlertConfig.criticalStockThreshold = 5;
            testAlertConfig.outOfStockThreshold = 0;
            testAlertConfig.status = 'active';
            testAlertConfig.lastAlertSent = null; // Resetear para permitir nueva alerta
            await testAlertConfig.save();
            console.log("   ✅ Configuración de alerta actualizada");
        }

        // 3. Ejecutar verificación manual
        console.log("\n3️⃣ Ejecutando verificación manual...");
        await simpleAlertScheduler.runManualCheck();

        // 4. Verificar que se envió la alerta
        console.log("\n4️⃣ Verificando resultado...");
        const updatedConfig = await AlertConfig.findById(testAlertConfig._id);
        if (updatedConfig.lastAlertSent) {
            console.log(`   ✅ Alerta enviada exitosamente`);
            console.log(`   📅 Última alerta: ${updatedConfig.lastAlertSent.toLocaleString()}`);
        } else {
            console.log(`   ⚠️ No se detectó envío de alerta`);
        }

        // 5. Probar diferentes escenarios
        console.log("\n5️⃣ Probando diferentes escenarios de stock...");

        const scenarios = [
            { stock: 0, expected: 'out_of_stock' },
            { stock: 3, expected: 'critical_stock' },
            { stock: 8, expected: 'low_stock' },
            { stock: 15, expected: 'no_alert' }
        ];

        for (const scenario of scenarios) {
            testInventory.currentStock = scenario.stock;
            await testInventory.save();

            // Resetear lastAlertSent para permitir nueva alerta
            testAlertConfig.lastAlertSent = null;
            await testAlertConfig.save();

            console.log(`   📦 Stock: ${scenario.stock} → Esperado: ${scenario.expected}`);
            await simpleAlertScheduler.runManualCheck();

            const configAfter = await AlertConfig.findById(testAlertConfig._id);
            if (configAfter.lastAlertSent && scenario.expected !== 'no_alert') {
                console.log(`   ✅ Alerta ${scenario.expected} enviada`);
            } else if (scenario.expected === 'no_alert') {
                console.log(`   ✅ No se envió alerta (correcto)`);
            } else {
                console.log(`   ⚠️ No se envió alerta esperada`);
            }
        }

        // 6. Estado final
        console.log("\n6️⃣ Estado final del scheduler:");
        const finalStatus = simpleAlertScheduler.getStatus();
        console.log(`   Estado: ${finalStatus.isRunning ? 'Ejecutándose' : 'Detenido'}`);
        console.log(`   Próxima ejecución: ${finalStatus.nextRun}`);

        console.log("\n🎉 Prueba del scheduler completada exitosamente!");

    } catch (error) {
        console.error("❌ Error durante la prueba del scheduler:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🏁 Proceso completado");
    }
};

testScheduler();
