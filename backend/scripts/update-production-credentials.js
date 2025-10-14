import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function updateProductionCredentials() {
    try {
        // Usar la URI de producción desde .env
        const PRODUCTION_URI = process.env.MONGODB_URI_PRODUCTION || process.env.MONGODB_URI;

        if (!PRODUCTION_URI) {
            console.error('❌ No se encontró MONGODB_URI_PRODUCTION en .env');
            console.log('\n💡 Agrega tu MongoDB Atlas URI de producción en .env:');
            console.log('   MONGODB_URI_PRODUCTION=mongodb+srv://...\n');
            process.exit(1);
        }

        console.log('⚠️  CONECTANDO A BASE DE DATOS DE PRODUCCIÓN');
        console.log('   Asegúrate de que esto es lo que quieres hacer!\n');

        await connectDB(PRODUCTION_URI);
        console.log('✅ Conectado a MongoDB de PRODUCCIÓN\n');

        // Buscar usuario
        const user = await User.findOne({ email: 'pablo.giral04@gmail.com' });

        if (!user) {
            console.error('❌ Usuario pablo.giral04@gmail.com no encontrado en producción');
            console.log('💡 El usuario puede tener un email diferente en producción\n');
            process.exit(1);
        }

        console.log('👤 Usuario encontrado en PRODUCCIÓN:');
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Nombre: ${user.nombre}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Rol: ${user.rol}\n`);

        // Nueva contraseña
        const newPassword = 'LinaGiraldo31';

        console.log('🔐 Actualizando contraseña en PRODUCCIÓN...');
        console.log(`   Nueva contraseña: ${newPassword}\n`);

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        console.log('✅ Credenciales actualizadas en PRODUCCIÓN!\n');
        console.log('📝 Datos de acceso para PRODUCCIÓN:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Contraseña: ${newPassword}\n`);
        console.log('🔗 Puedes iniciar sesión en: https://supergains-frontend.onrender.com/login\n');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
}

updateProductionCredentials();

