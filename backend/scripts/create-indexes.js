import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';
import Cart from '../src/models/Cart.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains';

async function createIndexes() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        console.log('\n📊 Creando índices para optimización de rendimiento...\n');

        // ===== ÍNDICES PARA USUARIOS =====
        console.log('👤 Creando índices para Users...');

        // Índice único para email (ya existe, pero lo verificamos)
        try {
            await User.collection.createIndex({ email: 1 }, { unique: true });
            console.log('  ✓ Índice único en email');
        } catch (error) {
            if (error.code === 85) {
                console.log('  ⚠️ Índice único en email ya existe');
            } else {
                throw error;
            }
        }

        // Índice para búsquedas por rol
        try {
            await User.collection.createIndex({ rol: 1 });
            console.log('  ✓ Índice en rol');
        } catch (error) {
            if (error.code === 85) {
                console.log('  ⚠️ Índice en rol ya existe');
            } else {
                throw error;
            }
        }

        // Índice compuesto para búsquedas de admin
        try {
            await User.collection.createIndex({ rol: 1, createdAt: -1 });
            console.log('  ✓ Índice compuesto rol + createdAt');
        } catch (error) {
            if (error.code === 85) {
                console.log('  ⚠️ Índice compuesto rol + createdAt ya existe');
            } else {
                throw error;
            }
        }

        // Índice para búsquedas por nombre
        try {
            await User.collection.createIndex({ nombre: 'text' });
            console.log('  ✓ Índice de texto en nombre');
        } catch (error) {
            if (error.code === 85) {
                console.log('  ⚠️ Índice de texto en nombre ya existe');
            } else {
                throw error;
            }
        }

        // ===== ÍNDICES PARA PRODUCTOS =====
        console.log('\n🛍️ Creando índices para Products...');

        // Índice único para nombre (ya existe, pero lo verificamos)
        await Product.collection.createIndex({ name: 1 }, { unique: true });
        console.log('  ✓ Índice único en name');

        // Índice para búsquedas por categoría
        await Product.collection.createIndex({ category: 1 });
        console.log('  ✓ Índice en category');

        // Índice para filtros de precio
        await Product.collection.createIndex({ price: 1 });
        console.log('  ✓ Índice en price');

        // Índice para búsquedas por marca
        await Product.collection.createIndex({ brand: 1 });
        console.log('  ✓ Índice en brand');

        // Índice compuesto para búsquedas por categoría y precio
        await Product.collection.createIndex({ category: 1, price: 1 });
        console.log('  ✓ Índice compuesto category + price');

        // Índice de texto para búsquedas full-text (verificar si ya existe)
        try {
            await Product.collection.createIndex({
                name: 'text',
                description: 'text',
                brand: 'text',
                category: 'text'
            });
            console.log('  ✓ Índice de texto completo');
        } catch (error) {
            if (error.code === 85) { // IndexOptionsConflict
                console.log('  ⚠️ Índice de texto ya existe con configuración diferente');
            } else {
                throw error;
            }
        }

        // Índice para productos activos
        await Product.collection.createIndex({ isActive: 1 });
        console.log('  ✓ Índice en isActive');

        // Índice compuesto para productos activos por categoría
        await Product.collection.createIndex({ isActive: 1, category: 1 });
        console.log('  ✓ Índice compuesto isActive + category');

        // ===== ÍNDICES PARA INVENTARIO =====
        console.log('\n📦 Creando índices para Inventory...');

        // Índice único para producto (verificar si ya existe)
        try {
            await Inventory.collection.createIndex({ product: 1 }, { unique: true });
            console.log('  ✓ Índice único en product');
        } catch (error) {
            if (error.code === 86) { // IndexKeySpecsConflict
                console.log('  ⚠️ Índice product ya existe con configuración diferente');
            } else {
                throw error;
            }
        }

        // Índice para búsquedas por estado de stock
        await Inventory.collection.createIndex({ status: 1 });
        console.log('  ✓ Índice en status');

        // Índice para productos con stock bajo
        await Inventory.collection.createIndex({ currentStock: 1 });
        console.log('  ✓ Índice en currentStock');

        // Índice para productos que necesitan reabastecimiento
        await Inventory.collection.createIndex({ needsRestock: 1 });
        console.log('  ✓ Índice en needsRestock');

        // Índice compuesto para alertas de stock
        await Inventory.collection.createIndex({
            status: 1,
            currentStock: 1
        });
        console.log('  ✓ Índice compuesto status + currentStock');

        // Índice para búsquedas por fecha de último reabastecimiento
        await Inventory.collection.createIndex({ lastRestocked: -1 });
        console.log('  ✓ Índice en lastRestocked (descendente)');

        // Índice compuesto para estadísticas de inventario
        await Inventory.collection.createIndex({
            status: 1,
            currentStock: 1,
            availableStock: 1
        });
        console.log('  ✓ Índice compuesto para estadísticas');

        // ===== ÍNDICES PARA CARRITO =====
        console.log('\n🛒 Creando índices para Cart...');

        // Índice único para usuario (ya existe, pero lo verificamos)
        await Cart.collection.createIndex({ user: 1 }, { unique: true });
        console.log('  ✓ Índice único en user');

        // Índice para búsquedas por fecha de creación
        await Cart.collection.createIndex({ createdAt: -1 });
        console.log('  ✓ Índice en createdAt (descendente)');

        // Índice para búsquedas por fecha de actualización
        await Cart.collection.createIndex({ updatedAt: -1 });
        console.log('  ✓ Índice en updatedAt (descendente)');

        // Índice compuesto para carritos activos
        await Cart.collection.createIndex({
            user: 1,
            updatedAt: -1
        });
        console.log('  ✓ Índice compuesto user + updatedAt');

        // ===== ÍNDICES ADICIONALES PARA OPTIMIZACIÓN =====
        console.log('\n⚡ Creando índices adicionales para optimización...');

        // Índice para consultas de productos populares (por número de ventas)
        await Product.collection.createIndex({ salesCount: -1 });
        console.log('  ✓ Índice en salesCount (descendente)');

        // Índice para consultas de productos recientes
        await Product.collection.createIndex({ createdAt: -1 });
        console.log('  ✓ Índice en createdAt (descendente)');

        // Índice para consultas de productos actualizados
        await Product.collection.createIndex({ updatedAt: -1 });
        console.log('  ✓ Índice en updatedAt (descendente)');

        // Índice compuesto para productos destacados
        await Product.collection.createIndex({
            isActive: 1,
            salesCount: -1,
            createdAt: -1
        });
        console.log('  ✓ Índice compuesto para productos destacados');

        console.log('\n✅ Todos los índices han sido creados exitosamente!');

        // Mostrar estadísticas de índices
        console.log('\n📈 Estadísticas de índices:');

        const collections = ['users', 'products', 'inventories', 'carts'];
        for (const collection of collections) {
            const indexes = await mongoose.connection.db.collection(collection).indexes();
            console.log(`\n${collection.toUpperCase()}:`);
            indexes.forEach(index => {
                const keys = Object.keys(index.key).join(', ');
                const unique = index.unique ? ' (UNIQUE)' : '';
                const sparse = index.sparse ? ' (SPARSE)' : '';
                console.log(`  - ${keys}${unique}${sparse}`);
            });
        }

    } catch (error) {
        console.error('❌ Error creando índices:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar el script
createIndexes();
