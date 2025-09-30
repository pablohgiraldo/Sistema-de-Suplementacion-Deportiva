import { lazy } from 'react';

// Componentes pesados que se cargan bajo demanda
export const LazyProductModal = lazy(() => import('./ProductModal'));
export const LazyShoppingCart = lazy(() => import('./ShoppingCart'));
export const LazyInventoryTable = lazy(() => import('./InventoryTable'));
export const LazyInventoryStats = lazy(() => import('./InventoryStats'));
export const LazyStockAlerts = lazy(() => import('./StockAlerts'));
export const LazyNotificationContainer = lazy(() => import('./NotificationContainer'));

// Componentes de formularios
export const LazyLoginForm = lazy(() => import('./LoginForm'));
export const LazyRegisterForm = lazy(() => import('./RegisterForm'));

// Componentes de admin
export const LazyAdminHeader = lazy(() => import('./AdminHeader'));
export const LazySalesChart = lazy(() => import('./DashboardSalesChart'));
