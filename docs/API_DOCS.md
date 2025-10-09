# API Documentation - SuperGains

## Base URL
```
http://localhost:4000/api
```

## Autenticación
La API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header `Authorization`:

```
Authorization: Bearer <token>
```

## Respuestas de Error
Todas las respuestas de error siguen este formato:
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "Detalles adicionales del error"
}
```

## Endpoints

### 1. Health Check

#### GET /health
Verifica el estado de la API.

**Respuesta:**
```json
{
  "success": true,
  "message": "API funcionando correctamente",
  "timestamp": "2025-01-16T16:30:00.000Z",
  "environment": "production"
}
```

---

## 2. Productos

### GET /products
Obtiene la lista de productos con filtros opcionales.

**Parámetros de consulta:**
- `page` (number): Número de página (default: 1)
- `limit` (number): Productos por página (default: 10)
- `brand` (string): Filtrar por marca
- `minPrice` (number): Precio mínimo
- `maxPrice` (number): Precio máximo
- `search` (string): Búsqueda por nombre
- `sortBy` (string): Campo para ordenar (name, price, createdAt)
- `order` (string): Orden (asc, desc)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68c982b4fbb7c8b68606710e",
      "name": "Proteína Whey",
      "brand": "Optimum Nutrition",
      "price": 89.99,
      "stock": 50,
      "description": "Proteína de suero de leche",
      "categories": ["proteínas"],
      "createdAt": "2025-01-16T16:30:00.000Z",
      "updatedAt": "2025-01-16T16:30:00.000Z"
    }
  ],
  "count": 1,
  "page": 1,
  "totalPages": 1
}
```

### GET /products/search
Busca productos por nombre o descripción.

**Parámetros de consulta:**
- `q` (string, requerido): Término de búsqueda
- `page` (number): Número de página
- `limit` (number): Resultados por página

**Respuesta:** Igual que GET /products

### GET /products/:id
Obtiene un producto específico por ID.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "_id": "68c982b4fbb7c8b68606710e",
    "name": "Proteína Whey",
    "brand": "Optimum Nutrition",
    "price": 89.99,
    "stock": 50,
    "description": "Proteína de suero de leche",
    "categories": ["proteínas"],
    "createdAt": "2025-01-16T16:30:00.000Z",
    "updatedAt": "2025-01-16T16:30:00.000Z"
  }
}
```

### POST /products
Crea un nuevo producto. **Requiere autenticación.**

**Body:**
```json
{
  "name": "Proteína Whey",
  "brand": "Optimum Nutrition",
  "price": 89.99,
  "stock": 50,
  "description": "Proteína de suero de leche",
  "categories": ["proteínas"]
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "_id": "68c982b4fbb7c8b68606710e",
    "name": "Proteína Whey",
    "brand": "Optimum Nutrition",
    "price": 89.99,
    "stock": 50,
    "description": "Proteína de suero de leche",
    "categories": ["proteínas"],
    "createdAt": "2025-01-16T16:30:00.000Z",
    "updatedAt": "2025-01-16T16:30:00.000Z"
  }
}
```

### PUT /products/:id
Actualiza un producto existente. **Requiere autenticación.**

**Body:** Mismos campos que POST /products (todos opcionales)

**Respuesta:** Igual que POST /products

### DELETE /products/:id
Elimina un producto. **Requiere autenticación y rol de administrador.**

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

## 3. Usuarios

### POST /users/register
Registra un nuevo usuario.

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contraseña": "Password123",
  "rol": "usuario"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "_id": "68c982b4fbb7c8b68606710e",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario",
      "activo": true,
      "fechaCreacion": "2025-01-16T16:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /users/login
Inicia sesión de usuario.

**Body:**
```json
{
  "email": "juan@example.com",
  "contraseña": "Password123"
}
```

**Respuesta:** Igual que POST /users/register

### GET /users/profile
Obtiene el perfil del usuario autenticado. **Requiere autenticación.**

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "68c982b4fbb7c8b68606710e",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario",
      "activo": true,
      "fechaCreacion": "2025-01-16T16:30:00.000Z"
    }
  }
}
```

