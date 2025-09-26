import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function testOrderCreation() {
    try {
        console.log("🧪 Probando creación de orden...");

        // 1. Login
        console.log("🔐 Iniciando sesión...");
        const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
            email: 'admin@test.com',
            contraseña: 'Admin123!'
        });

        const token = loginResponse.data.data.tokens.accessToken;
        console.log("✅ Login exitoso");

        // Configurar headers
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Obtener productos
        console.log("\n📦 Obteniendo productos...");
        const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=1`, { headers });
        const product = productsResponse.data.data[0];
        console.log(`✅ Producto obtenido: ${product.name}`);

        // 3. Agregar al carrito
        console.log("\n🛒 Agregando al carrito...");
        await axios.post(`${API_BASE_URL}/cart/add`, {
            productId: product._id,
            quantity: 1
        }, { headers });
        console.log("✅ Producto agregado al carrito");

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
            notes: 'Orden de prueba'
        };

        const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, { headers });

        if (orderResponse.data.success) {
            console.log("✅ Orden creada exitosamente!");
            console.log(`   Número: ${orderResponse.data.data.orderNumber}`);
            console.log(`   Total: $${orderResponse.data.data.total}`);
            console.log(`   Estado: ${orderResponse.data.data.statusFormatted}`);
        }

    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
        if (error.response?.data?.details) {
            console.error("Detalles:", error.response.data.details);
        }
    }
}

testOrderCreation();
