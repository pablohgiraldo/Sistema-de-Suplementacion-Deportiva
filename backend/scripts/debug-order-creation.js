import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function debugOrderCreation() {
    try {
        console.log("🔍 Debugging creación de orden...");

        // 1. Login
        console.log("🔐 Iniciando sesión...");
        const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
            email: 'admin@test.com',
            contraseña: 'Admin123!'
        });

        const token = loginResponse.data.data.tokens.accessToken;
        const userId = loginResponse.data.data.user.id;
        console.log("✅ Login exitoso");
        console.log(`   Usuario ID: ${userId}`);

        // Configurar headers
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Verificar carrito
        console.log("\n🛒 Verificando carrito...");
        const cartResponse = await axios.get(`${API_BASE_URL}/cart`, { headers });
        console.log(`✅ Carrito obtenido: ${cartResponse.data.data.items.length} items`);

        if (cartResponse.data.data.items.length === 0) {
            console.log("📦 Agregando producto al carrito...");
            const productsResponse = await axios.get(`${API_BASE_URL}/products?limit=1`, { headers });
            const product = productsResponse.data.data[0];

            await axios.post(`${API_BASE_URL}/cart/add`, {
                productId: product._id,
                quantity: 1
            }, { headers });
            console.log("✅ Producto agregado al carrito");
        }

        // 3. Verificar inventario
        console.log("\n📊 Verificando inventario...");
        const inventoryResponse = await axios.get(`${API_BASE_URL}/inventory`, { headers });
        console.log(`✅ Inventario obtenido: ${inventoryResponse.data.data.length} registros`);

        if (inventoryResponse.data.data.length > 0) {
            const inventory = inventoryResponse.data.data[0];
            console.log(`   Producto: ${inventory.product.name}`);
            console.log(`   Stock disponible: ${inventory.availableStock}`);
        }

        // 4. Crear orden con datos mínimos
        console.log("\n📋 Creando orden...");
        const orderData = {
            paymentMethod: 'credit_card',
            shippingAddress: {
                street: 'Calle de Prueba 123',
                city: 'Bogotá',
                state: 'Cundinamarca',
                zipCode: '110111',
                country: 'Colombia'
            }
        };

        console.log("Datos de la orden:", JSON.stringify(orderData, null, 2));

        const orderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, { headers });

        if (orderResponse.data.success) {
            console.log("✅ Orden creada exitosamente!");
            console.log(`   Número: ${orderResponse.data.data.orderNumber}`);
            console.log(`   Total: $${orderResponse.data.data.total}`);
        }

    } catch (error) {
        console.error("❌ Error completo:");
        console.error("Status:", error.response?.status);
        console.error("Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Message:", error.message);
    }
}

debugOrderCreation();
