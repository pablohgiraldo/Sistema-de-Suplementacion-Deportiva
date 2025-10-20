# Guía de Despliegue - SuperGains (Backend + Frontend)

## 📋 Resumen del Proyecto

**SuperGains** es una aplicación e-commerce desarrollada con:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + Tailwind CSS
- **Despliegue**: Backend en Render, Frontend en Vercel

## 🚀 URLs de Producción

- **Backend API**: `https://supergains-backend.onrender.com`
- **Frontend**: `https://supergains-frontend.vercel.app` (pendiente de deploy)
- **Desarrollo Local**: `http://localhost:5174` (frontend) + `http://localhost:4000` (backend)

## 🔧 Variables de Entorno Requeridas

### Backend (Render Dashboard)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains?retryWrites=true&w=majority` | URI de conexión a MongoDB Atlas |
| `JWT_SECRET` | `supergains_jwt_secret_2024_very_secure_key_for_production_deployment_xyz789` | Clave secreta para JWT tokens |
| `CORS_ORIGIN` | `https://supergains-frontend.vercel.app` | Origen permitido para CORS |
| `NODE_ENV` | `production` | Entorno de ejecución |

### Frontend (Vercel Dashboard)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://supergains-backend.onrender.com` | URL del backend API |

## 🏗️ Arquitectura del Proyecto

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── controllers/     # Controladores de rutas
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Definición de rutas
│   ├── validators/     # Validación con express-validator
│   ├── config/         # Configuración de DB
│   └── server.js       # Servidor principal
├── scripts/            # Scripts de prueba
└── package.json
```

### Frontend (React + Vite)
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/          # Páginas de la aplicación
│   ├── contexts/       # Contextos de React (Auth, Cart)
│   ├── hooks/          # Hooks personalizados
│   ├── services/       # Servicios de API
│   └── utils/          # Utilidades
├── public/             # Archivos estáticos
└── package.json
```

## 🔌 Endpoints de la API

### Autenticación
- `POST /api/users/register` - Registro de usuario
- `POST /api/users/login` - Inicio de sesión
- `GET /api/users/profile` - Perfil del usuario
- `POST /api/users/refresh` - Renovar token

### Productos
- `GET /api/products` - Listar productos (con filtros y paginación)
- `GET /api/products/search` - Búsqueda de productos
- `GET /api/products/:id` - Obtener producto por ID

### Carrito
- `GET /api/cart` - Obtener carrito del usuario
- `POST /api/cart/add` - Agregar producto al carrito
- `PUT /api/cart/item/:productId` - Actualizar cantidad
- `DELETE /api/cart/item/:productId` - Eliminar producto

## 🚀 Comandos de Despliegue

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Ejecutar backend y frontend simultáneamente
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

### Backend (Render)
1. Conectar repositorio a Render
2. Configurar variables de entorno
3. Deploy automático en cada push

### Frontend (Vercel)
1. Conectar repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático en cada push

## 🐛 Problemas Conocidos

### CORS Issues
- **Problema**: Frontend no puede conectar con backend
- **Solución**: Verificar configuración CORS en `server.js`
- **Puertos permitidos**: `localhost:5173`, `localhost:5174`, `localhost:4173`

### Vercel Deploy Issues
- **Problema**: Errores de build en Vercel
- **Estado**: Pendiente de resolución
- **Workaround**: Usar desarrollo local por ahora

## 📱 Validación Móvil

### Estado Actual
- ❌ **No disponible** - Frontend no desplegado en Vercel
- ✅ **Desarrollo local** - Funciona en `http://localhost:5174`

### Próximos Pasos
1. Resolver problemas de deploy en Vercel
2. Configurar dominio móvil
3. Probar en dispositivos reales

## 🔍 Monitoreo y Logs

### Backend (Render)
- Logs disponibles en Render Dashboard
- Monitoreo de rendimiento incluido
- Alertas de error automáticas

### Frontend (Vercel)
- Logs de build y deploy
- Analytics de rendimiento
- Monitoreo de errores

## 📞 Soporte

Para problemas de despliegue:
1. Revisar logs en Render/Vercel
2. Verificar variables de entorno
3. Comprobar conectividad de red
4. Consultar documentación de la API

---

## 📝 Notas Importantes

- **Puerto**: Render asigna automáticamente el puerto via `process.env.PORT`
- **MongoDB**: Usar URI completa con nombre del cluster
- **CORS**: Configurar orígenes permitidos correctamente
- **JWT**: Usar clave secreta segura en producción

## 🔗 Enlaces Útiles

- [Render Dashboard](https://dashboard.render.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [MongoDB Atlas](https://cloud.mongodb.com)
- [Documentación de la API](./API_DOCS.md)

---

## ✅ Checklist de Despliegue

### Backend (Render)
- [ ] Variables de entorno configuradas
- [ ] MongoDB URI correcta y accesible
- [ ] CORS_ORIGIN apunta al frontend
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Branch correcta (main o develop)

### Frontend (Vercel)
- [ ] Variables de entorno configuradas
- [ ] VITE_API_URL apunta al backend
- [ ] Build exitoso sin errores
- [ ] Deploy automático funcionando

## 🧪 Validación de Despliegue

### Backend
```bash
# Verificar salud del API
curl https://supergains-backend.onrender.com/api/health

# Verificar productos
curl https://supergains-backend.onrender.com/api/products
```

### Frontend
```bash
# Verificar que carga correctamente
# Abrir en navegador: https://supergains-frontend.vercel.app
```

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0  
**Estado**: Backend desplegado, Frontend pendiente