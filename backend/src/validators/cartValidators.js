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

// Validaciones para agregar producto al carrito
export const validateAddToCart = [
    body('productId')
        .isMongoId()
        .withMessage('El ID del producto debe ser válido'),

    body('quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 100'),

    handleValidationErrors
];

// Validaciones para actualizar cantidad en el carrito
export const validateUpdateCartItem = [
    param('productId')
        .isMongoId()
        .withMessage('El ID del producto debe ser válido'),

    body('quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('La cantidad debe ser un número entero entre 1 y 100'),

    handleValidationErrors
];

// Validaciones para eliminar producto del carrito
export const validateRemoveFromCart = [
    param('productId')
        .isMongoId()
        .withMessage('El ID del producto debe ser válido'),

    handleValidationErrors
];

// Validaciones para obtener carrito (solo validar token en middleware)
export const validateGetCart = [
    // No se necesitan validaciones de body, solo del token en middleware
    handleValidationErrors
];

// Validaciones para limpiar carrito (solo validar token en middleware)
export const validateClearCart = [
    // No se necesitan validaciones de body, solo del token en middleware
    handleValidationErrors
];
