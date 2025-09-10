# SuperGains API Documentation

API REST para la plataforma **SuperGains**.  
Disponible en entorno local y producción.

---

##   Base URLs

- **Local (desarrollo):**
http://localhost:4000/api

markdown
Copiar
Editar

- **Producción (Render):**
https://supergains-backend.onrender.com/api

yaml
Copiar
Editar

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
  "contraseña": "password123",
  "rol": "usuario"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "role": "usuario",
      "activo": true,
      "lastLogin": "2025-01-XX..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
}
```

#### POST /users/login
Inicia sesión y genera tokens JWT.

**Request Body:**
```json
{
  "email": "juan@ejemplo.com",
  "contraseña": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "role": "usuario",
      "activo": true,
      "lastLogin": "2025-01-XX..."
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
}
```

#### POST /users/refresh
Refresca el token de acceso usando un refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refrescado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### POST /users/logout
Cierra la sesión del usuario.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

#### GET /users/profile
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "rol": "usuario",
      "activo": true,
      "fechaCreacion": "2025-01-XX..."
    }
  }
}
```

#### PUT /users/profile
Actualiza el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juan.carlos@ejemplo.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan.carlos@ejemplo.com",
      "nombre": "Juan Carlos Pérez",
      "rol": "usuario",
      "activo": true
    }
  }
}
```

#### GET /users/token-status
Verifica el estado del token de autenticación del usuario.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "rol": "usuario"
    },
    "token": {
      "valido": true,
      "expiraEn": "2025-01-06T03:00:00.000Z",
      "tiempoRestante": 3600,
      "expiraPronto": false
    }
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

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Designer Whey Protein",
          "price": 167580,
          "imageUrl": "https://example.com/image.jpg",
          "brand": "SuperGains"
        },
        "quantity": 2,
        "price": 167580
      }
    ],
    "total": 335160
  }
}
```

#### POST /cart/add
Agrega un producto al carrito del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Producto agregado al carrito",
  "data": {
    "items": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Designer Whey Protein",
          "price": 167580,
          "imageUrl": "https://example.com/image.jpg",
          "brand": "SuperGains"
        },
        "quantity": 1,
        "price": 167580
      }
    ],
    "total": 167580
  }
}
```

**Errores posibles:**
- `404`: Producto no encontrado
- `400`: Stock insuficiente
- `401`: Token de autenticación inválido o expirado

#### PUT /cart/item/:productId
Actualiza la cantidad de un producto en el carrito.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Carrito actualizado",
  "data": {
    "items": [
      {
        "product": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Designer Whey Protein",
          "price": 167580,
          "imageUrl": "https://example.com/image.jpg",
          "brand": "SuperGains"
        },
        "quantity": 3,
        "price": 167580
      }
    ],
    "total": 502740
  }
}
```

#### DELETE /cart/item/:productId
Remueve un producto del carrito.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Producto removido del carrito",
  "data": {
    "items": [],
    "total": 0
  }
}
```

#### DELETE /cart/clear
Limpia completamente el carrito del usuario.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Carrito limpiado",
  "data": {
    "items": [],
    "total": 0
  }
}
```

### Productos

#### GET /products
Obtiene todos los productos con filtros avanzados. **Ruta pública** - No requiere autenticación.

**Query Parameters:**

**Paginación:**
- `limit` (opcional): Número máximo de productos a retornar (máximo 100, por defecto 50).
- `page` (opcional): Número de página para paginación (por defecto 1).

**Filtros:**
- `brand` (opcional): Filtrar por marca (búsqueda parcial, case-insensitive).
- `price_min` (opcional): Precio mínimo para filtrar.
- `price_max` (opcional): Precio máximo para filtrar.
- `category` (opcional): Filtrar por categoría. Múltiples categorías separadas por coma.

**Ejemplos de uso:**

