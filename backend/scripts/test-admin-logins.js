import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function testAdminLogins() {
    try {
        console.log("🔐 Probando login con diferentes usuarios admin...");
        
        const adminCredentials = [
            { email: 'admin@supergains.com', password: 'admin123' },
            { email: 'admin@supergains.co', password: 'admin123' },
            { email: 'admin@test.com', password: 'admin123' },
            { email: 'admin@supergains.co', password: 'admin' },
            { email: 'admin@test.com', password: 'admin' },
            { email: 'admin@supergains.com', password: '123456' },
            { email: 'admin@supergains.co', password: '123456' },
            { email: 'admin@test.com', password: '123456' }
        ];

        for (const cred of adminCredentials) {
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
                    console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
                    return { email: cred.email, password: cred.password, token: response.data.token };
                }
            } catch (error) {
                console.log(`❌ Falló: ${error.response?.data?.error || error.message}`);
            }
        }

        console.log("\n❌ No se pudo hacer login con ninguna credencial admin");
        return null;
    } catch (error) {
        console.error("❌ Error general:", error.message);
        return null;
    }
}

testAdminLogins();
