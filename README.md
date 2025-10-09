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

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Base de Datos**: MongoDB Atlas
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: Express-validator
- **Despliegue**: Render (Backend), Vercel (Frontend)
- **Desarrollo**: Concurrently, Nodemon
- **Inteligencia Artificial**: Python, Scikit-learn, TensorFlow (próximo sprint)
- **Pagos**: Integración con pasarelas de pago seguras (próximo sprint)

## Equipo de Desarrollo

| Nombre | Rol | Email | ID |
|--------|-----|-------|-----|
| Pablo Hurtado Giraldo | Desarrollador Full-Stack | pablo.hurtadog@upb.edu.co | 000196404 |
| Nicole Yuqui Vásquez | Especialista UX/UI | nicole.yuqui@upb.edu.co | 000518165 |
| Nicolás Ortega García | Desarrollador Backend | nicolas.ortegagarcia@upb.edu.co | 000528777 |
| Michael Serna Roldán | Especialista en IA/ML | Michael.serna@upb.edu.co | 000462501 |

## Funcionalidades Principales

### E-commerce ✅ COMPLETADO (Sprint 3)
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
- ⏳ Múltiples métodos de pago (Stripe/PayPal) - Sprint 4
- ⏳ Sistema de cupones y descuentos - Sprint 4

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

### CRM y Gestión de Clientes ✅ EN PROGRESO (Sprint 3)
- ✅ **Base de datos unificada de clientes**
- ✅ **Historial completo de órdenes por usuario**
- ✅ **Gestión de perfiles y preferencias**
- ✅ **Sistema de wishlist personalizado**
- ⏳ Segmentación automática por comportamiento - Sprint 4
- ⏳ Programas de fidelización con puntos - Sprint 4
- ⏳ Email marketing personalizado - Sprint 4
- ⏳ Sistema de notificaciones push - Sprint 4

### Inteligencia Artificial ⏳ PLANIFICADO (Sprint 4+)
- ⏳ Sistema de recomendaciones personalizadas con ML
- ⏳ Análisis predictivo de comportamiento
- ⏳ Optimización de precios dinámicos
- ⏳ Detección de patrones de compra
- ⏳ Chatbot inteligente para soporte al cliente

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

El proyecto utiliza metodología Scrum con sprints de 2 semanas:

- **Sprint 1-2**: Arquitectura y diseño base
- **Sprint 3-4**: Desarrollo E-commerce
- **Sprint 5-6**: Implementación ERP
- **Sprint 7-8**: Desarrollo CRM
- **Sprint 9-10**: Sistema de IA
- **Sprint 11-12**: Integración y testing

### Cronograma de Entregables

| Sprint | Entregable | Estado |
|--------|------------|--------|
| 1 | Arquitectura base y configuración | ✅ Completado |
| 2 | Plataforma E-commerce básica | ✅ Completado |
| 3 | Sistema de autenticación y carrito | ✅ Completado |
| 4 | Sistema ERP | ⏳ En desarrollo |
| 5 | CRM y base de datos | ⏳ Planificado |
| 6 | Sistema de IA | ⏳ Planificado |
| 7 | Testing e integración | ⏳ Planificado |

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

## 🎉 Sprint 3 Completado (Enero 2025)

El **Sprint 3 ha sido completado exitosamente al 100%**, consolidando SuperGains como una plataforma robusta de e-commerce con sistema ERP integrado.

### 📊 Logros Clave

| Categoría | Logro | Estado |
|-----------|-------|--------|
| **Historias de Usuario** | 18 completadas | ✅ 100% |
| **Bugs Resueltos** | 2 críticos | ✅ 100% |
| **Tests Implementados** | 411 automatizados | ✅ Completado |
| **Cobertura E2E** | 243 tests | ✅ 100% |
| **Optimización** | 65% más rápido | ✅ Superado |
| **Documentación** | 15+ guías técnicas | ✅ Completada |

### 🚀 Funcionalidades Principales Implementadas

#### Backend
- ✅ Sistema de inventario completo (CRUD + alertas)
- ✅ Dashboard de administración con métricas en tiempo real
- ✅ Sistema de órdenes con validación de stock
- ✅ Alertas automáticas de reabastecimiento
- ✅ Reportes exportables (CSV)
- ✅ Gestión de usuarios con RBAC
- ✅ Rate limiting balanceado (fix de error 429)

#### Frontend
- ✅ Checkout completo funcional
- ✅ Wishlist persistente
- ✅ Página de detalle con reseñas (Pravatar.cc)
- ✅ Header y Footer según PRD
- ✅ Sistema de diseño unificado
- ✅ Accesibilidad móvil (WCAG AA)

#### Optimización y Calidad
- ✅ React Query para caching inteligente
- ✅ Índices de MongoDB optimizados (80% mejora)
- ✅ Code splitting y lazy loading
- ✅ 411 tests automatizados (E2E + Integración + Unitarios)
- ✅ Seguridad avanzada (JWT + Helmet + Rate Limiting)

### 📚 Documentación del Sprint 3

- **[Sprint3.md](./Sprint3.md)** - Documentación completa con todas las HU
- **[SPRINT3_FINAL_REPORT.md](./SPRINT3_FINAL_REPORT.md)** - Reporte ejecutivo final
- **[SPRINT3_QA_REPORT.md](./SPRINT3_QA_REPORT.md)** - Reporte de QA detallado (568 líneas)
- **[SPRINT3_INDEX.md](./SPRINT3_INDEX.md)** - Índice de toda la documentación
- **[TESTING.md](./TESTING.md)** - Estrategia completa de testing
- **[SECURITY.md](./SECURITY.md)** - Documentación de seguridad
- **[PERFORMANCE.md](./PERFORMANCE.md)** - Guía de optimización

### 🎯 Próximo: Sprint 4 (Febrero 2025)

Prioridades para el Sprint 4:
- 🔄 Aumentar cobertura de tests unitarios (20% → 80%)
- 💳 Integración con pasarelas de pago (Stripe/PayPal)
- 🎫 Sistema de cupones y descuentos
- 📧 Notificaciones por email
- 📊 Analytics y tracking de usuarios
- 🤖 Inicio de módulo de IA/ML

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
- **Fecha**: 2025

---

## Roadmap Futuro

### Fase 2 (Q3 2025)
- Aplicación móvil nativa
- Integración con redes sociales
- Analytics avanzado con Big Data
- Expansion a múltiples tiendas

### Fase 3 (Q4 2025)
- Realidad aumentada para productos
- Blockchain para trazabilidad
- IoT para inventario inteligente
- Marketplace de terceros

---

**Desarrollado con dedicación por el equipo de SuperGains Digital Transformation**

*Universidad Pontificia Bolivariana - Medellín, Colombia - 2025*
