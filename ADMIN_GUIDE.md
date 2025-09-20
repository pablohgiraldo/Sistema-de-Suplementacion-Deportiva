# Guía del Dashboard de Administración - SuperGains

## Descripción General

El Dashboard de Administración de SuperGains es una interfaz web completa que permite a los administradores gestionar el inventario, monitorear estadísticas en tiempo real y administrar alertas de stock. Está diseñado para proporcionar una experiencia de usuario intuitiva y eficiente.

## Acceso al Dashboard

### Requisitos de Acceso
- Usuario autenticado con rol `admin`
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet estable

### URL de Acceso
```
http://localhost:5174/admin
```

### Autenticación
El dashboard está protegido por el componente `AdminRoute` que verifica:
1. Que el usuario esté autenticado
2. Que el usuario tenga rol de administrador
3. Que el token JWT sea válido

## Componentes Principales

### 1. Header de Administración
- **Logo SPG SUPERGAINS**: Enlace a la página principal
- **Barra de búsqueda**: Búsqueda de productos
- **Menú de usuario**: Navegación con iconos SVG
  - 👤 Perfil del usuario
  - 📊 Dashboard (actual)
  - 🏪 Tienda
  - 🚪 Cerrar sesión

### 2. Estadísticas Generales
Muestra métricas clave del negocio en tiempo real:

#### Total de Usuarios
- **Icono**: 👥 (usuarios)
- **Descripción**: Número total de usuarios registrados
- **Actualización**: Tiempo real

#### Total de Productos
- **Icono**: 📦 (productos)
- **Descripción**: Número total de productos en el catálogo
- **Actualización**: Tiempo real

#### Total de Órdenes
- **Icono**: 📋 (órdenes)
- **Descripción**: Número total de órdenes (pendiente de implementación)
- **Estado**: En desarrollo

#### Productos con Stock Bajo
- **Icono**: ⚠️ (alerta)
- **Descripción**: Productos con stock menor a 10 unidades
- **Actualización**: Tiempo real

### 3. Estadísticas de Inventario
Panel detallado con métricas de inventario:

#### Total de Productos
- **Descripción**: Productos únicos en inventario
- **Color**: Azul

#### Stock Total
- **Descripción**: Suma total de todas las unidades en stock
- **Color**: Verde

#### Stock Disponible
- **Descripción**: Stock disponible para venta (excluye reservado)
- **Color**: Amarillo

#### Alertas
- **Agotados**: Productos sin stock
- **Bajo Stock**: Productos con stock crítico
- **Color**: Rojo/Amarillo

### 4. Alertas de Stock
Sistema de alertas visuales categorizadas:

#### Alertas Críticas
- **Criterio**: Stock ≤ 50% del stock mínimo
- **Color**: Rojo
- **Acción**: Requiere atención inmediata

#### Stock Bajo
- **Criterio**: Stock ≤ stock mínimo
- **Color**: Amarillo
- **Acción**: Considerar reabastecimiento

#### Sin Stock
- **Criterio**: Stock = 0
- **Color**: Rojo intenso
- **Acción**: Reabastecimiento urgente

### 5. Tabla de Inventario Dinámica
Tabla interactiva con funcionalidades avanzadas:

#### Características
- **Actualización en tiempo real**: Polling cada 45 segundos
- **Filtros avanzados**: Por estado, rango de stock, búsqueda
- **Ordenamiento**: Por cualquier columna
- **Paginación**: 10 elementos por página
- **Acciones en lote**: Selección múltiple

#### Columnas
1. **Producto**: Nombre y descripción
2. **Stock Actual**: Cantidad disponible
3. **Stock Mínimo**: Límite de alerta
4. **Stock Máximo**: Capacidad máxima
5. **Estado**: Visual con iconos y colores
6. **Acciones**: Botones de acción rápida

#### Indicadores Visuales
- **🟢 Verde**: Stock saludable
- **🟡 Amarillo**: Stock bajo
- **🔴 Rojo**: Stock crítico o agotado
- **⚪ Gris**: Producto inactivo

#### Acciones Disponibles
- **Reabastecer**: Aumentar stock
- **Reservar**: Reservar unidades
- **Liberar**: Liberar reservas
- **Vender**: Registrar venta
- **Editar**: Modificar producto

### 6. Notificaciones Toast
Sistema de notificaciones en tiempo real:

#### Tipos de Notificación
- **Éxito**: Acciones completadas
- **Advertencia**: Alertas de stock
- **Error**: Errores del sistema
- **Info**: Información general

