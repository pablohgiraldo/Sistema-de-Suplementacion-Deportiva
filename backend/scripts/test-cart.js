import "dotenv/config";
import axios from "axios";

const API_BASE_URL = process.env.API_URL || "http://localhost:4000/api";
let authToken = "";
let userId = "";

// Función para hacer login y obtener token
async function login() {
    try {
        console.log("🔐 Iniciando sesión...");
        const response = await axios.post(`${API_BASE_URL}/users/login`, {
            email: "test@supergains.com",
            contraseña: "password123"
        });

        if (response.data.success) {
            authToken = response.data.data.tokens.accessToken;
            userId = response.data.data.user.id;
            console.log("✅ Login exitoso");
            console.log(`👤 Usuario: ${response.data.data.user.nombre}`);
            console.log(`🔑 Token: ${authToken.substring(0, 20)}...`);
            return true;
        }
    } catch (error) {
        console.error("❌ Error en login:", error.response?.data || error.message);
        return false;
    }
}

// Función para obtener productos
async function getProducts() {
    try {
        console.log("\n📦 Obteniendo productos...");
        const response = await axios.get(`${API_BASE_URL}/products`);

        if (response.data.success) {
            console.log(`✅ Productos obtenidos: ${response.data.count}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error obteniendo productos:", error.response?.data || error.message);
        return [];
    }
}

// Función para obtener carrito
async function getCart() {
    try {
        console.log("\n🛒 Obteniendo carrito...");
        const response = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            console.log(`✅ Carrito obtenido - Total: $${response.data.data.total}`);
            console.log(`📦 Items en carrito: ${response.data.data.items.length}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error obteniendo carrito:", error.response?.data || error.message);
        return null;
    }
}

// Función para agregar producto al carrito
async function addToCart(productId, quantity = 1) {
    try {
        console.log(`\n➕ Agregando producto ${productId} al carrito (cantidad: ${quantity})...`);
        const response = await axios.post(`${API_BASE_URL}/cart/add`, {
            productId,
            quantity
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            console.log(`✅ Producto agregado al carrito`);
            console.log(`💰 Total actualizado: $${response.data.data.total}`);
            console.log(`📦 Items en carrito: ${response.data.data.items.length}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error agregando al carrito:", error.response?.data || error.message);
        return null;
    }
}

// Función para actualizar cantidad
async function updateCartItem(productId, quantity) {
    try {
        console.log(`\n🔄 Actualizando cantidad del producto ${productId} a ${quantity}...`);
        const response = await axios.put(`${API_BASE_URL}/cart/item/${productId}`, {
            quantity
        }, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            console.log(`✅ Cantidad actualizada`);
            console.log(`💰 Total actualizado: $${response.data.data.total}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error actualizando carrito:", error.response?.data || error.message);
        return null;
    }
}

// Función para remover producto del carrito
async function removeFromCart(productId) {
    try {
        console.log(`\n🗑️ Removiendo producto ${productId} del carrito...`);
        const response = await axios.delete(`${API_BASE_URL}/cart/item/${productId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            console.log(`✅ Producto removido del carrito`);
            console.log(`💰 Total actualizado: $${response.data.data.total}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error removiendo del carrito:", error.response?.data || error.message);
        return null;
    }
}

// Función para limpiar carrito
async function clearCart() {
    try {
        console.log("\n🧹 Limpiando carrito...");
        const response = await axios.delete(`${API_BASE_URL}/cart/clear`, {
            headers: { Authorization: `Bearer ${authToken}` }
        });

        if (response.data.success) {
            console.log(`✅ Carrito limpiado`);
            console.log(`💰 Total: $${response.data.data.total}`);
            return response.data.data;
        }
    } catch (error) {
        console.error("❌ Error limpiando carrito:", error.response?.data || error.message);
        return null;
    }
}

// Función principal de prueba
async function testCart() {
    console.log("🧪 Iniciando pruebas del carrito de compras...\n");

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

    const product1 = products[0];
    const product2 = products[1] || products[0]; // Usar el mismo producto si solo hay uno

    // 3. Obtener carrito inicial
    await getCart();

    // 4. Agregar primer producto
    await addToCart(product1._id, 2);

    // 5. Agregar segundo producto
    await addToCart(product2._id, 1);

    // 6. Obtener carrito actualizado
    await getCart();

    // 7. Actualizar cantidad del primer producto
    await updateCartItem(product1._id, 3);

    // 8. Obtener carrito actualizado
    await getCart();

    // 9. Remover segundo producto
    await removeFromCart(product2._id);

    // 10. Obtener carrito final
    await getCart();

    // 11. Limpiar carrito
    await clearCart();

    // 12. Verificar carrito vacío
    await getCart();

    console.log("\n✅ Pruebas del carrito completadas!");
}

// Ejecutar pruebas
testCart().catch(console.error);
