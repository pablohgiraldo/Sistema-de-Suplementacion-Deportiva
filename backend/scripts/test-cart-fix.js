import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Cart from '../src/models/Cart.js';
import { generateAuthTokens } from '../src/utils/jwtUtils.js';

const testCartFix = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
        console.log("🧪 Probando corrección del carrito...\n");

        // 1. Crear o encontrar un usuario de prueba
        console.log("1️⃣ Verificando usuario de prueba...");
        let testUser = await User.findOne({ email: 'test@supergains.com' });
        if (!testUser) {
            testUser = await User.create({
                nombre: 'Usuario Test',
                email: 'test@supergains.com',
                contraseña: 'TestPassword123',
                rol: 'usuario',
                activo: true
            });
            console.log("   ✅ Usuario de prueba creado");
        } else {
            // Asegurar que el usuario esté activo
            if (!testUser.activo) {
                testUser.activo = true;
                await testUser.save();
                console.log("   ✅ Usuario activado");
            } else {
                console.log("   ⏭️ Usuario de prueba ya existe y está activo");
            }
        }

        // 2. Generar token de autenticación
        console.log("\n2️⃣ Generando token de autenticación...");
        const authResult = await generateAuthTokens(testUser);
        const accessToken = authResult.data.token;
        console.log("   ✅ Token generado");

        // 3. Verificar productos disponibles
        console.log("\n3️⃣ Verificando productos disponibles...");
        const products = await Product.find({}).limit(3);
        console.log(`   📦 Productos encontrados: ${products.length}`);
        products.forEach(p => {
            console.log(`      - ${p.name} (${p.brand}) - $${p.price}`);
        });

        // 4. Probar operaciones del carrito
        console.log("\n4️⃣ Probando operaciones del carrito...");

        // Simular llamadas a la API del carrito
        const baseURL = process.env.VITE_API_URL || "http://localhost:4000/api";

        // Headers con autenticación
        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        };

        // Probar agregar producto al carrito
        if (products.length > 0) {
            const testProduct = products[0];
            console.log(`   🛒 Agregando producto: ${testProduct.name}`);

            try {
                const addResponse = await fetch(`${baseURL}/cart/add`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        productId: testProduct._id,
                        quantity: 1
                    })
                });

                if (addResponse.ok) {
                    const addData = await addResponse.json();
                    console.log("   ✅ Producto agregado al carrito");
                    console.log(`      Respuesta: ${JSON.stringify(addData, null, 2)}`);
                } else {
                    const errorData = await addResponse.json();
                    console.log("   ❌ Error agregando producto:");
                    console.log(`      Status: ${addResponse.status}`);
                    console.log(`      Error: ${JSON.stringify(errorData, null, 2)}`);
                }
            } catch (error) {
                console.log("   ❌ Error en la llamada:");
                console.log(`      Error: ${error.message}`);
            }
        }

        // Probar obtener carrito
        console.log("\n5️⃣ Probando obtener carrito...");
        try {
            const getResponse = await fetch(`${baseURL}/cart`, {
                method: 'GET',
                headers
            });

            if (getResponse.ok) {
                const cartData = await getResponse.json();
                console.log("   ✅ Carrito obtenido exitosamente");
                console.log(`      Items: ${cartData.data?.items?.length || 0}`);
                if (cartData.data?.items?.length > 0) {
                    cartData.data.items.forEach(item => {
                        console.log(`         - ${item.name} x${item.quantity} - $${item.price}`);
                    });
                }
            } else {
                const errorData = await getResponse.json();
                console.log("   ❌ Error obteniendo carrito:");
                console.log(`      Status: ${getResponse.status}`);
                console.log(`      Error: ${JSON.stringify(errorData, null, 2)}`);
            }
        } catch (error) {
            console.log("   ❌ Error en la llamada:");
            console.log(`      Error: ${error.message}`);
        }

        // 6. Verificar estado en la base de datos
        console.log("\n6️⃣ Verificando estado en la base de datos...");
        const userCart = await Cart.findOne({ user: testUser._id }).populate('items.product');
        if (userCart) {
            console.log("   📊 Carrito en BD:");
            console.log(`      Total items: ${userCart.items.length}`);
            userCart.items.forEach(item => {
                console.log(`         - ${item.product.name} x${item.quantity} - $${item.product.price}`);
            });
        } else {
            console.log("   ⚠️ No se encontró carrito en la base de datos");
        }

        console.log("\n🎉 Prueba del carrito completada!");

    } catch (error) {
        console.error("❌ Error durante la prueba:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🏁 Proceso completado");
    }
};

testCartFix();
