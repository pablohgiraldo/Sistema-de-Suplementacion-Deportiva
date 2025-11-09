/**
 * Servicio de Recomendaciones - Filtrado Colaborativo
 * Implementa algoritmos de recomendación basados en patrones de compra
 */

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';

/**
 * Calcula la similitud de Jaccard entre dos conjuntos
 * @param {Set} setA - Primer conjunto
 * @param {Set} setB - Segundo conjunto
 * @returns {number} - Similitud entre 0 y 1
 */
function jaccardSimilarity(setA, setB) {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Calcula la similitud de coseno entre dos vectores de productos
 * @param {Map} vectorA - Vector de frecuencias del producto A
 * @param {Map} vectorB - Vector de frecuencias del producto B
 * @returns {number} - Similitud entre 0 y 1
 */
function cosineSimilarity(vectorA, vectorB) {
    const allKeys = new Set([...vectorA.keys(), ...vectorB.keys()]);

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (const key of allKeys) {
        const a = vectorA.get(key) || 0;
        const b = vectorB.get(key) || 0;

        dotProduct += a * b;
        magnitudeA += a * a;
        magnitudeB += b * b;
    }

    const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Construye matriz de co-ocurrencias de productos
 * Cuenta cuántas veces dos productos aparecen juntos en órdenes
 * @returns {Promise<Map>} - Mapa de co-ocurrencias {productId: {productId: count}}
 */
async function buildCoOccurrenceMatrix() {
    const orders = await Order.find({
        status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
    }).select('items').lean();

    const coOccurrence = new Map();

    for (const order of orders) {
        const productIds = order.items.map(item => item.product.toString());

        // Para cada par de productos en la orden
        for (let i = 0; i < productIds.length; i++) {
            const productA = productIds[i];

            if (!coOccurrence.has(productA)) {
                coOccurrence.set(productA, new Map());
            }

            for (let j = 0; j < productIds.length; j++) {
                if (i !== j) {
                    const productB = productIds[j];
                    const productAMap = coOccurrence.get(productA);
                    productAMap.set(productB, (productAMap.get(productB) || 0) + 1);
                }
            }
        }
    }

    return coOccurrence;
}

/**
 * Obtiene productos similares basado en co-ocurrencias
 * @param {string} productId - ID del producto
 * @param {number} limit - Número máximo de recomendaciones
 * @returns {Promise<Array>} - Array de productos recomendados con score
 */
async function getItemBasedRecommendations(productId, limit = 5) {
    const coOccurrenceMatrix = await buildCoOccurrenceMatrix();

    const similarProducts = coOccurrenceMatrix.get(productId.toString());

    if (!similarProducts || similarProducts.size === 0) {
        return [];
    }

    // Ordenar por frecuencia de co-ocurrencia
    const sorted = Array.from(similarProducts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

    // Obtener detalles de los productos
    const productIds = sorted.map(([id]) => id);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const productsMap = new Map(products.map(p => [p._id.toString(), p]));

    return sorted
        .map(([id, count]) => ({
            product: productsMap.get(id),
            score: count,
            reason: 'Frecuentemente comprado junto'
        }))
        .filter(item => item.product); // Filtrar productos que no existan
}

/**
 * Obtiene recomendaciones basadas en el historial de compras del usuario
 * @param {string} userId - ID del usuario
 * @param {number} limit - Número máximo de recomendaciones
 * @returns {Promise<Array>} - Array de productos recomendados
 */
async function getUserBasedRecommendations(userId, limit = 10) {
    // Obtener órdenes del usuario
    const userOrders = await Order.find({
        user: userId,
        status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
    }).select('items').lean();

    if (userOrders.length === 0) {
        // Usuario nuevo, devolver productos más populares
        return getPopularProducts(limit);
    }

    // Extraer productos que el usuario ya compró
    const purchasedProducts = new Set(
        userOrders.flatMap(order =>
            order.items.map(item => item.product.toString())
        )
    );

    // Obtener recomendaciones para cada producto comprado
    const recommendationsMap = new Map();

    for (const productId of purchasedProducts) {
        const itemRecs = await getItemBasedRecommendations(productId, limit);

        for (const rec of itemRecs) {
            const recId = rec.product._id.toString();

            // No recomendar productos ya comprados
            if (purchasedProducts.has(recId)) continue;

            if (!recommendationsMap.has(recId)) {
                recommendationsMap.set(recId, {
                    product: rec.product,
                    score: 0,
                    reasons: []
                });
            }

            const existing = recommendationsMap.get(recId);
            existing.score += rec.score;
            existing.reasons.push(rec.reason);
        }
    }

    // Ordenar por score y limitar resultados
    const sortedRecommendations = Array.from(recommendationsMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(rec => ({
            ...rec.product,
            recommendationScore: rec.score,
            recommendationReason: rec.reasons[0] || 'Basado en tu historial de compras'
        }));

    if (sortedRecommendations.length === 0) {
        const popularFallback = await getPopularProducts(limit);

        return popularFallback.map(product => ({
            ...product,
            recommendationReason: product.recommendationReason || 'Basado en popularidad global'
        }));
    }

    return sortedRecommendations;
}

/**
 * Obtiene productos populares (fallback para usuarios nuevos)
 * @param {number} limit - Número de productos a devolver
 * @returns {Promise<Array>} - Array de productos populares
 */
async function getPopularProducts(limit = 10) {
    const popularProducts = await Order.aggregate([
        {
            $match: {
                status: { $in: ['pending', 'processing', 'shipped', 'delivered'] }
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalQuantity: { $sum: '$items.quantity' },
                totalOrders: { $sum: 1 }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $project: {
                _id: '$product._id',
                name: '$product.name',
                brand: '$product.brand',
                price: '$product.price',
                imageUrl: '$product.imageUrl',
                description: '$product.description',
                categories: '$product.categories',
                stock: '$product.stock',
                totalQuantity: 1,
                totalOrders: 1,
                recommendationScore: '$totalQuantity',
                recommendationReason: 'Producto popular'
            }
        }
    ]);

    return popularProducts;
}

/**
 * Obtiene recomendaciones por categoría
 * @param {string} category - Categoría de productos
 * @param {number} limit - Número de productos
 * @returns {Promise<Array>} - Array de productos de la categoría
 */
async function getRecommendationsByCategory(category, limit = 10) {
    const products = await Product.find({
        categories: category,
        stock: { $gt: 0 }
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return products.map(p => ({
        ...p,
        recommendationScore: 1,
        recommendationReason: `Productos en ${category}`
    }));
}

/**
 * Obtiene recomendaciones basadas en el segmento del cliente
 * @param {string} userId - ID del usuario
 * @param {number} limit - Número de recomendaciones
 * @returns {Promise<Array>} - Array de productos recomendados
 */
async function getSegmentBasedRecommendations(userId, limit = 10) {
    const customer = await Customer.findOne({ user: userId }).lean();

    if (!customer || !customer.segment) {
        return [];
    }

    // Mapeo de segmentos a categorías preferidas
    const segmentPreferences = {
        'VIP': ['Proteína', 'Pre-Entreno', 'Creatina', 'Aminoácidos'],
        'Frecuente': ['Proteína', 'Vitaminas', 'Snacks'],
        'Ocasional': ['Proteína', 'Snacks'],
        'Nuevo': ['Proteína', 'Vitaminas'],
        'Inactivo': ['Quemadores', 'Vitaminas'],
        'En Riesgo': ['Proteína', 'Snacks']
    };

    const preferredCategories = segmentPreferences[customer.segment] || ['Proteína'];

    // Obtener productos de las categorías preferidas
    const products = await Product.find({
        categories: { $in: preferredCategories },
        stock: { $gt: 0 }
    })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return products.map(p => ({
        ...p,
        recommendationScore: 1,
        recommendationReason: `Recomendado para clientes ${customer.segment}`
    }));
}

/**
 * Obtiene recomendaciones híbridas combinando múltiples estrategias
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de recomendación
 * @returns {Promise<Object>} - Objeto con múltiples tipos de recomendaciones
 */
async function getHybridRecommendations(userId, options = {}) {
    const {
        limit = 10,
        includePopular = true,
        includeSegment = true,
        includeSimilar = true
    } = options;

    const recommendations = {
        personalized: [],
        popular: [],
        segment: [],
        similar: []
    };

    try {
        // Recomendaciones personalizadas basadas en historial
        recommendations.personalized = await getUserBasedRecommendations(userId, limit);

        // Productos populares
        if (includePopular) {
            recommendations.popular = await getPopularProducts(Math.ceil(limit / 2));
        }

        // Recomendaciones basadas en segmento
        if (includeSegment) {
            recommendations.segment = await getSegmentBasedRecommendations(userId, Math.ceil(limit / 2));
        }

        // Si el usuario tiene compras, incluir productos similares
        if (includeSimilar) {
            const userOrders = await Order.find({
                user: userId,
                status: { $in: ['delivered'] }
            })
                .sort({ createdAt: -1 })
                .limit(1)
                .select('items')
                .lean();

            if (userOrders.length > 0 && userOrders[0].items.length > 0) {
                const lastProductId = userOrders[0].items[0].product;
                recommendations.similar = await getItemBasedRecommendations(
                    lastProductId,
                    Math.ceil(limit / 2)
                ).then(recs => recs.map(r => ({
                    ...r.product,
                    recommendationScore: r.score,
                    recommendationReason: r.reason
                })));
            }
        }

        return recommendations;
    } catch (error) {
        console.error('Error generating hybrid recommendations:', error);
        throw error;
    }
}

/**
 * Obtiene estadísticas del sistema de recomendaciones
 * @returns {Promise<Object>} - Estadísticas del sistema
 */
async function getRecommendationStats() {
    const [
        totalProducts,
        totalOrders,
        totalUsers,
        avgItemsPerOrder
    ] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments({ status: { $in: ['pending', 'processing', 'shipped', 'delivered'] } }),
        Order.distinct('user').then(users => users.length),
        Order.aggregate([
            { $match: { status: { $in: ['pending', 'processing', 'shipped', 'delivered'] } } },
            { $project: { itemCount: { $size: '$items' } } },
            { $group: { _id: null, avgItems: { $avg: '$itemCount' } } }
        ]).then(result => result[0]?.avgItems || 0)
    ]);

    const coOccurrenceMatrix = await buildCoOccurrenceMatrix();
    const avgCoOccurrences = Array.from(coOccurrenceMatrix.values())
        .reduce((sum, map) => sum + map.size, 0) / coOccurrenceMatrix.size;

    return {
        totalProducts,
        totalOrders,
        totalUsers,
        avgItemsPerOrder: Math.round(avgItemsPerOrder * 100) / 100,
        avgCoOccurrences: Math.round(avgCoOccurrences * 100) / 100,
        matrixSize: coOccurrenceMatrix.size
    };
}

/**
 * Obtiene recomendaciones personalizadas basadas en el perfil completo del Customer
 * @param {string} customerId - ID del customer
 * @param {Object} options - Opciones de recomendación
 * @returns {Promise<Object>} - Objeto con recomendaciones personalizadas y metadatos
 */
async function getCustomerRecommendations(customerId, options = {}) {
    const { limit = 10 } = options;

    try {
        // Obtener el customer con toda su información
        const customer = await Customer.findById(customerId)
            .populate('user')
            .lean();

        if (!customer) {
            throw new Error('Customer no encontrado');
        }

        // Construir el perfil de recomendación
        const profile = {
            customerId: customer._id,
            userId: customer.user._id,
            segment: customer.segment,
            loyaltyLevel: customer.loyalty?.level,
            totalOrders: customer.metrics?.totalOrders || 0,
            totalSpent: customer.metrics?.totalSpent || 0,
            lastOrderDate: customer.metrics?.lastOrderDate,
            preferences: customer.preferences || {},
            churnRisk: customer.churnRisk || 'low'
        };

        // Estrategias de recomendación según el perfil
        const recommendations = {
            profile,
            featured: [], // Productos destacados personalizados
            crossSell: [], // Productos complementarios
            upsell: [], // Productos premium
            similar: [], // Basados en última compra
            trending: [] // Tendencias en su segmento
        };

        // 1. Recomendaciones principales basadas en historial
        const userBased = await getUserBasedRecommendations(customer.user._id, limit);
        recommendations.featured = userBased.slice(0, Math.ceil(limit / 2));
        if (recommendations.featured.length === 0) {
            const fallbackFeatured = await getPopularProducts(Math.max(3, Math.ceil(limit / 2)));
            recommendations.featured = fallbackFeatured.map(product => ({
                ...product,
                recommendationReason: product.recommendationReason || 'Productos populares recomendados'
            }));
        }

        // 2. Cross-sell: Productos complementarios basados en categorías compradas
        if (customer.preferences?.favoriteCategories?.length > 0) {
            const favoriteCategory = customer.preferences.favoriteCategories[0];

            // Obtener productos en categorías complementarias
            const complementaryCategories = {
                'Proteína': ['Creatina', 'Aminoácidos', 'Snacks'],
                'Creatina': ['Proteína', 'Pre-Entreno'],
                'Pre-Entreno': ['Aminoácidos', 'Proteína'],
                'Vitaminas': ['Proteína', 'Snacks'],
                'Quemadores': ['Vitaminas', 'Aminoácidos'],
                'Ganadores': ['Creatina', 'Proteína']
            };

            const complementary = complementaryCategories[favoriteCategory] || ['Proteína'];

            for (const category of complementary.slice(0, 2)) {
                const categoryProducts = await getRecommendationsByCategory(category, 2);
                recommendations.crossSell.push(...categoryProducts);
            }
        }

        // 3. Upsell: Productos premium según segmento y capacidad de compra
        if (profile.segment === 'VIP' || profile.segment === 'Frecuente') {
            const premiumProducts = await Product.find({
                price: { $gte: 1500 }, // Productos premium
                stock: { $gt: 0 }
            })
                .sort({ price: -1 })
                .limit(3)
                .lean();

            recommendations.upsell = premiumProducts.map(p => ({
                ...p,
                recommendationScore: 1,
                recommendationReason: 'Producto premium recomendado'
            }));
        }

        // 4. Productos similares a la última compra
        const lastOrder = await Order.findOne({
            user: customer.user._id,
            status: { $in: ['delivered'] }
        })
            .sort({ createdAt: -1 })
            .select('items')
            .lean();

        if (lastOrder && lastOrder.items.length > 0) {
            const lastProductId = lastOrder.items[0].product;
            const similarItems = await getItemBasedRecommendations(lastProductId, 3);

            recommendations.similar = similarItems.map(item => ({
                ...item.product,
                recommendationScore: item.score,
                recommendationReason: item.reason
            }));
        }

        // 5. Trending: Productos populares en su segmento
        if (profile.segment) {
            const segmentProducts = await getSegmentBasedRecommendations(customer.user._id, 3);
            recommendations.trending = segmentProducts;
        }
        if (recommendations.trending.length === 0) {
            const fallbackTrending = await getPopularProducts(3);
            recommendations.trending = fallbackTrending.map(product => ({
                ...product,
                recommendationReason: product.recommendationReason || 'Tendencias globales'
            }));
        }

        // Evitar duplicados manteniendo el primer registro encontrado
        const dedupeById = (items) => {
            const seen = new Set();
            return items.filter(item => {
                const id = item._id?.toString?.() || item.product?._id?.toString?.();
                if (!id) return false;
                if (seen.has(id)) return false;
                seen.add(id);
                return true;
            });
        };

        recommendations.featured = dedupeById(recommendations.featured);
        recommendations.crossSell = dedupeById(recommendations.crossSell);
        recommendations.upsell = dedupeById(recommendations.upsell);
        recommendations.similar = dedupeById(recommendations.similar);
        recommendations.trending = dedupeById(recommendations.trending);

        // Calcular score de confianza de las recomendaciones
        const confidenceScore = calculateConfidenceScore(profile);

        const totalRecommendations =
            recommendations.featured.length +
            recommendations.crossSell.length +
            recommendations.upsell.length +
            recommendations.similar.length +
            recommendations.trending.length;

        return {
            success: true,
            customer: {
                id: customer._id,
                name: customer.user.nombre,
                segment: profile.segment,
                loyaltyLevel: profile.loyaltyLevel
            },
            recommendations,
            metadata: {
                confidenceScore,
                totalRecommendations,
                generatedAt: new Date(),
                strategy: 'hybrid-customer-profile'
            }
        };
    } catch (error) {
        console.error('Error generating customer recommendations:', error);
        throw error;
    }
}

/**
 * Calcula el score de confianza de las recomendaciones basado en el perfil
 * @param {Object} profile - Perfil del customer
 * @returns {number} - Score entre 0 y 1
 */
function calculateConfidenceScore(profile) {
    let score = 0;
    let factors = 0;

    // Factor 1: Historial de compras
    if (profile.totalOrders > 0) {
        score += Math.min(profile.totalOrders / 10, 1) * 0.3;
        factors++;
    }

    // Factor 2: Segmento definido
    if (profile.segment && profile.segment !== 'Nuevo') {
        score += 0.25;
        factors++;
    }

    // Factor 3: Nivel de lealtad
    if (profile.loyaltyLevel) {
        const loyaltyScores = { Bronze: 0.1, Silver: 0.15, Gold: 0.2, Platinum: 0.25 };
        score += loyaltyScores[profile.loyaltyLevel] || 0;
        factors++;
    }

    // Factor 4: Actividad reciente
    if (profile.lastOrderDate) {
        const daysSinceLastOrder = (Date.now() - new Date(profile.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastOrder < 30) {
            score += 0.2;
            factors++;
        }
    }

    return factors > 0 ? Math.min(score, 1) : 0.5; // Score mínimo de 0.5
}

export default {
    getUserBasedRecommendations,
    getItemBasedRecommendations,
    getPopularProducts,
    getRecommendationsByCategory,
    getSegmentBasedRecommendations,
    getHybridRecommendations,
    getCustomerRecommendations,
    getRecommendationStats
};

