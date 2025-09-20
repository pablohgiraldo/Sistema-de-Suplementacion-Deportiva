/**
 * Middleware para manejar errores de rate limiting de manera más elegante
 */

export const rateLimitHandler = () => {
    return (req, res, next) => {
        // Verificar que res existe
        if (!res || typeof res.send !== 'function') {
            return next();
        }

        // Interceptar respuestas de rate limiting
        const originalSend = res.send;
        
        res.send = function(data) {
            // Si es un error de rate limiting, agregar headers útiles
            if (res.statusCode === 429) {
                res.set({
                    'Retry-After': Math.ceil(req.rateLimit?.resetTime / 1000) || 60,
                    'X-RateLimit-Limit': req.rateLimit?.limit || 'unknown',
                    'X-RateLimit-Remaining': req.rateLimit?.remaining || 0,
                    'X-RateLimit-Reset': req.rateLimit?.resetTime || Date.now() + 60000
                });
            }
            
            return originalSend.call(this, data);
        };
        
        next();
    };
};

/**
 * Middleware para logging de rate limiting
 */
export const rateLimitLogger = () => {
    return (req, res, next) => {
        // Verificar que res existe
        if (!res || typeof res.send !== 'function') {
            return next();
        }

        const originalSend = res.send;
        
        res.send = function(data) {
            if (res.statusCode === 429) {
                console.warn(`Rate limit exceeded for ${req.ip} on ${req.method} ${req.originalUrl}`, {
                    ip: req.ip,
                    userAgent: req.get('User-Agent'),
                    rateLimit: req.rateLimit,
                    timestamp: new Date().toISOString()
                });
            }
            
            return originalSend.call(this, data);
        };
        
        next();
    };
};

export default rateLimitHandler;