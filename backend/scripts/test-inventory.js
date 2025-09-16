import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../src/models/Product.js";
import Inventory from "../src/models/Inventory.js";
import { connectDB } from "../src/config/db.js";

// Cargar variables de entorno
dotenv.config();

async function testInventory() {
    try {
        console.log("🧪 Iniciando pruebas del modelo Inventory...");

        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);

        // Limpiar datos de prueba anteriores
        await Inventory.deleteMany({});
        console.log("🧹 Datos de prueba anteriores eliminados");

        // Crear un producto de prueba
        const testProduct = await Product.create({
            name: "Proteína Whey Test",
            brand: "TestBrand",
            price: 29.99,
            stock: 50,
            description: "Producto de prueba para inventario",
            categories: ["proteína", "suplementos"]
        });
        console.log("✅ Producto de prueba creado:", testProduct.name);

        // Test 1: Crear registro de inventario
        console.log("\n📝 Test 1: Crear registro de inventario");
        const inventory = await Inventory.create({
            product: testProduct._id,
            currentStock: 50,
            minStock: 10,
            maxStock: 100,
            status: 'active'
        });
        console.log("✅ Inventario creado:", inventory._id);
        console.log("📊 Stock disponible:", inventory.availableStock);
        console.log("📊 Estado del stock:", inventory.stockStatus);

        // Test 2: Reservar stock
        console.log("\n📝 Test 2: Reservar stock");
        await inventory.reserveStock(5);
        console.log("✅ Stock reservado: 5 unidades");
        console.log("📊 Stock disponible después de reserva:", inventory.availableStock);
        console.log("📊 Stock reservado:", inventory.reservedStock);

        // Test 3: Vender stock
        console.log("\n📝 Test 3: Vender stock");
        await inventory.sellStock(3);
        console.log("✅ Stock vendido: 3 unidades");
        console.log("📊 Stock actual:", inventory.currentStock);
        console.log("📊 Stock disponible:", inventory.availableStock);
        console.log("📊 Total vendido:", inventory.totalSold);

        // Test 4: Reabastecer stock
        console.log("\n📝 Test 4: Reabastecer stock");
        await inventory.restock(20, "Reabastecimiento de prueba");
        console.log("✅ Stock reabastecido: 20 unidades");
        console.log("📊 Stock actual:", inventory.currentStock);
        console.log("📊 Stock disponible:", inventory.availableStock);

        // Test 5: Verificar métodos estáticos
        console.log("\n📝 Test 5: Métodos estáticos");

        // Crear más productos para probar métodos estáticos
        const product2 = await Product.create({
            name: "Creatina Test",
            brand: "TestBrand",
            price: 19.99,
            stock: 0,
            description: "Producto agotado de prueba",
            categories: ["creatina", "suplementos"]
        });

        const product3 = await Product.create({
            name: "BCAA Test",
            brand: "TestBrand",
            price: 24.99,
            stock: 3,
            description: "Producto con stock bajo de prueba",
            categories: ["aminoácidos", "suplementos"]
        });

        // Crear inventarios para estos productos
        await Inventory.create({
            product: product2._id,
            currentStock: 0,
            minStock: 5,
            maxStock: 50,
            status: 'out_of_stock'
        });

        await Inventory.create({
            product: product3._id,
            currentStock: 3,
            minStock: 10,
            maxStock: 50,
            status: 'active'
        });

        // Probar métodos estáticos
        const lowStockProducts = await Inventory.getLowStockProducts();
        console.log("📊 Productos con stock bajo:", lowStockProducts.length);

        const outOfStockProducts = await Inventory.getOutOfStockProducts();
        console.log("📊 Productos agotados:", outOfStockProducts.length);

        // Test 6: Validaciones
        console.log("\n📝 Test 6: Validaciones");

        try {
            // Intentar vender más stock del disponible
            await inventory.sellStock(1000);
        } catch (error) {
            console.log("✅ Validación de stock insuficiente funciona:", error.message);
        }

        try {
            // Intentar reservar más stock del disponible
            await inventory.reserveStock(1000);
        } catch (error) {
            console.log("✅ Validación de reserva de stock funciona:", error.message);
        }

        // Test 7: Virtuals
        console.log("\n📝 Test 7: Propiedades virtuales");
        console.log("📊 Necesita reabastecimiento:", inventory.needsRestock);
        console.log("📊 Está disponible:", inventory.isAvailable);
        console.log("📊 Estado del stock:", inventory.stockStatus);

        console.log("\n🎉 Todas las pruebas completadas exitosamente!");

    } catch (error) {
        console.error("❌ Error durante las pruebas:", error);
    } finally {
        // Limpiar datos de prueba
        try {
            await Inventory.deleteMany({});
            await Product.deleteMany({ name: { $regex: /Test$/ } });
            console.log("🧹 Datos de prueba eliminados");
        } catch (cleanupError) {
            console.error("⚠️ Error limpiando datos de prueba:", cleanupError.message);
        }

        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        process.exit(0);
    }
}

// Ejecutar pruebas
testInventory();
