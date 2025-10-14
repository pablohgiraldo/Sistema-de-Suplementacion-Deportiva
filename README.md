# SuperGains - Sistema de Transformación Digital Integral

## Descripción del Proyecto

**SuperGains Digital Transformation** es una solución tecnológica integral que transforma digitalmente la tienda de suplementación deportiva SuperGains mediante la implementación de un ecosistema omnicanal compuesto por una plataforma de e-commerce, sistema ERP, CRM e inteligencia artificial.

### Objetivo Principal

Desarrollar una solución tecnológica integral que transforme digitalmente la tienda de suplementación deportiva SuperGains mediante la implementación de un ecosistema omnicanal compuesto por una plataforma de e-commerce para optimizar operaciones, mejorar la experiencia del cliente, expandir el alcance comercial y generar ventajas competitivas sostenibles.

### Objetivos Específicos

1. **Diseñar una arquitectura omnicanal** que conecte ventas, inventario y atención al cliente.

2. **Desarrollar una plataforma de e-commerce** con catálogo, pagos seguros y seguimiento de pedidos. Crear una base de datos de clientes con CRM para segmentación y fidelización. Integrar un sistema de recomendaciones con inteligencia artificial.

3. **Implementar un sistema ERP** para automatizar la gestión de inventarios.

## Arquitectura del Sistema

El proyecto implementa una arquitectura modular e integrada que incluye:

### Componentes Principales

- **Plataforma E-commerce**: Catálogo interactivo, carrito de compras, pagos seguros y seguimiento de pedidos
- **Sistema ERP**: Gestión automatizada de inventarios con control de stock en tiempo real
- **CRM Integrado**: Base de datos de clientes con historial de compras y segmentación
- **Sistema de Recomendaciones IA**: Algoritmos de machine learning para personalización

### Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, React Query
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Base de Datos**: MongoDB Atlas con índices optimizados
- **Autenticación**: JWT (JSON Web Tokens) con refresh tokens
- **Pagos**: PayU (pasarela de pagos Colombia)
- **Validación**: Express-validator, middlewares personalizados
- **Despliegue**: Render (Backend), Vercel (Frontend)
- **Desarrollo**: Concurrently, Nodemon
- **Inteligencia Artificial**: Sistema de recomendaciones (filtrado colaborativo híbrido)
- **Webhooks**: Sistema de notificaciones automáticas con HMAC-SHA256
- **Automatización**: Schedulers para órdenes y alertas

## Equipo de Desarrollo

| Nombre | Rol | Email | ID |
|--------|-----|-------|-----|
| Pablo Hurtado Giraldo | Desarrollador Full-Stack | pablo.hurtadog@upb.edu.co | 000196404 |
| Nicole Yuqui Vásquez | Especialista UX/UI | nicole.yuqui@upb.edu.co | 000518165 |
| Nicolás Ortega García | Desarrollador Backend | nicolas.ortegagarcia@upb.edu.co | 000528777 |

## Funcionalidades Principales

### E-commerce ✅ COMPLETADO (Sprints 1-4)
- ✅ Catálogo de productos interactivo con filtros avanzados
- ✅ Carrito de compras con persistencia y validación de stock
- ✅ Sistema de autenticación completo con JWT y refresh tokens
- ✅ Perfil de usuario con historial de órdenes
- ✅ Búsqueda en tiempo real con índices MongoDB optimizados
- ✅ Paginación y filtros por marca, precio, categoría
- ✅ **Proceso de checkout completo funcional**
- ✅ **Sistema de wishlist persistente**
- ✅ **Página de detalle de producto con reseñas**
- ✅ **Confirmación y tracking de órdenes**
- ✅ **Integración con PayU (pasarela de pagos Colombia)** - Sprint 4
- ✅ **Validación de transacciones y página de confirmación** - Sprint 4
- ⏳ Sistema de cupones y descuentos - Futuro

### Sistema ERP ✅ COMPLETADO (Sprint 3)
- ✅ **Control de inventario en tiempo real con CRUD completo**
- ✅ **Alertas automáticas de reabastecimiento configurables**
- ✅ **Dashboard de administración con métricas en tiempo real**
- ✅ **Reportes automatizados de ventas exportables (CSV)**
- ✅ **Historial completo de movimientos de stock**
- ✅ **Gestión de usuarios con roles y permisos (RBAC)**
- ✅ **Sistema de auditoría de operaciones administrativas**
- ⏳ Predicción de demanda con IA - Sprint 4
- ⏳ Sincronización con canales físicos - Sprint 4

