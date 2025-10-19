import "dotenv/config";
import mongoose from "mongoose";
import Inventory from "../src/models/Inventory.js";
import Product from "../src/models/Product.js";

async function fixCurrentStock(executeChanges = false) {
    try {
        console.log("🔧 Corrigiendo currentStock para que sea consistente con canales...");
        if (!executeChanges) {
            console.log("🔍 MODO PREVIEW - No se realizarán cambios reales");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        // Obtener todos los inventarios
        const inventories = await Inventory.find({}).populate('product', 'name');

        console.log(`\n📊 Analizando ${inventories.length} productos...`);

        let fixedCount = 0;

        for (const inventory of inventories) {
            const physicalStock = inventory.channels?.physical?.stock || 0;
            const digitalStock = inventory.channels?.digital?.stock || 0;
            const currentStock = inventory.currentStock || 0;

            // En un inventario unificado, todos estos valores deberían ser iguales
            const expectedStock = physicalStock; // Usar el stock físico como referencia

            if (currentStock !== expectedStock || physicalStock !== digitalStock) {
                console.log(`\n📦 ${inventory.product?.name || 'Producto sin nombre'}:`);
                console.log(`   Current Stock (BD): ${currentStock}`);
                console.log(`   Physical Stock: ${physicalStock}`);
                console.log(`   Digital Stock: ${digitalStock}`);
                console.log(`   Stock Esperado: ${expectedStock}`);

                if (executeChanges) {
                    try {
                        // Usar updateOne para evitar problemas con middlewares
                        const now = new Date();
                        await Inventory.updateOne(
                            { _id: inventory._id },
                            {
                                $set: {
                                    currentStock: expectedStock,
                                    availableStock: Math.max(0, expectedStock - inventory.reservedStock),
                                    'channels.physical.stock': expectedStock,
                                    'channels.digital.stock': expectedStock,
                                    'channels.physical.lastUpdated': now,
                                    'channels.digital.lastUpdated': now,
                                    'channels.physical.lastSync': now,
                                    'channels.digital.lastSync': now,
                                    'channels.physical.syncStatus': 'synced',
                                    'channels.digital.syncStatus': 'synced'
                                }
                            }
                        );
                        console.log(`   ✅ Corregido: currentStock = ${expectedStock}, ambos canales = ${expectedStock}`);
                        fixedCount++;
                    } catch (error) {
                        console.log(`   ❌ Error corrigiendo: ${error.message}`);
                    }
                } else {
                    console.log(`   🔍 Se corregiría a: currentStock = ${expectedStock}, ambos canales = ${expectedStock}`);
                }
            }
        }

        console.log(`\n📈 RESUMEN:`);
        console.log(`   Productos analizados: ${inventories.length}`);
        if (executeChanges) {
            console.log(`   Productos corregidos: ${fixedCount}`);
        } else {
            console.log(`   Para corregir, ejecuta: node scripts/fix-current-stock.js --execute`);
        }

        // Verificar estado final
        const finalStats = await Inventory.aggregate([
            {
                $group: {
                    _id: null,
                    totalPhysicalStock: { $sum: '$channels.physical.stock' },
                    totalDigitalStock: { $sum: '$channels.digital.stock' },
                    totalCurrentStock: { $sum: '$currentStock' },
                    productCount: { $sum: 1 }
                }
            }
        ]);

        if (finalStats.length > 0) {
            const stats = finalStats[0];
            console.log(`\n🎯 ESTADÍSTICAS FINALES:`);
            console.log(`   Stock Físico Total: ${stats.totalPhysicalStock}`);
            console.log(`   Stock Digital Total: ${stats.totalDigitalStock}`);
            console.log(`   Stock Actual Total: ${stats.totalCurrentStock}`);
            console.log(`   Total Productos: ${stats.productCount}`);
            
            const isConsistent = stats.totalPhysicalStock === stats.totalDigitalStock && 
                               stats.totalPhysicalStock === stats.totalCurrentStock;
            console.log(`   Estado: ${isConsistent ? '✅ CONSISTENTE' : '⚠️ INCONSISTENTE'}`);
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
fixCurrentStock(shouldExecute);
