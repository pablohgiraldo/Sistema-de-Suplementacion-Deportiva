# Product Requirements Document (PRD) - SuperGains Website

##  Información del Proyecto

- **Nombre del Proyecto:** SuperGains - Plataforma de E-commerce de Suplementos Deportivos
- **Stack Tecnológico:** MERN (MongoDB Atlas + Express.js + React + Node.js)
- **Tipo de Aplicación:** E-commerce de suplementos deportivos y nutrición
- **Audiencia Objetivo:** Deportistas, atletas, entusiastas del fitness y personas interesadas en suplementación deportiva

---

##  Objetivos del Producto

### Objetivos Principales
1. **Crear una plataforma de e-commerce moderna** para la venta de suplementos deportivos
2. **Proporcionar una experiencia de usuario excepcional** con navegación intuitiva y diseño atractivo
3. **Implementar funcionalidades completas de e-commerce** incluyendo catálogo, carrito, pagos y gestión de pedidos
4. **Establecer una marca fuerte** en el mercado de suplementos deportivos

### Objetivos Específicos
- **Conversión:** Aumentar la tasa de conversión de visitantes a compradores
- **Retención:** Fomentar la fidelización de clientes
- **Ventas:** Maximizar el valor promedio del carrito de compras
- **Experiencia:** Proporcionar una navegación fluida y atractiva

---

##  Arquitectura del Sistema

### Stack Tecnológico
- **Frontend:** React.js con Vite
- **Backend:** Node.js + Express.js
- **Base de Datos:** MongoDB Atlas
- **Estilos:** Tailwind CSS
- **Estado:** React Context API / Redux Toolkit
- **Autenticación:** JWT + bcrypt
- **Pagos:** Stripe / PayPal
- **Despliegue:** Vercel (Frontend) + Railway/Heroku (Backend)

### Estructura de la Base de Datos
- **Usuarios:** Autenticación, perfiles, direcciones
- **Productos:** Catálogo, categorías, inventario
- **Pedidos:** Historial, estado, tracking
- **Carrito:** Sesiones, persistencia
- **Reseñas:** Valoraciones, comentarios

---

##  Especificaciones de Diseño y UX

