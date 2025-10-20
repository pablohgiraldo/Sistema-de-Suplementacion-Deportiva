import express from 'express';
import {
    registrarUsuario,
    iniciarSesion,
    obtenerPerfil,
    actualizarPerfil,
    refrescarToken,
    cerrarSesion,
    verificarEstadoToken,
    listarUsuarios,
    bloquearDesbloquearUsuario,
    cambiarRolUsuario,
    obtenerSesionesActivas,
    revocarSesion,
    revocarTodasLasSesiones
} from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { requireAdmin, requireUserManagementAccess } from '../middleware/roleMiddleware.js';
import { tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware } from '../middleware/tokenExpirationMiddleware.js';
import { adminAuditMiddleware, unauthorizedAccessMiddleware } from '../middleware/adminAuditMiddleware.js';
import { authRateLimit, registerRateLimit, adminRateLimit } from '../middleware/rateLimitMiddleware.js';
import { sanitizeInput, validateContentType, detectCommonAttacks } from '../middleware/inputValidationMiddleware.js';
import {
    validateRegister,
    validateLogin,
    validateRefreshToken,
    validateLogout,
    validateUpdateProfile,
    validateGetProfile,
    validateTokenStatus,
    validateListUsers,
    validateBlockUser,
    validateChangeRole
} from '../validators/userValidators.js';
import {
    validateEmailSecurity,
    validatePasswordSecurity,
    handleValidationErrors
} from '../validators/securityValidators.js';

const router = express.Router();

// Aplicar middleware de auditoría a todas las rutas
router.use(adminAuditMiddleware());
router.use(unauthorizedAccessMiddleware());
router.use(sanitizeInput);
router.use(detectCommonAttacks);

// Rutas públicas (no requieren autenticación)
router.post('/register', registerRateLimit, validateContentType(['application/json']), validateEmailSecurity, validatePasswordSecurity, handleValidationErrors, validateRegister, registrarUsuario);
router.post('/login', authRateLimit, validateContentType(['application/json']), validateEmailSecurity, handleValidationErrors, validateLogin, iniciarSesion);
router.post('/refresh', authRateLimit, validateContentType(['application/json']), validateRefreshToken, refrescarToken);
router.post('/logout', validateContentType(['application/json']), validateLogout, cerrarSesion);

// Rutas protegidas (requieren autenticación)
router.get('/profile', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateGetProfile, obtenerPerfil);
router.put('/profile', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateContentType(['application/json']), validateEmailSecurity, handleValidationErrors, validateUpdateProfile, actualizarPerfil);
router.get('/token-status', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateTokenStatus, verificarEstadoToken);

// Rutas de gestión de sesiones (refresh tokens)
router.get('/sessions', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, obtenerSesionesActivas);
router.delete('/sessions/:sessionId', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, revocarSesion);
router.delete('/sessions', authMiddleware, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateContentType(['application/json']), revocarTodasLasSesiones);

// Rutas de administración (solo para administradores)
router.get('/', authMiddleware, requireAdmin, adminRateLimit, tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, validateListUsers, listarUsuarios);
router.put('/:id/block', authMiddleware, requireUserManagementAccess(), tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, adminRateLimit, validateContentType(['application/json']), handleValidationErrors, validateBlockUser, bloquearDesbloquearUsuario);
router.put('/:id/role', authMiddleware, requireUserManagementAccess(), tokenExpirationMiddleware, tokenRefreshSuggestionMiddleware, adminRateLimit, validateContentType(['application/json']), handleValidationErrors, validateChangeRole, cambiarRolUsuario);

export default router;
