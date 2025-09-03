const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authMiddleware = require('./middleware/authMiddleware');

const router = express.Router();

// Función helper para generar JWT
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// POST /api/users/register - Registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, contraseña, rol } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos (nombre, email, contraseña)'
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un usuario con este email'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new User({
      nombre,
      email,
      contraseña,
      rol: rol || 'usuario'
    });

    // Guardar usuario (la contraseña se encripta automáticamente)
    await nuevoUsuario.save();

    // Generar token JWT
    const token = generarToken(nuevoUsuario._id);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: nuevoUsuario.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);

    // Errores de validación de mongoose
    if (error.name === 'ValidationError') {
      const errores = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errores
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/users/login - Login de usuario
router.post('/login', async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    // Validación de campos requeridos
    if (!email || !contraseña) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario por email (incluir contraseña para comparar)
    const usuario = await User.findOne({ email }).select('+contraseña');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que el usuario esté activo
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

    // Generar token JWT
    const token = generarToken(usuario._id);

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: usuario.toJSON(),
        token
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// GET /api/users/profile - Obtener perfil del usuario autenticado
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // El usuario ya está disponible en req.user gracias al middleware
    res.json({
      success: true,
      message: 'Perfil obtenido exitosamente',
      data: {
        user: req.user.toJSON()
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

export default router;