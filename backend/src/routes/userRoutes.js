import express from 'express';
import {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfil,
    actualizarPerfil,
    refrescarToken,
    cerrarSesion,
    verificarEstadoToken
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);
router.post('/refresh', refrescarToken);
router.post('/logout', cerrarSesion);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, obtenerPerfil);
router.put('/profile', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, actualizarPerfil);
router.get('/token-status', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, verificarEstadoToken);

export default router;
