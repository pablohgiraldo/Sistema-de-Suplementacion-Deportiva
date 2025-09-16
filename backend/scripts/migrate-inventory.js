import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";
import { connectDB } from "../src/config/db.js";

// Cargar variables de entorno
dotenv.config();

async function migrateInventory() {
    try {
        console.log("🚀 Iniciando migración de inventario...");

        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);

        // Obtener todos los productos
        const products = await Product.find({});
        console.log(`📦 Encontrados ${products.length} productos para migrar`);

        let created = 0;
        let updated = 0;
        let errors = 0;

        for (const product of products) {
            try {
                // Verificar si ya existe un registro de inventario para este producto
                const existingInventory = await Inventory.findOne({ product: product._id });

                if (existingInventory) {
                    // Actualizar el stock actual con el stock del producto
                    existingInventory.currentStock = product.stock || 0;
                    existingInventory.availableStock = Math.max(0, existingInventory.currentStock - existingInventory.reservedStock);
                    await existingInventory.save();
                    updated++;
                    console.log(`✅ Actualizado inventario para producto: ${product.name}`);
                } else {
                    // Crear nuevo registro de inventario
                    const inventoryData = {
                        product: product._id,
                        currentStock: product.stock || 0,
                        minStock: 5, // Valor por defecto
                        maxStock: 100, // Valor por defecto
                        reservedStock: 0,
                        availableStock: product.stock || 0,
                        status: (product.stock > 0) ? 'active' : 'out_of_stock',
                        totalSold: 0
                    };

                    await Inventory.create(inventoryData);
                    created++;
                    console.log(`✅ Creado inventario para producto: ${product.name}`);
                }
            } catch (error) {
                console.error(`❌ Error procesando producto ${product.name}:`, error.message);
                errors++;
            }
        }

        console.log("\n📊 Resumen de migración:");
        console.log(`✅ Registros creados: ${created}`);
        console.log(`🔄 Registros actualizados: ${updated}`);
        console.log(`❌ Errores: ${errors}`);
        console.log(`📦 Total procesados: ${products.length}`);

        // Verificar que todos los productos tengan inventario
        const inventoryCount = await Inventory.countDocuments();
        console.log(`\n📈 Total de registros de inventario: ${inventoryCount}`);

        if (inventoryCount === products.length) {
            console.log("🎉 Migración completada exitosamente");
        } else {
            console.log("⚠️ Advertencia: No todos los productos tienen registro de inventario");
        }

    } catch (error) {
        console.error("❌ Error durante la migración:", error);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        process.exit(0);
    }
}

// Ejecutar migración
migrateInventory();
