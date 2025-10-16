# Resiliencia del Backend - SuperGains

## Resumen

Este documento describe la implementación de resiliencia en el backend de SuperGains mediante un sistema de caché Redis y estrategia de fallback para MongoDB. La implementación garantiza que el sistema siga respondiendo incluso cuando la base de datos principal falle.

## Arquitectura de Resiliencia

### Componentes Principales

1. **Redis Cache**: Almacenamiento en memoria para datos críticos
2. **Fallback Service**: Servicio que gestiona el estado de MongoDB
3. **Cache Middleware**: Middleware que intercepta requests para usar caché
4. **Database Fallback Middleware**: Middleware que activa modo degradado
5. **Alert Service**: Notificaciones cuando MongoDB falla o se recupera

### Flujo de Resiliencia

```
Request → Cache Check → Cache Hit? → Return Cached Data
                ↓ No
         MongoDB Check → Available? → Return DB Data
                ↓ No
         Fallback Mode → Return Cached/Static Data
```

## Configuración Redis

### Variables de Entorno

```bash
# Configuración básica Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_TLS=false

# Habilitar/deshabilitar caché
CACHE_ENABLED=true

# TTLs configurables (en segundos)
CACHE_DEFAULT_TTL=600          # 10 minutos
CACHE_PRODUCTS_TTL=600         # 10 minutos
CACHE_CATEGORIES_TTL=600       # 10 minutos
CACHE_USER_SESSION_TTL=3600    # 1 hora
CACHE_CART_TTL=600             # 10 minutos
CACHE_RECOMMENDATIONS_TTL=600  # 10 minutos
```

### Instalación Redis

#### Windows
```bash
# Usando Chocolatey
choco install redis-64

# Usando Docker
docker run -d -p 6379:6379 redis:alpine
```

#### Linux/macOS
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS con Homebrew
brew install redis

# Iniciar servicio
sudo systemctl start redis-server
```

## Sistema de Caché

### CacheService

El servicio de caché (`src/services/cacheService.js`) proporciona:

- **Operaciones básicas**: `get()`, `set()`, `del()`
- **Invalidación por patrón**: `delByPattern()`
- **TTLs específicos**: Métodos para diferentes tipos de datos
- **Estadísticas**: `getStats()` para monitoreo

### Middleware de Caché

#### Cache Middleware Genérico
```javascript
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

// Aplicar a rutas GET
router.get('/products', cacheMiddleware(), getProducts);
```

#### Middlewares Específicos
- `productCacheMiddleware()`: Para productos
- `searchCacheMiddleware()`: Para búsquedas
- `categoryCacheMiddleware()`: Para categorías
- `recommendationCacheMiddleware()`: Para recomendaciones
- `cartCacheMiddleware()`: Para carrito

#### Invalidación de Caché
```javascript
import { invalidateProductCacheMiddleware } from '../middleware/cacheMiddleware.js';

// Aplicar a operaciones de escritura
router.post('/products', invalidateProductCacheMiddleware(), createProduct);
```

## Estrategia de Fallback MongoDB

### FallbackService

El servicio de fallback (`src/services/fallbackService.js`) gestiona:

- **Estado de MongoDB**: Conectado/desconectado
- **Modo degradado**: Activación automática
- **Estadísticas**: Contadores y métricas
- **Reconexión**: Detección de recuperación

### Database Fallback Middleware

#### Verificación de Estado
```javascript
import { checkDatabaseStatus } from '../middleware/databaseFallbackMiddleware.js';

// Aplicar globalmente a rutas
router.use(checkDatabaseStatus);
```

#### Controladores con Fallback
```javascript
import { withFallback } from '../middleware/databaseFallbackMiddleware.js';
import { getProductsFallback } from '../controllers/fallbackControllers.js';

// Envolver controladores
router.get('/products', withFallback(getProducts, getProductsFallback));
```

#### Modo Solo Lectura
```javascript
import { readOnlyInFallback } from '../middleware/databaseFallbackMiddleware.js';

