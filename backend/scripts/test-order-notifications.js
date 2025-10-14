import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import notificationService from '../src/services/notificationService.js';

dotenv.config();

async function testOrderNotifications() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
        await connectDB(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar usuario pablogiral04
        const user = await User.findOne({ email: 'pablogiral04@gmail.com' });
        if (!user) {
            console.error('❌ Usuario pablogiral04@gmail.com no encontrado');
            process.exit(1);
        }

        // Actualizar email a pablo.giral04@gmail.com
        user.email = 'pablo.giral04@gmail.com';
        await user.save();
        console.log(`✅ Email actualizado: ${user.email}\n`);

        // Buscar la última orden del usuario
        const order = await Order.findOne({ user: user._id }).sort({ createdAt: -1 });

        if (!order) {
            console.error('❌ No se encontró ninguna orden para este usuario');
            process.exit(1);
        }

        console.log('📦 Orden encontrada:');
        console.log(`   - ID: ${order._id}`);
        console.log(`   - Número: ${order.orderNumber}`);
        console.log(`   - Estado actual: ${order.status}`);
        console.log(`   - Total: $${order.total.toLocaleString('es-CO')}\n`);

        // Verificar configuración de email
        console.log('📧 Verificando configuración de email...');
        const serviceStatus = notificationService.getStatus();
        console.log('   - Email habilitado:', serviceStatus.enabled);
        console.log('   - Email configurado:', serviceStatus.emailConfigured);
        console.log('   - Admin email:', serviceStatus.adminEmail);
        console.log('   - Cola de notificaciones:', serviceStatus.queueLength);
        console.log('');

        if (!serviceStatus.emailConfigured) {
            console.error('❌ Email no configurado. Verifica las variables EMAIL_USER y EMAIL_PASS en .env');
            process.exit(1);
        }

        if (!serviceStatus.enabled) {
            console.warn('⚠️  Las notificaciones por email están deshabilitadas');
            console.warn('   Activa EMAIL_NOTIFICATIONS_ENABLED=true en .env para habilitar');
        }

        // Enviar notificación de prueba
        console.log('📤 Enviando notificación de prueba...\n');

        const states = ['processing', 'shipped', 'delivered'];
        const currentStateIndex = states.indexOf(order.status);
        const nextState = currentStateIndex >= 0 && currentStateIndex < states.length - 1
            ? states[currentStateIndex + 1]
            : 'processing';

        console.log(`   Cambiando estado de "${order.status}" a "${nextState}"\n`);

        // Encolar notificación
        notificationService.addToQueue({
            type: 'order_status_change',
            data: {
                order: {
                    _id: order._id,
                    orderNumber: order.orderNumber,
                    total: order.total,
                    trackingNumber: order.trackingNumber || 'TRK123456789',
                    carrier: order.carrier || 'Servientrega',
                    trackingUrl: order.trackingUrl || 'https://www.servientrega.com/wps/portal/Colombia/seguimiento',
                    shippingAddress: order.shippingAddress
                },
                customerEmail: user.email,
                customerName: user.nombre || user.email,
                oldStatus: order.status,
                newStatus: nextState
            }
        });

        console.log('✅ Notificación encolada');
        console.log(`📧 Enviando email a: ${user.email}`);
        console.log('⏳ Procesando cola...\n');

        // Esperar a que se procese la cola
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('\n✅ Proceso completado!');
        console.log(`📬 Verifica tu bandeja de entrada en: ${user.email}`);
        console.log('   (También revisa la carpeta de spam si no lo ves)\n');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
}

testOrderNotifications();

