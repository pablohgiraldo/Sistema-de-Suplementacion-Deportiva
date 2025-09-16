import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/inventory`;

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Función para hacer peticiones con manejo de errores
async function makeRequest(method, url, data = null) {
  try {
    const response = await api[method](url, data);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
}

async function testInventoryAPI() {
  console.log("🧪 Iniciando pruebas de API de inventario...");
  console.log(`📍 URL base: ${API_URL}\n`);

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Obtener todos los inventarios
  console.log("📝 Test 1: GET /api/inventory");
  testResults.total++;
  const result1 = await makeRequest('get', '/');
  if (result1.success) {
    console.log("✅ GET /api/inventory - Éxito");
    console.log(`   Total registros: ${result1.data.totalCount}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/inventory - Error");
    console.log(`   Error: ${result1.error.message || result1.error}`);
    testResults.failed++;
  }

  // Test 2: Obtener estadísticas de inventario
  console.log("\n📝 Test 2: GET /api/inventory/stats");
  testResults.total++;
  const result2 = await makeRequest('get', '/stats');
  if (result2.success) {
    console.log("✅ GET /api/inventory/stats - Éxito");
    console.log(`   Productos totales: ${result2.data.data.general.totalProducts}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/inventory/stats - Error");
    console.log(`   Error: ${result2.error.message || result2.error}`);
    testResults.failed++;
  }

  // Test 3: Obtener productos con stock bajo
  console.log("\n📝 Test 3: GET /api/inventory/low-stock");
  testResults.total++;
  const result3 = await makeRequest('get', '/low-stock');
  if (result3.success) {
    console.log("✅ GET /api/inventory/low-stock - Éxito");
    console.log(`   Productos con stock bajo: ${result3.data.count}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/inventory/low-stock - Error");
    console.log(`   Error: ${result3.error.message || result3.error}`);
    testResults.failed++;
  }

  // Test 4: Obtener productos agotados
  console.log("\n📝 Test 4: GET /api/inventory/out-of-stock");
  testResults.total++;
  const result4 = await makeRequest('get', '/out-of-stock');
  if (result4.success) {
    console.log("✅ GET /api/inventory/out-of-stock - Éxito");
    console.log(`   Productos agotados: ${result4.data.count}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/inventory/out-of-stock - Error");
    console.log(`   Error: ${result4.error.message || result4.error}`);
    testResults.failed++;
  }

  // Test 5: Obtener inventario por ID (si hay registros)
  if (result1.success && result1.data.data.length > 0) {
    const firstInventory = result1.data.data[0];
    console.log(`\n📝 Test 5: GET /api/inventory/${firstInventory._id}`);
    testResults.total++;
    const result5 = await makeRequest('get', `/${firstInventory._id}`);
    if (result5.success) {
      console.log("✅ GET /api/inventory/:id - Éxito");
      console.log(`   Producto: ${result5.data.data.product.name}`);
      testResults.passed++;
    } else {
      console.log("❌ GET /api/inventory/:id - Error");
      console.log(`   Error: ${result5.error.message || result5.error}`);
      testResults.failed++;
    }

    // Test 6: Obtener inventario por ID de producto
    console.log(`\n📝 Test 6: GET /api/inventory/product/${firstInventory.product._id}`);
    testResults.total++;
    const result6 = await makeRequest('get', `/product/${firstInventory.product._id}`);
    if (result6.success) {
      console.log("✅ GET /api/inventory/product/:productId - Éxito");
      console.log(`   Producto: ${result6.data.data.product.name}`);
      testResults.passed++;
    } else {
      console.log("❌ GET /api/inventory/product/:productId - Error");
      console.log(`   Error: ${result6.error.message || result6.error}`);
      testResults.failed++;
    }

    // Test 7: Reabastecer stock
    console.log(`\n📝 Test 7: POST /api/inventory/${firstInventory._id}/restock`);
    testResults.total++;
    const restockData = { quantity: 10, notes: "Reabastecimiento de prueba" };
    const result7 = await makeRequest('post', `/${firstInventory._id}/restock`, restockData);
    if (result7.success) {
      console.log("✅ POST /api/inventory/:id/restock - Éxito");
      console.log(`   Stock actualizado: ${result7.data.data.currentStock}`);
      testResults.passed++;
    } else {
      console.log("❌ POST /api/inventory/:id/restock - Error");
      console.log(`   Error: ${result7.error.message || result7.error}`);
      testResults.failed++;
    }

    // Test 8: Reservar stock
    console.log(`\n📝 Test 8: POST /api/inventory/${firstInventory._id}/reserve`);
    testResults.total++;
    const reserveData = { quantity: 5 };
    const result8 = await makeRequest('post', `/${firstInventory._id}/reserve`, reserveData);
    if (result8.success) {
      console.log("✅ POST /api/inventory/:id/reserve - Éxito");
      console.log(`   Stock reservado: ${result8.data.data.reservedStock}`);
      testResults.passed++;
    } else {
      console.log("❌ POST /api/inventory/:id/reserve - Error");
      console.log(`   Error: ${result8.error.message || result8.error}`);
      testResults.failed++;
    }

    // Test 9: Liberar stock
    console.log(`\n📝 Test 9: POST /api/inventory/${firstInventory._id}/release`);
    testResults.total++;
    const releaseData = { quantity: 2 };
    const result9 = await makeRequest('post', `/${firstInventory._id}/release`, releaseData);
    if (result9.success) {
      console.log("✅ POST /api/inventory/:id/release - Éxito");
      console.log(`   Stock reservado: ${result9.data.data.reservedStock}`);
      testResults.passed++;
    } else {
      console.log("❌ POST /api/inventory/:id/release - Error");
      console.log(`   Error: ${result9.error.message || result9.error}`);
      testResults.failed++;
    }

    // Test 10: Vender stock
    console.log(`\n📝 Test 10: POST /api/inventory/${firstInventory._id}/sell`);
    testResults.total++;
    const sellData = { quantity: 3 };
    const result10 = await makeRequest('post', `/${firstInventory._id}/sell`, sellData);
    if (result10.success) {
      console.log("✅ POST /api/inventory/:id/sell - Éxito");
      console.log(`   Stock actual: ${result10.data.data.currentStock}`);
      console.log(`   Total vendido: ${result10.data.data.totalSold}`);
      testResults.passed++;
    } else {
      console.log("❌ POST /api/inventory/:id/sell - Error");
      console.log(`   Error: ${result10.error.message || result10.error}`);
      testResults.failed++;
    }
  }

  // Test 11: Filtros y paginación
  console.log("\n📝 Test 11: GET /api/inventory con filtros");
  testResults.total++;
  const result11 = await makeRequest('get', '/?status=active&limit=3&page=1');
  if (result11.success) {
    console.log("✅ GET /api/inventory con filtros - Éxito");
    console.log(`   Registros devueltos: ${result11.data.count}`);
    console.log(`   Página actual: ${result11.data.pagination.currentPage}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/inventory con filtros - Error");
    console.log(`   Error: ${result11.error.message || result11.error}`);
    testResults.failed++;
  }

  // Resumen de pruebas
  console.log("\n📊 Resumen de pruebas:");
  console.log(`✅ Exitosas: ${testResults.passed}`);
  console.log(`❌ Fallidas: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Porcentaje de éxito: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log("\n🎉 ¡Todas las pruebas pasaron exitosamente!");
  } else {
    console.log(`\n⚠️ ${testResults.failed} pruebas fallaron. Revisa los errores arriba.`);
  }
}

// Ejecutar pruebas
testInventoryAPI().catch(console.error);
