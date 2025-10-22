import React, { useState, useEffect } from 'react';
import { formTypography } from '../../config/typography.js';

const FormValidation = ({
    value = '',
    rules = [],
    onValidationChange,
    showValidation = true,
    className = ''
}) => {
    const [errors, setErrors] = useState([]);
    const [isValid, setIsValid] = useState(true);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (!showValidation || !isDirty) {
            setErrors([]);
            setIsValid(true);
            onValidationChange?.(true, []);
            return;
        }

        const newErrors = [];

        rules.forEach(rule => {
            const result = rule.validator(value);
            if (!result.isValid) {
                newErrors.push({
                    type: rule.type || 'error',
                    message: result.message || rule.message,
                    rule: rule.name
                });
            }
        });

        setErrors(newErrors);
        setIsValid(newErrors.length === 0);
        onValidationChange?.(newErrors.length === 0, newErrors);
    }, [value, rules, showValidation, isDirty, onValidationChange]);

    const handleBlur = () => {
        setIsDirty(true);
    };

    const handleFocus = () => {
        // Opcional: limpiar errores al enfocar
    };

    const getValidationIcon = () => {
        if (!showValidation || !isDirty) return null;

        if (isValid && value) {
            return (
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        }

        if (!isValid && errors.length > 0) {
            return (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            );
        }

        return null;
    };

    const getValidationClasses = () => {
        if (!showValidation || !isDirty) return '';

        if (isValid && value) return 'border-green-500 bg-green-50';
        if (!isValid && errors.length > 0) return 'border-red-500 bg-red-50';

        return '';
    };

    return {
        errors,
        isValid,
        isDirty,
        validationIcon: getValidationIcon(),
        validationClasses: getValidationClasses(),
        handleBlur,
        handleFocus
    };
};

// Reglas de validación predefinidas
export const validationRules = {
    required: (message = 'Este campo es obligatorio') => ({
        name: 'required',
        type: 'error',
        message,
        validator: (value) => ({
            isValid: value && value.trim().length > 0,
            message: value && value.trim().length > 0 ? '' : message
        })
    }),

    minLength: (min, message) => ({
        name: 'minLength',
        type: 'error',
        message: message || `Debe tener al menos ${min} caracteres`,
        validator: (value) => ({
            isValid: !value || value.length >= min,
            message: value && value.length < min ? (message || `Debe tener al menos ${min} caracteres`) : ''
        })
    }),

    maxLength: (max, message) => ({
        name: 'maxLength',
        type: 'error',
        message: message || `No puede tener más de ${max} caracteres`,
        validator: (value) => ({
            isValid: !value || value.length <= max,
            message: value && value.length > max ? (message || `No puede tener más de ${max} caracteres`) : ''
        })
    }),

    email: (message = 'Ingresa un email válido') => ({
        name: 'email',
        type: 'error',
        message,
        validator: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return {
                isValid: !value || emailRegex.test(value),
                message: value && !emailRegex.test(value) ? message : ''
            };
        }
    }),

    phone: (message = 'Ingresa un número de teléfono válido') => ({
        name: 'phone',
        type: 'error',
        message,
        validator: (value) => {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
            return {
                isValid: !value || phoneRegex.test(value),
                message: value && !phoneRegex.test(value) ? message : ''
            };
        }
    }),

    password: (message = 'La contraseña debe tener al menos 6 caracteres') => ({
        name: 'password',
        type: 'error',
        message,
        validator: (value) => ({
            isValid: !value || value.length >= 6,
            message: value && value.length < 6 ? message : ''
        })
    }),

    confirmPassword: (originalPassword, message = 'Las contraseñas no coinciden') => ({
        name: 'confirmPassword',
        type: 'error',
        message,
        validator: (value) => ({
            isValid: !value || value === originalPassword,
            message: value && value !== originalPassword ? message : ''
        })
    }),

    cardNumber: (message = 'Número de tarjeta inválido') => ({
        name: 'cardNumber',
        type: 'error',
        message,
        validator: (value) => {
            // Algoritmo de Luhn para validar tarjetas
            const cleanValue = value.replace(/\s/g, '');
            if (!cleanValue || cleanValue.length < 13 || cleanValue.length > 19) {
                return { isValid: false, message };
            }

            let sum = 0;
            let isEven = false;

            for (let i = cleanValue.length - 1; i >= 0; i--) {
                let digit = parseInt(cleanValue[i]);

                if (isEven) {
                    digit *= 2;
                    if (digit > 9) {
                        digit -= 9;
                    }
                }

                sum += digit;
                isEven = !isEven;
            }

            return {
                isValid: sum % 10 === 0,
                message: sum % 10 !== 0 ? message : ''
            };
        }
    }),

    expiryDate: (message = 'Fecha de expiración inválida') => ({
        name: 'expiryDate',
        type: 'error',
        message,
        validator: (value) => {
            if (!value) return { isValid: true, message: '' };

            const [month, year] = value.split('/');
            if (!month || !year) return { isValid: false, message };

            const monthNum = parseInt(month);
            const yearNum = parseInt('20' + year);

            if (monthNum < 1 || monthNum > 12) return { isValid: false, message };

            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
                return { isValid: false, message: 'La tarjeta ha expirado' };
            }

            return { isValid: true, message: '' };
        }
    }),

    cvv: (message = 'CVV inválido') => ({
        name: 'cvv',
        type: 'error',
        message,
        validator: (value) => {
            const cvvRegex = /^[0-9]{3,4}$/;
            return {
                isValid: !value || cvvRegex.test(value),
                message: value && !cvvRegex.test(value) ? message : ''
            };
        }
    })
};

export default FormValidation;
