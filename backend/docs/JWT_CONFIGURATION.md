# Configuración JWT - SuperGains

## Descripción
Este documento describe la configuración y uso de JWT (JSON Web Tokens) en el backend de SuperGains.

## Archivos de Configuración

### 1. `src/config/jwt.js`
Configuración centralizada de JWT que incluye:
- Generación de tokens (access y refresh)
- Verificación de tokens
- Configuración de expiración
- Validación de issuer y audience

### 2. `src/middleware/authMiddleware.js`
Middleware de autenticación que:
- Extrae tokens del header Authorization
- Verifica la validez del token
- Valida que el usuario existe y está activo
- Agrega información del usuario al request

### 3. `src/middleware/roleMiddleware.js`
Middleware para control de roles que incluye:
- Verificación de roles específicos
- Middleware para administradores
- Middleware para moderadores
- Verificación de ownership de recursos

### 4. `src/utils/jwtUtils.js`
Utilidades adicionales para JWT:
- Generación de tokens de autenticación
- Refresh de tokens
- Validación de tokens
- Revocación de tokens

## Variables de Entorno

```env
# JWT Configuration
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Descripción de Variables

- **JWT_SECRET**: Clave secreta para firmar los tokens (debe ser muy segura)
- **JWT_EXPIRES_IN**: Tiempo de expiración del access token (formato: 24h, 7d, etc.)
- **JWT_REFRESH_EXPIRES_IN**: Tiempo de expiración del refresh token

## Uso en Rutas

### Autenticación Básica
```javascript
import authMiddleware from '../middleware/authMiddleware.js';

router.get('/protected', authMiddleware, (req, res) => {
  // req.user contiene el usuario autenticado
  // req.userId contiene el ID del usuario
  // req.userRole contiene el rol del usuario
});
```

### Control de Roles
```javascript
import { requireAdmin, requireRole } from '../middleware/roleMiddleware.js';

// Solo administradores
router.get('/admin-only', requireAdmin, (req, res) => {
  // Solo administradores pueden acceder
});

// Roles específicos
router.get('/moderator-only', requireRole(['moderator', 'admin']), (req, res) => {
  // Moderadores y administradores pueden acceder
});
```

### Ownership de Recursos
```javascript
import { requireOwnershipOrAdmin } from '../middleware/roleMiddleware.js';

// Solo el propietario o administrador
router.get('/user/:userId/profile', requireOwnershipOrAdmin('userId'), (req, res) => {
  // Solo el usuario propietario o administrador puede acceder
});
```

## Generación de Tokens

### Para Login
```javascript
import { generateAuthTokens } from '../utils/jwtUtils.js';

const result = await generateAuthTokens(user);
// Retorna: { success: true, data: { user, tokens: { accessToken, refreshToken } } }
```

### Para Refresh
```javascript
import { refreshAccessToken } from '../utils/jwtUtils.js';

const result = await refreshAccessToken(refreshToken);
// Retorna: { success: true, data: { accessToken, expiresIn } }
```

## Estructura del Token

### Access Token Payload
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "usuario@supergains.com",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700086400,
  "iss": "supergains-api",
  "aud": "supergains-client"
}
```

### Refresh Token Payload
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "usuario@supergains.com",
  "role": "user",
  "iat": 1700000000,
  "exp": 1700604800,
  "iss": "supergains-api",
  "aud": "supergains-client"
}
```

## Seguridad

### Mejores Prácticas Implementadas

1. **Clave Secreta Fuerte**: Se requiere una clave secreta segura en las variables de entorno
2. **Expiración de Tokens**: Los tokens tienen tiempo de expiración limitado
3. **Validación de Issuer/Audience**: Se valida que el token sea emitido por nuestra API
4. **Verificación de Usuario**: Se verifica que el usuario existe y está activo
5. **Manejo de Errores**: Errores específicos para diferentes tipos de fallos

### Headers Requeridos

```http
Authorization: Bearer <access_token>
```

## Pruebas

### Ejecutar Pruebas de JWT
```bash
npm run test:jwt
```

### Pruebas Incluidas

1. Generación de tokens básicos
2. Verificación de tokens
3. Generación de pares de tokens
4. Extracción de tokens del header
5. Manejo de errores
6. Pruebas con base de datos
7. Generación de tokens de autenticación
8. Validación de tokens
9. Refresh de tokens

## Troubleshooting

### Error: JWT_SECRET no está definido
- Verificar que la variable JWT_SECRET esté configurada en el archivo .env
- Asegurarse de que el archivo .env esté en la raíz del proyecto backend

### Error: Token inválido
- Verificar que el token esté en el formato correcto: `Bearer <token>`
- Verificar que el token no haya expirado
- Verificar que el usuario exista y esté activo

### Error: Token expirado
- Usar el refresh token para obtener un nuevo access token
- Implementar lógica de refresh automático en el frontend

## Próximos Pasos

1. Implementar blacklist de tokens revocados
2. Agregar rate limiting para endpoints de autenticación
3. Implementar refresh automático en el frontend
4. Agregar logging de eventos de autenticación
5. Implementar 2FA (Two-Factor Authentication)
