import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

async function testSearch() {
    console.log('🔍 Probando búsqueda mejorada con índices de MongoDB...\n');

    try {
        // Test 1: Búsqueda básica de texto
        console.log('1️⃣ Probando búsqueda básica de texto');
        const basicSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=protein`);
        console.log(`✅ Resultados para "protein": ${basicSearch.data.count}`);
        console.log(`📊 Total resultados: ${basicSearch.data.totalCount}`);
        console.log(`🔍 Query aplicada: ${basicSearch.data.search.query}`);
        console.log(`📄 Mostrando: ${basicSearch.data.pagination.showing}`);
        console.log();

        // Test 2: Búsqueda con filtros
        console.log('2️⃣ Probando búsqueda con filtros');
        const filteredSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=whey&category=Protein&brand=SUPERGAINS`);
        console.log(`✅ Resultados para "whey" en categoría Protein, marca SUPERGAINS: ${filteredSearch.data.count}`);
        console.log(`📊 Total resultados: ${filteredSearch.data.totalCount}`);
        console.log(`🔍 Filtros aplicados:`, filteredSearch.data.search);
        console.log();

        // Test 3: Búsqueda por marca
        console.log('3️⃣ Probando búsqueda por marca');
        const brandSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=SUPERGAINS`);
        console.log(`✅ Resultados para marca "SUPERGAINS": ${brandSearch.data.count}`);
        console.log(`📊 Total resultados: ${brandSearch.data.totalCount}`);
        console.log();

        // Test 4: Búsqueda con rango de precios
        console.log('4️⃣ Probando búsqueda con rango de precios');
        const priceSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=protein&price_min=100&price_max=300`);
        console.log(`✅ Resultados para "protein" entre $100-$300: ${priceSearch.data.count}`);
        console.log(`📊 Total resultados: ${priceSearch.data.totalCount}`);
        console.log(`💰 Rango de precios: $${priceSearch.data.search.price_min} - $${priceSearch.data.search.price_max}`);
        console.log();

        // Test 5: Ordenamiento por relevancia (score)
        console.log('5️⃣ Probando ordenamiento por relevancia');
        const relevanceSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=designer&sortBy=score&limit=5`);
        console.log(`✅ Resultados para "designer" ordenados por relevancia: ${relevanceSearch.data.count}`);
        console.log(`📊 Ordenamiento: ${relevanceSearch.data.search.sortBy}`);
        console.log();

        // Test 6: Ordenamiento por precio
        console.log('6️⃣ Probando ordenamiento por precio');
        const priceSortSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=protein&sortBy=price&limit=5`);
        console.log(`✅ Resultados para "protein" ordenados por precio: ${priceSortSearch.data.count}`);
        console.log(`📊 Ordenamiento: ${priceSortSearch.data.search.sortBy}`);
        console.log();

        // Test 7: Búsqueda con paginación
        console.log('7️⃣ Probando búsqueda con paginación');
        const paginatedSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=protein&limit=3&page=1`);
        console.log(`✅ Página 1 de búsqueda "protein": ${paginatedSearch.data.count}`);
        console.log(`📄 Página actual: ${paginatedSearch.data.pagination.currentPage}`);
        console.log(`📄 Total páginas: ${paginatedSearch.data.pagination.totalPages}`);
        console.log(`📄 Mostrando: ${paginatedSearch.data.pagination.showing}`);
        console.log(`➡️ Tiene página siguiente: ${paginatedSearch.data.pagination.hasNextPage}`);
        console.log();

        // Test 8: Búsqueda sin resultados
        console.log('8️⃣ Probando búsqueda sin resultados');
        const noResultsSearch = await axios.get(`${API_BASE_URL}/api/products/search?q=xyz123nonexistent`);
        console.log(`✅ Resultados para búsqueda inexistente: ${noResultsSearch.data.count}`);
        console.log(`📊 Total resultados: ${noResultsSearch.data.totalCount}`);
        console.log();

        // Test 9: Búsqueda por categoría múltiple
        console.log('9️⃣ Probando búsqueda por múltiples categorías');
        const multiCategorySearch = await axios.get(`${API_BASE_URL}/api/products/search?category=Protein,Vitamins&limit=5`);
        console.log(`✅ Resultados para categorías Protein,Vitamins: ${multiCategorySearch.data.count}`);
        console.log(`📊 Total resultados: ${multiCategorySearch.data.totalCount}`);
        console.log(`🏷️ Categorías: ${multiCategorySearch.data.search.category}`);
        console.log();

        // Test 10: Búsqueda vacía (todos los productos)
        console.log('10️⃣ Probando búsqueda vacía (todos los productos)');
        const allProductsSearch = await axios.get(`${API_BASE_URL}/api/products/search?limit=5`);
        console.log(`✅ Todos los productos: ${allProductsSearch.data.count}`);
        console.log(`📊 Total productos: ${allProductsSearch.data.totalCount}`);
        console.log();

        console.log('🎉 Todas las pruebas de búsqueda completadas exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

// Ejecutar las pruebas
testSearch();
