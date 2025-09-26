import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function testLogin() {
    try {
        console.log("🔐 Probando login con diferentes credenciales...");
        
        const credentials = [
            { email: 'admin@supergains.com', password: 'admin123' },
            { email: 'admin@supergains.com', password: 'admin' },
            { email: 'admin@supergains.com', password: '123456' },
            { email: 'admin', password: 'admin123' },
            { email: 'admin', password: 'admin' }
        ];

        for (const cred of credentials) {
            try {
                console.log(`\nProbando: ${cred.email} / ${cred.password}`);
                
                const response = await axios.post(`${API_BASE_URL}/users/login`, {
                    email: cred.email,
                    contraseña: cred.password
                });

                if (response.data.success) {
                    console.log(`✅ Login exitoso con: ${cred.email} / ${cred.password}`);
                    console.log(`   Usuario: ${response.data.user.nombre}`);
                    console.log(`   Rol: ${response.data.user.rol}`);
                    return { email: cred.email, password: cred.password };
                }
            } catch (error) {
                console.log(`❌ Falló: ${error.response?.data?.error || error.message}`);
            }
        }

        console.log("\n❌ No se pudo hacer login con ninguna credencial");
        return null;
    } catch (error) {
        console.error("❌ Error general:", error.message);
        return null;
    }
}

testLogin();
