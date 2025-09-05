import jwt from 'jsonwebtoken';

/**
 * Middleware para manejar la expiración de tokens JWT
 * Proporciona información adicional sobre el tiempo restante del token
 */
export function tokenExpirationMiddleware(req, res, next) {
    try {
        // Si no hay usuario autenticado, continuar
        if (!req.user) {
            return next();
        }

        // Obtener el token del header
        const authHeader = req.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);

        // Decodificar el token sin verificar (para obtener la expiración)
        const decoded = jwt.decode(token);

        if (decoded && decoded.exp) {
            const now = Math.floor(Date.now() / 1000);
            const exp = decoded.exp;
            const timeLeft = exp - now;

            // Agregar información de expiración al request
            req.tokenInfo = {
                expiresAt: new Date(exp * 1000),
                timeLeft: timeLeft,
                isExpiringSoon: timeLeft < 300, // 5 minutos
                isExpired: timeLeft <= 0
            };

            // Si el token está expirado, no debería llegar aquí por el authMiddleware
            // pero por seguridad, verificamos
            if (req.tokenInfo.isExpired) {
                return res.status(401).json({
                    success: false,
                    message: 'Token expirado',
                    code: 'TOKEN_EXPIRED'
                });
            }

            // Si el token está por expirar pronto, agregar header de advertencia
            if (req.tokenInfo.isExpiringSoon) {
                res.set('X-Token-Expires-Soon', 'true');
                res.set('X-Token-Expires-At', req.tokenInfo.expiresAt.toISOString());
            }
        }

        next();
    } catch (error) {
        console.error('Error en middleware de expiración de token:', error);
        next();
    }
}

/**
 * Middleware para verificar si el token está por expirar y sugerir refresh
 */
export function tokenRefreshSuggestionMiddleware(req, res, next) {
    try {
        if (req.tokenInfo && req.tokenInfo.isExpiringSoon) {
            res.set('X-Token-Refresh-Suggested', 'true');
            res.set('X-Token-Refresh-URL', '/api/users/refresh');
        }
        next();
    } catch (error) {
        console.error('Error en middleware de sugerencia de refresh:', error);
        next();
    }
}
