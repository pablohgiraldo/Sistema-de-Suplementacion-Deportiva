# 🔒 SECURITY.md - SuperGains

## Índice
- [Resumen de Seguridad](#resumen-de-seguridad)
- [Configuración de Seguridad](#configuración-de-seguridad)
- [Headers de Seguridad](#headers-de-seguridad)
- [Autenticación y Autorización](#autenticación-y-autorización)
  - [Sistema de Refresh Tokens](#sistema-de-refresh-tokens-avanzado)
- [Validación de Entrada](#validación-de-entrada)
- [Rate Limiting](#rate-limiting)
- [Middleware de Seguridad](#middleware-de-seguridad)
- [Pruebas de Seguridad](#pruebas-de-seguridad)
- [Monitoreo y Logging](#monitoreo-y-logging)
- [Recomendaciones](#recomendaciones)
- [Contacto de Seguridad](#contacto-de-seguridad)
- [Changelog de Seguridad](#changelog-de-seguridad)

---

## Resumen de Seguridad

SuperGains implementa múltiples capas de seguridad para proteger la aplicación web contra vulnerabilidades comunes y ataques avanzados. Este documento describe todas las medidas de seguridad implementadas y las mejores prácticas seguidas.

### 🛡️ Medidas de Seguridad Implementadas

- ✅ **Headers de Seguridad HTTP** (Helmet.js)
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Autorización basada en roles** (RBAC)
- ✅ **Validación robusta de entrada** (express-validator)
- ✅ **Rate Limiting** por endpoint
- ✅ **Protección contra ataques comunes** (SQL Injection, XSS, CSRF)
- ✅ **CORS configurado** correctamente
- ✅ **Logging de seguridad** y auditoría
- ✅ **Pruebas automatizadas** de seguridad

---

## Configuración de Seguridad

### Entorno de Desarrollo vs Producción

La aplicación utiliza diferentes configuraciones de seguridad según el entorno:

```javascript
// Desarrollo: Configuración más permisiva para facilitar desarrollo
const isDevelopment = process.env.NODE_ENV !== 'production';

if (isDevelopment) {
    // Rate limiting más permisivo
    // CSP en modo report-only
    // HSTS deshabilitado
} else {
    // Rate limiting restrictivo
    // CSP en modo enforce
    // HSTS habilitado
}
```

### Variables de Entorno de Seguridad

```bash
# Configuración de seguridad
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_EXPIRES_IN=1h                    # Access tokens: 1 hora
JWT_REFRESH_EXPIRES_IN=7d            # Solo referencia, no se usa
REFRESH_TOKEN_EXPIRES_DAYS=30        # Refresh tokens en DB: 30 días
ENCRYPTION_KEY=base64_encryption_key # Para cifrado de datos sensibles
CORS_ORIGIN=https://supergains-frontend.vercel.app
MONGODB_URI=mongodb+srv://...
```

---

## Headers de Seguridad

### Headers Implementados

| Header | Valor | Propósito |
|--------|-------|-----------|
| `X-XSS-Protection` | `1; mode=block` | Protección contra XSS |
| `X-Content-Type-Options` | `nosniff` | Previene MIME type sniffing |
| `X-Frame-Options` | `DENY` | Previene clickjacking |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | HSTS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control de referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(self), payment=(self)` | Control de permisos |
| `Content-Security-Policy` | Ver configuración completa abajo | CSP |

### Content Security Policy (CSP)

```javascript
contentSecurityPolicy: {
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://api.mongodb.com", "ws://localhost:*"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"]
    }
}
```

### Verificación de Headers

Para verificar que los headers están configurados correctamente:

```bash
# Ejecutar script de verificación
node backend/scripts/check-security-headers.js
```

---

## Autenticación y Autorización

### JWT (JSON Web Tokens) Reforzados

#### Configuración de Tokens
- **Access Token**: Expira en 1 hora (configurable)
- **Refresh Token**: Expira en 30 días, almacenado en base de datos
- **Algoritmo**: HS256
- **Secrets**: Una sola clave JWT_SECRET para simplicidad y seguridad

#### Sistema de Refresh Tokens Avanzado
- **Rotación Automática**: Cada uso del refresh token genera uno nuevo
- **Almacenamiento Seguro**: Tokens hasheados con SHA-256 en base de datos
- **Revocación Efectiva**: Sistema de blacklist y revocación por familia
- **Tracking de Dispositivos**: User-Agent, IP, tipo de dispositivo
- **Límites de Uso**: Máximo 100 usos por refresh token
- **Limpieza Automática**: TTL de MongoDB para tokens expirados

### Roles y Permisos

```javascript
// Roles disponibles
const roles = ['usuario', 'admin', 'moderador'];

// Middleware de autorización
const requireAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
    }
    next();
};
```

### Endpoints de Autenticación y Gestión de Sesiones

| Endpoint | Método | Propósito | Seguridad |
|----------|--------|-----------|-----------|
| `/api/users/login` | POST | Iniciar sesión | Rate limiting, validación |
| `/api/users/refresh` | POST | Refrescar access token | Rotación automática |
| `/api/users/logout` | POST | Cerrar sesión | Revocación de tokens |
| `/api/users/sessions` | GET | Ver sesiones activas | Autenticación requerida |
| `/api/users/sessions/:id` | DELETE | Revocar sesión específica | Prop ownership |
| `/api/users/sessions` | DELETE | Revocar todas las sesiones | Bulk revocation |

### Endpoints Protegidos

| Endpoint | Método | Autenticación | Autorización |
|----------|--------|---------------|---------------|
| `/api/users` | GET | ✅ | Admin |
| `/api/users/:id/block` | PUT | ✅ | Admin |
| `/api/users/:id/role` | PUT | ✅ | Admin |
| `/api/inventory` | * | ✅ | Admin |
| `/api/orders` | GET | ✅ | Admin/Usuario |
| `/api/cart` | * | ✅ | Usuario |
| `/api/wishlist` | * | ✅ | Usuario |

---

## Validación de Entrada

### Validadores Implementados

#### 1. Validadores de Seguridad (`securityValidators.js`)

```javascript
// Validación de email con protección contra emails temporales
export const validateEmailSecurity = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 100 })
        .custom(value => {
            const disposableDomains = ['mailinator.com', 'tempmail.com'];
            if (disposableDomains.some(domain => value.includes(domain))) {
                throw new Error('No se permiten emails temporales');
            }
            return true;
        })
];

// Validación de contraseña con complejidad
export const validatePasswordSecurity = [
    body('password')
        .isLength({ min: 8, max: 128 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .custom(value => {
            const commonPasswords = ['password', '123456', 'admin'];
            if (commonPasswords.includes(value.toLowerCase())) {
                throw new Error('Contraseña demasiado común');
            }
            return true;
        })
];
```

#### 2. Validadores de Productos (`enhancedProductValidators.js`)

```javascript
// Validación de datos de productos
export const validateProductSecurity = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z0-9\s\-_]+$/),
    body('price')
        .isFloat({ min: 0, max: 10000 })
        .customSanitizer(value => parseFloat(value)),
    body('stock')
        .isInt({ min: 0, max: 1000 })
        .customSanitizer(value => parseInt(value))
];
```

#### 3. Validadores de Carrito (`enhancedCartValidators.js`)

```javascript
// Validación de operaciones de carrito
export const validateCartItemSecurity = [
    body('productId')
        .isMongoId()
        .withMessage('ID de producto inválido'),
    body('quantity')
        .isInt({ min: 1, max: 10 })
        .withMessage('Cantidad debe estar entre 1 y 10')
];
```

### Protección contra Ataques

#### SQL Injection
- Uso de Mongoose ODM (Object Document Mapper)
- Validación de entrada con express-validator
- Sanitización automática de datos

#### XSS (Cross-Site Scripting)
- Sanitización de entrada
- Headers X-XSS-Protection
- Content Security Policy (CSP)

#### CSRF (Cross-Site Request Forgery)
- Validación de origen en CORS
- Tokens JWT con información de sesión
- Headers de seguridad apropiados

---

## Rate Limiting

### Configuración por Endpoint

| Endpoint | Ventana | Límite (Desarrollo) | Límite (Producción) |
|----------|---------|-------------------|-------------------|
| Autenticación | 15 min | 1000 | 5 |
| Registro | 1 hora | 100 | 3 |
| Órdenes | 15 min | 1000 | 10 |
| Admin | 5 min | 1000 | 50 |
| Inventario | 1 min | 200 | 30 |
| Productos | 1 min | 1000 | 100 |
| Carrito | 1 min | 1000 | 50 |
| Wishlist | 1 min | 1000 | 30 |

### Implementación

```javascript
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 5 : 1000,
    message: {
        success: false,
        error: 'Demasiados intentos de autenticación',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    }
});
```

---

## Middleware de Seguridad

### Middleware Implementados

#### 1. Detección de Ataques (`inputValidationMiddleware.js`)

```javascript
export const detectCommonAttacks = (req, res, next) => {
    // Solo en producción
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    const attackPatterns = [
        /union\s+select/i,     // SQL Injection
        /<script[^>]*>/i,      // XSS
        /\.\.\//,              // Path Traversal
        /\$where/i             // NoSQL Injection
    ];

    const allContent = `${req.url} ${JSON.stringify(req.body)} ${JSON.stringify(req.query)}`;
    
    for (const pattern of attackPatterns) {
        if (pattern.test(allContent)) {
            return res.status(400).json({
                success: false,
                error: 'Patrón de ataque detectado',
                code: 'ATTACK_PATTERN_DETECTED'
            });
        }
    }
    
    next();
};
```

#### 2. Validación de Headers

```javascript
export const validateSecurityHeaders = (req, res, next) => {
    const userAgent = req.get('user-agent');
    
    if (!userAgent) {
        return res.status(400).json({
            success: false,
            error: 'User-Agent header es requerido',
            code: 'MISSING_USER_AGENT'
        });
    }
    
    next();
};
```

#### 3. Sanitización de Entrada

```javascript
export const sanitizeInput = (req, res, next) => {
    // Sanitizar strings en body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    
    next();
};
```

---

## Pruebas de Seguridad

### Script de Pruebas Automatizadas

Se implementó un sistema completo de pruebas de seguridad que simula las funcionalidades de OWASP ZAP:

```bash
# Ejecutar pruebas de seguridad
node backend/scripts/security-test-simple.js
```

### Tipos de Pruebas

#### 1. Headers de Seguridad
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options  
- ✅ X-XSS-Protection
- ✅ Strict-Transport-Security

#### 2. Autenticación y Autorización
- ✅ Login con credenciales inválidas
- ✅ Acceso sin autenticación
- ✅ Rate limiting en login

#### 3. Validación de Entrada
- ✅ Protección contra SQL Injection
- ✅ Protección contra XSS
- ✅ Validación de email

#### 4. Configuración CORS
- ✅ Bloqueo de orígenes no permitidos
- ✅ Permitir localhost

### Resultados de Pruebas

**Última ejecución:**
- **Total de pruebas:** 11
- **✅ Exitosas:** 11 (100%)
- **❌ Fallidas:** 0 (0%)
- **⚠️ Advertencias:** 0 (0%)

### Reportes Generados

- `backend/scripts/security-reports/security-test-report.json`
- `backend/scripts/security-reports/security-test-report.html`

---

## Monitoreo y Logging

### Logging de Seguridad

```javascript
// Logging de intentos de autenticación
const logAuthAttempt = (req, success) => {
    console.log(`[AUTH] ${success ? 'SUCCESS' : 'FAILED'} - ${req.ip} - ${req.body.email}`);
};

// Logging de rate limiting
const logRateLimit = (level, message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
};
```

### Endpoints de Monitoreo

| Endpoint | Propósito |
|----------|-----------|
| `/api/security/info` | Información de seguridad |
| `/api/security/stats` | Estadísticas de seguridad |
| `/api/security/csp-report` | Reportes de CSP |
| `/api/security/ct-report` | Reportes de Certificate Transparency |

### Alertas de Seguridad

- Intentos de login fallidos repetidos
- Patrones de ataque detectados
- Violaciones de CSP
- Rate limiting excedido
- **Nuevo**: Uso excesivo de refresh tokens (>50 en 1 hora)
- **Nuevo**: Múltiples fallos de verificación de refresh tokens consecutivos
- **Nuevo**: Tokens que exceden el límite de usos
- **Nuevo**: Detección de rotación simultánea de tokens (posible ataque)

### Características de Seguridad de Refresh Tokens

#### Rotación Automática
```javascript
// Cada uso del refresh token genera uno nuevo
const verifyResult = await RefreshToken.verifyAndRotate(refreshTokenValue, deviceInfo);
if (verifyResult.success) {
    // Token anterior revocado, nuevo token generado
    return {
        accessToken: newAccessToken,
        refreshToken: verifyResult.newRefreshToken
    };
}
```

#### Detección de Abuso
- **Límite de usos**: 100 usos máximo por refresh token
- **Revocación por familia**: Si se detecta reutilización, se revoca toda la familia
- **Detección de dispositivos**: Tracking por User-Agent e IP
- **Logging de seguridad**: Todos los eventos se registran

#### Revocación Efectiva
- Tokens marcados como `isRevoked: true` en base de datos
- Limpieza automática mediante TTL de MongoDB
- Script de mantenimiento: `cleanup-expired-tokens.js`

---

## Recomendaciones

### Mejoras Futuras

1. **Implementar 2FA (Two-Factor Authentication)**
   ```javascript
   // Usar bibliotecas como speakeasy o qrcode
   const speakeasy = require('speakeasy');
   ```

2. **Configurar WAF (Web Application Firewall)**
   - Cloudflare
   - AWS WAF
   - ModSecurity

3. **Implementar Content Security Policy más estricta**
   ```javascript
   // CSP más restrictiva para producción
   scriptSrc: ["'self'"] // Sin 'unsafe-inline'
   ```

4. **Agregar monitoreo en tiempo real**
   - Sentry para errores
   - DataDog para métricas
   - PagerDuty para alertas

5. **Implementar backup y recuperación**
   - Backups automáticos de MongoDB
   - Plan de recuperación ante desastres

### Mejores Prácticas

1. **Rotación de Secrets**
   - Cambiar JWT secrets regularmente
   - Usar secretos diferentes por entorno

2. **Auditorías Regulares**
   - Ejecutar pruebas de seguridad semanalmente
   - Revisar logs de seguridad mensualmente

3. **Actualizaciones de Seguridad**
   - Mantener dependencias actualizadas
   - Aplicar parches de seguridad inmediatamente

4. **Educación del Equipo**
   - Capacitación en seguridad web
   - Code reviews enfocados en seguridad

---

## Contacto de Seguridad

### Reportar Vulnerabilidades

Si descubres una vulnerabilidad de seguridad, por favor:

1. **NO** publiques la vulnerabilidad públicamente
2. Envía un email a: `security@supergains.com`
3. Incluye:
   - Descripción detallada de la vulnerabilidad
   - Pasos para reproducir
   - Impacto potencial
   - Sugerencias de mitigación

### Respuesta a Vulnerabilidades

- **Tiempo de respuesta:** 24-48 horas
- **Proceso de corrección:** 1-2 semanas
- **Comunicación:** Actualizaciones regulares durante el proceso

### Reconocimientos

Agradecemos a todos los investigadores de seguridad que contribuyen a hacer SuperGains más seguro.

---

## Changelog de Seguridad

### v1.1.0 (2025-01-XX) - HU42.3: Autenticación Reforzada
- ✅ **Sistema de Refresh Tokens Reforzados**
  - Rotación automática en cada uso del refresh token
  - Almacenamiento seguro con hash SHA-256 en base de datos
  - Revocación efectiva por familia de tokens y por dispositivo
  - Tracking completo de dispositivos (User-Agent, IP, tipo)
  - Límites de uso (100 usos máximo por token)
  - Limpieza automática mediante TTL de MongoDB
- ✅ **APIs de Gestión de Sesiones**
  - `GET /api/users/sessions` - Listar sesiones activas
  - `DELETE /api/users/sessions/:id` - Revocar sesión específica
  - `DELETE /api/users/sessions` - Revocar todas las sesiones
- ✅ **Mejoras de Seguridad**
  - Configuración más segura (access tokens: 1h, refresh tokens: 30d)
  - Detección de abuso y patrones anómalos
  - Script de mantenimiento para limpieza de tokens
  - Documentación completa OAuth 2.0 y RFC 6749

### v1.0.0 (2025-10-03)
- ✅ Implementación inicial de headers de seguridad
- ✅ Configuración de Helmet.js
- ✅ Rate limiting básico
- ✅ Validación de entrada con express-validator
- ✅ Pruebas automatizadas de seguridad
- ✅ Documentación completa de seguridad

### Próximas Versiones
- 🔄 Implementación de 2FA
- 🔄 WAF integration
- 🔄 Monitoreo en tiempo real
- 🔄 Auditorías automatizadas

---

**Última actualización:** 3 de Octubre, 2025  
**Versión del documento:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo SuperGains
