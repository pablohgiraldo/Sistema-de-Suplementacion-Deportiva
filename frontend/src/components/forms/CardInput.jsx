import React, { forwardRef, useState } from 'react';
import { formTypography } from '../../config/typography.js';

const CardInput = forwardRef(({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    required = false,
    disabled = false,
    className = '',
    id,
    name,
    autoComplete,
    maxLength,
    helpText,
    formatCardNumber = false,
    ...props
}, ref) => {
    const inputId = id || name;
    const hasError = !!error;
    const [isFocused, setIsFocused] = useState(false);

    const baseInputClasses = `
        w-full form-input
        ${hasError ? 'form-input-error' : ''}
        ${className}
    `.trim();

    const handleChange = (e) => {
        let newValue = e.target.value;
        
        // Formatear número de tarjeta
        if (formatCardNumber && type === 'text') {
            // Remover espacios y caracteres no numéricos
            newValue = newValue.replace(/\D/g, '');
            
            // Agregar espacios cada 4 dígitos
            newValue = newValue.replace(/(\d{4})(?=\d)/g, '$1 ');
            
            // Limitar a 19 caracteres (16 dígitos + 3 espacios)
            newValue = newValue.slice(0, 19);
        }
        
        // Crear nuevo evento con el valor formateado
        const formattedEvent = {
            ...e,
            target: {
                ...e.target,
                value: newValue
            }
        };
        
        onChange?.(formattedEvent);
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        props.onFocus?.(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        onBlur?.(e);
    };

    const getCardIcon = () => {
        if (!formatCardNumber || !value) return null;
        
        const cardNumber = value.replace(/\s/g, '');
        
        // Visa: empieza con 4
        if (cardNumber.startsWith('4')) {
            return (
                <span className="text-blue-600 font-bold text-sm">VISA</span>
            );
        }
        
        // Mastercard: empieza con 5 o 2
        if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) {
            return (
                <span className="text-red-600 font-bold text-sm">MC</span>
            );
        }
        
        // American Express: empieza con 3
        if (cardNumber.startsWith('3')) {
            return (
                <span className="text-blue-600 font-bold text-sm">AMEX</span>
            );
        }
        
        return null;
    };

    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className={`block ${formTypography.label}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    maxLength={maxLength}
                    className={baseInputClasses}
                    {...props}
                />
                
                {formatCardNumber && isFocused && getCardIcon() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {getCardIcon()}
                    </div>
                )}
            </div>

            {helpText && !hasError && (
                <p className={`${formTypography.help} mt-1`}>
                    {helpText}
                </p>
            )}

            {hasError && (
                <p className={`${formTypography.error} mt-1`}>
                    {error}
                </p>
            )}
        </div>
    );
});

CardInput.displayName = 'CardInput';

export default CardInput;
