# Sistema de Caché - SuperGains Backend

## 🚀 Inicio Rápido

### Configuración en 3 pasos:

1. **Agregar variables al `.env`**:
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
CACHE_ENABLED=true
```

2. **Opcional: Instalar Redis localmente** o **desabilitar caché**:
```bash
# Opción A: Sin Redis (funciona sin caché)
CACHE_ENABLED=false

# Opción B: Con Docker
docker run -d --name redis -p 6379:6379 redis:alpine
```

3. **Iniciar el servidor**:
```bash
npm run dev
```

✅ ¡Listo! El sistema funcionará con o sin Redis.

---

## 📊 Verificar Estado del Caché

### Health Check
```bash
curl http://localhost:4000/api/health
```

Respuesta:
```json
{
  "status": "OK",
  "services": {
    "cache": "connected",  // o "disconnected"
    "redis": true
  }
}
```

### Script de Pruebas
```bash
npm run test-cache-middleware
```

Esto probará:
- ✅ Conexión a Redis
- ✅ Caché de productos
- ✅ Caché de búsqueda
- ✅ Caché de recomendaciones
- ✅ Mejoras de performance

---

## 📁 Archivos del Sistema

```
backend/
├── src/
│   ├── config/
│   │   └── redis.js              # Configuración Redis
│   ├── services/
│   │   └── cacheService.js       # Servicio de caché
│   ├── middleware/
│   │   └── cacheMiddleware.js    # Middleware de caché
│   └── routes/
│       ├── productRoutes.js      # Caché aplicado ✅
│       ├── recommendationRoutes.js # Caché aplicado ✅
│       └── cartRoutes.js         # Caché aplicado ✅
├── scripts/
│   └── test-cache-middleware.js  # Script de pruebas
└── docs/
    ├── REDIS_CONFIGURATION.md    # Guía de configuración
    ├── CACHE_SYSTEM_GUIDE.md     # Guía completa
    └── HU38_IMPLEMENTATION_SUMMARY.md # Resumen
```

---

## 🎯 Endpoints con Caché

### ✅ Productos (TTL: 10 min)
```bash
GET /api/products           # Listado
GET /api/products/:id       # Individual
GET /api/products/search    # Búsqueda (5 min)
```

### ✅ Recomendaciones (TTL: 15 min)
```bash
GET /api/recommendations/popular
GET /api/recommendations/similar/:id
GET /api/recommendations/me
```

### ✅ Carrito (TTL: 30 min)
```bash
GET /api/cart
GET /api/cart/validate
```

---

## 💡 Ejemplos de Uso

### Ver respuesta desde caché:
```bash
# Primera solicitud (sin caché)
curl http://localhost:4000/api/products
# cached: false, tiempo: ~150ms

# Segunda solicitud (con caché)
curl http://localhost:4000/api/products
# cached: true, tiempo: ~15ms ⚡
```

### Todas las respuestas incluyen:
```json
{
  "success": true,
  "data": [...],
  "cached": true,           // ← Indica si vino de caché
  "cacheKey": "product:...", // ← Clave en Redis
  "timestamp": "2025-01-27..."
}
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor
npm run test-cache-middleware  # Probar caché

# Redis CLI
redis-cli ping                 # Verificar Redis
redis-cli KEYS *               # Ver todas las claves
redis-cli FLUSHALL             # Limpiar todo el caché
redis-cli INFO memory          # Ver uso de memoria
```

---

## 🔧 Troubleshooting

### Redis no disponible
```
⚠️ Redis no disponible - funcionando sin caché
```
**Solución**: 
- Instalar Redis o
- Cambiar `CACHE_ENABLED=false`

### Caché no se actualiza
**Solución**: Esperar TTL o limpiar:
```bash
redis-cli FLUSHALL
```

---

## 📚 Documentación Completa

- **[REDIS_CONFIGURATION.md](docs/REDIS_CONFIGURATION.md)** - Instalación y configuración
- **[CACHE_SYSTEM_GUIDE.md](docs/CACHE_SYSTEM_GUIDE.md)** - Guía completa
- **[HU38_IMPLEMENTATION_SUMMARY.md](docs/HU38_IMPLEMENTATION_SUMMARY.md)** - Resumen de implementación

---

## ✅ Resumen

- ✅ Sistema funciona **con o sin Redis**
- ✅ **90% más rápido** con caché
- ✅ Fácil de configurar (3 variables)
- ✅ Scripts de prueba incluidos
- ✅ Documentación completa

**¿Necesitas ayuda?** Revisa la documentación en `docs/`
