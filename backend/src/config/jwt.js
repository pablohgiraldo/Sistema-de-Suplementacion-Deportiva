import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
// Configuración más segura: access tokens cortos, refresh tokens más largos
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Access tokens: 1 hora
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Refresh tokens: 7 días

// Validación suave: advertir pero no bloquear el inicio del servidor
if (!JWT_SECRET) {
    console.warn('⚠️  WARNING: JWT_SECRET no está definido en las variables de entorno');
    console.warn('⚠️  Las funciones de autenticación fallarán hasta que se configure JWT_SECRET');
}

/**
 * Valida que JWT_SECRET esté disponible antes de usar funciones JWT
 * @throws {Error} Si JWT_SECRET no está definido
 */
function validateJWTSecret() {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET no está definido en las variables de entorno. Por favor configura JWT_SECRET para usar autenticación.');
    }
}

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos del usuario a incluir en el token
 * @param {string} type - Tipo de token ('access' o 'refresh')
 * @returns {string} Token JWT generado
 */
export function generateToken(payload, type = 'access') {
    validateJWTSecret(); // Validar antes de usar

    const expiresIn = type === 'refresh' ? JWT_REFRESH_EXPIRES_IN : JWT_EXPIRES_IN;

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn,
        issuer: 'supergains-api',
        audience: 'supergains-client'
    });
}

/**
 * Verifica y decodifica un token JWT
 * @param {string} token - Token JWT a verificar
 * @returns {Object} Payload decodificado del token
 * @throws {Error} Si el token es inválido o ha expirado
 */
export function verifyToken(token) {
    validateJWTSecret(); // Validar antes de usar

    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'supergains-api',
            audience: 'supergains-client'
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token ha expirado');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Token inválido');
        } else {
            throw new Error('Error al verificar token');
        }
    }
}

/**
 * Genera un par de tokens (access y refresh) para un usuario
 * @param {Object} user - Datos del usuario
 * @returns {Object} Objeto con accessToken y refreshToken
 */
export function generateTokenPair(user) {
    validateJWTSecret(); // Validar antes de usar

    const payload = {
        userId: user._id,
        email: user.email,
        role: user.rol || 'usuario'
    };

    return {
        accessToken: generateToken(payload, 'access'),
        refreshToken: generateToken(payload, 'refresh')
    };
}

/**
 * Extrae el token del header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} Token extraído o null si no se encuentra
 */
export function extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}
