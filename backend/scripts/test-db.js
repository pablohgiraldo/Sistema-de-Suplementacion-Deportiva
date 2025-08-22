import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/models/Product.js";

// Cargar variables de entorno
dotenv.config();

// Función para conectar a la base de datos
async function connectDB() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI no está definida en las variables de entorno");
        }

        await mongoose.connect(uri);
        console.log("✅ Conectado a MongoDB");
        return true;
    } catch (error) {
        console.error("❌ Error conectando a MongoDB:", error.message);
        return false;
    }
}

// Función para limpiar la base de datos
async function clearDatabase() {
    try {
        await Product.deleteMany({});
        console.log("🧹 Base de datos limpiada");
    } catch (error) {
        console.error("❌ Error limpiando base de datos:", error.message);
    }
}

// Función para insertar productos de prueba
async function insertTestProducts() {
    try {
        const testProducts = [
            {
                name: "Proteína Whey Gold Standard",
                brand: "Optimum Nutrition",
                price: 89.99,
                stock: 50,
                imageUrl: "https://example.com/whey-protein.jpg",
                description: "Proteína de suero de leche de alta calidad para construcción muscular",
                categories: ["Proteínas", "Suplementos", "Musculación"]
            },
            {
                name: "Creatina Monohidratada",
                brand: "MyProtein",
                price: 24.99,
                stock: 100,
                imageUrl: "https://example.com/creatine.jpg",
                description: "Creatina pura para aumentar fuerza y potencia muscular",
                categories: ["Creatina", "Suplementos", "Fuerza"]
            },
            {
                name: "BCAA Aminoácidos",
                brand: "BSN",
                price: 34.99,
                stock: 75,
                imageUrl: "https://example.com/bcaa.jpg",
                description: "Aminoácidos ramificados para recuperación muscular",
                categories: ["Aminoácidos", "Recuperación", "Suplementos"]
            },
            {
                name: "Pre-Workout Explosive",
                brand: "MuscleTech",
                price: 44.99,
                stock: 30,
                imageUrl: "https://example.com/preworkout.jpg",
                description: "Pre-entrenamiento para máxima energía y enfoque",
                categories: ["Pre-Workout", "Energía", "Suplementos"]
            },
            {
                name: "Omega-3 Fish Oil",
                brand: "Now Foods",
                price: 19.99,
                stock: 200,
                imageUrl: "https://example.com/omega3.jpg",
                description: "Aceite de pescado rico en ácidos grasos esenciales",
                categories: ["Vitaminas", "Salud", "Omega-3"]
            }
        ];

        const insertedProducts = await Product.insertMany(testProducts);
        console.log(`✅ ${insertedProducts.length} productos insertados exitosamente`);

        return insertedProducts;
    } catch (error) {
        console.error("❌ Error insertando productos:", error.message);
        return [];
    }
}

// Función para consultar productos
async function queryProducts() {
    try {
        console.log("\n🔍 CONSULTAS DE PRUEBA:");

        // 1. Obtener todos los productos
        const allProducts = await Product.find();
        console.log(`\n1. Total de productos: ${allProducts.length}`);

        // 2. Buscar por categoría
        const proteinProducts = await Product.find({ categories: "Proteínas" });
        console.log(`2. Productos de proteínas: ${proteinProducts.length}`);

        // 3. Buscar por precio (menos de $50)
        const affordableProducts = await Product.find({ price: { $lt: 50 } });
        console.log(`3. Productos menos de $50: ${affordableProducts.length}`);

        // 4. Buscar por nombre (búsqueda parcial)
        const searchResults = await Product.find({
            name: { $regex: "proteína", $options: 'i' }
        });
        console.log(`4. Productos con 'proteína' en el nombre: ${searchResults.length}`);

        // 5. Obtener estadísticas
        const stats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: 1 },
                    avgPrice: { $avg: "$price" },
                    totalStock: { $sum: "$stock" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" }
                }
            }
        ]);

        if (stats.length > 0) {
            const stat = stats[0];
            console.log(`\n5. ESTADÍSTICAS:`);
            console.log(`   - Total productos: ${stat.totalProducts}`);
            console.log(`   - Precio promedio: $${stat.avgPrice.toFixed(2)}`);
            console.log(`   - Stock total: ${stat.totalStock}`);
            console.log(`   - Rango de precios: $${stat.minPrice} - $${stat.maxPrice}`);
        }

    } catch (error) {
        console.error("❌ Error en consultas:", error.message);
    }
}

// Función principal
async function runTests() {
    console.log("🧪 INICIANDO PRUEBAS DE BASE DE DATOS\n");

    // Conectar a la base de datos
    const connected = await connectDB();
    if (!connected) {
        process.exit(1);
    }

    try {
        // Limpiar base de datos
        await clearDatabase();

        // Insertar productos de prueba
        await insertTestProducts();

        // Realizar consultas de prueba
        await queryProducts();

        console.log("\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE");

    } catch (error) {
        console.error("\n❌ ERROR EN LAS PRUEBAS:", error.message);
    } finally {
        // Cerrar conexión
        await mongoose.connection.close();
        console.log("\n🔌 Conexión a MongoDB cerrada");
        process.exit(0);
    }
}

// Ejecutar pruebas
runTests();
