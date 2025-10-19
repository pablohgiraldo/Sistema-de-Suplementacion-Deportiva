import "dotenv/config";
import mongoose from "mongoose";
import Order from "../src/models/Order.js";
import User from "../src/models/User.js";

async function auditOrderTotals() {
    try {
        console.log("🔍 Auditando cálculos de totales en órdenes...");
        await mongoose.connect(process.env.MONGODB_URI);

        // Obtener órdenes recientes
        const orders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'nombre email');

        console.log(`\n📊 Analizando ${orders.length} órdenes recientes:`);

        let physicalSales = 0;
        let onlineSales = 0;
        let totalPhysicalRevenue = 0;
        let totalOnlineRevenue = 0;

        orders.forEach((order, index) => {
            const calculatedSubtotal = order.items.reduce((sum, item) => {
                return sum + (item.price * item.quantity);
            }, 0);

            const calculatedTax = Math.round((calculatedSubtotal * 0.19) * 100) / 100;
            const shipping = order.salesChannel === 'physical_store' ? 0 : (calculatedSubtotal > 100 ? 0 : 2.5);
            const calculatedTotal = Math.round((calculatedSubtotal + calculatedTax + shipping) * 100) / 100;

            console.log(`\n📋 Orden ${order.orderNumber || order._id}:`);
            console.log(`   Canal: ${order.salesChannel}`);
            console.log(`   Items: ${order.items.length}`);
            
            // Mostrar cálculo detallado
            console.log(`   Subtotal (items): $${calculatedSubtotal.toFixed(2)}`);
            console.log(`   Subtotal (BD): $${order.subtotal.toFixed(2)}`);
            console.log(`   Tax (19%): $${calculatedTax.toFixed(2)}`);
            console.log(`   Tax (BD): $${order.tax.toFixed(2)}`);
            console.log(`   Shipping: $${shipping.toFixed(2)}`);
            console.log(`   Shipping (BD): $${order.shipping.toFixed(2)}`);
            console.log(`   Total (calculado): $${calculatedTotal.toFixed(2)}`);
            console.log(`   Total (BD): $${order.total.toFixed(2)}`);
            
            // Verificar discrepancias
            const subtotalDiff = Math.abs(calculatedSubtotal - order.subtotal);
            const taxDiff = Math.abs(calculatedTax - order.tax);
            const totalDiff = Math.abs(calculatedTotal - order.total);
            
            if (subtotalDiff > 0.01 || taxDiff > 0.01 || totalDiff > 0.01) {
                console.log(`   ⚠️  DISCREPANCIAS DETECTADAS:`);
                if (subtotalDiff > 0.01) console.log(`     - Subtotal: ${subtotalDiff.toFixed(4)}`);
                if (taxDiff > 0.01) console.log(`     - Tax: ${taxDiff.toFixed(4)}`);
                if (totalDiff > 0.01) console.log(`     - Total: ${totalDiff.toFixed(4)}`);
            } else {
                console.log(`   ✅ Cálculos correctos`);
            }

            // Acumular por canal
            if (order.salesChannel === 'physical_store') {
                physicalSales++;
                totalPhysicalRevenue += order.total;
            } else {
                onlineSales++;
                totalOnlineRevenue += order.total;
            }
        });

        console.log(`\n📈 RESUMEN:`);
        console.log(`   Ventas Físicas: ${physicalSales}`);
        console.log(`   Ingresos Físicos: $${totalPhysicalRevenue.toFixed(2)} USD`);
        console.log(`   Ventas Online: ${onlineSales}`);
        console.log(`   Ingresos Online: $${totalOnlineRevenue.toFixed(2)} USD`);
        console.log(`   Total General: $${(totalPhysicalRevenue + totalOnlineRevenue).toFixed(2)} USD`);

        // Verificar que las ventas físicas no tengan shipping
        const physicalOrdersWithShipping = orders.filter(order => 
            order.salesChannel === 'physical_store' && order.shipping > 0
        );

        if (physicalOrdersWithShipping.length > 0) {
            console.log(`\n⚠️  PROBLEMA: ${physicalOrdersWithShipping.length} ventas físicas tienen costo de envío > 0`);
            physicalOrdersWithShipping.forEach(order => {
                console.log(`   - Orden ${order.orderNumber}: shipping = $${order.shipping}`);
            });
        } else {
            console.log(`\n✅ Todas las ventas físicas tienen shipping = 0`);
        }

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Auditoría completada");
    }
}

auditOrderTotals();
