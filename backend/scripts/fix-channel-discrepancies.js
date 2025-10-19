import "dotenv/config";
import mongoose from "mongoose";
import Inventory from "../src/models/Inventory.js";
import Product from "../src/models/Product.js";

async function fixChannelDiscrepancies(executeChanges = false) {
    try {
        console.log("🔧 Diagnosticando y corrigiendo discrepancias entre canales...");
        if (!executeChanges) {
            console.log("🔍 MODO PREVIEW - No se realizarán cambios reales");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        
        // 1. Obtener todos los inventarios con discrepancias
        const inventories = await Inventory.find({})
            .populate('product', 'name')
            .lean();

        console.log(`\n📊 Analizando ${inventories.length} productos...`);

        let totalDiscrepancies = 0;
        let fixedDiscrepancies = 0;
        const discrepancyDetails = [];

        for (const inventory of inventories) {
            const physicalStock = inventory.channels?.physical?.stock || 0;
            const digitalStock = inventory.channels?.digital?.stock || 0;
            
            if (physicalStock !== digitalStock) {
                totalDiscrepancies++;
                const difference = Math.abs(physicalStock - digitalStock);
                
                discrepancyDetails.push({
                    productId: inventory.product?._id,
                    productName: inventory.product?.name || 'Sin nombre',
                    physicalStock,
                    digitalStock,
                    difference,
                    totalStock: inventory.currentStock
                });

                console.log(`\n📦 ${inventory.product?.name || 'Producto sin nombre'}:`);
                console.log(`   Stock Físico: ${physicalStock}`);
                console.log(`   Stock Digital: ${digitalStock}`);
                console.log(`   Stock Total (BD): ${inventory.currentStock}`);
                console.log(`   Diferencia: ${difference} unidades`);

                if (executeChanges) {
                    try {
                        // Actualizar el documento completo
                        const inventoryDoc = await Inventory.findById(inventory._id);
                        if (inventoryDoc) {
                            // Estrategia: usar el stock total como referencia y dividir proporcionalmente
                            // O sincronizar hacia el canal con más stock (más conservador)
                            const targetStock = Math.max(physicalStock, digitalStock, inventory.currentStock);
                            
                            // Actualizar ambos canales al mismo valor
                            inventoryDoc.channels.physical.stock = targetStock;
                            inventoryDoc.channels.digital.stock = targetStock;
                            inventoryDoc.currentStock = targetStock;
                            inventoryDoc.availableStock = Math.max(0, targetStock - inventoryDoc.reservedStock);
                            
                            // Marcar como sincronizado
                            inventoryDoc.channels.physical.lastSync = new Date();
                            inventoryDoc.channels.digital.lastSync = new Date();
                            inventoryDoc.channels.physical.syncStatus = 'synced';
                            inventoryDoc.channels.digital.syncStatus = 'synced';
                            inventoryDoc.channels.physical.lastUpdated = new Date();
                            inventoryDoc.channels.digital.lastUpdated = new Date();

                            await inventoryDoc.save();
                            console.log(`   ✅ Corregido: ambos canales ahora tienen ${targetStock} unidades`);
                            fixedDiscrepancies++;
                        }
                    } catch (error) {
                        console.log(`   ❌ Error corrigiendo: ${error.message}`);
                    }
                }
            }
        }

        console.log(`\n📈 RESUMEN:`);
        console.log(`   - Total productos: ${inventories.length}`);
        console.log(`   - Productos con discrepancias: ${totalDiscrepancies}`);
        if (executeChanges) {
            console.log(`   - Productos corregidos: ${fixedDiscrepancies}`);
        } else {
            console.log(`   - Para corregir, ejecuta: node scripts/fix-channel-discrepancies.js --execute`);
        }

        // 2. Verificar estadísticas finales
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
            console.log(`   - Stock Físico Total: ${stats.totalPhysicalStock}`);
            console.log(`   - Stock Digital Total: ${stats.totalDigitalStock}`);
            console.log(`   - Stock Actual Total: ${stats.totalCurrentStock}`);
            console.log(`   - Total Productos: ${stats.productCount}`);
            
            const discrepancyRate = stats.totalPhysicalStock !== stats.totalDigitalStock ? 
                ((Math.abs(stats.totalPhysicalStock - stats.totalDigitalStock) / Math.max(stats.totalPhysicalStock, stats.totalDigitalStock)) * 100).toFixed(2) : 0;
            console.log(`   - Tasa de Discrepancia: ${discrepancyRate}%`);
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
fixChannelDiscrepancies(shouldExecute);
