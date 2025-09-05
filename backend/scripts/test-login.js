import dotenv from 'dotenv';
import axios from 'axios';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

async function testLoginFlow() {
    console.log('🧪 Iniciando pruebas de flujo de login con JWT...\n');

    try {
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);

        // 1. Crear un usuario de prueba
        console.log('1. Creando usuario de prueba...');
        const testUser = {
            nombre: 'Usuario de Prueba',
            email: 'test-login@supergains.com',
            contraseña: 'password123',
            rol: 'usuario'
        };

        // Eliminar usuario si existe
        await User.findOneAndDelete({ email: testUser.email });

        // Crear usuario
        const newUser = new User(testUser);
        await newUser.save();
        console.log('✅ Usuario de prueba creado');

        // 2. Probar registro con JWT
        console.log('\n2. Probando registro con JWT...');
        try {
            const registerResponse = await axios.post(`${BASE_URL}/api/users/register`, testUser);
            console.log('✅ Registro exitoso');
            console.log('✅ Usuario:', registerResponse.data.data.user.email);
            console.log('✅ Access Token generado:', registerResponse.data.data.tokens.accessToken.substring(0, 50) + '...');
            console.log('✅ Refresh Token generado:', registerResponse.data.data.tokens.refreshToken.substring(0, 50) + '...');
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Ya existe')) {
                console.log('⚠️ Usuario ya existe, continuando con login...');
            } else {
                throw error;
            }
        }

        // 3. Probar login con JWT
        console.log('\n3. Probando login con JWT...');
        const loginData = {
            email: testUser.email,
            contraseña: testUser.contraseña
        };

        const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, loginData);
        console.log('✅ Login exitoso');
        console.log('✅ Usuario:', loginResponse.data.data.user.email);
        console.log('✅ Access Token generado:', loginResponse.data.data.tokens.accessToken.substring(0, 50) + '...');
        console.log('✅ Refresh Token generado:', loginResponse.data.data.tokens.refreshToken.substring(0, 50) + '...');

        const { accessToken, refreshToken } = loginResponse.data.data.tokens;

        // 4. Probar acceso a ruta protegida
        console.log('\n4. Probando acceso a ruta protegida...');
        const profileResponse = await axios.get(`${BASE_URL}/api/users/profile`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        console.log('✅ Acceso a perfil exitoso');
        console.log('✅ Usuario autenticado:', profileResponse.data.data.usuario.email);

        // 5. Probar refresh de token
        console.log('\n5. Probando refresh de token...');
        const refreshResponse = await axios.post(`${BASE_URL}/api/users/refresh`, {
            refreshToken: refreshToken
        });
        console.log('✅ Refresh de token exitoso');
        console.log('✅ Nuevo Access Token:', refreshResponse.data.data.accessToken.substring(0, 50) + '...');

        // 6. Probar logout
        console.log('\n6. Probando logout...');
        const logoutResponse = await axios.post(`${BASE_URL}/api/users/logout`, {
            refreshToken: refreshToken
        });
        console.log('✅ Logout exitoso');

        // 7. Probar acceso con token expirado/inválido
        console.log('\n7. Probando acceso con token inválido...');
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

        console.log('\n🎉 Todas las pruebas de login con JWT pasaron exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas de login:', error.response?.data || error.message);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

// Ejecutar pruebas
testLoginFlow();
