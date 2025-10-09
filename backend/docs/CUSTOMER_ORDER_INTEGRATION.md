# Integración Customer/Order - Historial de Compras

## 📋 Resumen

Esta documentación describe la integración completa entre los modelos **Customer** y **Order** para el sistema CRM de SuperGains, permitiendo el seguimiento automático del historial de compras y métricas de clientes.

## ✨ Funcionalidades Implementadas

### 1. Endpoints de Historial de Compras

#### `GET /api/customers/:id/purchase-history`
Obtiene el historial de compras completo de un customer con estadísticas detalladas.

**Parámetros de Query:**
- `page` (default: 1): Número de página
- `limit` (default: 10): Límite de resultados por página
- `status`: Filtrar por estado de orden
- `sortBy` (default: 'createdAt'): Campo de ordenamiento
- `order` (default: 'desc'): Dirección del ordenamiento

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "stats": {
      "totalSpent": 500000,
      "totalOrders": 10,
      "avgOrderValue": 50000,
      "totalItems": 25
    },
    "topProducts": [...],
    "customer": {
      "id": "...",
      "customerCode": "CUS-20251009-ABC12",
      "segment": "Frecuente",
      "loyaltyLevel": "Oro",
      "loyaltyPoints": 5000
    }
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### `POST /api/customers/sync-orders`
Sincroniza manualmente todos los customers con sus órdenes.

**Respuesta:**
```json
{
  "success": true,
  "message": "Sincronización completada",
  "results": {
    "total": 31,
    "success": 31,
    "errors": 0
  }
}
```

### 2. Sincronización Automática

#### Hook en Creación de Órdenes
Cuando se crea una orden nueva (`createOrder`), automáticamente:
1. Busca o crea el customer del usuario
2. Actualiza métricas del customer
3. Agrega interacción al historial
4. Recalcula segmentación y nivel de fidelidad

#### Hook en Actualización de Estado
Cuando se actualiza el estado de una orden (`updateOrderStatus`, `cancelOrder`):
1. Sincroniza métricas del customer
2. Actualiza segmentación automática
3. Recalcula riesgo de abandono

**Estados que activan sincronización:**
- `delivered` (entregado)
- `cancelled` (cancelado)

### 3. Servicio de Sincronización

**Archivo:** `backend/src/services/customerSyncService.js`

#### Funciones Principales:

##### `syncCustomerAfterOrder(userId, order)`
Sincroniza un customer después de crear/actualizar una orden.
- Crea customer si no existe
- Actualiza métricas desde órdenes
- Agrega interacción al historial

##### `createCustomerFromUser(userId)`
Crea un customer automáticamente desde un usuario.

##### `updateCustomerPreferences(userId)`
Actualiza preferencias basándose en historial de compras:
- Categorías favoritas
- Marcas preferidas

##### `syncAllCustomers()`
Sincroniza todos los customers con sus órdenes.

##### `createMissingCustomers()`
Crea customers para usuarios que no tienen uno.

## 📊 Métricas Actualizadas Automáticamente

El sistema actualiza automáticamente las siguientes métricas en el modelo Customer:

### Métricas Básicas
- `totalOrders`: Total de órdenes completadas
- `totalSpent`: Monto total gastado
- `averageOrderValue`: Valor promedio de orden
- `lastOrderDate`: Fecha de última orden
- `daysSinceLastOrder`: Días desde la última orden

### Métricas de Valor
- `lifetimeValue`: Valor total del cliente (LTV)
- `isHighValue`: Si es cliente de alto valor (>= $1,000,000 COP)

### Segmentación Automática
Basada en comportamiento de compra:
- **VIP**: LTV >= $2,000,000 y >= 10 órdenes
- **Frecuente**: >= 5 órdenes y <= 30 días desde última orden
- **Ocasional**: >= 2 órdenes y <= 90 días desde última orden
- **En Riesgo**: > 90 días desde última orden
- **Inactivo**: > 180 días desde última orden
- **Nuevo**: Sin órdenes

### Nivel de Fidelidad
Basado en Lifetime Value:
- **Diamante**: >= $5,000,000 COP
- **Platino**: >= $3,000,000 COP
- **Oro**: >= $1,500,000 COP
- **Plata**: >= $500,000 COP
- **Bronce**: < $500,000 COP

### Riesgo de Abandono (Churn Risk)
- **Alto**: > 180 días sin comprar
- **Medio**: > 90 días sin comprar
- **Bajo**: <= 90 días sin comprar

## 🔄 Flujo de Sincronización

### Flujo al Crear una Orden

