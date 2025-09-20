/**
 * Middleware para auditoría de operaciones administrativas
 * Registra todas las operaciones realizadas por administradores
 */

export function adminAuditMiddleware() {
    return (req, res, next) => {
        // Solo registrar operaciones de administradores
        if (req.user && req.userRole === 'admin') {
            const auditLog = {
                timestamp: new Date(),
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    nombre: req.user.nombre
                },
                operation: {
                    method: req.method,
                    url: req.originalUrl,
                    endpoint: req.route?.path || req.path,
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent')
                },
                request: {
                    body: req.method !== 'GET' ? req.body : undefined,
                    params: req.params,
                    query: req.query
                }
            };

            // Log de auditoría (en producción se podría enviar a un servicio de logging)
            console.log('🔍 AUDIT LOG:', JSON.stringify(auditLog, null, 2));

            // Agregar información de auditoría al request
            req.auditLog = auditLog;
        }

        next();
    };
}

/**
 * Middleware para registrar operaciones de stock específicamente
 */
export function stockAuditMiddleware() {
    return (req, res, next) => {
        if (req.stockOperation) {
            const stockAuditLog = {
                ...req.stockOperation,
                details: {
                    productId: req.params.id,
                    quantity: req.body.quantity,
                    notes: req.body.notes,
                    timestamp: new Date()
                }
            };

            console.log('📦 STOCK AUDIT:', JSON.stringify(stockAuditLog, null, 2));
            req.stockAuditLog = stockAuditLog;
        }

        next();
    };
}

/**
 * Middleware para registrar intentos de acceso no autorizados
 */
export function unauthorizedAccessMiddleware() {
    return (req, res, next) => {
        const originalSend = res.send;

        res.send = function (data) {
            // Si la respuesta es 401 o 403, registrar el intento
            if (res.statusCode === 401 || res.statusCode === 403) {
                const unauthorizedLog = {
                    timestamp: new Date(),
                    ip: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent'),
                    method: req.method,
                    url: req.originalUrl,
                    statusCode: res.statusCode,
                    user: req.user ? {
                        id: req.user._id,
                        email: req.user.email,
                        role: req.userRole
                    } : null
                };

                console.log('🚨 UNAUTHORIZED ACCESS:', JSON.stringify(unauthorizedLog, null, 2));
            }

            return originalSend.call(this, data);
        };

        next();
    };
}

export default adminAuditMiddleware;
