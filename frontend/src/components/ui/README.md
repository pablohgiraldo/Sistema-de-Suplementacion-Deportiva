# Componentes UI - Guía de Uso

Este directorio contiene componentes reutilizables para mantener consistencia visual en toda la aplicación.

## Componentes Disponibles

### Button
Botón reutilizable con múltiples variantes y tamaños.

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'purple' | 'outline' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `disabled`: boolean
- `loading`: boolean (muestra spinner)
- `icon`: ReactNode (icono a mostrar)
- `onClick`: función
- `type`: 'button' | 'submit' | 'reset' (default: 'button')

**Ejemplo:**
```jsx
<Button 
    variant="primary" 
    loading={isLoading}
    icon={<RefreshIcon className="w-5 h-5" />}
    onClick={handleClick}
>
    Sincronizar
</Button>
```

### Card, CardHeader, CardTitle, CardContent
Componentes para crear tarjetas consistentes.

**Props:**
- `Card`: 
  - `padding`: boolean (default: true)
  - `shadow`: boolean (default: true)
  - `className`: string

**Ejemplo:**
```jsx
<Card className="mb-8">
    <CardHeader>
        <CardTitle>Título de la Tarjeta</CardTitle>
    </CardHeader>
    <CardContent>
        <p>Contenido aquí</p>
    </CardContent>
</Card>
```

### StatCard
Tarjeta especializada para mostrar métricas y estadísticas.

**Props:**
- `title`: string (título de la métrica)
- `value`: string | number (valor principal)
- `subtitle`: string (información adicional)
- `icon`: ReactNode (icono SVG)
- `iconColor`: string (clase de color Tailwind)
- `valueColor`: string (clase de color Tailwind)

**Ejemplo:**
```jsx
<StatCard
    title="Total Customers"
    value={1234}
    subtitle="100 activos"
    icon={<UsersIcon className="w-10 h-10" />}
    iconColor="text-blue-400"
    valueColor="text-blue-600"
/>
```

### Badge
Etiqueta para categorías, estados, etc.

**Props:**
- `variant`: 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'purple' | 'orange' | 'gray' (default: 'default')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

**Ejemplo:**
```jsx
<Badge variant="success">Activo</Badge>
<Badge variant="danger" size="sm">Alta Prioridad</Badge>
```

### Alert
Componente para notificaciones y alertas.

**Props:**
- `type`: 'info' | 'success' | 'error' | 'warning' (default: 'info')
- `message`: string
- `onClose`: función (opcional, muestra botón de cerrar)

**Ejemplo:**
```jsx
<Alert 
    type="success" 
    message="Operación completada exitosamente"
    onClose={() => handleClose()}
/>
```

## Iconos SVG

Todos los iconos están en `components/icons/CRMIcons.jsx`.

### Iconos Disponibles:
- `UsersIcon` - Usuarios/Clientes
- `DiamondIcon` - VIP/Premium
- `MoneyIcon` - Dinero/Revenue
- `AlertIcon` - Alertas/Advertencias
- `RefreshIcon` - Sincronizar/Actualizar (con prop `spinning`)
- `TargetIcon` - Objetivo/Segmentación
- `CloseIcon` - Cerrar
- `CalendarIcon` - Fecha/Calendario
- `SparklesIcon` - Nuevo/Destacado
- `SleepIcon` - Inactivo
- `UserIcon` - Usuario individual
- `RepeatIcon` - Repetir/Frecuente

### Función Helper:
```jsx
getSegmentIcon(segment, className = "w-8 h-8")
```
Retorna el icono apropiado para cada segmento de cliente.

**Ejemplo:**
```jsx
import { UsersIcon, RefreshIcon } from '../components/icons/CRMIcons';

<UsersIcon className="w-6 h-6 text-blue-500" />
<RefreshIcon className="w-5 h-5" spinning={true} />
```

## Paleta de Colores

### Variantes principales:
- **Primary**: Azul - Acciones principales
- **Secondary**: Gris - Acciones secundarias
- **Success**: Verde - Éxito, confirmaciones
- **Danger**: Rojo - Peligro, eliminaciones
- **Warning**: Amarillo - Advertencias
- **Purple**: Morado - Premium, destacados
- **Orange**: Naranja - Riesgo medio

### Uso de colores Tailwind:
```jsx
// Iconos
iconColor="text-blue-400"    // Color del icono
valueColor="text-green-600"  // Color del valor

// Fondos
className="bg-blue-50"       // Fondo claro
className="bg-blue-600"      // Fondo sólido
```

## Mejores Prácticas

1. **Siempre usar componentes UI** en lugar de crear nuevos estilos inline
2. **Iconos SVG en lugar de emojis** para consistencia cross-platform
3. **Usar variantes predefinidas** para mantener coherencia visual
4. **Clases Tailwind consistentes**:
   - Espaciado: `gap-4`, `mb-8`, `p-6`
   - Bordes: `rounded-lg`, `border`
   - Sombras: `shadow-md`, `hover:shadow-lg`

5. **Accesibilidad**:
   - Usar `aria-label` cuando sea necesario
   - Botones con estados `disabled`
   - Colores con suficiente contraste

## Ejemplos Completos

### Dashboard Card con Estadísticas
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <StatCard
        title="Total Customers"
        value={overview.totalCustomers}
        subtitle={`${overview.activeCustomers} activos`}
        icon={<UsersIcon className="w-10 h-10" />}
        iconColor="text-blue-400"
    />
</div>
```

### Botones de Acción
```jsx
<div className="flex gap-3">
    <Button
        onClick={handleSave}
        variant="primary"
        loading={isSaving}
        icon={<CheckIcon className="w-5 h-5" />}
    >
        Guardar
    </Button>
    <Button
        onClick={handleCancel}
        variant="outline"
    >
        Cancelar
    </Button>
</div>
```

### Tabla con Badges
```jsx
<Badge variant={
    status === 'active' ? 'success' :
    status === 'inactive' ? 'gray' :
    'warning'
}>
    {status}
</Badge>
```

