import axios from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000';

async function testProductFilters() {
    console.log('🧪 Probando filtros de productos...\n');

    try {
        // Test 1: Obtener todos los productos (sin filtros)
        console.log('1️⃣ Probando GET /api/products (sin filtros)');
        const allProducts = await axios.get(`${API_BASE_URL}/api/products`);
        console.log(`✅ Productos encontrados: ${allProducts.data.count}`);
        console.log(`📊 Total en BD: ${allProducts.data.totalCount}`);
        console.log(`📄 Página actual: ${allProducts.data.pagination.currentPage}`);
        console.log(`📄 Total páginas: ${allProducts.data.pagination.totalPages}\n`);

        // Test 2: Filtrar por marca
        console.log('2️⃣ Probando filtro por marca');
        const brandFilter = await axios.get(`${API_BASE_URL}/api/products?brand=SUPERGAINS`);
        console.log(`✅ Productos de marca SUPERGAINS: ${brandFilter.data.count}`);
        console.log(`🔍 Filtros aplicados:`, brandFilter.data.filters);
        console.log(`📦 Primer producto:`, brandFilter.data.data[0]?.name || 'No hay productos\n');

        // Test 3: Filtrar por rango de precios
        console.log('3️⃣ Probando filtro por rango de precios (100-200)');
        const priceFilter = await axios.get(`${API_BASE_URL}/api/products?price_min=100&price_max=200`);
        console.log(`✅ Productos entre $100-$200: ${priceFilter.data.count}`);
        console.log(`🔍 Filtros aplicados:`, priceFilter.data.filters);
        if (priceFilter.data.data.length > 0) {
            console.log(`💰 Precios encontrados:`, priceFilter.data.data.map(p => p.price));
        }
        console.log();

        // Test 4: Filtrar por categoría
        console.log('4️⃣ Probando filtro por categoría');
        const categoryFilter = await axios.get(`${API_BASE_URL}/api/products?category=Protein`);
        console.log(`✅ Productos de categoría Protein: ${categoryFilter.data.count}`);
        console.log(`🔍 Filtros aplicados:`, categoryFilter.data.filters);
        console.log();

        // Test 5: Combinar múltiples filtros
        console.log('5️⃣ Probando filtros combinados (marca + precio)');
        const combinedFilter = await axios.get(`${API_BASE_URL}/api/products?brand=SUPERGAINS&price_min=50&price_max=300`);
        console.log(`✅ Productos SUPERGAINS entre $50-$300: ${combinedFilter.data.count}`);
        console.log(`🔍 Filtros aplicados:`, combinedFilter.data.filters);
        console.log();

        // Test 6: Paginación
        console.log('6️⃣ Probando paginación');
        const paginationTest = await axios.get(`${API_BASE_URL}/api/products?limit=5&page=1`);
        console.log(`✅ Página 1 con 5 productos: ${paginationTest.data.count}`);
        console.log(`📄 Tiene página siguiente: ${paginationTest.data.pagination.hasNextPage}`);
        console.log(`📄 Tiene página anterior: ${paginationTest.data.pagination.hasPrevPage}`);
        console.log();

        // Test 7: Múltiples categorías
        console.log('7️⃣ Probando múltiples categorías');
        const multiCategoryFilter = await axios.get(`${API_BASE_URL}/api/products?category=Protein,Vitamins`);
        console.log(`✅ Productos de categorías Protein o Vitamins: ${multiCategoryFilter.data.count}`);
        console.log(`🔍 Filtros aplicados:`, multiCategoryFilter.data.filters);
        console.log();

        console.log('🎉 Todas las pruebas completadas exitosamente!');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    }
}

// Ejecutar las pruebas
testProductFilters();
