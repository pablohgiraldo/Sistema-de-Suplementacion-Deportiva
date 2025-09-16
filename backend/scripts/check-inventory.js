import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "../src/models/Inventory.js";
import Product from "../src/models/Product.js";
import { connectDB } from "../src/config/db.js";

// Cargar variables de entorno
dotenv.config();

async function checkInventory() {
    try {
        console.log("🔍 Verificando colección inventory en MongoDB...");

        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);

        // 1. Verificar que la colección existe
        const collections = await mongoose.connection.db.listCollections().toArray();
        const inventoryCollection = collections.find(col => col.name === 'inventories');

        if (inventoryCollection) {
            console.log("✅ Colección 'inventories' existe en MongoDB");
        } else {
            console.log("❌ Colección 'inventories' NO existe en MongoDB");
            return;
        }

        // 2. Contar documentos en la colección
        const inventoryCount = await Inventory.countDocuments();
        console.log(`📊 Total de registros en inventario: ${inventoryCount}`);

        // 3. Contar productos
        const productCount = await Product.countDocuments();
        console.log(`📦 Total de productos: ${productCount}`);

        // 4. Verificar que cada producto tiene inventario
        if (inventoryCount === productCount) {
            console.log("✅ Todos los productos tienen registro de inventario");
        } else {
            console.log(`⚠️ Advertencia: ${productCount - inventoryCount} productos sin inventario`);
        }

        // 5. Mostrar algunos registros de inventario
        console.log("\n📋 Primeros 3 registros de inventario:");
        const sampleInventory = await Inventory.find()
            .populate('product', 'name brand price')
            .limit(3)
            .lean();

        sampleInventory.forEach((inv, index) => {
            console.log(`\n${index + 1}. Producto: ${inv.product.name}`);
            console.log(`   Marca: ${inv.product.brand}`);
            console.log(`   Precio: $${inv.product.price}`);
            console.log(`   Stock actual: ${inv.currentStock}`);
            console.log(`   Stock disponible: ${inv.availableStock}`);
            console.log(`   Estado: ${inv.status}`);
            console.log(`   Necesita reabastecimiento: ${inv.needsRestock ? 'Sí' : 'No'}`);
        });

        // 6. Verificar productos con stock bajo
        const lowStockProducts = await Inventory.getLowStockProducts();
        console.log(`\n⚠️ Productos con stock bajo: ${lowStockProducts.length}`);

        // 7. Verificar productos agotados
        const outOfStockProducts = await Inventory.getOutOfStockProducts();
        console.log(`🚫 Productos agotados: ${outOfStockProducts.length}`);

        // 8. Estadísticas generales
        const stats = await Inventory.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: '$currentStock' },
                    totalReserved: { $sum: '$reservedStock' },
                    totalAvailable: { $sum: '$availableStock' },
                    totalSold: { $sum: '$totalSold' },
                    avgStock: { $avg: '$currentStock' },
                    minStock: { $min: '$currentStock' },
                    maxStock: { $max: '$currentStock' }
                }
            }
        ]);

        if (stats.length > 0) {
            const stat = stats[0];
            console.log("\n📈 Estadísticas de inventario:");
            console.log(`   Stock total: ${stat.totalStock}`);
            console.log(`   Stock reservado: ${stat.totalReserved}`);
            console.log(`   Stock disponible: ${stat.totalAvailable}`);
            console.log(`   Total vendido: ${stat.totalSold}`);
            console.log(`   Stock promedio: ${stat.avgStock.toFixed(2)}`);
            console.log(`   Stock mínimo: ${stat.minStock}`);
            console.log(`   Stock máximo: ${stat.maxStock}`);
        }

        console.log("\n🎉 Verificación completada exitosamente!");

    } catch (error) {
        console.error("❌ Error durante la verificación:", error.message);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        process.exit(0);
    }
}

// Ejecutar verificación
checkInventory();
