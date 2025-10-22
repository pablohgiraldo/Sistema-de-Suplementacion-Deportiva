# SuperGains - Guía de Estilo Visual

## 🎨 Paleta de Colores

### Colores Primarios
- **Azul Principal:** `#3B82F6` (blue-500)
- **Azul Oscuro:** `#1E40AF` (blue-700)
- **Azul Claro:** `#DBEAFE` (blue-100)

### Colores Secundarios
- **Verde Éxito:** `#10B981` (emerald-500)
- **Rojo Error:** `#EF4444` (red-500)
- **Amarillo Advertencia:** `#F59E0B` (amber-500)
- **Gris Neutro:** `#6B7280` (gray-500)

### Colores de Fondo
- **Fondo Principal:** `#F9FAFB` (gray-50)
- **Fondo Secundario:** `#FFFFFF` (white)
- **Fondo Oscuro:** `#111827` (gray-900)

## 🔤 Tipografía

### Fuentes
- **Principal:** Inter, system-ui, sans-serif
- **Monospace:** 'Fira Code', monospace (para código)

### Tamaños de Texto
- **H1:** `text-4xl` (36px) - Títulos principales
- **H2:** `text-3xl` (30px) - Títulos de sección
- **H3:** `text-2xl` (24px) - Subtítulos
- **H4:** `text-xl` (20px) - Títulos de card
- **Body:** `text-base` (16px) - Texto normal
- **Small:** `text-sm` (14px) - Texto secundario
- **Caption:** `text-xs` (12px) - Texto pequeño

## 🎯 Componentes Visuales

### Botones

#### Botón Primario
```jsx
<button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Acción Principal
</button>
```

#### Botón Secundario
```jsx
<button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
  Acción Secundaria
</button>
```

#### Botón de Éxito
```jsx
<button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Confirmar
</button>
```

#### Botón de Error
```jsx
<button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
  Cancelar
</button>
```

### Cards

#### Card Básica
```jsx
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-xl font-semibold text-gray-900 mb-4">Título del Card</h3>
  <p className="text-gray-600">Contenido del card...</p>
</div>
```

#### Card de Producto
```jsx
<div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
  <img src={productImage} alt={productName} className="w-full h-48 object-cover" />
  <div className="p-4">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{productName}</h3>
    <p className="text-gray-600 text-sm mb-3">{productDescription}</p>
    <div className="flex justify-between items-center">
      <span className="text-xl font-bold text-blue-600">${price}</span>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        Agregar al Carrito
      </button>
    </div>
  </div>
</div>
```

### Formularios

#### Input Básico
```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Nombre del Campo
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    placeholder="Ingresa tu texto..."
  />
</div>
```

#### Input con Error
```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-red-700 mb-2">
    Campo con Error
  </label>
  <input
    type="text"
    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
    placeholder="Campo con error..."
  />
  <p className="mt-1 text-sm text-red-600">Mensaje de error</p>
</div>
```

### Alertas y Notificaciones

#### Alerta de Éxito
```jsx
<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
  <div className="flex">
    <svg className="w-5 h-5 text-emerald-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
    <div>
      <h3 className="text-sm font-medium text-emerald-800">¡Éxito!</h3>
      <p className="text-sm text-emerald-700">Operación completada correctamente.</p>
    </div>
  </div>
</div>
```

#### Alerta de Error
```jsx
<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
  <div className="flex">
    <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
    <div>
      <h3 className="text-sm font-medium text-red-800">Error</h3>
      <p className="text-sm text-red-700">Ha ocurrido un error. Por favor, inténtalo de nuevo.</p>
    </div>
  </div>
</div>
```

## 📱 Layout y Espaciado

### Grid System
- **Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Grid 2 Columnas:** `grid grid-cols-1 md:grid-cols-2 gap-6`
- **Grid 3 Columnas:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Grid 4 Columnas:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`

### Espaciado
- **Padding:** `p-4` (16px), `p-6` (24px), `p-8` (32px)
- **Margin:** `m-4` (16px), `m-6` (24px), `m-8` (32px)
- **Gap:** `gap-4` (16px), `gap-6` (24px), `gap-8` (32px)

## 🎨 Estados de Interacción

### Hover Effects
```jsx
// Botones
className="hover:bg-blue-700 transition-colors"

// Cards
className="hover:shadow-lg transition-shadow"

// Links
className="hover:text-blue-600 transition-colors"
```

### Focus States
```jsx
className="focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
```

### Loading States
```jsx
// Botón con loading
<button disabled className="opacity-50 cursor-not-allowed">
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  Cargando...
</button>
```

## 🏷️ Badges y Etiquetas

### Badge de Estado
```jsx
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
  Activo
</span>
```

### Badge de Categoría
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  Proteínas
</span>
```

### Badge de Precio
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
  $29.99
</span>
```

## 📊 Iconografía

### Iconos de Sistema
- **Éxito:** Check circle (verde)
- **Error:** X circle (rojo)
- **Advertencia:** Exclamation triangle (amarillo)
- **Info:** Information circle (azul)

### Iconos de Navegación
- **Home:** House
- **Carrito:** Shopping cart
- **Usuario:** User
- **Configuración:** Cog
- **Buscar:** Magnifying glass

### Iconos de Productos
- **Proteínas:** Dumbbell
- **Creatina:** Zap
- **Vitaminas:** Heart
- **Pre-entreno:** Lightning bolt

## 🎯 Principios de Diseño

### 1. Consistencia
- Usar siempre la misma paleta de colores
- Mantener espaciado uniforme
- Aplicar tipografía consistente

### 2. Jerarquía Visual
- Títulos más grandes para contenido importante
- Usar colores para destacar elementos clave
- Espaciado para separar secciones

### 3. Accesibilidad
- Contraste suficiente entre texto y fondo
- Tamaños de click target mínimos de 44px
- Estados de focus claramente visibles

### 4. Responsividad
- Diseño móvil primero
- Breakpoints estándar de Tailwind
- Componentes que se adaptan al contenido

## 🚀 Implementación

### Tailwind CSS
Este proyecto usa Tailwind CSS para implementar el sistema de diseño. Las clases están optimizadas para:
- Desarrollo rápido
- Consistencia visual
- Mantenimiento fácil
- Performance optimizada

### Componentes Reutilizables
Todos los componentes siguen esta guía de estilo y están disponibles en:
- `src/components/` - Componentes base
- `src/pages/` - Páginas específicas
- `src/styles/` - Estilos globales

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Mantenido por:** Equipo SuperGains
