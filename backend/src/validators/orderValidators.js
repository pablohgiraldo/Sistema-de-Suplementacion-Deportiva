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

// Validaciones para crear orden
export const validateCreateOrder = [
    body('paymentMethod')
        .notEmpty()
        .withMessage('El método de pago es obligatorio')
        .isIn(['credit_card', 'debit_card', 'paypal', 'cash', 'bank_transfer'])
        .withMessage('Método de pago inválido'),

    body('shippingAddress.street')
        .notEmpty()
        .withMessage('La dirección es obligatoria')
        .isLength({ min: 5, max: 200 })
        .withMessage('La dirección debe tener entre 5 y 200 caracteres')
        .trim(),

    body('shippingAddress.city')
        .notEmpty()
        .withMessage('La ciudad es obligatoria')
        .isLength({ min: 2, max: 50 })
        .withMessage('La ciudad debe tener entre 2 y 50 caracteres')
        .trim(),

    body('shippingAddress.state')
        .notEmpty()
        .withMessage('El estado es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El estado debe tener entre 2 y 50 caracteres')
        .trim(),

    body('shippingAddress.zipCode')
        .notEmpty()
        .withMessage('El código postal es obligatorio')
        .isLength({ min: 3, max: 10 })
        .withMessage('El código postal debe tener entre 3 y 10 caracteres')
        .trim(),

    body('shippingAddress.country')
        .notEmpty()
        .withMessage('El país es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El país debe tener entre 2 y 50 caracteres')
        .trim(),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
        .trim(),

    handleValidationErrors
];

// Validaciones para obtener órdenes
export const validateGetOrders = [
    query('status')
        .optional()
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Estado de orden inválido'),

    query('paymentStatus')
        .optional()
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Estado de pago inválido'),

    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe ser válida (ISO 8601)'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe ser válida (ISO 8601)'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),

    handleValidationErrors
];

// Validaciones para obtener orden por ID
export const validateGetOrderById = [
    param('id')
        .isMongoId()
        .withMessage('ID de orden inválido'),

    handleValidationErrors
];

// Validaciones para actualizar estado de orden
export const validateUpdateOrderStatus = [
    param('id')
        .isMongoId()
        .withMessage('ID de orden inválido'),

    body('status')
        .notEmpty()
        .withMessage('El estado es obligatorio')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Estado de orden inválido'),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
        .trim(),

    handleValidationErrors
];

// Validaciones para actualizar estado de pago
export const validateUpdatePaymentStatus = [
    param('id')
        .isMongoId()
        .withMessage('ID de orden inválido'),

    body('paymentStatus')
        .notEmpty()
        .withMessage('El estado de pago es obligatorio')
        .isIn(['pending', 'paid', 'failed', 'refunded'])
        .withMessage('Estado de pago inválido'),

    handleValidationErrors
];

// Validaciones para obtener estadísticas de ventas
export const validateGetSalesStats = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe ser válida (ISO 8601)'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe ser válida (ISO 8601)'),

    handleValidationErrors
];

// Validaciones para obtener ventas por período
export const validateGetSalesByPeriod = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe ser válida (ISO 8601)'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe ser válida (ISO 8601)'),

    query('groupBy')
        .optional()
        .isIn(['hour', 'day', 'week', 'month', 'year'])
        .withMessage('Agrupación inválida. Debe ser: hour, day, week, month, year'),

    handleValidationErrors
];

// Validaciones para obtener productos más vendidos
export const validateGetTopSellingProducts = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de inicio debe ser válida (ISO 8601)'),

    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de fin debe ser válida (ISO 8601)'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('El límite debe ser un número entre 1 y 50'),

    handleValidationErrors
];

// Validaciones para cancelar orden
export const validateCancelOrder = [
    param('id')
        .isMongoId()
        .withMessage('ID de orden inválido'),

    handleValidationErrors
];
