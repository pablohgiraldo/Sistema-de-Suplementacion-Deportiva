import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

dotenv.config();

async function createTestOrder() {
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
        console.log(`✅ Usuario encontrado: ${user.nombre} (${user.email})`);

        // Buscar productos disponibles
        const products = await Product.find().limit(3);
        if (products.length === 0) {
            console.error('❌ No hay productos disponibles');
            process.exit(1);
        }
        console.log(`✅ ${products.length} productos encontrados\n`);

        // Crear orden de prueba
        const items = products.map(product => {
            const quantity = Math.floor(Math.random() * 3) + 1;
            return {
                product: product._id,
                quantity: quantity,
                price: product.price,
                subtotal: product.price * quantity
            };
        });

        const orderData = {
            user: user._id,
            items: items,
            shippingAddress: {
                firstName: user.nombre.split(' ')[0] || 'Pablo',
                lastName: user.nombre.split(' ')[1] || 'Giraldo',
                street: 'Calle 123 #45-67',
                city: 'Medellín',
                state: 'Antioquia',
                zipCode: '050001',
                country: 'Colombia',
                phone: '3001234567'
            },
            paymentMethod: 'credit_card',
            paymentStatus: 'paid',
            status: 'processing',
            trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            carrier: 'Servientrega',
            trackingUrl: 'https://www.servientrega.com/wps/portal/Colombia/seguimiento',
            estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días desde ahora
            statusHistory: [
                {
                    status: 'pending',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // hace 2 días
                    notes: 'Orden creada',
                    location: 'Sistema'
                },
                {
                    status: 'processing',
                    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // hace 1 día
                    notes: 'Pago confirmado, preparando envío',
                    location: 'Bodega Medellín'
                }
            ]
        };

        // Calcular totales
        orderData.subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
        orderData.total = orderData.subtotal;

        const order = new Order(orderData);
        await order.save();

        console.log('✅ Orden de prueba creada exitosamente!\n');
        console.log('📦 Detalles de la orden:');
        console.log(`   - ID: ${order._id}`);
        console.log(`   - Número: ${order.orderNumber}`);
        console.log(`   - Usuario: ${user.nombre}`);
        console.log(`   - Estado: ${order.status}`);
        console.log(`   - Pago: ${order.paymentStatus}`);
        console.log(`   - Total: $${order.total.toLocaleString('es-CO')}`);
        console.log(`   - Tracking: ${order.trackingNumber}`);
        console.log(`   - Transportadora: ${order.carrier}`);
        console.log(`   - Items: ${order.items.length} productos`);
        console.log(`\n🔗 Ver en: http://localhost:3000/orders/${order._id}/tracking\n`);

        mongoose.connection.close();
        console.log('✅ Conexión cerrada');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
}

createTestOrder();

