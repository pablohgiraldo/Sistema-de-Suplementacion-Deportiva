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
    getCustomerRecommendations,
    getRecommendationStats
} from '../controllers/recommendationController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';
import { recommendationCacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/recommendations/popular
 * @desc    Obtener productos populares (público)
 * @access  Public
 */
router.get('/popular', recommendationCacheMiddleware(), getPopularProducts);

/**
 * @route   GET /api/recommendations/category/:category
 * @desc    Obtener recomendaciones por categoría (público)
 * @access  Public
 */
router.get('/category/:category', recommendationCacheMiddleware(), getRecommendationsByCategory);

/**
 * @route   GET /api/recommendations/similar/:productId
 * @desc    Obtener productos similares (público)
 * @access  Public
 */
router.get('/similar/:productId', recommendationCacheMiddleware(), getSimilarProducts);

/**
 * @route   GET /api/recommendations/me
 * @desc    Obtener recomendaciones personalizadas del usuario autenticado
 * @access  Private
 */
router.get('/me', authMiddleware, recommendationCacheMiddleware(), getMyRecommendations);

/**
 * @route   GET /api/recommendations/hybrid
 * @desc    Obtener recomendaciones híbridas (múltiples estrategias)
 * @access  Private
 */
router.get('/hybrid', authMiddleware, recommendationCacheMiddleware(), getHybridRecommendations);

/**
 * @route   GET /api/recommendations/user/:userId
 * @desc    Obtener recomendaciones de un usuario específico (admin)
 * @access  Private/Admin
 */
router.get('/user/:userId', authMiddleware, requireAdmin, recommendationCacheMiddleware(), getUserRecommendations);

/**
 * @route   GET /api/recommendations/stats
 * @desc    Obtener estadísticas del sistema de recomendaciones (admin)
 * @access  Private/Admin
 */
router.get('/stats', authMiddleware, requireAdmin, getRecommendationStats);

/**
 * @route   GET /api/recommendations/:customerId
 * @desc    Obtener recomendaciones basadas en perfil completo del Customer (CRM)
 * @access  Private/Admin
 */
router.get('/:customerId', authMiddleware, requireAdmin, recommendationCacheMiddleware(), getCustomerRecommendations);

export default router;

