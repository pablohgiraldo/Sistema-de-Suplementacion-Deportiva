# Sistema de Diseño SuperGains

## 🎨 Paleta de Colores

### Colores Primarios
- **Negro**: `#000000` - Elegancia y profesionalismo
- **Blanco**: `#FFFFFF` - Limpieza y claridad

### Colores de Acento
- **Azul**: `#3B82F6` - Confianza y tecnología
- **Verde**: `#10B981` - Salud y naturaleza
- **Rosa**: `#EC4899` - Energía y juventud
- **Amarillo**: `#F59E0B` - Optimismo y vitalidad

### Colores de Estado
- **Éxito**: `#10B981` (Verde)
- **Advertencia**: `#F59E0B` (Amarillo)
- **Error**: `#EF4444` (Rojo)
- **Información**: `#3B82F6` (Azul)

### Colores Neutros
- **Gray-50**: `#F9FAFB`
- **Gray-100**: `#F3F4F6`
- **Gray-200**: `#E5E7EB`
- **Gray-300**: `#D1D5DB`
- **Gray-400**: `#9CA3AF`
- **Gray-500**: `#6B7280`
- **Gray-600**: `#4B5563`
- **Gray-700**: `#374151`
- **Gray-800**: `#1F2937`
- **Gray-900**: `#111827`

## 📝 Tipografía

### Familias de Fuentes
- **Sans**: `system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif`
- **Mono**: `ui-monospace, SFMono-Regular, Monaco, Consolas, Liberation Mono, Courier New, monospace`

### Tamaños de Fuente
- **xs**: 12px (0.75rem)
- **sm**: 14px (0.875rem)
- **base**: 16px (1rem)
- **lg**: 18px (1.125rem)
- **xl**: 20px (1.25rem)
- **2xl**: 24px (1.5rem)
- **3xl**: 30px (1.875rem)
- **4xl**: 36px (2.25rem)
- **5xl**: 48px (3rem)
- **6xl**: 60px (3.75rem)

### Pesos de Fuente
- **thin**: 100
- **extralight**: 200
- **light**: 300
- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700
- **extrabold**: 800
- **black**: 900

## 🧩 Componentes de Formulario

### FormInput
```jsx
<FormInput
    label="Nombre"
    placeholder="Ingresa tu nombre"
    value={value}
    onChange={handleChange}
    required
/>
```

### PasswordInput
```jsx
<PasswordInput
    label="Contraseña"
    placeholder="Ingresa tu contraseña"
    value={value}
    onChange={handleChange}
    required
/>
```

**Características del PasswordInput:**
- Ícono de ojo para mostrar/ocultar contraseña
- Cambio automático entre `type="password"` y `type="text"`
- Estados hover en el ícono
- Accesibilidad mejorada con `tabIndex={-1}` en el botón
- Compatible con todos los props de FormInput

### FormToast
```jsx
<FormToast
    type="success"
    title="Éxito"
    message="Operación completada exitosamente"
    duration={5000}
    onClose={handleClose}
/>
```

**Características del FormToast:**
- Tipos: `success`, `error`, `warning`, `info`
- Animaciones de entrada y salida suaves
- Auto-cierre configurable
- Íconos específicos por tipo
- Botón de cierre manual
- Accesibilidad con `role="alert"` y `aria-live`

### FormNotification
```jsx
<FormNotification
    notifications={notifications}
    onRemove={handleRemove}
    position="top-right"
    maxNotifications={5}
/>
```

**Características del FormNotification:**
- Sistema de notificaciones múltiples
- Posiciones: `top-right`, `top-left`, `bottom-right`, `bottom-left`, `top-center`, `bottom-center`
- Límite configurable de notificaciones
- Gestión automática de colapso
- Integración con FormToast

### FormProgress
```jsx
<FormProgress
    steps={[
        { label: 'Paso 1', description: 'Validación' },
        { label: 'Paso 2', description: 'Envío' },
        { label: 'Paso 3', description: 'Completado' }
    ]}
    currentStep={1}
    showLabels={true}
    showNumbers={true}
/>
```

