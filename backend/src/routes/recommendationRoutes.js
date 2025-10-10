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
router.get('/me', authMiddleware, getMyRecommendations);

/**
 * @route   GET /api/recommendations/hybrid
 * @desc    Obtener recomendaciones híbridas (múltiples estrategias)
 * @access  Private
 */
router.get('/hybrid', authMiddleware, getHybridRecommendations);

/**
 * @route   GET /api/recommendations/user/:userId
 * @desc    Obtener recomendaciones de un usuario específico (admin)
 * @access  Private/Admin
 */
router.get('/user/:userId', authMiddleware, requireAdmin, getUserRecommendations);

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
router.get('/:customerId', authMiddleware, requireAdmin, getCustomerRecommendations);

export default router;

