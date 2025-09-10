#     Guía de Despliegue - Backend SuperGains

##    Variables de Entorno Requeridas

En **Render Dashboard**, configura estas variables de entorno:

KEY: MONGODB_URI
VALUE: mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains?retryWrites=true&w=majority

KEY: JWT_SECRET
VALUE: supergains_jwt_secret_2024_very_secure_key_for_production_deployment_xyz789

KEY: CORS_ORIGIN
VALUE: https://supergains-frontend.vercel.app

KEY: NODE_ENV
VALUE: production

r
Copiar
Editar

**Nota:**  
No definas manualmente `PORT` en Render. Render asigna un puerto dinámico a través de `process.env.PORT`.  
En tu código ya usas:  
```js
const PORT = process.env.PORT || 4000;
   Cómo Obtener la URI de MongoDB
Ve a cloud.mongodb.com

Inicia sesión en tu cuenta

Selecciona tu cluster

Haz clic en Connect

Selecciona Connect your application

Copia la URI completa (formato mongodb+srv://...).

   Pruebas Locales
Antes de desplegar, prueba localmente:

bash
Copiar
Editar
# Instalar dependencias
npm install

# Crear archivo .env con tus variables
cp .env.example .env
# Edita .env con tus valores reales

# Probar conexión a MongoDB
npm run test:mongodb

# Probar servidor local
npm run dev
Validar en navegador:
http://localhost:4000/api/health

   Problemas Comunes
Error: ENOTFOUND _mongodb._tcp.supergains.mongodb.net
Solución: La URI debe incluir el nombre completo del cluster.

Ejemplo correcto:

bash
Copiar
Editar
mongodb+srv://usuario:password@cluster0.abc123.mongodb.net/supergains
Error: Authentication failed
Solución: Verifica usuario y contraseña en MongoDB Atlas.

Asegúrate de que el usuario tenga permisos de lectura/escritura en Database Access.

Error: Network Access denied
Solución: En MongoDB Atlas → Network Access → Add IP Address → 0.0.0.0/0 (habilita acceso global).

Error: Cannot GET /
Explicación: El backend no sirve contenido en la raíz (/).

Solución: Validar siempre en /api/health o /api/products.

Error: CORS blocked by policy
Solución: Configurar CORS_ORIGIN correctamente en Render:

ini
Copiar
Editar
CORS_ORIGIN=https://supergains-frontend.vercel.app
En desarrollo local usar también:

arduino
Copiar
Editar
http://localhost:5173
   Checklist de Despliegue
 Variables de entorno configuradas en Render.

 MongoDB URI es correcta y accesible.

 CORS_ORIGIN apunta al frontend en Vercel.

 PORT no definido manualmente.

 Build Command: npm install.

 Start Command: npm start.

 Branch correcta (main o develop).

 Root Directory: backend si tu proyecto está en monorepo.

   Validación de Despliegue
Verificar desde navegador
Abrir: https://supergains-backend.onrender.com/api/health

Debe devolver:

json
Copiar
Editar
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-01-XX..."
}
Verificar productos
bash
Copiar
Editar
curl -k https://supergains-backend.onrender.com/api/products
   Validación de Conexión con Frontend
En tu frontend desplegado en Vercel:

Abre https://supergains-frontend.vercel.app desde un navegador o dispositivo móvil.

En DevTools (F12) → Console → validar que los productos cargan desde la API.

Si aparece error de CORS, revisar variable CORS_ORIGIN en Render.

Si aparece error de URL, revisar variable VITE_API_URL en Vercel:

ini
Copiar
Editar
VITE_API_URL=https://supergains-backend.onrender.com
📡 Logs en Render
En Render Dashboard:

Ir a tu servicio web.

Clic en Logs.

Mensajes esperados:

   Base de datos conectada

   API escuchando en puerto XXXXX

   Pruebas Alternativas
Usando PowerShell
powershell
Copiar
Editar
Invoke-RestMethod -Uri "https://supergains-backend.onrender.com/api/health"
Usando Postman
Método: GET

URL: https://supergains-backend.onrender.com/api/health

Enviar → Debe devolver JSON de estado.

