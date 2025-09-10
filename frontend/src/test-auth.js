// Script de prueba para verificar la funcionalidad de autenticación
// Este archivo se puede ejecutar en la consola del navegador para probar las funciones

// Función para probar el registro
async function testRegister() {
    console.log('🧪 Probando registro de usuario...');

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: 'Usuario Test',
                email: `test${Date.now()}@ejemplo.com`,
                contraseña: 'Password123',
                rol: 'usuario'
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Registro exitoso:', data.data.user.email);
            return data.data;
        } else {
            console.log('❌ Error en registro:', data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
        return null;
    }
}

// Función para probar el login
async function testLogin(email, contraseña) {
    console.log('🧪 Probando login...');

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, contraseña })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Login exitoso:', data.data.user.email);

            // Guardar tokens en localStorage
            localStorage.setItem('accessToken', data.data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            return data.data;
        } else {
            console.log('❌ Error en login:', data.error);
            return null;
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
        return null;
    }
}

// Función para probar el estado del token
async function testTokenStatus() {
    console.log('🧪 Probando estado del token...');

    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.log('❌ No hay token en localStorage');
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/token-status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Token válido:', data.data.usuario.email);
            console.log('📊 Información del token:', data.data.token);
        } else {
            console.log('❌ Token inválido:', data.error);
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
    }
}

// Función para probar el logout
async function testLogout() {
    console.log('🧪 Probando logout...');

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        console.log('❌ No hay refresh token en localStorage');
        return;
    }

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Logout exitoso');

            // Limpiar localStorage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
        } else {
            console.log('❌ Error en logout:', data.error);
        }
    } catch (error) {
        console.log('❌ Error de red:', error.message);
    }
}

// Función para ejecutar todas las pruebas
async function runAllTests() {
    console.log('🚀 Iniciando pruebas de autenticación...\n');

    // Test 1: Registro
    const userData = await testRegister();
    if (!userData) return;

    // Test 2: Login
    const loginData = await testLogin(userData.user.email, 'Password123');
    if (!loginData) return;

    // Test 3: Estado del token
    await testTokenStatus();

    // Test 4: Logout
    await testLogout();

    console.log('\n🎉 Todas las pruebas completadas!');
}

// Exportar funciones para uso en consola
window.testAuth = {
    register: testRegister,
    login: testLogin,
    tokenStatus: testTokenStatus,
    logout: testLogout,
    runAll: runAllTests
};

console.log('🔧 Funciones de prueba disponibles:');
console.log('- testAuth.register()');
console.log('- testAuth.login(email, password)');
console.log('- testAuth.tokenStatus()');
console.log('- testAuth.logout()');
console.log('- testAuth.runAll()');
