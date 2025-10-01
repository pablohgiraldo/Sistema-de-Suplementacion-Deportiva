/**
 * Middleware para verificar roles de usuario
 * @param {string|Array} allowedRoles - Rol o array de roles permitidos
 * @returns {Function} Middleware function
 */
export function requireRole(allowedRoles) {
    return (req, res, next) => {
        try {
            // Verificar que el usuario esté autenticado
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            // Verificar que el usuario esté activo
            if (!req.user.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo. Contacta al administrador'
                });
            }

            const userRole = req.userRole || req.user.role || req.user.rol || 'user';
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Rol insuficiente',
                    required: roles,
                    current: userRole,
                    user: {
                        id: req.user._id,
                        email: req.user.email,
                        nombre: req.user.nombre
                    }
                });
            }

            // Agregar información del rol al request para uso posterior
            req.userRole = userRole;
            req.allowedRoles = roles;

            next();
        } catch (error) {
            console.error('Error en middleware de roles:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor en verificación de roles'
            });
        }
    };
}

/**
 * Middleware para verificar si el usuario es administrador
 */
export const requireAdmin = requireRole('admin');

/**
 * Middleware para verificar si el usuario es moderador o administrador
 */
export const requireModerator = requireRole(['moderator', 'admin']);

/**
 * Middleware para verificar si el usuario es el propietario del recurso o administrador
 * @param {string} userIdParam - Nombre del parámetro que contiene el ID del usuario
 */
export function requireOwnershipOrAdmin(userIdParam = 'userId') {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userRole = req.userRole || req.user.role || req.user.rol || 'user';
            const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
            const currentUserId = req.userId || req.user._id.toString();

            // Permitir si es administrador o si es el propietario del recurso
            if (userRole === 'admin' || currentUserId === resourceUserId) {
                return next();
            }

            res.status(403).json({
                success: false,
                message: 'Acceso denegado. Solo el propietario o administrador puede acceder a este recurso'
            });
        } catch (error) {
            console.error('Error en middleware de ownership:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor en verificación de ownership'
            });
        }
    };
}

/**
 * Middleware específico para operaciones de stock
 * Verifica que el usuario sea administrador y registra la operación
 */
export function requireStockAccess() {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userRole = req.userRole || req.user.role || req.user.rol || 'user';

            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores pueden realizar operaciones de stock',
                    required: 'admin',
                    current: userRole
                });
            }

            // Registrar la operación de stock para auditoría
            const operation = {
                user: req.user._id,
                userEmail: req.user.email,
                action: req.method,
                endpoint: req.originalUrl,
                timestamp: new Date(),
                ip: req.ip || req.connection.remoteAddress
            };

            // Agregar información de la operación al request
            req.stockOperation = operation;

            console.log(`Operación de stock: ${operation.action} ${operation.endpoint} por ${operation.userEmail}`);

            next();
        } catch (error) {
            console.error('Error en middleware de stock access:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor en verificación de acceso a stock'
            });
        }
    };
}

/**
 * Middleware para verificar permisos de administración avanzada
 * Incluye validaciones adicionales de seguridad
 */
export function requireAdvancedAdmin() {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userRole = req.userRole || req.user.role || req.user.rol || 'user';

            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Se requieren permisos de administrador avanzado'
                });
            }

            // Verificar que el usuario tenga permisos especiales (si se implementa en el futuro)
            // Por ahora, solo verificar que sea admin activo
            if (!req.user.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Usuario inactivo. No se pueden realizar operaciones administrativas'
                });
            }

            // Registrar operación administrativa
            console.log(`Operación administrativa avanzada: ${req.method} ${req.originalUrl} por ${req.user.email}`);

            next();
        } catch (error) {
            console.error('Error en middleware de admin avanzado:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor en verificación de permisos administrativos'
            });
        }
    };
}

/**
 * Middleware específico para gestión de usuarios
 * Verifica permisos de administrador y registra operaciones críticas
 */
export function requireUserManagementAccess() {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userRole = req.userRole || req.user.role || req.user.rol || 'user';

            // Solo administradores pueden gestionar usuarios
            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores pueden gestionar usuarios',
                    required: 'admin',
                    current: userRole
                });
            }

            // Verificar que el administrador esté activo
            if (!req.user.activo) {
                return res.status(403).json({
                    success: false,
                    message: 'Cuenta de administrador inactiva'
                });
            }

            // Prevenir que el admin se modifique a sí mismo en operaciones críticas
            const targetUserId = req.params.id;
            const currentUserId = req.user.id || req.user._id.toString();

            if (targetUserId && targetUserId === currentUserId) {
                const criticalOperations = ['block', 'role', 'delete'];
                const operation = req.path.split('/').pop();

                if (criticalOperations.includes(operation)) {
                    return res.status(400).json({
                        success: false,
                        message: `No puedes modificar tu propia cuenta (operación: ${operation})`
                    });
                }
            }

            // Registrar operación de gestión de usuarios para auditoría
            const operation = {
                admin: req.user.email,
                action: req.method,
                endpoint: req.originalUrl,
                targetUser: targetUserId,
                timestamp: new Date(),
                ip: req.ip || req.connection.remoteAddress
            };

            console.log(`🔐 Gestión de usuarios: ${operation.action} ${operation.endpoint} por ${operation.admin}`);

            next();
        } catch (error) {
            console.error('Error en middleware de gestión de usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error del servidor en verificación de permisos de gestión de usuarios'
            });
        }
    };
}