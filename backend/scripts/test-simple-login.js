import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

const testSimpleLogin = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
        console.log("🧪 Probando login simple...\n");

        // 1. Verificar usuario de prueba
        console.log("1️⃣ Verificando usuario de prueba...");
        const testUser = await User.findOne({ email: 'test@supergains.com' });
        if (!testUser) {
            console.log("   ❌ Usuario de prueba no encontrado");
            return;
        }
        console.log("   ✅ Usuario encontrado:", testUser.email);
        console.log("   📊 Usuario activo:", testUser.activo);

        // 2. Probar comparación de contraseña
        console.log("\n2️⃣ Probando comparación de contraseña...");
        const passwordMatch = await testUser.compararContraseña('TestPassword123');
        console.log("   🔐 Contraseña válida:", passwordMatch);

        // 3. Probar login directo con fetch
        console.log("\n3️⃣ Probando login con fetch...");
        const loginData = {
            email: 'test@supergains.com',
            contraseña: 'TestPassword123'
        };

        try {
            const response = await fetch('http://localhost:4000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const responseData = await response.json();
            console.log("   📡 Status:", response.status);
            console.log("   📄 Response:", JSON.stringify(responseData, null, 2));

            if (response.ok && responseData.success) {
                console.log("   ✅ Login exitoso!");
                console.log("   🎫 Access Token:", responseData.data.tokens.accessToken.substring(0, 50) + "...");
            } else {
                console.log("   ❌ Login falló");
            }
        } catch (error) {
            console.log("   ❌ Error en fetch:", error.message);
        }

        console.log("\n🎉 Prueba completada!");

    } catch (error) {
        console.error("❌ Error durante la prueba:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🏁 Proceso completado");
    }
};

testSimpleLogin();
