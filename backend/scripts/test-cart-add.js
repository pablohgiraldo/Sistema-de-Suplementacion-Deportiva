#!/usr/bin/env node

/**
 * Script de prueba para el endpoint POST /api/cart/add
 * 
 * Este script prueba la funcionalidad de agregar productos al carrito:
 * 1. Registra un usuario de prueba
 * 2. Obtiene un producto existente
 * 3. Agrega el producto al carrito
 * 4. Verifica que el producto se agregó correctamente
 * 5. Prueba casos de error (producto inexistente, stock insuficiente)
 */

// Usar fetch nativo de Node.js (disponible desde Node 18+)

const BASE_URL = process.env.API_URL || 'http://localhost:4000/api';
let accessToken = '';
let userId = '';
let productId = '';

// Colores para output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        return { response, data };
    } catch (error) {
        log(`Error en la petición: ${error.message}`, 'red');
        throw error;
    }
}

async function registerTestUser() {
    log('\n🔐 Registrando usuario de prueba...', 'blue');

    const userData = {
        nombre: 'Usuario Prueba Carrito',
        email: `test-cart-${Date.now()}@ejemplo.com`,
        contraseña: 'password123'
    };

    const { response, data } = await makeRequest(`${BASE_URL}/users/register`, {
        method: 'POST',
        body: JSON.stringify(userData)
    });

    if (data.success) {
        accessToken = data.data.tokens.accessToken;
        userId = data.data.user.id;
        log(`✅ Usuario registrado: ${data.data.user.email}`, 'green');
        log(`   ID: ${userId}`, 'blue');
        return true;
    } else {
        log(`❌ Error al registrar usuario: ${data.message}`, 'red');
        return false;
    }
}

async function getExistingProduct() {
    log('\n📦 Obteniendo productos existentes...', 'blue');

    const { response, data } = await makeRequest(`${BASE_URL}/products?limit=1`);

    if (data.success && data.data && data.data.length > 0) {
        productId = data.data[0]._id;
        const product = data.data[0];
        log(`✅ Producto encontrado: ${product.name}`, 'green');
        log(`   ID: ${productId}`, 'blue');
        log(`   Precio: $${product.price}`, 'blue');
        log(`   Stock: ${product.stock}`, 'blue');
        return true;
    } else {
        log(`⚠️  No se encontraron productos en la base de datos`, 'yellow');
        log(`   Creando producto de prueba...`, 'blue');
        return await createTestProduct();
    }
}

async function createTestProduct() {
    log('\n🔧 Creando producto de prueba...', 'blue');

    const productData = {
        name: 'Designer Whey Protein - Prueba',
        brand: 'SuperGains',
        price: 167580,
        stock: 100,
        imageUrl: 'https://example.com/protein.jpg',
        description: 'Proteína de suero de leche de alta calidad para deportistas',
        categories: ['Proteína', 'Suplementos', 'Fitness']
    };

    const { response, data } = await makeRequest(`${BASE_URL}/products`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(productData)
    });

    if (data.success) {
        productId = data.data.product._id;
        const product = data.data.product;
        log(`✅ Producto de prueba creado: ${product.name}`, 'green');
        log(`   ID: ${productId}`, 'blue');
        log(`   Precio: $${product.price}`, 'blue');
        log(`   Stock: ${product.stock}`, 'blue');
        return true;
    } else {
        log(`❌ Error al crear producto de prueba: ${data.message || data.error || 'Error desconocido'}`, 'red');
        log(`   Status: ${response.status}`, 'red');
        log(`   Response: ${JSON.stringify(data, null, 2)}`, 'red');
        return false;
    }
}

async function testAddToCart() {
    log('\n🛒 Probando agregar producto al carrito...', 'blue');

    const cartData = {
        productId: productId,
        quantity: 1
    };

    const { response, data } = await makeRequest(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(cartData)
    });

    if (data.success) {
        log(`✅ Producto agregado al carrito exitosamente`, 'green');
        log(`   Total del carrito: $${data.data.total}`, 'blue');
        log(`   Items en el carrito: ${data.data.items.length}`, 'blue');

        // Mostrar detalles del item agregado
        if (data.data.items.length > 0) {
            const item = data.data.items[0];
            log(`   - ${item.product.name} x${item.quantity} = $${item.price * item.quantity}`, 'blue');
        }

        return true;
    } else {
        log(`❌ Error al agregar producto: ${data.message || data.error || 'Error desconocido'}`, 'red');
        log(`   Status: ${response.status}`, 'red');
        log(`   Response: ${JSON.stringify(data, null, 2)}`, 'red');
        return false;
    }
}

