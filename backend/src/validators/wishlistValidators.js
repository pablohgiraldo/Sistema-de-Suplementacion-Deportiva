import { body, param, validationResult } from 'express-validator';

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

// Validaciones para agregar producto a wishlist
export const validateAddProduct = [
    body('productId')
        .notEmpty()
        .withMessage('El ID del producto es requerido')
        .isMongoId()
        .withMessage('ID de producto inválido'),

    handleValidationErrors
];

// Validaciones para remover producto de wishlist
export const validateRemoveProduct = [
    param('productId')
        .notEmpty()
        .withMessage('El ID del producto es requerido')
        .isMongoId()
        .withMessage('ID de producto inválido'),

    handleValidationErrors
];

// Validaciones para verificar producto en wishlist
export const validateCheckProduct = [
    body('productId')
        .notEmpty()
        .withMessage('El ID del producto es requerido')
        .isMongoId()
        .withMessage('ID de producto inválido'),

    handleValidationErrors
];

