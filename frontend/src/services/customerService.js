/**
 * Customer Service - API calls para CRM
 */

import api from './api';

/**
 * Obtener dashboard general del CRM
 */
export const getCRMDashboard = async () => {
    try {
        const response = await api.get('/customers/dashboard');
        return response.data;
    } catch (error) {
        console.error('Error fetching CRM dashboard:', error);
        throw error;
    }
};

/**
 * Obtener todos los customers con filtros
 */
export const getCustomers = async (filters = {}) => {
    try {
        const params = new URLSearchParams();

        if (filters.segment) params.append('segment', filters.segment);
        if (filters.loyaltyLevel) params.append('loyaltyLevel', filters.loyaltyLevel);
        if (filters.status) params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.order) params.append('order', filters.order);

        const response = await api.get(`/customers?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customers:', error);
        throw error;
    }
};

/**
 * Obtener customer por ID
 */
export const getCustomerById = async (id) => {
    try {
        const response = await api.get(`/customers/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching customer:', error);
        throw error;
    }
};

/**
 * Obtener customers por segmento específico
 */
export const getCustomersBySegment = async (segment, page = 1, limit = 20) => {
    try {
        const response = await api.get(`/customers/segment/${segment}`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching customers by segment:', error);
        throw error;
    }
};

/**
 * Obtener análisis de segmentación completo
 */
export const getSegmentationAnalysis = async () => {
    try {
        const response = await api.get('/customers/segmentation/analysis');
        return response.data;
    } catch (error) {
        console.error('Error fetching segmentation analysis:', error);
        throw error;
    }
};

/**
 * Obtener estadísticas de segmentos
 */
export const getSegmentStats = async () => {
    try {
        const response = await api.get('/customers/stats/segments');
        return response.data;
    } catch (error) {
        console.error('Error fetching segment stats:', error);
        throw error;
    }
};

/**
 * Obtener customers de alto valor
 */
export const getHighValueCustomers = async (limit = 10) => {
    try {
        const response = await api.get('/customers/high-value', {
            params: { limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching high value customers:', error);
        throw error;
    }
};

/**
 * Obtener customers en riesgo de abandono
 */
export const getChurnRiskCustomers = async () => {
    try {
        const response = await api.get('/customers/churn-risk');
        return response.data;
    } catch (error) {
        console.error('Error fetching churn risk customers:', error);
        throw error;
    }
};

/**
 * Obtener historial de compras de un customer
 */
export const getCustomerPurchaseHistory = async (id, page = 1, limit = 10) => {
    try {
        const response = await api.get(`/customers/${id}/purchase-history`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        throw error;
    }
};

/**
 * Sincronizar todos los customers con sus órdenes
 */
export const syncCustomersWithOrders = async () => {
    try {
        const response = await api.post('/customers/sync-orders');
        return response.data;
    } catch (error) {
        console.error('Error syncing customers:', error);
        throw error;
    }
};

/**
 * Re-segmentar todos los customers
 */
export const resegmentAllCustomers = async () => {
    try {
        const response = await api.post('/customers/resegment');
        return response.data;
    } catch (error) {
        console.error('Error resegmenting customers:', error);
        throw error;
    }
};

/**
 * Actualizar métricas de un customer
 */
export const updateCustomerMetrics = async (id) => {
    try {
        const response = await api.put(`/customers/${id}/update-metrics`);
        return response.data;
    } catch (error) {
        console.error('Error updating customer metrics:', error);
        throw error;
    }
};

export default {
    getCRMDashboard,
    getCustomers,
    getCustomerById,
    getCustomersBySegment,
    getSegmentationAnalysis,
    getSegmentStats,
    getHighValueCustomers,
    getChurnRiskCustomers,
    getCustomerPurchaseHistory,
    syncCustomersWithOrders,
    resegmentAllCustomers,
    updateCustomerMetrics
};