### CRM y Gestión de Clientes ✅ COMPLETADO (Sprint 4)
- ✅ **Base de datos unificada de clientes con perfiles completos**
- ✅ **Historial completo de órdenes y métricas por usuario**
- ✅ **Gestión de perfiles y preferencias**
- ✅ **Sistema de wishlist personalizado**
- ✅ **Segmentación automática** (VIP, Frecuente, Ocasional, Nuevo, Inactivo, En Riesgo) - Sprint 4
- ✅ **Dashboard CRM admin con análisis de segmentos** - Sprint 4
- ✅ **Sincronización automática de métricas** (LTV, total orders, churn risk) - Sprint 4
- ✅ **Niveles de lealtad** (Bronce, Plata, Oro, Platino) - Sprint 4
- ⏳ Email marketing personalizado - Futuro
- ⏳ Sistema de notificaciones push - Futuro

### Inteligencia Artificial ✅ IMPLEMENTADO (Sprint 4)
- ✅ **Sistema de recomendaciones personalizadas** (86.67% accuracy) - Sprint 4
- ✅ **Filtrado colaborativo** (user-based e item-based) - Sprint 4
- ✅ **Cross-sell y upsell inteligente** - Sprint 4
- ✅ **Detección de patrones de compra** (co-ocurrencia) - Sprint 4
- ✅ **Recomendaciones por segmento de cliente** - Sprint 4
- ⏳ Análisis predictivo de demanda - Futuro
- ⏳ Optimización de precios dinámicos - Futuro
- ⏳ Chatbot inteligente para soporte - Futuro

## Instalación y Configuración

### Prerrequisitos

```bash
# Versiones mínimas requeridas
Node.js >= 16.0.0
Python >= 3.8
MongoDB Atlas (cuenta)
Git
```

### Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/supergains/digital-transformation.git
cd digital-transformation
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Configurar entorno Python para IA**
```bash
cd ../ai-engine
pip install -r requirements.txt
```

5. **Configurar base de datos MongoDB**
```bash
# No requiere instalación local, se usa MongoDB Atlas
# Crear cluster en MongoDB Atlas y obtener string de conexión
```

6. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tu configuración
```

### Configuración de Variables de Entorno

```env
# Base de datos MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/supergains_db

# JWT
JWT_SECRET=your_jwt_secret

# Pagos
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Email
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# API Keys
OPENAI_API_KEY=your_openai_key
```

## Ejecución del Proyecto

### Desarrollo

```bash
# Opción 1: Ejecutar todo simultáneamente (recomendado)
npm run dev

# Opción 2: Ejecutar por separado
# Terminal 1: Backend API
npm run dev:backend

# Terminal 2: Frontend React
npm run dev:frontend

# URLs de desarrollo:
# Frontend: http://localhost:5174 (o 5173)
# Backend: http://localhost:4000
# API Health: http://localhost:4000/api/health
```

### Producción

```bash
# Build del proyecto completo
npm run build

# Despliegue en Vercel
vercel --prod
```

## Metodología de Desarrollo

### Enfoque Ágil - Scrum

El proyecto utiliza metodología Scrum con sprints de 3-4 semanas. Iniciado en agosto 2025.

### Cronograma de Entregables

| Sprint | Período | Entregables Principales | Estado |
|--------|---------|------------------------|--------|
| **1** | Ago 2025 | Arquitectura base, configuración inicial, E-commerce básico | ✅ Completado |
| **2** | Sep 2025 | Autenticación JWT, carrito, wishlist, checkout | ✅ Completado |
| **3** | Oct 2025 | Sistema ERP completo, inventario, alertas, dashboard admin | ✅ Completado |
| **4** | Oct 2025 | CRM completo, IA/Recomendaciones, PayU, Webhooks, Automatizaciones | ✅ Completado |

### Sprint 4 - Avances Destacados

#### HU32 - CRM Básico ✅
- Colección customers en MongoDB
- CRUD de customers con métricas
- Segmentación automática (6 segmentos)
- Dashboard CRM con análisis
- Sincronización con órdenes

#### HU33 - Sistema de Recomendaciones IA ✅
- Filtrado colaborativo (user-based, item-based)
- Cross-sell y upsell inteligente
- 86.67% de accuracy validado
- 5 tipos de recomendaciones
- Dataset de prueba con 15 usuarios

#### HU34 - Checkout con PayU ✅
- Integración completa con PayU
- 7 validaciones de transacciones
- Registro completo de pagos (paymentLogs)
- Página de confirmación visual
- Tests con sandbox

#### HU35 - Sistema de Webhooks ✅
- 14 eventos soportados
- Firma HMAC-SHA256
- Automatización de estados de órdenes
- Webhooks de inventario crítico
- Schedulers automáticos

## Testing y Calidad

### Tipos de Pruebas

- **Pruebas Unitarias**: Jest para backend, React Testing Library para frontend
- **Pruebas de Integración**: Supertest para APIs
- **Pruebas E2E**: Cypress para flujos completos
- **Pruebas de Seguridad**: OWASP ZAP, pruebas de penetración
- **Pruebas de Performance**: Artillery, JMeter

### Ejecutar Tests

```bash
# Pruebas unitarias
npm run test

