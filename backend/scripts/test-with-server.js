import { spawn } from 'child_process';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:4000';

async function waitForServer(maxAttempts = 30) {
    console.log('⏳ Esperando que el servidor esté listo...');

    for (let i = 0; i < maxAttempts; i++) {
        try {
            await axios.get(`${BASE_URL}/api/health`);
            console.log('✅ Servidor está listo!');
            return true;
        } catch (error) {
            if (i < maxAttempts - 1) {
                console.log(`⏳ Intento ${i + 1}/${maxAttempts}...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }
    return false;
}

async function testProtectedRoutes() {
    console.log('🧪 Iniciando pruebas de rutas protegidas con servidor...\n');

    try {
        // 1. Hacer login para obtener token
        console.log('1. Obteniendo token de autenticación...');
        const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
            email: 'test-login@supergains.com',
            contraseña: 'password123'
        });

        const { accessToken } = loginResponse.data.data.tokens;
        console.log('✅ Token obtenido:', accessToken.substring(0, 50) + '...');

        // 2. Probar acceso a ruta protegida (perfil)
        console.log('\n2. Probando acceso a perfil (ruta protegida)...');
        const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log('✅ Acceso a perfil exitoso');
        console.log('✅ Usuario:', profileResponse.data.data.usuario.email);

        // 3. Probar estado del token
        console.log('\n3. Probando verificación de estado del token...');
        const tokenStatusResponse = await axios.get(`${BASE_URL}/api/users/token-status`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log('✅ Estado del token obtenido');
        console.log('✅ Token válido:', tokenStatusResponse.data.data.token.valido);

        // 4. Probar creación de producto (ruta protegida)
        console.log('\n4. Probando creación de producto (ruta protegida)...');
        const productData = {
            name: 'Proteína Whey Test',
            brand: 'TestBrand',
            price: 29.99,
            stock: 100,
            description: 'Proteína de prueba',
            categories: ['Proteína', 'Test']
        };

        const productResponse = await axios.post(`${BASE_URL}/api/products`, productData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Producto creado exitosamente');
        console.log('✅ Respuesta del producto:', JSON.stringify(productResponse.data, null, 2));

        // 5. Probar acceso sin token (debería fallar)
        console.log('\n5. Probando acceso sin token (debería fallar)...');
        try {
            await axios.get(`${BASE_URL}/api/users/profile`);
            console.log('❌ Error: Debería haber fallado sin token');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Acceso sin token correctamente rechazado');
            } else {
                console.log('⚠️ Error inesperado:', error.response?.data?.message);
            }
        }

        // 6. Probar rutas públicas (deberían funcionar sin token)
        console.log('\n6. Probando rutas públicas (sin token)...');
        const productsResponse = await axios.get(`${BASE_URL}/api/products`);
        console.log('✅ Lista de productos obtenida sin token');
        console.log('✅ Respuesta de productos:', JSON.stringify(productsResponse.data, null, 2));

        console.log('\n🎉 Todas las pruebas de rutas protegidas pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    let serverProcess = null;

    try {
        // Iniciar servidor
        console.log('🚀 Iniciando servidor...');
        serverProcess = spawn('node', ['src/server.js'], {
            stdio: 'pipe',
            cwd: process.cwd()
        });

        // Esperar a que el servidor esté listo
        const serverReady = await waitForServer();
        if (!serverReady) {
            throw new Error('El servidor no se inició correctamente');
        }

        // Ejecutar pruebas
        await testProtectedRoutes();

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        // Cerrar servidor
        if (serverProcess) {
            console.log('\n🛑 Cerrando servidor...');
            serverProcess.kill();
        }
        process.exit(0);
    }
}

main();
