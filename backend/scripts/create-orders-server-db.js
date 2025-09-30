import "dotenv/config";
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

async function createOrdersInServerDB() {
    try {
        // Usar la misma variable de entorno que el servidor
        const MONGODB_URI = process.env.MONGODB_URI;

        if (!MONGODB_URI) {
            console.log('❌ MONGODB_URI no está definida');
            return;
        }

        console.log('🔗 Conectando usando MONGODB_URI del servidor...');
        await mongoose.connect(MONGODB_URI);

        console.log('🔗 Conectado a:', mongoose.connection.name);
        console.log('🔗 Host:', mongoose.connection.host);

        // Verificar si hay usuarios y productos
        const userCount = await User.countDocuments();
        const productCount = await Product.countDocuments();
        const orderCount = await Order.countDocuments();

        console.log(`👥 Usuarios: ${userCount}`);
        console.log(`📦 Productos: ${productCount}`);
        console.log(`📋 Órdenes existentes: ${orderCount}`);

        if (userCount === 0 || productCount === 0) {
            console.log('❌ No hay usuarios o productos suficientes');
            console.log('💡 Necesitamos crear usuarios y productos primero');
            return;
        }

        // Obtener usuarios y productos
        const users = await User.find().limit(3);
        const products = await Product.find().limit(5);

        // Limpiar órdenes existentes
        await Order.deleteMany({});
        console.log('🧹 Órdenes anteriores eliminadas');

        // Estados y métodos de pago válidos
        const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
        const paymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'];

        // Crear órdenes de prueba
        const orders = [];

        for (let i = 0; i < 10; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const productCount = Math.floor(Math.random() * 3) + 1;
            const selectedProducts = [];

            for (let j = 0; j < productCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;

                selectedProducts.push({
                    product: product._id,
                    quantity: quantity,
                    price: product.price,
                    subtotal: product.price * quantity
                });
            }

            const subtotal = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);
            const tax = Math.round(subtotal * 0.19);
            const shipping = subtotal > 5000 ? 0 : 1000;
            const total = subtotal + tax + shipping;

            // Crear fecha aleatoria en los últimos 30 días
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
            createdAt.setHours(Math.floor(Math.random() * 24));
            createdAt.setMinutes(Math.floor(Math.random() * 60));

            const orderNumber = `ORD-${String(i + 1).padStart(6, '0')}`;

            const order = new Order({
                orderNumber: orderNumber,
                user: user._id,
                items: selectedProducts,
                subtotal: subtotal,
                tax: tax,
                shipping: shipping,
                total: total,
                status: statuses[Math.floor(Math.random() * statuses.length)],
                paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
                paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
                shippingAddress: {
                    street: `Calle ${Math.floor(Math.random() * 200) + 1} #${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 100) + 1}`,
                    city: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'][Math.floor(Math.random() * 5)],
                    state: ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Bolívar'][Math.floor(Math.random() * 5)],
                    zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
                    country: 'Colombia'
                },
                createdAt: createdAt
            });

            await order.save();
            orders.push(order);
            console.log(`✅ Orden ${orderNumber} creada`);
        }

        console.log(`\n🎉 ¡${orders.length} órdenes creadas en la base de datos del servidor!`);

        // Verificar que se crearon
        const finalCount = await Order.countDocuments();
        console.log(`📊 Total de órdenes: ${finalCount}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
    }
}

createOrdersInServerDB();
