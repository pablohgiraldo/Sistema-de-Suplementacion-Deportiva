import { body, query, param, validationResult } from 'express-validator';

// Middleware para manejar errores de validación con más detalles
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

// Validaciones de seguridad para headers
export const validateSecurityHeaders = [
    // Esta validación se maneja en el middleware inputValidationMiddleware.js
    // para evitar problemas de compatibilidad con express-validator
];

// Validaciones mejoradas para emails
export const validateEmailSecurity = [
    body('email')
        .isEmail()
        .withMessage('El email debe ser válido')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('El email no puede tener más de 100 caracteres')
        .custom((value) => {
            // Detectar emails temporales o sospechosos
            const suspiciousDomains = [
                '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
                'mailinator.com', 'throwaway.email', 'temp-mail.org'
            ];

            const domain = value.split('@')[1]?.toLowerCase();
            if (suspiciousDomains.includes(domain)) {
                throw new Error('Dominio de email temporal no permitido');
            }

            // Detectar patrones sospechosos
            if (/[<>\"'&]/.test(value)) {
                throw new Error('Email contiene caracteres sospechosos');
            }

            return true;
        })
];

// Validaciones mejoradas para contraseñas
export const validatePasswordSecurity = [
    body('contraseña')
        .isLength({ min: 8, max: 128 })
        .withMessage('La contraseña debe tener entre 8 y 128 caracteres')
        .custom((value) => {
            // Verificar complejidad de contraseña
            const hasLowercase = /[a-z]/.test(value);
            const hasUppercase = /[A-Z]/.test(value);
            const hasNumbers = /\d/.test(value);
            const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

            if (!hasLowercase) {
                throw new Error('La contraseña debe contener al menos una letra minúscula');
            }
            if (!hasUppercase) {
                throw new Error('La contraseña debe contener al menos una letra mayúscula');
            }
            if (!hasNumbers) {
                throw new Error('La contraseña debe contener al menos un número');
            }
            if (!hasSpecialChars) {
                throw new Error('La contraseña debe contener al menos un carácter especial');
            }

            // Detectar contraseñas comunes
            const commonPasswords = [
                'password', '123456', 'qwerty', 'abc123', 'password123',
                'admin', 'letmein', 'welcome', 'monkey', 'dragon'
            ];

            if (commonPasswords.includes(value.toLowerCase())) {
                throw new Error('La contraseña es demasiado común');
            }

            // Detectar patrones secuenciales
            if (/(.)\1{2,}/.test(value)) {
                throw new Error('La contraseña no puede tener caracteres repetidos consecutivos');
            }

            return true;
        })
];

// Validaciones para datos de tarjeta de crédito mejoradas
export const validateCreditCardSecurity = [
    body('cardNumber')
        .notEmpty()
        .withMessage('El número de tarjeta es obligatorio')
        .matches(/^[0-9\s]{13,19}$/)
        .withMessage('Formato de número de tarjeta inválido')
        .custom((value) => {
            const digits = value.replace(/\s/g, '');

            // Validación de algoritmo de Luhn mejorada
            let sum = 0;
            let isEven = false;

            for (let i = digits.length - 1; i >= 0; i--) {
                let digit = parseInt(digits[i]);

                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }

                sum += digit;
                isEven = !isEven;
            }

            if (sum % 10 !== 0) {
                throw new Error('Número de tarjeta inválido');
            }

            // Detectar números de tarjeta de prueba
            const testNumbers = [
                '4111111111111111', '4000000000000002', '5555555555554444',
                '2223003122003222', '378282246310005'
            ];

            if (testNumbers.includes(digits)) {
                throw new Error('Número de tarjeta de prueba no permitido');
            }

            return true;
        }),

    body('expiryDate')
        .notEmpty()
        .withMessage('La fecha de expiración es obligatoria')
        .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
        .withMessage('Formato de fecha inválido (MM/YY)')
        .custom((value) => {
            const [month, year] = value.split('/');
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100;
            const currentMonth = currentDate.getMonth() + 1;

            const cardYear = parseInt(year);
            const cardMonth = parseInt(month);

            if (cardYear < currentYear ||
                (cardYear === currentYear && cardMonth < currentMonth)) {
                throw new Error('La tarjeta ha expirado');
            }

            // Verificar que no sea más de 10 años en el futuro
            if (cardYear > currentYear + 10) {
                throw new Error('Fecha de expiración inválida');
            }

            return true;
        }),

    body('cvv')
        .notEmpty()
        .withMessage('El CVV es obligatorio')
        .matches(/^\d{3,4}$/)
        .withMessage('CVV debe tener 3 o 4 dígitos')
        .custom((value) => {
            // Detectar CVVs de prueba
            const testCVVs = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];
            if (testCVVs.includes(value)) {
                throw new Error('CVV de prueba no permitido');
            }
            return true;
        })
];

