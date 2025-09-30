import mongoose from 'mongoose';
import Order from '../src/models/Order.js';

async function checkOrders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains');

        const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
        console.log('📋 Últimas 5 órdenes:');
        orders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.orderNumber} - ${order.status} - ${order.total} COP - ${order.createdAt.toLocaleDateString()}`);
        });

        const totalOrders = await Order.countDocuments();
        console.log(`\nTotal de órdenes: ${totalOrders}`);

        // Verificar órdenes en el rango de fechas que está usando el frontend
        const startDate = new Date('2025-08-31');
        const endDate = new Date('2025-09-30');
        const ordersInRange = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        });

        console.log(`\nÓrdenes en rango 2025-08-31 a 2025-09-30: ${ordersInRange.length}`);

        if (ordersInRange.length > 0) {
            console.log('Órdenes en el rango:');
            ordersInRange.forEach((order, index) => {
                console.log(`  ${index + 1}. ${order.orderNumber} - ${order.status} - ${order.total} COP`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.connection.close();
    }
}

checkOrders();
