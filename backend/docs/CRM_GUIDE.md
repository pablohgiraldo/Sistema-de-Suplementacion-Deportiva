# 📊 Guía del Sistema CRM - SuperGains

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Modelo de Datos](#modelo-de-datos)
4. [API Endpoints](#api-endpoints)
5. [Dashboard Frontend](#dashboard-frontend)
6. [Sistema de Segmentación](#sistema-de-segmentación)
7. [Métricas y Análisis](#métricas-y-análisis)
8. [Sincronización con Órdenes](#sincronización-con-órdenes)
9. [Scripts y Herramientas](#scripts-y-herramientas)
10. [Guía de Uso](#guía-de-uso)
11. [Próximos Pasos](#próximos-pasos)

---

## Introducción

El Sistema CRM (Customer Relationship Management) de SuperGains es una solución completa para gestionar y analizar las relaciones con los clientes. Permite:

- 👥 Gestión centralizada de perfiles de clientes
- 📈 Análisis de comportamiento de compra
- 🎯 Segmentación automática de clientes
- 💎 Sistema de fidelización por niveles
- 📊 Dashboard con métricas en tiempo real
- 🤖 Recomendaciones basadas en IA

### Características Principales

✅ **Gestión de Customers**
- Perfil completo con historial de compras
- Código único de customer (CUS-YYYYMMDD-XXXXX)
- Métricas automáticas (LTV, AOV, frecuencia)
- Preferencias y comportamiento

✅ **Segmentación Inteligente**
- VIP (> $5,000 gastados)
- Frecuente (5+ órdenes, activo < 30 días)
- Ocasional (2-4 órdenes)
- Nuevo (1 orden o recién registrado)
- En Riesgo (activo 30-60 días)
- Inactivo (> 60 días sin actividad)

✅ **Sistema de Fidelidad**
- Niveles: Bronce → Plata → Oro → Platino → Diamante
- Basado en total gastado
- Actualización automática

✅ **Dashboard Administrativo**
- Métricas generales del negocio
- Distribución por segmentos
- Top 5 customers por valor
- Recomendaciones de IA

---

## Arquitectura del Sistema

### Backend (Node.js + Express + MongoDB)

```
backend/
├── src/
│   ├── models/
│   │   └── Customer.js          # Modelo principal del CRM
│   ├── controllers/
│   │   └── customerController.js # Lógica de negocio
│   ├── routes/
│   │   └── customerRoutes.js     # Endpoints de la API
│   └── services/
│       └── customerSyncService.js # Sincronización automática
├── scripts/
│   ├── test-customer-order-integration.js
│   ├── test-segmentation.js
│   └── check-crm-data.js         # Diagnóstico del CRM
└── docs/
    ├── CRM_GUIDE.md              # Esta guía
    ├── CUSTOMER_ORDER_INTEGRATION.md
    ├── SEGMENTATION_SYSTEM.md
    └── CRM_IMPLEMENTATION_SUMMARY.md
```

### Frontend (React + Vite)

```
frontend/
├── src/
│   ├── pages/
│   │   └── AdminCustomers.jsx    # Dashboard principal
│   ├── services/
│   │   └── customerService.js    # Cliente API
│   ├── components/
│   │   ├── ui/                   # Sistema de diseño
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Alert.jsx
│   │   │   └── README.md
│   │   └── icons/
│   │       └── CRMIcons.jsx      # Iconos SVG
│   └── App.jsx                   # Ruta /admin/customers
```

---

## Modelo de Datos

### Customer Schema

```javascript
{
  // Identificación
  user: ObjectId,                    // Referencia a User
  customerCode: String,              // CUS-20250109-XXXXX (único)
  
  // Métricas
  lifetimeValue: Number,             // Valor total del cliente
  metrics: {
    totalOrders: Number,             // Total de órdenes
    totalSpent: Number,              // Total gastado
    averageOrderValue: Number,       // Valor promedio de orden
    lastOrderDate: Date,             // Última compra
    daysSinceLastOrder: Number       // Días sin comprar
  },
  
  // Segmentación
  segment: String,                   // VIP, Frecuente, Ocasional, etc.
  loyaltyLevel: String,              // Bronce, Plata, Oro, Platino, Diamante
  loyaltyPoints: Number,
  isHighValue: Boolean,              // LTV > $5,000
  churnRisk: String,                 // Alto, Medio, Bajo
  
  // Preferencias
  preferences: {
    categories: [String],            // Categorías favoritas
    brands: [String],                // Marcas favoritas
    priceRange: String               // Rango de precio preferido
  },
  
  // Engagement
  engagementScore: Number,           // 0-100
  lastInteractionDate: Date,
  interactionHistory: [{
    type: String,
    date: Date,
    notes: String
  }],
  
  // Información de contacto
  contactInfo: {
    phone: String,
    preferredChannel: String
  },
  
  // Datos adicionales
  status: String,                    // Activo, Inactivo
  acquisitionSource: String,         // Directo, Referido, etc.
  tags: [String]
}
```

---

## API Endpoints

### Autenticación
Todos los endpoints requieren autenticación JWT y rol de admin.

**Headers requeridos:**
```javascript
{
  'Authorization': 'Bearer <token>',
  'Content-Type': 'application/json'
}
```

### Endpoints Disponibles

#### 1. Dashboard General
```http
GET /api/customers/dashboard
```

**Respuesta:**
```json
{
  "overview": {
    "totalCustomers": 31,
    "activeCustomers": 31,
    "highValueCustomers": 3,
    "churnRiskCount": 5,
    "newCustomers": 2
  },
  "revenue": {
    "totalRevenue": 45678.90,
    "avgLifetimeValue": 1473.51,
    "avgOrderValue": 368.38
  },
  "segmentDistribution": [
    {
      "_id": "VIP",
      "count": 3,
      "totalRevenue": 25000,
      "avgLifetimeValue": 8333.33
    }
  ],
  "topCustomers": [...],
  "recentActivity": [...]
}
```

#### 2. Análisis de Segmentación
```http
GET /api/customers/segmentation/analysis
```

**Respuesta:**
```json
{
  "overview": {
    "totalCustomers": 31,
    "segmentCount": 4
  },
  "segments": {
    "VIP": {
      "count": 3,
      "percentage": 9.68,
      "avgLifetimeValue": 8333.33,
      "totalRevenue": 25000,
      "avgOrders": 8
    }
  },
  "recommendations": [
    {
      "segment": "VIP",
      "priority": "Alta",
      "issue": "Solo 3 clientes VIP",
      "action": "Crear programa de beneficios exclusivos"
    }
  ]
}
```

#### 3. Customers por Segmento
```http
GET /api/customers/segment/:segment
```

**Parámetros:**
- `segment`: VIP | Frecuente | Ocasional | Nuevo | En Riesgo | Inactivo

**Respuesta:**
```json
{
  "segment": "VIP",
  "count": 3,
  "customers": [...]
}
```

#### 4. Historial de Compras
```http
GET /api/customers/:id/purchase-history
```

**Respuesta:**
```json
{
  "customer": {...},
  "orders": [...],
  "stats": {
    "totalOrders": 8,
    "totalSpent": 8500.00,
    "avgOrderValue": 1062.50,
    "topProducts": [...]
  }
}
```

#### 5. Sincronizar con Órdenes
```http
POST /api/customers/sync-orders
```

**Respuesta:**
```json
{
  "message": "Sincronización completada",
  "results": {
    "total": 31,
    "success": 28,
    "errors": 3,
    "details": [...]
  }
}
```

#### 6. Re-segmentar Customers
```http
POST /api/customers/resegment
```

**Respuesta:**
```json
{
  "message": "Re-segmentación completada",
  "results": {
    "total": 31,
    "success": 31,
    "changes": {
      "Nuevo -> Ocasional": 5,
      "Ocasional -> Frecuente": 2
    }
  }
}
```

#### 7. CRUD Básico

```http
GET    /api/customers           # Listar todos
GET    /api/customers/:id       # Obtener uno
POST   /api/customers           # Crear
PUT    /api/customers/:id       # Actualizar
DELETE /api/customers/:id       # Eliminar
```

---

## Dashboard Frontend

### Ubicación
**URL:** `/admin/customers`

### Secciones

#### 1. Header
- Título y descripción
- Botones de acción:
  - **Sincronizar Órdenes**: Actualiza métricas desde órdenes
  - **Re-segmentar**: Recalcula segmentos de todos los customers

#### 2. Métricas Generales (Overview Cards)
- Total Customers
- Customers de Alto Valor
- Revenue Total
- Customers en Riesgo

#### 3. Distribución por Segmentos
Tarjetas coloridas para cada segmento:
- **VIP** (Morado): > $5,000 gastados
- **Frecuente** (Verde): 5+ órdenes activas
- **Ocasional** (Azul): 2-4 órdenes
- **Nuevo** (Amarillo): Recién registrados
- **En Riesgo** (Naranja): 30-60 días inactivos
- **Inactivo** (Gris): > 60 días sin actividad

Cada tarjeta muestra:
- Cantidad de customers
- Revenue total del segmento
- LTV promedio

#### 4. Top 5 Customers
Tabla con los mejores clientes por LTV:
- Posición
- Nombre y email
- Código de customer
- Segmento (badge)
- LTV
- Cantidad de órdenes
- Nivel de fidelidad (badge)

#### 5. Recomendaciones de IA
Lista de acciones sugeridas por prioridad:
- **Alta** (Rojo): Acciones urgentes
- **Media** (Amarillo): Oportunidades
- **Baja** (Azul): Mejoras generales

Cada recomendación incluye:
- Segmento afectado
- Situación actual
- Acción recomendada

---

## Sistema de Segmentación

### Criterios de Segmentación

#### 1. VIP (Very Important Person)
**Criterios:**
- LTV > $5,000 O
- Total de órdenes ≥ 10

**Características:**
- Clientes de más alto valor
- Mayor frecuencia de compra
- Recomendación: Atención personalizada, beneficios exclusivos

#### 2. Frecuente
**Criterios:**
- Total de órdenes ≥ 5 Y
- Días desde última orden ≤ 30

**Características:**
- Compran regularmente
- Engagement alto
- Recomendación: Programa de puntos, preventas

#### 3. Ocasional
**Criterios:**
- Total de órdenes entre 2 y 4 O
- (1 orden Y días desde última orden ≤ 60)

**Características:**
- Compran de vez en cuando
- Potencial de crecimiento
- Recomendación: Email marketing, ofertas especiales

#### 4. Nuevo
**Criterios:**
- Total de órdenes = 1 Y días desde última orden ≤ 30 O
- Sin órdenes pero registrado recientemente

**Características:**
- Recién llegados a la plataforma
- En fase de evaluación
- Recomendación: Onboarding, descuento de bienvenida

#### 5. En Riesgo
**Criterios:**
- Días desde última orden entre 30 y 60 Y
- Total de órdenes ≥ 1

**Características:**
- Reducción de actividad
- Riesgo de abandono
- Recomendación: Campaña de reactivación, encuesta

#### 6. Inactivo
**Criterios:**
- Días desde última orden > 60 O
- Nunca ha comprado

**Características:**
- Sin actividad reciente
- Churn completo
- Recomendación: Campaña de recuperación, oferta especial

### Actualización Automática

La segmentación se actualiza automáticamente:
- Al crear/actualizar una orden
- Al ejecutar sincronización manual
- Al llamar endpoint de re-segmentación

---

## Métricas y Análisis

### Métricas por Customer

#### Lifetime Value (LTV)
**Fórmula:** Suma de todas las órdenes válidas (pending, processing, shipped, delivered)

**Uso:**
- Identificar clientes de alto valor
- Priorizar esfuerzos de retención
- Calcular ROI de adquisición

#### Average Order Value (AOV)
**Fórmula:** Total gastado / Número de órdenes

**Uso:**
- Entender comportamiento de compra
- Estrategias de upselling
- Segmentación por ticket promedio

#### Días desde Última Orden
**Cálculo:** Diferencia entre hoy y fecha de última orden

**Uso:**
- Identificar riesgo de churn
- Trigger de campañas de reactivación
- Medir frecuencia de compra

#### Engagement Score
**Rango:** 0-100

**Factores:**
- Frecuencia de visitas
- Interacciones con la plataforma
- Respuesta a emails
- Uso de wishlist

**Uso:**
- Predecir probabilidad de compra
- Personalización de contenido
- Priorización de contactos

### Análisis de Riesgo de Churn

**Niveles:**
- **Alto**: > 60 días sin actividad
- **Medio**: 30-60 días sin actividad
- **Bajo**: < 30 días o activo

**Acciones Recomendadas:**
- Alto: Oferta agresiva de recuperación
- Medio: Email de recordatorio + incentivo
- Bajo: Mantener engagement regular

---

## Sincronización con Órdenes

### Proceso Automático

Cada vez que se crea o actualiza una orden:

1. **Hook en Order Controller**
   - Se ejecuta `syncCustomerAfterOrder(userId, order)`

2. **Creación de Customer (si no existe)**
   - Se crea perfil automáticamente
   - Segmento inicial: "Nuevo"
   - Nivel: "Bronce"

3. **Actualización de Métricas**
   - Total de órdenes
   - Total gastado
   - LTV
   - AOV
   - Fecha última orden

4. **Actualización de Preferencias**
   - Categorías más compradas
   - Marcas favoritas
   - Rango de precio

5. **Re-segmentación**
   - Aplica reglas de segmentación
   - Actualiza segmento si cambió

6. **Actualización de Nivel de Fidelidad**
   - Bronce: $0 - $499
   - Plata: $500 - $1,999
   - Oro: $2,000 - $4,999
   - Platino: $5,000 - $9,999
   - Diamante: $10,000+

### Sincronización Manual

**Cuándo usar:**
- Después de migración de datos
- Para corregir inconsistencias
- Después de cambios en reglas de negocio

**Cómo ejecutar:**

1. **Desde Dashboard:**
   - Click en "Sincronizar Órdenes"

2. **Desde API:**
   ```bash
   POST /api/customers/sync-orders
   ```

3. **Desde Script:**
   ```bash
   npm run test-customer-order
   ```

---

## Scripts y Herramientas

### 1. check-crm-data.js

**Propósito:** Diagnóstico completo del CRM

**Uso:**
```bash
cd backend
node scripts/check-crm-data.js
```

**Información que muestra:**
- Total de usuarios, customers, órdenes
- Lista completa de customers con métricas
- Órdenes recientes
- Recomendaciones de acciones

### 2. test-customer-order-integration.js

**Propósito:** Probar integración Customer/Order

**Uso:**
```bash
npm run test-customer-order
```

**Pruebas que ejecuta:**
- Crear customers faltantes
- Sincronizar todos los customers
- Verificar datos de un customer
- Estadísticas generales
- Top 5 customers

### 3. test-segmentation.js

**Propósito:** Probar sistema de segmentación

**Uso:**
```bash
npm run test-segmentation
```

**Pruebas que ejecuta:**
- Análisis de segmentación
- Customers por segmento
- Re-segmentación global

---

## Guía de Uso

### Para Administradores

#### Acceder al Dashboard
1. Login como admin
2. Navegar a `/admin/customers`
3. Verás el dashboard completo

#### Ver Métricas Generales
- **Total Customers**: Cantidad total de clientes registrados
- **Alto Valor**: Clientes con LTV > $5,000
- **Revenue Total**: Suma de todos los LTV
- **En Riesgo**: Clientes que pueden abandonar

#### Analizar Segmentos
1. Ver tarjetas de distribución
2. Click en un segmento para ver detalles
3. Analizar revenue y LTV promedio
4. Identificar oportunidades

#### Revisar Top Customers
- Ver los 5 mejores clientes por LTV
- Identificar patrones de compra
- Planear estrategias de retención

#### Seguir Recomendaciones
1. Revisar lista de recomendaciones
2. Priorizar por nivel (Alta, Media, Baja)
3. Implementar acciones sugeridas

#### Sincronizar Datos
1. Click en "Sincronizar Órdenes"
2. Esperar confirmación
3. Revisar métricas actualizadas

#### Re-segmentar
1. Click en "Re-segmentar"
2. Ver cambios en segmentación
3. Analizar movimientos de clientes

### Para Desarrolladores

#### Agregar Nuevos Campos al Customer
1. Actualizar `Customer.js` schema
2. Actualizar `customerController.js` si necesario
3. Actualizar frontend en `AdminCustomers.jsx`
4. Ejecutar migración si necesario

#### Modificar Reglas de Segmentación
1. Editar método `autoSegment()` en `Customer.js`
2. Ajustar condiciones según necesidad
3. Probar con `npm run test-segmentation`
4. Ejecutar re-segmentación en producción

#### Agregar Nuevas Métricas
1. Definir cálculo en `Customer.js`
2. Agregar a endpoint de dashboard
3. Actualizar UI en frontend
4. Documentar en esta guía

#### Crear Nuevos Endpoints
1. Agregar función en `customerController.js`
2. Definir ruta en `customerRoutes.js`
3. Proteger con middleware de autenticación
4. Documentar en sección API Endpoints

---

## Próximos Pasos

### Mejoras Planeadas

#### Corto Plazo
- [ ] Exportar datos a CSV/Excel
- [ ] Filtros avanzados en dashboard
- [ ] Gráficos de tendencias
- [ ] Notificaciones por email automáticas

#### Mediano Plazo
- [ ] Campañas de marketing automatizadas
- [ ] Predicción de churn con ML
- [ ] Segmentación por RFM (Recency, Frequency, Monetary)
- [ ] Sistema de cupones personalizados

#### Largo Plazo
- [ ] Customer journey mapping
- [ ] Análisis de cohortes
- [ ] A/B testing de estrategias
- [ ] Integración con sistemas externos (CRM externo, email marketing)

### Optimizaciones Técnicas
- [ ] Caché de métricas en Redis
- [ ] Indexación optimizada en MongoDB
- [ ] Background jobs para sincronización
- [ ] Webhooks para eventos de customer

---

## Soporte y Contacto

**Documentación Relacionada:**
- `CUSTOMER_ORDER_INTEGRATION.md` - Integración con órdenes
- `SEGMENTATION_SYSTEM.md` - Sistema de segmentación detallado
- `CRM_IMPLEMENTATION_SUMMARY.md` - Resumen de implementación

**Mantenimiento:**
- Revisar logs de sincronización regularmente
- Monitorear performance de queries
- Actualizar reglas de segmentación según necesidad del negocio
- Backup regular de la colección `customers`

---

**Última actualización:** Enero 2025  
**Versión:** 1.0.0  
**Autor:** SuperGains Development Team

