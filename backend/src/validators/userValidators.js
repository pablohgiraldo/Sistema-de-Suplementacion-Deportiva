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
                value: error.value
            }))
        });
    }
    next();
};

// Validaciones para registro de usuario
export const validateRegister = [
    body('nombre')
        .notEmpty()
        .withMessage('El nombre es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .trim(),

    body('email')
        .isEmail()
        .withMessage('El email debe ser válido')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('El email no puede tener más de 100 caracteres'),

    body('contraseña')
        .isLength({ min: 6, max: 100 })
        .withMessage('La contraseña debe tener entre 6 y 100 caracteres')
        .custom((value) => {
            // Verificar que tenga al menos una minúscula
            if (!/[a-z]/.test(value)) {
                throw new Error('La contraseña debe contener al menos una letra minúscula');
            }
            // Verificar que tenga al menos una mayúscula
            if (!/[A-Z]/.test(value)) {
                throw new Error('La contraseña debe contener al menos una letra mayúscula');
            }
            // Verificar que tenga al menos un número
            if (!/\d/.test(value)) {
                throw new Error('La contraseña debe contener al menos un número');
            }
            return true;
        }),

    body('rol')
        .optional()
        .isIn(['usuario', 'admin', 'moderador'])
        .withMessage('El rol debe ser: usuario, admin o moderador'),

    handleValidationErrors
];

// Validaciones para login
export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('El email debe ser válido')
        .normalizeEmail(),

    body('contraseña')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
        .isLength({ min: 1, max: 100 })
        .withMessage('La contraseña no puede estar vacía'),

    handleValidationErrors
];

// Validaciones para refresh token
export const validateRefreshToken = [
    body('refreshToken')
        .notEmpty()
        .withMessage('El refresh token es obligatorio')
        .isJWT()
        .withMessage('El refresh token debe ser un JWT válido'),

    handleValidationErrors
];

// Validaciones para logout
export const validateLogout = [
    body('refreshToken')
        .notEmpty()
        .withMessage('El refresh token es obligatorio')
        .isJWT()
        .withMessage('El refresh token debe ser un JWT válido'),

    handleValidationErrors
];

// Validaciones para actualizar perfil
export const validateUpdateProfile = [
    body('nombre')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .trim(),

    body('email')
        .optional()
        .isEmail()
        .withMessage('El email debe ser válido')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('El email no puede tener más de 100 caracteres'),

    handleValidationErrors
];

// Validaciones para obtener perfil (solo validar token en middleware)
export const validateGetProfile = [
    // No se necesitan validaciones de body, solo del token en middleware
    handleValidationErrors
];

// Validaciones para verificar estado del token
export const validateTokenStatus = [
    // No se necesitan validaciones de body, solo del token en middleware
    handleValidationErrors
];
