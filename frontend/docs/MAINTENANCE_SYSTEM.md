# Sistema de Mantenimiento - SuperGains

## Descripción

El sistema de mantenimiento permite congelar temporalmente la página web para realizar actualizaciones o mejoras sin que los usuarios puedan acceder al sitio. Este sistema es completamente frontend y utiliza localStorage para persistir el estado.

## Componentes

### 1. MaintenancePage.jsx
Componente principal que se muestra cuando el modo mantenimiento está activo.

**Características:**
- Diseño profesional usando la paleta de colores del proyecto
- Responsive design para todos los dispositivos
- Información de contacto y soporte
- Botones para contactar soporte y reintentar acceso
- Sin emojis, diseño limpio y corporativo

### 2. useMaintenanceMode.js
Hook personalizado para manejar el estado del modo mantenimiento.

**Funciones disponibles:**
- `isMaintenanceMode`: Estado actual del modo mantenimiento
- `enableMaintenanceMode()`: Activar modo mantenimiento
- `disableMaintenanceMode()`: Desactivar modo mantenimiento
- `toggleMaintenanceMode()`: Alternar estado del modo mantenimiento

### 3. MaintenanceToggle.jsx
Componente de control para administradores que permite activar/desactivar el modo mantenimiento desde el panel de administración.

## Cómo usar

### Para Administradores

1. **Activar modo mantenimiento:**
   ```javascript
   // Desde la consola del navegador
   localStorage.setItem('maintenanceMode', 'true');
   window.location.reload();
   ```

2. **Desactivar modo mantenimiento:**
   ```javascript
   // Desde la consola del navegador
   localStorage.removeItem('maintenanceMode');
   window.location.reload();
   ```

3. **Usar el componente MaintenanceToggle:**
   - Importar en cualquier página de administración
   - Agregar al panel de control del admin
   - Permite activar/desactivar con un solo clic

### Para Desarrolladores

1. **Integrar en páginas de administración:**
   ```jsx
   import MaintenanceToggle from '../components/MaintenanceToggle';
   
   function AdminPanel() {
     return (
       <div>
         <MaintenanceToggle />
         {/* Resto del contenido del admin */}
       </div>
     );
   }
   ```

2. **Verificar estado programáticamente:**
   ```javascript
   import { useMaintenanceMode } from '../hooks/useMaintenanceMode';
   
   function MyComponent() {
     const { isMaintenanceMode } = useMaintenanceMode();
     
     if (isMaintenanceMode) {
       return <div>Modo mantenimiento activo</div>;
     }
     
     return <div>Contenido normal</div>;
   }
   ```

## Características Técnicas

- **Persistencia:** Utiliza localStorage para mantener el estado entre sesiones
- **Responsive:** Se adapta a todos los tamaños de pantalla
- **Accesibilidad:** Cumple con estándares de accesibilidad web
- **Performance:** Componente ligero sin dependencias externas
- **SEO Friendly:** No afecta el SEO cuando está desactivado

## Personalización

### Colores
El componente utiliza la paleta de colores definida en el sistema de diseño:
- Grises para texto y fondos
- Azul para elementos de información
- Verde para acciones positivas
- Rojo para acciones de alerta

### Contenido
Para personalizar el mensaje o información de contacto, editar el archivo `MaintenancePage.jsx`:
- Cambiar el texto del mensaje principal
- Actualizar información de contacto
- Modificar tiempos estimados
- Ajustar información de horarios

## Seguridad

- El modo mantenimiento solo afecta la interfaz de usuario
- Los administradores pueden desactivarlo desde cualquier navegador
- No requiere autenticación adicional para activar/desactivar
- El estado se almacena localmente en el navegador

## Casos de Uso

1. **Actualizaciones de sistema:** Activar durante despliegues importantes
2. **Mantenimiento programado:** Para mantenimientos preventivos
3. **Emergencias:** En caso de problemas críticos del sistema
4. **Desarrollo:** Para probar cambios sin afectar usuarios

## Notas Importantes

- El modo mantenimiento se aplica a todos los usuarios
- Los administradores pueden desactivarlo desde cualquier dispositivo
- El estado persiste hasta que se desactive manualmente
- No afecta el backend ni las APIs
- Es completamente reversible
