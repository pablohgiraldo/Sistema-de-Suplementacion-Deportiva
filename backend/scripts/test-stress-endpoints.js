#!/usr/bin/env node

/**
 * Script simple para probar endpoints de estrés
 * SuperGains - Pruebas básicas de rendimiento
 */

// Usar fetch nativo de Node.js 18+

// Configuración
const CONFIG = {
  baseUrl: 'http://localhost:4000',
  iterations: 10,
  delay: 100 // ms entre requests
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Función para log con colores
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para hacer request y medir tiempo
async function makeRequest(url, name) {
  const startTime = Date.now();
  try {
    const response = await fetch(url);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: response.ok,
      status: response.status,
      responseTime,
      name
    };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: false,
      status: 0,
      responseTime,
      name,
      error: error.message
    };
  }
}

// Función para probar endpoint múltiples veces
async function testEndpoint(url, name, iterations = CONFIG.iterations) {
  log(`\n🧪 Probando: ${name}`, 'cyan');
  log(`   URL: ${url}`, 'blue');
  log(`   Iteraciones: ${iterations}`, 'blue');
  
  const results = [];
  
  for (let i = 0; i < iterations; i++) {
    const result = await makeRequest(url, name);
    results.push(result);
    
    if (result.success) {
      log(`   ✅ ${i + 1}/${iterations}: ${result.responseTime}ms`, 'green');
    } else {
      log(`   ❌ ${i + 1}/${iterations}: ${result.error || 'Error'}`, 'red');
    }
    
    // Delay entre requests
    if (i < iterations - 1) {
      await new Promise(resolve => setTimeout(resolve, CONFIG.delay));
    }
  }
  
  return results;
}

// Función para calcular estadísticas
function calculateStats(results) {
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (successful.length === 0) {
    return {
      successRate: 0,
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      totalRequests: results.length,
      failedRequests: failed.length
    };
  }
  
  const responseTimes = successful.map(r => r.responseTime);
  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  
  return {
    successRate: (successful.length / results.length) * 100,
    avgResponseTime: Math.round(avgResponseTime),
    minResponseTime,
    maxResponseTime,
    totalRequests: results.length,
    failedRequests: failed.length
  };
}

// Función para mostrar estadísticas
function displayStats(name, stats) {
  log(`\n📊 Estadísticas para ${name}:`, 'bright');
  log(`   Tasa de éxito: ${stats.successRate.toFixed(1)}%`, stats.successRate > 95 ? 'green' : 'yellow');
  log(`   Tiempo promedio: ${stats.avgResponseTime}ms`, stats.avgResponseTime < 200 ? 'green' : 'yellow');
  log(`   Tiempo mínimo: ${stats.minResponseTime}ms`, 'blue');
  log(`   Tiempo máximo: ${stats.maxResponseTime}ms`, 'blue');
  log(`   Requests totales: ${stats.totalRequests}`, 'blue');
  log(`   Requests fallidos: ${stats.failedRequests}`, stats.failedRequests > 0 ? 'red' : 'green');
}

// Función principal
async function main() {
  log('🎯 SuperGains - Pruebas Básicas de Estrés', 'bright');
  log('=' .repeat(50), 'cyan');
  
  // Verificar que el servidor esté corriendo
  log('\n🔍 Verificando servidor...', 'blue');
  const healthCheck = await makeRequest(`${CONFIG.baseUrl}/api/health`, 'Health Check');
  
  if (!healthCheck.success) {
    log('❌ Servidor no está corriendo o no responde', 'red');
    log(`   Error: ${healthCheck.error || 'Status ' + healthCheck.status}`, 'red');
    log(`   Asegúrate de que el servidor esté corriendo en ${CONFIG.baseUrl}`, 'yellow');
    process.exit(1);
  }
  
  log('✅ Servidor está corriendo', 'green');
  
  // Endpoints a probar
  const endpoints = [
    { url: '/api/health', name: 'Health Check' },
    { url: '/api/health/database', name: 'Database Health' },
    { url: '/api/health/performance', name: 'Performance Metrics' },
    { url: '/api/products', name: 'Products List' },
    { url: '/api/products/categories', name: 'Product Categories' }
  ];
  
  const allStats = [];
  
  // Probar cada endpoint
  for (const endpoint of endpoints) {
    const results = await testEndpoint(`${CONFIG.baseUrl}${endpoint.url}`, endpoint.name);
    const stats = calculateStats(results);
    displayStats(endpoint.name, stats);
    allStats.push({ name: endpoint.name, stats });
  }
  
  // Resumen general
  log('\n📋 Resumen General:', 'bright');
  log('=' .repeat(50), 'cyan');
  
  allStats.forEach(({ name, stats }) => {
    const status = stats.successRate > 95 && stats.avgResponseTime < 200 ? '✅' : '⚠️';
    log(`${status} ${name}: ${stats.successRate.toFixed(1)}% éxito, ${stats.avgResponseTime}ms promedio`, 
        stats.successRate > 95 && stats.avgResponseTime < 200 ? 'green' : 'yellow');
  });
  
  // Estadísticas globales
  const totalRequests = allStats.reduce((sum, { stats }) => sum + stats.totalRequests, 0);
  const totalFailed = allStats.reduce((sum, { stats }) => sum + stats.failedRequests, 0);
  const globalSuccessRate = ((totalRequests - totalFailed) / totalRequests) * 100;
  const avgResponseTime = allStats.reduce((sum, { stats }) => sum + stats.avgResponseTime, 0) / allStats.length;
  
  log(`\n🌐 Estadísticas Globales:`, 'bright');
  log(`   Requests totales: ${totalRequests}`, 'blue');
  log(`   Tasa de éxito global: ${globalSuccessRate.toFixed(1)}%`, globalSuccessRate > 95 ? 'green' : 'yellow');
  log(`   Tiempo promedio global: ${Math.round(avgResponseTime)}ms`, avgResponseTime < 200 ? 'green' : 'yellow');
  
  log('\n🎉 Pruebas completadas', 'green');
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { main, testEndpoint, calculateStats };
