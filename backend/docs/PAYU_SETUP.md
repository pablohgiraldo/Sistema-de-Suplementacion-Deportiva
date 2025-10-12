# 💳 Configuración de PayU - SuperGains

## 📋 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env` en el backend:

```env
# =========================================
# PAYU - Pasarela de Pagos (Colombia)
# =========================================

# Credenciales de PayU (modo test)
# Obtenlas en: https://merchants.payulatam.com/
PAYU_MERCHANT_ID=508029
PAYU_API_KEY=4Vj8eK4rloUd272L48hsrarnUA
PAYU_API_LOGIN=pRRXKOl8ikMmt9u
PAYU_ACCOUNT_ID=512321

# URL del backend (para callbacks)
BACKEND_URL=http://localhost:5000

# URLs frontend (para redirecciones)
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Guía de Configuración Paso a Paso

### 1. Crear cuenta en PayU

1. Ve a [https://www.payulatam.com/](https://www.payulatam.com/)
2. Click en "Regístrate" o "Crear cuenta"
3. Completa el formulario con datos de tu negocio
4. Verifica tu email
5. Completa la documentación requerida (RUT, cédula, etc.)

**IMPORTANTE**: El proceso de aprobación puede tomar 1-3 días hábiles.

### 2. Activar modo Pruebas (Sandbox)

Mientras tu cuenta es aprobada, puedes usar las **credenciales de prueba** que PayU proporciona:

```env
PAYU_MERCHANT_ID=508029
PAYU_API_KEY=4Vj8eK4rloUd272L48hsrarnUA
PAYU_API_LOGIN=pRRXKOl8ikMmt9u
PAYU_ACCOUNT_ID=512321
```

Estas credenciales funcionan en el entorno de pruebas (sandbox).

### 3. Obtener tus credenciales de producción

Una vez tu cuenta sea aprobada:

1. Inicia sesión en [Panel de Comercios PayU](https://merchants.payulatam.com/)
2. Ve a **Configuración** > **Configuración técnica**
3. Encontrarás:
   - **Merchant ID**: ID de tu cuenta de comercio
   - **Account ID**: ID de la cuenta (puede ser diferente por país)
   - **API Key**: Clave para firmar transacciones
   - **API Login**: Usuario para autenticación

4. Copia estos valores a tu `.env`:

```env
PAYU_MERCHANT_ID=tu_merchant_id
PAYU_API_KEY=tu_api_key
PAYU_API_LOGIN=tu_api_login
PAYU_ACCOUNT_ID=tu_account_id
```

### 4. Configurar URLs de Confirmación y Respuesta

En el panel de PayU:

1. Ve a **Configuración** > **Configuración técnica**
2. Configura:
   - **URL de confirmación**: `https://tudominio.com/api/payments/payu-callback`
     - PayU envía aquí la confirmación del pago (server-to-server)
   - **URL de respuesta**: `https://tudominio.com/api/payments/payu-response`
     - PayU redirige aquí al usuario después del pago

**Para desarrollo local**, usa:
- Confirmación: `http://localhost:5000/api/payments/payu-callback`
- Respuesta: `http://localhost:5000/api/payments/payu-response`

**Nota**: Para desarrollo local con confirmación real, necesitarás un túnel (ngrok, localtunnel, etc.)

---

## 🧪 Probar la Integración

### 1. Iniciar el servidor

```bash
cd backend
npm run dev
```

### 2. Verificar configuración

**Endpoint**: `GET http://localhost:5000/api/payments/config`

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

### 3. Crear una transacción de prueba

**Endpoint**: `POST http://localhost:5000/api/payments/create-transaction`

**Headers**:
```
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json
```

**Body**:
```json
{
  "orderId": "670abc123456789",
  "paymentMethod": "CREDIT_CARD"
}
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "transactionId": "abc123-456def-789ghi",
    "orderId": "670abc123456789",
    "state": "APPROVED",
    "responseCode": "APPROVED",
    "message": "Transacción aprobada",
    "orderNumber": "ORD-20241012-ABC123"
  }
}
```

### 4. Generar formulario de pago (WebCheckout)

**Endpoint**: `POST http://localhost:5000/api/payments/generate-form`

**Headers**:
```
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json
```

**Body**:
```json
{
  "orderId": "670abc123456789"
}
```

