                                    Documentación Sprint 1 – Proyecto SuperGains
1. Objetivo del Sprint

Configurar la arquitectura inicial del proyecto con frontend (React + Vite) y backend (Node + Express + MongoDB).

Desplegar las aplicaciones en Vercel (frontend) y Render (backend).

Validar la comunicación entre los servicios y la accesibilidad pública.



2. Funcionalidades Implementadas
Backend (Node + Express)

Configuración inicial con express, cors, morgan.

Conexión a MongoDB mediante mongoose.

Definición de rutas base /api/products y /api/health.

Configuración de CORS para frontend en Vercel y entorno local.

Frontend (React + Vite, Vercel)

Estructura inicial de la aplicación.

Configuración de variables de entorno con VITE_API_URL.

Integración con backend para consumir productos.

Despliegue

Backend desplegado en Render (supergains-backend.onrender.com).

Frontend desplegado en Vercel (supergains-frontend.vercel.app).

Conexión validada entre ambos entornos.




3. Problemas Encontrados y Soluciones


3.1 Error en el despliegue de Render (demora y fallos intermitentes)

Problema: El backend no respondía porque se definió manualmente PORT=10000.

Solución: Se eliminó la variable de entorno PORT en Render y se dejó la configuración dinámica process.env.PORT || 4000.

3.2 CORS Policy Error (Access-Control-Allow-Origin)

Problema: El frontend en Vercel no podía acceder al backend.

Solución: Configuración correcta de cors() en Express:

app.use(cors({
  origin: [
    "https://supergains-frontend.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true
}));

3.3 Error Cannot GET / en backend

Problema: Render mostraba Cannot GET / en la raíz.

Solución: Se agregó endpoint /api/health y se recomendó app.get("/") para mostrar un mensaje de bienvenida en la raíz.

3.4 Error en frontend ("Error al cargar productos")

Problema: La URL del backend estaba mal configurada (https://tu-backend-render.onrender.com).

Solución: Se actualizó variable de entorno en Vercel:
VITE_API_URL=https://supergains-backend.onrender.com.

3.5 Validación de accesibilidad pública

Se probaron endpoints desde otro dispositivo (móvil con datos).

Se validó respuesta JSON correcta en /api/health.



4. Conclusiones del Sprint

El proyecto quedó con infraestructura lista: frontend y backend desplegados y comunicándose correctamente.

Se resolvieron problemas claves: configuración de CORS, puerto en Render y uso de variables de entorno en Vercel.

Base estable para avanzar en Sprint 2: funcionalidades de login, carrito y wishlist.