### Paleta de Colores
- **Primario:** Negro (#000000) - Elegancia y profesionalismo
- **Secundario:** Blanco (#FFFFFF) - Limpieza y claridad
- **Acentos:** 
  - Azul (#3B82F6) - Confianza y tecnología
  - Verde (#10B981) - Salud y naturaleza
  - Rosa (#EC4899) - Energía y juventud
  - Amarillo (#F59E0B) - Optimismo y vitalidad

### Tipografía
- **Principal:** Inter, Roboto, o similar sans-serif
- **Títulos:** Bold (700) para jerarquía clara
- **Cuerpo:** Regular (400) para legibilidad
- **Acentos:** Medium (500) para elementos importantes

### Principios de Diseño
- **Minimalismo:** Diseño limpio y enfocado
- **Contraste:** Alto contraste para accesibilidad
- **Consistencia:** Patrones de diseño uniformes
- **Responsividad:** Adaptable a todos los dispositivos

---

##  Especificaciones de Páginas y Componentes

### 1. Header / Navegación Principal

#### 1.1 Top Bar Promocional
- **Ubicación:** Parte superior de todas las páginas
- **Contenido:** 
  - Banner promocional con fondo negro
  - Texto: "Protein Week: Enjoy 20% off protein"
  - Icono de brazo musculoso
  - Ofertas temporales y promociones
- **Funcionalidad:** Clicable para ir a la página de ofertas
- **Estados:** Visible/oculto según promociones activas

#### 1.2 Header Principal
- **Logo:** "SPG" en estilo moderno y negrita
- **Subtítulo:** "SUPERGAINS" debajo del logo
- **Barra de Búsqueda:** 
  - Placeholder: "Search for Protein, Food..."
  - Icono de lupa
  - Funcionalidad de búsqueda en tiempo real
- **Iconos de Usuario (Derecha):**
  - Selector de país/moneda (CY)
  - Icono de accesibilidad
  - Perfil de usuario
  - Lista de deseos (corazón)
  - Carrito de compras

#### 1.3 Navegación Principal
- **Categorías Principales:**
  - Promotion
  - Protein Powder
  - Vitamins & More
  - Performance
  - Bars & Snacks
  - Accessories
  - Outlet
  - Goals
  - About us
- **Indicadores:** Flechas hacia abajo para submenús
- **Filtros Rápidos (Segunda Fila):**
  - All Products, Bestsellers, Proteins
  - Vitamins & More, Performance
  - Food & Snacks, Protein Bars
  - Outlet, Samples, Vegan

### 2. Hero Section / Banner Principal

#### 2.1 Estructura del Banner
- **Layout:** Rectangular con esquinas redondeadas
- **División:** Dos secciones principales (izquierda y derecha)
- **Fondo:** Imagen de gimnasio en blanco y negro

#### 2.2 Sección Izquierda (Imagen de Estilo de Vida)
- **Contenido:** Hombre musculoso en gimnasio
- **Estilo:** Fotografía en blanco y negro
- **Contexto:** Ambiente de entrenamiento
- **Enfoque:** Bíceps y hombros prominentes
- **Fondo:** Gimnasio borroso para contexto

#### 2.3 Sección Derecha (Producto y Promoción)
- **Fondo:** Negro sólido para alto contraste
- **Etiqueta "NEW":** 
  - Texto blanco con borde negro
  - Posición: superior izquierda
  - Indica lanzamiento reciente
- **Productos Mostrados:**
  - **Producto Principal:** Bote negro con etiqueta rosa
    - Logo: "SUPERGAINS"
    - Nombre: "DESIGNER. WHEY PROTEIN"
    - Gráfico: Bebida rosa cremosa con frutas
    - Badge: "LIMITED EDITION KiBa Flavor"
  - **Producto Secundario:** Shaker amarillo con tapa rosa
    - Logo impreso verticalmente
- **Texto Promocional:**
  - Título: "DESIGNER WHEY PROTEIN" (grande y blanco)
  - Subtítulo: "New in: KiBa Flavor"
- **Botón CTA:** 
  - Forma: Ovalada blanca
  - Texto: "SAVE 20%" en negro
  - Acción: Redirigir a página del producto

### 3. Sección de Productos Principales

#### 3.1 Encabezado de Sección
- **Título Principal:** "Our top products"
- **Subtítulo:** "Particularly popular"
- **Alineación:** Izquierda
- **Estilo:** Negrita para el título, más ligero para el subtítulo

#### 3.2 Carrusel de Productos
- **Layout:** Carrusel horizontal con 4 productos visibles
- **Navegación:** Flecha derecha para más productos
- **Fondo:** Gris claro con esquinas redondeadas

#### 3.3 Estructura de Tarjetas de Producto
- **Elementos Comunes:**
  - **Etiqueta de Estado:** Badge negro redondeado (ej: "Bestseller", "New Flavor")
  - **Icono de Favorito:** Corazón en esquina superior derecha
  - **Logo de Marca:** "SUPERGAINS ELITE SPORTS NUTRITION"
  - **Imagen del Producto:** Empaque sobre fondo gris
  - **Información del Producto:** Nombre, descripción, valoración, precio
  - **Icono de Acción:** Botón circular negro con icono de carrito

#### 3.4 Productos Específicos

**Producto 1: Protein Starterkit**
- **Imagen:** Caja negra vertical con logo SUPERGAINS
- **Contenido:** 2x Designer Whey y 2x Isoclear®
- **Valoración:** 5 estrellas (3 reseñas)
- **Precio:** $37,380 COP
- **Estado:** Producto de muestra

**Producto 2: Sample Box Isoclear, 5 x 30g**
- **Imagen:** Caja negra horizontal con logo SUPERGAINS
- **Contenido:** 5 variedades más vendidas para probar
- **Valoración:** 5 estrellas (397 reseñas)
- **Precio:** $45,780 COP
- **Estado:** Pack de muestras

**Producto 3: Sample Box Designer Whey, 5 x 30g**
- **Imagen:** Caja negra horizontal con logo SUPERGAINS
- **Contenido:** 5 variedades más vendidas para probar
- **Valoración:** 5 estrellas (269 reseñas)
- **Precio:** $41,580 COP
- **Estado:** Pack de muestras

**Producto 4: Sample Box Designer Bars, 4 x 45g**
- **Imagen:** Caja negra vertical con logo SUPERGAINS
- **Contenido:** 4 variedades más vendidas para probar
- **Valoración:** 5 estrellas (267 reseñas)
- **Precio:** $37,380 COP
- **Estado:** Pack de barras

### 4. Sección de Intereses del Usuario

#### 4.1 Título de Sección
- **Texto:** "What are you interested in?" (¿Qué te interesa?)
- **Estilo:** Fuente grande y negrita
- **Propósito:** Guiar la exploración del usuario

#### 4.2 Imágenes de Categorías
- **Estilo:** Fotografías en blanco y negro
- **Formato:** Cuadradas, clicables
- **Propósito:** Navegación por categorías de interés

**Imagen 1: Gimnasio y Musculación**
- **Contenido:** Hombre musculoso con expresión intensa
- **Contexto:** Gimnasio con letrero de neón borroso
- **Categoría:** Suplementos para musculación

**Imagen 2: Deportes al Aire Libre**
- **Contenido:** Hombre corriendo en entorno boscoso
- **Contexto:** Actividad física al aire libre
- **Categoría:** Suplementos para resistencia

**Imagen 3: Entrenamiento de Fuerza**
- **Contenido:** Mujer levantando mancuerna
- **Contexto:** Gimnasio, expresión de concentración
- **Categoría:** Suplementos para fuerza

**Imagen 4: Hidratación y Recuperación**
- **Contenido:** Hombre bebiendo de shaker
- **Contexto:** Logo SUPERGAINS visible en la botella
- **Categoría:** Bebidas y recuperación

### 5. Sección de Productos Destacados

#### 5.1 Layout de Productos
- **Formato:** 4 tarjetas horizontales
- **Navegación:** Flecha derecha para más productos
- **Fondo:** Gris claro con esquinas redondeadas

#### 5.2 Productos Específicos

**Producto 1: Isoclear Whey Protein Isolate**
- **Descripción:** "Refreshingly clear protein drink"
- **Valoración:** 5 estrellas (8,526 reseñas)
- **Precio:** $222,180 COP
- **Precio por Unidad:** $244,692 COP/kg
- **Estado:** Bestseller

**Producto 2: Designer Whey Protein**
- **Descripción:** "Germany's No. 1 whey"
- **Valoración:** 5 estrellas (7,607 reseñas)
- **Precio:** $167,580 COP
- **Precio por Unidad:** $184,548 COP/kg
- **Estado:** Bestseller

**Producto 3: Designer Protein Bar**
- **Descripción:** "Protein bars with no added sugar"
- **Valoración:** 5 estrellas (7,628 reseñas)
- **Precio:** $112,980 COP
- **Precio por Unidad:** $209,202 COP/kg
- **Estado:** Bestseller

**Producto 4: Ultrapure Creatine Powder**
- **Descripción:** "High-quality micro creatine powder"
- **Valoración:** 5 estrellas (1,570 reseñas)
- **Precio:** $125,580 COP
- **Precio por Unidad:** $251,160 COP/kg
- **Estado:** Bestseller

### 6. Banner Promocional de Outlet

#### 6.1 Estructura del Banner
- **Layout:** Rectangular grande con fondo negro
- **División:** Dos secciones principales (izquierda y derecha)
- **Separador:** Línea diagonal blanca

#### 6.2 Sección Izquierda (Productos)
- **Fondo:** Oscuro con símbolos de porcentaje repetidos
- **Productos Mostrados:**
  - **SUPERGAINS DESIGNER VEGAN PROTEIN BAR:** Cajas apiladas, sabor chocolate
  - **SUPERGAINS CRANK FOCUS PRO:** Bote negro con gráfico de mango
  - **SUPERGAINS DESIGNER VEGAN PROTEIN:** Bote grande, "NEW RECIPE Milky Chocolate Flavor"

#### 6.3 Sección Derecha (Promoción)
- **Fondo:** Negro sólido
- **Título:** "SUPERGAINS OUTLET:" (grande, blanco)
- **Subtítulo:** "UP TO 50%" (más grande, negrita)
- **Descripción:** "Top supplements at best prices"
- **Botón CTA:** "SAVE NOW" (blanco con texto negro)

### 7. Sección para Nuevos Usuarios

#### 7.1 Título y Descripción
- **Título:** "Are you new here?" (¿Eres nuevo aquí?)
- **Subtítulo:** "Try our top picks." (Prueba nuestras mejores opciones)
- **Estilo:** Negro, negrita, sans-serif

#### 7.2 Placeholders de Productos
- **Formato:** 3 rectángulos grises redondeados
- **Elementos:**
  - **Primer Placeholder:** Badge "Bestseller" en esquina superior izquierda
  - **Todos:** Icono de corazón en esquina superior derecha
- **Propósito:** Sugerir más productos para nuevos usuarios

### 8. Footer / Pie de Página

#### 8.1 Estructura General
- **Layout:** Multi-columna sobre fondo negro
- **División:** Tres secciones principales (izquierda, central, derecha)
- **Estilo:** Texto blanco sobre fondo negro

#### 8.2 Sección Izquierda (Marca y Copyright)
- **Logo:** "SUPERGAINS" prominente en fuente estilizada blanca
- **Nombre Completo:** "SUPERGAINS ELITE SPORTS NUTRITION" en mayúsculas
- **Copyright:** 
  - "© 2025 Fitmart GmbH & Co."
  - "All prices incl. VAT."

#### 8.3 Sección Central (Navegación)
**Customer Service:**
- Service & FAQ, Contact, Track my order
- Delivery, Returns, Whistleblower system
- Cologne List, Halal Product Overview
- Press, Current customer information

**Company:**
- About Us, Career, Distributors
- Legal Notice, General Terms and Conditions
- Privacy Policy, Cancellation Policy
- Adjust Cookie Consent, Compliance
- Code of Conduct, Code of Conduct for Suppliers and Business Partners
- Policy Statement

**Categories:**
- Protein powder, Whey protein, Protein shaker
- Protein snacks, Amino acids, Post-workout
- Vitamin supplements, Vitamin C, Vitamin D3 K2
- Turmeric capsules, NAC, Omega-3 capsules
- Vegan Omega-3

**Products:**
- Protein pancakes, EAA, Glutamine
- Shaker, Protein pudding, Magnesium bisglycinate
- Oil spray, Multivitamin

#### 8.4 Sección Derecha (Sociales, Pagos, Envío)
**Our Socials:**
- **Header:** "Our Socials" (negrita, blanco)
- **Iconos:** 4 iconos de redes sociales en círculos oscuros
  - Facebook (f), Instagram (cámara)
  - TikTok (nota musical), YouTube (botón play)

**Payment Options:**
- **Header:** "Payment Options" (negrita, blanco)
- **Logos:** Grid de 12 métodos de pago con colores originales
  - American Express, Apple Pay, Blik, EPS
  - Mastercard, Maestro, PayPal, Shop Pay
  - TWINT, UnionPay, VISA, Klarna

**Shipping:**
- **Header:** "Shipping" (negrita, blanco)
- **Logo:** DHL con texto rojo sobre fondo amarillo

---

##  Requerimientos Técnicos

### Frontend (React)
- **Componentes Reutilizables:**
  - Header, Footer, Navigation
  - ProductCard, ProductGrid, ProductCarousel
  - Banner, HeroSection, CategoryCard
  - SearchBar, FilterPanel, Pagination
- **Estado Global:** Context API para carrito y usuario
- **Rutas:** React Router para navegación
- **Responsividad:** Mobile-first design
- **Performance:** Lazy loading, code splitting

### Backend (Node.js + Express)
- **APIs RESTful:**
  - `/api/products` - CRUD de productos
  - `/api/categories` - Gestión de categorías
  - `/api/users` - Autenticación y perfiles
  - `/api/orders` - Gestión de pedidos
  - `/api/cart` - Carrito de compras
- **Middleware:** Autenticación, validación, CORS
- **Uploads:** Imágenes de productos
- **Pagos:** Integración con Stripe/PayPal

### Base de Datos (MongoDB Atlas)
- **Colecciones:**
  - `users` - Usuarios y autenticación
  - `products` - Catálogo de productos
  - `categories` - Categorías y subcategorías
  - `orders` - Pedidos y estado
  - `cart` - Carrito de compras
  - `reviews` - Reseñas y valoraciones
- **Índices:** Búsqueda de texto, categorías, precios
- **Relaciones:** Referencias entre colecciones

---

##  Requerimientos de Responsividad

### Breakpoints
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

### Adaptaciones por Dispositivo
- **Mobile:** Navegación hamburger, carrusel vertical
- **Tablet:** Navegación expandida, grid 2 columnas
- **Desktop:** Navegación completa, grid 4 columnas

---

##  Funcionalidades Principales

### 1. Sistema de Usuarios
- **Registro/Login:** Email y contraseña
- **Perfiles:** Información personal, direcciones
- **Historial:** Pedidos anteriores, favoritos
- **Preferencias:** Categorías de interés

### 2. Catálogo de Productos
- **Búsqueda:** Texto, categorías, filtros
- **Filtros:** Precio, marca, tipo, disponibilidad
- **Ordenamiento:** Popularidad, precio, novedad
- **Paginación:** Carga infinita o paginación tradicional

### 3. Carrito de Compras
- **Persistencia:** Sesión y base de datos
- **Cantidades:** Ajuste de cantidades
- **Favoritos:** Lista de deseos
- **Guardado:** Para compras posteriores

### 4. Proceso de Compra
- **Checkout:** Dirección, método de envío
- **Pagos:** Múltiples métodos de pago
- **Confirmación:** Email de confirmación
- **Tracking:** Seguimiento de pedidos

### 5. Sistema de Reseñas
- **Valoraciones:** 1-5 estrellas
- **Comentarios:** Texto opcional
- **Verificación:** Solo usuarios verificados
- **Moderación:** Filtrado de contenido inapropiado

---

##  Métricas de Éxito

### KPIs Principales
- **Conversión:** Tasa de visitantes a compradores
- **AOV:** Valor promedio del pedido
- **Retención:** Clientes recurrentes
- **Satisfacción:** Puntuación NPS

### Métricas Técnicas
- **Performance:** Tiempo de carga < 3 segundos
- **Disponibilidad:** 99.9% uptime
- **SEO:** Posicionamiento en búsquedas relevantes
- **Accesibilidad:** Cumplimiento WCAG 2.1

---

##  Cronograma de Desarrollo

### Fase 1: MVP (4-6 semanas)
- [ ] Setup del proyecto MERN
- [ ] Autenticación básica
- [ ] Catálogo de productos
- [ ] Carrito básico
- [ ] Checkout simple

### Fase 2: Funcionalidades Completas (4-6 semanas)
- [ ] Sistema de reseñas
- [ ] Búsqueda avanzada
- [ ] Filtros y ordenamiento
- [ ] Perfiles de usuario
- [ ] Historial de pedidos

### Fase 3: Optimización (2-3 semanas)
- [ ] Performance y SEO
- [ ] Testing y debugging
- [ ] Documentación
- [ ] Despliegue

---

##  Consideraciones de Seguridad

### Autenticación
- **JWT:** Tokens seguros con expiración
- **Bcrypt:** Hash de contraseñas
- **Rate Limiting:** Protección contra ataques
- **HTTPS:** Encriptación de datos

### Datos
- **Validación:** Input sanitization
- **Autorización:** Control de acceso por roles
- **Auditoría:** Logs de acciones importantes
- **Backup:** Respaldo regular de datos

---

##  Criterios de Aceptación

### Funcionalidades Básicas
- [ ] Usuario puede navegar por categorías
- [ ] Usuario puede buscar productos
- [ ] Usuario puede agregar productos al carrito
- [ ] Usuario puede completar una compra
- [ ] Usuario puede ver su historial de pedidos

### Experiencia de Usuario
- [ ] Tiempo de carga < 3 segundos
- [ ] Navegación intuitiva en mobile
- [ ] Diseño consistente en todas las páginas
- [ ] Formularios con validación clara
- [ ] Mensajes de error informativos

### Calidad Técnica
- [ ] Código bien documentado
- [ ] Tests unitarios > 80% cobertura
- [ ] Manejo de errores robusto
- [ ] Logs para debugging
- [ ] Performance optimizada

---

##  Recursos y Referencias

### Diseño
- **Inspiración:** SUPERGAINS Elite Sports Nutrition
- **Paleta:** Coolors.co para generación de colores
- **Iconos:** Heroicons, Feather Icons
- **Fuentes:** Google Fonts, Inter

### Desarrollo
- **Documentación:** MDN, React Docs, Express Docs
- **Herramientas:** Postman, MongoDB Compass
- **Testing:** Jest, React Testing Library
- **Deployment:** Vercel, Railway, Heroku

---

##  Notas de Implementación

### Prioridades de Desarrollo
1. **Alta Prioridad:** Funcionalidades core de e-commerce
2. **Media Prioridad:** Experiencia de usuario y diseño
3. **Baja Prioridad:** Funcionalidades avanzadas

### Consideraciones Técnicas
- **Estado Global:** Context API para estado simple, Redux para complejo
- **Base de Datos:** MongoDB Atlas para escalabilidad
- **Imágenes:** Optimización y lazy loading
- **SEO:** Meta tags, sitemap, structured data

### Mantenimiento
- **Updates:** Dependencias actualizadas regularmente
- **Monitoring:** Logs y métricas de performance
- **Backup:** Respaldo automático de base de datos
- **Security:** Auditorías de seguridad regulares

---

*Este PRD debe ser revisado y actualizado según evolucione el proyecto y se reciban feedback de usuarios y stakeholders.*
