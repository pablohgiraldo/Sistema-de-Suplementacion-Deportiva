import helmet from 'helmet';

// Configuración de Helmet para seguridad avanzada
export const securityConfig = helmet({
    // Content Security Policy (CSP)
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'", // Necesario para estilos inline
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com",
                "https://unpkg.com"
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Necesario para scripts inline
                "'unsafe-eval'", // Necesario para desarrollo
                "https://cdnjs.cloudflare.com",
                "https://unpkg.com",
                "https://maps.googleapis.com" // Para Google Maps si se usa
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "http:", // Para desarrollo local
                "https://img.icons8.com",
                "https://upload.wikimedia.org",
                "https://www.paypalobjects.com"
            ],
            connectSrc: [
                "'self'",
                "https://api.mongodb.com", // Para MongoDB Atlas
                "https://maps.googleapis.com",
                "ws://localhost:*", // Para desarrollo WebSocket
                "wss://localhost:*",
                "http://localhost:*", // Para desarrollo local
                "https://localhost:*" // Para desarrollo local HTTPS
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: [
                "'self'",
                "https://www.paypal.com", // Para PayPal
                "https://sandbox.paypal.com"
            ],
            workerSrc: ["'self'"],
            childSrc: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"], // Previene clickjacking
            baseUri: ["'self'"],
            manifestSrc: ["'self'"]
        },
        reportOnly: false // Cambiar a true en desarrollo para ver violaciones
    },

    // Cross-Origin Embedder Policy (COEP)
    crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad

    // Cross-Origin Opener Policy (COOP)
    crossOriginOpenerPolicy: { policy: "same-origin" },

    // Cross-Origin Resource Policy (CORP)
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // DNS Prefetch Control
    dnsPrefetchControl: { allow: false },

    // Expect-CT (Certificate Transparency)
    expectCt: {
        maxAge: 86400, // 24 horas
        enforce: true,
        reportUri: "/api/security/ct-report" // Endpoint para reportes
    },

    // Feature Policy (ahora Permissions Policy)
    permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: ["'self'"], // Permitir geolocalización solo para el mismo origen
        payment: ["'self'"], // Permitir pagos solo para el mismo origen
        usb: [],
        accelerometer: [],
        gyroscope: [],
        magnetometer: [],
        fullscreen: ["'self'"],
        syncXhr: ["'self'"]
    },

    // Hide X-Powered-By header
    hidePoweredBy: true,

    // HSTS (HTTP Strict Transport Security)
    hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
    },

    // IE No Open
    ieNoOpen: true,

    // No Sniff
    noSniff: true,

    // Origin Agent Cluster
    originAgentCluster: true,

    // Referrer Policy
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },

    // X-DNS-Prefetch-Control
    xssFilter: true
});

// Configuración específica para desarrollo
export const developmentSecurityConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
                "https://cdnjs.cloudflare.com",
                "https://unpkg.com"
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'", // Permitido en desarrollo
                "https://cdnjs.cloudflare.com",
                "https://unpkg.com",
                "https://maps.googleapis.com"
            ],
            fontSrc: [
                "'self'",
                "https://fonts.gstatic.com",
                "https://cdnjs.cloudflare.com"
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "http:",
                "https://img.icons8.com",
                "https://upload.wikimedia.org",
                "https://www.paypalobjects.com"
            ],
            connectSrc: [
                "'self'",
                "https://api.mongodb.com",
                "https://maps.googleapis.com",
                "ws://localhost:*",
                "wss://localhost:*",
                "http://localhost:*", // Para desarrollo local
                "https://localhost:*", // Para desarrollo local HTTPS
                "http://127.0.0.1:*", // Para desarrollo local
                "https://127.0.0.1:*" // Para desarrollo local HTTPS
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: [
                "'self'",
                "https://www.paypal.com",
                "https://sandbox.paypal.com"
            ],
            workerSrc: ["'self'"],
            childSrc: ["'self'"],
            formAction: ["'self'"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            manifestSrc: ["'self'"]
        },
        reportOnly: true // Solo reportar violaciones en desarrollo
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: { allow: false },
    expectCt: false, // Deshabilitado en desarrollo
    permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: ["'self'"],
        payment: ["'self'"],
        usb: [],
        accelerometer: [],
        gyroscope: [],
        magnetometer: [],
        fullscreen: ["'self'"],
        syncXhr: ["'self'"]
    },
    hidePoweredBy: true,
    hsts: false, // Deshabilitado en desarrollo
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
});

// Middleware para configurar seguridad según el entorno
export const configureSecurity = (app, isDevelopment = false) => {
    if (isDevelopment) {
        console.log('🔒 Configurando seguridad para desarrollo...');
        app.use(developmentSecurityConfig);
    } else {
        console.log('🔒 Configurando seguridad para producción...');
        app.use(securityConfig);
    }

    // Headers adicionales de seguridad
    app.use((req, res, next) => {
        // Server header personalizado
        res.setHeader('Server', 'SuperGains-API/1.0');

        // Cache-Control para endpoints sensibles
        if (req.path.includes('/api/users/login') || req.path.includes('/api/users/register')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        }

        // X-Request-ID para trazabilidad
        const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        res.setHeader('X-Request-ID', requestId);
        req.requestId = requestId;

        next();
    });

    // Endpoint para reportes de CSP (opcional)
    app.post('/api/security/csp-report', (req, res) => {
        console.log('🚨 CSP Violation Report:', JSON.stringify(req.body, null, 2));
        res.status(204).send();
    });

    // Endpoint para reportes de CT (Certificate Transparency)
    app.post('/api/security/ct-report', (req, res) => {
        console.log('🔒 Certificate Transparency Report:', JSON.stringify(req.body, null, 2));
        res.status(204).send();
    });
};

export default {
    securityConfig,
    developmentSecurityConfig,
    configureSecurity
};
