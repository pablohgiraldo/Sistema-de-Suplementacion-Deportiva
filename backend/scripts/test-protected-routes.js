import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

async function testProtectedRoutes() {
    console.log('🧪 Iniciando pruebas de rutas protegidas...\n');

    try {
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);

        // 1. Crear un usuario de prueba
        console.log('1. Creando usuario de prueba...');
        const testUser = {
            nombre: 'Usuario Admin',
            email: 'admin@supergains.com',
            contraseña: 'password123',
            rol: 'admin'
        };

        // Eliminar usuario si existe
        await User.findOneAndDelete({ email: testUser.email });

        // Crear usuario
        const newUser = new User(testUser);
        await newUser.save();
        console.log('✅ Usuario admin creado');

        // 2. Hacer login para obtener token
        console.log('\n2. Obteniendo token de autenticación...');
        const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
            email: testUser.email,
            contraseña: testUser.contraseña
        });

        const { accessToken } = loginResponse.data.data.tokens;
        console.log('✅ Token obtenido:', accessToken.substring(0, 50) + '...');

        // 3. Probar acceso a ruta protegida (perfil)
        console.log('\n3. Probando acceso a perfil (ruta protegida)...');
        const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log('✅ Acceso a perfil exitoso');
        console.log('✅ Usuario:', profileResponse.data.data.usuario.email);

        // 4. Probar estado del token
        console.log('\n4. Probando verificación de estado del token...');
        const tokenStatusResponse = await axios.get(`${BASE_URL}/api/users/token-status`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log('✅ Estado del token obtenido');
        console.log('✅ Token válido:', tokenStatusResponse.data.data.token.valido);
        console.log('✅ Expira en:', tokenStatusResponse.data.data.token.expiraEn);

        // 5. Probar creación de producto (ruta protegida)
        console.log('\n5. Probando creación de producto (ruta protegida)...');
        const productData = {
            name: 'Proteína Whey',
            brand: 'MyProtein',
            price: 29.99,
            stock: 100,
            description: 'Proteína de suero de leche',
            categories: ['Proteína', 'Suplementos']
        };

        const productResponse = await axios.post(`${BASE_URL}/api/products`, productData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Producto creado exitosamente');
        console.log('✅ Producto ID:', productResponse.data.data.product._id);

        // 6. Probar acceso sin token (debería fallar)
        console.log('\n6. Probando acceso sin token (debería fallar)...');
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

        // 7. Probar acceso con token inválido (debería fallar)
        console.log('\n7. Probando acceso con token inválido (debería fallar)...');
        try {
            await axios.get(`${BASE_URL}/api/users/profile`, {
                headers: {
                    'Authorization': 'Bearer token_invalido'
                }
            });
            console.log('❌ Error: Debería haber fallado con token inválido');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Token inválido correctamente rechazado');
            } else {
                console.log('⚠️ Error inesperado:', error.response?.data?.message);
            }
        }

        // 8. Probar rutas públicas (deberían funcionar sin token)
        console.log('\n8. Probando rutas públicas (sin token)...');
        const productsResponse = await axios.get(`${BASE_URL}/api/products`);
        console.log('✅ Lista de productos obtenida sin token');
        console.log('✅ Productos encontrados:', productsResponse.data.data.products.length);

        // 9. Probar headers de expiración de token
        console.log('\n9. Verificando headers de expiración...');
        const headersResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const headers = headersResponse.headers;
        if (headers['x-token-expires-soon']) {
            console.log('⚠️ Token expira pronto');
        } else {
            console.log('✅ Token tiene tiempo suficiente');
        }

        console.log('\n🎉 Todas las pruebas de rutas protegidas pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas de rutas protegidas:', error.response?.data || error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Ejecutar pruebas
testProtectedRoutes();
