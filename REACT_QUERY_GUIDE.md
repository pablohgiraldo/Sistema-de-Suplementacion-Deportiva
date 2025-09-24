# Guía de React Query para SuperGains

## 📋 Descripción General

React Query (TanStack Query) ha sido implementado en SuperGains para optimizar el rendimiento de la aplicación mediante:

- **Caching inteligente** de datos de API
- **Sincronización automática** en segundo plano
- **Gestión de estado** optimizada
- **Manejo de errores** robusto
- **Reintentos automáticos** con backoff exponencial

## 🚀 Características Implementadas

### 1. **Query Client Configuration**
- **Stale Time**: 5 minutos (datos frescos)
- **GC Time**: 10 minutos (tiempo en cache)
- **Retry Logic**: Hasta 3 intentos con backoff exponencial
- **Auto Refetch**: En foco de ventana y reconexión de red

### 2. **Hooks Personalizados**

#### **useProducts.js**
- `useProducts(filters)` - Obtener productos con filtros
- `useProduct(id)` - Obtener producto específico
- `useProductInventory(id)` - Inventario de producto
- `useInventoryStats()` - Estadísticas de inventario
- `useStockAlerts()` - Alertas de stock
- `useInventoryMutations()` - Operaciones de inventario

#### **useCart.js**
- `useCartItems()` - Items del carrito
- `useCartCount()` - Conteo del carrito
- `useCartMutations()` - Operaciones del carrito

#### **useAdmin.js**
- `useUsers()` - Lista de usuarios (admin)
- `useInventory(filters)` - Inventario con filtros
- `useAdminStats()` - Estadísticas de admin
- `useAdminAlerts()` - Alertas de stock
- `useAdminMutations()` - Operaciones de admin

### 3. **Query Keys Estratificadas**
```javascript
// Ejemplo de estructura de keys
productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), { filters }],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
}
```

## 🔧 Configuración

### **QueryProvider Setup**
```jsx
// main.jsx
import QueryProvider from './providers/QueryProvider.jsx';

<QueryProvider>
  <App />
</QueryProvider>
```

### **Uso Básico**
```jsx
// En lugar de useState + useEffect
const { data, isLoading, error } = useProducts();

// Para mutaciones
const { restock } = useInventoryMutations();
const handleRestock = () => {
  restock.mutate({ itemId, quantity, notes });
};
```

## ⚡ Beneficios de Rendimiento

### **1. Caching Inteligente**
- **Datos frescos**: No se refetch si los datos son recientes
- **Cache persistente**: Datos se mantienen en memoria
- **Invalidación selectiva**: Solo se actualizan queries relacionadas

### **2. Optimizaciones de Red**
- **Deduplicación**: Múltiples requests simultáneos se combinan
- **Background refetch**: Actualizaciones silenciosas
- **Stale-while-revalidate**: Muestra datos cached mientras actualiza

### **3. UX Mejorada**
- **Loading states**: Estados de carga granulares
- **Error boundaries**: Manejo de errores robusto
- **Optimistic updates**: Actualizaciones optimistas

## 📊 Métricas de Rendimiento

### **Antes de React Query**
- ❌ Requests duplicados en cada render
- ❌ No caching de datos
- ❌ Estados de loading manuales
- ❌ Manejo de errores inconsistente

### **Después de React Query**
- ✅ Requests deduplicados automáticamente
- ✅ Cache inteligente con invalidación
- ✅ Estados de loading automáticos
- ✅ Retry automático con backoff
- ✅ Background refetch
- ✅ Optimistic updates

## 🛠️ Patrones de Uso

### **1. Queries Básicas**
```jsx
function ProductList() {
  const { data: products, isLoading, error } = useProducts();
  
  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;
  
  return <ProductGrid products={products} />;
}
```

### **2. Mutaciones con Invalidación**
```jsx
function RestockButton({ itemId }) {
  const { restock } = useInventoryMutations();
  
  const handleRestock = () => {
    restock.mutate(
      { itemId, quantity: 50 },
      {
        onSuccess: () => toast.success('Stock actualizado'),
        onError: (error) => toast.error(error.message),
      }
    );
  };
  
  return (
    <button 
      onClick={handleRestock}
      disabled={restock.isPending}
    >
      {restock.isPending ? 'Actualizando...' : 'Reabastecer'}
    </button>
  );
}
```

### **3. Queries Dependientes**
```jsx
function ProductDetail({ productId }) {
  const { data: product } = useProduct(productId);
  const { data: inventory } = useProductInventory(productId);
  
  // inventory solo se ejecuta si productId existe
  return <ProductInfo product={product} inventory={inventory} />;
}
```

## 🔄 Invalidación de Cache

### **Invalidación Automática**
- Después de mutaciones exitosas
- En eventos personalizados (`inventoryUpdated`)
- En reconexión de red

### **Invalidación Manual**
```jsx
const queryClient = useQueryClient();

// Invalidar todas las queries de productos
queryClient.invalidateQueries({ queryKey: productKeys.all });

// Invalidar query específica
queryClient.invalidateQueries({ queryKey: productKeys.detail(productId) });
```

## 🐛 Debugging

### **React Query DevTools**
- Disponible solo en desarrollo
- Muestra estado de queries en tiempo real
- Permite invalidar cache manualmente
- Visualiza dependencias entre queries

### **Logs Útiles**
```jsx
// En QueryProvider
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => console.error('Query error:', error),
    },
    mutations: {
      onError: (error) => console.error('Mutation error:', error),
    },
  },
});
```

## 📈 Próximas Optimizaciones

### **1. Prefetching**
```jsx
// Prefetch productos populares
queryClient.prefetchQuery({
  queryKey: productKeys.list({ featured: true }),
  queryFn: () => fetchFeaturedProducts(),
});
```

### **2. Infinite Queries**
```jsx
// Para paginación infinita
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: productKeys.lists(),
  queryFn: ({ pageParam = 0 }) => fetchProducts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextPage,
});
```

### **3. Optimistic Updates**
```jsx
const updateProduct = useMutation({
  mutationFn: updateProductAPI,
  onMutate: async (newProduct) => {
    // Cancelar queries en curso
    await queryClient.cancelQueries({ queryKey: productKeys.detail(id) });
    
    // Snapshot del estado anterior
    const previousProduct = queryClient.getQueryData(productKeys.detail(id));
    
    // Actualización optimista
    queryClient.setQueryData(productKeys.detail(id), newProduct);
    
    return { previousProduct };
  },
  onError: (err, newProduct, context) => {
    // Rollback en caso de error
    queryClient.setQueryData(productKeys.detail(id), context.previousProduct);
  },
});
```

## 🎯 Mejores Prácticas

1. **Usar query keys consistentes** para facilitar invalidación
2. **Implementar error boundaries** para queries críticas
3. **Configurar staleTime apropiado** según la frecuencia de cambio
4. **Usar mutations para operaciones que modifican datos**
5. **Implementar loading states** para mejor UX
6. **Monitorear métricas** de rendimiento con DevTools

## 📚 Recursos Adicionales

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Query Patterns](https://tkdodo.eu/blog/practical-react-query)
- [Query Key Factory](https://tkdodo.eu/blog/effective-react-query-keys)
- [Error Handling](https://tkdodo.eu/blog/react-query-error-handling)
