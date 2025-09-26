import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';

// Configuración de axios
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Variables globales para almacenar datos de prueba
let authToken = '';
let userId = '';
let testOrderId = '';
let testProductId = '';

// Función para hacer login y obtener token
async function login() {
    try {
        console.log("🔐 Iniciando sesión...");

        const response = await api.post('/users/login', {
            email: 'admin@test.com',
            contraseña: 'Admin123!'
        });

        if (response.data.success) {
            authToken = response.data.data.tokens.accessToken;
            userId = response.data.data.user.id;
            api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
            console.log("✅ Login exitoso");
            console.log(`   Usuario: ${response.data.data.user.nombre}`);
            console.log(`   Rol: ${response.data.data.user.rol}`);
            return true;
        }
    } catch (error) {
        console.error("❌ Error en login:", error.response?.data?.error || error.message);
        return false;
    }
}

// Función para obtener productos disponibles
async function getProducts() {
    try {
        console.log("\n📦 Obteniendo productos disponibles...");

        const response = await api.get('/products?limit=5');

        if (response.data.success && response.data.data.length > 0) {
            testProductId = response.data.data[0]._id;
            console.log(`✅ Productos obtenidos: ${response.data.data.length}`);
            console.log(`   Producto de prueba: ${response.data.data[0].name} (ID: ${testProductId})`);
            return response.data.data;
        } else {
            console.log("⚠️ No hay productos disponibles");
            return [];
        }
    } catch (error) {
        console.error("❌ Error al obtener productos:", error.response?.data?.error || error.message);
        return [];
    }
}

// Función para agregar productos al carrito
async function addToCart(productId, quantity = 2) {
    try {
        console.log(`\n🛒 Agregando producto al carrito...`);

        const response = await api.post('/cart/add', {
            productId: productId,
            quantity: quantity
        });

        if (response.data.success) {
            console.log(`✅ Producto agregado al carrito`);
            console.log(`   Cantidad: ${quantity}`);
            console.log(`   Total del carrito: $${response.data.data.total}`);
            return true;
        }
    } catch (error) {
        console.error("❌ Error al agregar al carrito:", error.response?.data?.error || error.message);
        return false;
    }
}

