import { body, validationResult } from 'express-validator';

// Middleware para validar headers de seguridad
export const validateSecurityHeaders = (req, res, next) => {
    const securityHeaders = {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'user-agent': req.headers['user-agent'],
        'referer': req.headers['referer'],
        'origin': req.headers['origin']
    };

    // Validar User-Agent (no debe estar vacío)
    if (!securityHeaders['user-agent'] || securityHeaders['user-agent'].length < 10) {
        return res.status(400).json({
            success: false,
            error: 'User-Agent header requerido',
            code: 'MISSING_USER_AGENT'
        });
    }

    // Detectar User-Agents sospechosos
    const suspiciousPatterns = [
        /bot/i,
        /crawler/i,
        /spider/i,
        /scraper/i,
        /curl/i,
        /wget/i,
        /python/i,
        /java/i,
        /php/i
    ];

    const isSuspicious = suspiciousPatterns.some(pattern =>
        pattern.test(securityHeaders['user-agent'])
    );

    if (isSuspicious && !req.path.includes('/api/health')) {
        console.log(`🚨 User-Agent sospechoso detectado: ${securityHeaders['user-agent']}`);
        // No bloquear, solo registrar para análisis
    }

    // Validar Origin para requests CORS
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://supergains-frontend.onrender.com',
            'https://supergains.vercel.app'
        ];

        if (securityHeaders['origin'] && !allowedOrigins.includes(securityHeaders['origin'])) {
            console.log(`🚨 Origin no permitido: ${securityHeaders['origin']}`);
            // En producción, podríamos bloquear esto
        }
    }

    next();
};

// Middleware para validar tamaño de payload
export const validatePayloadSize = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        const maxSizeBytes = parseSize(maxSize);

        if (contentLength > maxSizeBytes) {
            return res.status(413).json({
                success: false,
                error: 'Payload demasiado grande',
                code: 'PAYLOAD_TOO_LARGE',
                maxSize: maxSize
            });
        }

        next();
    };
};

// Función helper para convertir tamaño a bytes
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };

    const match = size.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();

    return value * units[unit];
}

// Middleware para validar tipos de contenido
export const validateContentType = (allowedTypes = ['application/json']) => {
    return (req, res, next) => {
        if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
            return next();
        }

        const contentType = req.headers['content-type'];

        if (!contentType) {
            return res.status(400).json({
                success: false,
                error: 'Content-Type header requerido',
                code: 'MISSING_CONTENT_TYPE'
            });
        }

        const isValidType = allowedTypes.some(type =>
            contentType && contentType.toLowerCase().includes(type.toLowerCase())
        );

        if (!isValidType) {
            return res.status(415).json({
                success: false,
                error: 'Tipo de contenido no soportado',
                code: 'UNSUPPORTED_MEDIA_TYPE',
                allowedTypes: allowedTypes
            });
        }

        next();
    };
};

// Middleware para detectar ataques comunes
export const detectCommonAttacks = (req, res, next) => {
    const url = (req.url || '').toLowerCase();
    const body = JSON.stringify(req.body || {}).toLowerCase();
    const query = JSON.stringify(req.query || {}).toLowerCase();

    // Detectar intentos de SQL injection
    const sqlPatterns = [
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i,
        /or\s+1\s*=\s*1/i,
        /';\s*drop/i,
        /--/,
        /\/\*.*\*\//
    ];

    const hasSqlInjection = sqlPatterns.some(pattern =>
        pattern.test(url) || pattern.test(body) || pattern.test(query)
    );

    if (hasSqlInjection) {
        console.log(`🚨 Posible SQL Injection detectado en ${req.method} ${req.url}`);
        return res.status(400).json({
            success: false,
            error: 'Request inválido detectado',
            code: 'INVALID_REQUEST'
        });
    }

    // Detectar intentos de XSS
    const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /<meta/i
    ];

    const hasXss = xssPatterns.some(pattern =>
        pattern.test(url) || pattern.test(body) || pattern.test(query)
    );

    if (hasXss) {
        console.log(`🚨 Posible XSS detectado en ${req.method} ${req.url}`);
        return res.status(400).json({
            success: false,
            error: 'Request inválido detectado',
            code: 'INVALID_REQUEST'
        });
    }

    // Detectar intentos de path traversal
    const pathTraversalPatterns = [
        /\.\.\//,
        /\.\.\\/,
        /%2e%2e%2f/i,
        /%2e%2e%5c/i
    ];

    const hasPathTraversal = pathTraversalPatterns.some(pattern =>
        pattern.test(url) || pattern.test(body) || pattern.test(query)
    );

    if (hasPathTraversal) {
        console.log(`🚨 Posible Path Traversal detectado en ${req.method} ${req.url}`);
        return res.status(400).json({
            success: false,
            error: 'Request inválido detectado',
            code: 'INVALID_REQUEST'
        });
    }

    next();
};

// Middleware para logging de seguridad
export const securityLogger = (req, res, next) => {
    const startTime = Date.now();

    // Interceptar la respuesta para logging
    const originalSend = res.send;
    res.send = function (data) {
        const duration = Date.now() - startTime;

        // Log de seguridad para requests importantes
        if (req.path.includes('/api/users/login') ||
            req.path.includes('/api/users/register') ||
            req.path.includes('/api/orders') ||
            res.statusCode >= 400) {

            const logData = {
                timestamp: new Date().toISOString(),
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                userAgent: req.headers['user-agent'],
                ip: req.ip || req.connection.remoteAddress,
                requestId: req.requestId
            };

            if (res.statusCode >= 400) {
                console.log('🚨 Security Event:', JSON.stringify(logData, null, 2));
            } else {
                console.log('🔒 Security Log:', JSON.stringify(logData, null, 2));
            }
        }

        originalSend.call(this, data);
    };

    next();
};

export default {
    validateSecurityHeaders,
    validatePayloadSize,
    validateContentType,
    detectCommonAttacks,
    securityLogger
};
