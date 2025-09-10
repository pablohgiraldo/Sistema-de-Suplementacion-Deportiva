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
import {
    validateRegister,
    validateLogin,
    validateRefreshToken,
    validateLogout,
    validateUpdateProfile,
    validateGetProfile,
    validateTokenStatus
} from '../validators/userValidators.js';

const router = express.Router();

// Rutas públicas (no requieren autenticación)
router.post('/register', validateRegister, registrarUsuario);
router.post('/login', validateLogin, iniciarSesion);
router.post('/refresh', validateRefreshToken, refrescarToken);
router.post('/logout', validateLogout, cerrarSesion);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateGetProfile, obtenerPerfil);
router.put('/profile', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateUpdateProfile, actualizarPerfil);
router.get('/token-status', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateTokenStatus, verificarEstadoToken);

export default router;
