import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Modelo RefreshToken para almacenar tokens de actualización
 * 
 * Implementa mejores prácticas de seguridad:
 * - Almacenamiento seguro en base de datos
 * - Rotación de tokens
 * - Revocación efectiva
 * - Limpieza automática de tokens expirados
 */
const refreshTokenSchema = new mongoose.Schema({
    // Token hasheado (no almacenamos el token plano por seguridad)
    tokenHash: {
        type: String,
        required: [true, 'El hash del token es requerido'],
        unique: true,
        index: true
    },
    
    // Referencia al usuario propietario del token
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'La referencia al usuario es requerida'],
        index: true
    },
    
    // Familia de tokens (para rotación)
    tokenFamily: {
        type: String,
        required: true,
        default: () => crypto.randomUUID()
    },
    
    // Token padre (si es resultado de una rotación)
    parentToken: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RefreshToken',
        default: null
    },
    
    // Tokens hijos (para detectar reutilización)
    childTokens: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RefreshToken'
    }],
    
    // Estado del token
    isRevoked: {
        type: Boolean,
        default: false,
        index: true
    },
    
    // Razón de revocación
    revokedReason: {
        type: String,
        enum: ['manual_logout', 'password_change', 'suspicious_activity', 'security_breach', 'admin_action'],
        default: null
    },
    
    // Información del dispositivo/cliente
    deviceInfo: {
        userAgent: {
            type: String,
            maxlength: [500, 'User agent no puede exceder 500 caracteres']
        },
        ipAddress: {
            type: String,
            maxlength: [45, 'IP address no puede exceder 45 caracteres'] // IPv6
        },
        deviceType: {
            type: String,
            enum: ['desktop', 'mobile', 'tablet', 'unknown'],
            default: 'unknown'
        }
    },
    
    // Fechas de creación y expiración
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 0 // Configurado por TTL
    },
    
    // Fecha de expiración (calculada)
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    
    // Último uso del token
    lastUsedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // Número de usos (para detectar abuso)
    usageCount: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // Límite máximo de usos antes de requerir re-autenticación
    maxUsage: {
        type: Number,
        default: 100,
        min: 1
    }
}, {
    timestamps: true
});

// Índice TTL para limpieza automática de tokens expirados
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Índices compuestos para consultas eficientes
refreshTokenSchema.index({ user: 1, isRevoked: 1 });
refreshTokenSchema.index({ tokenFamily: 1, isRevoked: 1 });
refreshTokenSchema.index({ createdAt: -1 });
refreshTokenSchema.index({ lastUsedAt: -1 });

/**
 * Middleware pre-save: Calcular fecha de expiración
 */
refreshTokenSchema.pre('save', function(next) {
    if (this.isNew && !this.expiresAt) {
        // Por defecto, los refresh tokens expiran en 30 días
        const expiresInDays = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 30;
        this.expiresAt = new Date();
        this.expiresAt.setDate(this.expiresAt.getDate() + expiresInDays);
    }
    next();
});

/**
 * Método estático: Crear un nuevo refresh token
 * @param {string} userId - ID del usuario
 * @param {Object} deviceInfo - Información del dispositivo
 * @returns {Object} Token creado
 */