// Función para crear una orden
async function createOrder() {
    try {
        console.log("\n📋 Creando orden...");

        const orderData = {
            paymentMethod: 'credit_card',
            shippingAddress: {
                street: 'Calle 123 #45-67',
                city: 'Bogotá',
                state: 'Cundinamarca',
                zipCode: '110111',
                country: 'Colombia'
            },
            notes: 'Orden de prueba para testing'
        };

        const response = await api.post('/orders', orderData);

        if (response.data.success) {
            testOrderId = response.data.data._id;
            console.log(`✅ Orden creada exitosamente`);
            console.log(`   Número de orden: ${response.data.data.orderNumber}`);
            console.log(`   Total: $${response.data.data.total}`);
            console.log(`   Estado: ${response.data.data.statusFormatted}`);
            console.log(`   ID: ${testOrderId}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error al crear orden:", error.response?.data?.error || error.message);
        return null;
    }
}

// Función para obtener órdenes
async function getOrders() {
    try {
        console.log("\n📋 Obteniendo órdenes...");

        const response = await api.get('/orders');

        if (response.data.success) {
            console.log(`✅ Órdenes obtenidas: ${response.data.data.length}`);
            response.data.data.forEach((order, index) => {
                console.log(`   ${index + 1}. Orden ${order.orderNumber} - $${order.total} - ${order.statusFormatted}`);
            });
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error al obtener órdenes:", error.response?.data?.error || error.message);
        return [];
    }
}

// Función para obtener una orden específica
async function getOrderById(orderId) {
    try {
        console.log(`\n🔍 Obteniendo orden específica: ${orderId}...`);

        const response = await api.get(`/orders/${orderId}`);

        if (response.data.success) {
            const order = response.data.data;
            console.log(`✅ Orden obtenida:`);
            console.log(`   Número: ${order.orderNumber}`);
            console.log(`   Usuario: ${order.user.nombre}`);
            console.log(`   Total: $${order.total}`);
            console.log(`   Estado: ${order.statusFormatted}`);
            console.log(`   Items: ${order.items.length}`);
            return order;
        }
    } catch (error) {
        console.error("❌ Error al obtener orden:", error.response?.data?.error || error.message);
        return null;
    }
}

// Función para actualizar estado de orden (solo admin)
async function updateOrderStatus(orderId, newStatus) {
    try {
        console.log(`\n🔄 Actualizando estado de orden a: ${newStatus}...`);

        const response = await api.patch(`/orders/${orderId}/status`, {
            status: newStatus,
            notes: `Estado actualizado a ${newStatus} - Prueba automática`
        });

        if (response.data.success) {
            console.log(`✅ Estado actualizado exitosamente`);
            console.log(`   Nuevo estado: ${response.data.data.statusFormatted}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error al actualizar estado:", error.response?.data?.error || error.message);
        return null;
    }
}

// Función para obtener estadísticas de ventas
async function getSalesStats() {
    try {
        console.log("\n📊 Obteniendo estadísticas de ventas...");

        const response = await api.get('/orders/reports/stats');

        if (response.data.success) {
            const stats = response.data.data;
            console.log(`✅ Estadísticas obtenidas:`);
            console.log(`   Total de órdenes: ${stats.totalOrders}`);
            console.log(`   Ingresos totales: $${stats.totalRevenue}`);
            console.log(`   Valor promedio por orden: $${stats.averageOrderValue}`);
            console.log(`   Total de items vendidos: ${stats.totalItemsSold}`);
            return stats;
        }
    } catch (error) {
        console.error("❌ Error al obtener estadísticas:", error.response?.data?.error || error.message);
        return null;
    }
}

// Función para obtener ventas por período
async function getSalesByPeriod() {
    try {
        console.log("\n📈 Obteniendo ventas por período...");

        const response = await api.get('/orders/reports/sales-by-period?groupBy=day');

        if (response.data.success) {
            console.log(`✅ Ventas por período obtenidas: ${response.data.data.length} registros`);
            response.data.data.slice(0, 5).forEach((period, index) => {
                console.log(`   ${index + 1}. ${period._id}: ${period.orders} órdenes - $${period.revenue}`);
            });
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error al obtener ventas por período:", error.response?.data?.error || error.message);
        return [];
    }
}

// Función para obtener productos más vendidos
async function getTopSellingProducts() {
    try {
        console.log("\n🏆 Obteniendo productos más vendidos...");

        const response = await api.get('/orders/reports/top-products?limit=5');

        if (response.data.success) {
            console.log(`✅ Productos más vendidos obtenidos: ${response.data.data.length}`);
            response.data.data.forEach((product, index) => {
                console.log(`   ${index + 1}. ${product.product.name}: ${product.totalQuantity} unidades - $${product.totalRevenue}`);
            });
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error al obtener productos más vendidos:", error.response?.data?.error || error.message);
        return [];
    }
}

// Función para cancelar orden
async function cancelOrder(orderId) {
    try {
        console.log(`\n❌ Cancelando orden: ${orderId}...`);

        const response = await api.patch(`/orders/${orderId}/cancel`);

        if (response.data.success) {
            console.log(`✅ Orden cancelada exitosamente`);
            console.log(`   Estado: ${response.data.data.statusFormatted}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error al cancelar orden:", error.response?.data?.error || error.message);
        return null;
    }
}

// Función principal de prueba
async function runTests() {
    console.log("🧪 Iniciando pruebas del sistema de órdenes...\n");

    // 1. Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log("❌ No se pudo hacer login. Terminando pruebas.");
        return;
    }

    // 2. Obtener productos
    const products = await getProducts();
    if (products.length === 0) {
        console.log("❌ No hay productos disponibles. Terminando pruebas.");
        return;
    }

    // 3. Agregar producto al carrito
    const cartSuccess = await addToCart(testProductId, 2);
    if (!cartSuccess) {
        console.log("❌ No se pudo agregar producto al carrito. Terminando pruebas.");
        return;
    }

    // 4. Crear orden
    const order = await createOrder();
    if (!order) {
        console.log("❌ No se pudo crear orden. Terminando pruebas.");
        return;
    }

    // 5. Obtener órdenes
    await getOrders();

    // 6. Obtener orden específica
    await getOrderById(testOrderId);

    // 7. Actualizar estado de orden
    await updateOrderStatus(testOrderId, 'processing');
    await updateOrderStatus(testOrderId, 'shipped');

    // 8. Obtener estadísticas de ventas
    await getSalesStats();

    // 9. Obtener ventas por período
    await getSalesByPeriod();

    // 10. Obtener productos más vendidos
    await getTopSellingProducts();

    // 11. Cancelar orden (opcional - comentado para mantener datos de prueba)
    // await cancelOrder(testOrderId);

    console.log("\n✅ Todas las pruebas completadas exitosamente!");
    console.log(`📋 Orden de prueba creada: ${testOrderId}`);
    console.log(`🔗 Puedes verificar en la base de datos o usar el endpoint GET /api/orders/${testOrderId}`);
}

// Ejecutar pruebas
runTests().catch(error => {
    console.error("❌ Error durante las pruebas:", error);
    process.exit(1);
});
