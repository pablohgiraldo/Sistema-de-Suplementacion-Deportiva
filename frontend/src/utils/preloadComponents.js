// Preload de componentes críticos para mejorar la experiencia del usuario
export const preloadCriticalComponents = () => {
    // Preload de componentes que probablemente se usarán pronto
    const criticalComponents = [
        () => import('../pages/Login'),
        () => import('../pages/Register'),
        () => import('../pages/Cart'),
        () => import('../components/ProductModal'),
        () => import('../components/ShoppingCart')
    ];

    // Preload después de que la página principal haya cargado
    setTimeout(() => {
        criticalComponents.forEach(importFunction => {
            importFunction().catch(error => {
                console.warn('Error preloading component:', error);
            });
        });
    }, 2000); // Preload después de 2 segundos
};

// Preload de componentes de admin cuando el usuario es admin
export const preloadAdminComponents = () => {
    const adminComponents = [
        () => import('../components/InventoryTable'),
        () => import('../components/InventoryStats'),
        () => import('../components/StockAlerts'),
        () => import('../components/NotificationContainer')
    ];

    setTimeout(() => {
        adminComponents.forEach(importFunction => {
            importFunction().catch(error => {
                console.warn('Error preloading admin component:', error);
            });
        });
    }, 1000);
};

// Preload de componentes de productos cuando se navega a la página principal
export const preloadProductComponents = () => {
    const productComponents = [
        () => import('../pages/ProductDetail'),
        () => import('../components/ProductModal')
    ];

    setTimeout(() => {
        productComponents.forEach(importFunction => {
            importFunction().catch(error => {
                console.warn('Error preloading product component:', error);
            });
        });
    }, 500);
};
