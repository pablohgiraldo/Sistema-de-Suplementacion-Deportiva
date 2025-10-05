import React, { forwardRef } from 'react';
import { formTypography } from '../../config/typography.js';

const FormSelect = forwardRef(({
    label,
    options = [],
    value,
    onChange,
    onBlur,
    error,
    required = false,
    disabled = false,
    placeholder = 'Selecciona una opción',
    className = '',
    id,
    name,
    ...props
}, ref) => {
    const selectId = id || name;
    const hasError = !!error;

    const baseSelectClasses = `
        w-full form-input
        ${hasError ? 'form-input-error' : ''}
        ${className}
    `.trim();

    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={selectId}
                    className={`block ${formTypography.label}`}
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <select
                ref={ref}
                id={selectId}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                required={required}
                disabled={disabled}
                className={baseSelectClasses}
                {...props}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option) => (
                    <option
                        key={option.value || option}
                        value={option.value || option}
                    >
                        {option.label || option}
                    </option>
                ))}
            </select>

            {hasError && (
                <p className={`${formTypography.error} mt-1`}>
                    {error}
                </p>
            )}
        </div>
    );
});

FormSelect.displayName = 'FormSelect';

export default FormSelect;
