/**
 * Servicio de Recomendaciones
 * Maneja las peticiones a la API de recomendaciones
 */

import api from './api';

/**
 * Obtiene recomendaciones basadas en el perfil completo del Customer (CRM)
 * @param {string} customerId - ID del customer
 * @param {number} limit - Límite de productos por categoría
 * @returns {Promise} - Promesa con las recomendaciones
 */
export const getCustomerRecommendations = async (customerId, limit = 10) => {
    try {
        const response = await api.get(`/recommendations/${customerId}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching customer recommendations:', error);
        throw error;
    }
};

/**
 * Obtiene recomendaciones para el usuario autenticado
 * @param {number} limit - Límite de productos
 * @returns {Promise} - Promesa con las recomendaciones
 */
export const getMyRecommendations = async (limit = 10) => {
    try {
        const response = await api.get('/recommendations/me', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching my recommendations:', error);
        throw error;
    }
};

/**
 * Obtiene productos similares a uno dado
 * @param {string} productId - ID del producto
 * @param {number} limit - Límite de productos
 * @returns {Promise} - Promesa con productos similares
 */
export const getSimilarProducts = async (productId, limit = 5) => {
    try {
        const response = await api.get(`/recommendations/similar/${productId}`, {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching similar products:', error);
        throw error;
    }
};

/**
 * Obtiene productos populares
 * @param {number} limit - Límite de productos
 * @returns {Promise} - Promesa con productos populares
 */
export const getPopularProducts = async (limit = 10) => {
    try {
        const response = await api.get('/recommendations/popular', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching popular products:', error);
        throw error;
    }
};

export default {
    getCustomerRecommendations,
    getMyRecommendations,
    getSimilarProducts,
    getPopularProducts
};

