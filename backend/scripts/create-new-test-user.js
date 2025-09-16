import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || "http://localhost:4000";

async function createNewTestUser() {
  try {
    console.log("🧪 Creando nuevo usuario de prueba...");
    
    const timestamp = Date.now();
    const email = `test-cart-${timestamp}@supergains.com`;
    
    const response = await axios.post(`${BASE_URL}/api/users/register`, {
      nombre: "Test Cart User",
      email: email,
      contraseña: "Password123",
      confirmarContraseña: "Password123"
    });
    
    console.log("✅ Usuario de prueba creado exitosamente");
    console.log("📧 Email:", email);
    console.log("🔑 Password: Password123");
    console.log("👤 Usuario ID:", response.data.data.user.id);
    
    return { email, password: "Password123" };
    
  } catch (error) {
    console.log("❌ Error creando usuario de prueba:", error.response?.data || error.message);
    return null;
  }
}

createNewTestUser();
