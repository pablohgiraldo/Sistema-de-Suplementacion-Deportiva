import { useState, useEffect, useCallback, useRef } from 'react';
import { inventoryService } from '../services/inventoryService';

// Caché global para inventario
const inventoryCache = new Map();
const cacheTimeout = 5 * 60 * 1000; // 5 minutos

// Hook para manejar inventario de productos
export const useInventory = (productId) => {
    const [inventory, setInventory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchInventory = useCallback(async () => {
        if (!productId) return;

        // Verificar caché primero
        const cached = inventoryCache.get(productId);
        if (cached && Date.now() - cached.timestamp < cacheTimeout) {
            setInventory(cached.data);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const result = await inventoryService.getProductInventory(productId);
            if (result.success) {
                const inventoryData = result.data;
                // Guardar en caché
                inventoryCache.set(productId, {
                    data: inventoryData,
                    timestamp: Date.now()
                });
                setInventory(inventoryData);
                setError(null);
            } else {
                // Si no hay inventario registrado, crear un inventario por defecto
                const defaultInventory = {
                    product: productId,
                    availableStock: 100, // Stock por defecto
                    status: 'active',
                    isDefault: true // Marcar como inventario por defecto
                };
                // Guardar en caché
                inventoryCache.set(productId, {
                    data: defaultInventory,
                    timestamp: Date.now()
                });
                setInventory(defaultInventory);
                setError(null);
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
        // Limpiar caché antes de refrescar
        inventoryCache.delete(productId);
        fetchInventory();
    }, [fetchInventory, productId]);

    return {
        inventory,
        loading,
        error,
        refreshInventory
    };
};

// Función para limpiar todo el caché
export const clearInventoryCache = () => {
    inventoryCache.clear();
};

// Función para limpiar caché de un producto específico
export const clearProductCache = (productId) => {
    inventoryCache.delete(productId);
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
            // Separar productos en caché y productos que necesitan fetch
            const cachedProducts = {};
            const productsToFetch = [];

            productIds.forEach(productId => {
                const cached = inventoryCache.get(productId);
                if (cached && Date.now() - cached.timestamp < cacheTimeout) {
                    cachedProducts[productId] = cached.data;
                } else {
                    productsToFetch.push(productId);
                }
            });

            // Solo hacer fetch de productos que no están en caché
            const promises = productsToFetch.map(async (productId) => {
                try {
                    const result = await inventoryService.getProductInventory(productId);
                    const inventoryData = result.success ? result.data : {
                        product: productId,
                        availableStock: 100,
                        status: 'active',
                        isDefault: true
                    };

                    // Guardar en caché
                    inventoryCache.set(productId, {
                        data: inventoryData,
                        timestamp: Date.now()
                    });

                    return { productId, inventory: inventoryData };
                } catch (err) {
                    console.error(`Error fetching inventory for product ${productId}:`, err);
                    return { productId, inventory: null };
                }
            });

            const results = await Promise.all(promises);
            const inventoryMap = { ...cachedProducts };

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
