import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

async function testValidations() {
    console.log('🔍 Probando validaciones de entrada con express-validator...\n');

    try {
        // Test 1: Validación de productos - datos válidos
        console.log('1️⃣ Probando creación de producto con datos válidos');
        try {
            const validProduct = await axios.post(`${API_BASE_URL}/api/products`, {
                name: "Producto de Prueba",
                brand: "Marca Test",
                price: 99.99,
                stock: 50,
                description: "Descripción del producto",
                categories: ["Test", "Validación"]
            });
            console.log(`✅ Producto creado exitosamente: ${validProduct.data.data.name}`);
        } catch (error) {
            console.log(`❌ Error inesperado: ${error.response?.data?.error || error.message}`);
        }
        console.log();

        // Test 2: Validación de productos - datos inválidos
        console.log('2️⃣ Probando creación de producto con datos inválidos');
        try {
            const invalidProduct = await axios.post(`${API_BASE_URL}/api/products`, {
                name: "", // Nombre vacío
                brand: "A".repeat(100), // Marca muy larga
                price: -10, // Precio negativo
                stock: "abc", // Stock no numérico
                description: "A".repeat(600), // Descripción muy larga
                categories: Array(15).fill("Categoría") // Demasiadas categorías
            });
            console.log(`❌ Debería haber fallado con datos inválidos`);
        } catch (error) {
            console.log(`✅ Error esperado con datos inválidos:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        // Test 3: Validación de filtros de productos - parámetros inválidos
        console.log('3️⃣ Probando filtros de productos con parámetros inválidos');
        try {
            const invalidFilters = await axios.get(`${API_BASE_URL}/api/products?limit=abc&page=xyz&price_min=invalid`);
            console.log(`❌ Debería haber fallado con parámetros inválidos`);
        } catch (error) {
            console.log(`✅ Error esperado con parámetros inválidos:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        // Test 4: Validación de búsqueda - parámetros inválidos
        console.log('4️⃣ Probando búsqueda con parámetros inválidos');
        try {
            const invalidSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=${'A'.repeat(200)}&sortBy=invalid&limit=500`);
            console.log(`❌ Debería haber fallado con parámetros inválidos`);
        } catch (error) {
            console.log(`✅ Error esperado con parámetros inválidos:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        // Test 5: Validación de registro de usuario - datos válidos
        console.log('5️⃣ Probando registro de usuario con datos válidos');
        try {
            const validUser = await axios.post(`${API_BASE_URL}/api/users/register`, {
                nombre: "Usuario Test",
                email: "test@ejemplo.com",
                contraseña: "Password123",
                rol: "usuario"
            });
            console.log(`✅ Usuario registrado exitosamente: ${validUser.data.data.user.email}`);
        } catch (error) {
            console.log(`❌ Error inesperado: ${error.response?.data?.error || error.message}`);
        }
        console.log();

        // Test 6: Validación de registro de usuario - datos inválidos
        console.log('6️⃣ Probando registro de usuario con datos inválidos');
        try {
            const invalidUser = await axios.post(`${API_BASE_URL}/api/users/register`, {
                nombre: "", // Nombre vacío
                email: "email-invalido", // Email inválido
                contraseña: "123", // Contraseña muy corta y sin mayúsculas
                rol: "rol-invalido" // Rol inválido
            });
            console.log(`❌ Debería haber fallado con datos inválidos`);
        } catch (error) {
            console.log(`✅ Error esperado con datos inválidos:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        // Test 7: Validación de login - datos inválidos
        console.log('7️⃣ Probando login con datos inválidos');
        try {
            const invalidLogin = await axios.post(`${API_BASE_URL}/api/users/login`, {
                email: "email-invalido",
                contraseña: ""
            });
            console.log(`❌ Debería haber fallado con datos inválidos`);
        } catch (error) {
            console.log(`✅ Error esperado con datos inválidos:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        // Test 8: Validación de ID de producto inválido
        console.log('8️⃣ Probando obtener producto con ID inválido');
        try {
            const invalidId = await axios.get(`${API_BASE_URL}/api/products/invalid-id`);
            console.log(`❌ Debería haber fallado con ID inválido`);
        } catch (error) {
            console.log(`✅ Error esperado con ID inválido:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        // Test 9: Validación de rango de precios inválido
        console.log('9️⃣ Probando filtros con rango de precios inválido');
        try {
            const invalidPriceRange = await axios.get(`${API_BASE_URL}/api/products?price_min=200&price_max=100`);
            console.log(`❌ Debería haber fallado con rango de precios inválido`);
        } catch (error) {
            console.log(`✅ Error esperado con rango de precios inválido:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        // Test 10: Validación de refresh token inválido
        console.log('10️⃣ Probando refresh token con token inválido');
        try {
            const invalidRefresh = await axios.post(`${API_BASE_URL}/api/users/refresh`, {
                refreshToken: "token-invalido"
            });
            console.log(`❌ Debería haber fallado con token inválido`);
        } catch (error) {
            console.log(`✅ Error esperado con token inválido:`);
            console.log(`   Error: ${error.response?.data?.error}`);
            console.log(`   Detalles:`, error.response?.data?.details?.map(d => `${d.field}: ${d.message}`).join(', '));
        }
        console.log();

        console.log('🎉 Todas las pruebas de validación completadas exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

// Ejecutar las pruebas
testValidations();
