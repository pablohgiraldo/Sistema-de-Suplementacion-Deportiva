import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';

// Hook para manejar inventario de productos
export const useInventory = (productId) => {
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInventory = useCallback(async () => {
        if (!productId) return;

        setLoading(true);
        setError(null);

        try {
            const result = await inventoryService.getProductInventory(productId);
            if (result.success) {
                setInventory(result.data);
            } else {
                setError('No se pudo obtener información del inventario');
            }
        } catch (err) {
            setError('Error al cargar inventario');
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const refreshInventory = useCallback(() => {
        fetchInventory();
    }, [fetchInventory]);

    return {
        inventory,
        loading,
        error,
        refreshInventory
    };
};

// Hook para múltiples productos
export const useMultipleInventory = (productIds) => {
    const [inventories, setInventories] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInventories = useCallback(async () => {
        if (!productIds || productIds.length === 0) {
            setInventories({});
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const promises = productIds.map(async (productId) => {
                try {
                    const result = await inventoryService.getProductInventory(productId);
                    return { productId, inventory: result.success ? result.data : null };
                } catch (err) {
                    console.error(`Error fetching inventory for product ${productId}:`, err);
                    return { productId, inventory: null };
                }
            });

            const results = await Promise.all(promises);
            const inventoryMap = {};

            results.forEach(({ productId, inventory }) => {
                inventoryMap[productId] = inventory;
            });

            setInventories(inventoryMap);
        } catch (err) {
            setError('Error al cargar inventarios');
            console.error('Error fetching inventories:', err);
        } finally {
            setLoading(false);
        }
    }, [productIds]);

    useEffect(() => {
        // Debounce para evitar llamadas excesivas
        const timeoutId = setTimeout(() => {
            fetchInventories();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [fetchInventories]);

    const refreshInventories = useCallback(() => {
        fetchInventories();
    }, [fetchInventories]);

    return {
        inventories,
        loading,
        error,
        refreshInventories
    };
};

// Utilidades para trabajar con inventario
export const inventoryUtils = {
    getStockStatus: (inventory) => {
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
    },

    getStockStatusColor: (inventory) => {
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
    },

    canAddToCart: (inventory, requestedQuantity = 1) => {
        if (!inventory) return false;

        return inventory.status === 'active' &&
            inventory.availableStock >= requestedQuantity;
    },

    getStockDisplayText: (inventory) => {
        if (!inventory) return 'Stock no disponible';

        if (inventory.status !== 'active') {
            return 'Producto no disponible';
        }

        return `${inventory.availableStock} unidades disponibles`;
    }
};

export default useInventory;
