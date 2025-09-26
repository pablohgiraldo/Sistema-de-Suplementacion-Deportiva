import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

async function testCompleteFlow() {
    try {
        console.log("🧪 Probando flujo completo de órdenes...");

        // Configurar axios con timeout más largo
        const api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 1. Login
        console.log("\n1️⃣ Login...");
        const loginResponse = await api.post('/users/login', {
            email: 'admin@test.com',
            contraseña: 'Admin123!'
        });

        const token = loginResponse.data.data.tokens.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        console.log("✅ Login exitoso");

        // 2. Obtener productos
        console.log("\n2️⃣ Obteniendo productos...");
        const productsResponse = await api.get('/products?limit=1');
        const product = productsResponse.data.data[0];
        console.log(`✅ Producto: ${product.name} - $${product.price}`);

        // 3. Limpiar carrito
        console.log("\n3️⃣ Limpiando carrito...");
        try {
            await api.delete('/cart');
            console.log("✅ Carrito limpiado");
        } catch (error) {
            console.log("ℹ️ Carrito ya estaba vacío");
        }

        // 4. Agregar producto al carrito
        console.log("\n4️⃣ Agregando producto al carrito...");
        const cartResponse = await api.post('/cart/add', {
            productId: product._id,
            quantity: 1
        });
        console.log(`✅ Producto agregado - Total: $${cartResponse.data.data.total}`);

        // 5. Verificar carrito
        console.log("\n5️⃣ Verificando carrito...");
        const cartCheckResponse = await api.get('/cart');
        console.log(`✅ Carrito verificado: ${cartCheckResponse.data.data.items.length} items`);

        // 6. Crear orden
        console.log("\n6️⃣ Creando orden...");
        const orderData = {
            paymentMethod: 'credit_card',
            shippingAddress: {
                street: 'Calle de Prueba 123',
                city: 'Bogotá',
                state: 'Cundinamarca',
                zipCode: '110111',
                country: 'Colombia'
            },
            notes: 'Orden de prueba completa'
        };

        const orderResponse = await api.post('/orders', orderData);

        if (orderResponse.data.success) {
            console.log("✅ Orden creada exitosamente!");
            console.log(`   Número: ${orderResponse.data.data.orderNumber}`);
            console.log(`   Total: $${orderResponse.data.data.total}`);
            console.log(`   Estado: ${orderResponse.data.data.statusFormatted}`);
            console.log(`   Items: ${orderResponse.data.data.items.length}`);

            // 7. Obtener órdenes
            console.log("\n7️⃣ Obteniendo órdenes...");
            const ordersResponse = await api.get('/orders');
            console.log(`✅ Órdenes obtenidas: ${ordersResponse.data.data.length}`);

            // 8. Obtener estadísticas
            console.log("\n8️⃣ Obteniendo estadísticas...");
            const statsResponse = await api.get('/orders/reports/stats');
            const stats = statsResponse.data.data;
            console.log(`✅ Estadísticas:`);
            console.log(`   Total órdenes: ${stats.totalOrders}`);
            console.log(`   Ingresos: $${stats.totalRevenue}`);
            console.log(`   Valor promedio: $${stats.averageOrderValue}`);

            console.log("\n🎉 ¡Todas las pruebas completadas exitosamente!");

        } else {
            console.error("❌ Error al crear orden:", orderResponse.data);
        }

    } catch (error) {
        console.error("❌ Error en el flujo:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Message:", error.message);
        }
    }
}

testCompleteFlow();
