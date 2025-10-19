import "dotenv/config";
import mongoose from "mongoose";
import Order from "../src/models/Order.js";

async function resetOrders(executeChanges = false) {
    try {
        console.log("🔄 Reseteando órdenes con precios inconsistentes...");
        if (!executeChanges) {
            console.log("🔍 MODO PREVIEW - No se realizarán cambios reales");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Contar órdenes existentes
        const totalOrders = await Order.countDocuments();
        console.log(`\n📊 Órdenes existentes: ${totalOrders}`);

        // 2. Analizar órdenes con precios problemáticos
        const problematicOrders = await Order.find({
            $or: [
                { subtotal: { $gt: 10000 } }, // Subtotal muy alto (probablemente en COP)
                { shipping: { $gt: 10 } },    // Shipping muy alto
                { total: { $gt: 20000 } }     // Total muy alto
            ]
        }).limit(10);

        console.log(`\n🚨 Órdenes con precios problemáticos encontradas: ${problematicOrders.length}`);
        
        problematicOrders.forEach(order => {
            console.log(`Orden ${order.orderNumber}:`);
            console.log(`  - Subtotal: $${order.subtotal?.toLocaleString()} (probablemente COP)`);
            console.log(`  - Tax: $${order.tax?.toLocaleString()}`);
            console.log(`  - Shipping: $${order.shipping?.toLocaleString()}`);
            console.log(`  - Total: $${order.total?.toLocaleString()}`);
        });

        if (executeChanges) {
            console.log("\n⚠️  ADVERTENCIA: Esta acción eliminará todas las órdenes existentes");
            console.log("Esto es necesario para tener datos consistentes con USD");
            
            // Eliminar todas las órdenes
            const deleteResult = await Order.deleteMany({});
            console.log(`\n✅ ${deleteResult.deletedCount} órdenes eliminadas`);
            
            console.log("\n📝 Recomendaciones post-reset:");
            console.log("1. Las nuevas órdenes usarán precios en USD");
            console.log("2. Los cálculos de IVA y envío serán consistentes");
            console.log("3. El dashboard mostrará datos reales");
        } else {
            console.log("\n🔍 MODO PREVIEW - Para ejecutar el reset real:");
            console.log("node scripts/reset-orders.js --execute");
            console.log("\n⚠️  Esta acción eliminará TODAS las órdenes existentes");
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Proceso completado");
    }
}

// Verificar argumentos
const shouldExecute = process.argv.includes('--execute');
resetOrders(shouldExecute);
