// Script para corregir productos y generar órdenes físicas
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

dotenv.config();

const fixProductsAndGenerateOrders = async () => {
    try {
        console.log('✅ MongoDB de producción conectado');
        console.log('🔧 Corrigiendo productos y generando órdenes físicas...\n');

        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB de producción');

        // Corregir productos con active undefined
        console.log('🔧 Corrigiendo productos con active undefined...');
        const updateResult = await Product.updateMany(
            { active: { $exists: false } }, 
            { $set: { active: true } }
        );
        console.log(`✅ ${updateResult.modifiedCount} productos corregidos`);

        // También corregir productos con active null
        const updateResult2 = await Product.updateMany(
            { active: null }, 
            { $set: { active: true } }
        );
        console.log(`✅ ${updateResult2.modifiedCount} productos con null corregidos`);

        // Verificar productos
        const allProducts = await Product.find({});
        console.log(`📦 Total productos: ${allProducts.length}`);
        
        const activeProducts = await Product.find({ active: true });
        console.log(`✅ Productos activos: ${activeProducts.length}`);

        // Obtener usuarios y productos activos
        const users = await User.find({}).limit(5);
        const products = await Product.find({ active: true }).limit(10);

        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
            return;
        }

        if (products.length === 0) {
            console.log('❌ No hay productos activos en la base de datos');
            return;
        }

        console.log(`✅ ${users.length} usuarios encontrados`);
        console.log(`✅ ${products.length} productos activos encontrados`);

        // Generar órdenes físicas
        const physicalOrders = [];
        const orderCount = 20; // Generar 20 órdenes físicas

        for (let i = 0; i < orderCount; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 unidades
            const price = randomProduct.price * quantity;

            const physicalOrder = {
                orderNumber: `PHY-${Date.now()}-${i.toString().padStart(3, '0')}`,
                user: randomUser._id,
                items: [{
                    product: randomProduct._id,
                    quantity: quantity,
                    price: randomProduct.price
                }],
                subtotal: price,
                tax: price * 0.19, // 19% IVA
                total: price * 1.19,
                status: 'delivered',
                paymentMethod: 'cash',
                paymentStatus: 'paid',
                salesChannel: 'physical_store',
                physicalSale: {
                    storeLocation: 'Tienda Principal - Medellín',
                    cashierId: 'CASH001',
                    cashierName: 'María González',
                    registerNumber: 'REG001',
                    receiptNumber: `RCP-${Date.now()}-${i}`
                },
                // Para órdenes físicas, usar dirección de la tienda
                shippingAddress: {
                    firstName: randomUser.nombre || 'Cliente',
                    lastName: 'Físico',
                    street: 'Calle 50 # 45-23',
                    city: 'Medellín',
                    state: 'Antioquia',
                    zipCode: '050001',
                    country: 'Colombia',
                    phone: '3001234567'
                },
                notes: `Venta física - ${randomProduct.name}`,
                createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
            };

            physicalOrders.push(physicalOrder);
        }

        // Insertar órdenes físicas
        const createdOrders = await Order.insertMany(physicalOrders);
        console.log(`✅ ${createdOrders.length} órdenes físicas creadas en producción`);

        // Mostrar resumen
        console.log('\n📊 RESUMEN DE ÓRDENES FÍSICAS:');
        console.log('================================');
        createdOrders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.orderNumber} - ${order.salesChannel} - $${order.total.toFixed(2)} - ${order.status}`);
        });

        console.log('\n✅ Generación de órdenes físicas completada');

    } catch (error) {
        console.error('❌ Error generando órdenes físicas:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB de producción');
    }
};

// Ejecutar
fixProductsAndGenerateOrders();
