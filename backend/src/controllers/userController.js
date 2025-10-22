import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateAuthTokens, refreshAccessToken, revokeToken, revokeAllUserTokens } from '../utils/jwtUtils.js';

// POST /api/users/register - Registrar nuevo usuario
export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, contraseña, rol } = req.body;

        // Validar campos requeridos
        if (!nombre || !email || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Nombre, email y contraseña son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await User.findOne({ email });
        if (usuarioExistente) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Crear nuevo usuario
        const nuevoUsuario = new User({
            nombre,
            email,
            contraseña,
            rol: rol || 'usuario' // Rol por defecto
        });

        // Guardar usuario (la contraseña se encripta automáticamente por el middleware pre-save)
        await nuevoUsuario.save();

        // Generar tokens JWT usando la nueva configuración
        const deviceInfo = {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress
        };
        const authResult = await generateAuthTokens(nuevoUsuario, deviceInfo);

        // Respuesta exitosa (formato compatible con frontend)
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: authResult.data.user,
                tokens: {
                    accessToken: authResult.data.tokens.accessToken,
                    refreshToken: authResult.data.tokens.refreshToken
                }
            }
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error);

        // Manejar errores de validación de Mongoose
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errores
            });
        }

        // Error de duplicado (email único)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con este email'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// POST /api/users/login - Iniciar sesión
export const iniciarSesion = async (req, res) => {
    try {
        const { email, contraseña } = req.body;

        // Validar campos requeridos
        if (!email || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar usuario por email (incluyendo contraseña para comparar)
        const usuario = await User.findOne({ email }).select('+contraseña');

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos'
            });
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        // Comparar contraseñas
        const contraseñaValida = await usuario.compararContraseña(contraseña);

        if (!contraseñaValida) {
            return res.status(401).json({
                success: false,
                message: 'Email o contraseña incorrectos'
            });
        }

        // Generar tokens JWT usando la nueva configuración
        const deviceInfo = {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress
        };
        const authResult = await generateAuthTokens(usuario, deviceInfo);

        // Respuesta exitosa (formato compatible con frontend)
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                user: authResult.data.user,
                tokens: {
                    accessToken: authResult.data.tokens.accessToken,
                    refreshToken: authResult.data.tokens.refreshToken
                }
            }
        });

    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// GET /api/users/profile - Obtener perfil del usuario autenticado
export const obtenerPerfil = async (req, res) => {
    try {
        // El usuario ya está disponible en req.user gracias al middleware de autenticación
        const usuario = req.user;

        res.json({
            success: true,
            message: 'Perfil obtenido exitosamente',
            data: {
                usuario
            }
        });

    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// PUT /api/users/profile - Actualizar perfil del usuario autenticado
export const actualizarPerfil = async (req, res) => {
    try {
        const { nombre, email } = req.body;
        const usuarioId = req.user._id;

        // Validar que al menos un campo sea proporcionado
        if (!nombre && !email) {
            return res.status(400).json({
                success: false,
                message: 'Al menos un campo (nombre o email) debe ser proporcionado'
            });
        }

        // Preparar datos para actualizar
        const datosActualizacion = {};
        if (nombre) datosActualizacion.nombre = nombre;
        if (email) datosActualizacion.email = email;

        // Actualizar usuario
        const usuarioActualizado = await User.findByIdAndUpdate(
            usuarioId,
            datosActualizacion,
            {
                new: true, // Devolver el documento actualizado
                runValidators: true // Ejecutar validaciones del schema
            }
        );

        if (!usuarioActualizado) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: {
                usuario: usuarioActualizado
            }
        });

    } catch (error) {
        console.error('Error al actualizar perfil:', error);

        // Manejar errores de validación
        if (error.name === 'ValidationError') {
            const errores = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Datos de entrada inválidos',
                errors: errores
            });
        }

        // Error de duplicado (email único)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un usuario con este email'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// POST /api/users/refresh - Refrescar token de acceso
export const refrescarToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Validar que se proporcione el refresh token
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token es requerido'
            });
        }

        // Refrescar el token usando la utilidad con información del dispositivo
        const deviceInfo = {
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress
        };

        const result = await refreshAccessToken(refreshToken, deviceInfo);

        if (!result.success) {
            // Si hay problemas de seguridad, responder con código apropiado
            const statusCode = result.shouldRevokeFamily ? 403 : 401;
            return res.status(statusCode).json({
                success: false,
                message: result.message,
                shouldRevokeFamily: result.shouldRevokeFamily || false
            });
        }

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Token refrescado exitosamente',
            data: result.data
        });

    } catch (error) {
        console.error('Error al refrescar token:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// POST /api/users/logout - Cerrar sesión
export const cerrarSesion = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        // Si se proporciona un refresh token, revocarlo
        if (refreshToken) {
            const result = await revokeToken(refreshToken, 'manual_logout');
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: result.message
                });
            }
        }

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });

    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// GET /api/users/token-status - Verificar estado del token
