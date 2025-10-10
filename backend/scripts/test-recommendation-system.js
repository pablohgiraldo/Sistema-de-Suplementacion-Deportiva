/**
 * Script de prueba del sistema de recomendaciones
 * Verifica que los algoritmos de filtrado colaborativo funcionen correctamente
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import recommendationService from '../src/services/recommendationService.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';

dotenv.config();

/**
 * Prueba el sistema de recomendaciones
 */
async function testRecommendationSystem() {
    try {
        console.log('\n🧪 PRUEBA DEL SISTEMA DE RECOMENDACIONES\n');
        console.log('='.repeat(60));
        
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);
        
        // 1. Obtener estadísticas del sistema
        console.log('\n📊 1. ESTADÍSTICAS DEL SISTEMA');
        console.log('-'.repeat(60));
        const stats = await recommendationService.getRecommendationStats();
        console.log('Total de productos:', stats.totalProducts);
        console.log('Total de órdenes:', stats.totalOrders);
        console.log('Total de usuarios:', stats.totalUsers);
        console.log('Promedio de items por orden:', stats.avgItemsPerOrder);
        console.log('Promedio de co-ocurrencias por producto:', stats.avgCoOccurrences);
        console.log('Tamaño de la matriz:', stats.matrixSize);
        
        // 2. Probar productos populares
        console.log('\n🔥 2. PRODUCTOS POPULARES (Top 5)');
        console.log('-'.repeat(60));
        const popularProducts = await recommendationService.getPopularProducts(5);
        
        if (popularProducts.length > 0) {
            popularProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name}`);
                console.log(`   Marca: ${product.brand}`);
                console.log(`   Precio: $${product.price.toLocaleString('es-CO')}`);
                console.log(`   Score: ${product.recommendationScore}`);
                console.log(`   Razón: ${product.recommendationReason}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No hay productos populares disponibles');
        }
        
        // 3. Probar recomendaciones basadas en un producto
        console.log('\n🎯 3. PRODUCTOS SIMILARES (Item-based)');
        console.log('-'.repeat(60));
        
        // Buscar un producto con el que probar
        const testProduct = await Product.findOne({ categories: 'Proteína' });
        
        if (testProduct) {
            console.log(`Producto base: ${testProduct.name}\n`);
            
            const similarProducts = await recommendationService.getItemBasedRecommendations(
                testProduct._id,
                5
            );
            
            if (similarProducts.length > 0) {
                similarProducts.forEach((rec, index) => {
                    console.log(`${index + 1}. ${rec.product.name}`);
                    console.log(`   Marca: ${rec.product.brand}`);
                    console.log(`   Precio: $${rec.product.price.toLocaleString('es-CO')}`);
                    console.log(`   Score: ${rec.score}`);
                    console.log(`   Razón: ${rec.reason}`);
                    console.log('');
                });
            } else {
                console.log('⚠️  No hay productos similares disponibles');
            }
        } else {
            console.log('⚠️  No se encontró un producto de prueba');
        }
        
        // 4. Probar recomendaciones para un usuario
        console.log('\n👤 4. RECOMENDACIONES PERSONALIZADAS');
        console.log('-'.repeat(60));
        
        // Buscar un usuario con historial de compras
        const userWithOrders = await Order.findOne({ 
            status: { $in: ['delivered'] } 
        }).select('user').lean();
        
        if (userWithOrders) {
            const user = await User.findById(userWithOrders.user);
            console.log(`Usuario: ${user.nombre}`);
            console.log(`Email: ${user.email}\n`);
            
            const userRecommendations = await recommendationService.getUserBasedRecommendations(
                userWithOrders.user,
                5
            );
            
            if (userRecommendations.length > 0) {
                userRecommendations.forEach((product, index) => {
                    console.log(`${index + 1}. ${product.name}`);
                    console.log(`   Marca: ${product.brand}`);
                    console.log(`   Precio: $${product.price.toLocaleString('es-CO')}`);
                    console.log(`   Score: ${product.recommendationScore}`);
                    console.log(`   Razón: ${product.recommendationReason}`);
                    console.log('');
                });
            } else {
                console.log('⚠️  No hay recomendaciones personalizadas disponibles');
            }
        } else {
            console.log('⚠️  No se encontró un usuario con historial de compras');
        }
        
        // 5. Probar recomendaciones por categoría
        console.log('\n📂 5. RECOMENDACIONES POR CATEGORÍA');
        console.log('-'.repeat(60));
        const categories = ['Proteína', 'Creatina', 'Vitaminas'];
        
        for (const category of categories) {
            const categoryRecs = await recommendationService.getRecommendationsByCategory(category, 3);
            console.log(`\n${category} (Top 3):`);
            
            if (categoryRecs.length > 0) {
                categoryRecs.forEach((product, index) => {
                    console.log(`  ${index + 1}. ${product.name} - $${product.price.toLocaleString('es-CO')}`);
                });
            } else {
                console.log(`  ⚠️  No hay productos en ${category}`);
            }
        }
        
        // 6. Probar recomendaciones híbridas
        console.log('\n\n🎭 6. RECOMENDACIONES HÍBRIDAS');
        console.log('-'.repeat(60));
        
        if (userWithOrders) {
            const hybridRecs = await recommendationService.getHybridRecommendations(
                userWithOrders.user,
                { limit: 3 }
            );
            
            console.log('\nPersonalizadas:');
            if (hybridRecs.personalized.length > 0) {
                hybridRecs.personalized.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.name} - Score: ${p.recommendationScore}`);
                });
            } else {
                console.log('  Ninguna disponible');
            }
            
            console.log('\nPopulares:');
            if (hybridRecs.popular.length > 0) {
                hybridRecs.popular.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.name}`);
                });
            } else {
                console.log('  Ninguna disponible');
            }
            
            console.log('\nBasadas en segmento:');
            if (hybridRecs.segment.length > 0) {
                hybridRecs.segment.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.name}`);
                });
            } else {
                console.log('  Ninguna disponible');
            }
            
            console.log('\nProductos similares:');
            if (hybridRecs.similar.length > 0) {
                hybridRecs.similar.forEach((p, i) => {
                    console.log(`  ${i + 1}. ${p.name} - Score: ${p.recommendationScore}`);
                });
            } else {
                console.log('  Ninguna disponible');
            }
        }
        
        // 7. Análisis de patrones de co-ocurrencia
        console.log('\n\n🔗 7. PATRONES DE CO-OCURRENCIA');
        console.log('-'.repeat(60));
        
        const coOccurrencePatterns = await Order.aggregate([
            { $match: { 'items.1': { $exists: true } } }, // Solo órdenes con 2+ items
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'productData'
                }
            },
            { $unwind: '$productData' },
            {
                $group: {
                    _id: '$_id',
                    categories: { $addToSet: { $arrayElemAt: ['$productData.categories', 0] } }
                }
            }
        ]);
        
        // Contar pares de categorías
        const categoryPairs = {};
        for (const order of await Order.find({ 'items.1': { $exists: true } }).populate('items.product')) {
            const categories = [...new Set(order.items.map(item => item.product?.categories[0]).filter(Boolean))];
            
            for (let i = 0; i < categories.length; i++) {
                for (let j = i + 1; j < categories.length; j++) {
                    const pair = [categories[i], categories[j]].sort().join(' + ');
                    categoryPairs[pair] = (categoryPairs[pair] || 0) + 1;
                }
            }
        }
        
        const topPairs = Object.entries(categoryPairs)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);
        
        console.log('\nTop 5 pares de categorías compradas juntas:');
        topPairs.forEach(([pair, count], index) => {
            console.log(`  ${index + 1}. ${pair}: ${count} veces`);
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ Prueba completada exitosamente\n');
        
        // Cerrar conexión
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar
testRecommendationSystem();

