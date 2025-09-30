import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

// Función para generar pedidos ficticios
async function createTestOrders() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains');
        console.log('✅ Conectado a MongoDB');

        // Obtener usuarios existentes
        const users = await User.find().limit(5);
        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
            return;
        }

        // Obtener productos existentes
        const products = await Product.find().limit(10);
        if (products.length === 0) {
            console.log('❌ No hay productos en la base de datos');
            return;
        }

        console.log(`📋 Usuarios encontrados: ${users.length}`);
        console.log(`📦 Productos encontrados: ${products.length}`);

        // Limpiar órdenes existentes de prueba
        await Order.deleteMany({ orderNumber: { $regex: /^TEST-/ } });
        console.log('🧹 Órdenes de prueba anteriores eliminadas');

        // Estados posibles para las órdenes
        const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

        // Generar órdenes ficticias para diferentes períodos
        const orders = [];

        // Órdenes de los últimos 7 días
        for (let i = 0; i < 8; i++) {
            const daysAgo = Math.floor(Math.random() * 7);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            createdAt.setHours(Math.floor(Math.random() * 24));
            createdAt.setMinutes(Math.floor(Math.random() * 60));

            const user = users[Math.floor(Math.random() * users.length)];
            const productCount = Math.floor(Math.random() * 3) + 1; // 1-3 productos
            const selectedProducts = [];
            
            for (let j = 0; j < productCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const price = product.price || Math.floor(Math.random() * 100000) + 10000;
                
                selectedProducts.push({
                    product: product._id,
                    quantity: quantity,
                    price: price,
                    subtotal: price * quantity
                });
            }

            const subtotal = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);
            const tax = Math.round(subtotal * 0.19);
            const shipping = subtotal > 100000 ? 0 : 5000;
            const total = subtotal + tax + shipping;

            orders.push({
                user: user._id,
                items: selectedProducts,
                subtotal: subtotal,
                tax: tax,
                shipping: shipping,
                total: total,
                status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
                paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
                paymentMethod: ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)],
                shippingAddress: {
                    street: `Calle ${Math.floor(Math.random() * 200) + 1} #${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 100) + 1}`,
                    city: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'][Math.floor(Math.random() * 5)],
                    state: ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Bolívar'][Math.floor(Math.random() * 5)],
                    zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
                    country: 'Colombia'
                },
                createdAt: createdAt
            });
        }

        // Órdenes de los últimos 30 días (más distribuidas)
        for (let i = 0; i < 15; i++) {
            const daysAgo = Math.floor(Math.random() * 30);
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - daysAgo);
            createdAt.setHours(Math.floor(Math.random() * 24));
            createdAt.setMinutes(Math.floor(Math.random() * 60));

            const user = users[Math.floor(Math.random() * users.length)];
            const productCount = Math.floor(Math.random() * 4) + 1; // 1-4 productos
            const selectedProducts = [];
            
            for (let j = 0; j < productCount; j++) {
                const product = products[Math.floor(Math.random() * products.length)];
                const quantity = Math.floor(Math.random() * 5) + 1;
                const price = product.price || Math.floor(Math.random() * 150000) + 15000;
                
                selectedProducts.push({
                    product: product._id,
                    quantity: quantity,
                    price: price,
                    subtotal: price * quantity
                });
            }

            const subtotal = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0);
            const tax = Math.round(subtotal * 0.19);
            const shipping = subtotal > 100000 ? 0 : 5000;
            const total = subtotal + tax + shipping;

            orders.push({
                user: user._id,
                items: selectedProducts,
                subtotal: subtotal,
                tax: tax,
                shipping: shipping,
                total: total,
                status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)],
                paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
                paymentMethod: ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)],
                shippingAddress: {
                    street: `Calle ${Math.floor(Math.random() * 200) + 1} #${Math.floor(Math.random() * 100) + 1}-${Math.floor(Math.random() * 100) + 1}`,
                    city: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'][Math.floor(Math.random() * 5)],
                    state: ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Bolívar'][Math.floor(Math.random() * 5)],
                    zipCode: `${Math.floor(Math.random() * 900000) + 100000}`,
                    country: 'Colombia'
                },
                createdAt: createdAt
            });
        }

        // Crear las órdenes en la base de datos
        console.log(`📝 Creando ${orders.length} órdenes de prueba...`);
        const createdOrders = await Order.insertMany(orders);

        console.log('✅ Órdenes de prueba creadas exitosamente:');
        console.log(`   - Total de órdenes: ${createdOrders.length}`);
        
        // Estadísticas por estado
        const statusCounts = {};
        const paymentStatusCounts = {};
        let totalRevenue = 0;

        createdOrders.forEach(order => {
            statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
            paymentStatusCounts[order.paymentStatus] = (paymentStatusCounts[order.paymentStatus] || 0) + 1;
            totalRevenue += order.total;
        });

        console.log('📊 Estadísticas de las órdenes creadas:');
        console.log('   Estados de órdenes:');
        Object.entries(statusCounts).forEach(([status, count]) => {
            console.log(`     - ${status}: ${count}`);
        });
        
        console.log('   Estados de pago:');
        Object.entries(paymentStatusCounts).forEach(([status, count]) => {
            console.log(`     - ${status}: ${count}`);
        });
        
        console.log(`   Ingresos totales: $${totalRevenue.toLocaleString('es-CO')} COP`);
        console.log(`   Promedio por orden: $${Math.round(totalRevenue / createdOrders.length).toLocaleString('es-CO')} COP`);

        // Mostrar algunas órdenes de ejemplo
        console.log('\n📋 Ejemplos de órdenes creadas:');
        createdOrders.slice(0, 3).forEach((order, index) => {
            console.log(`   ${index + 1}. Orden ${order.orderNumber}:`);
            console.log(`      - Cliente: ${order.user}`);
            console.log(`      - Total: $${order.total.toLocaleString('es-CO')} COP`);
            console.log(`      - Estado: ${order.status}`);
            console.log(`      - Pago: ${order.paymentStatus}`);
            console.log(`      - Fecha: ${order.createdAt.toLocaleDateString('es-CO')}`);
        });

        console.log('\n🎉 ¡Datos de prueba creados exitosamente!');
        console.log('💡 Ahora puedes probar los reportes de ventas en /admin/reports');

    } catch (error) {
        console.error('❌ Error al crear órdenes de prueba:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
    }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    createTestOrders();
}

export default createTestOrders;
