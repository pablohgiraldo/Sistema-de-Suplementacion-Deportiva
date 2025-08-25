# SuperGains API Documentation

API REST para la plataforma **SuperGains**.  
Disponible en entorno local y producción.

---

## 🌍 Base URLs

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

### Productos

#### GET /products
Obtiene todos los productos (máximo 50).

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
Obtiene un producto específico por ID.

**Ejemplo:**
GET https://supergains-backend.onrender.com/api/products/64f1a2b3c4d5e6f7g8h9i0j1

yaml
Copiar
Editar

---

#### POST /products
Crea un nuevo producto.

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
PUT /products/:id
Actualiza un producto existente.

Request Body (ejemplo):

json
Copiar
Editar
{
  "price": 34.99,
  "stock": 75
}
DELETE /products/:id
Elimina un producto por ID.

GET /products/search
Busca productos por nombre o categoría.

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
📡 Códigos de Estado HTTP
200 - OK

201 - Created

400 - Bad Request

404 - Not Found

500 - Internal Server Error

📑 Validaciones del Modelo
Producto
name: Obligatorio, máx. 100 caracteres.

price: Obligatorio, entre 0 y 10,000.

stock: Por defecto 0, mínimo 0.

imageUrl: URL válida (opcional).

description: Máx. 500 caracteres.

categories: Máx. 10 categorías.

⚡ Campos Virtuales
formattedPrice: Precio con símbolo de moneda.

stockStatus: Estado del stock (Agotado, Bajo, Disponible).

🗄️ Índices de Base de Datos
Búsqueda de texto en nombre y descripción.

Categorías para consultas rápidas.

Precio para ordenamiento/filtros.

Marca para agrupación.

🔍 Ejemplos de Uso
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