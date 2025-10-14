import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

dotenv.config();

async function updateUserCredentials() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
        await connectDB(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar usuario
        const user = await User.findOne({ email: 'pablo.giral04@gmail.com' });

        if (!user) {
            console.error('❌ Usuario pablo.giral04@gmail.com no encontrado');
            process.exit(1);
        }

        console.log('👤 Usuario encontrado:');
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Nombre: ${user.nombre}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Rol: ${user.rol}\n`);

        // Nueva contraseña
        const newPassword = 'LinaGiraldo31';

        console.log('🔐 Actualizando contraseña...');
        console.log(`   Nueva contraseña: ${newPassword}\n`);

        // Hashear la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        console.log('✅ Credenciales actualizadas exitosamente!\n');
        console.log('📝 Datos de acceso:');
        console.log(`   Email: ${user.email}`);
        console.log(`   Contraseña: ${newPassword}\n`);
        console.log('🔗 Puedes iniciar sesión en: http://localhost:3000/login\n');

        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        mongoose.connection.close();
        process.exit(1);
    }
}

updateUserCredentials();

