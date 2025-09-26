import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestAdmin() {
    try {
        console.log("👑 Creando usuario admin de prueba...");
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        // Verificar si ya existe
        const existingUser = await User.findOne({ email: 'admin-test@supergains.com' });
        if (existingUser) {
            console.log("ℹ️ Usuario admin de prueba ya existe, eliminando...");
            await User.findByIdAndDelete(existingUser._id);
        }

        // Crear nuevo usuario admin
        const adminUser = new User({
            nombre: 'Admin Test',
            email: 'admin-test@supergains.com',
            contraseña: 'admin123',
            rol: 'admin'
        });

        await adminUser.save();
        console.log("✅ Usuario admin de prueba creado exitosamente");
        console.log(`   Email: admin-test@supergains.com`);
        console.log(`   Contraseña: admin123`);
        console.log(`   Rol: admin`);

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Desconectado de MongoDB");
    }
}

createTestAdmin();
