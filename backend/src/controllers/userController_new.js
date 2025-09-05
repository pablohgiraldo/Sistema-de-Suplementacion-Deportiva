import User from '../models/User.js';
import { generateAuthTokens, refreshAccessToken, revokeToken } from '../utils/jwtUtils.js';

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
                message: 'Ya existe un usuario con este email'
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
        const authResult = await generateAuthTokens(nuevoUsuario);

        // Respuesta exitosa
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: authResult.data
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
                message: 'Credenciales inválidas'
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
                message: 'Credenciales inválidas'
            });
        }

        // Generar tokens JWT usando la nueva configuración
        const authResult = await generateAuthTokens(usuario);

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: authResult.data
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

        // Refrescar el token usando la utilidad
        const result = await refreshAccessToken(refreshToken);

        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: result.message
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
            const result = revokeToken(refreshToken);
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
