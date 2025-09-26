import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
import Inventory from '../src/models/Inventory.js';
import dotenv from 'dotenv';

dotenv.config();

async function testOrderModel() {
    try {
        console.log("🧪 Probando modelo Order directamente...");
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        // 1. Verificar que el modelo Order existe
        console.log("\n1️⃣ Verificando modelo Order...");
        const orderCount = await Order.countDocuments();
        console.log(`   📊 Total de órdenes en la base de datos: ${orderCount}`);

        // 2. Crear una orden de prueba directamente
        console.log("\n2️⃣ Creando orden de prueba...");
        
        // Buscar un usuario admin
        const adminUser = await User.findOne({ rol: 'admin' });
        if (!adminUser) {
            console.log("❌ No se encontró usuario admin");
            return;
        }
        console.log(`   👤 Usuario admin encontrado: ${adminUser.nombre}`);

        // Buscar un producto con stock
        const product = await Product.findOne({});
        if (!product) {
            console.log("❌ No se encontraron productos");
            return;
        }
        console.log(`   📦 Producto encontrado: ${product.name}`);

        // Verificar inventario
        const inventory = await Inventory.findOne({ product: product._id });
        if (!inventory) {
            console.log("❌ No se encontró inventario para el producto");
            return;
        }
        console.log(`   📊 Stock disponible: ${inventory.availableStock}`);

        // Crear orden de prueba
        const testOrder = new Order({
            user: adminUser._id,
            items: [{
                product: product._id,
                quantity: 2,
                price: product.price,
                subtotal: product.price * 2
            }],
            subtotal: product.price * 2,
            tax: product.price * 2 * 0.19,
            shipping: 5000,
            total: (product.price * 2) + (product.price * 2 * 0.19) + 5000,
            paymentMethod: 'credit_card',
            shippingAddress: {
                street: 'Calle de Prueba 123',
                city: 'Bogotá',
                state: 'Cundinamarca',
                zipCode: '110111',
                country: 'Colombia'
            },
            status: 'pending',
            paymentStatus: 'pending',
            notes: 'Orden de prueba creada directamente'
        });

        await testOrder.save();
        console.log(`   ✅ Orden creada: ${testOrder.orderNumber}`);

        // 3. Probar métodos del modelo
        console.log("\n3️⃣ Probando métodos del modelo...");
        
        // Probar virtuals
        console.log(`   📊 Item count: ${testOrder.itemCount}`);
        console.log(`   📋 Status formateado: ${testOrder.statusFormatted}`);
        console.log(`   💳 Payment status formateado: ${testOrder.paymentStatusFormatted}`);

        // Probar método de actualización de estado
        await testOrder.updateStatus('processing', adminUser._id);
        console.log(`   🔄 Estado actualizado a: ${testOrder.statusFormatted}`);

        // 4. Probar métodos estáticos
        console.log("\n4️⃣ Probando métodos estáticos...");
        
        const stats = await Order.getSalesStats();
        console.log(`   📈 Estadísticas de ventas:`);
        console.log(`      Total órdenes: ${stats.totalOrders}`);
        console.log(`      Ingresos totales: $${stats.totalRevenue}`);
        console.log(`      Valor promedio: $${stats.averageOrderValue}`);

        const salesByPeriod = await Order.getSalesByPeriod();
        console.log(`   📅 Ventas por período: ${salesByPeriod.length} registros`);

        // 5. Limpiar orden de prueba
        console.log("\n5️⃣ Limpiando orden de prueba...");
        await Order.findByIdAndDelete(testOrder._id);
        console.log("   🗑️ Orden de prueba eliminada");

        console.log("\n✅ Todas las pruebas del modelo Order completadas exitosamente!");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Desconectado de MongoDB");
    }
}

testOrderModel();
