import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function testWithFetch() {
    try {
        console.log("🧪 Probando con fetch...");

        // 1. Login
        console.log("🔐 Iniciando sesión...");
        const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@test.com',
                contraseña: 'Admin123!'
            })
        });

        const loginData = await loginResponse.json();

        if (!loginData.success) {
            console.error("❌ Error en login:", loginData);
            return;
        }

        const token = loginData.data.tokens.accessToken;
        console.log("✅ Login exitoso");

        // 2. Obtener productos
        console.log("\n📦 Obteniendo productos...");
        const productsResponse = await fetch(`${API_BASE_URL}/products?limit=1`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const productsData = await productsResponse.json();
        const product = productsData.data[0];
        console.log(`✅ Producto obtenido: ${product.name}`);

        // 3. Agregar al carrito
        console.log("\n🛒 Agregando al carrito...");
        const cartResponse = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: product._id,
                quantity: 1
            })
        });

        const cartData = await cartResponse.json();
        if (cartData.success) {
            console.log("✅ Producto agregado al carrito");
        } else {
            console.error("❌ Error al agregar al carrito:", cartData);
            return;
        }

        // 4. Crear orden
        console.log("\n📋 Creando orden...");
        const orderData = {
            paymentMethod: 'credit_card',
            shippingAddress: {
                street: 'Calle de Prueba 123',
                city: 'Bogotá',
                state: 'Cundinamarca',
                zipCode: '110111',
                country: 'Colombia'
            },
            notes: 'Orden de prueba con fetch'
        };

        const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const orderResult = await orderResponse.json();

        if (orderResult.success) {
            console.log("✅ Orden creada exitosamente!");
            console.log(`   Número: ${orderResult.data.orderNumber}`);
            console.log(`   Total: $${orderResult.data.total}`);
            console.log(`   Estado: ${orderResult.data.statusFormatted}`);
        } else {
            console.error("❌ Error al crear orden:", orderResult);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testWithFetch();