// Validaciones para direcciones mejoradas
export const validateAddressSecurity = [
    body('shippingAddress.firstName')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios')
        .trim(),

    body('shippingAddress.lastName')
        .notEmpty()
        .withMessage('El apellido es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido solo puede contener letras y espacios')
        .trim(),

    body('shippingAddress.street')
        .notEmpty()
        .withMessage('La dirección es obligatoria')
        .isLength({ min: 10, max: 200 })
        .withMessage('La dirección debe tener entre 10 y 200 caracteres')
        .custom((value) => {
            // Detectar patrones sospechosos en direcciones
            if (/[<>\"'&]/.test(value)) {
                throw new Error('La dirección contiene caracteres sospechosos');
            }

            // Verificar que tenga al menos un número (para dirección válida)
            if (!/\d/.test(value)) {
                throw new Error('La dirección debe contener al menos un número');
            }

            return true;
        }),

    body('shippingAddress.phone')
        .notEmpty()
        .withMessage('El teléfono es obligatorio')
        .matches(/^[+]?[0-9\s\-\(\)]{10,15}$/)
        .withMessage('Formato de teléfono inválido')
        .custom((value) => {
            const digits = value.replace(/[\s\-\(\)\+]/g, '');
            if (digits.length < 10 || digits.length > 15) {
                throw new Error('El teléfono debe tener entre 10 y 15 dígitos');
            }
            return true;
        })
];

// Validaciones para IDs de MongoDB
export const validateMongoId = [
    param('id')
        .isMongoId()
        .withMessage('ID inválido')
        .custom((value) => {
            // Verificar que no sea un ID de prueba común
            const testIds = [
                '000000000000000000000000',
                '111111111111111111111111',
                'ffffffffffffffffffffffff'
            ];

            if (testIds.includes(value)) {
                throw new Error('ID de prueba no permitido');
            }

            return true;
        })
];

// Validaciones para consultas de búsqueda
export const validateSearchQuery = [
    query('q')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('La consulta de búsqueda debe tener entre 1 y 100 caracteres')
        .custom((value) => {
            if (value) {
                // Detectar patrones de inyección SQL básicos
                const sqlPatterns = [
                    /union\s+select/i,
                    /drop\s+table/i,
                    /delete\s+from/i,
                    /insert\s+into/i,
                    /update\s+set/i,
                    /or\s+1\s*=\s*1/i,
                    /and\s+1\s*=\s*1/i
                ];

                if (sqlPatterns.some(pattern => pattern.test(value))) {
                    throw new Error('Consulta de búsqueda contiene patrones sospechosos');
                }

                // Detectar caracteres especiales peligrosos
                if (/[<>\"'&]/.test(value)) {
                    throw new Error('La consulta contiene caracteres especiales no permitidos');
                }
            }

            return true;
        }),

    query('page')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('La página debe ser un número entre 1 y 1000'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100')
];

// Validaciones para archivos (si se implementan)
export const validateFileUpload = [
    body('file')
        .custom((value, { req }) => {
            if (!req.file) {
                throw new Error('Archivo requerido');
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                throw new Error('Tipo de archivo no permitido');
            }

            const maxSize = 5 * 1024 * 1024; // 5MB
            if (req.file.size > maxSize) {
                throw new Error('El archivo es demasiado grande (máximo 5MB)');
            }

            return true;
        })
];