**Características del FormProgress:**
- Indicador visual de progreso en formularios
- Estados: `completed`, `current`, `upcoming`
- Etiquetas y descripciones opcionales
- Números o íconos de verificación
- Conectores animados entre pasos
- Accesibilidad con `aria-label`

### FormStatus
```jsx
<FormStatus
    status="loading"
    message="Procesando formulario..."
    showIcon={true}
    size="md"
/>
```

**Características del FormStatus:**
- Estados: `idle`, `loading`, `success`, `error`, `warning`
- Tamaños: `sm`, `md`, `lg`
- Íconos animados (spinner para loading)
- Mensajes personalizables
- Colores consistentes con el sistema

### useFormNotifications Hook
```jsx
const { 
    notifications, 
    showSuccess, 
    showError, 
    showWarning, 
    showInfo,
    removeNotification,
    clearAllNotifications 
} = useFormNotifications();
```

**Características del Hook:**
- Gestión centralizada de notificaciones
- Métodos helper para cada tipo
- Auto-remoción con duración configurable
- IDs únicos para cada notificación
- Limpieza automática de memoria

## 🎨 **Consistencia de Colores**

### **Paleta de Colores para Feedback Visual**

Todos los componentes de feedback visual utilizan una paleta de colores consistente basada en el sistema de diseño:

#### **Notificaciones (FormToast)**
- **Success**: Verde (`#10B981`) con fondos suaves (`#F0FDF4`)
- **Error**: Rojo (`#EF4444`) con fondos suaves (`#FEF2F2`)
- **Warning**: Amarillo (`#F59E0B`) con fondos suaves (`#FFFBEB`)
- **Info**: Azul (`#3B82F6`) con fondos suaves (`#EFF6FF`)

#### **Progreso (FormProgress)**
- **Completed**: Verde (`#10B981`) con texto blanco
- **Current**: Azul (`#3B82F6`) con anillo de enfoque (`#93C5FD`)
- **Upcoming**: Gris (`#E5E7EB`) con texto gris (`#6B7280`)

#### **Estados (FormStatus)**
- **Loading**: Azul con spinner animado
- **Success**: Verde con ícono de verificación
- **Error**: Rojo con ícono de error
- **Warning**: Amarillo con ícono de advertencia

### **Implementación Técnica**

Los colores se definen en:
- `src/config/colors.js` - Definición central de colores
- `src/config/tailwind.js` - Integración con Tailwind CSS
- `src/styles/form-colors.css` - Utilidades CSS personalizadas

### **Clases CSS Personalizadas**

```css
/* Ejemplo de uso */
.bg-form-notification-success-background { background-color: #F0FDF4; }
.text-form-notification-success-text { color: #166534; }
.border-form-notification-success-border { border-color: #BBF7D0; }
```

### **Beneficios de la Consistencia**

1. **Experiencia Unificada**: Todos los formularios usan los mismos colores
2. **Accesibilidad**: Contraste adecuado en todos los estados
3. **Mantenibilidad**: Cambios centralizados en un solo lugar
4. **Escalabilidad**: Fácil agregar nuevos tipos de feedback
5. **Branding**: Colores alineados con la identidad visual del PRD

### FormSelect
```jsx
<FormSelect
    label="Departamento"
    options={[
        { value: 'antioquia', label: 'Antioquia' },
        { value: 'bogota', label: 'Bogotá' }
    ]}
    value={value}
    onChange={handleChange}
/>
```

### FormButton
```jsx
<FormButton
    variant="primary" // primary, secondary, danger, success, outline
    size="md" // sm, md, lg
    loading={isLoading}
    disabled={isDisabled}
>
    Enviar
</FormButton>
```

### FormCheckbox
```jsx
<FormCheckbox
    label="Acepto los términos y condiciones"
    checked={checked}
    onChange={handleChange}
/>
```