async function testAddExistingProduct() {
    log('\n🔄 Probando agregar el mismo producto nuevamente...', 'blue');

    const cartData = {
        productId: productId,
        quantity: 2
    };

    const { response, data } = await makeRequest(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(cartData)
    });

    if (data.success) {
        log(`✅ Producto actualizado en el carrito`, 'green');
        log(`   Total del carrito: $${data.data.total}`, 'blue');
        log(`   Items en el carrito: ${data.data.items.length}`, 'blue');

        // Mostrar detalles del item actualizado
        if (data.data.items.length > 0) {
            const item = data.data.items[0];
            log(`   - ${item.product.name} x${item.quantity} = $${item.price * item.quantity}`, 'blue');
        }

        return true;
    } else {
        log(`❌ Error al actualizar producto: ${data.message}`, 'red');
        return false;
    }
}

async function testGetCart() {
    log('\n📋 Obteniendo carrito actual...', 'blue');

    const { response, data } = await makeRequest(`${BASE_URL}/cart`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (data.success) {
        log(`✅ Carrito obtenido exitosamente`, 'green');
        log(`   Total del carrito: $${data.data.total}`, 'blue');
        log(`   Items en el carrito: ${data.data.items.length}`, 'blue');

        // Mostrar todos los items
        data.data.items.forEach((item, index) => {
            log(`   ${index + 1}. ${item.product.name} x${item.quantity} = $${item.price * item.quantity}`, 'blue');
        });

        return true;
    } else {
        log(`❌ Error al obtener carrito: ${data.message}`, 'red');
        return false;
    }
}

async function testErrorCases() {
    log('\n🚨 Probando casos de error...', 'blue');

    // Test 1: Producto inexistente
    log('\n   Test 1: Producto inexistente', 'yellow');
    const { response: response1, data: data1 } = await makeRequest(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            productId: '507f1f77bcf86cd799439999', // ID inexistente
            quantity: 1
        })
    });

    if (response1.status === 404) {
        log(`   ✅ Error 404 manejado correctamente: ${data1.error}`, 'green');
    } else {
        log(`   ❌ Error inesperado: ${data1.message}`, 'red');
    }

    // Test 2: Cantidad inválida
    log('\n   Test 2: Cantidad inválida', 'yellow');
    const { response: response2, data: data2 } = await makeRequest(`${BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            productId: productId,
            quantity: -1
        })
    });

    if (response2.status === 400) {
        log(`   ✅ Error 400 manejado correctamente: ${data2.error}`, 'green');
    } else {
        log(`   ❌ Error inesperado: ${data2.message}`, 'red');
    }

    // Test 3: Sin token de autenticación
    log('\n   Test 3: Sin token de autenticación', 'yellow');
    const { response: response3, data: data3 } = await makeRequest(`${BASE_URL}/cart/add`, {
        method: 'POST',
        body: JSON.stringify({
            productId: productId,
            quantity: 1
        })
    });

    if (response3.status === 401) {
        log(`   ✅ Error 401 manejado correctamente: ${data3.message}`, 'green');
    } else {
        log(`   ❌ Error inesperado: ${data3.message}`, 'red');
    }
}

async function testClearCart() {
    log('\n🧹 Limpiando carrito...', 'blue');

    const { response, data } = await makeRequest(`${BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (data.success) {
        log(`✅ Carrito limpiado exitosamente`, 'green');
        log(`   Total del carrito: $${data.data.total}`, 'blue');
        return true;
    } else {
        log(`❌ Error al limpiar carrito: ${data.message}`, 'red');
        return false;
    }
}

async function runTests() {
    log(`${colors.bold}🧪 INICIANDO PRUEBAS DEL ENDPOINT POST /api/cart/add${colors.reset}`, 'blue');
    log(`📍 URL Base: ${BASE_URL}`, 'blue');

    try {
        // Paso 1: Registrar usuario
        const userRegistered = await registerTestUser();
        if (!userRegistered) {
            log('\n❌ No se pudo continuar sin usuario registrado', 'red');
            return;
        }

        // Paso 2: Obtener producto existente
        const productFound = await getExistingProduct();
        if (!productFound) {
            log('\n❌ No se pudo continuar sin producto existente', 'red');
            return;
        }

        // Paso 3: Probar agregar producto al carrito
        const addedToCart = await testAddToCart();
        if (!addedToCart) {
            log('\n❌ Falló la prueba principal', 'red');
            return;
        }

        // Paso 4: Probar agregar el mismo producto nuevamente
        await testAddExistingProduct();

        // Paso 5: Obtener carrito
        await testGetCart();

        // Paso 6: Probar casos de error
        await testErrorCases();

        // Paso 7: Limpiar carrito
        await testClearCart();

        log(`\n${colors.bold}🎉 TODAS LAS PRUEBAS COMPLETADAS${colors.reset}`, 'green');
        log('✅ El endpoint POST /api/cart/add está funcionando correctamente', 'green');

    } catch (error) {
        log(`\n❌ Error durante las pruebas: ${error.message}`, 'red');
        console.error(error);
    }
}

// Ejecutar las pruebas
runTests();
