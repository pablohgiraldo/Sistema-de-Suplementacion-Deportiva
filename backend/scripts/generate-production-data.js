import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import Inventory from '../src/models/Inventory.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';

dotenv.config();

// Conectar a MongoDB de producción
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB de producción conectado');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Función para generar órdenes en producción
const generateProductionOrders = async () => {
    console.log('🚀 Generando órdenes de prueba en PRODUCCIÓN...\n');

    try {
        // 1. Obtener usuarios existentes en producción
        const users = await User.find().limit(3);
        console.log(`✅ ${users.length} usuarios encontrados en producción`);

        // 2. Obtener productos existentes en producción
        const products = await Product.find().limit(3);
        console.log(`✅ ${products.length} productos encontrados en producción`);

        if (users.length === 0 || products.length === 0) {
            console.log('❌ No hay suficientes usuarios o productos en producción');
            return;
        }

        // 3. Verificar órdenes existentes
        const existingOrders = await Order.countDocuments();
        console.log(`📊 Órdenes existentes en producción: ${existingOrders}`);

        // 4. Generar órdenes online para producción
        console.log('\n💻 Generando órdenes online para producción...');
        const onlineOrders = [];
        
        for (let i = 0; i < 10; i++) {
            const user = users[Math.floor(Math.random() * users.length)];
            const product = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 2) + 1;
            const price = product.price;
            const subtotal = quantity * price;
            const tax = subtotal * 0.19;
            const total = subtotal + tax;

            onlineOrders.push({
                user: user._id,
                orderNumber: `PROD-ON${Date.now()}${i}`,
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
                    firstName: user.nombre.split(' ')[0] || 'Usuario',
                    lastName: user.nombre.split(' ')[1] || 'Prueba',
                    street: 'Calle 123 #45-67',
                    city: 'Bogotá',
                    state: 'Cundinamarca',
                    zipCode: '110111',
                    country: 'Colombia',
                    phone: '3001234567'
                },
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }

        await Order.insertMany(onlineOrders);
        console.log(`✅ ${onlineOrders.length} órdenes online creadas en producción`);

        // 5. Generar órdenes físicas para producción
        console.log('\n🏪 Generando órdenes físicas para producción...');
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
                orderNumber: `PROD-FS${Date.now()}${i}`,
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
                    receiptNumber: `PROD-R${Date.now()}${i}`
                },
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }

        await Order.insertMany(physicalOrders);
        console.log(`✅ ${physicalOrders.length} órdenes físicas creadas en producción`);

        // 6. Crear inventario omnicanal para productos en producción
        console.log('\n🏪 Configurando inventario omnicanal en producción...');
        for (const product of products) {
            const existingInventory = await Inventory.findOne({ product: product._id });
            
            if (!existingInventory) {
                await Inventory.create({
                    product: product._id,
                    currentStock: product.stock || 50,
                    minStock: 10,
                    maxStock: 100,
                    status: 'active',
                    channels: {
                        physical: {
                            stock: Math.floor((product.stock || 50) * 0.6),
                            location: 'Tienda Principal',
                            lastUpdated: new Date(),
                            syncStatus: 'synced'
                        },
                        digital: {
                            stock: Math.floor((product.stock || 50) * 0.4),
                            platform: 'website',
                            lastUpdated: new Date(),
                            syncStatus: 'synced'
                        }
                    }
                });
            }
        }
        console.log(`✅ Inventario omnicanal configurado para ${products.length} productos en producción`);

        // 7. Crear discrepancias intencionalmente para pruebas
        console.log('\n⚠️ Creando discrepancias de inventario en producción...');
        const inventories = await Inventory.find().limit(2);
        
        for (const inventory of inventories) {
            inventory.channels.physical.stock = Math.floor(Math.random() * 20) + 5;
            inventory.channels.digital.stock = Math.floor(Math.random() * 20) + 5;
            inventory.channels.physical.syncStatus = 'pending';
            inventory.channels.digital.syncStatus = 'synced';
            inventory.channels.physical.lastUpdated = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            inventory.channels.digital.lastUpdated = new Date();
            
            await inventory.save();
        }
        console.log(`✅ ${inventories.length} discrepancias de inventario creadas en producción`);

        // 8. Mostrar resumen final
        console.log('\n📊 RESUMEN FINAL DE PRODUCCIÓN:');
        console.log('===============================');
        
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalInventory = await Inventory.countDocuments();
        
        const onlineCount = await Order.countDocuments({ salesChannel: 'online' });
        const physicalCount = await Order.countDocuments({ salesChannel: 'physical_store' });
        
        const discrepanciesCount = await Inventory.countDocuments({
            $expr: {
                $ne: ['$channels.physical.stock', '$channels.digital.stock']
            }
        });

        console.log(`👥 Usuarios: ${totalUsers}`);
        console.log(`📦 Productos: ${totalProducts}`);
        console.log(`📋 Inventario: ${totalInventory}`);
        console.log(`🛒 Órdenes totales: ${totalOrders}`);
        console.log(`   💻 Online: ${onlineCount}`);
        console.log(`   🏪 Físicas: ${physicalCount}`);
        console.log(`⚠️ Discrepancias: ${discrepanciesCount}`);

        console.log('\n✅ Datos de prueba generados en PRODUCCIÓN exitosamente!');
        console.log('🎯 El dashboard omnicanal en producción ahora debería mostrar datos reales.');

    } catch (error) {
        console.error('❌ Error generando datos en producción:', error);
    }
};

// Función principal
const main = async () => {
    await connectDB();
    await generateProductionOrders();
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB de producción');
    process.exit(0);
};

// Ejecutar script
main().catch(error => {
    console.error('❌ Error en script principal:', error);
    process.exit(1);
});
