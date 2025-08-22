# SuperGains API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### Productos

#### GET /products
Obtiene todos los productos (máximo 50)

**Query Parameters:**
- `limit` (opcional): Número máximo de productos a retornar
- `page` (opcional): Número de página para paginación

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Proteína Whey Gold Standard",
      "brand": "Optimum Nutrition",
      "price": 89.99,
      "stock": 50,
      "imageUrl": "https://example.com/whey-protein.jpg",
      "description": "Proteína de suero de leche de alta calidad",
      "categories": ["Proteínas", "Suplementos"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### GET /products/:id
Obtiene un producto específico por ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Proteína Whey Gold Standard",
    "brand": "Optimum Nutrition",
    "price": 89.99,
    "stock": 50,
    "imageUrl": "https://example.com/whey-protein.jpg",
    "description": "Proteína de suero de leche de alta calidad",
    "categories": ["Proteínas", "Suplementos"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### POST /products
Crea un nuevo producto

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
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Nuevo Producto",
    "brand": "Marca",
    "price": 29.99,
    "stock": 100,
    "imageUrl": "https://example.com/image.jpg",
    "description": "Descripción del producto",
    "categories": ["Categoría 1", "Categoría 2"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### PUT /products/:id
Actualiza un producto existente

**Request Body:**
```json
{
  "price": 34.99,
  "stock": 75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "Nuevo Producto",
    "brand": "Marca",
    "price": 34.99,
    "stock": 75,
    "imageUrl": "https://example.com/image.jpg",
    "description": "Descripción del producto",
    "categories": ["Categoría 1", "Categoría 2"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

#### DELETE /products/:id
Elimina un producto

**Response:**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

#### GET /products/search
Busca productos por nombre o categoría

**Query Parameters:**
- `q` (opcional): Término de búsqueda en nombre y descripción
- `category` (opcional): Categoría específica

**Example:**
```
GET /products/search?q=proteína&category=Suplementos
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "Proteína Whey Gold Standard",
      "brand": "Optimum Nutrition",
      "price": 89.99,
      "stock": 50,
      "categories": ["Proteínas", "Suplementos"]
    }
  ]
}
```

### Health Check

#### GET /health
Verifica el estado de la API

**Response:**
```json
{
  "status": "ok"
}
```

## Códigos de Estado HTTP

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Validaciones del Modelo

### Producto
- **name**: Obligatorio, máximo 100 caracteres
- **price**: Obligatorio, entre 0 y 10,000
- **stock**: Por defecto 0, mínimo 0
- **imageUrl**: Debe ser una URL válida (opcional)
- **description**: Máximo 500 caracteres
- **categories**: Máximo 10 categorías

## Campos Virtuales

- **formattedPrice**: Precio formateado con símbolo de moneda
- **stockStatus**: Estado del stock (Agotado, Stock bajo, Disponible)

## Índices de Base de Datos

- Búsqueda de texto en nombre y descripción
- Categorías para consultas rápidas
- Precio para ordenamiento y filtros
- Marca para agrupación

## Ejemplos de Uso

### Crear un producto
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creatina Monohidratada",
    "brand": "MyProtein",
    "price": 24.99,
    "stock": 100,
    "description": "Creatina pura para aumentar fuerza",
    "categories": ["Creatina", "Suplementos"]
  }'
```

### Buscar productos
```bash
curl "http://localhost:3000/api/products/search?q=proteína&category=Suplementos"
```

### Obtener todos los productos
```bash
curl http://localhost:3000/api/products
```
