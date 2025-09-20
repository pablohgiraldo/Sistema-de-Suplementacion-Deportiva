import "dotenv/config";
import mongoose from "mongoose";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";

// Datos de productos de ejemplo
const sampleProducts = [
    {
        name: "Whey Protein 2lb",
        brand: "SuperGains",
        price: 149900,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop",
        description: "Proteína de suero para recuperación muscular. Ideal para post-entrenamiento.",
        categories: ["proteina", "whey"]
    },
    {
        name: "Creatina 300g",
        brand: "SuperGains",
        price: 89900,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
        description: "Creatina monohidratada para fuerza y rendimiento. Aumenta la masa muscular.",
        categories: ["creatina", "fuerza"]
    },
    {
        name: "BCAA 200g",
        brand: "SuperGains",
        price: 69900,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
        description: "Aminoácidos de cadena ramificada. Reduce la fatiga muscular.",
        categories: ["aminoacidos", "recuperacion"]
    },
    {
        name: "Pre-Workout 300g",
        brand: "SuperGains",
        price: 129900,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
        description: "Suplemento pre-entrenamiento para mayor energía y rendimiento.",
        categories: ["pre-workout", "energia"]
    },
    {
        name: "Multivitamínico 120 caps",
        brand: "SuperGains",
        price: 79900,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
        description: "Complejo vitamínico completo para el bienestar general.",
        categories: ["vitaminas", "salud"]
    },
    {
        name: "Omega-3 60 caps",
        brand: "SuperGains",
        price: 59900,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop",
        description: "Ácidos grasos omega-3 para la salud cardiovascular.",
        categories: ["omega3", "salud"]
    },
    {
        name: "Proteína Vegana 1kg",
        brand: "SuperGains",
        price: 179900,
        imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=300&h=300&fit=crop",
        description: "Proteína vegetal de alta calidad para atletas veganos.",
        categories: ["proteina", "vegano"]
    },
    {
        name: "Glutamina 500g",
        brand: "SuperGains",
        price: 99900,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
        description: "Glutamina para recuperación muscular y sistema inmunológico.",
        categories: ["glutamina", "recuperacion"]
    }
];

// Datos de inventario de ejemplo
const sampleInventory = [
    { currentStock: 25, minStock: 5, maxStock: 50, status: 'active' },
    { currentStock: 40, minStock: 10, maxStock: 100, status: 'active' },
    { currentStock: 3, minStock: 5, maxStock: 30, status: 'active' }, // Stock bajo
    { currentStock: 0, minStock: 5, maxStock: 25, status: 'out_of_stock' }, // Agotado
    { currentStock: 15, minStock: 8, maxStock: 40, status: 'active' },
    { currentStock: 12, minStock: 5, maxStock: 30, status: 'active' },
    { currentStock: 8, minStock: 10, maxStock: 50, status: 'active' },
    { currentStock: 2, minStock: 5, maxStock: 25, status: 'active' } // Stock bajo
];

async function seedInventory() {
    try {
        console.log("🌱 Iniciando seed de inventario...");

        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        // Limpiar datos existentes
        await Product.deleteMany({});
        await Inventory.deleteMany({});
        console.log("🧹 Datos existentes eliminados");

        // Crear productos
        const createdProducts = [];
        for (let i = 0; i < sampleProducts.length; i++) {
            const product = new Product(sampleProducts[i]);
            const savedProduct = await product.save();
            createdProducts.push(savedProduct);
            console.log(`📦 Producto creado: ${savedProduct.name}`);
        }

        // Crear inventario para cada producto
        for (let i = 0; i < createdProducts.length; i++) {
            const product = createdProducts[i];
            const inventoryData = sampleInventory[i];

            const inventory = new Inventory({
                product: product._id,
                currentStock: inventoryData.currentStock,
                minStock: inventoryData.minStock,
                maxStock: inventoryData.maxStock,
                reservedStock: Math.floor(Math.random() * 3), // Stock reservado aleatorio
                status: inventoryData.status,
                totalSold: Math.floor(Math.random() * 50) + 10, // Ventas aleatorias
                lastRestocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Último reabastecimiento aleatorio
                lastSold: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Última venta aleatoria
                notes: inventoryData.currentStock <= inventoryData.minStock ? 'Necesita reabastecimiento urgente' : ''
            });

            await inventory.save();
            console.log(`📊 Inventario creado para: ${product.name} (Stock: ${inventoryData.currentStock})`);
        }

        console.log("✅ Seed de inventario completado exitosamente");
        console.log(`📈 Resumen:`);
        console.log(`   - Productos creados: ${createdProducts.length}`);
        console.log(`   - Registros de inventario: ${createdProducts.length}`);
        console.log(`   - Productos con stock bajo: ${sampleInventory.filter(i => i.currentStock <= i.minStock).length}`);
        console.log(`   - Productos agotados: ${sampleInventory.filter(i => i.currentStock === 0).length}`);

    } catch (error) {
        console.error("❌ Error en seed de inventario:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Desconectado de MongoDB");
    }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    seedInventory();
}

export default seedInventory;
