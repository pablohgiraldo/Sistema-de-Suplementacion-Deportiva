const BASE_URL = 'http://localhost:4000/api';
let adminToken = '';
let testUserId = '';

// Función helper para hacer peticiones
async function makeRequest(method, endpoint, data = null, token = null) {
    const url = new URL(`${BASE_URL}${endpoint}`);

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    return {
        status: response.status,
        data: result
    };
}

async function testUserManagement() {
    console.log('🧪 Iniciando pruebas de gestión de usuarios\n');

    try {
        // 1. Login como administrador
        console.log('1️⃣ Login como administrador...');
        const loginResponse = await makeRequest('POST', '/users/login', {
            email: 'admin@test.com',
            contraseña: 'Admin123!'
        });

        if (loginResponse.status === 200 && loginResponse.data.success) {
            adminToken = loginResponse.data.data.tokens.accessToken;
            console.log('✅ Login exitoso');
            console.log(`   Usuario: ${loginResponse.data.data.user.nombre}`);
            console.log(`   Token: ${adminToken.substring(0, 30)}...`);
        } else {
            console.log('❌ Error en login:', loginResponse.data);
            return;
        }

        // 2. Listar usuarios
        console.log('\n2️⃣ Listar usuarios...');
        const listResponse = await makeRequest('GET', '/users?page=1&limit=5', null, adminToken);

        if (listResponse.status === 200 && listResponse.data.success) {
            console.log('✅ Usuarios listados exitosamente');
            console.log(`   Total de usuarios: ${listResponse.data.pagination.total}`);
            console.log(`   Usuarios en esta página: ${listResponse.data.data.length}`);

            // Guardar un usuario para pruebas (que no sea admin)
            testUserId = listResponse.data.data.find(u => u.rol !== 'admin')?._id;

            if (testUserId) {
                const testUser = listResponse.data.data.find(u => u._id === testUserId);
                console.log(`   Usuario de prueba seleccionado: ${testUser.nombre} (${testUser.email})`);
            } else {
                console.log('⚠️ No se encontró un usuario no-admin para pruebas');
            }
        } else {
            console.log('❌ Error al listar usuarios:', listResponse.data);
        }

        if (!testUserId) {
            console.log('\n⚠️ No hay usuarios disponibles para probar bloqueo y cambio de rol');
            return;
        }

        // 3. Probar búsqueda de usuarios
        console.log('\n3️⃣ Buscar usuarios...');
        const searchResponse = await makeRequest('GET', '/users?search=test', null, adminToken);

        if (searchResponse.status === 200) {
            console.log('✅ Búsqueda exitosa');
            console.log(`   Resultados encontrados: ${searchResponse.data.data.length}`);
        }

        // 4. Filtrar por rol
        console.log('\n4️⃣ Filtrar usuarios por rol...');
        const filterResponse = await makeRequest('GET', '/users?rol=user', null, adminToken);

        if (filterResponse.status === 200) {
            console.log('✅ Filtro por rol exitoso');
            console.log(`   Usuarios con rol "user": ${filterResponse.data.data.length}`);
        }

        // 5. Bloquear usuario
        console.log('\n5️⃣ Bloquear usuario...');
        const blockResponse = await makeRequest('PUT', `/users/${testUserId}/block`, {
            activo: false
        }, adminToken);

        if (blockResponse.status === 200 && blockResponse.data.success) {
            console.log('✅ Usuario bloqueado exitosamente');
            console.log(`   Usuario: ${blockResponse.data.data.nombre}`);
            console.log(`   Estado activo: ${blockResponse.data.data.activo}`);
        } else {
            console.log('❌ Error al bloquear usuario:', blockResponse.data);
        }

        // 6. Desbloquear usuario
        console.log('\n6️⃣ Desbloquear usuario...');
        const unblockResponse = await makeRequest('PUT', `/users/${testUserId}/block`, {
            activo: true
        }, adminToken);

        if (unblockResponse.status === 200 && unblockResponse.data.success) {
            console.log('✅ Usuario desbloqueado exitosamente');
            console.log(`   Usuario: ${unblockResponse.data.data.nombre}`);
            console.log(`   Estado activo: ${unblockResponse.data.data.activo}`);
        } else {
            console.log('❌ Error al desbloquear usuario:', unblockResponse.data);
        }

        // 7. Cambiar rol a admin
        console.log('\n7️⃣ Cambiar rol a admin...');
        const changeRoleAdminResponse = await makeRequest('PUT', `/users/${testUserId}/role`, {
            rol: 'admin'
        }, adminToken);

        if (changeRoleAdminResponse.status === 200 && changeRoleAdminResponse.data.success) {
            console.log('✅ Rol cambiado a admin exitosamente');
            console.log(`   Usuario: ${changeRoleAdminResponse.data.data.nombre}`);
            console.log(`   Nuevo rol: ${changeRoleAdminResponse.data.data.rol}`);
        } else {
            console.log('❌ Error al cambiar rol:', changeRoleAdminResponse.data);
        }

        // 8. Revertir rol a usuario
        console.log('\n8️⃣ Revertir rol a usuario...');
        const changeRoleUserResponse = await makeRequest('PUT', `/users/${testUserId}/role`, {
            rol: 'usuario'
        }, adminToken);

        if (changeRoleUserResponse.status === 200 && changeRoleUserResponse.data.success) {
            console.log('✅ Rol revertido a usuario exitosamente');
            console.log(`   Usuario: ${changeRoleUserResponse.data.data.nombre}`);
            console.log(`   Rol: ${changeRoleUserResponse.data.data.rol}`);
        } else {
            console.log('❌ Error al revertir rol:', changeRoleUserResponse.data);
        }

        // 9. Probar validaciones - ID inválido
        console.log('\n9️⃣ Probar validaciones - ID inválido...');
        const invalidIdResponse = await makeRequest('PUT', '/users/invalid-id/block', {
            activo: false
        }, adminToken);

        if (invalidIdResponse.status === 400) {
            console.log('✅ Validación de ID inválido funcionando correctamente');
            console.log(`   Error: ${invalidIdResponse.data.error}`);
        } else {
            console.log('⚠️ La validación de ID inválido no funcionó como se esperaba');
        }

        // 10. Probar sin token
        console.log('\n🔟 Probar acceso sin token...');
        const noTokenResponse = await makeRequest('GET', '/users');

        if (noTokenResponse.status === 401) {
            console.log('✅ Protección de autenticación funcionando correctamente');
        } else {
            console.log('⚠️ La protección de autenticación no funcionó como se esperaba');
        }

        console.log('\n✅ ¡Todas las pruebas completadas!\n');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error.message);
    }
}

// Ejecutar pruebas
testUserManagement();
