import rateLimit from 'express-rate-limit';

// Logger simple para rate limiting
const logRateLimit = (level, message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, data);
};

// Rate limiting para endpoints de autenticación (balanceado para seguridad y usabilidad)
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 20 : 1000, // 20 intentos en producción para usuarios legítimos
    message: {
        success: false,
        error: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar requests exitosos en el límite
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
    max: process.env.NODE_ENV === 'production' ? 10 : 100, // 10 intentos permite registros legítimos
    message: {
        success: false,
        error: 'Demasiados intentos de registro. Intenta de nuevo en 1 hora.',
        code: 'REGISTER_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // No contar registros exitosos en el límite
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for register endpoint', {
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
    max: process.env.NODE_ENV === 'production' ? 10 : 1000, // muy permisivo en desarrollo
    message: {
        success: false,
        error: 'Demasiadas órdenes creadas. Intenta de nuevo en 15 minutos.',
        code: 'ORDER_CREATE_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for order creation', {
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
    max: process.env.NODE_ENV === 'production' ? 50 : 1000, // muy permisivo en desarrollo
    message: {
        success: false,
        error: 'Demasiadas solicitudes de administración. Intenta de nuevo en 5 minutos.',
        code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for admin endpoint', {
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
    max: process.env.NODE_ENV === 'production' ? 30 : 1000, // muy permisivo en desarrollo
    message: {
        success: false,
        error: 'Demasiadas solicitudes de wishlist. Intenta de nuevo en 1 minuto.',
        code: 'WISHLIST_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for wishlist endpoint', {
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
    max: process.env.NODE_ENV === 'production' ? 50 : 1000, // muy permisivo en desarrollo
    message: {
        success: false,
        error: 'Demasiadas solicitudes de carrito. Intenta de nuevo en 1 minuto.',
        code: 'CART_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for cart endpoint', {
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
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // muy permisivo en desarrollo
    message: {
        success: false,
        error: 'Demasiadas solicitudes de productos. Intenta de nuevo en 1 minuto.',
        code: 'PRODUCT_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for product endpoint', {
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
    windowMs: 1 * 60 * 1000, // 1 minuto (reducido de 5 minutos)
    max: process.env.NODE_ENV === 'production' ? 30 : 200, // más permisivo en desarrollo
    message: {
        success: false,
        error: 'Demasiadas solicitudes de inventario. Intenta de nuevo en 1 minuto.',
        code: 'INVENTORY_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for inventory endpoint', {
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

// Rate limiting para contacto (moderadamente restrictivo para prevenir spam)
export const contactRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 mensajes por 15 minutos para prevenir spam
    message: {
        success: false,
        error: 'Demasiados mensajes de contacto. Intenta de nuevo en 15 minutos.',
        code: 'CONTACT_RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        logRateLimit('warn', 'Rate limit exceeded for contact endpoint', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            endpoint: req.path,
            method: req.method
        });

        res.status(429).json({
            success: false,
            error: 'Demasiados mensajes de contacto. Intenta de nuevo en 15 minutos.',
            code: 'CONTACT_RATE_LIMIT_EXCEEDED'
        });
    }
});