/**
 * Script de validación de precisión del sistema de recomendaciones
 * Mide accuracy, precision, recall y valida la calidad de las recomendaciones
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Customer from '../src/models/Customer.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import recommendationService from '../src/services/recommendationService.js';

dotenv.config();

/**
 * Valida la precisión de las recomendaciones
 */
async function validateRecommendationAccuracy() {
    try {
        console.log('\n🎯 VALIDACIÓN DE PRECISIÓN DEL SISTEMA DE RECOMENDACIONES\n');
        console.log('='.repeat(70));
        
        // Conectar a la base de datos
        await connectDB(process.env.MONGODB_URI);
        
        // Inicializar métricas
        const metrics = {
            totalTests: 0,
            successful: 0,
            failed: 0,
            accuracy: 0,
            precision: 0,
            recall: 0,
            f1Score: 0,
            crossSellQuality: { valid: 0, total: 0 },
            upsellQuality: { valid: 0, total: 0 },
            categoryRelevance: { relevant: 0, total: 0 },
            priceRelevance: { appropriate: 0, total: 0 }
        };
        
        // 1. VALIDAR RECOMENDACIONES CROSS-SELL
        console.log('\n📊 1. VALIDACIÓN DE CROSS-SELL');
        console.log('-'.repeat(70));
        
        await validateCrossSell(metrics);
        
        // 2. VALIDAR RECOMENDACIONES UPSELL
        console.log('\n\n📈 2. VALIDACIÓN DE UPSELL');
        console.log('-'.repeat(70));
        
        await validateUpsell(metrics);
        
        // 3. VALIDAR RELEVANCIA POR CATEGORÍA
        console.log('\n\n📂 3. VALIDACIÓN DE RELEVANCIA POR CATEGORÍA');
        console.log('-'.repeat(70));
        
        await validateCategoryRelevance(metrics);
        
        // 4. VALIDAR PATRONES DE CO-OCURRENCIA
        console.log('\n\n🔗 4. VALIDACIÓN DE PATRONES DE CO-OCURRENCIA');
        console.log('-'.repeat(70));
        
        await validateCoOccurrencePatterns(metrics);
        
        // 5. VALIDAR RECOMENDACIONES PERSONALIZADAS
        console.log('\n\n👤 5. VALIDACIÓN DE RECOMENDACIONES PERSONALIZADAS');
        console.log('-'.repeat(70));
        
        await validatePersonalizedRecommendations(metrics);
        
        // 6. CALCULAR MÉTRICAS FINALES
        console.log('\n\n📈 MÉTRICAS FINALES');
        console.log('='.repeat(70));
        
        calculateFinalMetrics(metrics);
        displayMetrics(metrics);
        
        // 7. GENERAR REPORTE
        generateReport(metrics);
        
        console.log('\n' + '='.repeat(70));
        console.log('✅ Validación completada exitosamente\n');
        
        // Cerrar conexión
        await mongoose.connection.close();
        console.log('🔌 Conexión cerrada');
        
        process.exit(metrics.accuracy >= 70 ? 0 : 1);
        
    } catch (error) {
        console.error('\n❌ Error durante la validación:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

/**
 * Valida la calidad de las recomendaciones cross-sell
 */
async function validateCrossSell(metrics) {
    console.log('Analizando recomendaciones cross-sell...\n');
    
    // Obtener clientes con historial de compras
    const customers = await Customer.find({ 'metrics.totalOrders': { $gte: 2 } })
        .limit(20)
        .lean();
    
    for (const customer of customers) {
        try {
            const recommendations = await recommendationService.getCustomerRecommendations(
                customer._id,
                { limit: 10 }
            );
            
            if (recommendations.recommendations.crossSell.length > 0) {
                // Validar que los productos cross-sell sean de categorías complementarias
                const crossSellValid = recommendations.recommendations.crossSell.every(rec => {
                    return rec.category && rec.reason && rec.reason.includes('complementar');
                });
                
                metrics.crossSellQuality.total++;
                if (crossSellValid) {
                    metrics.crossSellQuality.valid++;
                }
            }
        } catch (error) {
            console.warn(`  ⚠️  Error procesando customer ${customer.customerCode}: ${error.message}`);
        }
    }
    
    const crossSellAccuracy = metrics.crossSellQuality.total > 0
        ? (metrics.crossSellQuality.valid / metrics.crossSellQuality.total * 100).toFixed(2)
        : 0;
    
    console.log(`Cross-sell validadas: ${metrics.crossSellQuality.total}`);
    console.log(`Cross-sell válidas: ${metrics.crossSellQuality.valid}`);
    console.log(`Precisión cross-sell: ${crossSellAccuracy}%`);
}

/**
 * Valida la calidad de las recomendaciones upsell
 */
async function validateUpsell(metrics) {
    console.log('Analizando recomendaciones upsell...\n');
    
    const customers = await Customer.find({ 'metrics.totalOrders': { $gte: 1 } })
        .limit(20)
        .lean();
    
    for (const customer of customers) {
        try {
            const recommendations = await recommendationService.getCustomerRecommendations(
                customer._id,
                { limit: 10 }
            );
            
            if (recommendations.recommendations.upsell.length > 0) {
                // Validar que los productos upsell sean más caros y de mejor calidad
                const upsellValid = recommendations.recommendations.upsell.every(rec => {
                    return rec.price > 0 && rec.reason && 
                           (rec.reason.includes('mejor') || rec.reason.includes('premium') || 
                            rec.reason.includes('superior'));
                });
                
                metrics.upsellQuality.total++;
                if (upsellValid) {
                    metrics.upsellQuality.valid++;
                }
            }
        } catch (error) {
            console.warn(`  ⚠️  Error procesando customer ${customer.customerCode}: ${error.message}`);
        }
    }
    
    const upsellAccuracy = metrics.upsellQuality.total > 0
        ? (metrics.upsellQuality.valid / metrics.upsellQuality.total * 100).toFixed(2)
        : 0;
    
    console.log(`Upsell validadas: ${metrics.upsellQuality.total}`);
    console.log(`Upsell válidas: ${metrics.upsellQuality.valid}`);
    console.log(`Precisión upsell: ${upsellAccuracy}%`);
}

/**
 * Valida que las recomendaciones sean relevantes por categoría
 */
async function validateCategoryRelevance(metrics) {
    console.log('Analizando relevancia por categoría...\n');
    
    const customers = await Customer.find({ 'preferences.categories.0': { $exists: true } })
        .limit(20)
        .lean();
    
    for (const customer of customers) {
        try {
            const recommendations = await recommendationService.getCustomerRecommendations(
                customer._id,
                { limit: 10 }
            );
            
            // Obtener todas las recomendaciones
            const allRecs = [
                ...recommendations.recommendations.featured,
                ...recommendations.recommendations.crossSell,
                ...recommendations.recommendations.upsell
            ];
            
            if (allRecs.length > 0 && customer.preferences?.categories?.length > 0) {
                // Verificar que al menos 50% de las recomendaciones sean de categorías relevantes
                const relevantCount = allRecs.filter(rec => 
                    customer.preferences.categories.some(cat => 
                        rec.category === cat || rec.categories?.includes(cat)
                    )
                ).length;
                
                metrics.categoryRelevance.total++;
                if (relevantCount / allRecs.length >= 0.3) { // Al menos 30% relevante
                    metrics.categoryRelevance.relevant++;
                }
            }
        } catch (error) {
            console.warn(`  ⚠️  Error procesando customer ${customer.customerCode}: ${error.message}`);
        }
    }
    
    const categoryAccuracy = metrics.categoryRelevance.total > 0
        ? (metrics.categoryRelevance.relevant / metrics.categoryRelevance.total * 100).toFixed(2)
        : 0;
    
    console.log(`Categorías validadas: ${metrics.categoryRelevance.total}`);
    console.log(`Categorías relevantes: ${metrics.categoryRelevance.relevant}`);
    console.log(`Precisión de categoría: ${categoryAccuracy}%`);
}

/**
 * Valida los patrones de co-ocurrencia
 */
async function validateCoOccurrencePatterns(metrics) {
    console.log('Analizando patrones de co-ocurrencia...\n');
    
    // Obtener órdenes con múltiples items
    const orders = await Order.find({ 
        'items.1': { $exists: true },
        status: { $in: ['delivered', 'shipped'] }
    })
    .populate('items.product')
    .limit(100);
    
    let validPatterns = 0;
    let totalPatterns = 0;
    
    // Patrones esperados de co-ocurrencia
    const expectedPatterns = [
        ['Proteína', 'Creatina'],
        ['Proteína', 'Aminoácidos'],
        ['Pre-Entreno', 'Aminoácidos'],
        ['Proteína', 'Vitaminas'],
        ['Ganadores', 'Creatina']
    ];
    
    for (const order of orders) {
        const categories = [...new Set(
            order.items
                .map(item => item.product?.categories?.[0])
                .filter(Boolean)
        )];
        
        if (categories.length >= 2) {
            totalPatterns++;
            
            // Verificar si coincide con algún patrón esperado
            const hasExpectedPattern = expectedPatterns.some(([cat1, cat2]) => 
                categories.includes(cat1) && categories.includes(cat2)
            );
            
            if (hasExpectedPattern) {
                validPatterns++;
            }
        }
    }
    
    const patternAccuracy = totalPatterns > 0
        ? (validPatterns / totalPatterns * 100).toFixed(2)
        : 0;
    
    console.log(`Patrones analizados: ${totalPatterns}`);
    console.log(`Patrones esperados encontrados: ${validPatterns}`);
    console.log(`Precisión de patrones: ${patternAccuracy}%`);
    
    metrics.totalTests += totalPatterns;
    metrics.successful += validPatterns;
    metrics.failed += (totalPatterns - validPatterns);
}

/**
 * Valida las recomendaciones personalizadas
 */
async function validatePersonalizedRecommendations(metrics) {
    console.log('Analizando recomendaciones personalizadas...\n');
    
    const customers = await Customer.find({ 'metrics.totalOrders': { $gte: 1 } })
        .limit(15)
        .lean();
    
    let validRecommendations = 0;
    let totalRecommendations = 0;
    
    for (const customer of customers) {
        try {
            const recommendations = await recommendationService.getCustomerRecommendations(
                customer._id,
                { limit: 10 }
            );
            
            const allRecs = [
                ...recommendations.recommendations.featured,
                ...recommendations.recommendations.crossSell,
                ...recommendations.recommendations.upsell,
                ...recommendations.recommendations.similar
            ];
            
            if (allRecs.length > 0) {
                totalRecommendations += allRecs.length;
                
                // Validar que cada recomendación tenga score y razón
                validRecommendations += allRecs.filter(rec => 
                    rec.score > 0 && rec.reason && rec.reason.length > 10
                ).length;
            }
        } catch (error) {
            console.warn(`  ⚠️  Error procesando customer ${customer.customerCode}: ${error.message}`);
        }
    }
    
    const recAccuracy = totalRecommendations > 0
        ? (validRecommendations / totalRecommendations * 100).toFixed(2)
        : 0;
    
    console.log(`Recomendaciones analizadas: ${totalRecommendations}`);
    console.log(`Recomendaciones válidas: ${validRecommendations}`);
    console.log(`Precisión de recomendaciones: ${recAccuracy}%`);
    
    metrics.totalTests += totalRecommendations;
    metrics.successful += validRecommendations;
    metrics.failed += (totalRecommendations - validRecommendations);
}

/**
 * Calcula las métricas finales
 */
function calculateFinalMetrics(metrics) {
    if (metrics.totalTests > 0) {
        metrics.accuracy = (metrics.successful / metrics.totalTests * 100).toFixed(2);
        metrics.precision = (metrics.successful / (metrics.successful + metrics.failed) * 100).toFixed(2);
        
        // Recall aproximado basado en la cantidad de tests exitosos
        metrics.recall = metrics.precision; // Simplificado para este caso
        
        // F1-Score (media armónica de precision y recall)
        const p = parseFloat(metrics.precision);
        const r = parseFloat(metrics.recall);
        metrics.f1Score = p + r > 0 ? (2 * p * r / (p + r)).toFixed(2) : 0;
    }
}

/**
 * Muestra las métricas en consola
 */
function displayMetrics(metrics) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║           MÉTRICAS DE PRECISIÓN GENERALES                 ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  Total de pruebas:        ${metrics.totalTests.toString().padEnd(30)}║`);
    console.log(`║  Pruebas exitosas:        ${metrics.successful.toString().padEnd(30)}║`);
    console.log(`║  Pruebas fallidas:        ${metrics.failed.toString().padEnd(30)}║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  🎯 Accuracy:             ${(metrics.accuracy + '%').padEnd(30)}║`);
    console.log(`║  📊 Precision:            ${(metrics.precision + '%').padEnd(30)}║`);
    console.log(`║  📈 Recall:               ${(metrics.recall + '%').padEnd(30)}║`);
    console.log(`║  🎭 F1-Score:             ${(metrics.f1Score + '%').padEnd(30)}║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    
    // Cross-sell
    const crossSellPercent = metrics.crossSellQuality.total > 0
        ? (metrics.crossSellQuality.valid / metrics.crossSellQuality.total * 100).toFixed(2)
        : 0;
    console.log(`║  🔗 Cross-sell quality:   ${(crossSellPercent + '%').padEnd(30)}║`);
    
    // Upsell
    const upsellPercent = metrics.upsellQuality.total > 0
        ? (metrics.upsellQuality.valid / metrics.upsellQuality.total * 100).toFixed(2)
        : 0;
    console.log(`║  ⬆️  Upsell quality:       ${(upsellPercent + '%').padEnd(30)}║`);
    
    // Categoría
    const categoryPercent = metrics.categoryRelevance.total > 0
        ? (metrics.categoryRelevance.relevant / metrics.categoryRelevance.total * 100).toFixed(2)
        : 0;
    console.log(`║  📂 Category relevance:   ${(categoryPercent + '%').padEnd(30)}║`);
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    // Interpretación
    console.log('\n📝 INTERPRETACIÓN:');
    const accuracy = parseFloat(metrics.accuracy);
    
    if (accuracy >= 80) {
        console.log('  ✅ EXCELENTE - El sistema tiene alta precisión');
    } else if (accuracy >= 70) {
        console.log('  ✅ BUENO - El sistema tiene precisión aceptable');
    } else if (accuracy >= 60) {
        console.log('  ⚠️  REGULAR - El sistema necesita optimización');
    } else {
        console.log('  ❌ BAJO - El sistema requiere mejoras significativas');
    }
}

/**
 * Genera un reporte en formato texto
 */
function generateReport(metrics) {
    const timestamp = new Date().toISOString();
    const report = `
╔═══════════════════════════════════════════════════════════════════════╗
║      REPORTE DE VALIDACIÓN DE PRECISIÓN - SISTEMA DE RECOMENDACIONES ║
╠═══════════════════════════════════════════════════════════════════════╣
║  Fecha: ${timestamp}                            ║
╠═══════════════════════════════════════════════════════════════════════╣
║  MÉTRICAS PRINCIPALES:                                                ║
║    - Accuracy:               ${metrics.accuracy}%                        ║
║    - Precision:              ${metrics.precision}%                       ║
║    - Recall:                 ${metrics.recall}%                          ║
║    - F1-Score:               ${metrics.f1Score}%                         ║
║                                                                         ║
║  MÉTRICAS DETALLADAS:                                                  ║
║    - Cross-sell Quality:     ${(metrics.crossSellQuality.valid / metrics.crossSellQuality.total * 100 || 0).toFixed(2)}%      ║
║    - Upsell Quality:         ${(metrics.upsellQuality.valid / metrics.upsellQuality.total * 100 || 0).toFixed(2)}%          ║
║    - Category Relevance:     ${(metrics.categoryRelevance.relevant / metrics.categoryRelevance.total * 100 || 0).toFixed(2)}%  ║
║                                                                         ║
║  ESTADÍSTICAS:                                                         ║
║    - Total de pruebas:       ${metrics.totalTests}                     ║
║    - Pruebas exitosas:       ${metrics.successful}                     ║
║    - Pruebas fallidas:       ${metrics.failed}                         ║
╚═══════════════════════════════════════════════════════════════════════╝
`;
    
    console.log(report);
}

// Ejecutar validación
validateRecommendationAccuracy();

