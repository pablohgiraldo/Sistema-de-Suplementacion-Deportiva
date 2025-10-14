# 🔔 Sistema de Webhooks - SuperGains

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Eventos Soportados](#eventos-soportados)
4. [API Endpoints](#api-endpoints)
5. [Seguridad y Firmas](#seguridad-y-firmas)
6. [Crear y Configurar Webhooks](#crear-y-configurar-webhooks)
7. [Recibir Webhooks](#recibir-webhooks)
8. [Automatizaciones](#automatizaciones)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Descripción General

El sistema de webhooks de SuperGains permite notificar automáticamente a sistemas externos cuando ocurren eventos críticos en la plataforma.

### Características Principales

- ✅ **14 eventos soportados** (órdenes, pagos, inventario, usuarios, clientes, alertas)
- ✅ **Firma HMAC-SHA256** para verificación de autenticidad
- ✅ **Reintentos automáticos** (hasta 3 intentos con delay configurable)
- ✅ **Estadísticas completas** (total calls, success rate, last error)
- ✅ **Validación de timestamp** (previene replay attacks)
- ✅ **Headers personalizados** para cada webhook
- ✅ **Estado de webhook** (active, inactive, failed)
- ✅ **Endpoint de prueba** para verificar configuración

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     SuperGains Backend                       │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Evento del Sistema                          │  │
│  │  • order.created                                      │  │
│  │  • payment.approved                                   │  │
│  │  • inventory.low_stock                                │  │
│  │  • etc...                                             │  │
│  └─────────────────────┬─────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      webhookService.triggerEvent()                    │  │
│  │  1. Buscar webhooks suscritos al evento               │  │
│  │  2. Para cada webhook:                                │  │
│  │     - Generar firma HMAC-SHA256                       │  │
│  │     - Enviar HTTP POST                                │  │
│  │     - Reintentar si falla (hasta 3 veces)             │  │
│  │     - Registrar estadísticas                          │  │
│  └─────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼──────────────────────────────────────┘
                         │ HTTP POST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Sistema Externo                             │
│  • Recibe notificación HTTP POST                            │
│  • Valida firma HMAC-SHA256                                 │
│  • Procesa el evento                                        │
│  • Responde 200 OK                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Eventos Soportados

### Eventos de Órdenes

| Evento | Cuándo se dispara | Payload |
|--------|-------------------|---------|
| `order.created` | Al crear una nueva orden | orderId, orderNumber, total, itemCount, customer |
| `order.paid` | Al confirmar el pago | orderId, orderNumber, transactionId, paidAt |
| `order.shipped` | Al marcar como enviada | orderId, orderNumber, status, updatedBy |
| `order.delivered` | Al marcar como entregada | orderId, orderNumber, status, updatedBy |
| `order.cancelled` | Al cancelar una orden | orderId, orderNumber, status, updatedBy |

### Eventos de Pagos

| Evento | Cuándo se dispara | Payload |
|--------|-------------------|---------|
| `payment.approved` | Pago exitoso de PayU | orderId, transactionId, amount, currency, paymentDate |
| `payment.rejected` | Pago rechazado por PayU | orderId, transactionId, responseCode, reason |
| `payment.refunded` | Reembolso procesado | orderId, transactionId, refundAmount, refundedBy, refundDate |

### Eventos de Inventario

| Evento | Cuándo se dispara | Payload |
|--------|-------------------|---------|
| `inventory.low_stock` | Stock bajo el threshold | productId, productName, currentStock, threshold, severity: 'warning' |
| `inventory.out_of_stock` | Stock = 0 | productId, productName, currentStock: 0, severity: 'critical' |
| `inventory.restocked` | Reabastecimiento | productId, quantityRestocked, currentStock, availableStock |

### Eventos de Usuarios y Clientes

| Evento | Cuándo se dispara | Payload |
|--------|-------------------|---------|
| `user.registered` | Nuevo usuario registrado | userId, email, registeredAt |
| `customer.segment_changed` | Cambio de segmento CRM | customerId, oldSegment, newSegment, reason |

### Eventos de Alertas

| Evento | Cuándo se dispara | Payload |
|--------|-------------------|---------|
| `alert.triggered` | Alerta del sistema disparada | alertType, severity, details |

---

## API Endpoints

### 📍 POST `/api/webhooks`

**Descripción**: Crear un nuevo webhook

**Autenticación**: Admin

**Body**:
```json
{
  "name": "Sistema de Notificaciones Externo",
  "url": "https://mi-sistema.com/webhooks/supergains",
  "events": ["order.created", "payment.approved", "inventory.low_stock"],
  "headers": {
    "Authorization": "Bearer mi_token_secreto",
    "X-Custom-Header": "valor"
  }
}
```

**Respuesta (201)**:
```json
{
  "success": true,
  "data": {
    "_id": "670abc123456789",
    "name": "Sistema de Notificaciones Externo",
    "url": "https://mi-sistema.com/webhooks/supergains",
    "events": ["order.created", "payment.approved", "inventory.low_stock"],
    "secret": "a1b2c3d4e5f6...64caracteres", 
    "status": "active",
    "createdBy": "admin_id",
    "createdAt": "2024-10-12T16:00:00.000Z"
  },
  "message": "Webhook creado exitosamente. Guarda el secret de forma segura, no se mostrará de nuevo."
}
```

⚠️ **IMPORTANTE**: El `secret` solo se muestra una vez. Guárdalo de forma segura.

---

### 📍 GET `/api/webhooks`

**Descripción**: Listar todos los webhooks

**Autenticación**: Admin

**Query Params**:
- `status` (opcional): Filtrar por estado (active, inactive, failed)
- `event` (opcional): Filtrar por evento

**Respuesta (200)**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "670abc123",
      "name": "Sistema Externo",
      "url": "https://...",
      "events": ["order.created", "payment.approved"],
      "status": "active",
      "statistics": {
        "totalCalls": 145,
        "successfulCalls": 142,
        "failedCalls": 3,
        "lastCallAt": "2024-10-12T15:30:00.000Z",
        "lastSuccessAt": "2024-10-12T15:30:00.000Z"
      },
      "successRate": "97.93",
      "createdAt": "2024-10-01T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 📍 POST `/api/webhooks/:id/test`

**Descripción**: Enviar evento de prueba a un webhook

**Autenticación**: Admin

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Webhook de prueba enviado exitosamente",
  "data": {
    "url": "https://mi-sistema.com/webhooks/supergains",
    "sent": true
  }
}
```

---

### 📍 GET `/api/webhooks/stats`

**Descripción**: Obtener estadísticas globales de webhooks

**Autenticación**: Admin

**Respuesta (200)**:
```json
{
  "success": true,
  "data": {
    "byStatus": [
      {
        "_id": "active",
        "count": 3,
        "totalCalls": 450,
        "successfulCalls": 442,
        "failedCalls": 8
      }
    ],
    "byEvent": [
      {
        "_id": "order.created",
        "webhookCount": 2
      },
      {
        "_id": "payment.approved",
        "webhookCount": 3
      }
    ],
    "totalWebhooks": 3
  }
}
```

---

### 📍 PUT `/api/webhooks/:id`

**Descripción**: Actualizar un webhook

**Autenticación**: Admin

**Body** (todos los campos son opcionales):
```json
{
  "name": "Nuevo nombre",
  "url": "https://nueva-url.com/webhook",
  "events": ["order.paid", "payment.approved"],
  "headers": { "Authorization": "Bearer nuevo_token" },
  "status": "inactive"
}
```

---

### 📍 DELETE `/api/webhooks/:id`

**Descripción**: Eliminar un webhook

**Autenticación**: Admin

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Webhook eliminado exitosamente"
}
```

---

### 📍 POST `/api/webhooks/receive/:event`

**Descripción**: Recibir webhook de sistema externo (endpoint público)

**Headers requeridos**:
```
X-Webhook-Signature: firma_hmac_sha256
X-Webhook-Timestamp: timestamp_en_milisegundos
X-Webhook-Id: id_del_webhook
```

**Body**:
```json
{
  "cualquier": "dato",
  "custom": "para tu sistema"
}
```

**Respuesta (200)**:
```json
{
  "success": true,
  "message": "Webhook recibido y procesado",
  "event": "custom.event",
  "receivedAt": "2024-10-12T16:00:00.000Z"
}
```

---

## Seguridad y Firmas

### Algoritmo HMAC-SHA256

Todos los webhooks incluyen una firma HMAC-SHA256 para verificar autenticidad:

```javascript
// Generar firma (backend envía)
const timestamp = Date.now();
const data = timestamp + '.' + JSON.stringify(payload);
const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
```

### Headers de Seguridad

Cada webhook enviado incluye:

```
X-Webhook-Event: payment.approved
X-Webhook-Signature: a1b2c3d4e5f6...
X-Webhook-Timestamp: 1697123456789
User-Agent: SuperGains-Webhook/1.0
```

### Validaciones Implementadas

1. ✅ **Firma HMAC-SHA256** - Verifica que proviene de SuperGains
2. ✅ **Timestamp expirado** - Rechaza webhooks con más de 5 minutos
3. ✅ **Timestamp futuro** - Rechaza timestamps en el futuro
4. ✅ **Timing-safe comparison** - Previene timing attacks
5. ✅ **Webhook activo** - Solo envía a webhooks con status 'active'

### Verificar Firma (En tu Sistema)

```javascript
const crypto = require('crypto');

function verifyWebhook(req) {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const secret = 'tu_secret_guardado'; // Del response al crear webhook
  
  // Validar timestamp (no más de 5 minutos)
  const age = Date.now() - parseInt(timestamp);
  if (age > 5 * 60 * 1000 || age < 0) {
    return false; // Expirado o futuro
  }
  
  // Generar firma esperada
  const data = timestamp + '.' + JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
  
  // Comparar firmas
  return signature === expectedSignature;
}

// En tu endpoint
app.post('/webhooks/supergains', (req, res) => {
  if (!verifyWebhook(req)) {
    return res.status(401).json({ error: 'Firma inválida' });
  }
  
  // Procesar evento
  const { event, data } = req.body;
  console.log(`Evento recibido: ${event}`, data);
  
  res.status(200).json({ received: true });
});
```

---

## Crear y Configurar Webhooks

### 1. Crear Webhook (API)

```bash
curl -X POST http://localhost:4000/api/webhooks \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mi Sistema",
    "url": "https://mi-sistema.com/webhooks",
    "events": ["order.created", "payment.approved"]
  }'
```

**Guardar el secret**: Se muestra solo una vez en la respuesta.

### 2. Listar Webhooks

```bash
curl http://localhost:4000/api/webhooks \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. Probar Webhook

```bash
curl -X POST http://localhost:4000/api/webhooks/WEBHOOK_ID/test \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Esto envía un evento de prueba:
```json
{
  "event": "test.event",
  "timestamp": "2024-10-12T16:00:00.000Z",
  "data": {
    "message": "Este es un evento de prueba",
    "webhookId": "...",
    "webhookName": "..."
  }
}
```

### 4. Actualizar Webhook

```bash
curl -X PUT http://localhost:4000/api/webhooks/WEBHOOK_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "inactive"
  }'
```

---

## Recibir Webhooks

### Estructura del Payload

Todos los webhooks tienen esta estructura:

```json
{
  "event": "payment.approved",
  "timestamp": "2024-10-12T16:00:00.000Z",
  "data": {
    // Datos específicos del evento
  }
}
```

### Ejemplos de Payloads

#### payment.approved

```json
{
  "event": "payment.approved",
  "timestamp": "2024-10-12T16:00:00.000Z",
  "data": {
    "orderId": "670abc123456789",
    "orderNumber": "ORD-20241012-ABC123",
    "transactionId": "abc123-def456-789",
    "amount": 155000,
    "currency": "COP",
    "paymentDate": "2024-10-12T16:00:00.000Z",
    "customer": {
      "userId": "user123",
      "email": "cliente@example.com"
    }
  }
}
```

#### inventory.low_stock

```json
{
  "event": "inventory.low_stock",
  "timestamp": "2024-10-12T16:00:00.000Z",
  "data": {
    "productId": "prod123",
    "productName": "Whey Protein Gold Standard",
    "productBrand": "Optimum Nutrition",
    "currentStock": 3,
    "threshold": 5,
    "alertType": "low_stock",
    "severity": "warning",
    "inventoryId": "inv123",
    "alertedAt": "2024-10-12T16:00:00.000Z"
  }
}
```

#### order.delivered

```json
{
  "event": "order.delivered",
  "timestamp": "2024-10-12T16:00:00.000Z",
  "data": {
    "orderId": "670abc123",
    "orderNumber": "ORD-20241012-ABC123",
    "status": "Entregada",
    "updatedBy": "admin_id",
    "updatedAt": "2024-10-12T16:00:00.000Z"
  }
}
```

---

## Automatizaciones

El sistema incluye automatizaciones que disparan webhooks automáticamente:

### OrderAutomationScheduler

**Frecuencia**: Cada 60 minutos

**Tareas**:

1. **Auto-entrega** (después de 7 días):
   - Busca órdenes con estado `shipped` y `shippedAt` hace +7 días
   - Marca automáticamente como `delivered`
   - Dispara webhook `order.delivered` con `autoDelivered: true`

2. **Auto-cancelación** (después de 24 horas):
   - Busca órdenes con estado `pending` y `paymentStatus: pending` hace +24 horas
   - Cancela automáticamente
   - Dispara webhook `order.cancelled` con `autoCancelled: true`

### SimpleAlertScheduler

**Frecuencia**: Cada 5 minutos

**Tareas**:

1. **Verificar stock bajo**:
   - Busca productos con stock < threshold
   - Envía email al admin
   - Dispara webhook `inventory.low_stock`

2. **Verificar stock agotado**:
   - Busca productos con stock = 0
   - Envía email al admin
   - Dispara webhook `inventory.out_of_stock`

### Transición Automática de Estado

Cuando un pago es confirmado:
```
Order: pending + Payment: paid
    ↓
Auto-transición
    ↓
Order: processing + Webhook: order.paid
```

---

## Testing

### Script de Pruebas de Firmas

```bash
cd backend
npm run test-webhook-signatures
```

**Pruebas incluidas**:
- ✅ Generación de firma HMAC-SHA256
- ✅ Verificación de firma válida
- ✅ Detección de firma inválida
- ✅ Detección de timestamp expirado
- ✅ Detección de timestamp futuro

**Salida esperada**:
```
🔐 PRUEBAS DE VALIDACIÓN DE FIRMAS DE WEBHOOKS
======================================================================
📝 Test 1: Generación de firma HMAC-SHA256
   ✅ Firma HMAC-SHA256 generada correctamente

📝 Test 2: Verificación de firma válida
   ✅ Verificación de firma válida funciona correctamente

📝 Test 3: Detección de firma inválida
   ✅ Detección de firma inválida funciona correctamente

📝 Test 4: Detección de timestamp expirado
   ✅ Detección de timestamp expirado funciona correctamente

📝 Test 5: Detección de timestamp futuro
   ✅ Detección de timestamp futuro funciona correctamente

======================================================================
✅ Todas las pruebas de firma completadas
```

### Probar Webhook Manualmente

#### 1. Crear un webhook de prueba

Puedes usar webhook.site para recibir webhooks:

1. Ve a https://webhook.site
2. Copia tu URL única (ej: `https://webhook.site/abc-def-123`)
3. Crear webhook:

```bash
curl -X POST http://localhost:4000/api/webhooks \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Webhook de Prueba",
    "url": "https://webhook.site/tu-url-unica",
    "events": ["order.created", "payment.approved"]
  }'
```

4. Guarda el `secret` de la respuesta

#### 2. Disparar un evento

Crea una orden o realiza un pago desde el frontend.

#### 3. Ver el webhook en webhook.site

Verás el POST con:
- Headers (X-Webhook-Event, X-Webhook-Signature, X-Webhook-Timestamp)
- Body con el evento y datos

---

## Troubleshooting

### ❌ Error: "Header X-Webhook-Signature faltante"

**Causa**: No se envió el header de firma

**Solución**: Asegúrate de incluir todos los headers requeridos:
```
X-Webhook-Signature: firma_hmac
X-Webhook-Timestamp: timestamp
X-Webhook-Id: id_webhook
```

---

### ❌ Error: "Firma de webhook inválida"

**Causa**: La firma no coincide con la esperada

**Solución**:
1. Verifica que estés usando el `secret` correcto (el que te dieron al crear el webhook)
2. Verifica el algoritmo de firma:
   ```javascript
   const data = timestamp + '.' + JSON.stringify(payload);
   const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
   ```
3. Asegúrate de usar el `timestamp` exacto del header
4. No modifiques el `payload` antes de verificar

---

### ❌ Error: "Webhook expirado (timestamp muy antiguo)"

**Causa**: El timestamp tiene más de 5 minutos

**Solución**:
1. Genera el timestamp justo antes de enviar el webhook
2. Asegúrate de que el reloj del sistema esté sincronizado

---

### ⚠️ Webhook no se envía

**Causa**: Webhook está en estado `inactive` o `failed`

**Solución**:
1. Verifica el estado del webhook:
   ```bash
   curl http://localhost:4000/api/webhooks/WEBHOOK_ID \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

2. Si está `failed`, reactívalo:
   ```bash
   curl -X PUT http://localhost:4000/api/webhooks/WEBHOOK_ID \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"status": "active"}'
   ```

---

### ❌ Webhook falla repetidamente

**Causa**: URL no accesible o responde con error

**Solución**:
1. Verifica que la URL sea accesible desde el servidor
2. Verifica los logs del webhook:
   ```json
   {
     "statistics": {
       "lastError": "Error: connect ECONNREFUSED",
       "lastFailureAt": "2024-10-12T15:30:00.000Z"
     }
   }
   ```
3. Prueba el webhook manualmente con `POST /:id/test`

**Auto-desactivación**:
- Si un webhook tiene >80% de fallos y >10 intentos, se marca automáticamente como `failed`

---

## Mejores Prácticas

### 1. Responder Rápidamente

Tu endpoint debe responder en < 5 segundos:

```javascript
app.post('/webhook', (req, res) => {
  // Responder inmediatamente
  res.status(200).json({ received: true });
  
  // Procesar en background
  processWebhookAsync(req.body);
});
```

### 2. Validar Siempre la Firma

```javascript
// ❌ MAL
app.post('/webhook', (req, res) => {
  processEvent(req.body); // Sin validar
});

// ✅ BIEN
app.post('/webhook', (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).json({ error: 'Firma inválida' });
  }
  processEvent(req.body);
});
```

### 3. Idempotencia

Procesa el mismo evento múltiples veces de forma segura:

```javascript
const processedEvents = new Set();

app.post('/webhook', (req, res) => {
  const eventId = req.body.data.orderId;
  
  if (processedEvents.has(eventId)) {
    return res.status(200).json({ message: 'Ya procesado' });
  }
  
  processEvent(req.body);
  processedEvents.add(eventId);
  
  res.status(200).json({ received: true });
});
```

### 4. Logs y Monitoreo

Registra todos los webhooks recibidos:

```javascript
app.post('/webhook', (req, res) => {
  console.log(`[${new Date().toISOString()}] Webhook: ${req.body.event}`);
  console.log('Data:', JSON.stringify(req.body.data, null, 2));
  
  // Procesar...
  
  res.status(200).json({ received: true });
});
```

---

## Casos de Uso

### 1. Notificar Sistema de CRM Externo

**Escenario**: Sincronizar órdenes con Salesforce/HubSpot

**Webhooks a suscribir**:
- `order.created`
- `order.paid`
- `customer.segment_changed`

**Implementación**:
```javascript
// En tu CRM externo
app.post('/webhooks/supergains', async (req, res) => {
  const { event, data } = req.body;
  
  switch(event) {
    case 'order.created':
      await crm.createDeal(data);
      break;
    case 'order.paid':
      await crm.updateDeal(data.orderId, { status: 'Won' });
      break;
    case 'customer.segment_changed':
      await crm.updateContact(data.customerId, { segment: data.newSegment });
      break;
  }
  
  res.status(200).json({ received: true });
});
```

---

### 2. Sistema de Alertas Externo (Slack/Discord)

**Escenario**: Notificar al equipo sobre inventario crítico

**Webhooks a suscribir**:
- `inventory.out_of_stock`
- `inventory.low_stock`

**Implementación**:
```javascript
// Enviar a Slack
app.post('/webhooks/supergains', async (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'inventory.out_of_stock') {
    await axios.post(SLACK_WEBHOOK_URL, {
      text: `🚨 STOCK AGOTADO: ${data.productName}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Producto', value: data.productName },
          { title: 'Marca', value: data.productBrand },
          { title: 'Stock', value: data.currentStock }
        ]
      }]
    });
  }
  
  res.status(200).json({ received: true });
});
```

---

### 3. Analytics y Reporting

**Escenario**: Enviar métricas a Google Analytics/Mixpanel

**Webhooks a suscribir**:
- `order.paid`
- `payment.approved`

**Implementación**:
```javascript
app.post('/webhooks/supergains', async (req, res) => {
  const { event, data } = req.body;
  
  if (event === 'order.paid') {
    await analytics.track('Order Paid', {
      orderId: data.orderId,
      revenue: data.total,
      transactionId: data.transactionId
    });
  }
  
  res.status(200).json({ received: true });
});
```

---

## Estadísticas y Monitoreo

### Métricas por Webhook

```javascript
{
  "statistics": {
    "totalCalls": 150,           // Total de envíos
    "successfulCalls": 145,      // Exitosos (200 OK)
    "failedCalls": 5,            // Fallidos
    "lastCallAt": "...",         // Último intento
    "lastSuccessAt": "...",      // Último éxito
    "lastFailureAt": "...",      // Último fallo
    "lastError": "ECONNREFUSED"  // Último error
  },
  "successRate": "96.67"         // Tasa de éxito
}
```

### Endpoint de Estadísticas

```bash
curl http://localhost:4000/api/webhooks/stats \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Políticas de Reintento

### Configuración por Webhook

```json
{
  "retryPolicy": {
    "maxRetries": 3,      // Intentos máximos
    "retryDelay": 5000    // Delay en ms (5 segundos)
  }
}
```

### Comportamiento de Reintentos

```
Intento 1: Falla
  ↓
Espera 5 segundos
  ↓
Intento 2: Falla
  ↓
Espera 5 segundos
  ↓
Intento 3: Falla
  ↓
Marca como failed (si tasa de error > 80%)
```

---

## Códigos de Respuesta

Tu endpoint debe responder con:

| Código | Significado | Reintenta |
|--------|-------------|-----------|
| `200` | Éxito | No |
| `201` | Creado | No |
| `204` | Sin contenido | No |
| `4xx` | Error del cliente | No |
| `500` | Error del servidor | Sí |
| `502` | Bad Gateway | Sí |
| `503` | Servicio no disponible | Sí |
| `504` | Gateway Timeout | Sí |

---

## Seguridad Adicional

### 1. IP Whitelisting

Limita qué IPs pueden recibir webhooks:

```javascript
app.post('/webhook', (req, res) => {
  const allowedIPs = ['xxx.xxx.xxx.xxx']; // IP del servidor SuperGains
  const clientIP = req.ip;
  
  if (!allowedIPs.includes(clientIP)) {
    return res.status(403).json({ error: 'IP no autorizada' });
  }
  
  // Procesar webhook...
});
```

### 2. Rate Limiting

Limita webhooks por minuto:

```javascript
const rateLimit = require('express-rate-limit');

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100 // 100 webhooks por minuto
});

app.post('/webhook', webhookLimiter, handleWebhook);
```

### 3. Verificación de Origen

Verifica que el webhook provenga de SuperGains:

```javascript
app.post('/webhook', (req, res) => {
  const userAgent = req.headers['user-agent'];
  
  if (!userAgent || !userAgent.includes('SuperGains-Webhook')) {
    return res.status(403).json({ error: 'User-Agent inválido' });
  }
  
  // Procesar webhook...
});
```

---

## Límites y Restricciones

- **Timeout**: 10 segundos por request
- **Tamaño del payload**: Máx 1MB
- **Reintentos**: Máx 3 intentos
- **Webhooks por evento**: Sin límite
- **Eventos por webhook**: Sin límite
- **Timestamp válido**: Máx 5 minutos de antigüedad

---

## Roadmap

### Mejoras Futuras

1. **Webhooks Síncronos**
   - Esperar respuesta del sistema externo
   - Actuar según respuesta (ej: cancelar orden si external system dice "out of stock")

2. **Filtros Avanzados**
   - Solo eventos de ciertos productos
   - Solo órdenes > cierto monto
   - Solo clientes VIP

3. **Transformación de Datos**
   - Mapear campos según necesidades del sistema externo
   - Formato personalizado (JSON, XML, etc.)

4. **Webhooks Batch**
   - Agrupar múltiples eventos en una sola petición
   - Reducir cantidad de requests

5. **Dashboard de Webhooks**
   - UI para gestionar webhooks
   - Ver logs en tiempo real
   - Gráficas de success rate

---

## 📚 Referencias

- [Webhook Best Practices](https://docs.github.com/en/developers/webhooks-and-events/webhooks/best-practices-for-webhooks)
- [HMAC Signatures](https://www.okta.com/identity-101/hmac/)
- [Webhook Security](https://stripe.com/docs/webhooks/best-practices)

---

**Última actualización**: 2024-10-12  
**Autor**: Equipo de Desarrollo SuperGains  
**Versión**: 1.0.0