# Pruebas de integración
npm run test:integration

# Pruebas E2E
npm run test:e2e

# Cobertura de código
npm run test:coverage
```

## Métricas y KPIs

### Indicadores de Éxito

- **Conversión E-commerce**: Meta mayor a 3%
- **Tiempo de respuesta**: Menor a 2 segundos
- **Precisión recomendaciones**: Mayor a 85%
- **Reducción errores inventario**: Mayor a 40%
- **Satisfacción cliente (NPS)**: Mayor a 50

### Monitoreo

- Dashboard de métricas en tiempo real
- Alertas automáticas de rendimiento
- Reportes semanales automatizados
- Analytics de comportamiento de usuario

## Seguridad

### Medidas Implementadas

- Autenticación JWT con refresh tokens
- Encriptación de datos sensibles
- Validación de entrada en todas las APIs
- Rate limiting y protección DDOS
- Cumplimiento GDPR para datos personales
- Auditoría de transacciones financieras

### Despliegue

#### Ambientes

- **Desarrollo**: Local con MongoDB Atlas
- **Staging**: Vercel Preview Deployments
- **Producción**: Vercel Production

#### CI/CD Pipeline

```yaml
# Vercel automatic deployments
- Lint y validación de código
- Ejecución de tests automatizados
- Build automático en Vercel
- Preview deployments para PRs
- Producción automática desde main branch
```

## Documentación Técnica

### API Documentation

La documentación completa de las APIs está disponible en:
- **Swagger UI**: `http://localhost:3000/api-docs`
- **Postman Collection**: `./docs/SuperGains-API.postman_collection.json`
- **API Docs**: `./backend/API_DOCS.md`

### Endpoints Principales

#### Autenticación de Usuarios
```bash
# Registro de usuario
POST /api/users/register
Content-Type: application/json
{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "contraseña": "Password123",
  "rol": "usuario"
}

# Inicio de sesión
POST /api/users/login
Content-Type: application/json
{
  "email": "juan@ejemplo.com",
  "contraseña": "Password123"
}

# Obtener perfil del usuario
GET /api/users/profile
Authorization: Bearer <token>

# Renovar token de acceso
POST /api/users/refresh
Content-Type: application/json
{
  "refreshToken": "<refresh_token>"
}
```

#### Gestión del Carrito
```bash
# Obtener carrito del usuario
GET /api/cart
Authorization: Bearer <token>

# Agregar producto al carrito
POST /api/cart/add
Authorization: Bearer <token>
Content-Type: application/json
{
  "productId": "68ba5a9042eecff32cec5f49",
  "quantity": 2
}

# Actualizar cantidad de producto
PUT /api/cart/item/:productId
Authorization: Bearer <token>
Content-Type: application/json
{
  "quantity": 3
}

# Eliminar producto del carrito
DELETE /api/cart/item/:productId
Authorization: Bearer <token>
```

#### Catálogo de Productos
```bash
# Listar productos con filtros
GET /api/products?brand=Optimum&price_min=10&price_max=50&category=proteina&limit=10&page=1

# Búsqueda de productos
GET /api/products/search?q=whey protein&sortBy=price&limit=20

# Obtener producto por ID
GET /api/products/:id
```

## 🎉 Sprint 4 Completado (Octubre 2025)

El **Sprint 4 ha sido completado exitosamente**, consolidando SuperGains como una plataforma completa con CRM, IA, pagos seguros y webhooks.

### 📊 Logros Clave del Sprint 4

| Categoría | Logro | Estado |
|-----------|-------|--------|
| **Historias de Usuario** | 4 completadas (HU32-35) | ✅ 100% |
| **Sistema CRM** | Segmentación, métricas, dashboard | ✅ Completado |
| **IA/Recomendaciones** | 86.67% accuracy | ✅ Completado |
| **Pasarela de Pagos** | PayU integrado | ✅ Completado |
| **Webhooks** | 14 eventos automatizados | ✅ Completado |
| **Documentación** | 6 guías técnicas nuevas | ✅ Completada |

