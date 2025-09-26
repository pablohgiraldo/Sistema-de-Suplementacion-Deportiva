import mongoose from 'mongoose';
import User from '../src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function listUsers() {
    try {
        console.log("👥 Conectando a la base de datos...");
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        console.log("\n📋 Listando usuarios existentes:");
        
        const users = await User.find({}, 'nombre email rol fechaCreacion').lean();
        
        if (users.length === 0) {
            console.log("❌ No hay usuarios en la base de datos");
        } else {
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. Usuario:`);
                console.log(`   Nombre: ${user.nombre}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Rol: ${user.rol}`);
                console.log(`   Fecha: ${user.fechaCreacion}`);
            });
        }

        console.log(`\n📊 Total de usuarios: ${users.length}`);

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Desconectado de MongoDB");
    }
}

listUsers();