// Bloquear escrituras en modo fallback
router.post('/products', readOnlyInFallback, createProduct);
```

### Controladores de Fallback

Los controladores de fallback (`src/controllers/fallbackControllers.js`) proporcionan:

- **Datos estáticos**: Productos de ejemplo cuando MongoDB falla
- **Caché como fuente**: Prioridad a datos en Redis
- **Respuestas consistentes**: Mismo formato que controladores normales

## Health Check y Monitoreo

### Endpoint de Salud

```http
GET /api/health
```

Respuesta incluye:
```json
{
  "status": "OK|DEGRADED",
  "services": {
    "database": "connected|disconnected",
    "cache": "connected|disconnected",
    "fallback": "active|inactive"
  },
  "mongodb": {
    "connected": true,
    "stateName": "connected"
  },
  "cache": {
    "enabled": true,
    "connected": true,
    "usedMemory": "2.5 MB",
    "totalKeys": 150
  },
  "fallback": {
    "active": false,
    "activatedAt": null,
    "fallbackRequests": 0
  }
}
```

### Alertas Automáticas

El sistema envía alertas cuando:

- **MongoDB se desconecta**: Email al administrador
- **MongoDB se recupera**: Notificación de restauración
- **Modo fallback activado**: Alerta de degradación

## Scripts de Prueba

### Test de Conexión Redis
```bash
npm run test-redis-connection
```

Verifica:
- Conexión a Redis
- Operaciones básicas (SET/GET/DEL)
- TTL y expiración

### Test de Middleware de Caché
```bash
npm run test-cache-middleware
```

Verifica:
- Cache hits/misses en productos
- Cache hits/misses en búsquedas
- Cache hits/misses en recomendaciones
- Tiempos de respuesta mejorados

### Test de Estrategia de Fallback
```bash
npm run test-fallback-strategy
```

Verifica:
- Estado inicial del sistema
- Operaciones en modo normal
- Bloqueo de escrituras en fallback
- Health check detallado

## Configuración de Producción

### Variables de Entorno Recomendadas

```bash
# Producción
NODE_ENV=production
CACHE_ENABLED=true
REDIS_HOST=redis-cluster.internal
REDIS_PORT=6379
REDIS_PASSWORD=secure_password
REDIS_TLS=true

# TTLs optimizados para producción
CACHE_DEFAULT_TTL=300      # 5 minutos
CACHE_PRODUCTS_TTL=600     # 10 minutos
CACHE_CATEGORIES_TTL=1800  # 30 minutos
CACHE_USER_SESSION_TTL=3600 # 1 hora
CACHE_CART_TTL=1800        # 30 minutos
CACHE_RECOMMENDATIONS_TTL=900 # 15 minutos

# Alertas
EMAIL_NOTIFICATIONS_ENABLED=true
ADMIN_EMAIL=admin@supergains.com
```

### Monitoreo Recomendado

1. **Redis**: Monitorear memoria, conexiones, comandos/segundo
2. **MongoDB**: Monitorear estado de conexión, latencia
3. **Fallback**: Alertas cuando se activa modo degradado
4. **Cache Hit Rate**: Porcentaje de hits vs misses

## Troubleshooting

### Redis No Disponible

**Síntomas**: Logs de "Redis no está disponible"
**Solución**:
1. Verificar que Redis esté ejecutándose
2. Comprobar configuración de conexión
3. El sistema funciona sin caché (modo degradado)

### MongoDB Desconectado

**Síntomas**: Modo fallback activado, operaciones de escritura bloqueadas
**Solución**:
1. Verificar conexión a MongoDB
2. Revisar logs de red
3. El sistema continúa con datos en caché

### Cache Misses Altos

**Síntomas**: Tiempos de respuesta lentos
**Solución**:
1. Revisar TTLs (pueden ser muy cortos)
2. Verificar invalidación excesiva
3. Ajustar estrategia de caché

## Métricas y KPIs

### Métricas de Resiliencia

- **Uptime**: % de tiempo operativo
- **Fallback Activation**: Frecuencia de activación
- **Cache Hit Rate**: % de requests servidos desde caché
- **Recovery Time**: Tiempo de recuperación de MongoDB

### Métricas de Performance

- **Response Time**: Tiempo promedio de respuesta
- **Cache Performance**: Mejora de velocidad con caché
- **Memory Usage**: Uso de memoria Redis
- **Database Load**: Reducción de carga en MongoDB

## Conclusión

La implementación de resiliencia en SuperGains proporciona:

✅ **Alta Disponibilidad**: Sistema funciona aunque MongoDB falle
✅ **Performance Mejorada**: Caché reduce latencia y carga de BD
✅ **Monitoreo Completo**: Health checks y alertas automáticas
✅ **Configurabilidad**: TTLs y comportamiento ajustables
✅ **Transparencia**: Fallback invisible para usuarios finales

El sistema garantiza que SuperGains mantenga operaciones críticas incluso en situaciones de fallo de infraestructura.