```
1. Usuario completa checkout
   ↓
2. Se crea Order en DB
   ↓
3. Se actualiza inventario
   ↓
4. syncCustomerAfterOrder() se ejecuta
   ↓
5. Se busca/crea Customer
   ↓
6. updateMetricsFromOrders() actualiza métricas
   ↓
7. addInteraction() registra compra
   ↓
8. Auto-segmentación y cálculo de métricas
   ↓
9. Se guarda Customer actualizado
   ↓
10. Se limpia el carrito
```

### Flujo al Actualizar Estado de Orden

```
1. Admin/Sistema cambia estado a 'delivered'
   ↓
2. Se actualiza Order en DB
   ↓
3. Se libera stock reservado
   ↓
4. syncCustomerAfterOrder() se ejecuta
   ↓
5. updateMetricsFromOrders() recalcula métricas
   ↓
6. Auto-segmentación actualizada
   ↓
7. Se guarda Customer actualizado
```

## 🎯 Casos de Uso

### 1. Ver Historial de Compras Completo
```bash
GET /api/customers/64f123.../purchase-history?page=1&limit=10
```

### 2. Ver Productos Más Comprados
El endpoint de purchase-history incluye automáticamente los top 5 productos más comprados.

### 3. Sincronización Manual
Útil después de importar datos o corregir inconsistencias:
```bash
POST /api/customers/sync-orders
Authorization: Bearer <admin-token>
```

### 4. Ver Estadísticas de Un Cliente
```bash
GET /api/customers/:id
```
Incluye métricas completas y últimas 10 órdenes.

## 🧪 Testing

### Script de Prueba
Ejecutar el script de prueba completo:
```bash
npm run test-customer-order
```

O directamente:
```bash
node scripts/test-customer-order-integration.js
```

El script prueba:
1. Creación de customers faltantes
2. Sincronización masiva
3. Verificación de métricas
4. Estadísticas generales
5. Top customers por valor

## 🔒 Seguridad y Permisos

### Endpoints que Requieren Admin
- `GET /api/customers/:id/purchase-history`
- `POST /api/customers/sync-orders`
- `PUT /api/customers/:id/update-metrics`

### Rate Limiting
Todos los endpoints de customers usan `adminRateLimit`:
- **Desarrollo**: 1000 requests/15min
- **Producción**: 200 requests/15min

## 📈 Mejoras Futuras

1. **Análisis Predictivo**: Predecir próxima compra basada en historial
2. **Recomendaciones**: Sugerir productos basados en historial
3. **Notificaciones**: Alertas automáticas para clientes en riesgo
4. **Segmentación Avanzada**: Más criterios de segmentación
5. **Puntos de Fidelidad**: Sistema de recompensas automático por compra

## 🐛 Troubleshooting

### Customer no se sincroniza automáticamente
1. Verificar que JWT_SECRET esté configurado
2. Revisar logs del servidor para errores
3. Ejecutar sincronización manual: `POST /api/customers/sync-orders`

### Métricas incorrectas
1. Ejecutar sincronización manual para recalcular
2. Verificar que las órdenes tengan el campo `user` correcto
3. Revisar que el status de órdenes sea válido para contar

### No aparecen customers
1. Ejecutar `createMissingCustomers()` vía endpoint sync-orders
2. Verificar que los usuarios tengan el campo `activo: true`

## 📞 Endpoints Relacionados

### Customers
- `GET /api/customers` - Listar todos los customers
- `GET /api/customers/:id` - Obtener customer por ID
- `GET /api/customers/:id/purchase-history` - **Historial de compras**
- `PUT /api/customers/:id/update-metrics` - Actualizar métricas
- `POST /api/customers/sync-orders` - **Sincronizar con órdenes**
- `GET /api/customers/dashboard` - Dashboard general del CRM

### Orders
- `GET /api/orders` - Listar órdenes
- `POST /api/orders` - Crear orden (sincroniza automáticamente)
- `PUT /api/orders/:id/status` - Actualizar estado (sincroniza automáticamente)
- `DELETE /api/orders/:id` - Cancelar orden (sincroniza automáticamente)

---

## 📝 Notas de Implementación

- La sincronización es **no bloqueante**: Si falla, no afecta la creación de la orden
- Los errores de sincronización se logean pero no detienen el flujo
- Las preferencias se actualizan basándose en categorías y marcas compradas
- El sistema mantiene solo las últimas 10 interacciones en el historial
- La segmentación se recalcula automáticamente en cada guardado del customer

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0  
**Estado**: Implementado y probado ✅

