# Sistema de Alertas de Reabastecimiento - SuperGains

## 📋 Descripción General

El sistema de alertas de reabastecimiento permite a los administradores recibir notificaciones automáticas cuando el stock de productos sea bajo, crítico o agotado. El sistema es completamente configurable por producto y soporta múltiples canales de notificación.

## 🏗️ Arquitectura del Sistema

### Modelos de Datos

#### 1. AlertConfig
Modelo principal que define la configuración de alertas para cada producto:

```javascript
{
  product: ObjectId,           // Referencia al producto
  lowStockThreshold: Number,   // Umbral para stock bajo (default: 10)
  criticalStockThreshold: Number, // Umbral para stock crítico (default: 5)
  outOfStockThreshold: Number, // Umbral para stock agotado (default: 0)
  
  // Configuración de alertas por email
  emailAlerts: {
    enabled: Boolean,
    lowStock: Boolean,
    criticalStock: Boolean,
    outOfStock: Boolean,
    recipients: [String]       // Lista de emails
  },
  
  // Configuración de alertas en la aplicación
  appAlerts: {
    enabled: Boolean,
    lowStock: Boolean,
    criticalStock: Boolean,
    outOfStock: Boolean
  },
  
  // Configuración de webhooks (futuro)
  webhookAlerts: {
    enabled: Boolean,
    url: String,
    events: [String]
  },
  
  alertFrequency: String,      // 'immediate', 'hourly', 'daily', 'weekly'
  autoRestock: {
    enabled: Boolean,
    quantity: Number,
    supplier: String
  },
  status: String              // 'active', 'inactive', 'suspended'
}
```

### Endpoints de la API

#### Configuraciones de Alertas
- `GET /api/alerts` - Obtener todas las configuraciones
- `GET /api/alerts/product/:productId` - Obtener configuración por producto
- `POST /api/alerts/product/:productId` - Crear nueva configuración
- `PUT /api/alerts/product/:productId` - Actualizar configuración
- `DELETE /api/alerts/product/:productId` - Eliminar configuración
- `POST /api/alerts/product/:productId/default` - Crear configuración por defecto

#### Alertas y Estadísticas
- `GET /api/alerts/low-stock` - Obtener productos con stock bajo
- `GET /api/alerts/stats` - Obtener estadísticas de alertas

## 🚀 Configuración Inicial

### 1. Crear Configuraciones por Defecto

```bash
# Ejecutar script para crear configuraciones por defecto
npm run create-alert-configs
```

### 2. Probar el Sistema

```bash
# Ejecutar pruebas del sistema de alertas
npm run test-alert-system
```

## 📱 Componentes Frontend

### 1. AlertConfigForm
Componente para configurar alertas por producto:
- Configuración de thresholds (stock bajo, crítico, agotado)
- Configuración de alertas por email
- Configuración de alertas en la aplicación
- Configuración de frecuencia de alertas
- Configuración de auto-reabastecimiento

### 2. StockAlerts
Componente para mostrar alertas activas:
- Lista de productos con stock bajo
- Estadísticas de alertas
- Configuración rápida de alertas
- Filtros por severidad

### 3. Hooks de React Query
- `useAlertConfigs()` - Obtener todas las configuraciones
- `useAlertConfig(productId)` - Obtener configuración por producto
- `useLowStockAlerts()` - Obtener alertas de stock bajo
- `useAlertStats()` - Obtener estadísticas
- `useAlertConfigMutations()` - Operaciones CRUD

## ⚙️ Configuración de Thresholds

### Niveles de Alerta

1. **Stock Bajo** (Warning)
   - Color: Amarillo
   - Icono: ⚠️
   - Acción: Notificación informativa

2. **Stock Crítico** (Error)
   - Color: Naranja
   - Icono: ⚠️
   - Acción: Notificación urgente

3. **Stock Agotado** (Critical)
   - Color: Rojo
   - Icono: 🚨
   - Acción: Notificación crítica

### Configuración Recomendada

```javascript
// Para productos de alta rotación
{
  lowStockThreshold: 20,
  criticalStockThreshold: 10,
  outOfStockThreshold: 0
}

// Para productos de baja rotación
{
  lowStockThreshold: 5,
  criticalStockThreshold: 2,
  outOfStockThreshold: 0
}

// Para productos estacionales
{
  lowStockThreshold: 50,
  criticalStockThreshold: 25,
  outOfStockThreshold: 0
}
```

## 🔔 Canales de Notificación

### 1. Email
- Configuración por producto
- Múltiples destinatarios
- Templates personalizables (futuro)

### 2. Aplicación
- Notificaciones en tiempo real
- Dashboard de alertas
- Historial de alertas

### 3. Webhooks (Futuro)
- Integración con sistemas externos
- Slack, Discord, Teams
- Sistemas de inventario externos

## 📊 Monitoreo y Estadísticas

### Métricas Disponibles
- Total de configuraciones activas
- Número de alertas por tipo
- Productos con stock bajo
- Productos con stock crítico
- Productos agotados

### Dashboard de Alertas
- Vista en tiempo real
- Filtros por severidad
- Acciones rápidas
- Configuración inline

## 🔧 Mantenimiento

### Tareas Regulares
1. **Revisar configuraciones** - Verificar que los thresholds sean apropiados
2. **Actualizar destinatarios** - Mantener lista de emails actualizada
3. **Monitorear falsos positivos** - Ajustar thresholds si es necesario
4. **Revisar frecuencia** - Optimizar frecuencia de alertas

### Scripts de Mantenimiento
```bash
# Crear configuraciones para productos nuevos
npm run create-alert-configs

# Probar sistema completo
npm run test-alert-system

# Monitorear rendimiento
npm run monitor-performance
```

## 🚨 Solución de Problemas

### Problemas Comunes

1. **Alertas no se envían**
   - Verificar que la configuración esté activa
   - Revisar destinatarios de email
   - Verificar frecuencia de alertas

2. **Demasiadas alertas**
   - Ajustar thresholds
   - Cambiar frecuencia a 'daily' o 'weekly'
   - Revisar configuración de productos

3. **Alertas faltantes**
   - Verificar que el producto tenga configuración
   - Revisar status de la configuración
   - Verificar conectividad con base de datos

### Logs y Debugging
- Revisar logs del servidor
- Usar endpoint de estadísticas
- Ejecutar script de pruebas

## 🔮 Funcionalidades Futuras

### Fase 2
- [ ] Templates de email personalizables
- [ ] Integración con webhooks
- [ ] Alertas por SMS
- [ ] Dashboard avanzado con gráficos

### Fase 3
- [ ] Machine Learning para optimizar thresholds
- [ ] Predicción de demanda
- [ ] Integración con proveedores
- [ ] Auto-reabastecimiento inteligente

## 📚 Referencias

- [Documentación de MongoDB](https://docs.mongodb.com/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Schema Guide](https://mongoosejs.com/docs/guide.html)
