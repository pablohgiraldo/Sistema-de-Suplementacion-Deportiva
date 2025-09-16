import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || "http://localhost:4000";

async function createTestUser() {
    try {
        console.log("🧪 Creando usuario de prueba...");

        const response = await axios.post(`${BASE_URL}/api/users/register`, {
            nombre: "Usuario Prueba",
            email: "test@example.com",
            contraseña: "Password123",
            confirmarContraseña: "Password123"
        });

        console.log("✅ Usuario de prueba creado exitosamente");
        console.log("📧 Email: test@example.com");
        console.log("🔑 Password: Password123");
        console.log("👤 Usuario ID:", response.data.data.user.id);

    } catch (error) {
        if (error.response?.data?.error === 'El usuario ya existe') {
            console.log("ℹ️ Usuario de prueba ya existe");
            console.log("📧 Email: test@example.com");
            console.log("🔑 Password: Password123");
        } else {
            console.log("❌ Error creando usuario de prueba:", error.response?.data || error.message);
        }
    }
}

createTestUser();