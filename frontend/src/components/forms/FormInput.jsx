import React, { forwardRef } from 'react';
import { formTypography } from '../../config/typography.js';

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
    ...props
}, ref) => {
    const inputId = id || name;
    const hasError = !!error;

    const baseInputClasses = `
        w-full form-input
        ${hasError ? 'form-input-error' : ''}
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
        onBlur,
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

            <InputComponent {...inputProps} />

            {hasError && (
                <p className={`${formTypography.error} mt-1`}>
                    {error}
                </p>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;
