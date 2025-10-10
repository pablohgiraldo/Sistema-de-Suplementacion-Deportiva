/**
 * Rutas de Recomendaciones
 * Define los endpoints para el sistema de recomendaciones
 */

import express from 'express';
import {
    getUserRecommendations,
    getMyRecommendations,
    getSimilarProducts,
    getPopularProducts,
    getRecommendationsByCategory,
    getHybridRecommendations,
    getRecommendationStats
} from '../controllers/recommendationController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/recommendations/popular
 * @desc    Obtener productos populares (público)
 * @access  Public
 */
router.get('/popular', getPopularProducts);

/**
 * @route   GET /api/recommendations/category/:category
 * @desc    Obtener recomendaciones por categoría (público)
 * @access  Public
 */
router.get('/category/:category', getRecommendationsByCategory);

/**
 * @route   GET /api/recommendations/similar/:productId
 * @desc    Obtener productos similares (público)
 * @access  Public
 */
router.get('/similar/:productId', getSimilarProducts);

/**
 * @route   GET /api/recommendations/me
 * @desc    Obtener recomendaciones personalizadas del usuario autenticado
 * @access  Private
 */
router.get('/me', requireAuth, getMyRecommendations);

/**
 * @route   GET /api/recommendations/hybrid
 * @desc    Obtener recomendaciones híbridas (múltiples estrategias)
 * @access  Private
 */
router.get('/hybrid', requireAuth, getHybridRecommendations);

/**
 * @route   GET /api/recommendations/user/:userId
 * @desc    Obtener recomendaciones de un usuario específico (admin)
 * @access  Private/Admin
 */
router.get('/user/:userId', requireAuth, requireAdmin, getUserRecommendations);

/**
 * @route   GET /api/recommendations/stats
 * @desc    Obtener estadísticas del sistema de recomendaciones (admin)
 * @access  Private/Admin
 */
router.get('/stats', requireAuth, requireAdmin, getRecommendationStats);

export default router;

