# Redis Configuration Guide
# ========================

Este documento describe cómo configurar Redis para el sistema de caché de SuperGains.

## Variables de Entorno Requeridas

### Configuración Básica de Redis

```bash
# Host de Redis (por defecto: localhost)
REDIS_HOST=localhost

# Puerto de Redis (por defecto: 6379)
REDIS_PORT=6379

# Contraseña de Redis (opcional)
REDIS_PASSWORD=your_redis_password

# Base de datos de Redis (por defecto: 0)
REDIS_DB=0

# Habilitar TLS para Redis (solo en producción)
REDIS_TLS=true
```

### Configuración de Caché

```bash
# TTL por defecto para caché (en segundos)
CACHE_DEFAULT_TTL=300

# TTL específicos (en segundos)
CACHE_PRODUCTS_TTL=600
CACHE_CATEGORIES_TTL=1800
CACHE_USER_SESSION_TTL=3600
CACHE_CART_TTL=1800
CACHE_RECOMMENDATIONS_TTL=900

# Habilitar/deshabilitar caché
CACHE_ENABLED=true
```

## Configuraciones por Ambiente

### Desarrollo Local

Para desarrollo local, puedes usar Redis local o deshabilitar el caché:

```bash
# Opción 1: Redis local
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_ENABLED=true

# Opción 2: Sin Redis (funciona sin caché)
CACHE_ENABLED=false
```

### Desarrollo con Docker

```bash
REDIS_HOST=redis
REDIS_PORT=6379
CACHE_ENABLED=true
```

### Producción

Para producción, usa un servicio de Redis en la nube:

```bash
# Redis Cloud
REDIS_HOST=your-redis-cloud-host
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-cloud-password
REDIS_TLS=true
CACHE_ENABLED=true

# O usando REDIS_URL
REDIS_URL=redis://username:password@host:port/db
```

## Instalación de Redis

### Windows

1. Descargar Redis desde: https://github.com/microsoftarchive/redis/releases
2. Instalar y ejecutar Redis
3. Redis estará disponible en `localhost:6379`

### macOS

```bash
# Con Homebrew
brew install redis
brew services start redis
```

### Linux (Ubuntu/Debian)

```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Docker

```bash
# Ejecutar Redis en Docker
docker run -d --name redis -p 6379:6379 redis:alpine

# O con docker-compose
version: '3.8'
services:
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

## Verificación de la Configuración

El sistema incluye un script de prueba para verificar la conexión Redis:

```bash
# Ejecutar desde el directorio backend
npm run test-redis
```

## Monitoreo del Caché

El endpoint `/api/health` incluye información sobre el estado de Redis:

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
    "timestamp": "2025-01-27T..."
  }
}
```

## Troubleshooting

### Redis no disponible

Si Redis no está disponible, el sistema continuará funcionando sin caché. Verás estos mensajes:

```
⚠️ Redis no disponible - funcionando sin caché
⚠️ Error conectando Redis: [error message]
⚠️ Continuando sin caché...
```

### Problemas de Conexión

1. **Verificar que Redis esté ejecutándose:**
   ```bash
   redis-cli ping
   # Debería responder: PONG
   ```

2. **Verificar configuración de red:**
   ```bash
   telnet localhost 6379
   ```

3. **Verificar logs del servidor:**
   Los logs mostrarán el estado de la conexión Redis al iniciar el servidor.

### Optimización de Performance

1. **Ajustar TTL según uso:**
   - Productos: 10 minutos (600s)
   - Categorías: 30 minutos (1800s)
   - Carrito: 30 minutos (1800s)

2. **Monitorear uso de memoria:**
   ```bash
   redis-cli info memory
   ```

3. **Limpiar caché si es necesario:**
   ```bash
   redis-cli flushall
   ```

## Seguridad

### Producción

- Usar contraseñas fuertes para Redis
- Habilitar TLS en producción
- Restringir acceso por IP
- Usar Redis AUTH

### Desarrollo

- Redis local sin contraseña está bien para desarrollo
- No exponer Redis a internet en desarrollo
