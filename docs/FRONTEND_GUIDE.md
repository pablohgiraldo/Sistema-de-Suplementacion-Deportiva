# 🎨 FRONTEND_GUIDE.md - SuperGains

## 📋 Resumen

Esta guía proporciona información completa sobre el desarrollo frontend de SuperGains, incluyendo arquitectura, componentes, hooks, servicios y mejores prácticas.

## 🏗️ Arquitectura del Frontend

### Stack Tecnológico
- **React 18**: Framework principal
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de estilos
- **React Router**: Navegación
- **React Query**: Gestión de estado del servidor
- **Axios**: Cliente HTTP
- **React Hook Form**: Manejo de formularios

### Estructura de Directorios
```
frontend/src/
├── components/          # Componentes reutilizables
│   ├── ui/             # Componentes de UI base
│   ├── forms/          # Componentes de formularios
│   └── icons/          # Iconos personalizados
├── pages/              # Páginas de la aplicación
├── contexts/           # Contextos de React
├── hooks/              # Custom hooks
├── services/           # Servicios de API
├── utils/              # Utilidades
├── providers/          # Providers de React Query
└── styles/             # Estilos globales
```

## 🧩 Componentes Principales

### 1. Header
**Ubicación**: `components/Header.jsx`
**Funcionalidad**: Navegación principal, autenticación, carrito

**Características**:
- Navegación responsive
- Menú hamburguesa móvil
- Integración con AuthContext
- Carrito de compras
- Búsqueda de productos

### 2. ProductCard
**Ubicación**: `components/productCard.jsx`
**Funcionalidad**: Tarjeta de producto individual

**Características**:
- Imagen del producto
- Información básica (nombre, precio)
- Botones de acción (agregar al carrito, wishlist)
- Gestión de inventario
- Responsive design

### 3. Cart
**Ubicación**: `pages/Cart.jsx`
**Funcionalidad**: Gestión del carrito de compras

**Características**:
- Lista de productos
- Modificación de cantidades
- Cálculo de totales
- Proceso de checkout
- Integración con PayU

### 4. Checkout
**Ubicación**: `pages/Checkout.jsx`
**Funcionalidad**: Proceso de finalización de compra

**Características**:
- Formulario de datos personales
- Selección de método de pago
- Validación de formularios
- Integración con PayU
- Manejo de errores

## 🔧 Hooks Personalizados

### 1. useAuth
**Ubicación**: `contexts/AuthContext.jsx`
**Funcionalidad**: Gestión de autenticación

**Métodos**:
- `login()`: Iniciar sesión
- `logout()`: Cerrar sesión
- `register()`: Registro de usuario
- `validateToken()`: Validar token JWT

### 2. useCart
**Ubicación**: `contexts/CartContext.jsx`
**Funcionalidad**: Gestión del carrito

**Métodos**:
- `addToCart()`: Agregar producto
- `removeFromCart()`: Eliminar producto
- `updateQuantity()`: Actualizar cantidad
- `clearCart()`: Limpiar carrito

### 3. useProducts
**Ubicación**: `hooks/useProducts.js`
**Funcionalidad**: Gestión de productos

**Métodos**:
- `useProducts()`: Obtener lista de productos
- `useProduct()`: Obtener producto específico
- `useCreateProduct()`: Crear producto
- `useUpdateProduct()`: Actualizar producto

### 4. useOrders
**Ubicación**: `hooks/useOrders.js`
**Funcionalidad**: Gestión de órdenes

**Métodos**:
- `useOrders()`: Obtener órdenes del usuario
- `useOrder()`: Obtener orden específica
- `useCreateOrder()`: Crear nueva orden
- `useCancelOrder()`: Cancelar orden

## 🌐 Servicios de API

### 1. API Client
**Ubicación**: `services/api.js`
**Funcionalidad**: Cliente HTTP configurado

**Características**:
- Interceptores de request/response
- Manejo automático de tokens
- Refresh token automático
- Timeout configurable

