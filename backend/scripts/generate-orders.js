import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import Inventory from '../src/models/Inventory.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

dotenv.config();

// Conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB conectado para generar datos de prueba');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Función para generar órdenes de prueba
const generateOrders = async () => {
    console.log('🚀 Generando órdenes de prueba para dashboard omnicanal...\n');

    try {
        // 1. Obtener usuarios existentes
        const users = await User.find().limit(3);
        console.log(`✅ ${users.length} usuarios encontrados`);

        // 2. Obtener productos existentes
        const products = await Product.find().limit(3);
        console.log(`✅ ${products.length} productos encontrados`);

        if (users.length === 0 || products.length === 0) {
            console.log('❌ No hay suficientes usuarios o productos');
            return;
        }

        // 3. Generar órdenes online
        console.log('\n💻 Generando órdenes online...');
        const onlineOrders = [];

        for (let i = 0; i < 8; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;
            const price = product.price;
            const subtotal = quantity * price;
            const tax = subtotal * 0.19;
            const total = subtotal + tax;

            onlineOrders.push({
                user: user._id,
                orderNumber: `ON${Date.now()}${i}`,
                items: [{
                    product: product._id,
                    quantity,
                    price,
                    total: subtotal,
                    subtotal: subtotal
                }],
                subtotal,
                tax,
                total,
                status: ['delivered', 'shipped'][Math.floor(Math.random() * 2)],
                paymentMethod: 'credit_card',
                paymentStatus: 'paid',
                salesChannel: 'online',
                shippingAddress: {
                    firstName: user.nombre.split(' ')[0],
                    lastName: user.nombre.split(' ')[1] || 'Apellido',
                    street: 'Calle 123 #45-67',
                    city: 'Bogotá',
                    state: 'Cundinamarca',
                    zipCode: '110111',
                    country: 'Colombia',
                    phone: '3001234567'
                },
                createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000)
            });
        }

        await Order.insertMany(onlineOrders);
        console.log(`✅ ${onlineOrders.length} órdenes online creadas`);

        // 4. Generar órdenes físicas
        console.log('\n🏪 Generando órdenes físicas...');
        const physicalOrders = [];

        for (let i = 0; i < 5; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;
            const price = product.price;
            const subtotal = quantity * price;
            const tax = subtotal * 0.19;
            const total = subtotal + tax;

            physicalOrders.push({
                user: user._id,
                orderNumber: `FS${Date.now()}${i}`,
                items: [{
                    product: product._id,
                    quantity,
                    price,
                    total: subtotal,
                    subtotal: subtotal
                }],
                subtotal,
                tax,
                total,
                status: 'delivered',
                paymentMethod: 'cash',
                paymentStatus: 'paid',
                salesChannel: 'physical_store',
                physicalSale: {
                    storeLocation: 'Tienda Principal',
                    cashierId: users[0]._id,
                    cashierName: users[0].nombre,
                    registerNumber: 1,
                    receiptNumber: `R${Date.now()}${i}`
                },
                createdAt: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000)
            });
        }

        await Order.insertMany(physicalOrders);
        console.log(`✅ ${physicalOrders.length} órdenes físicas creadas`);

        // 5. Mostrar resumen
        console.log('\n📊 RESUMEN DE ÓRDENES GENERADAS:');
        console.log('================================');

        const totalOrders = await Order.countDocuments();
        const onlineCount = await Order.countDocuments({ salesChannel: 'online' });
        const physicalCount = await Order.countDocuments({ salesChannel: 'physical_store' });

        console.log(`🛒 Total órdenes: ${totalOrders}`);
        console.log(`   💻 Online: ${onlineCount}`);
        console.log(`   🏪 Físicas: ${physicalCount}`);

        console.log('\n✅ Órdenes de prueba generadas exitosamente!');
        console.log('🎯 Ahora el dashboard omnicanal debería mostrar datos reales.');

    } catch (error) {
        console.error('❌ Error generando órdenes:', error);
    }
};

// Función principal
const main = async () => {
    await connectDB();
    await generateOrders();
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
};

// Ejecutar script
main().catch(error => {
    console.error('❌ Error en script principal:', error);
    process.exit(1);
});
