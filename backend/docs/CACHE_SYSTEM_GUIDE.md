# Guía del Sistema de Caché - SuperGains

## 📋 Índice
- [Introducción](#introducción)
- [Arquitectura](#arquitectura)
- [Middleware Implementados](#middleware-implementados)
- [Endpoints con Caché](#endpoints-con-caché)
- [Configuración](#configuración)
- [Uso y Ejemplos](#uso-y-ejemplos)
- [Monitoreo](#monitoreo)
- [Troubleshooting](#troubleshooting)

## Introducción

El sistema de caché de SuperGains utiliza Redis para mejorar el rendimiento y la resiliencia del backend. El sistema está diseñado para ser **resiliente** - si Redis no está disponible, el backend continúa funcionando normalmente consultando directamente la base de datos.

### Beneficios del Caché:
- ⚡ **Mejor rendimiento**: Respuestas hasta 10x más rápidas
- 🛡️ **Resiliencia**: Funciona aunque la BD esté lenta
- 💰 **Reducción de costos**: Menos consultas a MongoDB
- 📈 **Escalabilidad**: Maneja más usuarios simultáneos

## Arquitectura

```
Cliente → Middleware de Caché → Redis → BD MongoDB
              ↓                    ↓
         Cache Hit           Cache Miss
              ↓                    ↓
         Respuesta          Consulta BD → Guardar en Cache
```

### Componentes:

1. **`src/config/redis.js`**: Configuración y conexión a Redis
2. **`src/services/cacheService.js`**: Servicio con métodos para interactuar con Redis
3. **`src/middleware/cacheMiddleware.js`**: Middleware para aplicar caché a rutas

## Middleware Implementados

### 1. Middleware de Lectura (GET)

#### `productCacheMiddleware()`
Cachea listados y productos individuales.

```javascript
// En productRoutes.js
router.get("/", productCacheMiddleware(), getProducts);
router.get("/:id", productCacheMiddleware(), getProductById);
```

**TTL**: 600 segundos (10 minutos)

#### `searchCacheMiddleware()`
Cachea resultados de búsqueda con filtros.

```javascript
router.get("/search", searchCacheMiddleware(), searchProducts);
```

**TTL**: 300 segundos (5 minutos)

#### `recommendationCacheMiddleware()`
Cachea recomendaciones personalizadas.

```javascript
router.get('/popular', recommendationCacheMiddleware(), getPopularProducts);
```

**TTL**: 900 segundos (15 minutos)

#### `cartCacheMiddleware()`
Cachea carritos de usuario.

```javascript
router.get('/', cartCacheMiddleware(), getCart);
```

**TTL**: 1800 segundos (30 minutos)

### 2. Middleware de Invalidación (POST/PUT/DELETE)

#### `invalidateProductCacheMiddleware()`
Invalida caché cuando se modifica un producto.

```javascript
router.post("/", createProduct, invalidateProductCacheMiddleware());
router.put("/:id", updateProduct, invalidateProductCacheMiddleware());
router.delete("/:id", deleteProduct, invalidateProductCacheMiddleware());
```

#### `invalidateCartCacheMiddleware()`
Invalida caché del carrito al modificarlo.

```javascript
router.post('/add', addToCart, invalidateCartCacheMiddleware());
router.put('/item/:id', updateCartItem, invalidateCartCacheMiddleware());
```

## Endpoints con Caché

### Productos
| Endpoint | Método | Caché | TTL |
|----------|--------|-------|-----|
| `/api/products` | GET | ✅ | 10 min |
| `/api/products/:id` | GET | ✅ | 10 min |
| `/api/products/search` | GET | ✅ | 5 min |
| `/api/products` | POST | ❌ (invalida) | - |
| `/api/products/:id` | PUT | ❌ (invalida) | - |
| `/api/products/:id` | DELETE | ❌ (invalida) | - |

### Recomendaciones
| Endpoint | Método | Caché | TTL |
|----------|--------|-------|-----|
| `/api/recommendations/popular` | GET | ✅ | 15 min |
| `/api/recommendations/similar/:id` | GET | ✅ | 15 min |
| `/api/recommendations/category/:cat` | GET | ✅ | 15 min |
| `/api/recommendations/me` | GET | ✅ | 15 min |
| `/api/recommendations/hybrid` | GET | ✅ | 15 min |

### Carrito
| Endpoint | Método | Caché | TTL |
|----------|--------|-------|-----|
| `/api/cart` | GET | ✅ | 30 min |
| `/api/cart/validate` | GET | ✅ | 30 min |
| `/api/cart/add` | POST | ❌ (invalida) | - |
| `/api/cart/item/:id` | PUT | ❌ (invalida) | - |
| `/api/cart/item/:id` | DELETE | ❌ (invalida) | - |
| `/api/cart/clear` | DELETE | ❌ (invalida) | - |

## Configuración

### Variables de Entorno

```bash
# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password  # Opcional
REDIS_DB=0
REDIS_TLS=false  # true en producción

# Cache TTLs (en segundos)
CACHE_DEFAULT_TTL=300
CACHE_PRODUCTS_TTL=600
CACHE_CATEGORIES_TTL=1800
CACHE_USER_SESSION_TTL=3600
CACHE_CART_TTL=1800
CACHE_RECOMMENDATIONS_TTL=900

# Enable/Disable
CACHE_ENABLED=true
```

### Prefijos de Caché

El sistema usa prefijos para organizar las claves:

```javascript
product:        // Productos individuales y listados
category:       // Categorías
user:           // Datos de usuario
cart:           // Carritos de usuario
session:        // Sesiones de usuario
recommendation: // Recomendaciones
search:         // Búsquedas
order:          // Órdenes
```

## Uso y Ejemplos

### Respuesta con Caché

Todas las respuestas incluyen información sobre el caché:

```json
{
  "success": true,
  "data": [...],
  "cached": true,
  "cacheKey": "product:list_{}",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

- **`cached: true`**: Datos obtenidos de Redis
- **`cached: false`**: Datos obtenidos de MongoDB
- **`cacheKey`**: Clave usada en Redis

### Ejemplo de Flujo

#### Primera Solicitud (Cache Miss)
```bash
GET /api/products?limit=10
# ⏱️ 150ms - Consulta a MongoDB + Guarda en Redis
# cached: false
```

#### Segunda Solicitud (Cache Hit)
```bash
GET /api/products?limit=10
# ⏱️ 15ms - Obtiene de Redis
# cached: true
# 🚀 90% más rápido
```

#### Modificación (Cache Invalidation)
```bash
PUT /api/products/123
# Actualiza producto en MongoDB
# Invalida cache: product:*
```

#### Siguiente Solicitud (Cache Miss nuevamente)
```bash
GET /api/products?limit=10
# ⏱️ 150ms - Consulta a MongoDB (caché invalidado)
# cached: false
```

## Monitoreo

### Endpoint de Health

Verifica el estado de Redis:

```bash
GET /api/health
```

Respuesta:
```json
{
  "status": "OK",
  "services": {
    "database": "connected",
    "auth": "active",
    "cache": "connected",
    "redis": true
  },
  "cache": {
    "connected": true,
    "memory": "...",
    "keyspace": "...",
    "timestamp": "..."
  }
}
```

### Script de Prueba

Ejecuta el script de prueba del middleware:

```bash
npm run test-cache-middleware
```

Este script:
- ✅ Verifica conexión a Redis
- ✅ Prueba caché en productos
- ✅ Prueba caché en búsqueda
- ✅ Prueba caché en recomendaciones
- ✅ Mide mejoras de performance

### Redis CLI

Monitorear Redis directamente:

```bash
# Conectar a Redis
redis-cli

# Ver todas las claves
KEYS *

# Ver una clave específica
GET product:123

# Ver TTL de una clave
TTL product:123

# Ver estadísticas
INFO memory
INFO keyspace

# Limpiar todo el caché
FLUSHALL
```

## Troubleshooting

### Redis no disponible

**Síntoma**: Logs muestran "Redis no disponible - funcionando sin caché"

**Solución**:
1. Verificar que Redis esté ejecutándose:
   ```bash
   redis-cli ping
   # Debe responder: PONG
   ```

2. Verificar variables de entorno en `.env`:
   ```bash
   REDIS_HOST=localhost
   REDIS_PORT=6379
   CACHE_ENABLED=true
   ```

3. Si no tienes Redis, desabilita el caché:
   ```bash
   CACHE_ENABLED=false
   ```

### Caché no se actualiza

**Síntoma**: Cambios en BD no se reflejan inmediatamente

**Causa**: Caché todavía válido (TTL no expirado)

**Solución**:
1. Esperar que expire el TTL
2. O limpiar caché manualmente:
   ```bash
   redis-cli FLUSHALL
   ```

### Performance no mejora

**Síntoma**: Tiempos similares con/sin caché

**Posibles causas**:
1. Redis no está conectado (revisar `/api/health`)
2. `CACHE_ENABLED=false` en `.env`
3. Primera solicitud siempre es lenta (normal)
4. Claves de caché diferentes por query params

**Verificar**:
```bash
# Ejecutar el script de pruebas
npm run test-cache-middleware
```

### Memoria de Redis llena

**Síntoma**: Errores de memoria en Redis

**Solución**:
1. Ajustar política de eviction en Redis:
   ```
   maxmemory-policy allkeys-lru
   ```

2. Reducir TTLs en `.env`

3. Aumentar memoria de Redis

## Mejores Prácticas

### 1. TTLs Apropiados
- Datos que cambian frecuentemente: TTL corto (5-10 min)
- Datos estáticos: TTL largo (30-60 min)
- Datos en tiempo real: Sin caché

### 2. Invalidación Inteligente
- Invalidar solo claves relacionadas
- No invalidar todo el caché innecesariamente
- Usar patrones específicos

### 3. Monitoreo Regular
- Revisar `/api/health` periódicamente
- Monitorear hit rate del caché
- Vigilar uso de memoria

### 4. Desarrollo Local
- Desarrollo sin Redis: `CACHE_ENABLED=false`
- Testing con Redis: usar Redis local o Docker
- No es obligatorio tener Redis en desarrollo

## Conclusión

El sistema de caché de SuperGains está diseñado para ser:
- 🚀 **Rápido**: Mejora significativa en tiempos de respuesta
- 🛡️ **Resiliente**: Funciona con o sin Redis
- 🔧 **Fácil de usar**: Configuración simple con variables de entorno
- 📊 **Monitoreable**: Health checks y scripts de prueba incluidos

Para más información, consulta:
- `docs/REDIS_CONFIGURATION.md` - Configuración de Redis
- `scripts/test-cache-middleware.js` - Script de pruebas
- `src/middleware/cacheMiddleware.js` - Implementación del middleware
