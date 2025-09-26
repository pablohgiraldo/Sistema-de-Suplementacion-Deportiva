import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';
import dotenv from 'dotenv';

dotenv.config();

async function addStockToProducts() {
    try {
        console.log("📦 Agregando stock a productos existentes...");

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        // Obtener productos existentes
        const products = await Product.find({}).limit(5);
        console.log(`📋 Encontrados ${products.length} productos`);

        for (const product of products) {
            // Buscar o crear inventario para el producto
            let inventory = await Inventory.findOne({ product: product._id });

            if (!inventory) {
                inventory = new Inventory({
                    product: product._id,
                    totalStock: 100,
                    availableStock: 100,
                    reservedStock: 0,
                    minStockThreshold: 10
                });
                await inventory.save();
                console.log(`✅ Inventario creado para: ${product.name}`);
            } else {
                // Actualizar stock existente
                inventory.totalStock = 100;
                inventory.availableStock = 100;
                inventory.reservedStock = 0;
                await inventory.save();
                console.log(`✅ Stock actualizado para: ${product.name}`);
            }
        }

        console.log("\n🎉 Stock agregado exitosamente a todos los productos");

    } catch (error) {
        console.error("❌ Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Desconectado de MongoDB");
    }
}

addStockToProducts();
