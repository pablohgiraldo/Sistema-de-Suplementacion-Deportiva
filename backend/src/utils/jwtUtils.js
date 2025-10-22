import { generateToken, verifyToken } from '../config/jwt.js';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';

/**
 * Genera tokens para un usuario después del login
 * @param {Object} user - Usuario autenticado
 * @param {Object} deviceInfo - Información del dispositivo
 * @returns {Object} Objeto con tokens y datos del usuario
 */
export async function generateAuthTokens(user, deviceInfo = {}) {
    try {
        // Generar access token
        const accessToken = generateToken({
            userId: user._id,
            email: user.email,
            role: user.rol || 'usuario'
        }, 'access');

        // Crear refresh token en la base de datos
        const refreshTokenResult = await RefreshToken.createRefreshToken(user._id, {
            userAgent: deviceInfo.userAgent || 'Unknown',
            ipAddress: deviceInfo.ipAddress || 'Unknown',
            deviceType: deviceInfo.deviceType || 'unknown'
        });

        if (!refreshTokenResult.success) {
            throw new Error('Error creando refresh token');
        }

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
                    role: user.rol || 'usuario',
                    activo: user.activo,
                    lastLogin: new Date()
                },
                tokens: {
                    accessToken,
                    refreshToken: refreshTokenResult.token,
                    expiresIn: process.env.JWT_EXPIRES_IN || '1h' // Access tokens más cortos
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
 * @param {string} refreshTokenValue - Refresh token válido
 * @param {Object} deviceInfo - Información del dispositivo
 * @returns {Object} Nuevo access token y refresh token rotado
 */
export async function refreshAccessToken(refreshTokenValue, deviceInfo = {}) {
    try {
        // Verificar y rotar el refresh token
        const verifyResult = await RefreshToken.verifyAndRotate(refreshTokenValue, {
            userAgent: deviceInfo.userAgent || 'Unknown',
            ipAddress: deviceInfo.ipAddress || 'Unknown',
            deviceType: deviceInfo.deviceType || 'unknown'
        });

        if (!verifyResult.success) {
            return {
                success: false,
                message: verifyResult.message,
                shouldRevokeFamily: verifyResult.shouldRevokeFamily || false
            };
        }

        const user = verifyResult.user;

        // Generar nuevo access token
        const newAccessToken = generateToken({
            userId: user._id,
            email: user.email,
            role: user.rol || 'usuario'
        }, 'access');

        return {
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: verifyResult.newRefreshToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '1h'
            }
        };
    } catch (error) {
        console.error('Error refrescando token:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            shouldRevokeFamily: false
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
 * Revoca un refresh token (para logout)
 * @param {string} refreshTokenValue - Refresh token a revocar
 * @param {string} reason - Razón de revocación
 * @returns {Object} Resultado de la operación
 */
export async function revokeToken(refreshTokenValue, reason = 'manual_logout') {
    try {
        const result = await RefreshToken.revokeToken(refreshTokenValue, reason);
        
        if (result.success) {
            return {
                success: true,
                message: 'Token revocado exitosamente'
            };
        } else {
            return {
                success: false,
                message: result.error || 'Error revocando token'
            };
        }
    } catch (error) {
        console.error('Error revocando token:', error);
        return {
            success: false,
            message: 'Error interno del servidor'
        };
    }
}

/**
 * Revoca todos los tokens de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de revocación
 * @returns {Object} Resultado de la operación
 */
export async function revokeAllUserTokens(userId, reason = 'password_change') {
    try {
        const result = await RefreshToken.revokeAllUserTokens(userId, reason);
        
        if (result.success) {
            return {
                success: true,
                message: 'Todos los tokens del usuario revocados exitosamente'
            };
        } else {
            return {
                success: false,
                message: result.error || 'Error revocando tokens'
            };
        }
    } catch (error) {
        console.error('Error revocando tokens de usuario:', error);
        return {
            success: false,
            message: 'Error interno del servidor'
        };
    }
}
