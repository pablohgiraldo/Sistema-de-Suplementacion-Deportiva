import "dotenv/config";
import mongoose from "mongoose";
import Inventory from "../src/models/Inventory.js";
import Product from "../src/models/Product.js";

async function debugInventoryChanges() {
    try {
        console.log("🔍 Diagnosticando cambios de inventario...");
        await mongoose.connect(process.env.MONGODB_URI);

        // Obtener todos los inventarios con sus productos
        const inventories = await Inventory.find({})
            .populate('product', 'name price')
            .lean();

        console.log(`\n📊 Estado actual del inventario:`);
        
        let suspiciousEntries = [];

        for (const inventory of inventories) {
            const physicalStock = inventory.channels?.physical?.stock || 0;
            const digitalStock = inventory.channels?.digital?.stock || 0;
            const currentStock = inventory.currentStock || 0;
            
            // Verificar si hay algo extraño
            const hasDiscrepancy = physicalStock !== digitalStock;
            const totalChannelStock = physicalStock + digitalStock;
            const isStockUnusual = currentStock > 1000; // Stock inusualmente alto
            
            if (hasDiscrepancy || isStockUnusual) {
                suspiciousEntries.push({
                    productName: inventory.product?.name || 'Sin nombre',
                    productId: inventory.product?._id,
                    inventoryId: inventory._id,
                    currentStock,
                    physicalStock,
                    digitalStock,
                    totalSold: inventory.totalSold,
                    hasDiscrepancy,
                    isStockUnusual
                });
            }

            console.log(`\n📦 ${inventory.product?.name || 'Producto sin nombre'}:`);
            console.log(`   ID Inventario: ${inventory._id}`);
            console.log(`   Stock Físico: ${physicalStock}`);
            console.log(`   Stock Digital: ${digitalStock}`);
            console.log(`   Stock Total (BD): ${currentStock}`);
            console.log(`   Total Vendido: ${inventory.totalSold}`);
            console.log(`   Última Venta: ${inventory.lastSold ? new Date(inventory.lastSold).toISOString() : 'Nunca'}`);
            
            if (hasDiscrepancy) {
                console.log(`   ⚠️  DISCREPANCIA: ${Math.abs(physicalStock - digitalStock)} unidades`);
            }
            if (isStockUnusual) {
                console.log(`   🚨 STOCK INUSUAL: ${currentStock} unidades`);
            }
        }

        console.log(`\n🔍 RESUMEN DE PROBLEMAS:`);
        console.log(`   Total productos analizados: ${inventories.length}`);
        console.log(`   Entradas sospechosas: ${suspiciousEntries.length}`);

        if (suspiciousEntries.length > 0) {
            console.log(`\n🚨 PRODUCTOS CON PROBLEMAS:`);
            suspiciousEntries.forEach(entry => {
                console.log(`\n   ${entry.productName}:`);
                console.log(`     Stock Actual: ${entry.currentStock}`);
                console.log(`     Stock Físico: ${entry.physicalStock}`);
                console.log(`     Stock Digital: ${entry.digitalStock}`);
                if (entry.hasDiscrepancy) {
                    console.log(`     ⚠️  Discrepancia: ${Math.abs(entry.physicalStock - entry.digitalStock)} unidades`);
                }
                if (entry.isStockUnusual) {
                    console.log(`     🚨 Stock inusualmente alto: ${entry.currentStock}`);
                }
            });
        }

        // Estadísticas generales
        const totalPhysical = inventories.reduce((sum, inv) => sum + (inv.channels?.physical?.stock || 0), 0);
        const totalDigital = inventories.reduce((sum, inv) => sum + (inv.channels?.digital?.stock || 0), 0);
        const totalCurrent = inventories.reduce((sum, inv) => sum + (inv.currentStock || 0), 0);

        console.log(`\n📈 ESTADÍSTICAS TOTALES:`);
        console.log(`   Stock Físico Total: ${totalPhysical}`);
        console.log(`   Stock Digital Total: ${totalDigital}`);
        console.log(`   Stock Actual Total: ${totalCurrent}`);
        console.log(`   Diferencia Físico-Digital: ${Math.abs(totalPhysical - totalDigital)}`);

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n✅ Diagnóstico completado");
    }
}

debugInventoryChanges();
