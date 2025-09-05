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

### Productos

#### GET /products
Obtiene todos los productos (máximo 50). **Ruta pública** - No requiere autenticación.

**Query Parameters:**
- `limit` (opcional): Número máximo de productos a retornar.
- `page` (opcional): Número de página para paginación.

**Ejemplo (producción):**
GET https://supergains-backend.onrender.com/api/products?limit=10&page=1

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
Busca productos por nombre o categoría. **Ruta pública** - No requiere autenticación.

Query Parameters:

q: término de búsqueda en nombre y descripción.

category: categoría específica.

Ejemplo:

ruby
Copiar
Editar
GET https://supergains-backend.onrender.com/api/products/search?q=proteína&category=Suplementos
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