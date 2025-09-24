import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Inventory from '../src/models/Inventory.js';
import Cart from '../src/models/Cart.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/supergains';

async function cleanupIndexes() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        console.log('🧹 Limpiando índices duplicados...\n');

        // ===== LIMPIAR ÍNDICES DE USUARIOS =====
        console.log('👤 Limpiando índices de Users...');

        // Eliminar índices duplicados de email
        try {
            await User.collection.dropIndex('email_1');
            console.log('  ✓ Eliminado índice duplicado email_1');
        } catch (error) {
            console.log('  ⚠️ Índice email_1 no encontrado o ya eliminado');
        }

        // ===== LIMPIAR ÍNDICES DE PRODUCTOS =====
        console.log('\n🛍️ Limpiando índices de Products...');

        // Eliminar índice de texto duplicado
        try {
            await Product.collection.dropIndex('name_text_description_text');
            console.log('  ✓ Eliminado índice de texto duplicado');
        } catch (error) {
            console.log('  ⚠️ Índice de texto duplicado no encontrado');
        }

        // ===== LIMPIAR ÍNDICES DE INVENTARIO =====
        console.log('\n📦 Limpiando índices de Inventory...');

        // Eliminar índices duplicados de product
        try {
            await Inventory.collection.dropIndex('product_1');
            console.log('  ✓ Eliminado índice duplicado product_1');
        } catch (error) {
            console.log('  ⚠️ Índice product_1 no encontrado o ya eliminado');
        }

        // ===== LIMPIAR ÍNDICES DE CARRITO =====
        console.log('\n🛒 Limpiando índices de Cart...');

        // Eliminar índices duplicados de user
        try {
            await Cart.collection.dropIndex('user_1');
            console.log('  ✓ Eliminado índice duplicado user_1');
        } catch (error) {
            console.log('  ⚠️ Índice user_1 no encontrado o ya eliminado');
        }

        console.log('\n✅ Limpieza de índices completada!');

        // Mostrar índices actuales
        console.log('\n📊 Índices actuales:');

        const collections = [
            { name: 'users', model: User },
            { name: 'products', model: Product },
            { name: 'inventories', model: Inventory },
            { name: 'carts', model: Cart }
        ];

        for (const collection of collections) {
            const indexes = await collection.model.collection.indexes();
            console.log(`\n${collection.name.toUpperCase()}:`);
            indexes.forEach(index => {
                const keys = Object.keys(index.key).join(', ');
                const unique = index.unique ? ' (UNIQUE)' : '';
                const sparse = index.sparse ? ' (SPARSE)' : '';
                console.log(`  - ${index.name}: ${keys}${unique}${sparse}`);
            });
        }

    } catch (error) {
        console.error('❌ Error limpiando índices:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

// Ejecutar el script
cleanupIndexes();
