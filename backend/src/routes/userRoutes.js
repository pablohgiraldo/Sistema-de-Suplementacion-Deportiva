import express from 'express';
import {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfil,
    actualizarPerfil,
    refrescarToken,
    cerrarSesion
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);
router.post('/refresh', refrescarToken);
router.post('/logout', cerrarSesion);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, obtenerPerfil);
router.put('/profile', authMiddleware, actualizarPerfil);

export default router;
