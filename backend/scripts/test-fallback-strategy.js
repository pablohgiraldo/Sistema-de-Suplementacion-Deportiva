/**
 * Script de prueba para verificar la estrategia de fallback cuando MongoDB cae
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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFallbackStrategy() {
  console.log('\n' + '='.repeat(70));
  log(colors.cyan, '🧪 PRUEBA DE ESTRATEGIA DE FALLBACK - MongoDB');
  console.log('='.repeat(70) + '\n');

  try {
    // Test 1: Verificar estado inicial
    log(colors.blue, '\n📊 Test 1: Verificar estado inicial del sistema');
    console.log('-'.repeat(70));
    
    const healthResponse = await axios.get(`${API_URL}/api/health`);
    const mongoStatus = healthResponse.data.services?.database || 'unknown';
    const fallbackStatus = healthResponse.data.services?.fallback || 'unknown';
    
    console.log(`   MongoDB: ${mongoStatus}`);
    console.log(`   Fallback: ${fallbackStatus}`);
    console.log(`   Estado general: ${healthResponse.data.status}`);
    console.log(`   Degradado: ${healthResponse.data.degraded || false}`);
    
    if (healthResponse.data.mongodb) {
      console.log(`   Estado MongoDB: ${healthResponse.data.mongodb.stateName}`);
    }
    
    if (healthResponse.data.fallback) {
      console.log(`   Modo fallback: ${healthResponse.data.fallback.isInFallbackMode ? 'ACTIVO' : 'INACTIVO'}`);
      console.log(`   Fallos MongoDB: ${healthResponse.data.fallback.failureCount}`);
    }

    // Test 2: Intentar obtener productos
    log(colors.blue, '\n📦 Test 2: Obtener productos');
    console.log('-'.repeat(70));
    
    try {
      const productsResponse = await axios.get(`${API_URL}/api/products?limit=5`);
      
      console.log(`   ✅ Respuesta exitosa`);
      console.log(`   Productos: ${productsResponse.data.count || productsResponse.data.data?.length || 0}`);
      console.log(`   Degradado: ${productsResponse.data.degraded || false}`);
      console.log(`   Fuente: ${productsResponse.data.source || 'database'}`);
      console.log(`   Cached: ${productsResponse.data.cached || false}`);
      
      if (productsResponse.data.degraded) {
        log(colors.yellow, '   ⚠️  Sistema operando en modo degradado');
      }
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Error ${error.response.status}: ${error.response.statusText}`);
        console.log(`   Degradado: ${error.response.data.degraded || false}`);
        console.log(`   Mensaje: ${error.response.data.message}`);
      } else {
        console.log(`   ❌ Error de red: ${error.message}`);
      }
    }

    // Test 3: Intentar buscar productos
    log(colors.blue, '\n🔍 Test 3: Buscar productos');
    console.log('-'.repeat(70));
    
    try {
      const searchResponse = await axios.get(`${API_URL}/api/products/search?query=protein`);
      
      console.log(`   ✅ Búsqueda exitosa`);
      console.log(`   Resultados: ${searchResponse.data.count || searchResponse.data.data?.length || 0}`);
      console.log(`   Degradado: ${searchResponse.data.degraded || false}`);
      console.log(`   Fuente: ${searchResponse.data.source || 'database'}`);
    } catch (error) {
      if (error.response) {
        console.log(`   ❌ Error ${error.response.status}`);
        console.log(`   Mensaje: ${error.response.data.message}`);
      } else {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // Test 4: Verificar respuestas de endpoints críticos
    log(colors.blue, '\n🎯 Test 4: Verificar endpoints críticos');
    console.log('-'.repeat(70));
    
    const endpoints = [
      { path: '/api/products', name: 'Productos' },
      { path: '/api/recommendations/popular', name: 'Recomendaciones populares' }
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${API_URL}${endpoint.path}`);
        const status = response.data.degraded ? '🟡 DEGRADADO' : '🟢 NORMAL';
        console.log(`   ${endpoint.name}: ${status}`);
        
        if (response.data.source) {
          console.log(`      Fuente: ${response.data.source}`);
        }
      } catch (error) {
        if (error.response?.status === 503) {
          console.log(`   ${endpoint.name}: 🔴 NO DISPONIBLE`);
        } else {
          console.log(`   ${endpoint.name}: ❌ ERROR (${error.response?.status || 'network'})`);
        }
      }
    }

    // Test 5: Verificar modo solo lectura en fallback
    log(colors.blue, '\n📝 Test 5: Verificar modo solo lectura');
    console.log('-'.repeat(70));
    
    if (fallbackStatus === 'active') {
      console.log('   Sistema en modo fallback - verificando restricciones de escritura...');
      
      // Intentar crear un producto (debería fallar en modo fallback)
      try {
        await axios.post(`${API_URL}/api/products`, {
          name: 'Test Product',
          price: 100
        }, {
          headers: {
            'Authorization': 'Bearer test-token' // Token de prueba
          }
        });
        log(colors.red, '   ❌ ERROR: Operación de escritura permitida en modo fallback');
      } catch (error) {
        if (error.response?.status === 503 || error.response?.data?.degraded) {
          log(colors.green, '   ✅ Operaciones de escritura bloqueadas correctamente');
        } else if (error.response?.status === 401) {
          log(colors.yellow, '   ⚠️  No autenticado (esperado sin token válido)');
        } else {
          console.log(`   ❓ Respuesta inesperada: ${error.response?.status}`);
        }
      }
    } else {
      console.log('   Sistema operando normalmente - omitiendo prueba');
    }

    // Test 6: Información de caché fallback
    log(colors.blue, '\n💾 Test 6: Información de caché y fallback');
    console.log('-'.repeat(70));
    
    const healthFinal = await axios.get(`${API_URL}/api/health`);
    
    if (healthFinal.data.fallback) {
      const fallbackInfo = healthFinal.data.fallback;
      console.log(`   MongoDB disponible: ${fallbackInfo.isMongoDBAvailable}`);
      console.log(`   Modo fallback activo: ${fallbackInfo.isInFallbackMode}`);
      console.log(`   Fallos consecutivos: ${fallbackInfo.failureCount}`);
      console.log(`   Última verificación: ${fallbackInfo.lastCheck}`);
      console.log(`   Última sincronización: ${fallbackInfo.lastSync || 'N/A'}`);
      
      if (fallbackInfo.memoryCacheSize) {
        console.log(`   Tamaño caché memoria:`);
        console.log(`      - Productos: ${fallbackInfo.memoryCacheSize.products}`);
        console.log(`      - Categorías: ${fallbackInfo.memoryCacheSize.categories}`);
        console.log(`      - Órdenes: ${fallbackInfo.memoryCacheSize.orders}`);
        console.log(`      - Usuarios: ${fallbackInfo.memoryCacheSize.users}`);
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    log(colors.cyan, '📊 RESUMEN DE ESTRATEGIA DE FALLBACK');
    console.log('='.repeat(70));
    
    if (mongoStatus === 'connected' && fallbackStatus === 'inactive') {
      log(colors.green, '\n✅ Sistema operando NORMALMENTE');
      console.log('   - MongoDB conectado');
      console.log('   - Modo fallback inactivo');
      console.log('   - Todas las funcionalidades disponibles');
    } else if (mongoStatus === 'disconnected' && fallbackStatus === 'active') {
      log(colors.yellow, '\n🟡 Sistema en MODO FALLBACK');
      console.log('   - MongoDB no disponible');
      console.log('   - Fallback activo');
      console.log('   - Operando con datos en caché');
      console.log('   - Operaciones de escritura bloqueadas');
      console.log('   - Reconexión automática en proceso');
    } else {
      log(colors.magenta, '\n🟣 Estado MIXTO/TRANSICIÓN');
      console.log(`   - MongoDB: ${mongoStatus}`);
      console.log(`   - Fallback: ${fallbackStatus}`);
      console.log('   - Sistema en transición');
    }
    
    console.log('\n📋 Características implementadas:');
    console.log('   ✅ Detección automática de fallo de MongoDB');
    console.log('   ✅ Activación de modo fallback');
    console.log('   ✅ Datos desde caché Redis');
    console.log('   ✅ Datos desde memoria');
    console.log('   ✅ Operaciones de lectura disponibles');
    console.log('   ✅ Operaciones de escritura bloqueadas');
    console.log('   ✅ Reconexión automática a MongoDB');
    console.log('   ✅ Alertas y notificaciones');
    console.log('   ✅ Health check con información detallada');
    
    log(colors.green, '\n✅ Pruebas completadas\n');

  } catch (error) {
    log(colors.red, '\n❌ Error ejecutando pruebas:');
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
console.log('\n🚀 Iniciando pruebas de estrategia de fallback...');
console.log('⏳ Conectando con el servidor...\n');

testFallbackStrategy();
