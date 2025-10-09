import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Customer from '../src/models/Customer.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';

// Cargar variables de entorno
dotenv.config();

async function checkCRMData() {
    try {
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);
        console.log('\n🔍 Verificando datos del CRM...\n');

        // Total de usuarios
        const totalUsers = await User.countDocuments();
        console.log(`👥 Total usuarios: ${totalUsers}`);

        // Total de customers
        const totalCustomers = await Customer.countDocuments();
        console.log(`📊 Total customers: ${totalCustomers}`);

        // Total de órdenes
        const totalOrders = await Order.countDocuments();
        console.log(`📦 Total órdenes: ${totalOrders}\n`);

        // Listar todos los customers
        const customers = await Customer.find()
            .populate('user', 'nombre email')
            .select('user customerCode lifetimeValue metrics segment loyaltyLevel')
            .sort({ lifetimeValue: -1 });

        console.log('📋 Lista de Customers:');
        console.log('='.repeat(80));

        if (customers.length === 0) {
            console.log('⚠️  No hay customers en la base de datos\n');

            // Listar usuarios sin customer profile
            const users = await User.find().select('nombre email rol');
            console.log('\n👤 Usuarios disponibles:');
            users.forEach(u => {
                console.log(`  - ${u.nombre} (${u.email}) - ${u.rol}`);
            });

        } else {
            customers.forEach((c, i) => {
                console.log(`\n${i + 1}. ${c.user?.nombre || 'Sin usuario'}`);
                console.log(`   Email: ${c.user?.email || 'N/A'}`);
                console.log(`   Código: ${c.customerCode}`);
                console.log(`   LTV: $${c.lifetimeValue?.toLocaleString('es-CO') || 0}`);
                console.log(`   Segmento: ${c.segment || 'N/A'}`);
                console.log(`   Nivel: ${c.loyaltyLevel || 'N/A'}`);
                console.log(`   Órdenes: ${c.metrics?.totalOrders || 0}`);
                console.log(`   Total Gastado: $${c.metrics?.totalSpent?.toLocaleString('es-CO') || 0}`);
            });
        }

        // Listar órdenes
        console.log('\n\n📦 Órdenes en el sistema:');
        console.log('='.repeat(80));

        const orders = await Order.find()
            .populate('user', 'nombre email')
            .select('user orderNumber total status createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        if (orders.length === 0) {
            console.log('⚠️  No hay órdenes en la base de datos\n');
        } else {
            orders.forEach((o, i) => {
                console.log(`\n${i + 1}. Order ${o.orderNumber}`);
                console.log(`   Cliente: ${o.user?.nombre || 'Sin usuario'} (${o.user?.email || 'N/A'})`);
                console.log(`   Total: $${o.total?.toLocaleString('es-CO') || 0}`);
                console.log(`   Estado: ${o.status}`);
                console.log(`   Fecha: ${o.createdAt?.toLocaleDateString('es-CO')}`);
            });
        }

        console.log('\n\n💡 Recomendación:');
        if (totalCustomers === 0 && totalOrders > 0) {
            console.log('⚠️  Tienes órdenes pero no customers.');
            console.log('   Ejecuta: npm run test-customer-order');
            console.log('   O desde el dashboard: Click en "Sincronizar Órdenes"');
        } else if (totalCustomers > 0 && customers[0]?.lifetimeValue === 0) {
            console.log('⚠️  Los customers existen pero tienen LTV = 0');
            console.log('   Ejecuta la sincronización para actualizar métricas');
        } else if (totalCustomers > 0) {
            console.log('✅ Datos correctos. El top customer debería aparecer en el dashboard');
        }

        console.log('\n');

        // Cerrar conexión
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

checkCRMData();

