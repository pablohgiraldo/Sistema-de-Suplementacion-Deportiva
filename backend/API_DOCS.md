# SuperGains API Documentation

API REST para la plataforma **SuperGains**.  
Disponible en entorno local y producción.

---

## Base URLs

- **Local (desarrollo):**
http://localhost:4000/api

- **Producción (Render):**
https://supergains-backend.onrender.com/api

---

## Endpoints

### Autenticación JWT

#### POST /users/register
Registra un nuevo usuario y genera tokens JWT.

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "contraseña": "Password123",
  "rol": "usuario"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "rol": "usuario",
      "activo": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "email",
      "message": "El email debe ser válido"
    },
    {
      "field": "contraseña",
      "message": "La contraseña debe contener al menos una letra minúscula, una mayúscula y un número"
    }
  ]
}
```

#### POST /users/login
Inicia sesión con email y contraseña.

**Request Body:**
```json
{
  "email": "juan@ejemplo.com",
  "contraseña": "Password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "rol": "usuario",
      "activo": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

#### GET /users/profile
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "usuario",
    "activo": true,
    "fechaCreacion": "2025-01-15T10:30:00.000Z"
  }
}
```

#### POST /users/refresh
Renueva el access token usando el refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Carrito de Compras

#### GET /cart
Obtiene el carrito del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product": {
          "_id": "68ba5a9042eecff32cec5f49",
          "name": "Whey Protein",
          "price": 29.99,
          "brand": "Optimum Nutrition",
          "image": "https://example.com/whey.jpg"
        },
        "quantity": 2,
        "subtotal": 59.98
      }
    ],
    "totalItems": 2,
    "totalPrice": 59.98
  }
}
```

#### POST /cart/add
Agrega un producto al carrito.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "68ba5a9042eecff32cec5f49",
  "quantity": 2
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Producto agregado al carrito",
  "data": {
    "item": {
      "product": {
        "_id": "68ba5a9042eecff32cec5f49",
        "name": "Whey Protein",
        "price": 29.99
      },
      "quantity": 2,
      "subtotal": 59.98
    }
  }
}
```

#### PUT /cart/item/:productId
Actualiza la cantidad de un producto en el carrito.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cantidad actualizada",
  "data": {
    "item": {
      "product": {
        "_id": "68ba5a9042eecff32cec5f49",
        "name": "Whey Protein",
        "price": 29.99
      },
      "quantity": 3,
      "subtotal": 89.97
    }
  }
}
```

#### DELETE /cart/item/:productId
Elimina un producto del carrito.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Producto eliminado del carrito"
}
```

### Productos

#### GET /products
Lista productos con filtros y paginación.

**Query Parameters:**
- `brand` (string): Filtrar por marca
- `category` (string): Filtrar por categoría
- `price_min` (number): Precio mínimo
- `price_max` (number): Precio máximo
- `limit` (number): Elementos por página (1-100)
- `page` (number): Número de página (≥1)

**Example Request:**
```
GET /products?brand=Optimum&price_min=10&price_max=50&limit=10&page=1
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 10,
  "totalCount": 25,
  "page": 1,
  "totalPages": 3,
  "data": [
    {
      "_id": "68ba5a9042eecff32cec5f49",
      "name": "Whey Protein",
      "brand": "Optimum Nutrition",
      "price": 29.99,
      "category": "proteina",
      "stock": 100,
      "description": "Proteína de suero de leche",
      "image": "https://example.com/whey.jpg"
    }
  ]
}
```

#### GET /products/search
Busca productos por texto con ordenamiento.

**Query Parameters:**
- `q` (string): Término de búsqueda (1-100 caracteres)
- `sortBy` (string): Ordenamiento (score, name, price, createdAt, updatedAt)
- `limit` (number): Elementos por página (1-100)
- `page` (number): Número de página (≥1)

**Example Request:**
```
GET /products/search?q=whey protein&sortBy=price&limit=20
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "totalCount": 5,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "_id": "68ba5a9042eecff32cec5f49",
      "name": "Whey Protein",
      "brand": "Optimum Nutrition",
      "price": 29.99,
      "category": "proteina",
      "stock": 100,
      "description": "Proteína de suero de leche",
      "image": "https://example.com/whey.jpg",
      "score": 0.95
    }
  ]
}
```

## Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Datos de entrada inválidos
- **401 Unauthorized**: Token de acceso requerido o inválido
- **403 Forbidden**: Acceso denegado
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error interno del servidor

## Autenticación

### JWT Tokens
- **Access Token**: Válido por 24 horas
- **Refresh Token**: Válido por 7 días
- **Formato**: `Bearer <token>`

### Headers Requeridos
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## Ejemplos de Uso

### Flujo Completo de Autenticación

```bash
# 1. Registrar usuario
curl -X POST "https://supergains-backend.onrender.com/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "contraseña": "Password123",
    "rol": "usuario"
  }'

# 2. Iniciar sesión
curl -X POST "https://supergains-backend.onrender.com/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "contraseña": "Password123"
  }'

# 3. Usar token para acceder a recursos protegidos
curl -X GET "https://supergains-backend.onrender.com/api/users/profile" \
  -H "Authorization: Bearer <access_token>"
```

### Flujo Completo de Carrito

```bash
# 1. Obtener carrito
curl -X GET "https://supergains-backend.onrender.com/api/cart" \
  -H "Authorization: Bearer <access_token>"

# 2. Agregar producto
curl -X POST "https://supergains-backend.onrender.com/api/cart/add" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "68ba5a9042eecff32cec5f49",
    "quantity": 2
  }'

# 3. Actualizar cantidad
curl -X PUT "https://supergains-backend.onrender.com/api/cart/item/68ba5a9042eecff32cec5f49" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }'

# 4. Eliminar producto
curl -X DELETE "https://supergains-backend.onrender.com/api/cart/item/68ba5a9042eecff32cec5f49" \
  -H "Authorization: Bearer <access_token>"
```

---

**Última actualización**: Enero 2025  
**Versión API**: 1.0.0  
**Estado**: Producción