/**
 * Controlador de Recomendaciones
 * Maneja las peticiones HTTP para el sistema de recomendaciones
 */

import recommendationService from '../services/recommendationService.js';

/**
 * Obtiene recomendaciones personalizadas para un usuario
 * GET /api/recommendations/user/:userId
 */
export const getUserRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const recommendations = await recommendationService.getUserBasedRecommendations(userId, limit);

        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        console.error('Error getting user recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recomendaciones del usuario',
            error: error.message
        });
    }
};

/**
 * Obtiene recomendaciones para el usuario autenticado
 * GET /api/recommendations/me
 */
export const getMyRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10;

        const recommendations = await recommendationService.getUserBasedRecommendations(userId, limit);

        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        console.error('Error getting my recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus recomendaciones',
            error: error.message
        });
    }
};

/**
 * Obtiene productos similares a uno dado
 * GET /api/recommendations/similar/:productId
 */
export const getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const limit = parseInt(req.query.limit) || 5;

        const recommendations = await recommendationService.getItemBasedRecommendations(productId, limit);

        res.status(200).json({
            success: true,
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        console.error('Error getting similar products:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos similares',
            error: error.message
        });
    }
};

/**
 * Obtiene productos populares
 * GET /api/recommendations/popular
 */
export const getPopularProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const products = await recommendationService.getPopularProducts(limit);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        console.error('Error getting popular products:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener productos populares',
            error: error.message
        });
    }
};

/**
 * Obtiene recomendaciones por categoría
 * GET /api/recommendations/category/:category
 */
export const getRecommendationsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const products = await recommendationService.getRecommendationsByCategory(category, limit);

        res.status(200).json({
            success: true,
            count: products.length,
            category,
            data: products
        });
    } catch (error) {
        console.error('Error getting recommendations by category:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recomendaciones por categoría',
            error: error.message
        });
    }
};

/**
 * Obtiene recomendaciones híbridas (múltiples estrategias)
 * GET /api/recommendations/hybrid
 */
export const getHybridRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10;
        const includePopular = req.query.includePopular !== 'false';
        const includeSegment = req.query.includeSegment !== 'false';
        const includeSimilar = req.query.includeSimilar !== 'false';

        const recommendations = await recommendationService.getHybridRecommendations(userId, {
            limit,
            includePopular,
            includeSegment,
            includeSimilar
        });

        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        console.error('Error getting hybrid recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener recomendaciones híbridas',
            error: error.message
        });
    }
};

/**
 * Obtiene estadísticas del sistema de recomendaciones
 * GET /api/recommendations/stats
 */
export const getRecommendationStats = async (req, res) => {
    try {
        const stats = await recommendationService.getRecommendationStats();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error getting recommendation stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de recomendaciones',
            error: error.message
        });
    }
};

/**
 * Obtiene recomendaciones basadas en el perfil completo del Customer (CRM)
 * GET /api/recommendations/:customerId
 */
export const getCustomerRecommendations = async (req, res) => {
    try {
        const { customerId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const result = await recommendationService.getCustomerRecommendations(customerId, { limit });

        res.status(200).json(result);
    } catch (error) {
        console.error('Error getting customer recommendations:', error);

        if (error.message === 'Customer no encontrado') {
            return res.status(404).json({
                success: false,
                message: 'Customer no encontrado'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al obtener recomendaciones del customer',
            error: error.message
        });
    }
};

/**
 * Obtiene productos en tendencia
 */
export const getTrendingProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const trendingProducts = await recommendationService.getTrendingProducts(parseInt(limit));

        res.status(200).json({
            success: true,
            data: trendingProducts
        });
    } catch (error) {
        console.error('Error al obtener productos en tendencia:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener productos en tendencia'
        });
    }
};

/**
 * Actualiza el feedback de una recomendación
 */
export const updateRecommendationFeedback = async (req, res) => {
    try {
        const { productId, rating, clicked, purchased } = req.body;
        const userId = req.user?._id;

        if (!productId || !userId) {
            return res.status(400).json({
                success: false,
                error: 'ProductId y UserId son requeridos'
            });
        }

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return res.status(400).json({
                success: false,
                error: 'El rating debe estar entre 1 y 5'
            });
        }

        const result = await recommendationService.addFeedback({
            userId,
            productId,
            rating,
            clicked,
            purchased
        });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error al actualizar feedback de recomendación:', error);
        res.status(500).json({
            success: false,
            error: 'Error al actualizar feedback'
        });
    }
};

export default {
    getUserRecommendations,
    getMyRecommendations,
    getSimilarProducts,
    getPopularProducts,
    getRecommendationsByCategory,
    getHybridRecommendations,
    getCustomerRecommendations,
    getRecommendationStats,
    getTrendingProducts,
    updateRecommendationFeedback
};

