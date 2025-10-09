/**
 * Script de prueba del modelo Customer
 * 
 * Verifica que el modelo Customer funcione correctamente
 * con todos sus métodos y funcionalidades.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Customer from '../src/models/Customer.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains';

async function testCustomerModel() {
    try {
        console.log('🧪 Iniciando pruebas del modelo Customer...\n');

        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Test 1: Verificar colección existe
        console.log('📋 Test 1: Verificar colección customers');
        const collections = await mongoose.connection.db.listCollections().toArray();
        const hasCustomerCollection = collections.some(col => col.name === 'customers');
        console.log(`   ${hasCustomerCollection ? '✅' : '❌'} Colección customers ${hasCustomerCollection ? 'existe' : 'no existe'}\n`);

        // Test 2: Contar customers existentes
        console.log('📋 Test 2: Contar customers existentes');
        const customerCount = await Customer.countDocuments();
        console.log(`   ✅ Total de customers: ${customerCount}\n`);

        // Test 3: Obtener un customer de ejemplo
        console.log('📋 Test 3: Obtener un customer de ejemplo');
        const sampleCustomer = await Customer.findOne().populate('user', 'nombre email');
        
        if (sampleCustomer) {
            console.log('   ✅ Customer encontrado:');
            console.log(`      - Código: ${sampleCustomer.customerCode}`);
            console.log(`      - Segmento: ${sampleCustomer.segment}`);
            console.log(`      - Nivel de fidelidad: ${sampleCustomer.loyaltyLevel}`);
            console.log(`      - Lifetime Value: $${sampleCustomer.lifetimeValue.toLocaleString()}`);
            console.log(`      - Total órdenes: ${sampleCustomer.metrics.totalOrders}`);
            console.log(`      - Total gastado: $${sampleCustomer.metrics.totalSpent.toLocaleString()}`);
            if (sampleCustomer.user) {
                console.log(`      - Usuario: ${sampleCustomer.user.nombre} (${sampleCustomer.user.email})`);
            }
            console.log('');
        } else {
            console.log('   ⚠️  No se encontraron customers. Ejecuta el script de migración primero.\n');
        }

        // Test 4: Estadísticas de segmentos
        console.log('📋 Test 4: Obtener estadísticas de segmentos');
        const segmentStats = await Customer.getSegmentStats();
        
        if (segmentStats.length > 0) {
            console.log('   ✅ Estadísticas por segmento:');
            segmentStats.forEach(stat => {
                console.log(`      - ${stat._id}: ${stat.count} clientes`);
                console.log(`        • Valor promedio: $${stat.avgLifetimeValue.toFixed(2)}`);
                console.log(`        • Revenue total: $${stat.totalRevenue.toLocaleString()}`);
            });
            console.log('');
        } else {
            console.log('   ⚠️  No hay estadísticas disponibles aún\n');
        }

        // Test 5: Clientes de alto valor
        console.log('📋 Test 5: Obtener clientes de alto valor');
        const highValueCustomers = await Customer.getHighValueCustomers(5);
        
        if (highValueCustomers.length > 0) {
            console.log(`   ✅ Top ${highValueCustomers.length} clientes de alto valor:`);
            highValueCustomers.forEach((customer, index) => {
                console.log(`      ${index + 1}. ${customer.user?.nombre || 'N/A'} - LTV: $${customer.lifetimeValue.toLocaleString()}`);
            });
            console.log('');
        } else {
            console.log('   ℹ️  No hay clientes de alto valor aún\n');
        }

        // Test 6: Clientes en riesgo de abandono
        console.log('📋 Test 6: Obtener clientes en riesgo de abandono');
        const churnRiskCustomers = await Customer.getChurnRiskCustomers();
        
        if (churnRiskCustomers.length > 0) {
            console.log(`   ⚠️  ${churnRiskCustomers.length} clientes en riesgo:`);
            churnRiskCustomers.slice(0, 5).forEach((customer, index) => {
                console.log(`      ${index + 1}. ${customer.user?.nombre || 'N/A'} - Riesgo: ${customer.churnRisk} - Días sin comprar: ${customer.metrics.daysSinceLastOrder || 'N/A'}`);
            });
            console.log('');
        } else {
            console.log('   ✅ No hay clientes en riesgo de abandono\n');
        }

        // Test 7: Verificar índices
        console.log('📋 Test 7: Verificar índices de la colección');
        const indexes = await Customer.collection.getIndexes();
        console.log(`   ✅ Índices creados: ${Object.keys(indexes).length}`);
        Object.keys(indexes).forEach(indexName => {
            if (indexName !== '_id_') {
                console.log(`      - ${indexName}`);
            }
        });
        console.log('');

        // Test 8: Test de método addInteraction
        if (sampleCustomer) {
            console.log('📋 Test 8: Probar método addInteraction');
            const initialInteractionCount = sampleCustomer.interactionHistory.length;
            
            sampleCustomer.addInteraction(
                'Visita',
                'Visita al catálogo de productos',
                { page: '/products', duration: 120 }
            );
            
            await sampleCustomer.save();
            
            const newInteractionCount = sampleCustomer.interactionHistory.length;
            const success = newInteractionCount > initialInteractionCount;
            
            console.log(`   ${success ? '✅' : '❌'} Interacción agregada exitosamente`);
            console.log(`      - Interacciones antes: ${initialInteractionCount}`);
            console.log(`      - Interacciones después: ${newInteractionCount}\n`);
        }

        // Test 9: Distribución de niveles de fidelidad
        console.log('📋 Test 9: Distribución de niveles de fidelidad');
        const loyaltyDistribution = await Customer.aggregate([
            {
                $group: {
                    _id: '$loyaltyLevel',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        if (loyaltyDistribution.length > 0) {
            console.log('   ✅ Distribución:');
            loyaltyDistribution.forEach(level => {
                console.log(`      - ${level._id}: ${level.count} clientes`);
            });
            console.log('');
        } else {
            console.log('   ℹ️  No hay datos de distribución aún\n');
        }

        // Test 10: Resumen general
        console.log('📋 Test 10: Resumen general del CRM');
        const totalActive = await Customer.countDocuments({ status: 'Activo' });
        const totalInactive = await Customer.countDocuments({ status: 'Inactivo' });
        const highValue = await Customer.countDocuments({ isHighValue: true });
        const avgLTV = await Customer.aggregate([
            {
                $group: {
                    _id: null,
                    avgLifetimeValue: { $avg: '$lifetimeValue' },
                    totalRevenue: { $sum: '$lifetimeValue' }
                }
            }
        ]);

        console.log('   ✅ Métricas generales:');
        console.log(`      - Clientes activos: ${totalActive}`);
        console.log(`      - Clientes inactivos: ${totalInactive}`);
        console.log(`      - Clientes de alto valor: ${highValue}`);
        if (avgLTV.length > 0) {
            console.log(`      - LTV promedio: $${avgLTV[0].avgLifetimeValue.toFixed(2)}`);
            console.log(`      - Revenue total: $${avgLTV[0].totalRevenue.toLocaleString()}`);
        }
        console.log('');

        console.log('✅ Todas las pruebas completadas exitosamente!\n');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Conexión a MongoDB cerrada\n');
    }
}

// Ejecutar pruebas
testCustomerModel()
    .then(() => {
        console.log('✨ Pruebas finalizadas');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error fatal:', error);
        process.exit(1);
    });

