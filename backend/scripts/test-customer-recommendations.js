/**
 * Script de prueba para recomendaciones basadas en Customer (CRM)
 * Prueba el endpoint /api/recommendations/:customerId
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import recommendationService from '../src/services/recommendationService.js';
import Customer from '../src/models/Customer.js';

dotenv.config();

/**
 * Prueba las recomendaciones para customers
 */
async function testCustomerRecommendations() {
    try {
        console.log('\n🧪 PRUEBA DE RECOMENDACIONES POR CUSTOMER (CRM)\n');
        console.log('='.repeat(60));
        
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);
        
        // Buscar customers con diferentes perfiles
        const customers = await Customer.find({})
            .populate('user')
            .sort({ 'metrics.totalSpent': -1 })
            .limit(3)
            .lean();
        
        if (customers.length === 0) {
            console.log('⚠️  No hay customers en la base de datos');
            console.log('Ejecuta primero: npm run generate-recommendation-dataset');
            await mongoose.connection.close();
            process.exit(0);
        }
        
        console.log(`\n✅ Encontrados ${customers.length} customers para probar\n`);
        
        // Probar recomendaciones para cada customer
        for (let i = 0; i < customers.length; i++) {
            const customer = customers[i];
            
            console.log(`\n${'='.repeat(60)}`);
            console.log(`\n📊 CUSTOMER ${i + 1}: ${customer.user?.nombre || 'Sin nombre'}`);
            console.log(`${'─'.repeat(60)}`);
            console.log(`ID: ${customer._id}`);
            console.log(`Email: ${customer.user?.email || 'N/A'}`);
            console.log(`Segmento: ${customer.segment || 'N/A'}`);
            console.log(`Nivel de Lealtad: ${customer.loyalty?.level || 'N/A'}`);
            console.log(`Total Órdenes: ${customer.metrics?.totalOrders || 0}`);
            console.log(`Total Gastado: $${(customer.metrics?.totalSpent || 0).toLocaleString('es-CO')}`);
            console.log(`Riesgo de Churn: ${customer.churnRisk || 'N/A'}`);
            
            if (customer.preferences?.favoriteCategories?.length > 0) {
                console.log(`Categorías Favoritas: ${customer.preferences.favoriteCategories.join(', ')}`);
            }
            
            console.log(`\n🎯 GENERANDO RECOMENDACIONES...`);
            
            try {
                const recommendations = await recommendationService.getCustomerRecommendations(
                    customer._id.toString(),
                    { limit: 5 }
                );
                
                console.log(`\n✅ Recomendaciones generadas exitosamente`);
                console.log(`${'─'.repeat(60)}`);
                
                // Metadata
                console.log(`\n📈 METADATA:`);
                console.log(`  Confianza: ${(recommendations.metadata.confidenceScore * 100).toFixed(1)}%`);
                console.log(`  Total Recomendaciones: ${recommendations.metadata.totalRecommendations}`);
                console.log(`  Estrategia: ${recommendations.metadata.strategy}`);
                console.log(`  Generado: ${new Date(recommendations.metadata.generatedAt).toLocaleString('es-CO')}`);
                
                // Productos destacados (Featured)
                if (recommendations.recommendations.featured.length > 0) {
                    console.log(`\n⭐ PRODUCTOS DESTACADOS (${recommendations.recommendations.featured.length}):`);
                    recommendations.recommendations.featured.forEach((product, idx) => {
                        console.log(`  ${idx + 1}. ${product.name}`);
                        console.log(`     Marca: ${product.brand}`);
                        console.log(`     Precio: $${product.price.toLocaleString('es-CO')}`);
                        console.log(`     Score: ${product.recommendationScore}`);
                        console.log(`     Razón: ${product.recommendationReason}`);
                    });
                }
                
                // Cross-sell
                if (recommendations.recommendations.crossSell.length > 0) {
                    console.log(`\n🔄 PRODUCTOS COMPLEMENTARIOS (${recommendations.recommendations.crossSell.length}):`);
                    recommendations.recommendations.crossSell.forEach((product, idx) => {
                        console.log(`  ${idx + 1}. ${product.name} - $${product.price.toLocaleString('es-CO')}`);
                        console.log(`     Categoría: ${product.categories?.[0] || 'N/A'}`);
                    });
                }
                
                // Upsell
                if (recommendations.recommendations.upsell.length > 0) {
                    console.log(`\n💎 PRODUCTOS PREMIUM (${recommendations.recommendations.upsell.length}):`);
                    recommendations.recommendations.upsell.forEach((product, idx) => {
                        console.log(`  ${idx + 1}. ${product.name} - $${product.price.toLocaleString('es-CO')}`);
                        console.log(`     ${product.recommendationReason}`);
                    });
                }
                
                // Productos similares
                if (recommendations.recommendations.similar.length > 0) {
                    console.log(`\n🎯 SIMILARES A ÚLTIMA COMPRA (${recommendations.recommendations.similar.length}):`);
                    recommendations.recommendations.similar.forEach((product, idx) => {
                        console.log(`  ${idx + 1}. ${product.name} - $${product.price.toLocaleString('es-CO')}`);
                        console.log(`     Score: ${product.recommendationScore}`);
                    });
                }
                
                // Trending
                if (recommendations.recommendations.trending.length > 0) {
                    console.log(`\n📈 TENDENCIAS EN SU SEGMENTO (${recommendations.recommendations.trending.length}):`);
                    recommendations.recommendations.trending.forEach((product, idx) => {
                        console.log(`  ${idx + 1}. ${product.name} - $${product.price.toLocaleString('es-CO')}`);
                    });
                }
                
                // Resumen
                console.log(`\n📊 RESUMEN:`);
                console.log(`  Featured: ${recommendations.recommendations.featured.length}`);
                console.log(`  Cross-sell: ${recommendations.recommendations.crossSell.length}`);
                console.log(`  Upsell: ${recommendations.recommendations.upsell.length}`);
                console.log(`  Similar: ${recommendations.recommendations.similar.length}`);
                console.log(`  Trending: ${recommendations.recommendations.trending.length}`);
                console.log(`  TOTAL: ${recommendations.metadata.totalRecommendations}`);
                
            } catch (error) {
                console.error(`\n❌ Error generando recomendaciones:`, error.message);
            }
        }
        
        console.log(`\n${'='.repeat(60)}`);
        console.log('\n✅ Prueba completada exitosamente\n');
        
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
testCustomerRecommendations();

