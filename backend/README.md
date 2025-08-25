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
npm start

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
