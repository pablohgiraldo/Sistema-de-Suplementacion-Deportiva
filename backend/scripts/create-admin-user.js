/**
 * Script para crear o verificar el usuario administrador
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function createAdminUser() {
    try {
        console.log('\n🔧 Verificando usuario administrador...\n');
        
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);
        
        const adminEmail = 'admin@test.com';
        const adminPassword = 'Admin123!';
        
        // Verificar si el usuario admin ya existe
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            console.log('✅ Usuario admin ya existe:');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Nombre: ${existingAdmin.nombre}`);
            console.log(`   Rol: ${existingAdmin.rol}`);
            console.log(`   Activo: ${existingAdmin.activo}`);
            
            // Verificar la contraseña
            const isPasswordValid = await existingAdmin.compararContraseña(adminPassword);
            console.log(`   Contraseña válida: ${isPasswordValid ? '✅' : '❌'}`);
            
            if (!isPasswordValid) {
                console.log('\n⚠️  La contraseña no coincide. Actualizando...');
                existingAdmin.contraseña = adminPassword;
                await existingAdmin.save();
                console.log('✅ Contraseña actualizada exitosamente');
            }
            
            if (!existingAdmin.activo) {
                console.log('\n⚠️  Usuario inactivo. Activando...');
                existingAdmin.activo = true;
                await existingAdmin.save();
                console.log('✅ Usuario activado exitosamente');
            }
        } else {
            console.log('⚠️  Usuario admin no encontrado. Creando...\n');
            
            const newAdmin = new User({
                nombre: 'Administrador',
                email: adminEmail,
                contraseña: adminPassword,
                rol: 'admin',
                activo: true
            });
            
            await newAdmin.save();
            
            console.log('✅ Usuario administrador creado exitosamente:');
            console.log(`   Email: ${newAdmin.email}`);
            console.log(`   Nombre: ${newAdmin.nombre}`);
            console.log(`   Rol: ${newAdmin.rol}`);
        }
        
        console.log('\n✅ Proceso completado\n');
        
        // Cerrar conexión
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar
createAdminUser();
