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

// Validaciones para crear orden (checkout - sin datos de tarjeta)
export const validateCreateOrder = [
    // Validación del método de pago
    body('paymentMethod')
        .notEmpty()
        .withMessage('El método de pago es obligatorio')
        .isIn(['credit_card', 'paypal', 'pse'])
        .withMessage('Método de pago inválido. Debe ser: credit_card, paypal, o pse'),

    // Validaciones de dirección de envío
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
        .isLength({ min: 5, max: 200 })
        .withMessage('La dirección debe tener entre 5 y 200 caracteres')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#\-.,]+$/)
        .withMessage('La dirección contiene caracteres inválidos')
        .trim(),

    body('shippingAddress.city')
        .notEmpty()
        .withMessage('La ciudad es obligatoria')
        .isLength({ min: 2, max: 50 })
        .withMessage('La ciudad debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('La ciudad solo puede contener letras y espacios')
        .trim(),

    body('shippingAddress.state')
        .notEmpty()
        .withMessage('El departamento es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El departamento debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El departamento solo puede contener letras y espacios')
        .trim(),

    body('shippingAddress.zipCode')
        .notEmpty()
        .withMessage('El código postal es obligatorio')
        .isLength({ min: 3, max: 10 })
        .withMessage('El código postal debe tener entre 3 y 10 caracteres')
        .matches(/^[0-9]+$/)
        .withMessage('El código postal solo puede contener números')
        .trim(),

    body('shippingAddress.country')
        .notEmpty()
        .withMessage('El país es obligatorio')
        .isLength({ min: 2, max: 50 })
        .withMessage('El país debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El país solo puede contener letras y espacios')
        .trim(),

    body('shippingAddress.phone')
        .notEmpty()
        .withMessage('El teléfono es obligatorio')
        .isLength({ min: 10, max: 15 })
        .withMessage('El teléfono debe tener entre 10 y 15 caracteres')
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Formato de teléfono inválido')
        .custom((value) => {
            // Validar que tenga al menos 10 dígitos numéricos
            const digits = value.replace(/[^0-9]/g, '');
            if (digits.length < 10) {
                throw new Error('El teléfono debe tener al menos 10 dígitos');
            }
            return true;
        })
        .withMessage('El teléfono debe tener al menos 10 dígitos')
        .trim(),

    // Validaciones opcionales
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?\-()]+$/)
        .withMessage('Las notas contienen caracteres inválidos')
        .trim(),

    // Validación de dirección de facturación (opcional)
    body('billingAddress.firstName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre de facturación debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El nombre de facturación solo puede contener letras y espacios')
        .trim(),

    body('billingAddress.lastName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido de facturación debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El apellido de facturación solo puede contener letras y espacios')
        .trim(),

    body('billingAddress.street')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('La dirección de facturación debe tener entre 5 y 200 caracteres')
        .matches(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s#\-.,]+$/)
        .withMessage('La dirección de facturación contiene caracteres inválidos')
        .trim(),

    body('billingAddress.city')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('La ciudad de facturación debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('La ciudad de facturación solo puede contener letras y espacios')
        .trim(),

    body('billingAddress.state')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('El departamento de facturación debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El departamento de facturación solo puede contener letras y espacios')
        .trim(),

    body('billingAddress.zipCode')
        .optional()
        .isLength({ min: 3, max: 10 })
        .withMessage('El código postal de facturación debe tener entre 3 y 10 caracteres')
        .matches(/^[0-9]+$/)
        .withMessage('El código postal de facturación solo puede contener números')
        .trim(),

    body('billingAddress.country')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('El país de facturación debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('El país de facturación solo puede contener letras y espacios')
        .trim(),

    body('billingAddress.phone')
        .optional()
        .isLength({ min: 10, max: 15 })
        .withMessage('El teléfono de facturación debe tener entre 10 y 15 caracteres')
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Formato de teléfono de facturación inválido')
        .custom((value) => {
            if (value) {
                const digits = value.replace(/[^0-9]/g, '');
                if (digits.length < 10) {
                    throw new Error('El teléfono de facturación debe tener al menos 10 dígitos');
                }
            }
            return true;
        })
        .withMessage('El teléfono de facturación debe tener al menos 10 dígitos')
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

// Validaciones para obtener resumen de órdenes
export const validateGetOrdersSummary = [
    query('startDate')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Fecha de inicio debe ser válida (YYYY-MM-DD)'),

    query('endDate')
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}$/)
        .withMessage('Fecha de fin debe ser válida (YYYY-MM-DD)'),

    handleValidationErrors
];

// Validaciones para cancelar orden
export const validateCancelOrder = [
    param('id')
        .isMongoId()
        .withMessage('ID de orden inválido'),

    handleValidationErrors
];
