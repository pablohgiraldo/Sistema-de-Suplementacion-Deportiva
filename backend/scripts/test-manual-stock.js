import axios from "axios";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

const BASE_URL = process.env.API_URL || "http://localhost:4000";

async function testManualStockValidation() {
    console.log("🧪 Prueba manual de validación de stock...");

    try {
        // 1. Crear usuario
        console.log("\n1️⃣ Creando usuario de prueba...");
        const timestamp = Date.now();
        const email = `test-manual-${timestamp}@supergains.com`;

        const registerResponse = await axios.post(`${BASE_URL}/api/users/register`, {
            nombre: "Test Manual",
            email: email,
            contraseña: "Password123",
            confirmarContraseña: "Password123"
        });

        console.log("✅ Usuario creado:", email);

        // 2. Hacer login
        console.log("\n2️⃣ Haciendo login...");
        const loginResponse = await axios.post(`${BASE_URL}/api/users/login`, {
            email: email,
            contraseña: "Password123"
        });

        const token = loginResponse.data.data.accessToken;
        console.log("✅ Login exitoso");

        // 3. Configurar headers de autenticación
        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 4. Obtener carrito vacío
        console.log("\n3️⃣ Obteniendo carrito vacío...");
        const cartResponse = await axios.get(`${BASE_URL}/api/cart`, { headers: authHeaders });
        console.log("✅ Carrito obtenido:", cartResponse.data.data.items.length, "items");

        // 5. Intentar agregar producto con stock suficiente
        console.log("\n4️⃣ Agregando producto con stock suficiente...");
        try {
            const addResponse = await axios.post(`${BASE_URL}/api/cart/add`, {
                productId: "68c982b4fbb7c8b686067111", // Omega-3 Fish Oil
                quantity: 5
            }, { headers: authHeaders });

            console.log("✅ Producto agregado exitosamente");
            console.log("   Items en carrito:", addResponse.data.data.items.length);
        } catch (error) {
            console.log("❌ Error agregando producto:", error.response?.data?.error || error.message);
        }

        // 6. Intentar agregar cantidad excesiva
        console.log("\n5️⃣ Intentando agregar cantidad excesiva...");
        try {
            const addExcessResponse = await axios.post(`${BASE_URL}/api/cart/add`, {
                productId: "68c982b4fbb7c8b686067111",
                quantity: 1000
            }, { headers: authHeaders });

            console.log("❌ ERROR: Debería haber fallado por stock insuficiente");
        } catch (error) {
            if (error.response?.data?.error?.includes('Stock insuficiente')) {
                console.log("✅ Validación funciona: Stock insuficiente detectado");
                console.log("   Error:", error.response.data.error);
            } else {
                console.log("❌ Error inesperado:", error.response?.data?.error || error.message);
            }
        }

        // 7. Validar carrito
        console.log("\n6️⃣ Validando carrito...");
        try {
            const validateResponse = await axios.get(`${BASE_URL}/api/cart/validate`, { headers: authHeaders });
            console.log("✅ Validación exitosa");
            console.log("   Carrito válido:", validateResponse.data.data.isValid);
            console.log("   Items válidos:", validateResponse.data.data.validItems);
        } catch (error) {
            console.log("❌ Error validando carrito:", error.response?.data?.error || error.message);
        }

        // 8. Sincronizar carrito
        console.log("\n7️⃣ Sincronizando carrito...");
        try {
            const syncResponse = await axios.post(`${BASE_URL}/api/cart/sync`, {}, { headers: authHeaders });
            console.log("✅ Sincronización exitosa");
            console.log("   Mensaje:", syncResponse.data.message);
        } catch (error) {
            console.log("❌ Error sincronizando:", error.response?.data?.error || error.message);
        }

        console.log("\n🎉 Prueba manual completada");

    } catch (error) {
        console.log("❌ Error general:", error.response?.data || error.message);
    }
}

testManualStockValidation();
