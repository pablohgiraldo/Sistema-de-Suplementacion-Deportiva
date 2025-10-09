/**
 * Script de migración: Convertir usuarios existentes en customers
 * 
 * Este script crea registros de Customer para todos los usuarios existentes
 * que aún no tienen un perfil de CRM asociado.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import Customer from '../src/models/Customer.js';
import Order from '../src/models/Order.js';

// Cargar variables de entorno
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains';

async function migrateUsersToCustomers() {
    try {
        console.log('🚀 Iniciando migración de usuarios a customers...\n');

        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Obtener todos los usuarios
        const users = await User.find({ activo: true });
        console.log(`📊 Usuarios encontrados: ${users.length}\n`);

        let created = 0;
        let skipped = 0;
        let errors = 0;

        for (const user of users) {
            try {
                // Verificar si ya existe un customer para este usuario
                const existingCustomer = await Customer.findOne({ user: user._id });

                if (existingCustomer) {
                    console.log(`⏭️  Usuario ${user.email} ya tiene perfil de customer`);
                    skipped++;
                    continue;
                }

                // Crear nuevo customer
                const customer = new Customer({
                    user: user._id,
                    status: user.activo ? 'Activo' : 'Inactivo',
                    acquisitionSource: 'Directo'
                });

                // Actualizar métricas desde órdenes existentes
                await customer.updateMetricsFromOrders();

                // Guardar customer
                await customer.save();

                console.log(`✅ Customer creado para ${user.email} (${customer.customerCode})`);
                created++;

            } catch (error) {
                console.error(`❌ Error procesando usuario ${user.email}:`, error.message);
                errors++;
            }
        }

        console.log('\n📊 Resumen de migración:');
        console.log(`   ✅ Customers creados: ${created}`);
        console.log(`   ⏭️  Saltados (ya existían): ${skipped}`);
        console.log(`   ❌ Errores: ${errors}`);
        console.log(`   📈 Total procesados: ${users.length}\n`);

        // Mostrar estadísticas de segmentos
        console.log('📊 Estadísticas de segmentos:');
        const segmentStats = await Customer.getSegmentStats();
        
        if (segmentStats.length > 0) {
            segmentStats.forEach(stat => {
                console.log(`   ${stat._id}: ${stat.count} clientes - Revenue: $${stat.totalRevenue.toFixed(2)}`);
            });
        } else {
            console.log('   No hay estadísticas disponibles aún');
        }

        console.log('\n✅ Migración completada exitosamente!');

    } catch (error) {
        console.error('❌ Error en la migración:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión a MongoDB cerrada');
    }
}

// Ejecutar migración
migrateUsersToCustomers()
    .then(() => {
        console.log('\n✨ Proceso finalizado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });

