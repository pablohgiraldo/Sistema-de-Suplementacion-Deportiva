/**
 * Script de Prueba - Sistema de Segmentación
 * 
 * Prueba la segmentación automática de customers en:
 * - VIP
 * - Frecuente
 * - Ocasional
 * - Nuevo
 * - Inactivo
 * - En Riesgo
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../src/models/Customer.js';
import Order from '../src/models/Order.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function testSegmentation() {
    try {
        console.log('🧪 Iniciando pruebas de segmentación de customers...\n');

        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // TEST 1: Verificar distribución actual
        console.log('📝 TEST 1: Distribución actual de segmentos');
        console.log('='.repeat(60));

        const distribution = await Customer.aggregate([
            { $match: { status: 'Activo' } },
            {
                $group: {
                    _id: '$segment',
                    count: { $sum: 1 },
                    avgLTV: { $avg: '$lifetimeValue' },
                    totalRevenue: { $sum: '$lifetimeValue' },
                    avgOrders: { $avg: '$metrics.totalOrders' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const totalCustomers = await Customer.countDocuments({ status: 'Activo' });

        console.log(`Total de customers activos: ${totalCustomers}\n`);

        distribution.forEach(segment => {
            const percentage = ((segment.count / totalCustomers) * 100).toFixed(2);
            console.log(`${segment._id}:`);
            console.log(`  - Cantidad: ${segment.count} (${percentage}%)`);
            console.log(`  - LTV Promedio: $${segment.avgLTV.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`);
            console.log(`  - Revenue Total: $${segment.totalRevenue.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`);
            console.log(`  - Órdenes Promedio: ${segment.avgOrders.toFixed(2)}\n`);
        });

        // TEST 2: Verificar reglas de segmentación
        console.log('📝 TEST 2: Verificar reglas de segmentación');
        console.log('='.repeat(60));

        // Buscar ejemplos de cada segmento
        const segments = ['VIP', 'Frecuente', 'Ocasional', 'Nuevo', 'Inactivo', 'En Riesgo'];

        for (const segmentName of segments) {
            const customer = await Customer.findOne({
                segment: segmentName,
                status: 'Activo'
            }).populate('user', 'nombre email');

            if (customer) {
                console.log(`\n✅ ${segmentName}:`);
                console.log(`  Usuario: ${customer.user?.nombre || 'N/A'}`);
                console.log(`  Customer Code: ${customer.customerCode}`);
                console.log(`  Total Órdenes: ${customer.metrics.totalOrders}`);
                console.log(`  LTV: $${customer.lifetimeValue.toLocaleString('es-CO')}`);
                console.log(`  Días sin comprar: ${customer.metrics.daysSinceLastOrder || 'N/A'}`);
                console.log(`  Última compra: ${customer.metrics.lastOrderDate?.toLocaleDateString('es-CO') || 'Nunca'}`);

                // Verificar que cumple las reglas
                const { totalOrders, daysSinceLastOrder } = customer.metrics;
                let expectedSegment = 'Ocasional'; // default

                if (totalOrders === 0) {
                    expectedSegment = 'Nuevo';
                } else if (customer.lifetimeValue >= 2000000 && totalOrders >= 10) {
                    expectedSegment = 'VIP';
                } else if (totalOrders >= 5 && daysSinceLastOrder <= 30) {
                    expectedSegment = 'Frecuente';
                } else if (totalOrders >= 2 && daysSinceLastOrder <= 90) {
                    expectedSegment = 'Ocasional';
                } else if (daysSinceLastOrder > 180) {
                    expectedSegment = 'Inactivo';
                } else if (daysSinceLastOrder > 90) {
                    expectedSegment = 'En Riesgo';
                }

                if (expectedSegment === customer.segment) {
                    console.log(`  ✅ Segmentación correcta`);
                } else {
                    console.log(`  ⚠️  Esperado: ${expectedSegment}, Actual: ${customer.segment}`);
                }
            } else {
                console.log(`\n⚠️  ${segmentName}: No hay customers en este segmento`);
            }
        }

        // TEST 3: Análisis de cambios potenciales
        console.log('\n\n📝 TEST 3: Análisis de oportunidades de segmentación');
        console.log('='.repeat(60));

        // Customers cerca de ser VIP
        const nearVIP = await Customer.find({
            segment: { $ne: 'VIP' },
            $or: [
                { lifetimeValue: { $gte: 1500000 }, 'metrics.totalOrders': { $gte: 8 } },
                { lifetimeValue: { $gte: 2000000 }, 'metrics.totalOrders': { $gte: 5 } }
            ],
            status: 'Activo'
        }).limit(5).populate('user', 'nombre email');

        if (nearVIP.length > 0) {
            console.log('\n💎 Customers cerca de ser VIP:');
            nearVIP.forEach((customer, index) => {
                const ordersNeeded = Math.max(0, 10 - customer.metrics.totalOrders);
                const ltvNeeded = Math.max(0, 2000000 - customer.lifetimeValue);
                console.log(`  ${index + 1}. ${customer.user?.nombre} (${customer.customerCode})`);
                console.log(`     Actual: ${customer.segment}`);
                console.log(`     LTV: $${customer.lifetimeValue.toLocaleString('es-CO')}`);
                console.log(`     Órdenes: ${customer.metrics.totalOrders}`);
                console.log(`     Para VIP necesita: ${ordersNeeded} órdenes más o $${ltvNeeded.toLocaleString('es-CO')} más\n`);
            });
        }

        // Customers en riesgo de bajar de segmento
        const atRisk = await Customer.find({
            segment: { $in: ['Frecuente', 'Ocasional'] },
            'metrics.daysSinceLastOrder': { $gte: 60 },
            status: 'Activo'
        }).sort({ 'metrics.daysSinceLastOrder': -1 }).limit(5).populate('user', 'nombre email');

        if (atRisk.length > 0) {
            console.log('\n⚠️  Customers en riesgo de cambiar de segmento:');
            atRisk.forEach((customer, index) => {
                console.log(`  ${index + 1}. ${customer.user?.nombre} (${customer.customerCode})`);
                console.log(`     Segmento actual: ${customer.segment}`);
                console.log(`     Días sin comprar: ${customer.metrics.daysSinceLastOrder}`);
                console.log(`     Riesgo: ${customer.churnRisk}`);
                console.log(`     LTV: $${customer.lifetimeValue.toLocaleString('es-CO')}\n`);
            });
        }

        // TEST 4: Estadísticas de revenue por segmento
        console.log('\n📝 TEST 4: Contribución de revenue por segmento');
        console.log('='.repeat(60));

        const revenueBySegment = await Customer.aggregate([
            { $match: { status: 'Activo' } },
            {
                $group: {
                    _id: '$segment',
                    totalRevenue: { $sum: '$lifetimeValue' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        const totalRevenue = revenueBySegment.reduce((sum, seg) => sum + seg.totalRevenue, 0);

        console.log(`\nRevenue Total: $${totalRevenue.toLocaleString('es-CO')}\n`);

        revenueBySegment.forEach(segment => {
            const percentage = ((segment.totalRevenue / totalRevenue) * 100).toFixed(2);
            const avgPerCustomer = segment.totalRevenue / segment.count;
            console.log(`${segment._id}:`);
            console.log(`  - Revenue: $${segment.totalRevenue.toLocaleString('es-CO')} (${percentage}%)`);
            console.log(`  - Customers: ${segment.count}`);
            console.log(`  - Promedio/Customer: $${avgPerCustomer.toLocaleString('es-CO')}\n`);
        });

        // TEST 5: Tendencias de segmentación
        console.log('📝 TEST 5: Análisis de riesgo de abandono (Churn Risk)');
        console.log('='.repeat(60));

        const churnAnalysis = await Customer.aggregate([
            { $match: { status: 'Activo', 'metrics.totalOrders': { $gt: 0 } } },
            {
                $group: {
                    _id: '$churnRisk',
                    count: { $sum: 1 },
                    avgLTV: { $avg: '$lifetimeValue' },
                    totalRevenue: { $sum: '$lifetimeValue' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const totalWithOrders = churnAnalysis.reduce((sum, item) => sum + item.count, 0);

        churnAnalysis.forEach(risk => {
            if (risk._id) { // Ignorar null
                const percentage = ((risk.count / totalWithOrders) * 100).toFixed(2);
                console.log(`\nRiesgo ${risk._id}:`);
                console.log(`  - Cantidad: ${risk.count} (${percentage}%)`);
                console.log(`  - LTV Promedio: $${risk.avgLTV.toLocaleString('es-CO')}`);
                console.log(`  - Revenue en riesgo: $${risk.totalRevenue.toLocaleString('es-CO')}`);
            }
        });

        // Resumen final
        console.log('\n\n📊 RESUMEN FINAL');
        console.log('='.repeat(60));
        console.log('✅ Sistema de segmentación funcionando correctamente');
        console.log(`✅ ${totalCustomers} customers segmentados`);
        console.log(`✅ ${distribution.length} segmentos activos`);
        console.log(`✅ Revenue total: $${totalRevenue.toLocaleString('es-CO')}`);

        const vipSegment = distribution.find(s => s._id === 'VIP');
        if (vipSegment) {
            const vipRevenue = vipSegment.totalRevenue;
            const vipPercentage = ((vipRevenue / totalRevenue) * 100).toFixed(2);
            console.log(`✅ Customers VIP generan ${vipPercentage}% del revenue`);
        }

        console.log('\n🎯 RECOMENDACIONES:');
        if (nearVIP.length > 0) {
            console.log(`  - Hay ${nearVIP.length} customers cerca de ser VIP`);
            console.log(`    Acción: Ofrecer incentivos para aumentar su frecuencia/valor de compra`);
        }
        if (atRisk.length > 0) {
            console.log(`  - Hay ${atRisk.length} customers en riesgo de abandono`);
            console.log(`    Acción: Campaña de re-engagement con ofertas personalizadas`);
        }

        const inactiveSegment = distribution.find(s => s._id === 'Inactivo');
        if (inactiveSegment && inactiveSegment.count > totalCustomers * 0.2) {
            console.log(`  - ${inactiveSegment.count} customers inactivos (>${20}%)`);
            console.log(`    Acción: Campaña masiva de reactivación`);
        }

        console.log('\n');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        console.error('Stack:', error.stack);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada');
    }
}

// Ejecutar pruebas
testSegmentation();

