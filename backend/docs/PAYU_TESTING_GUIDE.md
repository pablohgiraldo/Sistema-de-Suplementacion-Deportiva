# 🧪 Guía de Pruebas con PayU Sandbox - SuperGains

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Pruebas Automatizadas](#pruebas-automatizadas)
3. [Pruebas Manuales (Frontend)](#pruebas-manuales-frontend)
4. [Tarjetas de Prueba](#tarjetas-de-prueba)
5. [Escenarios de Prueba](#escenarios-de-prueba)
6. [Verificación de Resultados](#verificación-de-resultados)
7. [Troubleshooting](#troubleshooting)

---

## Configuración Inicial

### 1. Verificar variables de entorno

Asegúrate de que tu archivo `.env` tenga las credenciales de **sandbox**:

```env
# PayU Sandbox (Pruebas)
PAYU_MERCHANT_ID=508029
PAYU_API_KEY=4Vj8eK4rloUd272L48hsrarnUA
PAYU_API_LOGIN=pRRXKOl8ikMmt9u
PAYU_ACCOUNT_ID=512321

# URLs locales
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Iniciar los servidores

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

---

## Pruebas Automatizadas

### Script de Prueba de Integración

```bash
cd backend
npm run test-payu-sandbox
```

Este script verifica:
- ✅ Configuración de PayU
- ✅ Generación de firma MD5
- ✅ Creación de órdenes de prueba
- ✅ Generación de formularios de pago
- ✅ Estructura de transacciones

**Salida esperada**:

```
🧪 PRUEBAS DE INTEGRACIÓN CON PAYU SANDBOX

======================================================================
✅ MongoDB conectado

📝 Test 1: Verificando configuración de PayU Sandbox
----------------------------------------------------------------------
   ✅ PAYU_MERCHANT_ID: 508029
   ✅ PAYU_API_KEY: 4Vj8eK4rloUd272L48hsrarnUA
   ✅ PAYU_API_LOGIN: pRRXKOl8ikMmt9u
   ✅ PAYU_ACCOUNT_ID: 512321

   Variables configuradas: 4/4
   ✅ Configuración completa

📝 Test 2: Probando generación de firma MD5
----------------------------------------------------------------------
   Caso: TEST-ORDER-123
   Monto: $150000 COP
   Firma generada: abc123def456...
   ✅ Firma generada correctamente

📝 Test 3: Creando orden de prueba
----------------------------------------------------------------------
   ✅ Orden de prueba creada: ORD-20241012-ABC123
   User: admin@test.com
   Items: 2
   Total: $155,000
   ID: 670abc123456789

📝 Test 4: Generando formulario de pago
----------------------------------------------------------------------
   ✅ Formulario generado exitosamente
   URL: https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/
   Merchant ID: 508029
   Account ID: 512321
   Reference Code: 670abc123456789
   Amount: $155000
   Signature: abc123def456...
   Test Mode: 1
   ✅ Información de pago guardada en la orden

======================================================================
✅ Todas las pruebas completadas
```

---

## Pruebas Manuales (Frontend)

### Flujo Completo de Pago

#### Paso 1: Agregar productos al carrito

1. Abre `http://localhost:5173`
2. Login con usuario de prueba
3. Agrega 1-2 productos al carrito
4. Ve al carrito

#### Paso 2: Hacer checkout

1. Click en "Proceder al Checkout"
2. Completa los datos de envío:
   ```
   Nombre: Juan
   Apellido: Pérez
   Dirección: Calle 123 # 45-67
   Ciudad: Bogotá
   Departamento: Cundinamarca
   Código Postal: 110111
   Teléfono: 3001234567
   ```
3. Selecciona método de pago: "Tarjeta de Crédito"
4. Click en "Confirmar Orden"

#### Paso 3: Ir a PayU Sandbox

El sistema debe redirigirte a:
```
https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/
```

Verás un formulario de pago de PayU con:
- Descripción de la orden
- Monto total
- Opciones de pago

#### Paso 4: Completar el pago en PayU

**Para pago con tarjeta**:

1. Selecciona "Tarjeta de crédito"
2. Ingresa datos de tarjeta de prueba (ver tabla abajo)
3. Completa información del tarjetahabiente
4. Click en "Pagar"

**Para pago con PSE**:

1. Selecciona "PSE"
2. Selecciona "Banco de prueba"
3. Ingresa datos ficticios
4. Click en "Pagar"

#### Paso 5: Ver confirmación

PayU te redirigirá a:
```
http://localhost:5173/payment-confirmation?ref=ORDER_ID&state=4&...
```

Verás la página de confirmación con:
- ✅ Icono de estado (verde/rojo/amarillo)
- Mensaje del resultado
- Detalles de la orden
- Botones de acción

---

## Tarjetas de Prueba

### Tarjetas Aprobadas (Sandbox)

| Banco/Marca | Número | CVV | Fecha | Resultado |
|-------------|--------|-----|-------|-----------|
| **Visa** | `4097440000000004` | `123` | `12/25` | ✅ Aprobada |
| **Visa** | `4111111111111111` | `123` | `12/25` | ✅ Aprobada |
| **Mastercard** | `5500000000000004` | `123` | `12/25` | ✅ Aprobada |
| **Mastercard** | `5424000000000015` | `123` | `12/25` | ✅ Aprobada |
| **American Express** | `377813000000001` | `1234` | `12/25` | ✅ Aprobada |
| **Diners** | `36032400000007` | `123` | `12/25` | ✅ Aprobada |

### Tarjetas Rechazadas (Sandbox)

| Banco/Marca | Número | CVV | Fecha | Resultado |
|-------------|--------|-----|-------|-----------|
| **Visa** | `4097440000000012` | `123` | `12/25` | ❌ Fondos insuficientes |
| **Mastercard** | `5424000000000023` | `123` | `12/25` | ❌ Transacción no permitida |
| **Visa** | `4097440000000020` | `123` | `12/25` | ❌ Tarjeta vencida |

### Datos Adicionales (Cualquier valor funciona)

- **CVV**: `123` (o `1234` para Amex)
- **Fecha de expiración**: `12/25` (cualquier fecha futura)
- **Nombre**: `Juan Pérez` (cualquier nombre)
- **Documento**: `123456789` (cualquier número)
- **Email**: `test@test.com`

---

## Escenarios de Prueba

### ✅ Escenario 1: Pago Exitoso

**Objetivo**: Verificar flujo completo de pago aprobado

**Pasos**:
1. Crear orden desde el frontend
2. Usar tarjeta `4097440000000004`
3. Completar pago en PayU
4. Verificar redirección a `/payment-confirmation?state=4`
5. Verificar mensaje "¡Pago Exitoso!"
6. Verificar que la orden cambió a estado "processing"
7. Verificar que el inventario se descontó

**Verificación en BD**:
```javascript
// En MongoDB o usando script
const order = await Order.findOne({ orderNumber: 'ORD-...' });
console.log(order.paymentStatus);        // 'paid'
console.log(order.status);                // 'processing'
console.log(order.paymentDetails.transactionId); // ID de PayU
console.log(order.paymentLogs.length);    // >= 2 (initiation + approved)
```

---

### ❌ Escenario 2: Pago Rechazado

**Objetivo**: Verificar manejo de pago rechazado

**Pasos**:
1. Crear orden desde el frontend
2. Usar tarjeta `4097440000000012` (fondos insuficientes)
3. Intentar completar pago en PayU
4. Verificar redirección a `/payment-confirmation?state=6`
5. Verificar mensaje "Pago Rechazado"
6. Click en "Intentar Nuevamente"
7. Verificar que vuelve al carrito

**Verificación en BD**:
```javascript
const order = await Order.findOne({ orderNumber: 'ORD-...' });
console.log(order.paymentStatus);        // 'failed'
console.log(order.status);                // 'pending'
console.log(order.paymentLogs);           // Log de rechazo
```

---

### ⏰ Escenario 3: Pago Pendiente (PSE)

**Objetivo**: Verificar manejo de pago pendiente

**Pasos**:
1. Crear orden desde el frontend
2. Seleccionar "PSE" como método de pago
3. Seleccionar "Banco de prueba"
4. Completar datos ficticios
5. Verificar redirección a `/payment-confirmation?state=7`
6. Verificar mensaje "Pago Pendiente"

**Verificación en BD**:
```javascript
const order = await Order.findOne({ orderNumber: 'ORD-...' });
console.log(order.paymentStatus);        // 'pending'
console.log(order.status);                // 'pending'
```

---

### 🔄 Escenario 4: Prevenir Transacciones Duplicadas

**Objetivo**: Verificar que no se pueda pagar dos veces la misma orden

**Pasos**:
1. Crear orden y completar pago exitosamente
2. Intentar pagar la misma orden nuevamente
3. Verificar que el sistema bloquea la segunda transacción

**Respuesta esperada**:
```json
{
  "success": false,
  "error": "Esta orden ya fue pagada",
  "paymentDetails": {
    "transactionId": "...",
    "paymentDate": "..."
  }
}
```

---

### 🔙 Escenario 5: Reembolso (Admin)

**Objetivo**: Verificar proceso de reembolso

**Pasos**:
1. Crear y pagar una orden
2. Login como admin
3. Ir a `/admin/orders`
4. Seleccionar la orden pagada
5. Click en "Reembolsar"
6. Confirmar reembolso

**Verificación en BD**:
```javascript
const order = await Order.findOne({ orderNumber: 'ORD-...' });
console.log(order.paymentStatus);        // 'refunded'
console.log(order.refundAmount);          // monto reembolsado
console.log(order.paymentLogs);           // Log de reembolso
```

---

## Verificación de Resultados

### 1. Verificar en MongoDB

```javascript
// Buscar orden por número
db.orders.findOne({ orderNumber: "ORD-20241012-ABC123" })

// Verificar detalles de pago
{
  paymentStatus: "paid",
  paymentDetails: {
    transactionId: "abc123-def456",
    payuOrderId: "789012",
    payuReferenceCode: "670abc123",
    payuResponseCode: "APPROVED",
    amountPaid: 155000,
    currency: "COP",
    paymentDate: ISODate("2024-10-12T...")
  },
  paymentLogs: [
    {
      timestamp: ISODate("2024-10-12T..."),
      action: "payment_initiated",
      details: { ... },
      source: "system"
    },
    {
      timestamp: ISODate("2024-10-12T..."),
      action: "payment_approved",
      details: { ... },
      source: "payu"
    }
  ]
}
```

### 2. Verificar en Logs del Servidor

Busca estos mensajes en la consola del backend:

```
📤 Creando transacción PayU: 670abc123456789 por $155000 COP
✅ Transacción PayU creada: abc123-def456-789
📥 Confirmación PayU recibida: 670abc123456789 - Estado: 4
✅ Firma de PayU validada correctamente
✅ Orden ORD-20241012-ABC123 marcada como PAGADA (PayU)
   Transaction ID: abc123-def456-789
   Monto: $155000 COP
   📦 Inventario actualizado: 1 unidades descontadas
```

### 3. Verificar en el Panel de PayU

1. Ve a [Panel de Comercios PayU - Sandbox](https://merchants.payulatam.com/)
2. Login con tus credenciales
3. Click en "Transacciones"
4. Busca tu transacción por referencia o monto
5. Verifica detalles: estado, monto, método de pago

---

## Escenarios de Prueba

### ✅ Checklist de Pruebas

- [ ] **P1**: Pago exitoso con Visa
- [ ] **P2**: Pago exitoso con Mastercard
- [ ] **P3**: Pago exitoso con American Express
- [ ] **P4**: Pago rechazado por fondos insuficientes
- [ ] **P5**: Pago rechazado por tarjeta no permitida
- [ ] **P6**: Pago pendiente con PSE
- [ ] **P7**: Prevención de transacción duplicada
- [ ] **P8**: Reembolso de orden pagada
- [ ] **P9**: Validación de firma en callback
- [ ] **P10**: Validación de monto en callback
- [ ] **P11**: Actualización de inventario post-pago
- [ ] **P12**: Logs de auditoría completos

---

## Tarjetas de Prueba Detalladas

### Visa

```
✅ APROBADA
Número: 4097440000000004
CVV: 123
Fecha: 12/25
Nombre: APPROVED

❌ FONDOS INSUFICIENTES
Número: 4097440000000012
CVV: 123
Fecha: 12/25
Nombre: APPROVED

❌ TARJETA VENCIDA
Número: 4097440000000020
CVV: 123
Fecha: 12/25
Nombre: APPROVED
```

### Mastercard

```
✅ APROBADA
Número: 5500000000000004
CVV: 123
Fecha: 12/25
Nombre: APPROVED

✅ APROBADA (ALTERNATIVA)
Número: 5424000000000015
CVV: 123
Fecha: 12/25
Nombre: APPROVED

❌ NO PERMITIDA
Número: 5424000000000023
CVV: 123
Fecha: 12/25
Nombre: APPROVED
```

### American Express

```
✅ APROBADA
Número: 377813000000001
CVV: 1234 (4 dígitos)
Fecha: 12/25
Nombre: APPROVED
```

### Diners Club

```
✅ APROBADA
Número: 36032400000007
CVV: 123
Fecha: 12/25
Nombre: APPROVED
```

---

## Pruebas de API con Postman/cURL

### 1. Obtener Configuración de PayU

```bash
curl http://localhost:4000/api/payments/config
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "merchantId": "508029",
    "accountId": "512321",
    "isTest": true,
    "checkoutUrl": "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/"
  }
}
```

### 2. Crear Transacción

```bash
curl -X POST http://localhost:4000/api/payments/create-transaction \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "670abc123456789",
    "paymentMethod": "CREDIT_CARD"
  }'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "transactionId": "abc123-def456-789",
    "orderId": "670abc123456789",
    "state": "APPROVED",
    "responseCode": "APPROVED",
    "message": "Transacción aprobada",
    "orderNumber": "ORD-20241012-ABC123"
  }
}
```

### 3. Generar Formulario de Pago

```bash
curl -X POST http://localhost:4000/api/payments/generate-form \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "670abc123456789"
  }'
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "formUrl": "https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/",
    "formData": {
      "merchantId": "508029",
      "accountId": "512321",
      "description": "Orden ORD-20241012-ABC123",
      "referenceCode": "670abc123456789",
      "amount": "155000",
      "signature": "...",
      "test": "1"
    }
  }
}
```

### 4. Consultar Estado de Orden

```bash
curl http://localhost:4000/api/payments/order/670abc123456789/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-20241012-ABC123",
    "orderStatus": "En Proceso",
    "paymentStatus": "Pagado",
    "paymentMethod": "Tarjeta de Crédito",
    "total": 155000,
    "transactionId": "abc123-def456-789",
    "paymentDate": "2024-10-12T..."
  }
}
```

---

## Verificar Callbacks de PayU

### Callback de Confirmación (Server-to-Server)

PayU enviará un POST a:
```
http://localhost:4000/api/payments/payu-callback
```

**Datos que envía PayU**:
```
merchant_id=508029
state_pol=4
risk=0.0
response_code_pol=1
reference_sale=670abc123456789
reference_pol=7654321
sign=abc123def456...
value=155000.00
currency=COP
transaction_id=abc123-def456-789
transaction_date=2024-10-12 15:30:45
```

**Logs esperados en el servidor**:
```
📥 Confirmación PayU recibida: 670abc123456789 - Estado: 4
✅ Firma de PayU validada correctamente
✅ Orden ORD-20241012-ABC123 marcada como PAGADA (PayU)
   Transaction ID: abc123-def456-789
   Monto: $155000 COP
   📦 Inventario actualizado: 2 unidades descontadas
```

---

## Troubleshooting

### ❌ Error: "Configuración de PayU incompleta"

**Causa**: Variables de entorno faltantes

**Solución**:
```bash
# Verificar .env
cat backend/.env | grep PAYU

# Debe mostrar:
# PAYU_MERCHANT_ID=508029
# PAYU_API_KEY=4Vj8eK4rloUd272L48hsrarnUA
# PAYU_API_LOGIN=pRRXKOl8ikMmt9u
# PAYU_ACCOUNT_ID=512321
```

### ❌ Error: "Firma de confirmación inválida"

**Causa**: PAYU_API_KEY incorrecta o datos manipulados

**Solución**:
1. Verifica que `PAYU_API_KEY` sea exactamente: `4Vj8eK4rloUd272L48hsrarnUA`
2. No modifiques los parámetros del callback
3. Reinicia el servidor después de cambiar el .env

### ⚠️ No llega la confirmación (callback)

**Causa**: URL de confirmación no accesible desde PayU

**Solución**:

**Para localhost** (PayU no puede acceder a localhost directamente):

1. Usa un túnel para exponer tu localhost:
   ```bash
   # Opción 1: ngrok
   ngrok http 4000
   
   # Opción 2: localtunnel
   npx localtunnel --port 4000 --subdomain mysupergains
   ```

2. Copia la URL pública generada (ej: `https://mysupergains.loca.lt`)

3. Actualiza tu `.env`:
   ```env
   BACKEND_URL=https://mysupergains.loca.lt
   ```

4. En el panel de PayU, configura:
   - URL de confirmación: `https://mysupergains.loca.lt/api/payments/payu-callback`

**Para producción**: La URL debe ser pública y accesible

### ❌ Pago aprobado pero orden sigue "pending"

**Causa**: Callback no se procesó correctamente

**Solución**:
1. Verifica los logs del servidor para ver si llegó el callback
2. Verifica que la firma se validó correctamente
3. Revisa `order.paymentLogs` para ver si hay errores
4. Manualmente actualiza el estado:
   ```javascript
   await order.updatePaymentStatus('paid', {
     transactionId: 'xxx',
     amountPaid: order.total,
     paymentDate: new Date()
   }, 'admin');
   ```

---

## 🎓 Próximos Pasos

Una vez que todas las pruebas pasen:

1. **Documentar resultados** de las pruebas
2. **Crear casos de prueba** automatizados (opcional)
3. **Preparar para producción**:
   - Obtener credenciales reales de PayU
   - Configurar URLs públicas
   - Actualizar variables de entorno

---

## 📚 Recursos Adicionales

- [Documentación PayU - Sandbox](https://developers.payulatam.com/latam/es/docs/getting-started/test-your-solution.html)
- [Tarjetas de Prueba](https://developers.payulatam.com/latam/es/docs/getting-started/test-your-solution.html#test-cards)
- [Estados de Transacción](https://developers.payulatam.com/latam/es/docs/services/payments.html#transaction-states)
- [API Reference](https://developers.payulatam.com/latam/es/docs/services/payments.html)

---

**Última actualización**: 2024-10-12  
**Autor**: Equipo de Desarrollo SuperGains  
**Versión**: 1.0.0

