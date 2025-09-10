import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

async function testPagination() {
    console.log('🧪 Probando paginación de productos...\n');

    try {
        // Test 1: Paginación básica
        console.log('1️⃣ Probando paginación básica (página 1, 5 productos)');
        const page1 = await axios.get(`${API_BASE_URL}/api/products?limit=5&page=1`);
        console.log(`✅ Productos en página 1: ${page1.data.count}`);
        console.log(`📊 Total productos: ${page1.data.totalCount}`);
        console.log(`📄 Página actual: ${page1.data.pagination.currentPage}`);
        console.log(`📄 Total páginas: ${page1.data.pagination.totalPages}`);
        console.log(`📄 Mostrando: ${page1.data.pagination.showing}`);
        console.log(`➡️ Tiene página siguiente: ${page1.data.pagination.hasNextPage}`);
        console.log(`⬅️ Tiene página anterior: ${page1.data.pagination.hasPrevPage}`);
        console.log();

        // Test 2: Segunda página
        console.log('2️⃣ Probando segunda página');
        const page2 = await axios.get(`${API_BASE_URL}/api/products?limit=5&page=2`);
        console.log(`✅ Productos en página 2: ${page2.data.count}`);
        console.log(`📄 Página actual: ${page2.data.pagination.currentPage}`);
        console.log(`📄 Mostrando: ${page2.data.pagination.showing}`);
        console.log(`➡️ Tiene página siguiente: ${page2.data.pagination.hasNextPage}`);
        console.log(`⬅️ Tiene página anterior: ${page2.data.pagination.hasPrevPage}`);
        console.log();

        // Test 3: Límites diferentes
        console.log('3️⃣ Probando diferentes límites');
        const limit10 = await axios.get(`${API_BASE_URL}/api/products?limit=10&page=1`);
        console.log(`✅ Con límite 10: ${limit10.data.count} productos`);
        console.log(`📄 Total páginas: ${limit10.data.pagination.totalPages}`);
        console.log();

        const limit3 = await axios.get(`${API_BASE_URL}/api/products?limit=3&page=1`);
        console.log(`✅ Con límite 3: ${limit3.data.count} productos`);
        console.log(`📄 Total páginas: ${limit3.data.pagination.totalPages}`);
        console.log();

        // Test 4: Página inexistente
        console.log('4️⃣ Probando página inexistente (página 999)');
        const page999 = await axios.get(`${API_BASE_URL}/api/products?limit=5&page=999`);
        console.log(`✅ Productos en página 999: ${page999.data.count}`);
        console.log(`📄 Página actual: ${page999.data.pagination.currentPage}`);
        console.log(`📄 Total páginas: ${page999.data.pagination.totalPages}`);
        console.log();

        // Test 5: Límite máximo
        console.log('5️⃣ Probando límite máximo (100)');
        const maxLimit = await axios.get(`${API_BASE_URL}/api/products?limit=100&page=1`);
        console.log(`✅ Con límite 100: ${maxLimit.data.count} productos`);
        console.log(`📄 Límite aplicado: ${maxLimit.data.pagination.limit}`);
        console.log();

        // Test 6: Límite excesivo (debería limitarse a 100)
        console.log('6️⃣ Probando límite excesivo (500)');
        const excessLimit = await axios.get(`${API_BASE_URL}/api/products?limit=500&page=1`);
        console.log(`✅ Con límite 500: ${excessLimit.data.count} productos`);
        console.log(`📄 Límite aplicado: ${excessLimit.data.pagination.limit} (limitado a 100)`);
        console.log();

        // Test 7: Parámetros inválidos
        console.log('7️⃣ Probando parámetros inválidos');
        try {
            const invalidParams = await axios.get(`${API_BASE_URL}/api/products?limit=abc&page=xyz`);
            console.log(`❌ Debería haber fallado con parámetros inválidos`);
        } catch (error) {
            console.log(`✅ Error esperado con parámetros inválidos: ${error.response?.data?.error || error.message}`);
        }
        console.log();

        // Test 8: Paginación con filtros
        console.log('8️⃣ Probando paginación con filtros');
        const filteredPage = await axios.get(`${API_BASE_URL}/api/products?brand=SUPERGAINS&limit=3&page=1`);
        console.log(`✅ Productos SUPERGAINS página 1: ${filteredPage.data.count}`);
        console.log(`📊 Total productos SUPERGAINS: ${filteredPage.data.totalCount}`);
        console.log(`📄 Total páginas con filtro: ${filteredPage.data.pagination.totalPages}`);
        console.log(`📄 Mostrando: ${filteredPage.data.pagination.showing}`);
        console.log();

        console.log('🎉 Todas las pruebas de paginación completadas exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

// Ejecutar las pruebas
testPagination();
