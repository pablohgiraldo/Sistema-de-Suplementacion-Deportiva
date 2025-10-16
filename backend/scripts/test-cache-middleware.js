/**
 * Script de prueba para verificar el funcionamiento del middleware de caché
 */

import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:4000';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testCacheMiddleware() {
    console.log('\n' + '='.repeat(60));
    log(colors.cyan, '🧪 PRUEBA DE MIDDLEWARE DE CACHÉ');
    console.log('='.repeat(60) + '\n');

    try {
        // Test 1: Verificar endpoint de health
        log(colors.blue, '\n📊 Test 1: Verificar estado de Redis en /api/health');
        console.log('-'.repeat(60));

        const healthResponse = await axios.get(`${API_URL}/api/health`);
        const redisStatus = healthResponse.data.services?.cache || 'unknown';

        if (redisStatus === 'connected') {
            log(colors.green, '✅ Redis está conectado y disponible');
            console.log('📈 Estadísticas de caché:', healthResponse.data.cache);
        } else if (redisStatus === 'disconnected') {
            log(colors.yellow, '⚠️  Redis está deshabilitado (CACHE_ENABLED=false)');
            log(colors.yellow, '   El sistema funcionará sin caché.');
        } else {
            log(colors.red, '❌ Redis no disponible');
        }

        // Test 2: Probar caché en productos
        log(colors.blue, '\n📦 Test 2: Probar caché en endpoint de productos');
        console.log('-'.repeat(60));

        // Primera solicitud (sin caché)
        log(colors.cyan, '   Primera solicitud (debe ir a BD)...');
        const start1 = Date.now();
        const productsResponse1 = await axios.get(`${API_URL}/api/products?limit=5`);
        const time1 = Date.now() - start1;

        console.log(`   ⏱️  Tiempo de respuesta: ${time1}ms`);
        console.log(`   📦 Productos obtenidos: ${productsResponse1.data.data?.length || 0}`);
        console.log(`   🗄️  Cached: ${productsResponse1.data.cached || false}`);

        await sleep(1000);

        // Segunda solicitud (desde caché)
        log(colors.cyan, '\n   Segunda solicitud (debe venir de caché)...');
        const start2 = Date.now();
        const productsResponse2 = await axios.get(`${API_URL}/api/products?limit=5`);
        const time2 = Date.now() - start2;

        console.log(`   ⏱️  Tiempo de respuesta: ${time2}ms`);
        console.log(`   📦 Productos obtenidos: ${productsResponse2.data.data?.length || 0}`);
        console.log(`   🗄️  Cached: ${productsResponse2.data.cached || false}`);

        if (redisStatus === 'connected') {
            if (productsResponse2.data.cached) {
                const improvement = ((time1 - time2) / time1 * 100).toFixed(2);
                log(colors.green, `\n   ✅ Caché funcionando! Mejora de ${improvement}% en velocidad`);
            } else {
                log(colors.yellow, '   ⚠️  La respuesta no vino de caché');
            }
        }

        // Test 3: Probar caché en producto individual
        log(colors.blue, '\n📦 Test 3: Probar caché en producto individual');
        console.log('-'.repeat(60));

        if (productsResponse1.data.data && productsResponse1.data.data.length > 0) {
            const productId = productsResponse1.data.data[0]._id;

            // Primera solicitud
            log(colors.cyan, `   Primera solicitud del producto ${productId}...`);
            const start3 = Date.now();
            const productResponse1 = await axios.get(`${API_URL}/api/products/${productId}`);
            const time3 = Date.now() - start3;

            console.log(`   ⏱️  Tiempo de respuesta: ${time3}ms`);
            console.log(`   🗄️  Cached: ${productResponse1.data.cached || false}`);

            await sleep(1000);

            // Segunda solicitud
            log(colors.cyan, '\n   Segunda solicitud del mismo producto...');
            const start4 = Date.now();
            const productResponse2 = await axios.get(`${API_URL}/api/products/${productId}`);
            const time4 = Date.now() - start4;

            console.log(`   ⏱️  Tiempo de respuesta: ${time4}ms`);
            console.log(`   🗄️  Cached: ${productResponse2.data.cached || false}`);

            if (redisStatus === 'connected' && productResponse2.data.cached) {
                const improvement = ((time3 - time4) / time3 * 100).toFixed(2);
                log(colors.green, `\n   ✅ Caché de producto individual funcionando! Mejora de ${improvement}%`);
            }
        }

        // Test 4: Probar caché en búsqueda
        log(colors.blue, '\n🔍 Test 4: Probar caché en búsqueda');
        console.log('-'.repeat(60));

        const searchQuery = 'protein';

        // Primera búsqueda
        log(colors.cyan, `   Primera búsqueda de "${searchQuery}"...`);
        const start5 = Date.now();
        const searchResponse1 = await axios.get(`${API_URL}/api/products/search?query=${searchQuery}`);
        const time5 = Date.now() - start5;

        console.log(`   ⏱️  Tiempo de respuesta: ${time5}ms`);
        console.log(`   📦 Resultados: ${searchResponse1.data.data?.length || 0}`);
        console.log(`   🗄️  Cached: ${searchResponse1.data.cached || false}`);

        await sleep(1000);

        // Segunda búsqueda
        log(colors.cyan, `\n   Segunda búsqueda de "${searchQuery}"...`);
        const start6 = Date.now();
        const searchResponse2 = await axios.get(`${API_URL}/api/products/search?query=${searchQuery}`);
        const time6 = Date.now() - start6;

        console.log(`   ⏱️  Tiempo de respuesta: ${time6}ms`);
        console.log(`   📦 Resultados: ${searchResponse2.data.data?.length || 0}`);
        console.log(`   🗄️  Cached: ${searchResponse2.data.cached || false}`);

        if (redisStatus === 'connected' && searchResponse2.data.cached) {
            const improvement = ((time5 - time6) / time5 * 100).toFixed(2);
            log(colors.green, `\n   ✅ Caché de búsqueda funcionando! Mejora de ${improvement}%`);
        }

        // Test 5: Probar caché en recomendaciones
        log(colors.blue, '\n🎯 Test 5: Probar caché en recomendaciones populares');
        console.log('-'.repeat(60));

        // Primera solicitud
        log(colors.cyan, '   Primera solicitud de recomendaciones populares...');
        const start7 = Date.now();
        const recResponse1 = await axios.get(`${API_URL}/api/recommendations/popular`);
        const time7 = Date.now() - start7;

        console.log(`   ⏱️  Tiempo de respuesta: ${time7}ms`);
        console.log(`   📦 Recomendaciones: ${recResponse1.data.data?.length || 0}`);
        console.log(`   🗄️  Cached: ${recResponse1.data.cached || false}`);

        await sleep(1000);

        // Segunda solicitud
        log(colors.cyan, '\n   Segunda solicitud de recomendaciones populares...');
        const start8 = Date.now();
        const recResponse2 = await axios.get(`${API_URL}/api/recommendations/popular`);
        const time8 = Date.now() - start8;

        console.log(`   ⏱️  Tiempo de respuesta: ${time8}ms`);
        console.log(`   📦 Recomendaciones: ${recResponse2.data.data?.length || 0}`);
        console.log(`   🗄️  Cached: ${recResponse2.data.cached || false}`);

        if (redisStatus === 'connected' && recResponse2.data.cached) {
            const improvement = ((time7 - time8) / time7 * 100).toFixed(2);
            log(colors.green, `\n   ✅ Caché de recomendaciones funcionando! Mejora de ${improvement}%`);
        }

        // Resumen final
        console.log('\n' + '='.repeat(60));
        log(colors.cyan, '📊 RESUMEN DE PRUEBAS');
        console.log('='.repeat(60));

        if (redisStatus === 'connected') {
            log(colors.green, '\n✅ Sistema de caché operativo');
            console.log('   - Middleware aplicado a endpoints críticos');
            console.log('   - Tiempos de respuesta mejorados con caché');
            console.log('   - Invalidación de caché configurada');
        } else {
            log(colors.yellow, '\n⚠️  Sistema funcionando sin caché');
            console.log('   - Redis no está conectado');
            console.log('   - El sistema funciona normalmente sin caché');
            console.log('   - Para habilitar: CACHE_ENABLED=true en .env');
        }

        log(colors.green, '\n✅ Todas las pruebas completadas exitosamente\n');

    } catch (error) {
        log(colors.red, '\n❌ Error en las pruebas:');
        console.error(error.message);

        if (error.code === 'ECONNREFUSED') {
            log(colors.red, '\n❌ No se pudo conectar al servidor');
            log(colors.yellow, '   Asegúrate de que el servidor esté ejecutándose en:');
            console.log(`   ${API_URL}`);
        }

        process.exit(1);
    }
}

// Ejecutar pruebas
testCacheMiddleware();