### FormRadio
```jsx
<FormRadio
    label="Opción 1"
    value="option1"
    checked={value === 'option1'}
    onChange={handleChange}
/>
```

### FormGroup
```jsx
<FormGroup spacing="default"> // tight, default, loose
    <FormInput label="Campo 1" />
    <FormInput label="Campo 2" />
</FormGroup>
```

### FormGrid
```jsx
<FormGrid columns={2} gap="default">
    <FormInput label="Campo 1" />
    <FormInput label="Campo 2" />
</FormGrid>
```

### FormError
```jsx
<FormError error="Este campo es requerido" />
```

### FormSuccess
```jsx
<FormSuccess message="Formulario enviado exitosamente" />
```

## 🎯 Clases de Utilidad

### Clases de Input
- `.form-input` - Estilo base para inputs
- `.form-input-error` - Estado de error

### Clases de Botón
- `.form-button` - Estilo base para botones
- `.form-button-primary` - Botón primario
- `.form-button-secondary` - Botón secundario
- `.form-button-danger` - Botón de peligro
- `.form-button-success` - Botón de éxito
- `.form-button-outline` - Botón con borde

### Clases de Tipografía
- `.text-sm font-medium text-gray-700` - Labels
- `.text-sm text-red-600` - Mensajes de error
- `.text-sm text-green-600` - Mensajes de éxito
- `.text-xs text-gray-500` - Texto de ayuda

## 🔧 Uso del Sistema de Diseño

### Importación
```jsx
import { 
    colors, 
    typography, 
    designTokens, 
    classUtils 
} from '../config/designSystem.js';
```

### Uso de Colores
```jsx
// Usando colores directamente
const primaryColor = colors.primary.black;
const accentColor = colors.accent.blue;

// Usando clases de Tailwind
<div className="bg-gray-900 text-white">
```

### Uso de Tipografía
```jsx
// Usando clases predefinidas
<h1 className={designTokens.typography.heading.h1}>
    Título Principal
</h1>

<p className={designTokens.typography.body.base}>
    Texto del cuerpo
</p>
```

### Uso de Utilidades
```jsx
// Generar clases dinámicamente
const inputClasses = classUtils.input(hasError, isDisabled);
const buttonClasses = classUtils.button('primary', 'md', isDisabled);
const validationClasses = classUtils.validation('error');
```

## 📱 Responsive Design

### Breakpoints
- **xs**: 475px
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Grid Responsivo
```jsx
// 1 columna en móvil, 2 en tablet, 3 en desktop
<FormGrid columns={3} gap="default">
    <FormInput label="Campo 1" />
    <FormInput label="Campo 2" />
    <FormInput label="Campo 3" />
</FormGrid>
```

## ♿ Accesibilidad

### Características Implementadas
- Labels asociados correctamente con inputs
- Estados de focus visibles
- Contraste de colores adecuado
- Navegación por teclado
- Atributos ARIA apropiados
- Mensajes de error descriptivos

### Mejores Prácticas
- Usar `required` para campos obligatorios
- Proporcionar mensajes de error claros
- Usar `aria-describedby` para texto de ayuda
- Mantener contraste mínimo de 4.5:1
- Proporcionar estados de loading y disabled

## 🚀 Extensibilidad

### Agregar Nuevos Colores
```jsx
// En colors.js
export const colors = {
    // ... colores existentes
    custom: {
        purple: '#8B5CF6',
        orange: '#F97316',
    }
};
```

### Agregar Nuevas Variantes de Botón
```jsx
// En FormButton.jsx
const getVariantClasses = () => {
    switch (variant) {
        case 'custom':
            return 'form-button form-button-custom';
        // ... otras variantes
    }
};
```

### Agregar Nuevos Tamaños
```jsx
// En typography.js
fontSize: {
    // ... tamaños existentes
    '7xl': ['4.5rem', { lineHeight: '1' }],
}
```

## 📚 Recursos Adicionales

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Guidelines](https://material.io/design)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
