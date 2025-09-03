import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Función para generar JWT
const generarJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token válido por 30 días
    });
};

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

        // Generar JWT
        const token = generarJWT(nuevoUsuario._id);

        // Respuesta exitosa (sin incluir contraseña)
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                usuario: nuevoUsuario,
                token
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

        // Generar JWT
        const token = generarJWT(usuario._id);

        // Respuesta exitosa
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                usuario,
                token
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
