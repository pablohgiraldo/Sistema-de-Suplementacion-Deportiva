import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkOrders() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains');
        console.log('✅ Conectado a MongoDB');

        // Obtener todas las órdenes
        const orders = await Order.find({})
            .populate('user', 'nombre email')
            .populate('items.product', 'name brand')
            .sort({ createdAt: -1 })
            .limit(10);

        console.log(`\n📊 Total de órdenes encontradas: ${orders.length}`);

        if (orders.length > 0) {
            console.log('\n📋 Últimas órdenes:');
            orders.forEach((order, index) => {
                console.log(`\n${index + 1}. Orden #${order.orderNumber || 'N/A'}`);
                console.log(`   Usuario: ${order.user?.nombre || 'N/A'} (${order.user?.email || 'N/A'})`);
                console.log(`   Estado: ${order.status}`);
                console.log(`   Estado de pago: ${order.paymentStatus}`);
                console.log(`   Total: $${order.total || 0}`);
                console.log(`   Items: ${order.items?.length || 0}`);
                console.log(`   Fecha: ${order.createdAt}`);
            });
        } else {
            console.log('\n❌ No se encontraron órdenes en la base de datos');
        }

        // Verificar usuarios
        const users = await User.find({}).limit(5);
        console.log(`\n👥 Total de usuarios: ${users.length}`);

        if (users.length > 0) {
            console.log('\n👤 Usuarios encontrados:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.nombre} (${user.email}) - Rol: ${user.rol}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

checkOrders();