import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || "http://localhost:4000";

async function createAdminUser() {
    try {
        console.log("👑 Creando usuario administrador...");

        const response = await axios.post(`${BASE_URL}/api/users/register`, {
            nombre: "Administrador SuperGains",
            email: "admin@test.com",
            contraseña: "Admin123!",
            rol: "admin"
        });

        console.log("✅ Usuario administrador creado exitosamente");
        console.log("📧 Email: admin@test.com");
        console.log("🔑 Password: Admin123!");
        console.log("👤 Usuario ID:", response.data.data.user.id);
        console.log("🔐 Rol:", response.data.data.user.rol);

    } catch (error) {
        if (error.response?.data?.error === 'El usuario ya existe') {
            console.log("ℹ️ Usuario administrador ya existe");
            console.log("📧 Email: admin@test.com");
            console.log("🔑 Password: Admin123!");
        } else {
            console.log("❌ Error creando usuario administrador:", error.response?.data || error.message);
        }
    }
}

createAdminUser();
