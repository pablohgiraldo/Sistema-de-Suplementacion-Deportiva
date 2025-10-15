# 🛒 Documentación de la Página de Carrito

## Descripción General

Página rediseñada del carrito de compras con interfaz moderna, intuitiva y completamente responsive. Implementada como parte de HU37 del Sprint 4.

---

## Estructura de Componentes

### Componente Principal: `Cart.jsx`

**Ubicación:** `frontend/src/pages/Cart.jsx`

**Dependencias:**
- `useAuth` - Contexto de autenticación
- `useCart` - Contexto del carrito (estado global)
- `useNavigate` - React Router para navegación
- `useState` - Manejo de estado local

---

## Características Implementadas

### 1. Diseño Visual

**Paleta de colores:**
- Fondo: Gradiente azul-índigo suave (`from-blue-50 via-white to-indigo-50`)
- Tarjetas: Blanco con sombras y bordes sutiles
- Acciones principales: Gradiente azul-índigo
- Acciones destructivas: Rojo
- Texto: Escala de grises coherente

**Estructura:**
- Layout en 2 columnas (responsive)
  - Columna izquierda (2/3): Lista de productos
  - Columna derecha (1/3): Resumen sticky
- Tarjetas con bordes redondeados (`rounded-2xl`)
- Sombras elevadas con transiciones en hover

### 2. Lista de Productos

Cada producto se muestra en una tarjeta individual con:

**Información mostrada:**
- ✅ Imagen del producto (con fallback a Unsplash)
- ✅ Nombre del producto
- ✅ Marca
- ✅ Precio unitario
- ✅ Control de cantidad (+/-)
- ✅ Subtotal (precio × cantidad)
- ✅ Botón eliminar (icono papelera)

**Microinteracciones:**
- Zoom en imagen al hacer hover
- Animación fade-out al eliminar (300ms)
- Botones +/- con escala en hover
- Estado active en botones
- Transiciones suaves en todos los elementos

### 3. Control de Cantidad

**Diseño:**
```
[ - ] [ Número ] [ + ]
```

**Comportamiento:**
- `-` reduce la cantidad en 1
- `+` aumenta la cantidad en 1
- Si la cantidad llega a 0, elimina el producto
- Botones disabled durante operaciones
- Animación scale en hover

**Código:**
```jsx
<button onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}>
    −
</button>
<span>{item.quantity}</span>
<button onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}>
    +
</button>
```

### 4. Eliminación de Productos

**Botón eliminar:**
- Icono de papelera (trash)
- Hover: cambia de gris a rojo
- Animación: fade-out 300ms antes de eliminar
- Fondo rojo suave en hover

**Lógica:**
```javascript
const handleRemoveItem = async (productId) => {
    setRemovingItem(productId);  // Inicia animación
    setTimeout(async () => {
        await removeFromCart(productId);
        setRemovingItem(null);
    }, 300);
};
```

### 5. Resumen de Compra (Sidebar)

**Posición:** Sticky (se mantiene visible al hacer scroll)

**Información mostrada:**
1. **Subtotal:** Suma de todos los productos
2. **Envío:** $5,000 COP (fijo por ahora)
3. **IVA (19%):** Calculado sobre el subtotal
4. **Total:** Suma de subtotal + envío + IVA

**Cálculos:**
```javascript
const subtotal = getCartTotal();
const shippingCost = cartItems.length > 0 ? 5000 : 0;
const taxRate = 0.19; // IVA 19% Colombia
const taxes = subtotal * taxRate;
const total = subtotal + shippingCost + taxes;
```

**Características adicionales:**
- ✅ Iconos informativos con tooltips
- ✅ Total destacado con gradiente de texto
- ✅ Botón de checkout con gradiente
- ✅ Link "Seguir comprando"
- ✅ Información de beneficios (pago seguro, envío, devoluciones)

### 6. Botón "Proceder al Pago"

**Diseño:**
- Tamaño grande (py-4)
- Gradiente azul-índigo
- Icono de tarjeta de crédito
- Sombra elevada con animación

**Navegación:**
```javascript
onClick={() => navigate('/checkout')}
```

### 7. Responsividad

**Breakpoints:**

**Móvil (< 640px):**
- 1 columna para todo
- Productos apilados verticalmente
- Resumen abajo de los productos
- Imagen de producto full-width

**Tablet (640px - 1024px):**
- Layout sigue siendo de 1 columna
- Mayor padding y espaciado
- Imágenes con tamaño fijo

**Desktop (> 1024px):**
- Grid 3 columnas (2 productos + 1 resumen)
- Resumen sticky en sidebar
- Hover effects más pronunciados

**Clases utilizadas:**
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div className="lg:col-span-2">...</div>
    <div className="lg:col-span-1">...</div>
