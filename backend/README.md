# 🚀 Backend SuperGains

## 📋 Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp env.example .env
# Edita .env con tus valores reales
```

## 🧪 Scripts Disponibles

```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start# 🚀 Backend SuperGains

API REST para la plataforma SuperGains (e-commerce de suplementos deportivos).  
Desarrollado con **Node.js + Express + MongoDB**, desplegado en **Render**.

---

## 📋 Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
# Edita .env con tus valores reales
🧪 Scripts Disponibles
bash
Copiar
Editar
# Desarrollo con nodemon
npm run dev

# Producción
npm start

# Probar conexión a MongoDB
npm run test:mongodb

# Probar servidor completo
npm run test:server

# Seed de base de datos
npm run seed
🔧 Variables de Entorno
Crea un archivo .env con:

env
Copiar
Editar
MONGODB_URI=mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains?retryWrites=true&w=majority
JWT_SECRET=tu_secreto_jwt_muy_seguro
CORS_ORIGIN=https://supergains-frontend.vercel.app
NODE_ENV=development
PORT=4000
Notas importantes:

CORS_ORIGIN debe contener el dominio del frontend en Vercel y/o http://localhost:5173 para desarrollo.

No definir PORT manualmente en Render (Render lo asigna automáticamente).

🚀 Iniciar Servidor
bash
Copiar
Editar
# Desarrollo
npm run dev

# Producción
npm start
El servidor corre en http://localhost:4000 por defecto.

📡 Endpoints
Health Check
GET /api/health → Estado del servidor.

json
Copiar
Editar
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-08-24T19:30:00.000Z"
}
Productos
GET /api/products → Lista de productos.

☁️ Despliegue en Render
Crear un servicio web en Render con el repo del backend.

Configurar Environment Variables en Render con los valores de .env.

No definir PORT. Render asigna uno automáticamente.

Usar build command:

bash
Copiar
Editar
npm install && npm run build
Start command:

bash
Copiar
Editar
npm start
Validación:

Backend: https://supergains-backend.onrender.com/api/health

Conexión con frontend: https://supergains-frontend.vercel.app

🐞 Problemas Resueltos en Sprint 1
CORS bloqueando comunicación frontend-backend

Solución: Configurar cors() en Express con dominios permitidos.

Cannot GET / en backend

Solución: Definir ruta /api/health y opcionalmente / para mensaje de bienvenida.

Error de PORT en Render

Solución: Eliminar variable PORT manual y usar process.env.PORT || 4000.

🔍 Pruebas
bash
Copiar
Editar
# Probar conexión a MongoDB
npm run test:mongodb

# Probar servidor completo
npm run test:server

# Probar conexión a MongoDB
npm run test:mongodb

# Probar servidor completo
npm run test:server

# Seed de base de datos
npm run seed
```

## 🔧 Variables de Entorno

Crea un archivo `.env` con:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains?retryWrites=true&w=majority
JWT_SECRET=tu_secreto_jwt_muy_seguro
CORS_ORIGIN=https://tu-frontend.vercel.app
NODE_ENV=development
PORT=4000
```

## 🚀 Iniciar Servidor

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 Endpoints

- **Health Check:** `GET /api/health`
- **Productos:** `GET /api/products`

## 🔍 Pruebas

```bash
# Probar conexión a MongoDB
npm run test:mongodb

# Probar servidor completo
npm run test:server
```

## 📚 Documentación

Ver `DEPLOYMENT.md` para instrucciones de despliegue en Render.
