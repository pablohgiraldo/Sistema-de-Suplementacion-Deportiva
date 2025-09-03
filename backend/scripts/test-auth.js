import axios from 'axios';
import 'dotenv/config';

const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';

// Colores para la consola
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

const log = (color, message) => console.log(`${color}${message}${colors.reset}`);

// Función para hacer peticiones HTTP
const makeRequest = async (method, endpoint, data = null, token = null) => {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(data && { data })
        };

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            data: error.response?.data,
            status: error.response?.status,
            message: error.message
        };
    }
};

// Función principal de pruebas
const testAuthEndpoints = async () => {
    log(colors.blue, '🧪 Iniciando pruebas de endpoints de autenticación...\n');

    let token = null;
    let userId = null;

    // 1. Probar registro de usuario
    log(colors.yellow, '1️⃣ Probando registro de usuario...');
    const registerData = {
        nombre: 'Usuario Test',
        email: 'test@example.com',
        contraseña: 'password123',
        rol: 'usuario'
    };

    const registerResult = await makeRequest('POST', '/users/register', registerData);

    if (registerResult.success) {
        log(colors.green, '✅ Registro exitoso');
        log(colors.blue, `   Usuario ID: ${registerResult.data.data.usuario._id}`);
        log(colors.blue, `   Token: ${registerResult.data.data.token.substring(0, 20)}...`);
        token = registerResult.data.data.token;
        userId = registerResult.data.data.usuario._id;
    } else {
        log(colors.red, `❌ Error en registro: ${registerResult.data?.message || registerResult.message}`);
        if (registerResult.data?.message?.includes('Ya existe')) {
            log(colors.yellow, '   Usuario ya existe, continuando con login...');
        } else {
            return;
        }
    }

    // 2. Probar login
    log(colors.yellow, '\n2️⃣ Probando login...');
    const loginData = {
        email: 'test@example.com',
        contraseña: 'password123'
    };

    const loginResult = await makeRequest('POST', '/users/login', loginData);

    if (loginResult.success) {
        log(colors.green, '✅ Login exitoso');
        log(colors.blue, `   Usuario: ${loginResult.data.data.usuario.nombre}`);
        log(colors.blue, `   Email: ${loginResult.data.data.usuario.email}`);
        log(colors.blue, `   Rol: ${loginResult.data.data.usuario.rol}`);
        token = loginResult.data.data.token;
        userId = loginResult.data.data.usuario._id;
    } else {
        log(colors.red, `❌ Error en login: ${loginResult.data?.message || loginResult.message}`);
        return;
    }

    // 3. Probar obtener perfil (con token)
    log(colors.yellow, '\n3️⃣ Probando obtener perfil...');
    const profileResult = await makeRequest('GET', '/users/profile', null, token);

    if (profileResult.success) {
        log(colors.green, '✅ Perfil obtenido exitosamente');
        log(colors.blue, `   Nombre: ${profileResult.data.data.usuario.nombre}`);
        log(colors.blue, `   Email: ${profileResult.data.data.usuario.email}`);
        log(colors.blue, `   Rol: ${profileResult.data.data.usuario.rol}`);
        log(colors.blue, `   Activo: ${profileResult.data.data.usuario.activo}`);
    } else {
        log(colors.red, `❌ Error al obtener perfil: ${profileResult.data?.message || profileResult.message}`);
    }

    // 4. Probar actualizar perfil
    log(colors.yellow, '\n4️⃣ Probando actualizar perfil...');
    const updateData = {
        nombre: 'Usuario Test Actualizado'
    };

    const updateResult = await makeRequest('PUT', '/users/profile', updateData, token);

    if (updateResult.success) {
        log(colors.green, '✅ Perfil actualizado exitosamente');
        log(colors.blue, `   Nuevo nombre: ${updateResult.data.data.usuario.nombre}`);
    } else {
        log(colors.red, `❌ Error al actualizar perfil: ${updateResult.data?.message || updateResult.message}`);
    }

    // 5. Probar endpoint sin token (debería fallar)
    log(colors.yellow, '\n5️⃣ Probando acceso sin token (debería fallar)...');
    const noTokenResult = await makeRequest('GET', '/users/profile');

    if (!noTokenResult.success && noTokenResult.status === 401) {
        log(colors.green, '✅ Correctamente rechazado sin token');
        log(colors.blue, `   Mensaje: ${noTokenResult.data?.message}`);
    } else {
        log(colors.red, '❌ Error: El endpoint debería requerir autenticación');
    }

    // 6. Probar login con credenciales incorrectas
    log(colors.yellow, '\n6️⃣ Probando login con credenciales incorrectas...');
    const wrongLoginData = {
        email: 'test@example.com',
        contraseña: 'wrongpassword'
    };

    const wrongLoginResult = await makeRequest('POST', '/users/login', wrongLoginData);

    if (!wrongLoginResult.success && wrongLoginResult.status === 401) {
        log(colors.green, '✅ Correctamente rechazado con credenciales incorrectas');
        log(colors.blue, `   Mensaje: ${wrongLoginResult.data?.message}`);
    } else {
        log(colors.red, '❌ Error: Debería rechazar credenciales incorrectas');
    }

    log(colors.blue, '\n🎉 Pruebas completadas!');
};

// Ejecutar las pruebas
testAuthEndpoints().catch(error => {
    log(colors.red, `❌ Error en las pruebas: ${error.message}`);
    process.exit(1);
});
