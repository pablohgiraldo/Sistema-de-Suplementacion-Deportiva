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

// Validaciones mejoradas para operaciones de carrito
export const validateCartSecurity = [
    body('productId')
        .notEmpty()
        .withMessage('El ID del producto es obligatorio')
        .isMongoId()
        .withMessage('ID de producto inválido')
        .custom((value) => {
            // Verificar que no sea un ID de prueba
            const testIds = [
                '000000000000000000000000',
                '111111111111111111111111',
                'ffffffffffffffffffffffff'
            ];

            if (testIds.includes(value)) {
                throw new Error('ID de producto de prueba no permitido');
            }

            return true;
        }),

    body('quantity')
        .notEmpty()
        .withMessage('La cantidad es obligatoria')
        .isInt({ min: 1, max: 100 })
        .withMessage('La cantidad debe ser un número entre 1 y 100')
        .custom((value) => {
            // Verificar que no sea una cantidad sospechosa
            if (value > 50) {
                throw new Error('Cantidad sospechosamente alta');
            }

            // Detectar patrones de spam (cantidades repetitivas)
            if (value.toString().match(/(\d)\1{2,}/)) {
                throw new Error('Cantidad con patrón sospechoso');
            }

            return true;
        })
];

// Validaciones para actualización de items del carrito
export const validateCartUpdateSecurity = [
    param('productId')
        .isMongoId()
        .withMessage('ID de producto inválido')
        .custom((value) => {
            const testIds = [
                '000000000000000000000000',
                '111111111111111111111111',
                'ffffffffffffffffffffffff'
            ];

            if (testIds.includes(value)) {
                throw new Error('ID de producto de prueba no permitido');
            }

            return true;
        }),

    body('quantity')
        .notEmpty()
        .withMessage('La cantidad es obligatoria')
        .isInt({ min: 0, max: 100 })
        .withMessage('La cantidad debe ser un número entre 0 y 100')
        .custom((value) => {
            if (value > 50) {
                throw new Error('Cantidad sospechosamente alta');
            }

            if (value.toString().match(/(\d)\1{2,}/)) {
                throw new Error('Cantidad con patrón sospechoso');
            }

            return true;
        })
];

// Validaciones para operaciones de wishlist
export const validateWishlistSecurity = [
    body('productId')
        .notEmpty()
        .withMessage('El ID del producto es obligatorio')
        .isMongoId()
        .withMessage('ID de producto inválido')
        .custom((value) => {
            const testIds = [
                '000000000000000000000000',
                '111111111111111111111111',
                'ffffffffffffffffffffffff'
            ];

            if (testIds.includes(value)) {
                throw new Error('ID de producto de prueba no permitido');
            }

            return true;
        })
];

// Validaciones para parámetros de consulta del carrito
export const validateCartQuerySecurity = [
    query('includeInactive')
        .optional()
        .isBoolean()
        .withMessage('includeInactive debe ser un valor booleano'),

    query('calculateTotals')
        .optional()
        .isBoolean()
        .withMessage('calculateTotals debe ser un valor booleano'),

    query('validateStock')
        .optional()
        .isBoolean()
        .withMessage('validateStock debe ser un valor booleano')
];

// Validaciones para sincronización de inventario
export const validateInventorySyncSecurity = [
    body('items')
        .isArray({ min: 1, max: 100 })
        .withMessage('Los items deben ser un array con entre 1 y 100 elementos'),

    body('items.*.productId')
        .isMongoId()
        .withMessage('ID de producto inválido en items'),

    body('items.*.quantity')
        .isInt({ min: 0, max: 100 })
        .withMessage('Cantidad inválida en items'),

    body('items.*.price')
        .optional()
        .isFloat({ min: 0.01, max: 10000000 })
        .withMessage('Precio inválido en items'),

    body('forceUpdate')
        .optional()
        .isBoolean()
        .withMessage('forceUpdate debe ser un valor booleano')
];

// Validaciones para validación de stock
export const validateStockValidationSecurity = [
    body('items')
        .isArray({ min: 1, max: 100 })
        .withMessage('Los items deben ser un array con entre 1 y 100 elementos'),

    body('items.*.productId')
        .isMongoId()
        .withMessage('ID de producto inválido en items'),

    body('items.*.quantity')
        .isInt({ min: 1, max: 100 })
        .withMessage('Cantidad inválida en items'),

    body('checkAvailability')
        .optional()
        .isBoolean()
        .withMessage('checkAvailability debe ser un valor booleano'),

    body('reserveStock')
        .optional()
        .isBoolean()
        .withMessage('reserveStock debe ser un valor booleano')
];

// Validaciones para operaciones masivas del carrito
export const validateBulkCartOperationsSecurity = [
    body('operation')
        .isIn(['add', 'update', 'remove', 'clear'])
        .withMessage('Operación inválida. Debe ser: add, update, remove, o clear'),

    body('items')
        .isArray({ min: 1, max: 50 })
        .withMessage('Los items deben ser un array con entre 1 y 50 elementos'),

    body('items.*.productId')
        .isMongoId()
        .withMessage('ID de producto inválido en items'),

    body('items.*.quantity')
        .optional()
        .isInt({ min: 0, max: 100 })
        .withMessage('Cantidad inválida en items'),

    body('validateBeforeApply')
        .optional()
        .isBoolean()
        .withMessage('validateBeforeApply debe ser un valor booleano')
];

// Validaciones para estadísticas del carrito
export const validateCartStatsSecurity = [
    query('period')
        .optional()
        .isIn(['day', 'week', 'month', 'year'])
        .withMessage('Período inválido. Debe ser: day, week, month, o year'),

    query('includeAbandoned')
        .optional()
        .isBoolean()
        .withMessage('includeAbandoned debe ser un valor booleano'),

    query('includeCompleted')
        .optional()
        .isBoolean()
        .withMessage('includeCompleted debe ser un valor booleano'),

    query('groupBy')
        .optional()
        .isIn(['product', 'category', 'user', 'date'])
        .withMessage('groupBy inválido. Debe ser: product, category, user, o date')
];