</div>
```

### 8. Estados de la Página

#### Estado: Carrito Vacío

**Diseño:**
- Card centrada con icono de carrito
- Mensaje amigable
- CTA destacado "Explorar productos"
- Gradiente en botón

**Elementos:**
- Icono de carrito grande
- Título "Tu carrito está vacío"
- Mensaje motivacional
- Botón con gradiente y icono

#### Estado: Cargando

**Diseño:**
- Spinner circular animado
- Texto "Cargando tu carrito..."
- Fondo con gradiente suave

#### Estado: Error

**Diseño:**
- Banner rojo con borde izquierdo
- Icono de alerta
- Mensaje de error claro

### 9. Validaciones UX

**Confirmación al vaciar carrito:**
```jsx
{!showClearConfirm ? (
    <button onClick={() => setShowClearConfirm(true)}>
        Vaciar carrito
    </button>
) : (
    <div className="bg-red-50">
        <p>¿Estás seguro de vaciar el carrito?</p>
        <button onClick={() => setShowClearConfirm(false)}>Cancelar</button>
        <button onClick={handleClearCart}>Sí, vaciar</button>
    </div>
)}
```

**Protección de navegación:**
- Requiere autenticación
- Redirige a login si no está autenticado
- Muestra mensaje amigable

### 10. Microinteracciones y Animaciones

**Animaciones implementadas:**

1. **Eliminar producto:**
   - Fade out (opacity 0)
   - Scale down (scale-95)
   - Slide left (-translate-x-4)
   - Duración: 300ms

2. **Hover en tarjetas:**
   - Shadow elevation (shadow-md → shadow-xl)
   - Transición suave de 300ms

3. **Hover en imagen:**
   - Scale 110% con overflow hidden
   - Efecto zoom suave

4. **Botones de cantidad:**
   - Scale 110% en hover
   - Active state con bg más oscuro
   - Transiciones en todos los estados

5. **Botón checkout:**
   - Shadow elevation en hover
   - Gradiente con transición
   - Efecto pulse (opcional)

**CSS Transitions:**
```css
transition-all duration-300
hover:shadow-xl
hover:scale-110
active:bg-gray-300
```

---

## Integración con Contextos

### CartContext

**Funciones utilizadas:**
- `cartItems` - Array de productos en el carrito
- `loading` - Estado de carga
- `error` - Mensajes de error
- `updateQuantity(productId, quantity)` - Actualizar cantidad
- `removeFromCart(productId)` - Eliminar producto
- `clearCart()` - Vaciar carrito completo
- `getCartTotal()` - Obtener subtotal
- `getCartItemCount()` - Contar productos totales

### AuthContext

**Funciones utilizadas:**
- `isAuthenticated` - Verificar si el usuario está logueado

---

## Flujo de Usuario

### Flujo Principal

1. Usuario navega a `/cart`
2. Sistema verifica autenticación
3. Si autenticado → Carga productos del carrito
4. Usuario puede:
   - Modificar cantidades
   - Eliminar productos
   - Vaciar carrito (con confirmación)
   - Seguir comprando
   - Proceder al checkout

### Flujo de Modificación de Cantidad

```
Usuario hace clic en + o -
    ↓
handleUpdateQuantity()
    ↓
¿Cantidad < 1?
    ├─ Sí → handleRemoveItem() → Animación → removeFromCart()
    └─ No → updateQuantity() → Actualiza backend → Refresca UI
```

### Flujo de Eliminación

```
Usuario hace clic en 🗑️
    ↓
handleRemoveItem(productId)
    ↓
setRemovingItem(productId) → Inicia animación fade-out
    ↓
setTimeout 300ms
    ↓
removeFromCart(productId) → Llama al backend
    ↓
setRemovingItem(null) → Resetea estado
```

---

## Imágenes de Productos

### Estrategia de Carga

1. **Primera opción:** `item.imageUrl` desde backend
2. **Fallback:** Imagen generada con `getProductImage(item._id)`
3. **Error handling:** Retry automático una vez

**Función de fallback:**
```javascript
const getProductImage = (productId) => {
  const seed = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = seed % sampleProductImages.length;
  return sampleProductImages[index];
};
```

**Imágenes de Unsplash:**
- Contenedores de suplementos deportivos
- Alta calidad (500x500)
- Optimizadas con parámetros `w=500&h=500&fit=crop`

---

## Estructura del Código

```
Cart.jsx
├── Estados y Hooks
│   ├── useAuth()
│   ├── useCart()
│   ├── useNavigate()
│   ├── useState (showClearConfirm, removingItem)
│   └── Cálculos (subtotal, taxes, shipping, total)
│
├── Handlers
│   ├── handleUpdateQuantity()
│   ├── handleRemoveItem()
│   └── handleClearCart()
│
└── Renderizado Condicional
    ├── No autenticado → Pantalla de login
    ├── Cargando → Spinner
    ├── Carrito vacío → CTA explorar productos
    └── Carrito con productos
        ├── Lista de productos (col-span-2)
        │   ├── Tarjetas de productos
        │   └── Botón vaciar carrito
        └── Resumen (col-span-1)
            ├── Desglose de costos
            ├── Botón checkout
            ├── Seguir comprando
            └── Beneficios
