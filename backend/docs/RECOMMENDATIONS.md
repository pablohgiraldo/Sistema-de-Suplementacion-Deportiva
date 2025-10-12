# 🎯 Sistema de Recomendaciones - SuperGains

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Algoritmos Implementados](#algoritmos-implementados)
4. [API Endpoints](#api-endpoints)
5. [Estrategias de Recomendación](#estrategias-de-recomendación)
6. [Integración CRM](#integración-crm)
7. [Uso del Sistema](#uso-del-sistema)
8. [Validación y Métricas](#validación-y-métricas)
9. [Configuración](#configuración)
10. [Troubleshooting](#troubleshooting)

---

## Descripción General

El sistema de recomendaciones de SuperGains es una solución de **filtrado colaborativo híbrido** que combina múltiples estrategias para generar recomendaciones personalizadas de productos de suplementación deportiva.

### Características Principales

- ✅ **Filtrado Colaborativo Item-Based**: Recomendaciones basadas en similitud de productos
- ✅ **Filtrado Colaborativo User-Based**: Recomendaciones basadas en usuarios similares
- ✅ **Popularidad Global**: Top productos más vendidos
- ✅ **Segmentación CRM**: Recomendaciones por segmento de cliente
- ✅ **Cross-Sell**: Productos complementarios
- ✅ **Upsell**: Productos premium de mayor valor
- ✅ **Confidence Scoring**: Puntuación de confianza basada en perfil del cliente

### Métricas de Rendimiento

| Métrica | Valor | Status |
|---------|-------|--------|
| Accuracy | 86.67% | ✅ Excelente |
| Precision | 86.67% | ✅ Excelente |
| Recall | 86.67% | ✅ Excelente |
| F1-Score | 86.67% | ✅ Excelente |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AdminCustomerRecommendations.jsx                      │ │
│  │  - Vista de recomendaciones por customer              │ │
│  │  - 5 secciones: Featured, Cross-sell, Upsell, etc.   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Node.js/Express)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  recommendationRoutes.js                               │ │
│  │  GET /api/recommendations/:customerId                 │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │  recommendationController.js                           │ │
│  │  - Maneja requests                                    │ │
│  │  - Valida permisos                                    │ │
│  └───────────────────────┬────────────────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────▼────────────────────────────────┐ │
│  │  recommendationService.js                              │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ • getUserBasedRecommendations()                  │ │ │
│  │  │ • getItemBasedRecommendations()                  │ │ │
│  │  │ • getPopularProducts()                           │ │ │
│  │  │ • getRecommendationsByCategory()                 │ │ │
│  │  │ • getSegmentBasedRecommendations()               │ │ │
│  │  │ • getHybridRecommendations()                     │ │ │
│  │  │ • getCustomerRecommendations()                   │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  └───────────────────────┬────────────────────────────────┘ │
└────────────────────────┬─┴──────────────────────────────────┘
                         │ MongoDB Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Customers   │  │   Orders     │  │  Products    │      │
│  │  - Perfil    │  │  - Historial │  │  - Catálogo  │      │
│  │  - Segmento  │  │  - Items     │  │  - Categorías│      │
│  │  - LTV       │  │  - Patrones  │  │  - Precios   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Algoritmos Implementados

### 1. Filtrado Colaborativo Item-Based

**Objetivo**: Encontrar productos similares basándose en patrones de co-compra.

**Algoritmo**:
```javascript
// Similitud de Jaccard
similarity(A, B) = |A ∩ B| / |A ∪ B|

// Donde:
// A = Set de usuarios que compraron producto A
// B = Set de usuarios que compraron producto B
```

**Implementación**:
```javascript
function jaccardSimilarity(setA, setB) {
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    return intersection.size / union.size;
}
```

**Uso**: Recomendaciones "Productos Similares" y "Cross-Sell"

---

### 2. Filtrado Colaborativo User-Based

**Objetivo**: Recomendar productos que compraron usuarios con gustos similares.

**Proceso**:
1. Obtener historial de compras del usuario
2. Encontrar usuarios con compras similares
3. Identificar productos que compraron usuarios similares
4. Excluir productos ya comprados por el usuario
5. Ordenar por frecuencia y score

**Uso**: Recomendaciones personalizadas principales

---

### 3. Popularidad Global

**Objetivo**: Productos más vendidos globalmente (cold start).

**Cálculo**:
```javascript
popularityScore = (
    (totalSold * 0.4) +
    (uniqueBuyers * 0.3) +
    (avgRating * 0.2) +
    (recencyFactor * 0.1)
)
```

**Uso**: Recomendaciones para usuarios nuevos sin historial

---

### 4. Recomendaciones por Categoría

**Objetivo**: Top productos de categorías específicas.

**Filtros**:
- Categoría del cliente
- Precio dentro del rango típico del usuario
- Stock disponible
- Productos no comprados recientemente

**Uso**: Exploración dirigida por intereses

---

### 5. Segmentación CRM

**Objetivo**: Recomendaciones basadas en el segmento del cliente.

**Segmentos y Estrategias**:

| Segmento | Estrategia |
|----------|------------|
| **VIP** | Productos premium, nuevos lanzamientos, exclusivos |
| **Frecuente** | Cross-sell, bundles, programas de lealtad |
| **Ocasional** | Productos populares, ofertas, incentivos |
| **Nuevo** | Básicos, best-sellers, productos de inicio |
| **Inactivo** | Win-back offers, descuentos, productos nuevos |
| **En Riesgo** | Retención, ofertas personalizadas, engagement |

**Uso**: Personalización avanzada por perfil CRM

---

### 6. Híbrido (Combinación)

**Objetivo**: Combinar múltiples estrategias para maximizar relevancia.

**Pesos**:
```javascript
finalScore = (
    (userBasedScore * 0.30) +
    (itemBasedScore * 0.25) +
    (popularityScore * 0.15) +
    (categoryScore * 0.15) +
    (segmentScore * 0.15)
)
```

**Ventajas**:
- Mayor diversidad
- Mejor cobertura
- Balance entre personalización y exploración

---

## API Endpoints

### GET `/api/recommendations/:customerId`

**Descripción**: Obtiene recomendaciones personalizadas para un customer.

**Autenticación**: Requerida (Bearer Token)

**Permisos**: Admin o el propio customer

**Parámetros de URL**:
- `customerId` (required): ID del customer

**Query Parameters**:
```javascript
{
  limit: number,          // Límite por sección (default: 10)
  includeDetails: boolean // Incluir detalles completos (default: true)
}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": {
    "customer": {
      "_id": "670abcd123456789",
      "customerCode": "CUS-20241012-ABC123",
      "segment": "VIP",
      "loyaltyLevel": "Oro",
      "lifetimeValue": 2500000
    },
    "profile": {
      "totalOrders": 15,
      "categories": ["Proteína", "Creatina", "Pre-Entreno"],
      "brands": ["Optimum Nutrition", "MuscleTech"],
      "avgOrderValue": 166666.67,
      "lastOrderDate": "2024-10-01T00:00:00.000Z"
    },
    "recommendations": {
      "featured": [
        {
          "_id": "prod123",
          "name": "Whey Protein Gold Standard",
          "brand": "Optimum Nutrition",
          "price": 180000,
          "category": "Proteína",
          "imageUrl": "https://...",
          "score": 0.92,
          "reason": "Basado en tu historial de compras y segmento VIP"
        }
      ],
      "crossSell": [
        {
          "_id": "prod456",
          "name": "Creatine Monohydrate",
          "brand": "Optimum Nutrition",
          "price": 85000,
          "category": "Creatina",
          "imageUrl": "https://...",
          "score": 0.88,
          "reason": "Frecuentemente comprado con Whey Protein (41 veces)"
        }
      ],
      "upsell": [
        {
          "_id": "prod789",
          "name": "Isolate Protein Zero",
          "brand": "MuscleTech",
          "price": 220000,
          "category": "Proteína",
          "imageUrl": "https://...",
          "score": 0.85,
          "reason": "Versión premium de tu producto favorito"
        }
      ],
      "similar": [
        {
          "_id": "prod101",
          "name": "Whey Protein Syntha-6",
          "brand": "BSN",
          "price": 195000,
          "category": "Proteína",
          "imageUrl": "https://...",
          "score": 0.82,
          "reason": "Similar a productos que te gustan"
        }
      ],
      "trending": [
        {
          "_id": "prod202",
          "name": "C4 Original Pre-Workout",
          "brand": "Cellucor",
          "price": 125000,
          "category": "Pre-Entreno",
          "imageUrl": "https://...",
          "score": 0.79,
          "reason": "Producto más popular en tu segmento"
        }
      ]
    },
    "confidence": {
      "score": 0.87,
      "level": "high",
      "factors": {
        "hasHistory": true,
        "hasPurchases": true,
        "hasPreferences": true,
        "hasLoyalty": true,
        "isActive": true
      }
    },
    "metadata": {
      "generatedAt": "2024-10-12T03:45:00.000Z",
      "algorithm": "hybrid",
      "version": "1.0"
    }
  }
}
```

**Errores**:
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No tiene permisos
- `404 Not Found`: Customer no encontrado
- `500 Internal Server Error`: Error del servidor

---

## Estrategias de Recomendación

### Featured (Destacados)

**Características**:
- Top 10 productos más relevantes
- Combinación de todos los algoritmos
- Personalizados por perfil completo
- Mayor peso en user-based y segment-based

**Cuándo usar**:
- Página principal de recomendaciones
- Email marketing personalizado
- Dashboard del customer

---

### Cross-Sell (Complementarios)

**Características**:
- Productos que se compran juntos
- Basado en patrones de co-ocurrencia
- Aumenta el ticket promedio
- Enfoque en complementariedad

**Cuándo usar**:
- Carrito de compras
- Página de producto
- Checkout process

**Ejemplos de Patrones**:
```
Proteína → Creatina, Aminoácidos
Pre-Entreno → Aminoácidos, Proteína
Ganadores → Creatina, Proteína
Quemadores → Vitaminas, Proteína
```

---

### Upsell (Premium)

**Características**:
- Productos de mayor valor
- Misma categoría o similar
- Mejor calidad / marca premium
- Enfoque en upgrade

**Cuándo usar**:
- Página de producto (alternativa premium)
- Email post-compra
- Retargeting campaigns

**Criterios**:
```javascript
upsellCriteria = {
  category: same || similar,
  price: customer.avgOrderValue * 1.2 to 1.5,
  brand: premium || preferred,
  features: enhanced
}
```

---

### Similar (Similares)

**Características**:
- Alternativas al producto actual
- Misma categoría
- Rango de precio similar
- Diferentes marcas

**Cuándo usar**:
- Página de producto (alternativas)
- Cuando producto agotado
- Comparación de opciones

---

### Trending (Tendencias)

**Características**:
- Productos populares en el segmento
- Nuevos lanzamientos relevantes
- Productos con alto engagement
- Enfoque en descubrimiento

**Cuándo usar**:
- Exploración de catálogo
- Nuevos usuarios
- Sección "Descubre"

---

## Integración CRM

El sistema de recomendaciones está profundamente integrado con el CRM de SuperGains.

### Datos del CRM Utilizados

```javascript
{
  // Perfil del Customer
  segment: 'VIP' | 'Frecuente' | 'Ocasional' | 'Nuevo' | 'Inactivo' | 'En Riesgo',
  loyaltyLevel: 'Bronce' | 'Plata' | 'Oro' | 'Platino',
  lifetimeValue: number,
  
  // Métricas
  metrics: {
    totalOrders: number,
    totalSpent: number,
    averageOrderValue: number,
    daysSinceLastOrder: number,
    lastOrderDate: Date
  },
  
  // Preferencias
  preferences: {
    categories: string[],
    brands: string[],
    priceRange: { min: number, max: number }
  },
  
  // Riesgo
  churnRisk: 'Bajo' | 'Medio' | 'Alto',
  status: 'Activo' | 'Inactivo'
}
```

### Confidence Score

El **Confidence Score** indica la confiabilidad de las recomendaciones:

```javascript
calculateConfidenceScore(profile) {
  let score = 0.5; // Base score
  let factors = 0;
  
  if (profile.metrics.totalOrders > 0) {
    score += 0.2;
    factors++;
  }
  
  if (profile.preferences.categories.length > 0) {
    score += 0.15;
    factors++;
  }
  
  if (profile.loyaltyLevel !== 'Bronce') {
    score += 0.1;
    factors++;
  }
  
  if (profile.status === 'Activo') {
    score += 0.05;
    factors++;
  }
  
  return Math.min(score, 1.0);
}
```

**Interpretación**:
- `0.8 - 1.0`: High confidence (perfil completo)
- `0.6 - 0.79`: Medium confidence (perfil parcial)
- `0.0 - 0.59`: Low confidence (usuario nuevo/datos limitados)

---

## Uso del Sistema

### Desde el Frontend

```javascript
import recommendationService from '../services/recommendationService';

// Obtener recomendaciones para un customer
const getRecommendations = async (customerId) => {
  try {
    const response = await recommendationService.getCustomerRecommendations(
      customerId,
      { limit: 10 }
    );
    
    console.log('Featured:', response.data.recommendations.featured);
    console.log('Cross-sell:', response.data.recommendations.crossSell);
    console.log('Confidence:', response.data.confidence.score);
    
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Desde el Backend

```javascript
import recommendationService from './services/recommendationService.js';

// Obtener recomendaciones para un customer
const recommendations = await recommendationService.getCustomerRecommendations(
  customerId,
  { limit: 10 }
);

// Obtener solo productos populares
const popular = await recommendationService.getPopularProducts(5);

// Obtener productos similares
const similar = await recommendationService.getItemBasedRecommendations(
  productId,
  5
);
```

### Scripts de Utilidad

```bash
# Generar dataset de prueba
npm run generate-recommendation-dataset

# Validar precisión del sistema
npm run validate-recommendations

# Probar sistema de recomendaciones
npm run test-recommendations

# Probar recomendaciones de un customer específico
npm run test-customer-recommendations
```

---

## Validación y Métricas

### Métricas Principales

El sistema ha sido validado con las siguientes métricas:

| Métrica | Valor | Interpretación |
|---------|-------|----------------|
| **Accuracy** | 86.67% | % de recomendaciones correctas |
| **Precision** | 86.67% | % de relevancia en resultados |
| **Recall** | 86.67% | % de items relevantes encontrados |
| **F1-Score** | 86.67% | Media armónica de precision y recall |

### Patrones Validados

✅ **13 de 15 patrones detectados correctamente**

Top 5 patrones de co-ocurrencia:
1. Proteína + Creatina: 41 veces
2. Proteína + Vitaminas: 25 veces
3. Snacks + Vitaminas: 9 veces
4. Proteína + Snacks: 9 veces
5. Aminoácidos + Proteína: 8 veces

### Ejecutar Validación

```bash
cd backend
npm run validate-recommendations
```

El script generará un reporte completo con:
- Métricas de precisión
- Validación de cross-sell y upsell
- Relevancia por categoría
- Patrones de co-ocurrencia
- Reporte detallado en consola

Ver documentación completa: [`RECOMMENDATION_ACCURACY_METRICS.md`](./RECOMMENDATION_ACCURACY_METRICS.md)

---

## Configuración

### Variables de Entorno

No se requieren variables de entorno adicionales. El sistema usa la configuración existente de MongoDB.

### Parámetros Configurables

En `recommendationService.js`:

```javascript
// Límites por defecto
const DEFAULT_LIMIT = 10;

// Pesos para score híbrido
const WEIGHTS = {
  userBased: 0.30,
  itemBased: 0.25,
  popularity: 0.15,
  category: 0.15,
  segment: 0.15
};

// Umbral de similitud
const SIMILARITY_THRESHOLD = 0.1;

// Días para considerar "reciente"
const RECENT_PURCHASE_DAYS = 30;
```

### Optimización

Para mejor rendimiento:

1. **Índices MongoDB**: Asegurar índices en:
   - `Customer`: `user`, `segment`, `loyaltyLevel`
   - `Order`: `user`, `createdAt`, `status`
   - `Product`: `categories`, `price`, `stock`

2. **Cache**: Considerar implementar cache para:
   - Productos populares (TTL: 1 hora)
   - Patrones de co-ocurrencia (TTL: 24 horas)
   - Recomendaciones por customer (TTL: 30 minutos)

3. **Batch Processing**: Para actualizar patrones:
   - Ejecutar nightly job para recalcular co-ocurrencias
   - Actualizar popularidad semanalmente

---

## Troubleshooting

### Problema: "MissingSchemaError: Schema hasn't been registered"

**Causa**: Model no registrado en Mongoose

**Solución**:
```javascript
// Asegurar imports en orden correcto
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
```

---

### Problema: Recomendaciones vacías

**Causa**: Customer sin historial o datos insuficientes

**Solución**:
1. Verificar que el customer tenga órdenes
2. Verificar confidence score (debe ser > 0.5)
3. Usar popularidad como fallback

```javascript
if (recommendations.featured.length === 0) {
  // Fallback a productos populares
  recommendations.featured = await getPopularProducts(limit);
}
```

---

### Problema: Baja precisión en recomendaciones

**Causa**: Dataset insuficiente o patrones poco claros

**Solución**:
1. Aumentar dataset de entrenamiento
2. Revisar patrones de co-ocurrencia
3. Ajustar pesos del algoritmo híbrido
4. Ejecutar validación:

```bash
npm run validate-recommendations
```

---

### Problema: Timeout en llamadas al servicio

**Causa**: Procesamiento de demasiados datos

**Solución**:
1. Reducir límite de recomendaciones
2. Implementar paginación
3. Agregar cache
4. Optimizar queries MongoDB

```javascript
// Aumentar timeout en frontend
const response = await api.get(`/recommendations/${id}`, {
  timeout: 60000 // 60 segundos
});
```

---

## 📚 Referencias

### Documentación Relacionada

- [CRM Guide](./CRM_GUIDE.md) - Sistema CRM completo
- [Recommendation Accuracy Metrics](./RECOMMENDATION_ACCURACY_METRICS.md) - Métricas de validación
- [API Documentation](./API_DOCS.md) - Documentación completa de APIs

### Scripts Relacionados

- `generate-recommendation-dataset.js` - Genera dataset de prueba
- `validate-recommendation-accuracy.js` - Valida precisión del sistema
- `test-recommendation-system.js` - Pruebas funcionales
- `test-customer-recommendations.js` - Pruebas por customer

### Archivos del Sistema

**Backend**:
- `src/services/recommendationService.js` - Lógica principal
- `src/controllers/recommendationController.js` - Controlador API
- `src/routes/recommendationRoutes.js` - Rutas

**Frontend**:
- `src/services/recommendationService.js` - Cliente API
- `src/pages/AdminCustomerRecommendations.jsx` - Vista admin

---

## 🎓 Conceptos Teóricos

### Filtrado Colaborativo

El **filtrado colaborativo** es una técnica de sistemas de recomendación que hace predicciones sobre los intereses de un usuario recopilando preferencias de muchos usuarios.

**Tipos**:
1. **User-Based**: "Usuarios similares a ti compraron..."
2. **Item-Based**: "Productos similares a los que compraste..."

### Problema del Cold Start

El **cold start problem** ocurre cuando:
- Usuario nuevo sin historial
- Producto nuevo sin ventas
- Sistema nuevo sin datos

**Soluciones implementadas**:
- Popularidad global para usuarios nuevos
- Recomendaciones por categoría
- Segmentación demográfica
- Productos trending

### Similitud de Jaccard

La **similitud de Jaccard** mide la similitud entre dos conjuntos:

```
J(A,B) = |A ∩ B| / |A ∪ B|
```

**Ventajas**:
- Simple y eficiente
- Funciona bien con datos binarios (compró/no compró)
- No requiere ratings

**Desventajas**:
- No considera magnitudes
- Sensible a items muy populares

---

## 📊 Roadmap

### Mejoras Futuras

1. **Machine Learning Avanzado**
   - Matrix Factorization (SVD)
   - Deep Learning (Neural Collaborative Filtering)
   - Gradient Boosting (XGBoost)

2. **Personalización Contextual**
   - Tiempo del día
   - Temporada
   - Eventos especiales
   - Ubicación geográfica

3. **A/B Testing**
   - Diferentes estrategias de recomendación
   - Pesos de algoritmos
   - UI/UX de presentación

4. **Real-Time Updates**
   - Stream processing de compras
   - Actualización incremental de patrones
   - Cache distribuido

5. **Métricas de Negocio**
   - Click-Through Rate (CTR)
   - Conversion Rate
   - Revenue Impact
   - Average Order Value (AOV) uplift

---

## 🤝 Contribuciones

Para contribuir al sistema de recomendaciones:

1. **Crear rama feature**:
   ```bash
   git checkout -b feature/recommendations-improvement
   ```

2. **Ejecutar tests**:
   ```bash
   npm run test-recommendations
   npm run validate-recommendations
   ```

3. **Documentar cambios** en este archivo

4. **Crear Pull Request** con:
   - Descripción del cambio
   - Métricas antes/después
   - Screenshots si aplica

---

## 📝 Changelog

### v1.0.0 (2024-10-12)

- ✅ Implementación inicial del sistema
- ✅ Filtrado colaborativo item-based y user-based
- ✅ Integración con CRM
- ✅ 5 estrategias de recomendación
- ✅ Confidence scoring
- ✅ Validación con 86.67% accuracy
- ✅ API REST completa
- ✅ Frontend admin dashboard
- ✅ Documentación completa

---

**Última actualización**: 2024-10-12  
**Autor**: Equipo de Desarrollo SuperGains  
**Versión**: 1.0.0

