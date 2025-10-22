import React, { forwardRef, useState } from 'react';
import { formTypography } from '../../config/typography.js';
import FormValidation, { validationRules } from './FormValidation.jsx';

const FormInput = forwardRef(({
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
    rows,
    validationRules = [],
    showValidation = true,
    onValidationChange,
    ...props
}, ref) => {
    const inputId = id || name;
    const hasError = !!error;

    // Integrar validación en tiempo real
    const validation = FormValidation({
        value,
        rules: validationRules,
        onValidationChange,
        showValidation: showValidation && !disabled
    });

    const baseInputClasses = `
        w-full form-input
        ${hasError || (!validation.isValid && validation.isDirty) ? 'form-input-error' : ''}
        ${validation.validationClasses}
        ${className}
    `.trim();

    const InputComponent = rows ? 'textarea' : 'input';
    const inputProps = {
        ...props,
        ref,
        id: inputId,
        name,
        type: rows ? undefined : type,
        value,
        onChange,
        onBlur: (e) => {
            validation.handleBlur();
            onBlur?.(e);
        },
        onFocus: validation.handleFocus,
        placeholder,
        required,
        disabled,
        autoComplete,
        maxLength,
        className: baseInputClasses,
        ...(rows && { rows })
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
                <InputComponent {...inputProps} />

                {/* Icono de validación */}
                {validation.validationIcon && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        {validation.validationIcon}
                    </span>
                )}
            </div>

            {/* Mensaje de error */}
            {hasError && (
                <p className={`${formTypography.error} mt-1`}>
                    {error}
                </p>
            )}

            {/* Mensajes de validación en tiempo real */}
            {showValidation && validation.isDirty && validation.errors.length > 0 && (
                <div className="mt-1 space-y-1">
                    {validation.errors.map((error, index) => (
                        <p key={index} className={`${formTypography.error} text-sm`}>
                            {error.message}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;