### PUT /users/profile
Actualiza el perfil del usuario autenticado. **Requiere autenticación.**

**Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juan.carlos@example.com"
}
```

**Respuesta:** Igual que GET /users/profile

### POST /users/refresh
Renueva el token de acceso usando el refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Token renovado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /users/logout
Cierra la sesión del usuario.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### GET /users/token-status
Verifica el estado del token actual. **Requiere autenticación.**

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "expiresAt": "2025-01-16T18:30:00.000Z",
    "user": {
      "_id": "68c982b4fbb7c8b68606710e",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "usuario"
    }
  }
}
```

---

## 4. Carrito

Todas las rutas del carrito requieren autenticación.

### GET /cart
Obtiene el carrito del usuario autenticado.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "_id": "68c982b4fbb7c8b68606710e",
    "user": "68c982b4fbb7c8b68606710e",
    "items": [
      {
        "product": {
          "_id": "68c982b4fbb7c8b68606710e",
          "name": "Proteína Whey",
          "brand": "Optimum Nutrition",
          "price": 89.99
        },
        "quantity": 2,
        "price": 89.99
      }
    ],
    "total": 179.98,
    "itemCount": 2,
    "isEmpty": false,
    "createdAt": "2025-01-16T16:30:00.000Z",
    "updatedAt": "2025-01-16T16:30:00.000Z"
  }
}
```

### POST /cart/add
Agrega un producto al carrito.

**Body:**
```json
{
  "productId": "68c982b4fbb7c8b68606710e",
  "quantity": 2
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto agregado al carrito",
  "data": {
    "cart": {
      "_id": "68c982b4fbb7c8b68606710e",
      "user": "68c982b4fbb7c8b68606710e",
      "items": [
        {
          "product": "68c982b4fbb7c8b68606710e",
          "quantity": 2,
          "price": 89.99
        }
      ],
      "total": 179.98
    }
  }
}
```

### PUT /cart/item/:productId
Actualiza la cantidad de un producto en el carrito.

**Body:**
```json
{
  "quantity": 3
}
```

**Respuesta:** Igual que POST /cart/add

### DELETE /cart/item/:productId
Elimina un producto del carrito.

**Respuesta:**
```json
{
  "success": true,
  "message": "Producto eliminado del carrito"
}
```

### DELETE /cart/clear
Vacía el carrito completamente.

**Respuesta:**
```json
{
  "success": true,
  "message": "Carrito vaciado exitosamente"
}
```

### GET /cart/validate
Valida el stock de todos los productos en el carrito.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "items": [
      {
        "productId": "68c982b4fbb7c8b68606710e",
        "productName": "Proteína Whey",
        "requestedQuantity": 2,
        "availableStock": 50,
        "valid": true
      }
    ],
    "totalValid": true
  }
}
```

### POST /cart/sync
Sincroniza el carrito con el inventario actual.

**Respuesta:**
```json
{
  "success": true,
  "message": "Carrito sincronizado con inventario",
  "data": {
    "updatedItems": 0,
    "removedItems": 0,
    "cart": {
      "_id": "68c982b4fbb7c8b68606710e",
      "user": "68c982b4fbb7c8b68606710e",
      "items": [],
      "total": 0
    }
  }
}
```

---

## 5. Inventario

### GET /inventory
Obtiene la lista de registros de inventario.

