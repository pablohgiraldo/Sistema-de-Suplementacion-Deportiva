import { body, param, query } from "express-validator";

// Validaciones para crear inventario
export const createInventoryValidation = [
    body('productId')
        .notEmpty()
        .withMessage('El ID del producto es obligatorio')
        .isMongoId()
        .withMessage('El ID del producto debe ser válido'),

    body('currentStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock actual debe ser un número entero mayor o igual a 0'),

    body('minStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),

    body('maxStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock máximo debe ser un número entero mayor o igual a 0'),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden tener más de 500 caracteres')
];

// Validaciones para actualizar inventario
export const updateInventoryValidation = [
    param('id')
        .isMongoId()
        .withMessage('El ID del inventario debe ser válido'),

    body('currentStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock actual debe ser un número entero mayor o igual a 0'),

    body('minStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),

    body('maxStock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock máximo debe ser un número entero mayor o igual a 0'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued', 'out_of_stock'])
        .withMessage('El estado debe ser: active, inactive, discontinued o out_of_stock'),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden tener más de 500 caracteres')
];

// Validaciones para operaciones de stock
export const stockOperationValidation = [
    param('id')
        .isMongoId()
        .withMessage('El ID del inventario debe ser válido'),

    body('quantity')
        .notEmpty()
        .withMessage('La cantidad es obligatoria')
        .isInt({ min: 1 })
        .withMessage('La cantidad debe ser un número entero mayor a 0'),

    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden tener más de 500 caracteres')
];

// Validaciones para consultas con filtros
export const inventoryQueryValidation = [
    query('status')
        .optional()
        .isIn(['active', 'inactive', 'discontinued', 'out_of_stock'])
        .withMessage('El estado debe ser: active, inactive, discontinued o out_of_stock'),

    query('stock_min')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock mínimo debe ser un número entero mayor o igual a 0'),

    query('stock_max')
        .optional()
        .isInt({ min: 0 })
        .withMessage('El stock máximo debe ser un número entero mayor o igual a 0'),

    query('needs_restock')
        .optional()
        .isBoolean()
        .withMessage('needs_restock debe ser true o false'),

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
        .isIn(['createdAt', 'updatedAt', 'currentStock', 'productName', 'totalSold'])
        .withMessage('sortBy debe ser: createdAt, updatedAt, currentStock, productName o totalSold'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('sortOrder debe ser asc o desc')
];

// Validaciones para ID de parámetro
export const inventoryIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('El ID del inventario debe ser válido')
];

// Validaciones para ID de producto
export const productIdValidation = [
    param('productId')
        .isMongoId()
        .withMessage('El ID del producto debe ser válido')
];