### 2. Product Service
**Ubicación**: `services/productService.js`
**Funcionalidad**: Servicios relacionados con productos

**Métodos**:
- `getProducts()`: Obtener productos
- `getProductById()`: Obtener producto por ID
- `createProduct()`: Crear producto
- `updateProduct()`: Actualizar producto

### 3. Order Service
**Ubicación**: `services/orderService.js`
**Funcionalidad**: Servicios relacionados con órdenes

**Métodos**:
- `getOrders()`: Obtener órdenes
- `getOrderById()`: Obtener orden por ID
- `createOrder()`: Crear orden
- `cancelOrder()`: Cancelar orden

## 🎨 Sistema de Diseño

### Colores
```css
/* Colores principales */
--primary: #3B82F6    /* Azul */
--secondary: #10B981  /* Verde */
--accent: #F59E0B     /* Amarillo */
--danger: #EF4444     /* Rojo */
--warning: #F97316    /* Naranja */
--info: #06B6D4       /* Cian */
```

### Tipografía
- **Fuente principal**: Inter (Google Fonts)
- **Tamaños**: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl
- **Pesos**: font-normal, font-medium, font-semibold, font-bold

### Espaciado
- **Base**: 4px (1rem = 16px)
- **Escala**: 1, 2, 3, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64

## 📱 Responsive Design

### Breakpoints
```css
sm: 640px   /* Móvil grande */
md: 768px   /* Tablet */
lg: 1024px  /* Laptop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### Estrategia
- **Mobile First**: Diseño comenzando desde móvil
- **Progressive Enhancement**: Mejoras progresivas
- **Flexible Grid**: Grid system responsive
- **Adaptive Images**: Imágenes que se adaptan

## 🔒 Gestión de Estado

### Context API
- **AuthContext**: Estado de autenticación
- **CartContext**: Estado del carrito
- **ThemeContext**: Tema de la aplicación

### React Query
- **Cache**: Caché automático de datos del servidor
- **Background Updates**: Actualizaciones en segundo plano
- **Optimistic Updates**: Actualizaciones optimistas
- **Error Handling**: Manejo de errores

## 🧪 Testing

### Herramientas
- **Vitest**: Framework de testing
- **React Testing Library**: Testing de componentes
- **MSW**: Mock Service Worker
- **Jest**: Testing utilities

### Estrategia
- **Unit Tests**: Componentes individuales
- **Integration Tests**: Interacciones entre componentes
- **E2E Tests**: Flujos completos de usuario

## 🚀 Performance

### Optimizaciones
- **Lazy Loading**: Carga diferida de componentes
- **Code Splitting**: División de código
- **Image Optimization**: Optimización de imágenes
- **Bundle Analysis**: Análisis de bundle

### Métricas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔧 Desarrollo

### Comandos
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Preview
npm run preview

# Testing
npm run test

# Linting
npm run lint
```

### Variables de Entorno
```env
VITE_API_URL=https://supergains-backend.onrender.com
```

## 📚 Mejores Prácticas

### Componentes
- Usar functional components
- Implementar PropTypes o TypeScript
- Separar lógica de presentación
- Reutilizar componentes

### Hooks
- Seguir las reglas de los hooks
- Usar custom hooks para lógica reutilizable
- Optimizar con useMemo y useCallback

### Estado
- Usar Context API para estado global
- React Query para estado del servidor
- useState para estado local

### Performance
- Implementar lazy loading
- Usar React.memo para optimización
- Evitar re-renders innecesarios

## 🐛 Debugging

### Herramientas
- **React Developer Tools**: Debug de componentes
- **Redux DevTools**: Debug de estado
- **Network Tab**: Debug de requests
- **Console**: Logs y errores

### Logging
```javascript
// Logging estructurado
console.log('🔍 Debug info:', { userId, action, data });
console.error('❌ Error:', error);
console.warn('⚠️ Warning:', warning);
```

## 📖 Recursos

### Documentación
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query)
- [React Router](https://reactrouter.com/)

### Herramientas
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

*Última actualización: Diciembre 2024*
