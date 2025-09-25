import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

const fixTestUser = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
        console.log("🔧 Arreglando usuario de prueba...\n");

        // 1. Eliminar usuario existente si existe
        console.log("1️⃣ Eliminando usuario existente...");
        const deletedUser = await User.findOneAndDelete({ email: 'test@supergains.com' });
        if (deletedUser) {
            console.log("   ✅ Usuario anterior eliminado");
        } else {
            console.log("   ⏭️ No había usuario anterior");
        }

        // 2. Crear nuevo usuario con contraseña correcta
        console.log("\n2️⃣ Creando nuevo usuario...");
        const newUser = new User({
            nombre: 'Usuario Test',
            email: 'test@supergains.com',
            contraseña: 'TestPassword123',
            rol: 'usuario',
            activo: true
        });

        await newUser.save();
        console.log("   ✅ Usuario creado exitosamente");
        console.log("   📧 Email:", newUser.email);
        console.log("   🔐 Contraseña encriptada:", !!newUser.contraseña);

        // 3. Probar comparación de contraseña
        console.log("\n3️⃣ Probando comparación de contraseña...");
        const passwordMatch = await newUser.compararContraseña('TestPassword123');
        console.log("   🔐 Contraseña válida:", passwordMatch);

        // 4. Probar login con fetch
        console.log("\n4️⃣ Probando login con fetch...");
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

                // Guardar el token para pruebas posteriores
                global.testAccessToken = responseData.data.tokens.accessToken;
                console.log("   💾 Token guardado para pruebas posteriores");
            } else {
                console.log("   ❌ Login falló");
            }
        } catch (error) {
            console.log("   ❌ Error en fetch:", error.message);
        }

        console.log("\n🎉 Usuario arreglado exitosamente!");

    } catch (error) {
        console.error("❌ Error durante la corrección:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🏁 Proceso completado");
    }
};

fixTestUser();
