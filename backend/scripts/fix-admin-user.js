import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

async function checkAndFixAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        // Buscar el usuario admin
        const adminUser = await User.findOne({ email: "admin@test.com" });
        
        if (!adminUser) {
            console.log("❌ Usuario admin no encontrado");
            return;
        }

        console.log("📋 Usuario admin encontrado:");
        console.log(`   - Email: ${adminUser.email}`);
        console.log(`   - Nombre: ${adminUser.nombre}`);
        console.log(`   - Rol actual: ${adminUser.rol}`);
        console.log(`   - Activo: ${adminUser.activo}`);

        // Verificar si el rol es admin
        if (adminUser.rol !== 'admin') {
            console.log("🔧 Corrigiendo rol del usuario admin...");
            adminUser.rol = 'admin';
            await adminUser.save();
            console.log("✅ Rol corregido a 'admin'");
        } else {
            console.log("✅ El rol ya es 'admin'");
        }

        // Verificar si está activo
        if (!adminUser.activo) {
            console.log("🔧 Activando usuario admin...");
            adminUser.activo = true;
            await adminUser.save();
            console.log("✅ Usuario admin activado");
        } else {
            console.log("✅ El usuario ya está activo");
        }

        console.log("\n🎉 Usuario admin verificado y corregido:");
        console.log(`   - Email: ${adminUser.email}`);
        console.log(`   - Rol: ${adminUser.rol}`);
        console.log(`   - Activo: ${adminUser.activo}`);

    } catch (error) {
        console.error("❌ Error:", error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log("👋 Desconectado");
    }
}

checkAndFixAdminUser()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
