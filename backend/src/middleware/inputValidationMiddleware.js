import { body, query, param, validationResult } from 'express-validator';

// Middleware para sanitización de entrada
export const sanitizeInput = (req, res, next) => {
    // Sanitizar strings en body
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }

    // Sanitizar strings en query
    if (req.query) {
        Object.keys(req.query).forEach(key => {
            if (typeof req.query[key] === 'string') {
                req.query[key] = req.query[key].trim();
            }
        });
    }

    next();
};

// Middleware para validación de tamaño de payload
export const validatePayloadSize = (maxSize = '10mb') => {
    return (req, res, next) => {
        const contentLength = req.get('content-length');

        if (contentLength) {
            const sizeInBytes = parseInt(contentLength);
            const maxSizeInBytes = parseSize(maxSize);

            if (sizeInBytes > maxSizeInBytes) {
                return res.status(413).json({
                    success: false,
                    error: 'Payload demasiado grande',
                    maxSize: maxSize,
                    receivedSize: `${(sizeInBytes / 1024 / 1024).toFixed(2)}MB`
                });
            }
        }

        next();
    };
};

// Función auxiliar para convertir tamaños
function parseSize(size) {
    const units = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 * 1024,
        'gb': 1024 * 1024 * 1024
    };

    const match = size.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'mb').toLowerCase();

    return value * (units[unit] || units['mb']);
}

// Middleware para validación de Content-Type
export const validateContentType = (allowedTypes = ['application/json']) => {
    return (req, res, next) => {
        if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
            return next();
        }

        const contentType = req.get('content-type');

        if (!contentType) {
            return res.status(400).json({
                success: false,
                error: 'Content-Type header requerido',
                code: 'MISSING_CONTENT_TYPE'
            });
        }

        const isValidType = allowedTypes.some(type =>
            contentType.toLowerCase().includes(type.toLowerCase())
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

// Middleware para validación de headers de seguridad
export const validateSecurityHeaders = (req, res, next) => {
    // En desarrollo, solo validar que existe User-Agent
    if (process.env.NODE_ENV !== 'production') {
        const userAgent = req.get('user-agent');
        if (!userAgent) {
            return res.status(400).json({
                success: false,
                error: 'User-Agent header es requerido',
                code: 'MISSING_USER_AGENT'
            });
        }
        return next();
    }

    const userAgent = req.get('user-agent');
    
    if (!userAgent) {
        return res.status(400).json({
            success: false,
            error: 'User-Agent header es requerido',
            code: 'MISSING_USER_AGENT'
        });
    }
    
    if (userAgent.length < 10 || userAgent.length > 500) {
        return res.status(400).json({
            success: false,
            error: 'User-Agent header tiene longitud inválida',
            code: 'INVALID_USER_AGENT_LENGTH'
        });
    }
    
    // Detectar user agents sospechosos (solo en producción)
    const suspiciousPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /curl/i, /wget/i, /python/i, /java/i,
        /postman/i, /insomnia/i
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
    if (isSuspicious) {
        return res.status(400).json({
            success: false,
            error: 'User-Agent sospechoso detectado',
            code: 'SUSPICIOUS_USER_AGENT'
        });
    }
    
    next();
};

// Middleware para detección de ataques comunes
export const detectCommonAttacks = (req, res, next) => {
    // En desarrollo, solo aplicar validaciones básicas
    if (process.env.NODE_ENV !== 'production') {
        return next();
    }

    const url = (req.url || '').toLowerCase();
    const body = JSON.stringify(req.body || {}).toLowerCase();
    const query = JSON.stringify(req.query || {}).toLowerCase();

    // Patrones de ataques críticos (solo los más peligrosos)
    const criticalAttackPatterns = [
        // SQL Injection crítico
        /union\s+select/i,
        /drop\s+table/i,
        /delete\s+from/i,
        /insert\s+into/i,
        /update\s+set/i,
        /or\s+1\s*=\s*1/i,
        /and\s+1\s*=\s*1/i,

        // XSS crítico
        /<script[^>]*>/i,
        /javascript:/i,
        /onload\s*=/i,
        /onerror\s*=/i,

        // Path Traversal crítico
        /\.\.\//,
        /\.\.\\/,
        /%2e%2e%2f/i,
        /%2e%2e%5c/i,

        // Command Injection crítico
        /;\s*rm\s+/i,
        /;\s*cat\s+/i,
        /;\s*wget\s+/i,
        /;\s*curl\s+/i,

        // NoSQL Injection crítico
        /\$where/i,
        /\$regex/i
    ];

    const allContent = `${url} ${body} ${query}`;

    for (const pattern of criticalAttackPatterns) {
        if (pattern.test(allContent)) {
            console.log(`[SECURITY] Attack pattern detected: ${pattern} in ${req.method} ${req.url}`);
            return res.status(400).json({
                success: false,
                error: 'Patrón de ataque detectado',
                code: 'ATTACK_PATTERN_DETECTED',
                timestamp: new Date().toISOString()
            });
        }
    }

    next();
};

// Middleware para validación de rate limiting por IP
export const validateIPRateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;

    // Verificar IPs bloqueadas
    const blockedIPs = [
        '127.0.0.1',
        '::1',
        '0.0.0.0'
    ];

    if (blockedIPs.includes(ip)) {
        return res.status(403).json({
            success: false,
            error: 'IP bloqueada',
            code: 'IP_BLOCKED'
        });
    }

    // Verificar rangos de IP privados (solo en producción)
    if (process.env.NODE_ENV === 'production') {
        const privateIPRanges = [
            /^10\./,
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
            /^192\.168\./
        ];

        const isPrivateIP = privateIPRanges.some(range => range.test(ip));
        if (isPrivateIP) {
            return res.status(403).json({
                success: false,
                error: 'IP privada no permitida',
                code: 'PRIVATE_IP_NOT_ALLOWED'
            });
        }
    }

    next();
};

// Middleware para validación de referrer
export const validateReferrer = (req, res, next) => {
    const referrer = req.get('referer') || req.get('referrer');

    if (referrer) {
        const allowedReferrers = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:3000',
            'https://supergains-frontend.vercel.app'
        ];

        const isAllowedReferrer = allowedReferrers.some(allowed =>
            referrer.startsWith(allowed)
        );

        if (!isAllowedReferrer) {
            return res.status(403).json({
                success: false,
                error: 'Referrer no permitido',
                code: 'REFERRER_NOT_ALLOWED'
            });
        }
    }

    next();
};

// Middleware para logging de seguridad
export const securityLogger = (req, res, next) => {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logData = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            contentLength: res.get('content-length') || 0
        };

        // Log solo requests sospechosos o errores
        if (res.statusCode >= 400 || duration > 5000) {
            console.log('[SECURITY]', JSON.stringify(logData));
        }
    });

    next();
};