#### Características
- **Auto-dismiss**: Desaparecen automáticamente
- **Posicionamiento**: Esquina superior derecha
- **Animaciones**: Slide-in/slide-out
- **Interactividad**: Botón de cerrar

## Funcionalidades Técnicas

### Polling Inteligente
- **Intervalo base**: 45 segundos
- **Backoff exponencial**: En caso de errores
- **Pausa en error**: Evita spam de requests
- **Pausa en focus**: Optimiza recursos

### Rate Limiting
- **Límite de lectura**: 60 requests/minuto
- **Límite de escritura**: 200 requests/minuto (producción)
- **Manejo de errores**: Mensajes informativos
- **Recuperación automática**: Reintento inteligente

### Responsive Design
- **Desktop**: Layout completo con sidebar
- **Tablet**: Layout adaptativo
- **Móvil**: Menú colapsable
- **Breakpoints**: Tailwind CSS

## Navegación

### Rutas Principales
- **`/admin`**: Dashboard principal
- **`/`**: Tienda (desde logo)
- **`/profile`**: Perfil de usuario
- **`/login`**: Iniciar sesión
- **`/register`**: Registrarse

### Breadcrumbs
- **Dashboard** > **Inventario**
- **Dashboard** > **Estadísticas**
- **Dashboard** > **Alertas**

## Seguridad

### Autenticación
- **JWT Tokens**: Autenticación segura
- **Refresh Tokens**: Renovación automática
- **Expiración**: 24 horas (configurable)

### Autorización
- **Middleware de roles**: Verificación de permisos
- **Rutas protegidas**: Acceso restringido
- **Auditoría**: Log de acciones administrativas

### Validación
- **Frontend**: Validación de formularios
- **Backend**: Validación de datos
- **Sanitización**: Limpieza de inputs

## Monitoreo y Logs

### Métricas de Rendimiento
- **Tiempo de respuesta**: < 200ms
- **Disponibilidad**: 99.9%
- **Uptime**: Monitoreo continuo

### Logs de Auditoría
- **Acciones de stock**: Cambios en inventario
- **Accesos**: Intentos de acceso
- **Errores**: Logs de errores del sistema

## Solución de Problemas

### Problemas Comunes

#### Error 429 (Too Many Requests)
- **Causa**: Límite de rate limiting excedido
- **Solución**: Esperar 1 minuto o recargar página
- **Prevención**: Usar polling inteligente

#### Error de Conexión
- **Causa**: Servidor backend no disponible
- **Solución**: Verificar que el backend esté ejecutándose
- **Comando**: `npm run dev` en la raíz del proyecto

#### Datos No Actualizados
- **Causa**: Polling pausado por errores
- **Solución**: Recargar página o verificar conexión
- **Indicador**: Icono de estado en la interfaz

### Debugging
- **Console del navegador**: F12 > Console
- **Network tab**: Verificar requests
- **Redux DevTools**: Estado de la aplicación

## Configuración

### Variables de Entorno
```env
# Backend
MONGODB_URI=mongodb+srv://...
JWT_SECRET=supergains_jwt_secret_key_2024_very_secure
JWT_EXPIRES_IN=24h
PORT=4000

# Frontend
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=SuperGains
```

### Personalización
- **Intervalos de polling**: Modificar en `usePolling.js`
- **Límites de rate limiting**: Ajustar en `inventoryRoutes.js`
- **Umbrales de alerta**: Configurar en `Inventory.js`

## Mejores Prácticas

### Uso del Dashboard
1. **Monitoreo regular**: Revisar alertas diariamente
2. **Gestión proactiva**: Reabastecer antes de agotar
3. **Análisis de tendencias**: Usar estadísticas para decisiones
4. **Mantenimiento**: Limpiar datos obsoletos

### Rendimiento
1. **Cerrar pestañas**: Liberar recursos
2. **Evitar múltiples instancias**: Una sesión por usuario
3. **Usar filtros**: Reducir carga de datos
4. **Actualizar navegador**: Mantener versión actual

### Seguridad
1. **Cerrar sesión**: Al terminar el trabajo
2. **No compartir credenciales**: Acceso personal
3. **Reportar anomalías**: Comunicar problemas
4. **Actualizar contraseñas**: Regularmente

## Soporte Técnico

### Contacto
- **Email**: admin@supergains.com
- **Teléfono**: +57 (1) 234-5678
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM

### Documentación Adicional
- **API Docs**: `/backend/API_DOCS.md`
- **Deployment**: `/backend/DEPLOYMENT.md`
- **PRD**: `/docs/PRD-SuperGains-Website.md`

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Mantenido por**: Equipo de Desarrollo SuperGains
