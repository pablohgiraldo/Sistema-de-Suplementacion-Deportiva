const API_BASE = 'http://localhost:4000/api';

// Función para hacer requests con delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para probar rate limiting
async function testRateLimit(endpoint, method = 'GET', data = null, maxRequests = 10) {
    console.log(`\n🧪 Probando rate limiting en ${endpoint}...`);

    const requests = [];

    for (let i = 0; i < maxRequests; i++) {
        const request = fetch(`${API_BASE}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(data && { 'Authorization': 'Bearer test-token' })
            },
            body: data ? JSON.stringify(data) : undefined
        }).then(async (response) => {
            const result = await response.text();
            return {
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                body: result
            };
        }).catch(error => ({
            status: 'ERROR',
            error: error.message
        }));

        requests.push(request);

        // Pequeño delay entre requests
        await delay(100);
    }

    const results = await Promise.all(requests);

    // Analizar resultados
    const statusCounts = {};
    results.forEach(result => {
        const status = result.status;
        statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log(`📊 Resultados para ${endpoint}:`);
    Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} requests`);
    });

    // Verificar si se aplicó rate limiting
    const rateLimited = results.some(result => result.status === 429);
    if (rateLimited) {
        console.log(`✅ Rate limiting funcionando correctamente en ${endpoint}`);
    } else {
        console.log(`⚠️  Rate limiting no detectado en ${endpoint}`);
    }

    return results;
}

// Función principal de prueba
async function runRateLimitTests() {
    console.log('🚀 Iniciando pruebas de rate limiting...\n');

    try {
        // 1. Probar rate limiting en login (muy restrictivo)
        await testRateLimit('/users/login', 'POST', {
            email: 'test@example.com',
            password: 'wrongpassword'
        }, 8);

        // 2. Probar rate limiting en registro (moderadamente restrictivo)
        await testRateLimit('/users/register', 'POST', {
            email: 'test@example.com',
            password: 'password123',
            nombre: 'Test User'
        }, 5);

        // 3. Probar rate limiting en productos (permisivo)
        await testRateLimit('/products', 'GET', null, 15);

        // 4. Probar rate limiting en búsqueda de productos
        await testRateLimit('/products/search?q=test', 'GET', null, 15);

        // 5. Probar rate limiting en carrito (con autenticación simulada)
        await testRateLimit('/cart', 'GET', null, 15);

        // 6. Probar rate limiting en wishlist (con autenticación simulada)
        await testRateLimit('/wishlist', 'GET', null, 15);

        console.log('\n✅ Todas las pruebas de rate limiting completadas');

    } catch (error) {
        console.error('❌ Error durante las pruebas:', error);
    }
}

// Ejecutar pruebas
runRateLimitTests();