### 🚀 Funcionalidades Implementadas en Sprint 4

#### CRM y Analytics
- ✅ Modelo Customer con métricas completas (LTV, AOV, frecuencia)
- ✅ Segmentación automática (VIP, Frecuente, Ocasional, Nuevo, Inactivo, En Riesgo)
- ✅ Dashboard CRM admin con análisis de segmentos
- ✅ Sincronización automática con órdenes
- ✅ Cálculo de churn risk y niveles de lealtad

#### Inteligencia Artificial
- ✅ Sistema de recomendaciones híbrido (6 algoritmos)
- ✅ Filtrado colaborativo user-based e item-based
- ✅ Cross-sell y upsell con detección de patrones
- ✅ Recomendaciones por segmento CRM
- ✅ Confidence scoring y validación con métricas

#### Pagos Seguros
- ✅ Integración completa con PayU (Colombia)
- ✅ Soporte para tarjetas, PSE y efectivo
- ✅ 7 middlewares de validación robusta
- ✅ Registro completo con paymentLogs
- ✅ Página de confirmación con estados visuales
- ✅ Sistema de reembolsos para admin

#### Webhooks y Automatización
- ✅ 14 eventos (order.*, payment.*, inventory.*)
- ✅ Firma HMAC-SHA256 con validación timing-safe
- ✅ Scheduler de automatizaciones (cada 60 min)
- ✅ Auto-entrega de órdenes (+7 días)
- ✅ Auto-cancelación de órdenes sin pago (+24h)
- ✅ Webhooks de inventario crítico

### 📚 Documentación del Sprint 4

- **[RECOMMENDATIONS.md](./backend/docs/RECOMMENDATIONS.md)** - Sistema de recomendaciones IA
- **[CRM_GUIDE.md](./backend/docs/CRM_GUIDE.md)** - Guía completa del CRM
- **[CHECKOUT.md](./backend/docs/CHECKOUT.md)** - Sistema de checkout con PayU
- **[PAYU_SETUP.md](./backend/docs/PAYU_SETUP.md)** - Configuración de PayU
- **[PAYU_TESTING_GUIDE.md](./backend/docs/PAYU_TESTING_GUIDE.md)** - Guía de testing
- **[WEBHOOKS.md](./backend/docs/WEBHOOKS.md)** - Sistema de webhooks

### 📈 Métricas del Proyecto (Octubre 2025)

| Métrica | Valor |
|---------|-------|
| **Líneas de código** | ~15,000+ |
| **Archivos creados** | 120+ |
| **Commits realizados** | 150+ |
| **Endpoints API** | 60+ |
| **Modelos de datos** | 10 |
| **Páginas frontend** | 15+ |
| **Scripts de utilidad** | 12 |
| **Guías de documentación** | 20+ |
| **Sprints completados** | 4/4 |

---

### Diagramas de Arquitectura

- **Arquitectura General**: `./docs/architecture/general-architecture.md`
- **Base de Datos**: `./docs/database/er-diagram.png`
- **Flujo de Datos**: `./docs/flows/data-flow.md`

## Contribución

### Flujo de Contribución

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Añadir nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

### Estándares de Código

- **JavaScript**: ESLint + Prettier
- **Python**: PEP 8 + Black formatter
- **Git**: Conventional Commits
- **Testing**: Cobertura mínima 80%

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## Soporte y Contacto

### Equipo de Desarrollo

- **Issues**: [GitHub Issues](https://github.com/supergains/digital-transformation/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/supergains/digital-transformation/wiki)
- **Email**: team@supergains-digital.com

### Universidad Pontificia Bolivariana

- **Escuela**: Escuela de Ingenierías
- **Programa**: Proyecto Aplicado en TIC 1
- **Período**: Agosto - Octubre 2025

---

## Roadmap Futuro

### Próximas Mejoras
- 🎫 Sistema de cupones y descuentos
- 📧 Email marketing personalizado
- 📱 Aplicación móvil (PWA)
- 📊 Analytics avanzado con dashboards interactivos
- 🤖 Chatbot con IA para soporte
- 🔔 Notificaciones push en tiempo real

### Expansión
- 🏪 Sincronización con tienda física
- 🌎 Marketplace de suplementos
- 💳 Más métodos de pago (Nequi, Daviplata)
- 📦 Integración con logística de envíos

---

**Desarrollado con dedicación por el equipo de SuperGains Digital Transformation**

*Universidad Pontificia Bolivariana - Medellín, Colombia*  
*Agosto - Octubre 2025*