```

---

## Estilos y Diseño

### Paleta de Colores

| Elemento | Color | Clase Tailwind |
|----------|-------|----------------|
| Fondo principal | Gradiente azul-índigo | `bg-gradient-to-br from-blue-50 to-indigo-50` |
| Tarjetas | Blanco | `bg-white` |
| Precio unitario | Azul | `text-blue-600` |
| Total | Gradiente azul-índigo | `bg-gradient-to-r from-blue-600 to-indigo-600` |
| Botón eliminar (hover) | Rojo | `hover:text-red-500 hover:bg-red-50` |
| Botón checkout | Gradiente azul-índigo | `from-blue-600 to-indigo-600` |

### Tipografía

- **Títulos principales:** `text-4xl font-bold`
- **Títulos de tarjeta:** `text-2xl font-bold`
- **Nombres de productos:** `text-lg font-bold`
- **Precios:** `text-2xl font-bold` (unitario), `text-3xl font-bold` (total)
- **Texto secundario:** `text-sm text-gray-600`

### Espaciado

- **Padding de tarjetas:** `p-6`
- **Gap entre productos:** `space-y-4`
- **Gap entre columnas:** `gap-8`
- **Bordes redondeados:** `rounded-2xl`

---

## Cálculos Financieros

### Subtotal
```javascript
const subtotal = getCartTotal();
```
Suma de `(precio × cantidad)` de todos los productos.

### Envío
```javascript
const shippingCost = cartItems.length > 0 ? 5000 : 0;
```
- Costo fijo: $5,000 COP
- Gratis si el carrito está vacío

### IVA
```javascript
const taxRate = 0.19; // 19% Colombia
const taxes = subtotal * taxRate;
```
- Tasa fija del 19% (IVA en Colombia)
- Se calcula sobre el subtotal

### Total
```javascript
const total = subtotal + shippingCost + taxes;
```

---

## Validaciones y UX

### 1. Autenticación Requerida

**Si no está autenticado:**
- Muestra pantalla de login requerido
- Botón para ir a `/login`
- Diseño amigable con iconos

### 2. Carrito Vacío

**Elementos:**
- Icono grande de carrito
- Mensaje: "Tu carrito está vacío"
- Texto motivacional
- Botón CTA: "Explorar productos"

### 3. Confirmación al Vaciar Carrito

**Flujo:**
1. Usuario hace clic en "Vaciar carrito"
2. Aparece modal de confirmación (fondo rojo suave)
3. Opciones: "Cancelar" o "Sí, vaciar"
4. Previene eliminación accidental

### 4. Estados de Carga

- Botones disabled durante operaciones
- Opacidad reducida en disabled
- Spinner en estado de carga global

---

## Responsividad

### Mobile First Design

**Móvil (< 1024px):**
- 1 columna
- Productos apilados
- Resumen abajo
- Imágenes full-width
- Controles de cantidad verticales

**Desktop (≥ 1024px):**
- Grid 3 columnas
- Sidebar sticky
- Hover effects
- Layout horizontal optimizado

**Clases responsive:**
```jsx
className="flex flex-col sm:flex-row gap-6"
className="w-full sm:w-32 h-32"
className="grid grid-cols-1 lg:grid-cols-3"
className="lg:col-span-2"
```

---

## Imágenes

### Sistema de Fallback

1. **Intenta cargar:** `item.imageUrl` (desde backend)
2. **Si falla:** `getProductImage(item._id)` (Unsplash basado en ID)
3. **Si falla de nuevo:** No reintenta (evita loops)

### Optimizaciones

- `loading="lazy"` - Carga diferida
- `onError` handler con retry
- Gradiente de fondo mientras carga
- Efecto zoom en hover

---

## Navegación

### Enlaces y Botones

| Elemento | Destino | Método |
|----------|---------|--------|
| Botón checkout | `/checkout` | `navigate('/checkout')` |
| Seguir comprando | `/` | `<Link to="/">` |
| Iniciar sesión | `/login` | `<Link to="/login">` |
| Explorar productos | `/` | `<Link to="/">` |

---

## Accesibilidad

**Implementaciones:**
- ✅ `alt` text en todas las imágenes
- ✅ `title` en botones (tooltips)
- ✅ Estados `disabled` claros visualmente
- ✅ Contraste de colores adecuado
- ✅ Textos descriptivos en botones
- ✅ Navegación por teclado (botones nativos)

---

## Performance

### Optimizaciones

1. **Lazy loading de imágenes:**
   ```jsx
   <img loading="lazy" />
   ```

2. **Transiciones CSS en lugar de JS:**
   ```jsx
   className="transition-all duration-300"
   ```

3. **Cálculos memoizados:**
   - `subtotal`, `taxes`, `total` se calculan una vez por render

4. **Animaciones con timeout:**
   - Permite que CSS maneje la animación
   - JS solo cambia clases

---

## Testing

### Escenarios de Prueba

**1. Carrito vacío:**
- ✅ Muestra mensaje apropiado
- ✅ Botón de explorar productos funciona
- ✅ No muestra resumen de compra

**2. Agregar productos:**
- ✅ Productos se muestran correctamente
- ✅ Imágenes cargan con fallback
- ✅ Información completa visible

**3. Modificar cantidad:**
- ✅ Botones +/- funcionan
- ✅ Subtotal se actualiza
- ✅ Total se recalcula

**4. Eliminar producto:**
- ✅ Animación smooth al eliminar
- ✅ Producto se elimina del backend
- ✅ UI se actualiza correctamente

**5. Vaciar carrito:**
- ✅ Muestra confirmación
- ✅ Permite cancelar
- ✅ Elimina todos los productos

**6. Proceder al checkout:**
- ✅ Navega correctamente
- ✅ Mantiene estado del carrito

**7. Responsividad:**
- ✅ Desktop: sidebar sticky funciona
- ✅ Tablet: layout se adapta
- ✅ Móvil: todo apilado verticalmente

---

## Conexión con Backend

### API Endpoints Utilizados

**Implícitos en CartContext:**
- `GET /api/cart` - Obtener carrito
- `PUT /api/cart/:productId` - Actualizar cantidad
- `DELETE /api/cart/:productId` - Eliminar producto
- `DELETE /api/cart` - Vaciar carrito

---

## Mejoras Futuras

### Funcionalidades Sugeridas

1. **Cupones de descuento:**
   - Campo de entrada para código
   - Validación de cupón
   - Descuento aplicado en resumen

2. **Opciones de envío:**
   - Seleccionar tipo de envío
   - Calcular costos dinámicos
   - Mostrar tiempos estimados

3. **Stock en tiempo real:**
   - Integrar con inventario
   - Advertencias de stock bajo
   - Límites de cantidad por disponibilidad

4. **Guardar para después:**
   - Mover a wishlist
   - Guardar carrito para comprar luego

5. **Productos relacionados:**
   - Recomendaciones en sidebar
   - "Completa tu compra"

6. **Estimación de entrega:**
   - Cálculo por ubicación
   - Fecha estimada visible

---

## Mantenimiento

### Modificar Costos

**Cambiar costo de envío:**
```javascript
const shippingCost = cartItems.length > 0 ? 5000 : 0;
```

**Cambiar tasa de IVA:**
```javascript
const taxRate = 0.19; // Cambiar aquí
```

### Agregar Nuevas Validaciones

Agregar en `handleUpdateQuantity()` o `handleRemoveItem()`:
```javascript
if (/* condición */) {
    // mostrar mensaje
    return;
}
```

### Personalizar Animaciones

Modificar duraciones y efectos en las clases:
```javascript
className="transition-all duration-300"  // Cambiar duration-XXX
className="opacity-0 scale-95"           // Cambiar efectos
```

---

## Archivos Relacionados

- **Componente:** `frontend/src/pages/Cart.jsx`
- **Contexto:** `frontend/src/contexts/CartContext.jsx`
- **Hook:** `frontend/src/hooks/useCart.js`
- **API Service:** `frontend/src/services/cartService.js`
- **Rutas Backend:** `backend/src/routes/cartRoutes.js`
- **Controlador:** `backend/src/controllers/cartController.js`
- **Modelo:** `backend/src/models/Cart.js`

---

## Notas Técnicas

**Estado local vs global:**
- `cartItems`, `loading`, `error` → Global (CartContext)
- `showClearConfirm`, `removingItem` → Local (useState)

**Por qué setTimeout en animaciones:**
- Permite que CSS aplique la transición visual
- Usuario ve feedback inmediato
- Backend se actualiza después de la animación

**Sticky sidebar:**
```jsx
className="sticky top-24"
```
- `top-24` compensa altura del navbar
- Solo funciona en desktop (lg:)

---

**Última actualización:** Octubre 2025 - Sprint 4
**Versión:** 1.0.0
**Autor:** Equipo SuperGains

