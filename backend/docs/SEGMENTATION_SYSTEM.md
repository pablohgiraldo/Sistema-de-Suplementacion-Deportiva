# Sistema de Segmentación de Customers

## 📋 Resumen

El sistema de segmentación de SuperGains clasifica automáticamente a los customers en 6 categorías basadas en su comportamiento de compra, permitiendo estrategias de marketing y atención personalizadas.

## 🎯 Segmentos Definidos

### 1. VIP 💎
**Criterios:**
- Lifetime Value >= $2,000,000 COP
- Total de órdenes >= 10

**Descripción:** Clientes de máximo valor que generan la mayor parte del revenue. Requieren atención premium y programas de fidelización exclusivos.

**Acciones recomendadas:**
- Atención al cliente prioritaria
- Acceso anticipado a nuevos productos
- Descuentos y promociones exclusivas
- Envío gratuito en todas las compras
- Programa de puntos premium

---

### 2. Frecuente 🔄
**Criterios:**
- Total de órdenes >= 5
- Días desde última orden <= 30

**Descripción:** Compradores regulares y activos. Son la base sólida del negocio.

**Acciones recomendadas:**
- Recomendaciones personalizadas
- Ofertas por volumen
- Programa de referidos
- Newsletter con ofertas especiales
- Incentivos para aumentar ticket promedio

---

### 3. Ocasional 📅
**Criterios:**
- Total de órdenes >= 2
- Días desde última orden <= 90

**Descripción:** Compradores esporádicos pero recientes. Potencial de convertirse en frecuentes.

**Acciones recomendadas:**
- Recordatorios de productos visitados
- Ofertas para aumentar frecuencia
- Encuestas de satisfacción
- Incentivos de repetición de compra

---

### 4. Nuevo 🌱
**Criterios:**
- Total de órdenes = 0

**Descripción:** Usuarios registrados sin historial de compras. Gran oportunidad de conversión.

**Acciones recomendadas:**
- Descuento de bienvenida
- Onboarding personalizado
- Guías de productos
- Email de primera compra
- Soporte proactivo

---

### 5. En Riesgo ⚠️
**Criterios:**
- Días desde última orden > 90 días
- Días desde última orden <= 180 días

**Descripción:** Clientes que no compran hace 3-6 meses. Requieren atención para evitar pérdida.

**Acciones recomendadas:**
- Campaña de reactivación
- Descuentos especiales
- Encuesta "¿por qué no has comprado?"
- Recordatorio de beneficios
- Atención personalizada

---

### 6. Inactivo 💤
**Criterios:**
- Días desde última orden > 180 días

**Descripción:** Clientes sin actividad en más de 6 meses. Requieren campañas agresivas de reactivación.

**Acciones recomendadas:**
- Campaña de reactivación intensiva
- Ofertas irresistibles (50%+ descuento)
- Contenido de valor agregado
- "Te extrañamos" con cupón
- Análisis de causas de abandono

---

## 🔄 Segmentación Automática

### Cómo Funciona

La segmentación se ejecuta automáticamente en los siguientes momentos:

1. **Al crear una orden**: El customer se re-segmenta inmediatamente
2. **Al actualizar estado de orden**: Si cambia a 'delivered' o 'cancelled'
3. **Al guardar customer**: Middleware `pre-save` ejecuta `autoSegment()`
4. **Manualmente**: Via endpoint `/api/customers/resegment`

### Algoritmo de Segmentación

```javascript
function autoSegment() {
    const { totalOrders, daysSinceLastOrder } = this.metrics;

    if (totalOrders === 0) {
        return 'Nuevo';
    } else if (lifetimeValue >= 2000000 && totalOrders >= 10) {
        return 'VIP';
    } else if (totalOrders >= 5 && daysSinceLastOrder <= 30) {
        return 'Frecuente';
    } else if (totalOrders >= 2 && daysSinceLastOrder <= 90) {
        return 'Ocasional';
    } else if (daysSinceLastOrder > 180) {
        return 'Inactivo';
    } else if (daysSinceLastOrder > 90) {
        return 'En Riesgo';
    } else {
        return 'Ocasional';
    }
}
```

## 📊 Endpoints de Segmentación

### 1. Obtener Customers por Segmento
```http
GET /api/customers/segment/:segment
```

**Segmentos válidos:** `VIP`, `Frecuente`, `Ocasional`, `Nuevo`, `Inactivo`, `En Riesgo`

