# Configuración de Tawk.to Chat

## 📋 Requisitos

1. Cuenta gratuita en [Tawk.to](https://www.tawk.to/)
2. Property ID y Widget ID de tu widget de chat

## 🚀 Pasos de Configuración

### 1. Crear Cuenta en Tawk.to

1. Ve a [https://www.tawk.to/](https://www.tawk.to/)
2. Haz clic en "Sign Up Free"
3. Completa el registro con tu email

### 2. Crear un Widget de Chat

1. Después de iniciar sesión, se creará automáticamente un widget por defecto
2. Personaliza tu widget en **Administration > Chat Widget**:
   - Nombre del widget
   - Colores y tema
   - Mensaje de bienvenida
   - Posición en la pantalla

### 3. Obtener tus Credenciales

1. Ve a **Administration > Channels**
2. Selecciona tu widget
3. Haz clic en "Direct Chat Link"
4. Verás una URL como: `https://tawk.to/chat/PROPERTY_ID/WIDGET_ID`
5. Copia ambos IDs

### 4. Configurar en la Aplicación

#### Opción 1: Variables de Entorno (Recomendado)

Crea o edita el archivo `.env` en `frontend/`:

```env
VITE_TAWK_PROPERTY_ID=tu_property_id_aqui
VITE_TAWK_WIDGET_ID=tu_widget_id_aqui
```

#### Opción 2: Archivo de Configuración

Edita `frontend/src/config/tawk.config.js`:

```javascript
export const TAWK_CONFIG = {
    propertyId: 'TU_PROPERTY_ID_AQUI',
    widgetId: 'TU_WIDGET_ID_AQUI',
    // ...
};
```

### 5. Verificar Instalación

1. Ejecuta la aplicación: `npm run dev`
2. Abre tu navegador
3. Deberías ver el widget de chat en la esquina inferior derecha
4. Verifica en la consola del navegador: "✅ Tawk.to chat cargado exitosamente"

## 🎨 Personalización

### Modificar Posición del Widget

Edita `tawk.config.js`:

```javascript
options: {
    visibility: {
        desktop: {
            position: 'br', // 'br' (bottom-right), 'bl' (bottom-left), 'tr' (top-right), 'tl' (top-left)
            xOffset: 20,    // Distancia desde el borde horizontal (px)
            yOffset: 20     // Distancia desde el borde vertical (px)
        }
    }
}
```

### Ocultar en Páginas Específicas

En `TawkToChat.jsx`, puedes agregar lógica condicional:

```javascript
import { useLocation } from 'react-router-dom';

export default function TawkToChat() {
    const location = useLocation();
    
    // No mostrar en páginas de login/register
    if (['/login', '/register'].includes(location.pathname)) {
        return null;
    }
    
    // ... resto del código
}
```

## 🔧 Funcionalidades Avanzadas

### Identificar Usuarios

Puedes pasar información del usuario autenticado:

```javascript
window.Tawk_API.setAttributes({
    'name': user.name,
    'email': user.email,
    'hash': 'hash_generado_desde_backend' // Para seguridad
}, function(error){});
```

### Eventos Personalizados

```javascript
// Cuando el chat se maximiza
window.Tawk_API.onChatMaximized = function() {
    console.log('Chat abierto por el usuario');
};

// Cuando llega un mensaje
window.Tawk_API.onChatMessageVisitor = function(message) {
    console.log('Mensaje del visitante:', message);
};
```

## 📞 Gestionar Conversaciones

1. Ve a tu dashboard de Tawk.to
2. Selecciona **Inbox** para ver todas las conversaciones
3. Responde en tiempo real desde el dashboard
4. También puedes descargar la app móvil de Tawk.to para responder desde tu teléfono

## 🆓 Características Gratuitas

- ✅ Chat en vivo ilimitado
- ✅ Usuarios ilimitados
- ✅ Conversaciones ilimitadas
- ✅ Apps móviles (iOS y Android)
- ✅ Personalización del widget
- ✅ Integraciones con otras plataformas
- ✅ Historial de conversaciones

## 📚 Documentación Oficial

- [Tawk.to Documentation](https://help.tawk.to/)
- [JavaScript API Reference](https://developer.tawk.to/javascript-api/)
- [Widget Customization](https://help.tawk.to/article/widget-customization)

## ⚠️ Notas Importantes

- El widget se carga de forma asíncrona para no afectar el rendimiento
- Solo se carga una vez por sesión (se verifica con `window.Tawk_API`)
- Los IDs de ejemplo en el código NO funcionarán, debes usar tus propios IDs
- Asegúrate de **NO** subir tus credenciales reales al repositorio público