**Respuesta**:
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
      "amount": "150000",
      "tax": "0",
      "taxReturnBase": "0",
      "currency": "COP",
      "signature": "abc123def456...",
      "test": "1",
      "buyerEmail": "cliente@example.com",
      "buyerFullName": "Juan Pérez",
      "telephone": "3001234567",
      "responseUrl": "http://localhost:5000/api/payments/payu-response",
      "confirmationUrl": "http://localhost:5173/payment-confirmation"
    }
  }
}
```

Luego, en el frontend, crea un formulario HTML que envíe estos datos a `formUrl`.

### 5. Tarjetas de prueba de PayU

Usa estas tarjetas para probar diferentes escenarios en el entorno sandbox:

#### Tarjetas Aprobadas

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa | `4097440000000004` | `123` | `12/25` | ✅ Aprobada |
| Visa | `4111111111111111` | `123` | `12/25` | ✅ Aprobada |
| Mastercard | `5500000000000004` | `123` | `12/25` | ✅ Aprobada |
| American Express | `377813000000001` | `1234` | `12/25` | ✅ Aprobada |
| Diners | `36032400000007` | `123` | `12/25` | ✅ Aprobada |

#### Tarjetas Rechazadas

| Tarjeta | Número | CVV | Fecha | Resultado |
|---------|--------|-----|-------|-----------|
| Visa | `4097440000000012` | `123` | `12/25` | ❌ Fondos insuficientes |
| Mastercard | `5424000000000015` | `123` | `12/25` | ❌ Transacción no permitida |

#### Otros métodos de pago (Sandbox)

- **PSE**: Selecciona "Banco de prueba" y completa con datos ficticios
- **Efectivo**: Se generará una referencia de pago (no se procesa realmente)

---

## 📊 Monitorear Pagos

### Panel de PayU

1. Ve a [Panel de Comercios](https://merchants.payulatam.com/)
2. Click en "Transacciones"
3. Verás todas las transacciones procesadas
4. Click en cualquier transacción para ver detalles

### Estados de transacción

| Estado | Código | Descripción |
|--------|--------|-------------|
| APPROVED | 4 | Transacción aprobada |
| REJECTED | 6 | Transacción rechazada |
| PENDING | 7 | Transacción pendiente |
| EXPIRED | 5 | Transacción expirada |
| DECLINED | 104 | Transacción declinada |

### Logs en tu servidor

Los eventos se registran en la consola:

```
📤 Creando transacción PayU: ORD-20241012-ABC123 por $150000 COP
✅ Transacción PayU creada: abc123-456def-789ghi
📥 Confirmación PayU recibida: ORD-20241012-ABC123 - Estado: 4
✅ Orden ORD-20241012-ABC123 marcada como PAGADA (PayU)
```

---

## 🔒 Seguridad

### Verificación de firma

El sistema verifica automáticamente la firma MD5 de cada confirmación para asegurar que provenga de PayU:

```javascript
const signature = crypto
    .createHash('md5')
    .update(`${apiKey}~${merchantId}~${referenceCode}~${value}~${currency}~${state}`)
    .digest('hex');
```

### ⚠️ NUNCA expongas tu API Key

- ❌ **NO** incluyas `PAYU_API_KEY` en el frontend
- ❌ **NO** la subas a GitHub sin `.env` en `.gitignore`
- ❌ **NO** la compartas públicamente
- ✅ **SÍ** usa variables de entorno
- ✅ **SÍ** rota las claves si se exponen

### IP Whitelisting (Producción)

En producción, PayU permite configurar IPs permitidas:

1. Ve a **Configuración** > **Seguridad**
2. Agrega las IPs de tu servidor
3. PayU solo aceptará transacciones desde esas IPs

---

## 🚀 Pasar a Producción

### 1. Completar activación de cuenta

1. Envía toda la documentación requerida
2. Espera la aprobación (1-3 días hábiles)
3. Firma el contrato comercial

### 2. Obtener credenciales de producción

1. Inicia sesión en el panel
2. Ve a **Configuración** > **Configuración técnica**
3. Copia las credenciales de **producción** (diferentes a las de prueba)
4. Actualiza tu `.env` de producción

### 3. Cambiar a modo producción

```env
NODE_ENV=production
PAYU_MERCHANT_ID=tu_merchant_id_real
PAYU_API_KEY=tu_api_key_real
PAYU_API_LOGIN=tu_api_login_real
PAYU_ACCOUNT_ID=tu_account_id_real
BACKEND_URL=https://tudominio.com
FRONTEND_URL=https://tudominio.com
```

### 4. Configurar URLs de producción

En el panel de PayU, actualiza:
- URL de confirmación: `https://tudominio.com/api/payments/payu-callback`
- URL de respuesta: `https://tudominio.com/api/payments/payu-response`

