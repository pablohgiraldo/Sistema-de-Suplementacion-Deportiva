import { body, query, param, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Datos de entrada inválidos',
            details: errors.array().map(error => ({
                field: error.path,
                message: error.msg,
                value: error.value,
                location: error.location
            })),
            timestamp: new Date().toISOString()
        });
    }
    next();
};

// Validaciones mejoradas para productos
export const validateProductSecurity = [
    body('name')
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres')
        .custom((value) => {
            // Detectar patrones sospechosos
            if (/[<>\"'&]/.test(value)) {
                throw new Error('El nombre contiene caracteres especiales no permitidos');
            }

            // Detectar patrones de spam
            const spamPatterns = [
                /free\s+shipping/i,
                /click\s+here/i,
                /buy\s+now/i,
                /limited\s+time/i,
                /act\s+now/i
            ];

            if (spamPatterns.some(pattern => pattern.test(value))) {
                throw new Error('El nombre contiene patrones de spam');
            }

            return true;
        })
        .trim(),

    body('description')
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ min: 10, max: 2000 })
        .withMessage('La descripción debe tener entre 10 y 2000 caracteres')
        .custom((value) => {
            // Detectar patrones sospechosos
            if (/[<>\"'&]/.test(value)) {
                throw new Error('La descripción contiene caracteres especiales no permitidos');
            }

            // Detectar enlaces sospechosos
            const linkPattern = /https?:\/\/[^\s]+/gi;
            const links = value.match(linkPattern);
            if (links) {
                const suspiciousDomains = [
                    'bit.ly', 'tinyurl.com', 'goo.gl', 't.co',
                    'shortened.link', 'redirect.me'
                ];

                const hasSuspiciousLink = links.some(link =>
                    suspiciousDomains.some(domain => link.includes(domain))
                );

                if (hasSuspiciousLink) {
                    throw new Error('La descripción contiene enlaces sospechosos');
                }
            }

            return true;
        }),

    body('price')
        .notEmpty()
        .withMessage('El precio es obligatorio')
        .isFloat({ min: 0.01, max: 10000000 })
        .withMessage('El precio debe estar entre $0.01 y $10,000,000')
        .custom((value) => {
            // Verificar que el precio no sea sospechosamente bajo o alto
            if (value < 1) {
                throw new Error('El precio es sospechosamente bajo');
            }

            if (value > 1000000) {
                throw new Error('El precio es sospechosamente alto');
            }

            // Verificar decimales (máximo 2)
            const decimalPlaces = (value.toString().split('.')[1] || '').length;
            if (decimalPlaces > 2) {
                throw new Error('El precio no puede tener más de 2 decimales');
            }

            return true;
        }),

    body('category')
        .notEmpty()
        .withMessage('La categoría es obligatoria')
        .isIn([
            'Proteínas', 'Creatina', 'Pre-entreno', 'Post-entreno',
            'Vitaminas', 'Minerales', 'Quemadores', 'Ganadores de peso',
            'Aminoácidos', 'Glutamina', 'BCAA', 'Otros'
        ])
        .withMessage('Categoría inválida'),

    body('brand')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('La marca debe tener entre 2 y 50 caracteres')
        .custom((value) => {
            if (value && /[<>\"'&]/.test(value)) {
                throw new Error('La marca contiene caracteres especiales no permitidos');
            }
            return true;
        })
        .trim(),

    body('imageUrl')
        .optional()
        .isURL()
        .withMessage('La URL de imagen debe ser válida')
        .custom((value) => {
            if (value) {
                // Verificar que sea una URL de imagen válida
                const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                const hasValidExtension = imageExtensions.some(ext =>
                    value.toLowerCase().includes(ext)
                );

                if (!hasValidExtension) {
                    throw new Error('La URL debe apuntar a una imagen válida');
                }

                // Verificar dominios permitidos
                const allowedDomains = [
                    'img.icons8.com', 'upload.wikimedia.org',
                    'www.paypalobjects.com', 'localhost'
                ];

                const url = new URL(value);
                const isAllowedDomain = allowedDomains.some(domain =>
                    url.hostname.includes(domain)
                );

                if (!isAllowedDomain) {
                    throw new Error('Dominio de imagen no permitido');
                }
            }

            return true;
        }),

    body('stock')
        .optional()
        .isInt({ min: 0, max: 100000 })
        .withMessage('El stock debe ser un número entre 0 y 100,000'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano')
];

// Validaciones para búsqueda de productos mejoradas
export const validateProductSearchSecurity = [
    query('q')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('La consulta de búsqueda debe tener entre 1 y 100 caracteres')
        .custom((value) => {
            if (value) {
                // Detectar patrones de inyección
                const injectionPatterns = [
                    /union\s+select/i,
                    /drop\s+table/i,
                    /delete\s+from/i,
                    /insert\s+into/i,
                    /update\s+set/i,
                    /or\s+1\s*=\s*1/i,
                    /and\s+1\s*=\s*1/i,
                    /script\s*>/i,
                    /javascript:/i,
                    /onload=/i,
                    /onerror=/i
                ];

                if (injectionPatterns.some(pattern => pattern.test(value))) {
                    throw new Error('Consulta de búsqueda contiene patrones sospechosos');
                }

                // Detectar caracteres especiales peligrosos
                if (/[<>\"'&]/.test(value)) {
                    throw new Error('La consulta contiene caracteres especiales no permitidos');
                }

                // Detectar patrones de spam
                const spamPatterns = [
                    /free\s+shipping/i,
                    /click\s+here/i,
                    /buy\s+now/i,
                    /limited\s+time/i,
                    /act\s+now/i,
                    /urgent/i,
                    /exclusive/i
                ];

                if (spamPatterns.some(pattern => pattern.test(value))) {
                    throw new Error('La consulta contiene patrones de spam');
                }
            }

            return true;
        }),

    query('category')
        .optional()
        .isIn([
            'Proteínas', 'Creatina', 'Pre-entreno', 'Post-entreno',
            'Vitaminas', 'Minerales', 'Quemadores', 'Ganadores de peso',
            'Aminoácidos', 'Glutamina', 'BCAA', 'Otros'
        ])
        .withMessage('Categoría inválida'),

    query('minPrice')
        .optional()
        .isFloat({ min: 0, max: 10000000 })
        .withMessage('Precio mínimo inválido'),

    query('maxPrice')
        .optional()
        .isFloat({ min: 0, max: 10000000 })
        .withMessage('Precio máximo inválido')
        .custom((value, { req }) => {
            const minPrice = parseFloat(req.query.minPrice);
            if (minPrice && value && value < minPrice) {
                throw new Error('El precio máximo debe ser mayor al precio mínimo');
            }
            return true;
        }),

    query('brand')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('La marca debe tener entre 2 y 50 caracteres')
        .custom((value) => {
            if (value && /[<>\"'&]/.test(value)) {
                throw new Error('La marca contiene caracteres especiales no permitidos');
            }
            return true;
        }),

    query('sort')
        .optional()
        .isIn(['name', 'price', 'createdAt', '-name', '-price', '-createdAt'])
        .withMessage('Campo de ordenamiento inválido'),

    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('La página debe ser un número entre 1 y 1000'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100')
];

// Validaciones para actualización de productos
export const validateProductUpdateSecurity = [
    param('id')
        .isMongoId()
        .withMessage('ID de producto inválido'),

    body('name')
        .optional()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres')
        .custom((value) => {
            if (value && /[<>\"'&]/.test(value)) {
                throw new Error('El nombre contiene caracteres especiales no permitidos');
            }
            return true;
        })
        .trim(),

    body('description')
        .optional()
        .isLength({ min: 10, max: 2000 })
        .withMessage('La descripción debe tener entre 10 y 2000 caracteres')
        .custom((value) => {
            if (value && /[<>\"'&]/.test(value)) {
                throw new Error('La descripción contiene caracteres especiales no permitidos');
            }
            return true;
        }),

    body('price')
        .optional()
        .isFloat({ min: 0.01, max: 10000000 })
        .withMessage('El precio debe estar entre $0.01 y $10,000,000')
        .custom((value) => {
            if (value) {
                const decimalPlaces = (value.toString().split('.')[1] || '').length;
                if (decimalPlaces > 2) {
                    throw new Error('El precio no puede tener más de 2 decimales');
                }
            }
            return true;
        }),

    body('stock')
        .optional()
        .isInt({ min: 0, max: 100000 })
        .withMessage('El stock debe ser un número entre 0 y 100,000'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano')
];
