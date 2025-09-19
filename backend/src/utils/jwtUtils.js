import { generateToken, verifyToken, generateTokenPair } from '../config/jwt.js';
import User from '../models/User.js';

/**
 * Genera tokens para un usuario después del login
 * @param {Object} user - Usuario autenticado
 * @returns {Object} Objeto con tokens y datos del usuario
 */
export async function generateAuthTokens(user) {
    try {
        const tokens = generateTokenPair(user);

        // Actualizar último login del usuario
        await User.findByIdAndUpdate(user._id, {
            lastLogin: new Date()
        });

        return {
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    nombre: user.nombre,
                    rol: user.rol || 'usuario',
                    activo: user.activo,
                    lastLogin: new Date()
                },
                tokens: {
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
                }
            }
        };
    } catch (error) {
        console.error('Error generando tokens de autenticación:', error);
        throw new Error('Error al generar tokens de autenticación');
    }
}

/**
 * Refresca un token de acceso usando un refresh token
 * @param {string} refreshToken - Refresh token válido
 * @returns {Object} Nuevo access token
 */
export async function refreshAccessToken(refreshToken) {
    try {
        // Verificar el refresh token
        const decoded = verifyToken(refreshToken);

        // Buscar el usuario
        const user = await User.findById(decoded.userId);
        if (!user || !user.activo) {
            throw new Error('Usuario no encontrado o inactivo');
        }

        // Generar nuevo access token
        const newAccessToken = generateToken({
            userId: user._id,
            email: user.email,
            rol: user.rol || 'usuario'
        }, 'access');

        return {
            success: true,
            data: {
                accessToken: newAccessToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '24h'
            }
        };
    } catch (error) {
        console.error('Error refrescando token:', error);
        return {
            success: false,
            message: 'Token de refresh inválido o expirado'
        };
    }
}

/**
 * Valida un token y retorna la información del usuario
 * @param {string} token - Token a validar
 * @returns {Object} Información del usuario o error
 */
export async function validateToken(token) {
    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);

        if (!user || !user.activo) {
            return {
                success: false,
                message: 'Usuario no encontrado o inactivo'
            };
        }

        return {
            success: true,
            data: {
                userId: user._id,
                email: user.email,
                rol: user.rol || 'usuario',
                nombre: user.nombre
            }
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
}

/**
 * Revoca un token (para logout)
 * @param {string} token - Token a revocar
 * @returns {Object} Resultado de la operación
 */
export function revokeToken(token) {
    // En una implementación más robusta, aquí se podría mantener
    // una lista negra de tokens revocados en la base de datos
    // Por ahora, simplemente retornamos éxito ya que los tokens
    // expirarán naturalmente
    return {
        success: true,
        message: 'Token revocado exitosamente'
    };
}
