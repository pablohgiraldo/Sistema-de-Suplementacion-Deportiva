/**
 * Validadores para Customer (CRM)
 * 
 * Validaciones de entrada para endpoints de gestión de clientes.
 */

import { body, param, validationResult } from 'express-validator';

// Middleware para manejar errores de validación
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

// Validación para crear customer
export const validateCreateCustomer = [
    body('userId')
        .notEmpty()
        .withMessage('El ID del usuario es requerido')
        .isMongoId()
        .withMessage('ID de usuario inválido'),
    
    body('contactInfo.phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener 10 dígitos'),
    
    body('contactInfo.email')
        .optional()
        .isEmail()
        .withMessage('Email alternativo inválido')
        .normalizeEmail(),
    
    body('preferences.categories')
        .optional()
        .isArray()
        .withMessage('Las categorías deben ser un arreglo'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Los tags deben ser un arreglo'),
    
    body('notes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Las notas no pueden exceder 2000 caracteres'),
    
    body('acquisitionSource')
        .optional()
        .isIn(['Búsqueda orgánica', 'Redes sociales', 'Referido', 'Email marketing', 'Publicidad', 'Directo', 'Otro'])
        .withMessage('Fuente de adquisición inválida')
];

// Validación para actualizar customer
export const validateUpdateCustomer = [
    param('id')
        .isMongoId()
        .withMessage('ID de customer inválido'),
    
    body('contactInfo.phone')
        .optional()
        .matches(/^[0-9]{10}$/)
        .withMessage('El teléfono debe tener 10 dígitos'),
    
    body('contactInfo.alternativeEmail')
        .optional()
        .isEmail()
        .withMessage('Email alternativo inválido')
        .normalizeEmail(),
    
    body('segment')
        .optional()
        .isIn(['VIP', 'Frecuente', 'Ocasional', 'Nuevo', 'Inactivo', 'En Riesgo'])
        .withMessage('Segmento inválido'),
    
    body('loyaltyLevel')
        .optional()
        .isIn(['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante'])
        .withMessage('Nivel de fidelidad inválido'),
    
    body('status')
        .optional()
        .isIn(['Activo', 'Inactivo', 'Bloqueado', 'Suspendido'])
        .withMessage('Estado inválido'),
    
    body('preferences.categories')
        .optional()
        .isArray()
        .withMessage('Las categorías deben ser un arreglo'),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Los tags deben ser un arreglo'),
    
    body('notes')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Las notas no pueden exceder 2000 caracteres'),
    
    body('gender')
        .optional()
        .isIn(['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'])
        .withMessage('Género inválido'),
    
    body('fitnessGoals')
        .optional()
        .isArray()
        .withMessage('Los objetivos fitness deben ser un arreglo'),
    
    body('birthDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de nacimiento inválida')
];

// Validación para agregar interacción
export const validateAddInteraction = [
    param('id')
        .isMongoId()
        .withMessage('ID de customer inválido'),
    
    body('type')
        .notEmpty()
        .withMessage('El tipo de interacción es requerido')
        .isIn(['Compra', 'Visita', 'Email abierto', 'Click', 'Wishlist', 'Review', 'Soporte', 'Otro'])
        .withMessage('Tipo de interacción inválido'),
    
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('La descripción no puede exceder 500 caracteres'),
    
    body('metadata')
        .optional()
        .isObject()
        .withMessage('Los metadatos deben ser un objeto')
];

// Validación para actualizar puntos de fidelidad
export const validateUpdateLoyaltyPoints = [
    param('id')
        .isMongoId()
        .withMessage('ID de customer inválido'),
    
    body('points')
        .notEmpty()
        .withMessage('Los puntos son requeridos')
        .isInt({ min: 0 })
        .withMessage('Los puntos deben ser un número entero positivo'),
    
    body('operation')
        .optional()
        .isIn(['add', 'subtract', 'set'])
        .withMessage('Operación inválida (add, subtract, set)')
];

// Validación para parámetro ID
export const validateCustomerId = [
    param('id')
        .isMongoId()
        .withMessage('ID de customer inválido')
];

// Validación para userId en parámetro
export const validateUserId = [
    param('userId')
        .isMongoId()
        .withMessage('ID de usuario inválido')
];

export default {
    validateCreateCustomer,
    validateUpdateCustomer,
    validateAddInteraction,
    validateUpdateLoyaltyPoints,
    validateCustomerId,
    validateUserId,
    handleValidationErrors
};

