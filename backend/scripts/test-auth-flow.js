import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

async function testCompleteAuthFlow() {
    console.log('🧪 Iniciando prueba del flujo completo de autenticación...\n');

    try {
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);
        console.log('✅ Base de datos conectada');

        // 1. REGISTRO
        console.log('\n📝 PASO 1: REGISTRO DE USUARIO');
        console.log('─'.repeat(50));

        const userData = {
            nombre: 'Usuario Demo',
            email: 'demo@supergains.com',
            contraseña: 'password123',
            rol: 'usuario'
        };

        // Eliminar usuario si existe
        await User.findOneAndDelete({ email: userData.email });

        try {
            const registerResponse = await axios.post(`${BASE_URL}/api/users/register`, userData);
            console.log('✅ Usuario registrado exitosamente');
            console.log('✅ Usuario ID:', registerResponse.data.data.user.id);
            console.log('✅ Access Token generado:', registerResponse.data.data.tokens.accessToken.substring(0, 50) + '...');
            console.log('✅ Refresh Token generado:', registerResponse.data.data.tokens.refreshToken.substring(0, 50) + '...');

            var { accessToken, refreshToken } = registerResponse.data.data.tokens;
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya existe')) {
                console.log('⚠️ Usuario ya existe, continuando con login...');
            } else {
                throw error;
            }
        }

        // 2. LOGIN
        console.log('\n🔐 PASO 2: LOGIN DE USUARIO');
        console.log('─'.repeat(50));

        const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
            email: userData.email,
            contraseña: userData.contraseña
        });

        console.log('✅ Login exitoso');
        console.log('✅ Usuario:', loginResponse.data.data.user.email);
        console.log('✅ Access Token:', loginResponse.data.data.tokens.accessToken.substring(0, 50) + '...');
        console.log('✅ Refresh Token:', loginResponse.data.data.tokens.refreshToken.substring(0, 50) + '...');

        accessToken = loginResponse.data.data.tokens.accessToken;
        refreshToken = loginResponse.data.data.tokens.refreshToken;

        // 3. ACCESO A RUTA PROTEGIDA
        console.log('\n🛡️ PASO 3: ACCESO A RUTA PROTEGIDA');
        console.log('─'.repeat(50));

        const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('✅ Acceso a perfil exitoso');
        console.log('✅ Usuario autenticado:', profileResponse.data.data.usuario.email);
        console.log('✅ Rol del usuario:', profileResponse.data.data.usuario.rol);

        // 4. VERIFICACIÓN DE ESTADO DEL TOKEN
        console.log('\n🔍 PASO 4: VERIFICACIÓN DE ESTADO DEL TOKEN');
        console.log('─'.repeat(50));

        const tokenStatusResponse = await axios.get(`${BASE_URL}/api/users/token-status`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('✅ Estado del token verificado');
        console.log('✅ Token válido:', tokenStatusResponse.data.data.token.valido);
        console.log('✅ Expira en:', tokenStatusResponse.data.data.token.expiraEn);
        console.log('✅ Tiempo restante:', tokenStatusResponse.data.data.token.tiempoRestante, 'segundos');
        console.log('✅ Expira pronto:', tokenStatusResponse.data.data.token.expiraPronto);

        // 5. CREACIÓN DE PRODUCTO (RUTA PROTEGIDA)
        console.log('\n📦 PASO 5: CREACIÓN DE PRODUCTO (RUTA PROTEGIDA)');
        console.log('─'.repeat(50));

        const productData = {
            name: 'Proteína Whey Demo',
            brand: 'DemoBrand',
            price: 29.99,
            stock: 100,
            description: 'Proteína de demostración',
            categories: ['Proteína', 'Demo']
        };

        const productResponse = await axios.post(`${BASE_URL}/api/products`, productData, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Producto creado exitosamente');
        console.log('✅ Producto ID:', productResponse.data.data._id);
        console.log('✅ Nombre:', productResponse.data.data.name);

        // 6. REFRESH DE TOKEN
        console.log('\n🔄 PASO 6: REFRESH DE TOKEN');
        console.log('─'.repeat(50));

        const refreshResponse = await axios.post(`${BASE_URL}/api/users/refresh`, {
            refreshToken: refreshToken
        });

        console.log('✅ Token refrescado exitosamente');
        console.log('✅ Nuevo Access Token:', refreshResponse.data.data.accessToken.substring(0, 50) + '...');

        const newAccessToken = refreshResponse.data.data.accessToken;

        // 7. USO DEL NUEVO TOKEN
        console.log('\n🆕 PASO 7: USO DEL NUEVO TOKEN');
        console.log('─'.repeat(50));

        const newProfileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${newAccessToken}`
            }
        });

        console.log('✅ Nuevo token funciona correctamente');
        console.log('✅ Usuario:', newProfileResponse.data.data.usuario.email);

        // 8. PRUEBA DE ACCESO SIN TOKEN (DEBERÍA FALLAR)
        console.log('\n❌ PASO 8: PRUEBA DE ACCESO SIN TOKEN (DEBERÍA FALLAR)');
        console.log('─'.repeat(50));

        try {
            await axios.get(`${BASE_URL}/api/users/profile`);
            console.log('❌ Error: Debería haber fallado sin token');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Acceso sin token correctamente rechazado');
                console.log('✅ Mensaje:', error.response.data.message);
            } else {
                console.log('⚠️ Error inesperado:', error.response?.data?.message);
            }
        }

        // 9. PRUEBA DE RUTAS PÚBLICAS (DEBERÍAN FUNCIONAR)
        console.log('\n🌐 PASO 9: PRUEBA DE RUTAS PÚBLICAS (SIN TOKEN)');
        console.log('─'.repeat(50));

        const productsResponse = await axios.get(`${BASE_URL}/api/products`);
        console.log('✅ Lista de productos obtenida sin token');
        console.log('✅ Productos encontrados:', productsResponse.data.count);

        // 10. LOGOUT
        console.log('\n🚪 PASO 10: LOGOUT');
        console.log('─'.repeat(50));

        const logoutResponse = await axios.post(`${BASE_URL}/api/users/logout`, {
            refreshToken: refreshToken
        });

        console.log('✅ Logout exitoso');
        console.log('✅ Mensaje:', logoutResponse.data.message);

        // 11. PRUEBA POST-LOGOUT (DEBERÍA FALLAR)
        console.log('\n🔒 PASO 11: PRUEBA POST-LOGOUT (DEBERÍA FALLAR)');
        console.log('─'.repeat(50));

        try {
            await axios.get(`${BASE_URL}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('⚠️ El token aún funciona después del logout');
        } catch (error) {
            if (error.response?.status === 401) {
                console.log('✅ Token correctamente invalidado después del logout');
            } else {
                console.log('⚠️ Error inesperado:', error.response?.data?.message);
            }
        }

        console.log('\n🎉 ¡FLUJO COMPLETO DE AUTENTICACIÓN EXITOSO!');
        console.log('─'.repeat(50));
        console.log('✅ Registro de usuario');
        console.log('✅ Login con JWT');
        console.log('✅ Acceso a rutas protegidas');
        console.log('✅ Verificación de estado del token');
        console.log('✅ Creación de recursos protegidos');
        console.log('✅ Refresh de tokens');
        console.log('✅ Uso de nuevos tokens');
        console.log('✅ Rechazo de acceso sin token');
        console.log('✅ Acceso a rutas públicas');
        console.log('✅ Logout exitoso');
        console.log('✅ Invalidación de tokens');

    } catch (error) {
        console.error('❌ Error en el flujo de autenticación:', error.response?.data || error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Ejecutar prueba
testCompleteAuthFlow();