refreshTokenSchema.statics.createRefreshToken = async function(userId, deviceInfo = {}) {
    try {
        // Generar token aleatorio
        const tokenValue = crypto.randomBytes(64).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
        
        // Revocar todos los tokens activos del usuario para el mismo dispositivo (opcional)
        if (deviceInfo.userAgent && deviceInfo.ipAddress) {
            await this.revokeUserTokensForDevice(userId, deviceInfo.userAgent, deviceInfo.ipAddress, 'new_login');
        }
        
        // Crear nuevo token
        const refreshToken = new this({
            tokenHash,
            user: userId,
            deviceInfo: {
                userAgent: deviceInfo.userAgent || 'Unknown',
                ipAddress: deviceInfo.ipAddress || 'Unknown',
                deviceType: deviceInfo.deviceType || 'unknown'
            }
        });
        
        await refreshToken.save();
        
        return {
            success: true,
            token: tokenValue,
            refreshTokenData: refreshToken
        };
    } catch (error) {
        console.error('Error creando refresh token:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Método estático: Verificar y rotar refresh token
 * @param {string} tokenValue - Valor del token
 * @param {Object} deviceInfo - Información del dispositivo
 * @returns {Object} Resultado de la verificación
 */
refreshTokenSchema.statics.verifyAndRotate = async function(tokenValue, deviceInfo = {}) {
    try {
        const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
        
        // Buscar token activo
        const token = await this.findOne({
            tokenHash,
            isRevoked: false,
            expiresAt: { $gt: new Date() }
        }).populate('user');
        
        if (!token) {
            return {
                success: false,
                message: 'Token inválido o expirado',
                shouldRevokeFamily: false
            };
        }
        
        // Verificar que el usuario esté activo
        if (!token.user || !token.user.activo) {
            await this.revokeTokenFamily(token.tokenFamily, 'user_inactive');
            return {
                success: false,
                message: 'Usuario inactivo',
                shouldRevokeFamily: true
            };
        }
        
        // Verificar límite de usos
        token.usageCount += 1;
        token.lastUsedAt = new Date();
        
        if (token.usageCount > token.maxUsage) {
            await this.revokeTokenFamily(token.tokenFamily, 'max_usage_exceeded');
            return {
                success: false,
                message: 'Máximo uso del token excedido',
                shouldRevokeFamily: true
            };
        }
        
        await token.save();
        
        // Crear nuevo token (rotación)
        const newTokenResult = await this.createRefreshToken(token.user._id, deviceInfo);
        
        if (!newTokenResult.success) {
            return {
                success: false,
                message: 'Error creando nuevo token',
                shouldRevokeFamily: false
            };
        }
        
        const newToken = newTokenResult.refreshTokenData;
        
        // Marcar relación padre-hijo
        newToken.parentToken = token._id;
        newToken.tokenFamily = token.tokenFamily; // Mantener la misma familia
        await newToken.save();
        
        token.childTokens.push(newToken._id);
        await token.save();
        
        // Revocar el token anterior después de un breve período (para evitar problemas de concurrencia)
        setTimeout(async () => {
            try {
                await this.findByIdAndUpdate(token._id, {
                    isRevoked: true,
                    revokedReason: 'token_rotation'
                });
            } catch (error) {
                console.error('Error revocando token anterior:', error);
            }
        }, 5000); // 5 segundos de gracia
        
        return {
            success: true,
            user: token.user,
            newRefreshToken: newTokenResult.token,
            expiresIn: newToken.expiresAt
        };
        
    } catch (error) {
        console.error('Error verificando refresh token:', error);
        return {
            success: false,
            message: 'Error interno del servidor',
            shouldRevokeFamily: false
        };
    }
};

/**
 * Método estático: Revocar un token específico
 * @param {string} tokenValue - Valor del token
 * @param {string} reason - Razón de revocación
 */
refreshTokenSchema.statics.revokeToken = async function(tokenValue, reason = 'manual_logout') {
    try {
        const tokenHash = crypto.createHash('sha256').update(tokenValue).digest('hex');
        
        const token = await this.findOne({ tokenHash, isRevoked: false });
        if (token) {
            token.isRevoked = true;
            token.revokedReason = reason;
            await token.save();
        }
        
        return { success: true };
    } catch (error) {
        console.error('Error revocando token:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Método estático: Revocar toda la familia de tokens
 * @param {string} tokenFamily - Familia de tokens
 * @param {string} reason - Razón de revocación
 */
refreshTokenSchema.statics.revokeTokenFamily = async function(tokenFamily, reason = 'security_breach') {
    try {
        await this.updateMany(
            { tokenFamily, isRevoked: false },
            { 
                isRevoked: true, 
                revokedReason: reason 
            }
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error revocando familia de tokens:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Método estático: Revocar todos los tokens de un usuario
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de revocación
 */
refreshTokenSchema.statics.revokeAllUserTokens = async function(userId, reason = 'password_change') {
    try {
        await this.updateMany(
            { user: userId, isRevoked: false },
            { 
                isRevoked: true, 
                revokedReason: reason 
            }
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error revocando tokens de usuario:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Método estático: Revocar tokens de usuario por dispositivo
 */
refreshTokenSchema.statics.revokeUserTokensForDevice = async function(userId, userAgent, ipAddress, reason = 'new_login') {
    try {
        await this.updateMany(
            { 
                user: userId, 
                'deviceInfo.userAgent': userAgent,
                'deviceInfo.ipAddress': ipAddress,
                isRevoked: false 
            },
            { 
                isRevoked: true, 
                revokedReason: reason 
            }
        );
        
        return { success: true };
    } catch (error) {
        console.error('Error revocando tokens por dispositivo:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Método estático: Limpiar tokens expirados y revocados
 */
refreshTokenSchema.statics.cleanupExpiredTokens = async function() {
    try {
        const result = await this.deleteMany({
            $or: [
                { expiresAt: { $lt: new Date() } },
                { isRevoked: true, createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // 30 días
            ]
        });
        
        console.log(`🧹 Limpieza de tokens: ${result.deletedCount} tokens eliminados`);
        return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
        console.error('Error limpiando tokens expirados:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Método estático: Obtener tokens activos de un usuario
 */
refreshTokenSchema.statics.getUserActiveTokens = async function(userId) {
    try {
        const tokens = await this.find({
            user: userId,
            isRevoked: false,
            expiresAt: { $gt: new Date() }
        }).select('-tokenHash').populate('user', 'nombre email');
        
        return {
            success: true,
            tokens: tokens.map(token => ({
                id: token._id,
                deviceInfo: token.deviceInfo,
                createdAt: token.createdAt,
                lastUsedAt: token.lastUsedAt,
                expiresAt: token.expiresAt,
                usageCount: token.usageCount
            }))
        };
    } catch (error) {
        console.error('Error obteniendo tokens de usuario:', error);
        return { success: false, error: error.message };
    }
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;