**Query Parameters:**
- `page` (default: 1): Número de página
- `limit` (default: 20): Resultados por página
- `sortBy` (default: 'lifetimeValue'): Campo de ordenamiento
- `order` (default: 'desc'): Dirección del ordenamiento

**Ejemplo:**
```bash
curl GET https://api.supergains.com/api/customers/segment/VIP?page=1&limit=10
```

**Respuesta:**
```json
{
  "success": true,
  "data": [...],
  "stats": {
    "count": 15,
    "avgLifetimeValue": 3500000,
    "totalRevenue": 52500000,
    "avgOrders": 12.5,
    "avgDaysSinceLastOrder": 15
  },
  "pagination": {...},
  "segment": {
    "name": "VIP",
    "description": "Clientes de máximo valor..."
  }
}
```

---

### 2. Análisis de Segmentación
```http
GET /api/customers/segmentation/analysis
```

Obtiene análisis completo con:
- Distribución por segmento
- Porcentajes
- Revenue por segmento
- Actividad reciente
- Recomendaciones automáticas

**Ejemplo:**
```bash
curl GET https://api.supergains.com/api/customers/segmentation/analysis
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "distribution": [
      {
        "segment": "Nuevo",
        "count": 450,
        "percentage": "36.00",
        "avgLifetimeValue": 0,
        "totalRevenue": 0,
        "description": "Sin historial de compras...",
        "revenuePercentage": "0.00"
      },
      {
        "segment": "VIP",
        "count": 15,
        "percentage": "1.20",
        "avgLifetimeValue": 3500000,
        "totalRevenue": 52500000,
        "description": "Clientes de máximo valor...",
        "revenuePercentage": "45.50"
      }
    ],
    "recommendations": [
      {
        "priority": "Alta",
        "segment": "VIP",
        "issue": "15 customers VIP generan 45.50% del revenue",
        "action": "Programa de fidelización exclusivo y atención premium"
      }
    ]
  }
}
```

---

### 3. Re-segmentar Todos los Customers
```http
POST /api/customers/resegment
```

Ejecuta re-segmentación manual de todos los customers. Útil después de:
- Cambios en las reglas de segmentación
- Importación masiva de datos
- Corrección de inconsistencias

**Ejemplo:**
```bash
curl -X POST https://api.supergains.com/api/customers/resegment \
  -H "Authorization: Bearer <admin-token>"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Re-segmentación completada",
  "results": {
    "total": 1250,
    "success": 1247,
    "errors": 3,
    "changes": {
      "Ocasional → En Riesgo": 45,
      "Frecuente → VIP": 5,
      "En Riesgo → Inactivo": 23
    },
    "distribution": {
      "Nuevo": 450,
      "VIP": 20,
      "Frecuente": 180,
      "Ocasional": 350,
      "En Riesgo": 150,
      "Inactivo": 100
    }
  }
}
```

---

### 4. Estadísticas de Segmentos
```http
GET /api/customers/stats/segments
```

Obtiene estadísticas agregadas por segmento (ya existente).

---

## 🧪 Testing

### Script de Prueba
```bash
npm run test-segmentation
```

O directamente:
```bash
node scripts/test-segmentation.js
```

El script verifica:
1. Distribución actual de segmentos
2. Cumplimiento de reglas de segmentación
3. Oportunidades de mejora (near-VIP, at-risk)
4. Contribución de revenue por segmento
5. Análisis de churn risk

### Salida del Test
```
📝 TEST 1: Distribución actual de segmentos
Total de customers activos: 1250

VIP:
  - Cantidad: 15 (1.20%)
  - LTV Promedio: $3,500,000
  - Revenue Total: $52,500,000
  - Órdenes Promedio: 12.50

Frecuente:
  - Cantidad: 180 (14.40%)
  ...
```

---

## 🎯 Casos de Uso

### 1. Campaña de Email para Customers Inactivos
```bash
# Obtener todos los inactivos
GET /api/customers/segment/Inactivo?limit=100

# Usar los datos para enviar emails con cupón de 50% descuento
```

### 2. Programa VIP Exclusivo
```bash
# Obtener todos los VIP
GET /api/customers/segment/VIP

# Asignar beneficios especiales
PUT /api/customers/:id/loyalty-points
```

