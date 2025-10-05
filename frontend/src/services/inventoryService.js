import api from './api';

// Servicio para obtener información de inventario
export const inventoryService = {
    // Obtener inventario de un producto específico
    async getProductInventory(productId) {
        try {
            const response = await api.get(`/inventory/product/${productId}`);
            return response.data;
        } catch (error) {
            // Si es 404 o 429, usar fallback silenciosamente
            // 404: producto sin inventario registrado
            // 429: rate limit excedido
            if (error.response?.status === 404 || error.response?.status === 429) {
                return { success: false, data: null };
            }
            console.error('Error obteniendo inventario del producto:', error);
            throw error;
        }
    },

    // Obtener todos los inventarios con filtros
    async getInventories(filters = {}) {
        try {
            const params = new URLSearchParams();

            if (filters.status) params.append('status', filters.status);
            if (filters.stock_min) params.append('stock_min', filters.stock_min);
            if (filters.stock_max) params.append('stock_max', filters.stock_max);
            if (filters.needs_restock) params.append('needs_restock', filters.needs_restock);
            if (filters.limit) params.append('limit', filters.limit);
            if (filters.page) params.append('page', filters.page);
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

            const response = await api.get(`/inventory?${params.toString()}`);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo inventarios:', error);
            throw error;
        }
    },

    // Obtener estadísticas de inventario
    async getInventoryStats() {
        try {
            const response = await api.get('/inventory/stats');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo estadísticas de inventario:', error);
            throw error;
        }
    },

    // Obtener productos con stock bajo
    async getLowStockProducts() {
        try {
            const response = await api.get('/inventory/low-stock');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo productos con stock bajo:', error);
            throw error;
        }
    },

    // Obtener productos agotados
    async getOutOfStockProducts() {
        try {
            const response = await api.get('/inventory/out-of-stock');
            return response.data;
        } catch (error) {
            console.error('Error obteniendo productos agotados:', error);
            throw error;
        }
    }
};

// Hook personalizado para usar inventario
export const useInventory = () => {
    const getProductStock = async (productId) => {
        try {
            const result = await inventoryService.getProductInventory(productId);
            if (result.success) {
                return {
                    currentStock: result.data.currentStock,
                    availableStock: result.data.availableStock,
                    status: result.data.status,
                    needsRestock: result.data.needsRestock,
                    stockStatus: result.data.stockStatus
                };
            }
            return null;
        } catch (error) {
            console.error('Error obteniendo stock del producto:', error);
            return null;
        }
    };

    const getStockStatus = (inventory) => {
        if (!inventory) return 'Desconocido';

        if (inventory.status !== 'active') {
            return 'No disponible';
        }

        if (inventory.availableStock === 0) {
            return 'Agotado';
        }

        if (inventory.needsRestock) {
            return 'Stock bajo';
        }

        return 'Disponible';
    };

    const getStockStatusColor = (inventory) => {
        if (!inventory) return 'bg-gray-100 text-gray-800';

        if (inventory.status !== 'active') {
            return 'bg-gray-100 text-gray-800';
        }

        if (inventory.availableStock === 0) {
            return 'bg-red-100 text-red-800';
        }

        if (inventory.needsRestock) {
            return 'bg-yellow-100 text-yellow-800';
        }

        return 'bg-green-100 text-green-800';
    };

    const canAddToCart = (inventory, requestedQuantity = 1) => {
        if (!inventory) return false;

        return inventory.status === 'active' &&
            inventory.availableStock >= requestedQuantity;
    };

    return {
        getProductStock,
        getStockStatus,
        getStockStatusColor,
        canAddToCart
    };
};

export default inventoryService;