```bash
# Obtener todos los productos
GET https://supergains-backend.onrender.com/api/products

# Filtrar por marca
GET https://supergains-backend.onrender.com/api/products?brand=SUPERGAINS

# Filtrar por rango de precios
GET https://supergains-backend.onrender.com/api/products?price_min=100&price_max=300

# Filtrar por categoría
GET https://supergains-backend.onrender.com/api/products?category=Protein

# Múltiples categorías
GET https://supergains-backend.onrender.com/api/products?category=Protein,Vitamins

# Combinar filtros con paginación
GET https://supergains-backend.onrender.com/api/products?brand=SUPERGAINS&price_min=50&price_max=200&limit=10&page=1
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "totalCount": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Designer Whey Protein",
      "brand": "SUPERGAINS",
      "price": 167580,
      "stock": 50,
      "imageUrl": "https://example.com/image.jpg",
      "description": "Proteína de suero premium",
      "categories": ["Protein", "Whey"],
      "createdAt": "2025-01-05T03:00:00.000Z",
      "updatedAt": "2025-01-05T03:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null,
    "limit": 10,
    "startIndex": 1,
    "endIndex": 10,
    "showing": "1-10 de 25 productos"
  },
  "filters": {
    "brand": "SUPERGAINS",
    "price_min": "50",
    "price_max": "200",
    "category": "Protein"
  }
}
```

**Información de Paginación:**
- `currentPage`: Página actual
- `totalPages`: Total de páginas disponibles
- `hasNextPage`: Indica si hay página siguiente
- `hasPrevPage`: Indica si hay página anterior
- `nextPage`: Número de la página siguiente (null si no existe)
- `prevPage`: Número de la página anterior (null si no existe)
- `limit`: Límite de productos por página aplicado
- `startIndex`: Índice del primer producto en la página actual
- `endIndex`: Índice del último producto en la página actual
- `showing`: Texto descriptivo de los productos mostrados

yaml
Copiar
Editar

---

#### GET /products/:id
Obtiene un producto específico por ID. **Ruta pública** - No requiere autenticación.

**Ejemplo:**
GET https://supergains-backend.onrender.com/api/products/64f1a2b3c4d5e6f7g8h9i0j1

yaml
Copiar
Editar

---

#### POST /products
Crea un nuevo producto. **Ruta protegida** - Requiere autenticación JWT.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Nuevo Producto",
  "brand": "Marca",
  "price": 29.99,
  "stock": 100,
  "imageUrl": "https://example.com/image.jpg",
  "description": "Descripción del producto",
  "categories": ["Categoría 1", "Categoría 2"]
}
#### PUT /products/:id
Actualiza un producto existente. **Ruta protegida** - Requiere autenticación JWT.

**Headers:**
```
Authorization: Bearer <access_token>
```

Request Body (ejemplo):

json
Copiar
Editar
{
  "price": 34.99,
  "stock": 75
}
#### DELETE /products/:id
Elimina un producto por ID. **Ruta protegida** - Requiere autenticación JWT y rol de administrador.

**Headers:**
```
Authorization: Bearer <access_token>
```

#### GET /products/search
Busca productos con índices de texto completo de MongoDB. **Ruta pública** - No requiere autenticación.

**Query Parameters:**

**Búsqueda:**
- `q` (opcional): Término de búsqueda en nombre, descripción, marca y categorías usando índices de texto completo.
- `category` (opcional): Filtrar por categoría. Múltiples categorías separadas por coma.
- `brand` (opcional): Filtrar por marca. Múltiples marcas separadas por coma.
- `price_min` (opcional): Precio mínimo para filtrar.
- `price_max` (opcional): Precio máximo para filtrar.

**Paginación:**
- `limit` (opcional): Número máximo de productos a retornar (máximo 100, por defecto 20).
- `page` (opcional): Número de página para paginación (por defecto 1).

**Ordenamiento:**
- `sortBy` (opcional): Ordenar por `score` (relevancia), `name`, `price`, `createdAt` (por defecto `score`).

**Ejemplos de uso:**

```bash
# Búsqueda básica de texto
GET https://supergains-backend.onrender.com/api/products/search?q=protein

# Búsqueda con filtros
GET https://supergains-backend.onrender.com/api/products/search?q=whey&category=Protein&brand=SUPERGAINS

# Búsqueda con rango de precios
GET https://supergains-backend.onrender.com/api/products/search?q=protein&price_min=100&price_max=300

# Búsqueda con ordenamiento por precio
GET https://supergains-backend.onrender.com/api/products/search?q=protein&sortBy=price

# Búsqueda con paginación
GET https://supergains-backend.onrender.com/api/products/search?q=protein&limit=10&page=1

# Múltiples categorías
GET https://supergains-backend.onrender.com/api/products/search?category=Protein,Vitamins
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "totalCount": 15,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Designer Whey Protein",
      "brand": "SUPERGAINS",
      "price": 167580,
      "stock": 50,
      "imageUrl": "https://example.com/image.jpg",
      "description": "Proteína de suero premium",
      "categories": ["Protein", "Whey"],
      "createdAt": "2025-01-05T03:00:00.000Z",
      "updatedAt": "2025-01-05T03:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPrevPage": false,
    "nextPage": 2,
    "prevPage": null,
    "limit": 10,
    "startIndex": 1,
    "endIndex": 10,
    "showing": "1-10 de 15 productos"
  },
  "search": {
    "query": "protein",
    "category": "Protein",
    "brand": "SUPERGAINS",
    "price_min": "100",
    "price_max": "300",
    "sortBy": "score",
    "totalResults": 15
  }
}
```

