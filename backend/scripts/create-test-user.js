import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";
import bcrypt from "bcryptjs";

async function createTestUser() {
    try {
        // Conectar a la base de datos
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a la base de datos");

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: "test@supergains.com" });

        if (existingUser) {
            console.log("👤 Usuario de prueba ya existe:");
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Nombre: ${existingUser.nombre}`);
            console.log(`   ID: ${existingUser._id}`);
        } else {
            // Crear usuario de prueba
            const hashedPassword = await bcrypt.hash("password123", 10);

            const testUser = new User({
                nombre: "Usuario Prueba",
                email: "test@supergains.com",
                password: hashedPassword,
                role: "user"
            });

            await testUser.save();
            console.log("✅ Usuario de prueba creado:");
            console.log(`   Email: ${testUser.email}`);
            console.log(`   Nombre: ${testUser.nombre}`);
            console.log(`   ID: ${testUser._id}`);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Desconectado de la base de datos");
    }
}

createTestUser();