### 5. Probar en producción

- Usa tarjetas reales (se cobrarán montos reales)
- Monitorea el panel de transacciones
- Verifica que las confirmaciones lleguen correctamente

---

## 🛠️ Troubleshooting

### Error: "Configuración de PayU incompleta"

**Causa**: Variables de entorno faltantes

**Solución**:
1. Verifica que tu `.env` tenga todas las variables de PayU
2. Reinicia el servidor después de agregar las variables
3. En Render/Vercel, agrega las variables en el panel de configuración

### Error: "Firma inválida"

**Causa**: `PAYU_API_KEY` incorrecta o transacción manipulada

**Solución**:
1. Verifica que `PAYU_API_KEY` sea correcta (copia/pega desde el panel)
2. No modifiques los valores de la transacción después de generarla
3. Asegúrate de usar el mismo accountId y merchantId

### La confirmación no llega

**Causa**: URL de confirmación no accesible desde PayU

**Solución**:
1. **Local**: Usa un túnel (ngrok, localtunnel) para exponer tu localhost
   ```bash
   npx localtunnel --port 5000 --subdomain mysupergains
   ```
   Luego configura: `https://mysupergains.loca.lt/api/payments/payu-callback`

2. **Producción**: Verifica que la URL sea accesible públicamente
3. Revisa los logs del servidor para ver si llegan las peticiones

### Transacción rechazada en producción

**Causas comunes**:
- Tarjeta sin fondos
- Tarjeta bloqueada
- Datos incorrectos (CVV, fecha)
- Límite de transacciones excedido

**Solución**: Verifica los datos y contacta al banco emisor si persiste

### Webhook duplicados

**Causa**: PayU puede enviar la misma confirmación múltiples veces

**Solución**: El sistema ya maneja esto verificando el estado de la orden antes de procesarla

---

## 🌟 Métodos de Pago Soportados

### Colombia

- ✅ **Tarjetas de crédito**: Visa, Mastercard, American Express, Diners
- ✅ **Tarjetas débito**: Visa débito, Mastercard débito
- ✅ **PSE** (Pagos Seguros en Línea): Transferencias bancarias
- ✅ **Efectivo**: Efecty, Baloto, Puntored, Gana
- ✅ **Bancos**: Bancolombia, Davivienda, BBVA, etc.

### Configurar métodos de pago

En el panel de PayU:
1. Ve a **Configuración** > **Medios de pago**
2. Activa/desactiva los métodos que quieras ofrecer
3. Configura tasas y comisiones

---

## 📚 Recursos Adicionales

- [Documentación oficial de PayU](https://developers.payulatam.com/latam/es/docs.html)
- [API Reference](https://developers.payulatam.com/latam/es/docs/services/payments.html)
- [Panel de Comercios](https://merchants.payulatam.com/)
- [Soporte PayU](https://www.payulatam.com/co/contactanos/)
- [WebCheckout](https://developers.payulatam.com/latam/es/docs/integrations/webcheckout-integration.html)
- [API de Pagos](https://developers.payulatam.com/latam/es/docs/integrations/api-integration.html)

---

## 💰 Costos y Comisiones

PayU cobra comisiones por transacción. Los costos varían según:

- Tipo de transacción (crédito, débito, PSE, efectivo)
- Volumen mensual
- Contrato negociado

**Comisiones aproximadas en Colombia**:
- Tarjetas de crédito: 2.5% - 3.5% + $900 COP
- PSE: $2,500 - $3,000 COP por transacción
- Efectivo: 2.5% - 4%

Consulta con tu ejecutivo comercial para tasas específicas.

---

**Última actualización**: 2024-10-12  
**Autor**: Equipo de Desarrollo SuperGains  
**Versión**: 1.0.0