**Características de la búsqueda:**
- **Índices de texto completo**: Búsqueda optimizada en nombre, descripción, marca y categorías
- **Ordenamiento por relevancia**: Los resultados se ordenan por relevancia cuando se usa búsqueda de texto
- **Filtros combinados**: Puede combinar búsqueda de texto con filtros de categoría, marca y precio
- **Paginación completa**: Incluye metadatos de paginación detallados
- **Múltiples categorías/marcas**: Soporte para búsqueda en múltiples categorías o marcas
Health Check
GET /health
Verifica el estado de la API.

Ejemplo (producción):

nginx
Copiar
Editar
GET https://supergains-backend.onrender.com/api/health
Response:

json
Copiar
Editar
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-XX..."
}
   Códigos de Estado HTTP
200 - OK

201 - Created

400 - Bad Request

404 - Not Found

500 - Internal Server Error

### Validaciones de Entrada
La API utiliza **express-validator** para validar todas las entradas de datos. Las validaciones incluyen:

#### Validaciones de Productos
- **Nombre**: Obligatorio, 2-100 caracteres
- **Marca**: Opcional, máximo 50 caracteres
- **Precio**: Obligatorio, número entre 0-10,000
- **Stock**: Opcional, entero mayor o igual a 0
- **URL de imagen**: Opcional, debe ser URL válida
- **Descripción**: Opcional, máximo 500 caracteres
- **Categorías**: Opcional, máximo 10 categorías, cada una máximo 50 caracteres

#### Validaciones de Usuarios
- **Nombre**: Obligatorio, 2-50 caracteres
- **Email**: Obligatorio, formato de email válido, máximo 100 caracteres
- **Contraseña**: Obligatorio, 6-100 caracteres, debe contener al menos una letra minúscula, una mayúscula y un número
- **Rol**: Opcional, debe ser 'usuario', 'admin' o 'moderador'

#### Validaciones de Carrito
- **ID de producto**: Obligatorio, debe ser ObjectId válido de MongoDB
- **Cantidad**: Obligatorio, entero entre 1-100

#### Validaciones de Filtros y Búsqueda
- **Límite**: Opcional, entero entre 1-100
- **Página**: Opcional, entero mayor a 0
- **Precios**: Opcional, números válidos, precio mínimo no puede ser mayor al máximo
- **Ordenamiento**: Opcional, valores permitidos según el endpoint

#### Respuesta de Errores de Validación
```json
{
  "success": false,
  "error": "Datos de entrada inválidos",
  "details": [
    {
      "field": "nombre",
      "message": "El nombre es obligatorio",
      "value": ""
    },
    {
      "field": "email",
      "message": "El email debe ser válido",
      "value": "email-invalido"
    }
  ]
}
```

   Validaciones del Modelo
Producto
name: Obligatorio, máx. 100 caracteres.

price: Obligatorio, entre 0 y 10,000.

stock: Por defecto 0, mínimo 0.

imageUrl: URL válida (opcional).

description: Máx. 500 caracteres.

categories: Máx. 10 categorías.

   Campos Virtuales
formattedPrice: Precio con símbolo de moneda.

stockStatus: Estado del stock (Agotado, Bajo, Disponible).

   Índices de Base de Datos
Búsqueda de texto en nombre y descripción.

Categorías para consultas rápidas.

Precio para ordenamiento/filtros.

Marca para agrupación.

   Ejemplos de Uso
Crear un producto
bash
Copiar
Editar
curl -X POST https://supergains-backend.onrender.com/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creatina Monohidratada",
    "brand": "MyProtein",
    "price": 24.99,
    "stock": 100,
    "description": "Creatina pura para aumentar fuerza",
    "categories": ["Creatina", "Suplementos"]
  }'