### 3. Identificar Customers en Riesgo
```bash
# Obtener customers en riesgo
GET /api/customers/segment/En%20Riesgo

# Ejecutar campaña de reactivación
```

### 4. Dashboard de Segmentación
```bash
# Obtener análisis completo
GET /api/customers/segmentation/analysis

# Mostrar en dashboard con gráficos
```

---

## 📈 Métricas Relacionadas

### Riesgo de Abandono (Churn Risk)
Se calcula automáticamente junto con la segmentación:

- **Bajo**: <= 90 días sin comprar
- **Medio**: 91-180 días sin comprar
- **Alto**: > 180 días sin comprar
- **null**: Sin órdenes (customers nuevos)

### Nivel de Fidelidad
Se actualiza automáticamente basado en LTV:

- **Diamante**: >= $5,000,000 COP
- **Platino**: >= $3,000,000 COP
- **Oro**: >= $1,500,000 COP
- **Plata**: >= $500,000 COP
- **Bronce**: < $500,000 COP

---

## 🔍 Recomendaciones del Sistema

El análisis de segmentación genera recomendaciones automáticas:

### Ejemplo de Recomendaciones
```json
{
  "recommendations": [
    {
      "priority": "Alta",
      "segment": "Inactivo",
      "issue": "25% de customers inactivos",
      "action": "Implementar campaña de reactivación con ofertas especiales"
    },
    {
      "priority": "Media",
      "segment": "En Riesgo",
      "issue": "18% de customers en riesgo de abandono",
      "action": "Contactar proactivamente con descuentos personalizados"
    },
    {
      "priority": "Alta",
      "segment": "VIP",
      "issue": "15 customers VIP generan 45.5% del revenue",
      "action": "Programa de fidelización exclusivo y atención premium"
    }
  ]
}
```

### Interpretación
- **Alta prioridad**: Acción inmediata requerida
- **Media prioridad**: Planificar acción en corto plazo
- **Baja prioridad**: Monitorear y considerar

---

## 🚀 Mejores Prácticas

### 1. Monitoreo Regular
- Revisar distribución de segmentos semanalmente
- Identificar cambios significativos
- Actuar sobre recomendaciones del sistema

### 2. Campañas Dirigidas
- Personalizar mensajes por segmento
- Usar datos de preferencias del customer
- Medir resultados por segmento

### 3. Optimización Continua
- Ajustar umbrales si es necesario
- Analizar efectividad de acciones
- Iterar sobre estrategias

### 4. Re-segmentación
- Ejecutar re-segmentación mensual
- Después de campañas masivas
- Al cambiar reglas de negocio

---

## ⚙️ Configuración Avanzada

### Personalizar Umbrales
Para ajustar los umbrales de segmentación, modificar en `backend/src/models/Customer.js`:

```javascript
customerSchema.methods.autoSegment = function() {
    const { totalOrders, daysSinceLastOrder } = this.metrics;

    if (totalOrders === 0) {
        this.segment = 'Nuevo';
    } else if (this.lifetimeValue >= 2500000 && totalOrders >= 12) { // Ajustado
        this.segment = 'VIP';
    }
    // ... más reglas
};
```

### Agregar Nuevos Segmentos
1. Agregar al enum en el schema
2. Implementar lógica en `autoSegment()`
3. Agregar descripción en `getSegmentDescription()`
4. Actualizar documentación

---

## 📊 Análisis de Impacto

### Antes de Segmentación
- Comunicación genérica
- Recursos mal distribuidos
- Pérdida de customers valiosos
- Bajo engagement

### Después de Segmentación
- Mensajes personalizados
- Recursos enfocados en alto valor
- Retención mejorada
- Mayor engagement y conversión

---

## 🔗 Endpoints Relacionados

- `GET /api/customers` - Listar con filtro por segmento
- `GET /api/customers/:id` - Ver segmento individual
- `GET /api/customers/dashboard` - Dashboard general
- `GET /api/customers/high-value` - Customers de alto valor
- `GET /api/customers/churn-risk` - Customers en riesgo

---

## 📝 Notas Técnicas

- La segmentación se ejecuta automáticamente en cada guardado
- Los cambios de segmento se registran en `interactionHistory`
- El sistema es escalable para millones de customers
- Índices optimizados para queries por segmento
- Cache recomendado para análisis de segmentación frecuentes

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0  
**Estado**: Implementado y en producción ✅

