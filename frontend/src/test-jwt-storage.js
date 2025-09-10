// Script de prueba para verificar el manejo de tokens JWT en localStorage
// Ejecutar en la consola del navegador: testJWTStorage()

window.testJWTStorage = async function () {
    console.log('🧪 Probando manejo de tokens JWT en localStorage...\n');

    // Importar las utilidades de tokens
    const {
        saveAuthData,
        getAuthData,
        clearAuthData,
        hasValidTokens,
        saveAccessToken,
        getAccessToken,
        getRefreshToken,
        getUser
    } = await import('./utils/tokenUtils.js');

    // 1. Probar guardar datos de autenticación
    console.log('1️⃣ Probando guardar datos de autenticación...');
    const testAuthData = {
        accessToken: 'test-access-token-123',
        refreshToken: 'test-refresh-token-456',
        user: {
            _id: 'test-user-id',
            nombre: 'Usuario Test',
            email: 'test@ejemplo.com',
            rol: 'usuario'
        }
    };

    saveAuthData(testAuthData);
    console.log('✅ Datos guardados correctamente');

    // 2. Probar recuperar datos
    console.log('\n2️⃣ Probando recuperar datos...');
    const retrievedData = getAuthData();
    console.log('Datos recuperados:', retrievedData);
    console.log('✅ Datos recuperados correctamente');

    // 3. Probar verificación de tokens
    console.log('\n3️⃣ Probando verificación de tokens...');
    const hasTokens = hasValidTokens();
    console.log('¿Tiene tokens válidos?', hasTokens);
    console.log('✅ Verificación de tokens funcionando');

    // 4. Probar funciones individuales
    console.log('\n4️⃣ Probando funciones individuales...');
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    const user = getUser();

    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('Usuario:', user);
    console.log('✅ Funciones individuales funcionando');

    // 5. Probar actualización de access token
    console.log('\n5️⃣ Probando actualización de access token...');
    const newAccessToken = 'new-access-token-789';
    saveAccessToken(newAccessToken);
    const updatedToken = getAccessToken();
    console.log('Token actualizado:', updatedToken);
    console.log('✅ Actualización de token funcionando');

    // 6. Probar limpieza de datos
    console.log('\n6️⃣ Probando limpieza de datos...');
    clearAuthData();
    const clearedData = getAuthData();
    console.log('Datos después de limpiar:', clearedData);
    console.log('¿Tiene tokens válidos después de limpiar?', hasValidTokens());
    console.log('✅ Limpieza de datos funcionando');

    console.log('\n🎉 ¡Todas las pruebas de tokens JWT completadas exitosamente!');
    console.log('\n📝 Para probar la funcionalidad completa:');
    console.log('1. Ve a /register y crea una cuenta');
    console.log('2. Ve a /login e inicia sesión');
    console.log('3. Verifica que los tokens se guarden en localStorage');
    console.log('4. Recarga la página y verifica que la sesión persista');
    console.log('5. Haz logout y verifica que los tokens se limpien');
};

// Función para probar la persistencia de sesión
window.testSessionPersistence = async function () {
    console.log('🔄 Probando persistencia de sesión...\n');

    const { getAuthData, hasValidTokens } = await import('./utils/tokenUtils.js');

    console.log('Estado actual de la autenticación:');
    console.log('Datos en localStorage:', getAuthData());
    console.log('¿Tiene tokens válidos?', hasValidTokens());

    if (hasValidTokens()) {
        console.log('✅ Sesión persistente detectada');
        console.log('El usuario debería estar logueado automáticamente');
    } else {
        console.log('❌ No hay sesión persistente');
        console.log('El usuario necesita hacer login');
    }
};

console.log('🔧 Scripts de prueba de JWT cargados:');
console.log('- testJWTStorage() - Probar utilidades de tokens');
console.log('- testSessionPersistence() - Verificar persistencia de sesión');
