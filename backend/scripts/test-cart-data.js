import "dotenv/config";
import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

async function testCartData() {
    try {
        console.log("🔐 Iniciando sesión...");
        const loginResponse = await axios.post(`${API_BASE_URL}/users/login`, {
            email: "test@supergains.com",
            contraseña: "TestPassword123"
        });

        const token = loginResponse.data.data.tokens.accessToken;
        console.log("✅ Login exitoso");

        console.log("📦 Obteniendo productos...");
        const productsResponse = await axios.get(`${API_BASE_URL}/products`);
        const productId = productsResponse.data.data[0]._id;
        console.log("✅ Producto encontrado:", productId);

        console.log("➕ Agregando producto al carrito...");
        await axios.post(`${API_BASE_URL}/cart/add`, {
            productId: productId,
            quantity: 1
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("✅ Producto agregado");

        console.log("🛒 Obteniendo carrito...");
        const cartResponse = await axios.get(`${API_BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("📄 Datos del carrito:");
        console.log(JSON.stringify(cartResponse.data, null, 2));

    } catch (error) {
        console.error("❌ Error:", error.response?.data || error.message);
    }
}

testCartData();
