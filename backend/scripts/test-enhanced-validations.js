const API_BASE = 'http://localhost:4000/api';

// Función para hacer requests
async function makeRequest(endpoint, method = 'GET', data = null) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: data ? JSON.stringify(data) : undefined
        });

        const result = await response.text();
        return {
            status: response.status,
            body: result,
            headers: Object.fromEntries(response.headers.entries())
        };
    } catch (error) {
        return {
            status: 'ERROR',
            error: error.message
        };
    }
}

// Función para probar validaciones
async function testValidations() {
    console.log('🧪 Iniciando pruebas de validaciones extra...\n');

    // 1. Probar validación de email con dominio temporal
    console.log('1. Probando validación de email con dominio temporal...');
    const result1 = await makeRequest('/users/register', 'POST', {
        nombre: 'Test User',
        email: 'test@10minutemail.com',
        contraseña: 'Password123!'
    });
    console.log(`   Status: ${result1.status}`);
    if (result1.status === 400) {
        console.log('   ✅ Validación de email temporal funcionando');
    } else {
        console.log('   ❌ Validación de email temporal falló');
    }

    // 2. Probar validación de contraseña débil
    console.log('\n2. Probando validación de contraseña débil...');
    const result2 = await makeRequest('/users/register', 'POST', {
        nombre: 'Test User',
        email: 'test@example.com',
        contraseña: '123456'
    });
    console.log(`   Status: ${result2.status}`);
    if (result2.status === 400) {
        console.log('   ✅ Validación de contraseña débil funcionando');
    } else {
        console.log('   ❌ Validación de contraseña débil falló');
    }

    // 3. Probar detección de ataques XSS
    console.log('\n3. Probando detección de ataques XSS...');
    const result3 = await makeRequest('/products/search?q=<script>alert("xss")</script>', 'GET');
    console.log(`   Status: ${result3.status}`);
    if (result3.status === 400) {
        console.log('   ✅ Detección de XSS funcionando');
    } else {
        console.log('   ❌ Detección de XSS falló');
    }

    // 4. Probar detección de SQL injection
    console.log('\n4. Probando detección de SQL injection...');
    const result4 = await makeRequest('/products/search?q=test\' OR 1=1--', 'GET');
    console.log(`   Status: ${result4.status}`);
    if (result4.status === 400) {
        console.log('   ✅ Detección de SQL injection funcionando');
    } else {
        console.log('   ❌ Detección de SQL injection falló');
    }

    // 5. Probar validación de Content-Type
    console.log('\n5. Probando validación de Content-Type...');
    const result5 = await makeRequest('/users/login', 'POST', {
        email: 'test@example.com',
        contraseña: 'Password123!'
    });
    console.log(`   Status: ${result5.status}`);
    if (result5.status === 400 || result5.status === 415) {
        console.log('   ✅ Validación de Content-Type funcionando');
    } else {
        console.log('   ❌ Validación de Content-Type falló');
    }

    // 6. Probar validación de User-Agent sospechoso
    console.log('\n6. Probando validación de User-Agent sospechoso...');
    try {
        const response = await fetch(`${API_BASE}/products`, {
            method: 'GET',
            headers: {
                'User-Agent': 'curl/7.68.0'
            }
        });
        console.log(`   Status: ${response.status}`);
        if (response.status === 400) {
            console.log('   ✅ Validación de User-Agent funcionando');
        } else {
            console.log('   ❌ Validación de User-Agent falló');
        }
    } catch (error) {
        console.log('   ❌ Error en validación de User-Agent:', error.message);
    }

    // 7. Probar validación de datos de tarjeta de crédito
    console.log('\n7. Probando validación de tarjeta de crédito...');
    const result7 = await makeRequest('/orders', 'POST', {
        paymentMethod: 'credit_card',
        cardNumber: '4111111111111111',
        expiryDate: '12/25',
        cvv: '123',
        shippingAddress: {
            firstName: 'Test',
            lastName: 'User',
            street: 'Calle 123 #45-67',
            city: 'Bogotá',
            state: 'Cundinamarca',
            zipCode: '110111',
            country: 'Colombia',
            phone: '3001234567'
        }
    });
    console.log(`   Status: ${result7.status}`);
    if (result7.status === 400) {
        console.log('   ✅ Validación de tarjeta de crédito funcionando');
    } else {
        console.log('   ❌ Validación de tarjeta de crédito falló');
    }

    // 8. Probar validación de datos de producto
    console.log('\n8. Probando validación de datos de producto...');
    const result8 = await makeRequest('/products', 'POST', {
        name: '<script>alert("xss")</script>',
        description: 'Producto de prueba',
        price: -100,
        category: 'Proteínas',
        stock: 10
    });
    console.log(`   Status: ${result8.status}`);
    if (result8.status === 400) {
        console.log('   ✅ Validación de datos de producto funcionando');
    } else {
        console.log('   ❌ Validación de datos de producto falló');
    }

    console.log('\n✅ Pruebas de validaciones completadas');
}

// Ejecutar pruebas
testValidations().catch(console.error);
