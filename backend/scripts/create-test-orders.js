import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';

// Cargar variables de entorno
dotenv.config();

async function createTestOrders() {
    try {
        console.log('🔍 CREANDO ÓRDENES DE PRUEBA\n');

        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Buscar el usuario específico
        const user = await User.findOne({ _id: '68c109fe99e54cdf208821e5' });
        if (!user) {
            console.log('❌ Usuario no encontrado');
            return;
        }
        console.log(`👤 Usuario encontrado: ${user.nombre} (${user.email})`);

        // Buscar productos disponibles
        const products = await Product.find({ activo: true }).limit(5);
        if (products.length === 0) {
            console.log('❌ No hay productos disponibles');
            return;
        }
        console.log(`📦 Productos encontrados: ${products.length}`);

        // Crear órdenes de prueba con diferentes estados
        const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentStatuses = ['pending', 'paid', 'failed'];

        for (let i = 0; i < 5; i++) {
            const status = orderStatuses[i];
            const paymentStatus = paymentStatuses[i % paymentStatuses.length];

            // Seleccionar productos aleatorios
            const selectedProducts = products.slice(0, Math.floor(Math.random() * 3) + 1);

            const orderItems = selectedProducts.map(product => ({
                product: product._id,
                quantity: Math.floor(Math.random() * 3) + 1,
                price: product.precio
            }));

            const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const shippingCost = 10000; // $10,000 COP
            const total = subtotal + shippingCost;

            const order = new Order({
                user: user._id,
                orderNumber: `ORD-${String(Date.now()).slice(-6)}-${i + 1}`,
                status: status,
                paymentStatus: paymentStatus,
                items: orderItems,
                subtotal: subtotal,
                shippingCost: shippingCost,
                total: total,
                shipping: {
                    address: {
                        street: 'Calle 123 #45-67',
                        city: 'Bogotá',
                        department: 'Cundinamarca',
                        postalCode: '110111',
                        country: 'Colombia'
                    },
                    method: 'standard',
                    estimatedDays: 3
                },
                payment: {
                    method: 'credit_card',
                    cardLast4: '1234',
                    cardBrand: 'visa'
                },
                notes: `Orden de prueba ${i + 1} - Estado: ${status}`
            });

            await order.save();
            console.log(`✅ Orden creada: ${order.orderNumber} - Estado: ${status} - Total: $${total.toLocaleString()}`);
        }

        // Verificar las órdenes creadas
        const userOrders = await Order.find({ user: user._id }).populate('user', 'nombre email');
        console.log(`\n📊 Total de órdenes para ${user.nombre}: ${userOrders.length}`);

        userOrders.forEach(order => {
            console.log(`   - ${order.orderNumber}: ${order.status} - $${order.total.toLocaleString()}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Órdenes de prueba creadas exitosamente');

    } catch (error) {
        console.error('❌ Error:', error.message);
        await mongoose.disconnect();
    }
}

// Ejecutar creación de órdenes
createTestOrders();