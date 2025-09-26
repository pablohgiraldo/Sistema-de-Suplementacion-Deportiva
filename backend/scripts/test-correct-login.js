import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function testCorrectLogin() {
    try {
        console.log("🔐 Probando login con credenciales correctas...");

        const loginData = {
            email: 'admin@test.com',
            contraseña: 'Admin123!'
        };

        console.log("Datos enviados:", JSON.stringify(loginData, null, 2));

        const response = await axios.post(`${API_BASE_URL}/users/login`, loginData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ Login exitoso!");
        console.log("Respuesta completa:", JSON.stringify(response.data, null, 2));

        return response.data.token;
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        return null;
    }
}

testCorrectLogin();
