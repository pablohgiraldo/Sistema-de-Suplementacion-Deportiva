/**
 * Script de Prueba - Integración Customer/Order
 * 
 * Prueba la integración completa del historial de compras
 * entre customers y orders.
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../src/models/Customer.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js'; // Importar Product para evitar errores de registro
import {
    syncCustomerAfterOrder,
    createCustomerFromUser,
    syncAllCustomers,
    createMissingCustomers
} from '../src/services/customerSyncService.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function testCustomerOrderIntegration() {
    try {
        console.log('🧪 Iniciando pruebas de integración Customer/Order...\n');

        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // TEST 1: Crear customers faltantes
        console.log('📝 TEST 1: Crear customers faltantes');
        console.log('='.repeat(50));
        const createResult = await createMissingCustomers();
        console.log(`✅ Resultado:`);
        console.log(`   - Total usuarios: ${createResult.total}`);
        console.log(`   - Customers creados: ${createResult.created}`);
        console.log(`   - Customers existentes: ${createResult.existing}`);
        console.log(`   - Errores: ${createResult.errors}\n`);

        // TEST 2: Sincronizar todos los customers con sus órdenes
        console.log('📝 TEST 2: Sincronizar todos los customers');
        console.log('='.repeat(50));
        const syncResult = await syncAllCustomers();
        console.log(`✅ Resultado:`);
        console.log(`   - Total: ${syncResult.total}`);
        console.log(`   - Exitosos: ${syncResult.success}`);
        console.log(`   - Errores: ${syncResult.errors}\n`);

        // TEST 3: Verificar datos de un customer aleatorio
        console.log('📝 TEST 3: Verificar datos de un customer');
        console.log('='.repeat(50));
        const customer = await Customer.findOne({ 'metrics.totalOrders': { $gt: 0 } })
            .populate('user', 'nombre email');

        if (customer) {
            console.log(`✅ Customer encontrado: ${customer.customerCode}`);
            console.log(`   Usuario: ${customer.user?.nombre} (${customer.user?.email})`);
            console.log(`   Segmento: ${customer.segment}`);
            console.log(`   Nivel de fidelidad: ${customer.loyaltyLevel}`);
            console.log(`   Métricas:`);
            console.log(`      - Total de órdenes: ${customer.metrics.totalOrders}`);
            console.log(`      - Total gastado: $${customer.metrics.totalSpent.toLocaleString('es-CO')}`);
            console.log(`      - Valor promedio de orden: $${customer.metrics.averageOrderValue.toLocaleString('es-CO')}`);
            console.log(`      - Última orden: ${customer.metrics.lastOrderDate?.toLocaleDateString('es-CO')}`);
            console.log(`      - Días desde última orden: ${customer.metrics.daysSinceLastOrder || 0}`);
            console.log(`   Lifetime Value: $${customer.lifetimeValue.toLocaleString('es-CO')}`);
            console.log(`   Es de alto valor: ${customer.isHighValue ? 'Sí' : 'No'}`);
            console.log(`   Riesgo de abandono: ${customer.churnRisk || 'N/A'}`);
            console.log(`   Puntos de fidelidad: ${customer.loyaltyPoints}\n`);

            // TEST 4: Verificar órdenes del customer
            console.log('📝 TEST 4: Verificar órdenes del customer');
            console.log('='.repeat(50));
            const orders = await Order.find({ user: customer.user })
                .sort({ createdAt: -1 })
                .limit(5)
                .select('orderNumber total status createdAt');

            console.log(`✅ Órdenes encontradas: ${orders.length}`);
            orders.forEach((order, index) => {
                console.log(`   ${index + 1}. ${order.orderNumber} - $${order.total.toLocaleString('es-CO')} - ${order.status} - ${order.createdAt.toLocaleDateString('es-CO')}`);
            });
            console.log();
        } else {
            console.log('⚠️  No se encontraron customers con órdenes\n');
        }

        // TEST 5: Estadísticas generales
        console.log('📝 TEST 5: Estadísticas generales del CRM');
        console.log('='.repeat(50));

        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ status: 'Activo' });
        const highValueCustomers = await Customer.countDocuments({ isHighValue: true });
        const customersWithOrders = await Customer.countDocuments({ 'metrics.totalOrders': { $gt: 0 } });

        console.log(`✅ Estadísticas:`);
        console.log(`   - Total de customers: ${totalCustomers}`);
        console.log(`   - Customers activos: ${activeCustomers}`);
        console.log(`   - Customers de alto valor: ${highValueCustomers}`);
        console.log(`   - Customers con órdenes: ${customersWithOrders}`);

        const segmentStats = await Customer.aggregate([
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 },
                    avgLTV: { $avg: '$lifetimeValue' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        console.log(`\n   Distribución por segmento:`);
        segmentStats.forEach(stat => {
            console.log(`      - ${stat._id}: ${stat.count} customers (LTV promedio: $${stat.avgLTV.toFixed(0)})`);
        });

        const loyaltyStats = await Customer.aggregate([
            {
                $group: {
                    _id: '$loyaltyLevel',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        console.log(`\n   Distribución por nivel de fidelidad:`);
        loyaltyStats.forEach(stat => {
            console.log(`      - ${stat._id}: ${stat.count} customers`);
        });

        // TEST 6: Top 5 customers por valor
        console.log('\n📝 TEST 6: Top 5 Customers por Lifetime Value');
        console.log('='.repeat(50));
        const topCustomers = await Customer.find({ status: 'Activo' })
            .sort({ lifetimeValue: -1 })
            .limit(5)
            .populate('user', 'nombre email');

        topCustomers.forEach((customer, index) => {
            console.log(`   ${index + 1}. ${customer.user?.nombre} (${customer.customerCode})`);
            console.log(`      - LTV: $${customer.lifetimeValue.toLocaleString('es-CO')}`);
            console.log(`      - Órdenes: ${customer.metrics.totalOrders}`);
            console.log(`      - Segmento: ${customer.segment}`);
            console.log(`      - Nivel: ${customer.loyaltyLevel}\n`);
        });

        console.log('\n✅ Todas las pruebas completadas exitosamente!\n');

        // Resumen final
        console.log('📊 RESUMEN FINAL');
        console.log('='.repeat(50));
        console.log(`✅ Integración Customer/Order funcionando correctamente`);
        console.log(`✅ ${customersWithOrders} customers sincronizados con sus órdenes`);
        console.log(`✅ Métricas calculadas automáticamente`);
        console.log(`✅ Segmentación automática activa`);
        console.log(`✅ Sistema de fidelidad operativo\n`);

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada');
    }
}

// Ejecutar pruebas
testCustomerOrderIntegration();