export const verificarEstadoToken = async (req, res) => {
    try {
        const usuario = req.user;
        const tokenInfo = req.tokenInfo;

        res.json({
            success: true,
            message: 'Token válido',
            data: {
                usuario: {
                    id: usuario._id,
                    email: usuario.email,
                    nombre: usuario.nombre,
                    rol: usuario.rol
                },
                token: {
                    valido: true,
                    expiraEn: tokenInfo?.expiresAt || null,
                    tiempoRestante: tokenInfo?.timeLeft || null,
                    expiraPronto: tokenInfo?.isExpiringSoon || false
                }
            }
        });

    } catch (error) {
        console.error('Error al verificar estado del token:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// GET /api/users - Listar todos los usuarios (solo para administradores)
export const listarUsuarios = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo administradores pueden ver la lista de usuarios.'
            });
        }

        // Parámetros de consulta
        const {
            page = 1,
            limit = 10,
            sortBy = 'fechaCreacion',
            sortOrder = 'desc',
            rol,
            activo,
            search
        } = req.query;

        // Construir filtro de búsqueda
        const filter = {};

        if (rol) {
            filter.rol = rol;
        }

        if (activo !== undefined) {
            filter.activo = activo === 'true';
        }

        if (search) {
            filter.$or = [
                { nombre: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        // Calcular paginación
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        // Obtener usuarios con paginación
        const usuarios = await User.find(filter, '-contraseña')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Contar total de usuarios
        const total = await User.countDocuments(filter);

        res.json({
            success: true,
            message: 'Usuarios obtenidos exitosamente',
            data: usuarios,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Error al listar usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// PUT /api/users/:id/block - Bloquear/desbloquear usuario (solo admin)
export const bloquearDesbloquearUsuario = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo administradores pueden bloquear usuarios.'
            });
        }

        const { id } = req.params;
        const { activo } = req.body;

        // Validar que se proporcionó el estado
        if (activo === undefined) {
            return res.status(400).json({
                success: false,
                message: 'El campo "activo" es requerido'
            });
        }

        // Buscar usuario
        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // No permitir que el admin se bloquee a sí mismo
        if (usuario._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes bloquear tu propia cuenta'
            });
        }

        // Actualizar estado
        usuario.activo = activo;
        await usuario.save();

        res.json({
            success: true,
            message: `Usuario ${activo ? 'desbloqueado' : 'bloqueado'} exitosamente`,
            data: {
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                activo: usuario.activo
            }
        });

    } catch (error) {
        console.error('Error al bloquear/desbloquear usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// PUT /api/users/:id/role - Cambiar rol de usuario (solo admin)
export const cambiarRolUsuario = async (req, res) => {
    try {
        // Verificar que el usuario sea administrador
        if (req.user.rol !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo administradores pueden cambiar roles.'
            });
        }

        const { id } = req.params;
        const { rol } = req.body;

        // Validar que se proporcionó el rol
        if (!rol) {
            return res.status(400).json({
                success: false,
                message: 'El campo "rol" es requerido'
            });
        }

        // Validar que el rol sea válido
        const rolesValidos = ['admin', 'usuario', 'moderador'];
        if (!rolesValidos.includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido. Valores permitidos: admin, usuario, moderador'
            });
        }

        // Buscar usuario
        const usuario = await User.findById(id);

        if (!usuario) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // No permitir que el admin cambie su propio rol
        if (usuario._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'No puedes cambiar tu propio rol'
            });
        }

        // Actualizar rol
        usuario.role = role;
        await usuario.save();

        res.json({
            success: true,
            message: 'Rol actualizado exitosamente',
            data: {
                _id: usuario._id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                activo: usuario.activo
            }
        });

    } catch (error) {
        console.error('Error al cambiar rol de usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// GET /api/users/sessions - Obtener sesiones activas del usuario
export const obtenerSesionesActivas = async (req, res) => {
    try {
        const userId = req.user._id;

        const result = await RefreshToken.getUserActiveTokens(userId);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.error || 'Error obteniendo sesiones'
            });
        }

        res.json({
            success: true,
            message: 'Sesiones activas obtenidas exitosamente',
            data: {
                sessions: result.tokens,
                count: result.tokens.length
            }
        });

    } catch (error) {
        console.error('Error obteniendo sesiones activas:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// DELETE /api/users/sessions/:sessionId - Revocar sesión específica
export const revocarSesion = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id;

        // Buscar el token por ID y verificar que pertenece al usuario
        const token = await RefreshToken.findOne({
            _id: sessionId,
            user: userId,
            isRevoked: false
        });

        if (!token) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada o ya revocada'
            });
        }

        // Revocar el token
        token.isRevoked = true;
        token.revokedReason = 'user_revocation';
        await token.save();

        res.json({
            success: true,
            message: 'Sesión revocada exitosamente'
        });

    } catch (error) {
        console.error('Error revocando sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// DELETE /api/users/sessions - Revocar todas las sesiones excepto la actual
export const revocarTodasLasSesiones = async (req, res) => {
    try {
        const userId = req.user._id;
        const { keepCurrent } = req.body;

        let tokensToRevoke = {
            user: userId,
            isRevoked: false
        };

        // Si keepCurrent es true, mantener la sesión actual (identificada por User-Agent e IP)
        if (keepCurrent) {
            const currentUserAgent = req.get('User-Agent');
            const currentIp = req.ip || req.connection.remoteAddress;

            tokensToRevoke.$and = [
                tokensToRevoke,
                {
                    $or: [
                        { 'deviceInfo.userAgent': { $ne: currentUserAgent } },
                        { 'deviceInfo.ipAddress': { $ne: currentIp } }
                    ]
                }
            ];
        }

        const result = await RefreshToken.updateMany(
            tokensToRevoke,
            {
                isRevoked: true,
                revokedReason: 'user_revoked_all_other_sessions'
            }
        );

        res.json({
            success: true,
            message: `${result.modifiedCount} sesiones revocadas exitosamente`,
            data: {
                revokedCount: result.modifiedCount
            }
        });

    } catch (error) {
        console.error('Error revocando todas las sesiones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};