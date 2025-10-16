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
        console.log('✅ MongoDB conectado para datos de prueba');
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Función para generar datos de prueba
const generateTestData = async () => {
    console.log('🚀 Generando datos de prueba para dashboard omnicanal...\n');

    try {
        // 1. Obtener o crear usuarios de prueba
        console.log('👥 Obteniendo usuarios de prueba...');
        let testUsers = await User.find({ email: { $regex: /@test\.com$/ } });
        
        if (testUsers.length === 0) {
            console.log('Creando usuarios de prueba...');
            testUsers = await User.insertMany([
                {
                    nombre: 'Juan Pérez',
                    email: 'juan.perez@test.com',
                    contraseña: 'password123',
                    rol: 'usuario',
                    activo: true
                },
                {
                    nombre: 'María García',
                    email: 'maria.garcia@test.com',
                    contraseña: 'password123',
                    rol: 'usuario',
                    activo: true
                },
                {
                    nombre: 'Carlos López',
                    email: 'carlos.lopez@test.com',
                    contraseña: 'password123',
                    rol: 'usuario',
                    activo: true
                },
                {
                    nombre: 'Ana Martínez',
                    email: 'ana.martinez@test.com',
                    contraseña: 'password123',
                    rol: 'usuario',
                    activo: true
                },
                {
                    nombre: 'Luis Rodríguez',
                    email: 'luis.rodriguez@test.com',
                    contraseña: 'password123',
                    rol: 'usuario',
                    activo: true
                }
            ]);
            console.log(`✅ ${testUsers.length} usuarios creados`);
        } else {
            console.log(`✅ ${testUsers.length} usuarios de prueba encontrados`);
        }

        // 2. Obtener productos existentes
        console.log('\n📦 Obteniendo productos existentes...');
        let products = await Product.find({ status: 'active' }).limit(10);
        
        if (products.length === 0) {
            console.log('⚠️ No hay productos activos. Creando productos de prueba...');
            const testProducts = await Product.insertMany([
                {
                    name: 'Proteína Whey Premium',
                    brand: 'SuperGains',
                    price: 8990,
                    category: 'proteínas',
                    description: 'Proteína de suero de leche de alta calidad',
                    stock: 50,
                    status: 'active'
                },
                {
                    name: 'Creatina Monohidrato',
                    brand: 'SuperGains',
                    price: 4590,
                    category: 'creatina',
                    description: 'Creatina monohidrato micronizada',
                    stock: 30,
                    status: 'active'
                },
                {
                    name: 'BCAA 2:1:1',
                    brand: 'SuperGains',
                    price: 6990,
                    category: 'aminoácidos',
                    description: 'Aminoácidos de cadena ramificada',
                    stock: 25,
                    status: 'active'
                },
                {
                    name: 'Multivitamínico',
                    brand: 'SuperGains',
                    price: 3990,
                    category: 'vitaminas',
                    description: 'Complejo multivitamínico completo',
                    stock: 40,
                    status: 'active'
                },
                {
                    name: 'Omega 3',
                    brand: 'SuperGains',
                    price: 5490,
                    category: 'omega',
                    description: 'Aceite de pescado rico en omega 3',
                    stock: 35,
                    status: 'active'
                }
            ]);
            products = testProducts;
            console.log(`✅ ${testProducts.length} productos de prueba creados`);
        } else {
            console.log(`✅ ${products.length} productos encontrados`);
        }

        // 3. Crear inventario omnicanal para productos
        console.log('\n🏪 Configurando inventario omnicanal...');
        for (const product of products) {
            const existingInventory = await Inventory.findOne({ product: product._id });
            
            if (!existingInventory) {
                await Inventory.create({
                    product: product._id,
                    currentStock: product.stock,
                    minStock: Math.floor(product.stock * 0.2),
                    maxStock: product.stock * 2,
                    status: 'active',
                    channels: {
                        physical: {
                            stock: Math.floor(product.stock * 0.6),
                            location: 'Tienda Principal',
                            lastUpdated: new Date(),
                            syncStatus: 'synced'
                        },
                        digital: {
                            stock: Math.floor(product.stock * 0.4),
                            platform: 'E-commerce',
                            lastUpdated: new Date(),
                            syncStatus: 'synced'
                        }
                    }
                });
            }
        }
        console.log(`✅ Inventario omnicanal configurado para ${products.length} productos`);

        // 4. Generar órdenes online (digitales)
        console.log('\n💻 Generando órdenes online...');
        const onlineOrders = [];
        const onlineChannels = ['online', 'mobile_app'];
        
        for (let i = 0; i < 15; i++) {
            const user = testUsers[Math.floor(Math.random() * testUsers.length)];
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let subtotal = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const price = product.price;
                const total = quantity * price;
                
                items.push({
                    product: product._id,
                    quantity,
                    price,
                    total
                });
                subtotal += total;
            }

            const tax = subtotal * 0.19;
            const total = subtotal + tax;

            onlineOrders.push({
                user: user._id,
                orderNumber: `ON${Date.now()}${i}`,
                items,
                subtotal,
                tax,
                total,
                status: ['pending', 'processing', 'shipped', 'delivered'][Math.floor(Math.random() * 4)],
                paymentMethod: ['credit_card', 'debit_card', 'paypal'][Math.floor(Math.random() * 3)],
                paymentStatus: ['pending', 'completed', 'failed'][Math.floor(Math.random() * 3)],
                salesChannel: onlineChannels[Math.floor(Math.random() * onlineChannels.length)],
                shippingAddress: user.address,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }

        await Order.insertMany(onlineOrders);
        console.log(`✅ ${onlineOrders.length} órdenes online creadas`);

        // 5. Generar órdenes físicas
        console.log('\n🏪 Generando órdenes físicas...');
        const physicalOrders = [];
        const cashiers = [
            { id: testUsers[0]._id, name: 'Juan Pérez' },
            { id: testUsers[1]._id, name: 'María García' }
        ];
        const storeLocations = ['Tienda Principal', 'Sucursal Norte', 'Sucursal Sur'];

        for (let i = 0; i < 10; i++) {
            const user = testUsers[Math.floor(Math.random() * testUsers.length)];
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let subtotal = 0;

            for (let j = 0; j < numItems; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                const price = product.price;
                const total = quantity * price;
                
                items.push({
                    product: product._id,
                    quantity,
                    price,
                    total
                });
                subtotal += total;
            }

            const tax = subtotal * 0.19;
            const total = subtotal + tax;
            const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];

            physicalOrders.push({
                user: user._id,
                orderNumber: `FS${Date.now()}${i}`,
                items,
                subtotal,
                tax,
                total,
                status: ['completed', 'processing'][Math.floor(Math.random() * 2)],
                paymentMethod: ['cash', 'card_physical'][Math.floor(Math.random() * 2)],
                paymentStatus: 'completed',
                salesChannel: 'physical_store',
                physicalSale: {
                    storeLocation: storeLocations[Math.floor(Math.random() * storeLocations.length)],
                    cashierId: cashier.id,
                    cashierName: cashier.name,
                    registerNumber: Math.floor(Math.random() * 5) + 1,
                    receiptNumber: `R${Date.now()}${i}`
                },
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
            });
        }

        await Order.insertMany(physicalOrders);
        console.log(`✅ ${physicalOrders.length} órdenes físicas creadas`);

        // 6. Crear algunas discrepancias de inventario intencionalmente
        console.log('\n⚠️ Creando discrepancias de inventario para pruebas...');
        const inventories = await Inventory.find().limit(3);
        
        for (const inventory of inventories) {
            // Crear discrepancias entre stock físico y digital
            inventory.channels.physical.stock = Math.floor(Math.random() * 20) + 5;
            inventory.channels.digital.stock = Math.floor(Math.random() * 20) + 5;
            inventory.channels.physical.syncStatus = 'pending';
            inventory.channels.digital.syncStatus = 'synced';
            inventory.channels.physical.lastUpdated = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
            inventory.channels.digital.lastUpdated = new Date();
            
            await inventory.save();
        }
        console.log(`✅ ${inventories.length} discrepancias de inventario creadas`);

        // 7. Mostrar resumen de datos creados
        console.log('\n📊 RESUMEN DE DATOS DE PRUEBA CREADOS:');
        console.log('=====================================');
        
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalInventory = await Inventory.countDocuments();
        
        const onlineOrdersCount = await Order.countDocuments({ salesChannel: 'online' });
        const mobileOrdersCount = await Order.countDocuments({ salesChannel: 'mobile_app' });
        const physicalOrdersCount = await Order.countDocuments({ salesChannel: 'physical_store' });
        
        const discrepanciesCount = await Inventory.countDocuments({
            $expr: {
                $ne: ['$channels.physical.stock', '$channels.digital.stock']
            }
        });

        console.log(`👥 Usuarios: ${totalUsers}`);
        console.log(`📦 Productos: ${totalProducts}`);
        console.log(`📋 Inventario: ${totalInventory}`);
        console.log(`🛒 Órdenes totales: ${totalOrders}`);
        console.log(`   💻 Online: ${onlineOrdersCount}`);
        console.log(`   📱 Móvil: ${mobileOrdersCount}`);
        console.log(`   🏪 Físicas: ${physicalOrdersCount}`);
        console.log(`⚠️ Discrepancias de inventario: ${discrepanciesCount}`);

        console.log('\n✅ Datos de prueba generados exitosamente!');
        console.log('🎯 Ahora puedes probar el dashboard omnicanal con datos reales.');

    } catch (error) {
        console.error('❌ Error generando datos de prueba:', error);
    }
};

// Función principal
const main = async () => {
    await connectDB();
    await generateTestData();
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
};

// Ejecutar script
main().catch(error => {
    console.error('❌ Error en script principal:', error);
    process.exit(1);
});
