import React, { forwardRef } from 'react';
import { formTypography } from '../../config/typography.js';

const AddressInput = forwardRef(({
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
    ...props
}, ref) => {
    const inputId = id || name;
    const hasError = !!error;

    const baseInputClasses = `
        w-full form-input
        ${hasError ? 'form-input-error' : ''}
        ${className}
    `.trim();

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

            <input
                ref={ref}
                id={inputId}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete={autoComplete}
                maxLength={maxLength}
                className={baseInputClasses}
                {...props}
            />

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

AddressInput.displayName = 'AddressInput';

export default AddressInput;
