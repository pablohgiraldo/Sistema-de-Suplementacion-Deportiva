import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';
import Cart from '../src/models/Cart.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains';

// Función para medir el tiempo de ejecución
async function measureTime(name, fn) {
    const start = Date.now();
    const result = await fn();
    const end = Date.now();
    const duration = end - start;
    console.log(`⏱️  ${name}: ${duration}ms`);
    return { result, duration };
}

// Función para explicar el plan de ejecución de una consulta
async function explainQuery(collection, query, options = {}) {
    const explanation = await collection.find(query, options).explain('executionStats');
    const executionStats = explanation.executionStats;

    console.log(`\n📊 Plan de ejecución:`);
    console.log(`  - Tiempo total: ${executionStats.executionTimeMillis}ms`);
    console.log(`  - Documentos examinados: ${executionStats.totalDocsExamined}`);
    console.log(`  - Documentos devueltos: ${executionStats.totalDocsReturned}`);
    console.log(`  - Índices utilizados: ${executionStats.totalKeysExamined}`);
    console.log(`  - Eficiencia: ${((executionStats.totalDocsReturned / executionStats.totalDocsExamined) * 100).toFixed(2)}%`);

    return explanation;
}

async function performanceTest() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        console.log('🚀 Iniciando pruebas de rendimiento...\n');

        // ===== PRUEBAS DE USUARIOS =====
        console.log('👤 PRUEBAS DE USUARIOS');
        console.log('='.repeat(50));

        // Búsqueda por email
        await measureTime('Búsqueda por email', async () => {
            await User.findOne({ email: 'admin@supergains.com' });
        });

        // Búsqueda por rol
        await measureTime('Búsqueda por rol (admin)', async () => {
            await User.find({ rol: 'admin' });
        });

        // Búsqueda de texto en nombre
        await measureTime('Búsqueda de texto en nombre', async () => {
            await User.find({ $text: { $search: 'admin' } });
        });

        // Explicar consulta por rol
        await explainQuery(User.collection, { rol: 'admin' });

        // ===== PRUEBAS DE PRODUCTOS =====
        console.log('\n🛍️ PRUEBAS DE PRODUCTOS');
        console.log('='.repeat(50));

        // Búsqueda por categoría
        await measureTime('Búsqueda por categoría (Proteínas)', async () => {
            await Product.find({ category: 'Proteínas' });
        });

        // Búsqueda por rango de precio
        await measureTime('Búsqueda por rango de precio (50-100)', async () => {
            await Product.find({ price: { $gte: 50, $lte: 100 } });
        });

        // Búsqueda por marca
        await measureTime('Búsqueda por marca', async () => {
            await Product.find({ brand: 'ESN' });
        });

        // Búsqueda de texto completo
        await measureTime('Búsqueda de texto completo', async () => {
            await Product.find({ $text: { $search: 'whey protein' } });
        });

        // Búsqueda de productos activos por categoría
        await measureTime('Productos activos por categoría', async () => {
            await Product.find({ isActive: true, category: 'Proteínas' });
        });

        // Explicar consulta por categoría
        await explainQuery(Product.collection, { category: 'Proteínas' });

        // ===== PRUEBAS DE INVENTARIO =====
        console.log('\n📦 PRUEBAS DE INVENTARIO');
        console.log('='.repeat(50));

        // Búsqueda por estado de stock
        await measureTime('Búsqueda por estado (active)', async () => {
            await Inventory.find({ status: 'active' });
        });

        // Búsqueda de productos con stock bajo
        await measureTime('Productos con stock bajo', async () => {
            await Inventory.find({ currentStock: { $lte: 10 } });
        });

        // Búsqueda de productos que necesitan reabastecimiento
        await measureTime('Productos que necesitan reabastecimiento', async () => {
            await Inventory.find({ needsRestock: true });
        });

        // Búsqueda por fecha de último reabastecimiento
        await measureTime('Últimos reabastecimientos', async () => {
            await Inventory.find({ lastRestocked: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        });

        // Explicar consulta de stock bajo
        await explainQuery(Inventory.collection, { currentStock: { $lte: 10 } });

        // ===== PRUEBAS DE CARRITO =====
        console.log('\n🛒 PRUEBAS DE CARRITO');
        console.log('='.repeat(50));

        // Búsqueda por usuario
        await measureTime('Búsqueda de carrito por usuario', async () => {
            const user = await User.findOne({ email: 'admin@supergains.com' });
            if (user) {
                await Cart.findOne({ user: user._id });
            }
        });

        // Búsqueda de carritos recientes
        await measureTime('Carritos recientes', async () => {
            await Cart.find({ updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
        });

        // ===== PRUEBAS DE AGGREGATION =====
        console.log('\n📊 PRUEBAS DE AGGREGATION');
        console.log('='.repeat(50));

        // Estadísticas de inventario
        await measureTime('Estadísticas de inventario', async () => {
            await Inventory.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalStock: { $sum: '$currentStock' },
                        avgStock: { $avg: '$currentStock' }
                    }
                }
            ]);
        });

        // Productos más vendidos
        await measureTime('Productos más vendidos', async () => {
            await Product.aggregate([
                { $match: { isActive: true } },
                { $sort: { salesCount: -1 } },
                { $limit: 10 },
                { $project: { name: 1, salesCount: 1, price: 1 } }
            ]);
        });

        // Productos por categoría
        await measureTime('Conteo de productos por categoría', async () => {
            await Product.aggregate([
                { $match: { isActive: true } },
                { $group: { _id: '$category', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
        });

        // ===== PRUEBAS DE CONSULTAS COMPLEJAS =====
        console.log('\n🔍 PRUEBAS DE CONSULTAS COMPLEJAS');
        console.log('='.repeat(50));

        // Búsqueda con múltiples filtros
        await measureTime('Búsqueda compleja de productos', async () => {
            await Product.find({
                isActive: true,
                category: 'Proteínas',
                price: { $gte: 30, $lte: 150 },
                brand: { $in: ['ESN', 'Optimum Nutrition'] }
            }).sort({ salesCount: -1 }).limit(20);
        });

        // Búsqueda de inventario con join
        await measureTime('Inventario con información de producto', async () => {
            await Inventory.find({ status: 'active' })
                .populate('product', 'name category price brand')
                .sort({ currentStock: 1 })
                .limit(50);
        });

        console.log('\n✅ Pruebas de rendimiento completadas!');

        // Mostrar estadísticas de la base de datos
        console.log('\n📈 ESTADÍSTICAS DE LA BASE DE DATOS');
        console.log('='.repeat(50));

        const stats = await mongoose.connection.db.stats();
        console.log(`📊 Tamaño de la base de datos: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📊 Tamaño de índices: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`📊 Número de colecciones: ${stats.collections}`);
        console.log(`📊 Número de documentos: ${stats.objects}`);
        console.log(`📊 Número de índices: ${stats.indexes}`);

    } catch (error) {
        console.error('❌ Error en las pruebas de rendimiento:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar las pruebas
performanceTest();
