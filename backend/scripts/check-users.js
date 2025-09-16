import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

// Cargar variables de entorno
dotenv.config();

async function checkUsers() {
    try {
        console.log("🔍 Verificando usuarios en la base de datos...");

        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);

        // Obtener todos los usuarios
        const users = await User.find({}).select('name email createdAt');

        console.log(`📊 Total de usuarios: ${users.length}`);

        if (users.length > 0) {
            console.log("\n👥 Usuarios encontrados:");
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - Creado: ${user.createdAt.toISOString()}`);
            });
        } else {
            console.log("❌ No se encontraron usuarios");
        }

    } catch (error) {
        console.error("❌ Error verificando usuarios:", error.message);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        process.exit(0);
    }
}

// Ejecutar verificación
checkUsers();