**Parámetros de consulta:**
- `page` (number): Número de página
- `limit` (number): Registros por página
- `status` (string): Filtrar por estado (active, inactive, out_of_stock)
- `stock_min` (number): Stock mínimo
- `stock_max` (number): Stock máximo
- `needs_restock` (boolean): Filtrar productos que necesitan reabastecimiento

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68c982b4fbb7c8b68606710e",
      "product": {
        "_id": "68c982b4fbb7c8b68606710e",
        "name": "Proteína Whey",
        "brand": "Optimum Nutrition"
      },
      "currentStock": 50,
      "minStock": 10,
      "maxStock": 100,
      "reservedStock": 5,
      "availableStock": 45,
      "totalSold": 25,
      "status": "active",
      "stockStatus": "Normal",
      "needsRestock": false,
      "isAvailable": true,
      "lastRestocked": "2025-01-16T16:30:00.000Z",
      "lastSold": "2025-01-16T15:30:00.000Z",
      "createdAt": "2025-01-16T16:30:00.000Z",
      "updatedAt": "2025-01-16T16:30:00.000Z"
    }
  ],
  "totalCount": 1,
  "page": 1,
  "totalPages": 1
}
```

### GET /inventory/stats
Obtiene estadísticas del inventario.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "general": {
      "totalProducts": 10,
      "totalStock": 500,
      "totalReserved": 25,
      "totalSold": 150,
      "totalAvailable": 475,
      "avgStock": 50,
      "minStock": 5,
      "maxStock": 100
    },
    "statusBreakdown": [
      {
        "_id": "active",
        "count": 8
      },
      {
        "_id": "out_of_stock",
        "count": 2
      }
    ],
    "alerts": {
      "lowStock": 3,
      "outOfStock": 2
    }
  }
}
```

### GET /inventory/low-stock
Obtiene productos con stock bajo.

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68c982b4fbb7c8b68606710e",
      "product": {
        "_id": "68c982b4fbb7c8b68606710e",
        "name": "Proteína Whey",
        "brand": "Optimum Nutrition"
      },
      "currentStock": 5,
      "minStock": 10,
      "stockStatus": "Stock bajo",
      "needsRestock": true
    }
  ]
}
```

### GET /inventory/out-of-stock
Obtiene productos agotados.

**Respuesta:** Igual que GET /inventory/low-stock

### GET /inventory/product/:productId
Obtiene el inventario de un producto específico.

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "_id": "68c982b4fbb7c8b68606710e",
    "product": {
      "_id": "68c982b4fbb7c8b68606710e",
      "name": "Proteína Whey",
      "brand": "Optimum Nutrition"
    },
    "currentStock": 50,
    "minStock": 10,
    "maxStock": 100,
    "reservedStock": 5,
    "availableStock": 45,
    "totalSold": 25,
    "status": "active",
    "stockStatus": "Normal",
    "needsRestock": false,
    "isAvailable": true,
    "lastRestocked": "2025-01-16T16:30:00.000Z",
    "lastSold": "2025-01-16T15:30:00.000Z"
  }
}
```

### GET /inventory/:id
Obtiene un registro de inventario específico por ID.

**Respuesta:** Igual que GET /inventory/product/:productId

### POST /inventory
Crea un nuevo registro de inventario.

**Body:**
```json
{
  "product": "68c982b4fbb7c8b68606710e",
  "currentStock": 100,
  "minStock": 10,
  "maxStock": 500,
  "status": "active"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inventario creado exitosamente",
  "data": {
    "_id": "68c982b4fbb7c8b68606710e",
    "product": "68c982b4fbb7c8b68606710e",
    "currentStock": 100,
    "minStock": 10,
    "maxStock": 500,
    "reservedStock": 0,
    "totalSold": 0,
    "status": "active",
    "createdAt": "2025-01-16T16:30:00.000Z",
    "updatedAt": "2025-01-16T16:30:00.000Z"
  }
}
```

### PUT /inventory/:id
Actualiza un registro de inventario existente.

**Body:** Mismos campos que POST /inventory (todos opcionales)

**Respuesta:** Igual que POST /inventory

### DELETE /inventory/:id
Elimina un registro de inventario.

**Respuesta:**
```json
{
  "success": true,
  "message": "Inventario eliminado exitosamente"
}
```

### POST /inventory/:id/restock
Reabastece el inventario de un producto.

**Body:**
```json
{
  "quantity": 50,
  "reason": "Reabastecimiento mensual"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Inventario reabastecido exitosamente",
  "data": {
    "inventory": {
      "_id": "68c982b4fbb7c8b68606710e",
      "currentStock": 150,
      "lastRestocked": "2025-01-16T16:30:00.000Z"
    }
  }
}
```

### POST /inventory/:id/reserve
Reserva stock para una venta futura.