Buscar productos
bash
Copiar
Editar
curl "https://supergains-backend.onrender.com/api/products/search?q=proteína&category=Suplementos"
Obtener todos los productos
bash
Copiar
Editar
curl https://supergains-backend.onrender.com/api/products

---

## Flujo de Autenticación

### Resumen del Flujo
El sistema de autenticación de SuperGains utiliza JWT (JSON Web Tokens) para manejar la autenticación de usuarios de forma segura. El flujo completo incluye registro, login, uso de tokens, refresh y logout.

### Diagrama del Flujo
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Usuario   │    │  Frontend   │    │   Backend   │    │   MongoDB   │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │                   │
       │ 1. Registro       │                   │                   │
       ├──────────────────►│ POST /register    │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 2. Crear usuario  │
       │                   │                   ├──────────────────►│
       │                   │                   │ 3. Generar JWT   │
       │                   │                   │◄──────────────────┤
       │ 4. Tokens         │◄──────────────────┤                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
       │ 5. Login          │                   │                   │
       ├──────────────────►│ POST /login       │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 6. Validar creds │
       │                   │                   ├──────────────────►│
       │                   │                   │ 7. Generar JWT   │
       │                   │                   │◄──────────────────┤
       │ 8. Tokens         │◄──────────────────┤                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
       │ 9. API Calls      │                   │                   │
       ├──────────────────►│ GET /profile      │                   │
       │                   │ Authorization:    │                   │
       │                   │ Bearer <token>    │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 10. Validar JWT  │
       │                   │                   ├──────────────────►│
       │                   │                   │ 11. Respuesta    │
       │                   │                   │◄──────────────────┤
       │ 12. Datos         │◄──────────────────┤                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
       │ 13. Refresh       │                   │                   │
       ├──────────────────►│ POST /refresh     │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 14. Nuevo token  │
       │                   │                   │◄──────────────────┤
       │ 15. Nuevo token   │◄──────────────────┤                   │
       │◄──────────────────│                   │                   │
       │                   │                   │                   │
       │ 16. Logout        │                   │                   │
       ├──────────────────►│ POST /logout      │                   │
       │                   ├──────────────────►│                   │
       │                   │                   │ 17. Revocar token│
       │                   │                   │◄──────────────────┤
       │ 18. Confirmación  │◄──────────────────┤                   │
       │◄──────────────────│                   │                   │
```

### Pasos Detallados

#### 1. Registro de Usuario
```bash
# Paso 1: Registrar nuevo usuario
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "contraseña": "password123"
  }'

# Respuesta exitosa:
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "role": "usuario",
      "activo": true,
      "lastLogin": "2025-01-05T03:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
}
```

#### 2. Login de Usuario
```bash
# Paso 2: Iniciar sesión
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "contraseña": "password123"
  }'

