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

            const userRole = req.userRole || req.user.role || 'user';
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Rol insuficiente',
                    required: roles,
                    current: userRole
                });
            }

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

            const userRole = req.userRole || req.user.role || 'user';
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
