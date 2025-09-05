import "dotenv/config";
import axios from "axios";

const API_BASE_URL = process.env.API_URL || "http://localhost:4000/api";

async function testLogin() {
    try {
        console.log("🔐 Probando login...");
        console.log(`📡 URL: ${API_BASE_URL}/users/login`);

            const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email: "test@supergains.com",
      contraseña: "password123"
    });

        console.log("✅ Respuesta del servidor:");
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error("❌ Error:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Message:", error.message);
        }
    }
}

testLogin();