**Body:**
```json
{
  "quantity": 5,
  "reason": "Reserva para carrito"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Stock reservado exitosamente",
  "data": {
    "inventory": {
      "_id": "68c982b4fbb7c8b68606710e",
      "reservedStock": 10,
      "availableStock": 40
    }
  }
}
```

### POST /inventory/:id/release
Libera stock previamente reservado.

**Body:**
```json
{
  "quantity": 5,
  "reason": "Liberación de reserva"
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Stock liberado exitosamente",
  "data": {
    "inventory": {
      "_id": "68c982b4fbb7c8b68606710e",
      "reservedStock": 5,
      "availableStock": 45
    }
  }
}
```

### POST /inventory/:id/sell
Registra una venta y reduce el stock.

**Body:**
```json
{
  "quantity": 2,
  "price": 89.99
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Venta registrada exitosamente",
  "data": {
    "inventory": {
      "_id": "68c982b4fbb7c8b68606710e",
      "currentStock": 48,
      "reservedStock": 5,
      "totalSold": 27,
      "lastSold": "2025-01-16T16:30:00.000Z"
    }
  }
}
```

---

## Códigos de Estado HTTP

- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Error en los datos enviados
- `401` - Unauthorized: Token de autenticación requerido o inválido
- `403` - Forbidden: No tiene permisos para realizar la acción
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con el estado actual del recurso
- `429` - Too Many Requests: Demasiadas solicitudes
- `500` - Internal Server Error: Error interno del servidor

---

## Rate Limiting

La API implementa rate limiting para prevenir abuso:
- **Desarrollo**: 1000 requests por 15 minutos
- **Producción**: 100 requests por 15 minutos

Cuando se excede el límite, se devuelve:
```json
{
  "success": false,
  "message": "Demasiadas solicitudes desde esta IP, intenta de nuevo en 15 minutos."
}
```

---

## Validaciones

### Usuario
- **Nombre**: 2-50 caracteres, requerido
- **Email**: Formato válido, único, requerido
- **Contraseña**: 6-100 caracteres, debe contener al menos una letra minúscula, una mayúscula y un número
- **Rol**: usuario, admin, moderador (default: usuario)

### Producto
- **Nombre**: 2-100 caracteres, requerido
- **Marca**: 2-50 caracteres, requerido
- **Precio**: Número positivo, requerido
- **Stock**: Número entero no negativo, requerido
- **Descripción**: Máximo 500 caracteres
- **Categorías**: Array de strings

### Carrito
- **Cantidad**: 1-100, requerido
- **Producto**: ID válido de producto existente

### Inventario
- **Producto**: ID válido de producto existente, único
- **Stock actual**: Número entero no negativo, requerido
- **Stock mínimo**: Número entero no negativo, default: 5
- **Stock máximo**: Número entero no negativo, default: 100
- **Estado**: active, inactive, out_of_stock (default: active)

---

## Ejemplos de Uso

### Flujo completo de compra:

1. **Registrar usuario:**
```bash
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan Pérez","email":"juan@example.com","contraseña":"Password123"}'
```

2. **Iniciar sesión:**
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","contraseña":"Password123"}'
```

3. **Obtener productos:**
```bash
curl -X GET "http://localhost:4000/api/products?limit=10&page=1"
```

4. **Agregar al carrito:**
```bash
curl -X POST http://localhost:4000/api/cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"productId":"68c982b4fbb7c8b68606710e","quantity":2}'
```

5. **Validar stock del carrito:**
```bash
curl -X GET http://localhost:4000/api/cart/validate \
  -H "Authorization: Bearer <token>"
```

6. **Obtener carrito:**
```bash
curl -X GET http://localhost:4000/api/cart \
  -H "Authorization: Bearer <token>"
```

---

## Notas Adicionales

- Todos los timestamps están en formato ISO 8601 UTC
- Los IDs son ObjectIds de MongoDB
- La API es case-sensitive para los nombres de campos
- Se recomienda usar HTTPS en producción
- Los tokens JWT tienen una duración limitada y deben renovarse usando el refresh token