# Respuesta exitosa:
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "role": "usuario",
      "activo": true,
      "lastLogin": "2025-01-05T03:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "24h"
    }
  }
}
```

#### 3. Uso de Tokens para Acceso a Rutas Protegidas
```bash
# Paso 3: Acceder a ruta protegida
curl -X GET http://localhost:4000/api/users/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Respuesta exitosa:
{
  "success": true,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "rol": "usuario",
      "activo": true,
      "fechaCreacion": "2025-01-05T02:00:00.000Z"
    }
  }
}
```

#### 4. Verificación de Estado del Token
```bash
# Paso 4: Verificar estado del token
curl -X GET http://localhost:4000/api/users/token-status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Respuesta exitosa:
{
  "success": true,
  "message": "Token válido",
  "data": {
    "usuario": {
      "id": "507f1f77bcf86cd799439011",
      "email": "juan@ejemplo.com",
      "nombre": "Juan Pérez",
      "rol": "usuario"
    },
    "token": {
      "valido": true,
      "expiraEn": "2025-01-06T03:00:00.000Z",
      "tiempoRestante": 3600,
      "expiraPronto": false
    }
  }
}
```

#### 5. Refresh de Token
```bash
# Paso 5: Refrescar token cuando esté próximo a expirar
curl -X POST http://localhost:4000/api/users/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Respuesta exitosa:
{
  "success": true,
  "message": "Token refrescado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

#### 6. Logout
```bash
# Paso 6: Cerrar sesión
curl -X POST http://localhost:4000/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'

# Respuesta exitosa:
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Nota importante sobre JWT y Logout**: Los tokens JWT son stateless, lo que significa que el servidor no mantiene un registro de tokens válidos. Después del logout, el access token seguirá siendo técnicamente válido hasta que expire. Para mayor seguridad en producción, se recomienda:
- Usar tokens con tiempo de vida corto (15-30 minutos)
- Implementar una blacklist de tokens en Redis
- Almacenar tokens en httpOnly cookies para mejor seguridad

### Manejo de Errores

#### Token Expirado
```json
{
  "success": false,
  "message": "Token expirado"
}
```

#### Token Inválido
```json
{
  "success": false,
  "message": "Token inválido"
}
```

#### Credenciales Incorrectas
```json
{
  "success": false,
  "message": "Credenciales inválidas"
}
```

#### Usuario Inactivo
```json
{
  "success": false,
  "message": "Usuario inactivo"
}
```

### Headers de Respuesta

#### Token Próximo a Expirar
```
X-Token-Expires-Soon: true
X-Token-Expires-At: 2025-01-06T03:00:00.000Z
X-Token-Refresh-Suggested: true
```

### Mejores Prácticas

1. **Almacenamiento de Tokens**:
   - Access Token: Almacenar en memoria o sessionStorage
   - Refresh Token: Almacenar en httpOnly cookie o localStorage seguro

2. **Renovación Automática**:
   - Verificar `X-Token-Expires-Soon` header
   - Renovar automáticamente cuando sea necesario
   - Implementar retry automático en caso de token expirado

3. **Manejo de Errores**:
   - Interceptar respuestas 401
   - Intentar refresh automático
   - Redirigir a login si refresh falla

4. **Seguridad**:
   - Nunca exponer tokens en logs
   - Usar HTTPS en producción
   - Implementar rate limiting en endpoints de auth

### Implementación en Frontend

#### JavaScript/React Ejemplo
```javascript
class AuthService {
  constructor() {
    this.baseURL = 'http://localhost:4000/api';
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  // Login
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, contraseña: password }),
      });

      const data = await response.json();
      
      if (data.success) {
        this.accessToken = data.data.tokens.accessToken;
        this.refreshToken = data.data.tokens.refreshToken;
        
        localStorage.setItem('accessToken', this.accessToken);
        localStorage.setItem('refreshToken', this.refreshToken);
        
        return data.data.user;
      }
      throw new Error(data.message);
    } catch (error) {
      throw error;
    }
  }

  // Refresh token
  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.baseURL}/users/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();
      
      if (data.success) {
        this.accessToken = data.data.accessToken;
        localStorage.setItem('accessToken', this.accessToken);
        return this.accessToken;
      }
      throw new Error(data.message);
    } catch (error) {
      this.logout();
      throw error;
    }
  }

  // API call con retry automático
  async apiCall(url, options = {}) {
    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      // Si el token expiró, intentar refresh
      if (response.status === 401) {
        await this.refreshAccessToken();
        config.headers['Authorization'] = `Bearer ${this.accessToken}`;
        return await fetch(`${this.baseURL}${url}`, config);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  async logout() {
    try {
      if (this.refreshToken) {
        await fetch(`${this.baseURL}/users/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }
}

// Uso
const authService = new AuthService();

// Login
authService.login('juan@ejemplo.com', 'password123')
  .then(user => console.log('Usuario logueado:', user))
  .catch(error => console.error('Error de login:', error));

// Llamada a API protegida
authService.apiCall('/users/profile')
  .then(response => response.json())
  .then(data => console.log('Perfil:', data))
  .catch(error => console.error('Error:', error));
```

### Troubleshooting

#### Problemas Comunes

1. **Error 401 - Token expirado**
   ```json
   {
     "success": false,
     "message": "Token expirado"
   }
   ```
   **Solución**: Implementar refresh automático o redirigir a login

2. **Error 401 - Token inválido**
   ```json
   {
     "success": false,
     "message": "Token inválido"
   }
   ```
   **Solución**: Verificar formato del token y headers de Authorization

3. **Error 403 - Acceso denegado**
   ```json
   {
     "success": false,
     "message": "Acceso denegado. Rol insuficiente"
   }
   ```
   **Solución**: Verificar que el usuario tenga el rol necesario

4. **Error de CORS**
   ```
   Access to fetch at 'http://localhost:4000/api/users/login' 
   from origin 'http://localhost:3000' has been blocked by CORS policy
   ```
   **Solución**: Verificar configuración CORS en el backend

#### Debugging

1. **Verificar token en jwt.io**:
   - Copiar el token JWT
   - Pegar en https://jwt.io
   - Verificar payload y expiración

2. **Verificar headers**:
   ```bash
   curl -v -H "Authorization: Bearer <token>" http://localhost:4000/api/users/profile
   ```

3. **Verificar estado del token**:
   ```bash
   curl -H "Authorization: Bearer <token>" http://localhost:4000/api/users/token-status
   ```

#### Logs Útiles

```bash
# Ver logs del servidor
npm run dev

# Ver logs de MongoDB
# Revisar conexión en MongoDB Atlas

# Ver logs de autenticación
# Revisar console.log en el frontend
```

### Resumen del Flujo de Autenticación

El sistema de autenticación JWT de SuperGains está completamente implementado y funcional. Incluye:

#### ✅ Funcionalidades Implementadas
- **Registro de usuarios** con generación automática de tokens JWT
- **Login seguro** con validación de credenciales
- **Tokens de acceso** (24h) y **refresh tokens** (7d)
- **Middleware de autenticación** para proteger rutas
- **Middleware de roles** para control de acceso granular
- **Verificación de estado de tokens** con información de expiración
- **Refresh automático** de tokens de acceso
- **Logout** con invalidación de refresh tokens
- **Headers informativos** para el frontend sobre expiración de tokens
- **Rutas públicas y protegidas** claramente diferenciadas

#### ✅ Endpoints de Autenticación
- `POST /api/users/register` - Registro de usuarios
- `POST /api/users/login` - Inicio de sesión
- `POST /api/users/refresh` - Refresh de tokens
- `POST /api/users/logout` - Cerrar sesión
- `GET /api/users/profile` - Perfil del usuario (protegida)
- `PUT /api/users/profile` - Actualizar perfil (protegida)
- `GET /api/users/token-status` - Estado del token (protegida)

#### ✅ Rutas Protegidas
- **Productos**: Crear, actualizar, eliminar (requiere autenticación)
- **Usuarios**: Perfil y actualización (requiere autenticación)
- **Eliminación de productos**: Requiere rol de administrador

#### ✅ Seguridad Implementada
- Contraseñas hasheadas con bcrypt
- Tokens JWT firmados con secreto seguro
- Validación de tokens en cada request protegido
- Verificación de usuarios activos
- Headers de seguridad (CORS, Helmet)
- Rate limiting en endpoints de autenticación

#### ✅ Testing y Documentación
- Scripts de prueba completos para todo el flujo
- Documentación detallada con ejemplos
- Guía de troubleshooting
- Ejemplos de implementación en frontend
- Diagramas de flujo de autenticación

El sistema está listo para ser integrado con el frontend y puede manejar autenticación de usuarios de forma segura y escalable.

---

## Autenticación JWT

### Configuración
La API utiliza JWT (JSON Web Tokens) para la autenticación. Los tokens incluyen:
- **Access Token**: Válido por 24 horas por defecto
- **Refresh Token**: Válido por 7 días por defecto

### Variables de Entorno
```env
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Uso de Tokens
Para acceder a rutas protegidas, incluye el access token en el header:
```
Authorization: Bearer <access_token>
```

### Ejemplos de Uso

#### Registro de Usuario
```bash
curl -X POST http://localhost:4000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "contraseña": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:4000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@ejemplo.com",
    "contraseña": "password123"
  }'
```

#### Acceso a Perfil (Protegido)
```bash
curl -X GET http://localhost:4000/api/users/profile \
  -H "Authorization: Bearer <access_token>"
```

#### Refresh Token
```bash
curl -X POST http://localhost:4000/api/users/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

#### Logout
```bash
curl -X POST http://localhost:4000/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refresh_token>"
  }'
```

### Códigos de Error de Autenticación
- **401 Unauthorized**: Token inválido, expirado o no proporcionado
- **403 Forbidden**: Token válido pero sin permisos suficientes
- **400 Bad Request**: Datos de entrada inválidos

### Seguridad
- Los tokens están firmados con una clave secreta
- Los refresh tokens permiten renovar access tokens sin re-autenticación
- Los tokens incluyen información del usuario (ID, email, rol)
- Se valida la existencia y estado activo del usuario en cada request