# Guía de Estrategia de Fallback para MongoDB

## 📋 Índice
- [Introducción](#introducción)
- [Arquitectura](#arquitectura)
- [Componentes del Sistema](#componentes-del-sistema)
- [Flujo de Operación](#flujo-de-operación)
- [Configuración](#configuración)
- [Monitoreo y Alertas](#monitoreo-y-alertas)
- [Pruebas](#pruebas)
- [Troubleshooting](#troubleshooting)

## Introducción

La estrategia de fallback de SuperGains garantiza que el sistema continúe operando (en modo degradado) incluso cuando MongoDB no está disponible. Esto proporciona **resiliencia crítica** para mantener el servicio en línea durante fallos de base de datos.

### Objetivos:
- 🛡️ **Alta disponibilidad**: Sistema operativo 24/7
- 📦 **Degradación elegante**: Funcionalidades limitadas pero operativas
- 🔄 **Recuperación automática**: Reconexión sin intervención manual
- 🚨 **Alertas proactivas**: Notificaciones de fallos en tiempo real

## Arquitectura

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│     Middleware de Detección de Fallo    │
│  (checkDatabaseStatus, withFallback)    │
└──────┬──────────────────┬───────────────┘
       │                  │
       │ MongoDB OK       │ MongoDB Fallo
       ▼                  ▼
┌─────────────┐    ┌──────────────────────┐
│   MongoDB   │    │  Fallback Service    │
│  (Normal)   │    │  - Redis Cache       │
│             │    │  - Memory Cache      │
└─────────────┘    │  - Read Only Mode    │
                   └──────────────────────┘
```

## Componentes del Sistema

### 1. Fallback Service (`src/services/fallbackService.js`)

Servicio central que gestiona el estado de fallback y datos en memoria.

**Características:**
- Almacenamiento en memoria para datos críticos
- Verificación de estado de MongoDB
- Gestión de modo fallback
- Sincronización de datos
- Estadísticas y métricas

**Métodos principales:**
```javascript
fallbackService.checkMongoDBStatus(isAvailable)  // Actualizar estado
fallbackService.isInFallbackMode()               // Verificar modo
fallbackService.saveToMemory(collection, id, data) // Guardar en memoria
fallbackService.getFromFallback(collection, id)  // Obtener datos
fallbackService.getListFromFallback(collection)  // Obtener listado
```

### 2. Database Fallback Middleware (`src/middleware/databaseFallbackMiddleware.js`)

Middlewares para detectar y manejar fallos de MongoDB.

**Middlewares disponibles:**
- `checkDatabaseStatus`: Verifica estado de MongoDB en cada request
- `withFallback(controllerFn, fallbackFn)`: Envuelve controladores con lógica de fallback
- `readOnlyInFallback`: Bloquea operaciones de escritura en modo fallback
- `handleDatabaseError`: Maneja errores de MongoDB
- `addDegradedHeaders`: Agrega headers de estado degradado

### 3. Fallback Controllers (`src/controllers/fallbackControllers.js`)

Controladores específicos para modo fallback.

**Controladores implementados:**
- `getProductsFallback`: Obtiene productos desde caché/memoria
- `getProductByIdFallback`: Obtiene producto individual
- `searchProductsFallback`: Búsqueda en datos cacheados
- `getPopularProductsFallback`: Productos populares desde caché
- `getCartFallback`: Carrito desde caché
- `writeOperationFallback`: Respuesta para operaciones de escritura

### 4. Database Alert Service (`src/services/databaseAlertService.js`)

Sistema de alertas para notificar fallos de MongoDB.

**Características:**
- Alertas de fallo de base de datos
- Alertas de recuperación
- Múltiples handlers (consola, webhook, Slack, email)
- Cooldown para evitar spam
- Estadísticas de alertas

### 5. Enhanced Database Config (`src/config/db.js`)

Configuración de MongoDB con reconexión automática.

**Mejoras:**
- Reconexión automática (hasta 5 intentos)
- Manejo de eventos de conexión/desconexión
- Integración con fallback service
- No termina el proceso en caso de fallo
- Estadísticas de health

## Flujo de Operación

### Modo Normal (MongoDB Conectado)

```
Request → checkDatabaseStatus → MongoDB OK → Controller → Response
```

1. Request llega al servidor
2. Middleware verifica estado de MongoDB
3. MongoDB está conectado → Operación normal
4. Controller consulta MongoDB
5. Respuesta con datos frescos

### Modo Fallback (MongoDB Desconectado)

```
Request → checkDatabaseStatus → MongoDB FAIL → Fallback Controller → Cache/Memory → Response
```

1. Request llega al servidor
2. Middleware detecta MongoDB no disponible
3. Activa modo fallback
4. Ejecuta controlador de fallback
5. Obtiene datos de:
   - Redis Cache (primera prioridad)
   - Memory Cache (segunda prioridad)
   - Último recurso: respuesta de no disponible
6. Respuesta con datos cacheados (marcada como degraded)

### Reconexión Automática

```
MongoDB Fail → Intento 1 (5s) → Intento 2 (5s) → ... → Intento 5 (5s)
                    ↓
              Si tiene éxito → Restaurar modo normal → Alerta de recuperación
                    ↓
              Si falla → Modo fallback permanente → Alerta crítica
```

## Configuración

### Variables de Entorno

No requiere variables adicionales. El sistema funciona automáticamente.

**Opcionales (para alertas):**
```bash
# Webhook genérico
ALERT_WEBHOOK_URL=https://your-webhook.com/alerts

# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Configuración de reconexión (valores por defecto)
MAX_RECONNECT_ATTEMPTS=5
RECONNECT_INTERVAL=5000  # milisegundos
```

### Configuración en Código

En `src/config/db.js`:
```javascript
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;      // Máximo de intentos
const RECONNECT_INTERVAL = 5000;       // 5 segundos entre intentos
```

En `src/services/fallbackService.js`:
```javascript
this.maxFailures = 3;  // Fallos antes de activar modo fallback
```

## Aplicación en Rutas

### Ejemplo: Rutas de Productos

```javascript
import { withFallback, checkDatabaseStatus, readOnlyInFallback } from '../middleware/databaseFallbackMiddleware.js';
import { getProductsFallback } from '../controllers/fallbackControllers.js';

// Middleware global
router.use(checkDatabaseStatus);

// Rutas GET con fallback
router.get("/",
  productCacheMiddleware(),
  withFallback(getProducts, getProductsFallback)  // ← Fallback
);

// Rutas POST con protección
router.post("/",
  authMiddleware,
  readOnlyInFallback,  // ← Bloquea en modo fallback
  withFallback(createProduct, writeOperationFallback)
);
```

## Monitoreo y Alertas

### Health Check

```bash
GET /api/health
```

**Respuesta en modo normal:**
```json
{
  "status": "OK",
  "services": {
    "database": "connected",
    "databaseState": "connected",
    "fallback": "inactive"
  },
  "mongodb": {
    "connected": true,
    "stateName": "connected"
  },
  "fallback": {
    "isMongoDBAvailable": true,
    "isInFallbackMode": false,
    "failureCount": 0
  },
  "degraded": false
}
```

**Respuesta en modo fallback:**
```json
{
  "status": "DEGRADED",
  "message": "Server running in fallback mode",
  "services": {
    "database": "disconnected",
    "databaseState": "disconnected",
    "fallback": "active"
  },
  "mongodb": {
    "connected": false,
    "stateName": "disconnected"
  },
  "fallback": {
    "isMongoDBAvailable": false,
    "isInFallbackMode": true,
    "failureCount": 3,
    "memoryCacheSize": {
      "products": 150,
      "categories": 10,
      "orders": 0,
      "users": 0
    }
  },
  "degraded": true
}
```

### Alertas Automáticas

El sistema envía alertas automáticamente cuando:

1. **MongoDB se desconecta**:
   ```
   🚨 ALERTA CRÍTICA: MongoDB No Disponible
   Tipo: DATABASE_DOWN
   Severidad: CRITICAL
   Modo fallback: ACTIVO
   ```

2. **Máximo de reconexiones alcanzado**:
   ```
   🚨 ALERTA CRÍTICA: Máximo de intentos alcanzado
   Sistema en modo fallback permanente
   ```

3. **MongoDB se recupera**:
   ```
   ✅ MongoDB Recuperado
   Tipo: DATABASE_RECOVERED
   Severidad: INFO
   Downtime: 2.5 minutos
   ```

### Handlers de Alertas Disponibles

1. **Console** (por defecto): Logs en consola
2. **Webhook**: POST a URL configurada
3. **Slack**: Mensajes a canal de Slack
4. **Email**: Notificaciones por correo (requiere configuración)

## Respuestas del Sistema

### Datos Disponibles (Modo Fallback)

```json
{
  "success": true,
  "data": [...],
  "degraded": true,
  "source": "cache",
  "message": "Operando en modo degradado - MongoDB no disponible",
  "timestamp": "2025-01-27T..."
}
```

### Operación No Disponible

```json
{
  "success": false,
  "degraded": true,
  "message": "Operación no disponible en modo degradado: POST /api/products",
  "suggestion": "Por favor, intenta más tarde cuando el servicio esté completamente operativo",
  "timestamp": "2025-01-27T..."
}
```

## Pruebas

### Script de Prueba

```bash
npm run test-fallback-strategy
```

Este script verifica:
- ✅ Estado inicial del sistema
- ✅ Obtención de productos en modo actual
- ✅ Búsqueda de productos
- ✅ Respuestas de endpoints críticos
- ✅ Modo solo lectura en fallback
- ✅ Información de caché y fallback

### Prueba Manual

1. **Simular fallo de MongoDB**:
   - Detener MongoDB localmente
   - O cambiar URI de MongoDB a una inválida
   - O desconectar internet si usas MongoDB Atlas

2. **Observar logs**:
   ```
   ❌ Error de conexión MongoDB: ...
   ⚠️ MongoDB desconectado
   🚨 MODO FALLBACK ACTIVADO
   ```

3. **Probar endpoints**:
   ```bash
   # Debe funcionar con datos de caché
   curl http://localhost:4000/api/products
   
   # Debe devolver error 503
   curl -X POST http://localhost:4000/api/products
   ```

4. **Verificar reconexión**:
   - Restaurar MongoDB
   - Observar logs de reconexión
   - Verificar health check

## Limitaciones en Modo Fallback

### ✅ Disponible:
- Lectura de productos cacheados
- Búsqueda en datos cacheados
- Recomendaciones desde caché
- Carrito desde caché (solo lectura)
- Health checks

### ❌ No Disponible:
- Creación de productos
- Actualización de productos
- Eliminación de productos
- Modificación de carrito
- Creación de órdenes
- Operaciones de escritura en general

## Troubleshooting

### MongoDB no reconecta

**Síntoma**: Sistema queda en modo fallback permanente

**Solución**:
1. Verificar que MongoDB esté ejecutándose
2. Verificar URI de conexión
3. Verificar credenciales
4. Revisar logs para detalles del error
5. Reiniciar el servidor si es necesario

### Datos desactualizados en fallback

**Síntoma**: Datos en caché son antiguos

**Causa**: Caché no se actualiza sin MongoDB

**Solución**:
- Esperar a que MongoDB se recupere
- Los datos se sincronizarán automáticamente
- TTL de caché eventualmente expira datos antiguos

### Alertas no se envían

**Síntoma**: No recibo notificaciones de fallos

**Verificar**:
1. Configuración de webhooks/Slack en `.env`
2. Logs de consola (siempre activo)
3. Cooldown de alertas (5 minutos entre alertas)

### Modo fallback no se activa

**Síntoma**: Servidor se detiene en vez de activar fallback

**Causa**: Error en configuración de db.js

**Verificar**:
- Código no modificado de `src/config/db.js`
- Fallback service importado correctamente
- No hay `process.exit(1)` sin condiciones

## Mejores Prácticas

### 1. Mantener Caché Actualizado
- Asegurar que Redis esté siempre disponible
- Configurar TTLs apropiados
- Sincronizar datos críticos regularmente

### 2. Monitoreo Proactivo
- Revisar `/api/health` periódicamente
- Configurar alertas externas (Uptime Robot, etc.)
- Monitorear logs del servidor

### 3. Pruebas Regulares
- Ejecutar `npm run test-fallback-strategy` regularmente
- Simular fallos en entorno de staging
- Verificar que reconexión funciona

### 4. Configuración de Alertas
- Configurar webhooks/Slack para producción
- Ajustar cooldown según necesidad
- Probar handlers de alertas

### 5. Plan de Recuperación
- Documentar procedimiento de recuperación
- Tener respaldos de MongoDB
- Monitorear uptime de MongoDB Atlas

## Conclusión

La estrategia de fallback de SuperGains proporciona:

- 🛡️ **Resiliencia**: Sistema operativo incluso sin MongoDB
- 🔄 **Recuperación automática**: Sin intervención manual
- 📊 **Monitoreo**: Health checks y alertas integrados
- 📦 **Degradación elegante**: Funcionalidades limitadas pero operativas
- 🚨 **Alertas proactivas**: Notificaciones en tiempo real

El sistema está diseñado para minimizar el impacto de fallos de base de datos y maximizar la disponibilidad del servicio.

---

**Para más información:**
- `src/services/fallbackService.js` - Implementación del servicio
- `src/middleware/databaseFallbackMiddleware.js` - Middlewares
- `src/config/db.js` - Configuración de MongoDB
- `scripts/test-fallback-strategy.js` - Script de pruebas