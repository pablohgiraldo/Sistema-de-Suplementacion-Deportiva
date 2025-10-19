import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Order from "../src/models/Order.js";

const USD_TO_COP_RATE = 4000; // Tasa aproximada USD a COP

async function auditPrices() {
    try {
        console.log("🔍 Auditoría de precios y monedas...");
        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Revisar productos
        const products = await Product.find({}).limit(10);
        console.log("\n📦 PRODUCTOS:");
        console.log("Los precios actuales están en COP (pesos colombianos):");
        products.forEach(p => {
            const usdPrice = (p.price / USD_TO_COP_RATE).toFixed(2);
            console.log(`- ${p.name}: $${p.price.toLocaleString()} COP → $${usdPrice} USD`);
        });

        // 2. Revisar órdenes recientes
        const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);
        console.log("\n📋 ÓRDENES RECIENTES:");
        recentOrders.forEach(order => {
            console.log(`Orden ${order.orderNumber}:`);
            console.log(`  - Subtotal: $${order.subtotal?.toLocaleString()} COP`);
            console.log(`  - Tax (19%): $${order.tax?.toLocaleString()} COP`);
            console.log(`  - Shipping: $${order.shipping?.toLocaleString()} COP`);
            console.log(`  - Total: $${order.total?.toLocaleString()} COP`);
        });

        // 3. Estadísticas de conversión
        console.log("\n📊 ESTADÍSTICAS:");
        const totalProducts = await Product.countDocuments();
        const avgPriceCOP = await Product.aggregate([
            { $group: { _id: null, avgPrice: { $avg: "$price" } } }
        ]);
        
        if (avgPriceCOP.length > 0) {
            const avg = avgPriceCOP[0].avgPrice;
            console.log(`- Productos totales: ${totalProducts}`);
            console.log(`- Precio promedio: $${avg.toFixed(0).toLocaleString()} COP`);
            console.log(`- Precio promedio en USD: $${(avg / USD_TO_COP_RATE).toFixed(2)} USD`);
        }

        console.log("\n🎯 RECOMENDACIONES:");
        console.log("1. Convertir todos los precios de COP a USD");
        console.log("2. Actualizar cálculos de IVA a USD");
        console.log("3. Cambiar shipping costs de 5000 COP a ~$1.25 USD");
        console.log("4. Actualizar frontend para mostrar USD consistentemente");
        console.log("5. Limpiar órdenes con precios inconsistentes");

    } catch (error) {
        console.error("❌ Error en auditoría:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Auditoría completada");
    }
}

auditPrices();
