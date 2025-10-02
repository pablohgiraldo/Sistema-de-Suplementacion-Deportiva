import rateLimit from 'express-rate-limit';

// Logger simple para rate limiting
const logRateLimit = (level, message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
};

// Rate limiting para endpoints de autenticación (muy restrictivo)
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos por IP
    message: {
        success: false,
        error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for auth endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method
        });

        res.status(429).json({
            success: false,
            error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
            code: 'AUTH_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiting para endpoints de registro (moderadamente restrictivo)
export const registerRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 registros por IP por hora
    message: {
        success: false,
        error: 'Demasiados intentos de registro. Intenta de nuevo en 1 hora.',
        code: 'REGISTER_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn'('Rate limit exceeded for register endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method
        });

        res.status(429).json({
            success: false,
            error: 'Demasiados intentos de registro. Intenta de nuevo en 1 hora.',
            code: 'REGISTER_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiting para endpoints de creación de órdenes (moderadamente restrictivo)
export const orderCreateRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 órdenes por IP por 15 minutos
    message: {
        success: false,
        error: 'Demasiadas órdenes creadas. Intenta de nuevo en 15 minutos.',
        code: 'ORDER_CREATE_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn'('Rate limit exceeded for order creation', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method,
            userId: req.user?.id
        });

        res.status(429).json({
            success: false,
            error: 'Demasiadas órdenes creadas. Intenta de nuevo en 15 minutos.',
            code: 'ORDER_CREATE_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiting para endpoints de administración (moderadamente restrictivo)
export const adminRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 requests por IP por 5 minutos
    message: {
        success: false,
        error: 'Demasiadas solicitudes de administración. Intenta de nuevo en 5 minutos.',
        code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn'('Rate limit exceeded for admin endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method,
            userId: req.user?.id
        });

        res.status(429).json({
            success: false,
            error: 'Demasiadas solicitudes de administración. Intenta de nuevo en 5 minutos.',
            code: 'ADMIN_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiting para endpoints de wishlist (permisivo)
export const wishlistRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 30, // máximo 30 requests por IP por minuto
    message: {
        success: false,
        error: 'Demasiadas solicitudes de wishlist. Intenta de nuevo en 1 minuto.',
        code: 'WISHLIST_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn'('Rate limit exceeded for wishlist endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method,
            userId: req.user?.id
        });

        res.status(429).json({
            success: false,
            error: 'Demasiadas solicitudes de wishlist. Intenta de nuevo en 1 minuto.',
            code: 'WISHLIST_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiting para endpoints de carrito (permisivo)
export const cartRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 50, // máximo 50 requests por IP por minuto
    message: {
        success: false,
        error: 'Demasiadas solicitudes de carrito. Intenta de nuevo en 1 minuto.',
        code: 'CART_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn'('Rate limit exceeded for cart endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method,
            userId: req.user?.id
        });

        res.status(429).json({
            success: false,
            error: 'Demasiadas solicitudes de carrito. Intenta de nuevo en 1 minuto.',
            code: 'CART_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiting para endpoints de productos (permisivo)
export const productRateLimit = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 100, // máximo 100 requests por IP por minuto
    message: {
        success: false,
        error: 'Demasiadas solicitudes de productos. Intenta de nuevo en 1 minuto.',
        code: 'PRODUCT_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn'('Rate limit exceeded for product endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method
        });

        res.status(429).json({
            success: false,
            error: 'Demasiadas solicitudes de productos. Intenta de nuevo en 1 minuto.',
            code: 'PRODUCT_RATE_LIMIT_EXCEEDED'
        });
    }
});

// Rate limiting para endpoints de inventario (moderadamente restrictivo)
export const inventoryRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 30, // máximo 30 requests por IP por 5 minutos
    message: {
        success: false,
        error: 'Demasiadas solicitudes de inventario. Intenta de nuevo en 5 minutos.',
        code: 'INVENTORY_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn'('Rate limit exceeded for inventory endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method,
            userId: req.user?.id
        });

        res.status(429).json({
            success: false,
            error: 'Demasiadas solicitudes de inventario. Intenta de nuevo en 5 minutos.',
            code: 'INVENTORY_RATE_LIMIT_EXCEEDED'
        });
    }
});
