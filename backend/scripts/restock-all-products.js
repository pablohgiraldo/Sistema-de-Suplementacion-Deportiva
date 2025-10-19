import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";

const RESTOCK_QUANTITY = 500;
const MIN_STOCK_THRESHOLD = 100; // Solo reabastecer si tiene menos de 100 unidades

async function restockAllProducts(dryRun = true) {
    try {
        console.log("🚀 Iniciando reabastecimiento masivo...");
        if (dryRun) {
            console.log("🔍 MODO PREVIEW - No se realizarán cambios reales");
        }
        console.log(`📦 Cantidad a agregar por producto: ${RESTOCK_QUANTITY} unidades`);
        console.log(`🎯 Solo productos con stock < ${MIN_STOCK_THRESHOLD} unidades`);

        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        // Verificar cuántos inventarios hay en total
        const totalInventories = await Inventory.countDocuments();
        console.log(`📊 Total de registros de inventario: ${totalInventories}`);

        // Obtener solo productos que necesiten reabastecimiento
        const inventories = await Inventory.find({
            currentStock: { $lt: MIN_STOCK_THRESHOLD }
        })
            .populate('product', 'name brand price')
            .lean();

        console.log(`🔍 Productos con stock < ${MIN_STOCK_THRESHOLD}: ${inventories.length}`);

        if (inventories.length === 0) {
            console.log("✅ No se encontraron productos que necesiten reabastecimiento");
            
            // Mostrar algunos ejemplos de productos existentes
            const sampleInventories = await Inventory.find({})
                .populate('product', 'name')
                .limit(5)
                .lean();
            
            console.log("\n📋 Muestra de productos existentes:");
            sampleInventories.forEach(inv => {
                console.log(`   - ${inv.product?.name || 'Sin nombre'}: ${inv.currentStock} unidades`);
            });
            return;
        }

        console.log(`📊 Productos que necesitan reabastecimiento: ${inventories.length}`);

        let updated = 0;
        let errors = 0;

        // Reabastecer cada producto
        for (const inventory of inventories) {
            try {
                // Buscar el documento completo (no lean) para poder usar los métodos
                const inventoryDoc = await Inventory.findById(inventory._id);
                
                if (!inventoryDoc) {
                    console.log(`⚠️  No se encontró inventario para: ${inventory.product?.name || 'ID: ' + inventory._id}`);
                    errors++;
                    continue;
                }

                const productName = inventoryDoc.product?.name || 'Producto desconocido';
                const oldStock = inventoryDoc.currentStock;
                const newStock = oldStock + RESTOCK_QUANTITY;

                console.log(`📦 ${productName}: ${oldStock} → ${newStock} unidades`);

                if (!dryRun) {
                    // Reabastecer usando el método del modelo
                    await inventoryDoc.restock(RESTOCK_QUANTITY, `Reabastecimiento masivo - ${new Date().toISOString()}`);

                    // También actualizar los canales físicos y digitales
                    const physicalQuantity = Math.floor(RESTOCK_QUANTITY * 0.6); // 60% físico
                    const digitalQuantity = Math.floor(RESTOCK_QUANTITY * 0.4); // 40% digital

                    inventoryDoc.channels.physical.stock += physicalQuantity;
                    inventoryDoc.channels.physical.lastUpdated = new Date();
                    inventoryDoc.channels.physical.syncStatus = 'synced';

                    inventoryDoc.channels.digital.stock += digitalQuantity;
                    inventoryDoc.channels.digital.lastUpdated = new Date();
                    inventoryDoc.channels.digital.syncStatus = 'synced';

                    // Asegurar que availableStock esté actualizado
                    inventoryDoc.availableStock = Math.max(0, inventoryDoc.currentStock - inventoryDoc.reservedStock);

                    // Asegurar que el status sea activo
                    if (inventoryDoc.status !== 'active') {
                        inventoryDoc.status = 'active';
                    }

                    await inventoryDoc.save();
                    console.log(`✅ ${productName} actualizado`);
                } else {
                    console.log(`🔍 Preview: ${productName} sería actualizado`);
                }
                updated++;

            } catch (error) {
                console.error(`❌ Error reabasteciendo ${inventory.product?.name || inventory._id}:`, error.message);
                errors++;
            }
        }

        console.log("\n🎉 Reabastecimiento completado!");
        if (dryRun) {
            console.log("🔍 MODO PREVIEW - No se realizaron cambios reales");
            console.log("💡 Para ejecutar realmente, usa: node scripts/restock-all-products.js --execute");
        }
        console.log(`📈 Resumen:`);
        console.log(`   - Productos procesados: ${inventories.length}`);
        console.log(`   - Productos ${dryRun ? 'que serían actualizados' : 'actualizados'}: ${updated}`);
        console.log(`   - Errores: ${errors}`);
        console.log(`   - Cantidad ${dryRun ? 'que se agregaría' : 'agregada'} por producto: ${RESTOCK_QUANTITY} unidades`);

        // Mostrar estadísticas finales
        const totalInventory = await Inventory.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: '$currentStock' },
                    totalAvailable: { $sum: '$availableStock' },
                    totalPhysical: { $sum: '$channels.physical.stock' },
                    totalDigital: { $sum: '$channels.digital.stock' },
                    productsCount: { $sum: 1 }
                }
            }
        ]);

        if (totalInventory.length > 0) {
            const stats = totalInventory[0];
            console.log(`\n📊 Estadísticas finales:`);
            console.log(`   - Stock total: ${stats.totalStock} unidades`);
            console.log(`   - Stock disponible: ${stats.totalAvailable} unidades`);
            console.log(`   - Stock físico: ${stats.totalPhysical} unidades`);
            console.log(`   - Stock digital: ${stats.totalDigital} unidades`);
            console.log(`   - Productos con inventario: ${stats.productsCount}`);
        }

    } catch (error) {
        console.error("❌ Error en reabastecimiento masivo:", error.message);
        console.error(error.stack);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Desconectado de MongoDB");
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const shouldExecute = process.argv.includes('--execute');
    
    if (shouldExecute) {
        console.log("⚠️  ADVERTENCIA: Ejecutando en modo PRODUCCIÓN");
        console.log("Este script modificará la base de datos en producción.");
        console.log("Presiona Ctrl+C para cancelar en los próximos 5 segundos...");
        
        setTimeout(() => {
            restockAllProducts(false);
        }, 5000);
    } else {
        restockAllProducts(true); // Modo preview por defecto
    }
}

export default restockAllProducts;
