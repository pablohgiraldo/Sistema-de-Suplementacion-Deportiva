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

// Validaciones para crear producto
export const validateCreateProduct = [
    body('name')
        .notEmpty()
        .withMessage('El nombre del producto es obligatorio')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .trim(),

    body('brand')
        .optional()
        .isLength({ max: 50 })
        .withMessage('La marca no puede tener más de 50 caracteres')
        .trim(),

    body('price')
        .isNumeric()
        .withMessage('El precio debe ser un número')
        .isFloat({ min: 0, max: 10000 })
        .withMessage('El precio debe estar entre 0 y 10,000'),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),

    body('imageUrl')
        .optional()
        .isURL()
        .withMessage('La URL de la imagen debe ser válida'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede tener más de 500 caracteres')
        .trim(),

    body('categories')
        .optional()
        .isArray({ max: 10 })
        .withMessage('No puede tener más de 10 categorías')
        .custom((categories) => {
            if (categories && categories.some(cat => typeof cat !== 'string' || cat.length > 50)) {
                throw new Error('Cada categoría debe ser una cadena de máximo 50 caracteres');
            }
            return true;
        }),

    handleValidationErrors
];

// Validaciones para actualizar producto
export const validateUpdateProduct = [
    param('id')
        .isMongoId()
        .withMessage('ID de producto inválido'),

    body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres')
        .trim(),

    body('brand')
        .optional()
        .isLength({ max: 50 })
        .withMessage('La marca no puede tener más de 50 caracteres')
        .trim(),

    body('price')
        .optional()
        .isNumeric()
        .withMessage('El precio debe ser un número')
        .isFloat({ min: 0, max: 10000 })
        .withMessage('El precio debe estar entre 0 y 10,000'),

    body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock debe ser un número entero mayor o igual a 0'),

    body('imageUrl')
        .optional()
        .isURL()
        .withMessage('La URL de la imagen debe ser válida'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede tener más de 500 caracteres')
        .trim(),

    body('categories')
        .optional()
        .isArray({ max: 10 })
        .withMessage('No puede tener más de 10 categorías')
        .custom((categories) => {
            if (categories && categories.some(cat => typeof cat !== 'string' || cat.length > 50)) {
                throw new Error('Cada categoría debe ser una cadena de máximo 50 caracteres');
            }
            return true;
        }),

    handleValidationErrors
];

// Validaciones para obtener producto por ID
export const validateGetProductById = [
    param('id')
        .isMongoId()
        .withMessage('ID de producto inválido'),

    handleValidationErrors
];

// Validaciones para eliminar producto
export const validateDeleteProduct = [
    param('id')
        .isMongoId()
        .withMessage('ID de producto inválido'),

    handleValidationErrors
];

// Validaciones para obtener productos con filtros
export const validateGetProducts = [
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),

    query('brand')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('La marca debe tener entre 1 y 50 caracteres')
        .trim(),

    query('price_min')
        .optional()
        .isNumeric()
        .withMessage('El precio mínimo debe ser un número')
        .isFloat({ min: 0 })
        .withMessage('El precio mínimo debe ser mayor o igual a 0'),

    query('price_max')
        .optional()
        .isNumeric()
        .withMessage('El precio máximo debe ser un número')
        .isFloat({ min: 0 })
        .withMessage('El precio máximo debe ser mayor o igual a 0'),

    query('category')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Las categorías deben tener entre 1 y 200 caracteres')
        .trim(),

    query('exclude')
        .optional()
        .isMongoId()
        .withMessage('El ID de exclusión debe ser un ID válido de MongoDB'),

    // Validación personalizada para verificar que price_min <= price_max
    query().custom((query) => {
        if (query.price_min && query.price_max && parseFloat(query.price_min) > parseFloat(query.price_max)) {
            throw new Error('El precio mínimo no puede ser mayor al precio máximo');
        }
        return true;
    }),

    handleValidationErrors
];

// Validaciones para búsqueda de productos
export const validateSearchProducts = [
    query('q')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('El término de búsqueda debe tener entre 1 y 100 caracteres')
        .trim(),

    query('category')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Las categorías deben tener entre 1 y 200 caracteres')
        .trim(),

    query('brand')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Las marcas deben tener entre 1 y 200 caracteres')
        .trim(),

    query('price_min')
        .optional()
        .isNumeric()
        .withMessage('El precio mínimo debe ser un número')
        .isFloat({ min: 0 })
        .withMessage('El precio mínimo debe ser mayor o igual a 0'),

    query('price_max')
        .optional()
        .isNumeric()
        .withMessage('El precio máximo debe ser un número')
        .isFloat({ min: 0 })
        .withMessage('El precio máximo debe ser mayor o igual a 0'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),

    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),

    query('sortBy')
        .optional()
        .isIn(['score', 'name', 'price', 'createdAt', 'updatedAt'])
        .withMessage('El ordenamiento debe ser: score, name, price, createdAt o updatedAt'),

    // Validación personalizada para verificar que price_min <= price_max
    query().custom((query) => {
        if (query.price_min && query.price_max && parseFloat(query.price_min) > parseFloat(query.price_max)) {
            throw new Error('El precio mínimo no puede ser mayor al precio máximo');
        }
        return true;
    }),

    handleValidationErrors
];
