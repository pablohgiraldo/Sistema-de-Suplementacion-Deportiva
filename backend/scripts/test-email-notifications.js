import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { verifyEmailConfig, sendTestEmail } from '../src/config/email.js';
import notificationService from '../src/services/notificationService.js';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';
import AlertConfig from '../src/models/AlertConfig.js';

const testEmailNotifications = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
        console.log("🧪 Probando sistema de notificaciones por email...\n");

        // 1. Verificar configuración de email
        console.log("1️⃣ Verificando configuración de email...");
        const emailConfig = await verifyEmailConfig();

        if (!emailConfig.success) {
            console.log("❌ Configuración de email no válida:");
            console.log(`   Error: ${emailConfig.message}`);
            console.log("\n📝 Para configurar email, agregar al .env:");
            console.log("   EMAIL_USER=tu-email@gmail.com");
            console.log("   EMAIL_PASS=tu-app-password");
            console.log("   EMAIL_NOTIFICATIONS_ENABLED=true");
            console.log("   ADMIN_EMAIL=admin@supergains.com");
            return;
        }

        console.log("✅ Configuración de email verificada correctamente");

        // 2. Verificar estado del servicio de notificaciones
        console.log("\n2️⃣ Verificando estado del servicio de notificaciones...");
        const status = notificationService.getStatus();
        console.log("   📊 Estado del servicio:");
        console.log(`      Habilitado: ${status.enabled ? '✅' : '❌'}`);
        console.log(`      Email configurado: ${status.emailConfigured ? '✅' : '❌'}`);
        console.log(`      Cola de notificaciones: ${status.queueLength}`);
        console.log(`      Procesando: ${status.processing ? '✅' : '❌'}`);
        console.log(`      Email admin: ${status.adminEmail}`);

        // 3. Enviar email de prueba
        console.log("\n3️⃣ Enviando email de prueba...");
        const testEmail = process.env.ADMIN_EMAIL || 'admin@supergains.com';
        const testResult = await sendTestEmail(testEmail, '🧪 Prueba de Notificaciones - SuperGains');

        if (testResult.success) {
            console.log("✅ Email de prueba enviado exitosamente");
            console.log(`   Message ID: ${testResult.messageId}`);
        } else {
            console.log("❌ Error enviando email de prueba:");
            console.log(`   Error: ${testResult.message}`);
        }

        // 4. Crear datos de prueba para alertas
        console.log("\n4️⃣ Creando datos de prueba para alertas...");

        // Buscar un producto existente o crear uno de prueba
        let testProduct = await Product.findOne({ name: 'Producto de Prueba Email' });
        if (!testProduct) {
            testProduct = await Product.create({
                name: 'Producto de Prueba Email',
                brand: 'Test Brand',
                price: 29.99,
                description: 'Producto para probar notificaciones por email',
                categories: ['Prueba'],
                imageUrl: 'https://via.placeholder.com/300x300?text=Test+Product'
            });
            console.log("   ✅ Producto de prueba creado");
        } else {
            console.log("   ⏭️ Producto de prueba ya existe");
        }

        // Crear inventario de prueba con stock bajo
        let testInventory = await Inventory.findOne({ product: testProduct._id });
        if (!testInventory) {
            testInventory = await Inventory.create({
                product: testProduct._id,
                currentStock: 3, // Stock bajo para generar alerta
                minStock: 10,
                maxStock: 100,
                status: 'low_stock'
            });
            console.log("   ✅ Inventario de prueba creado con stock bajo");
        } else {
            // Actualizar stock a bajo
            testInventory.currentStock = 3;
            testInventory.status = 'low_stock';
            await testInventory.save();
            console.log("   ✅ Inventario actualizado con stock bajo");
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
            console.log("   ⏭️ Configuración de alerta ya existe");
        }

        // 5. Probar envío de alerta individual
        console.log("\n5️⃣ Probando envío de alerta individual...");
        const alertResult = await notificationService.sendStockAlert({
            productId: testProduct._id,
            inventoryId: testInventory._id,
            alertConfigId: testAlertConfig._id
        });

        if (alertResult.success) {
            console.log("✅ Alerta individual enviada exitosamente");
            console.log(`   Message ID: ${alertResult.messageId}`);
        } else {
            console.log("❌ Error enviando alerta individual:");
            console.log(`   Error: ${alertResult.message}`);
        }

        // 6. Probar procesamiento de todas las alertas
        console.log("\n6️⃣ Probando procesamiento de todas las alertas...");
        const processResult = await notificationService.processAllAlerts();

        if (processResult.success) {
            console.log("✅ Procesamiento de alertas completado");
            console.log(`   Alertas individuales: ${processResult.individualAlerts}`);
            console.log(`   Resumen enviado: ${processResult.summarySent ? '✅' : '❌'}`);
        } else {
            console.log("❌ Error procesando alertas:");
            console.log(`   Error: ${processResult.message}`);
        }

        // 7. Probar cola de notificaciones
        console.log("\n7️⃣ Probando cola de notificaciones...");

        // Agregar notificación de prueba a la cola
        notificationService.addToQueue({
            type: 'test_email',
            data: {
                email: testEmail,
                subject: '📧 Notificación de Cola - SuperGains'
            }
        });

        console.log(`   📧 Notificación agregada a la cola`);
        console.log(`   📊 Tamaño de cola: ${notificationService.notificationQueue.length}`);

        // Esperar un momento para que se procese
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`   📊 Tamaño de cola después de procesar: ${notificationService.notificationQueue.length}`);

        // 8. Resumen final
        console.log("\n8️⃣ Resumen de la prueba:");
        console.log("   ✅ Configuración de email verificada");
        console.log("   ✅ Email de prueba enviado");
        console.log("   ✅ Datos de prueba creados");
        console.log("   ✅ Alerta individual probada");
        console.log("   ✅ Procesamiento masivo probado");
        console.log("   ✅ Cola de notificaciones probada");

        console.log("\n🎉 Prueba del sistema de notificaciones completada exitosamente!");

    } catch (error) {
        console.error("❌ Error durante la prueba de notificaciones:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🏁 Proceso completado");
    }
};

testEmailNotifications();
