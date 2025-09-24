import "dotenv/config";
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';
import AlertConfig from '../src/models/AlertConfig.js';

const cleanupTestProducts = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");
        console.log("🧹 Limpiando productos de prueba...\n");

        // Lista de productos de prueba a eliminar
        const testProductNames = [
            'Producto de Prueba Email',
            'Producto Test Scheduler'
        ];

        let deletedCount = 0;
        let skippedCount = 0;

        for (const productName of testProductNames) {
            console.log(`🔍 Buscando: ${productName}`);

            const product = await Product.findOne({ name: productName });

            if (product) {
                console.log(`   📦 Producto encontrado: ${product.name} (${product._id})`);

                // Eliminar inventario relacionado
                const inventory = await Inventory.findOne({ product: product._id });
                if (inventory) {
                    await Inventory.findByIdAndDelete(inventory._id);
                    console.log(`   🗑️ Inventario eliminado`);
                }

                // Eliminar configuración de alertas relacionada
                const alertConfig = await AlertConfig.findOne({ product: product._id });
                if (alertConfig) {
                    await AlertConfig.findByIdAndDelete(alertConfig._id);
                    console.log(`   🗑️ Configuración de alertas eliminada`);
                }

                // Eliminar el producto
                await Product.findByIdAndDelete(product._id);
                console.log(`   ✅ Producto eliminado: ${product.name}`);
                deletedCount++;
            } else {
                console.log(`   ⏭️ Producto no encontrado: ${productName}`);
                skippedCount++;
            }
        }

        // Verificar si hay otros productos de prueba
        console.log("\n🔍 Verificando otros productos de prueba...");
        const allProducts = await Product.find({});
        const testProducts = allProducts.filter(p =>
            p.name.toLowerCase().includes('test') ||
            p.name.toLowerCase().includes('prueba') ||
            p.brand.toLowerCase().includes('test')
        );

        if (testProducts.length > 0) {
            console.log(`   📋 Productos adicionales de prueba encontrados:`);
            testProducts.forEach(p => {
                console.log(`      - ${p.name} (${p.brand})`);
            });

            console.log(`\n❓ ¿Deseas eliminar estos productos también?`);
            console.log(`   Ejecuta el script con --force para eliminarlos automáticamente`);
        }

        console.log("\n📊 Resumen de limpieza:");
        console.log(`   ✅ Productos eliminados: ${deletedCount}`);
        console.log(`   ⏭️ Productos no encontrados: ${skippedCount}`);
        console.log(`   📋 Productos adicionales de prueba: ${testProducts.length}`);

        // Mostrar productos restantes
        const remainingProducts = await Product.find({});
        console.log(`\n📦 Productos restantes en la base de datos: ${remainingProducts.length}`);
        remainingProducts.forEach(p => {
            console.log(`   - ${p.name} (${p.brand})`);
        });

        console.log("\n🎉 Limpieza completada exitosamente!");

    } catch (error) {
        console.error("❌ Error durante la limpieza:", error);
    } finally {
        mongoose.connection.close();
        console.log("\n🏁 Proceso completado");
    }
};

// Verificar si se pasó el flag --force
const args = process.argv.slice(2);
const forceDelete = args.includes('--force');

if (forceDelete) {
    console.log("⚠️ Modo FORCE activado - Eliminando todos los productos de prueba");
}

cleanupTestProducts();
