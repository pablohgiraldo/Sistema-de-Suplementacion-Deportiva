import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || "http://localhost:4000";
const API_URL = `${BASE_URL}/api/cart`;

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token de autenticación (necesitarás obtener uno real)
let authToken = null;

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/api/users/login`, {
      email: "test-cart-1758037475232@supergains.com",
      contraseña: "Password123"
    });
    
    authToken = response.data.data.accessToken;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    console.log("✅ Login exitoso");
    return true;
  } catch (error) {
    console.log("❌ Error en login:", error.response?.data || error.message);
    return false;
  }
}

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

async function testCartStockValidation() {
  console.log("🧪 Iniciando pruebas de validación de stock en carrito...");
  console.log(`📍 URL base: ${API_URL}\n`);

  // Login primero
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log("❌ No se pudo hacer login. Terminando pruebas.");
    return;
  }

  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Obtener carrito vacío
  console.log("📝 Test 1: GET /api/cart (carrito vacío)");
  testResults.total++;
  const result1 = await makeRequest('get', '/');
  if (result1.success) {
    console.log("✅ GET /api/cart - Éxito");
    console.log(`   Items en carrito: ${result1.data.data.items.length}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/cart - Error");
    console.log(`   Error: ${result1.error.message || result1.error}`);
    testResults.failed++;
  }

  // Test 2: Validar carrito vacío
  console.log("\n📝 Test 2: GET /api/cart/validate (carrito vacío)");
  testResults.total++;
  const result2 = await makeRequest('get', '/validate');
  if (result2.success) {
    console.log("✅ GET /api/cart/validate - Éxito");
    console.log(`   Carrito válido: ${result2.data.data.isValid}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/cart/validate - Error");
    console.log(`   Error: ${result2.error.message || result2.error}`);
    testResults.failed++;
  }

  // Test 3: Agregar producto con stock suficiente
  console.log("\n📝 Test 3: POST /api/cart/add (producto con stock)");
  testResults.total++;
  const result3 = await makeRequest('post', '/add', {
    productId: "68c982b4fbb7c8b686067111", // Omega-3 Fish Oil
    quantity: 5
  });
  if (result3.success) {
    console.log("✅ POST /api/cart/add - Éxito");
    console.log(`   Producto agregado: ${result3.data.message}`);
    testResults.passed++;
  } else {
    console.log("❌ POST /api/cart/add - Error");
    console.log(`   Error: ${result3.error.message || result3.error}`);
    testResults.failed++;
  }

  // Test 4: Validar carrito con productos
  console.log("\n📝 Test 4: GET /api/cart/validate (con productos)");
  testResults.total++;
  const result4 = await makeRequest('get', '/validate');
  if (result4.success) {
    console.log("✅ GET /api/cart/validate - Éxito");
    console.log(`   Carrito válido: ${result4.data.data.isValid}`);
    console.log(`   Items válidos: ${result4.data.data.validItems}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/cart/validate - Error");
    console.log(`   Error: ${result4.error.message || result4.error}`);
    testResults.failed++;
  }

  // Test 5: Intentar agregar más stock del disponible
  console.log("\n📝 Test 5: POST /api/cart/add (stock insuficiente)");
  testResults.total++;
  const result5 = await makeRequest('post', '/add', {
    productId: "68c982b4fbb7c8b686067111", // Omega-3 Fish Oil
    quantity: 1000 // Cantidad excesiva
  });
  if (!result5.success && result5.error.message.includes('Stock insuficiente')) {
    console.log("✅ POST /api/cart/add (stock insuficiente) - Validación funciona");
    console.log(`   Error esperado: ${result5.error.message}`);
    testResults.passed++;
  } else {
    console.log("❌ POST /api/cart/add (stock insuficiente) - Error inesperado");
    console.log(`   Resultado: ${result5.success ? 'Éxito inesperado' : result5.error.message}`);
    testResults.failed++;
  }

  // Test 6: Actualizar cantidad a una válida
  console.log("\n📝 Test 6: PUT /api/cart/item/:productId (cantidad válida)");
  testResults.total++;
  const result6 = await makeRequest('put', '/item/68c982b4fbb7c8b686067111', {
    quantity: 10
  });
  if (result6.success) {
    console.log("✅ PUT /api/cart/item/:productId - Éxito");
    console.log(`   Cantidad actualizada: ${result6.data.message}`);
    testResults.passed++;
  } else {
    console.log("❌ PUT /api/cart/item/:productId - Error");
    console.log(`   Error: ${result6.error.message || result6.error}`);
    testResults.failed++;
  }

  // Test 7: Intentar actualizar a cantidad excesiva
  console.log("\n📝 Test 7: PUT /api/cart/item/:productId (cantidad excesiva)");
  testResults.total++;
  const result7 = await makeRequest('put', '/item/68c982b4fbb7c8b686067111', {
    quantity: 1000
  });
  if (!result7.success && result7.error.message.includes('Stock insuficiente')) {
    console.log("✅ PUT /api/cart/item/:productId (cantidad excesiva) - Validación funciona");
    console.log(`   Error esperado: ${result7.error.message}`);
    testResults.passed++;
  } else {
    console.log("❌ PUT /api/cart/item/:productId (cantidad excesiva) - Error inesperado");
    console.log(`   Resultado: ${result7.success ? 'Éxito inesperado' : result7.error.message}`);
    testResults.failed++;
  }

  // Test 8: Sincronizar carrito
  console.log("\n📝 Test 8: POST /api/cart/sync");
  testResults.total++;
  const result8 = await makeRequest('post', '/sync');
  if (result8.success) {
    console.log("✅ POST /api/cart/sync - Éxito");
    console.log(`   Mensaje: ${result8.data.message}`);
    console.log(`   Items válidos: ${result8.data.data.validItemsCount}`);
    testResults.passed++;
  } else {
    console.log("❌ POST /api/cart/sync - Error");
    console.log(`   Error: ${result8.error.message || result8.error}`);
    testResults.failed++;
  }

  // Test 9: Validar carrito después de sincronización
  console.log("\n📝 Test 9: GET /api/cart/validate (después de sync)");
  testResults.total++;
  const result9 = await makeRequest('get', '/validate');
  if (result9.success) {
    console.log("✅ GET /api/cart/validate (después de sync) - Éxito");
    console.log(`   Carrito válido: ${result9.data.data.isValid}`);
    console.log(`   Items válidos: ${result9.data.data.validItems}`);
    testResults.passed++;
  } else {
    console.log("❌ GET /api/cart/validate (después de sync) - Error");
    console.log(`   Error: ${result9.error.message || result9.error}`);
    testResults.failed++;
  }

  // Test 10: Limpiar carrito
  console.log("\n📝 Test 10: DELETE /api/cart/clear");
  testResults.total++;
  const result10 = await makeRequest('delete', '/clear');
  if (result10.success) {
    console.log("✅ DELETE /api/cart/clear - Éxito");
    console.log(`   Mensaje: ${result10.data.message}`);
    testResults.passed++;
  } else {
    console.log("❌ DELETE /api/cart/clear - Error");
    console.log(`   Error: ${result10.error.message || result10.error}`);
    testResults.failed++;
  }

  // Resumen de pruebas
  console.log("\n📊 Resumen de pruebas:");
  console.log(`✅ Exitosas: ${testResults.passed}`);
  console.log(`❌ Fallidas: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Porcentaje de éxito: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.failed === 0) {
    console.log("\n🎉 ¡Todas las pruebas de validación de stock pasaron exitosamente!");
  } else {
    console.log(`\n⚠️ ${testResults.failed} pruebas fallaron. Revisa los errores arriba.`);
  }
}

// Ejecutar pruebas
testCartStockValidation().catch(console.error);
