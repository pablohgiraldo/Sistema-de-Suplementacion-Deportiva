import React, { forwardRef } from 'react';
import { formTypography } from '../../config/typography.js';

const FormCheckbox = forwardRef(({
    label,
    checked,
    onChange,
    onBlur,
    error,
    disabled = false,
    className = '',
    id,
    name,
    required = false,
    ...props
}, ref) => {
    const checkboxId = id || name;
    const hasError = !!error;

    const baseCheckboxClasses = `
        w-4 h-4 
        text-gray-600 
        border border-gray-300 rounded 
        focus:ring-2 focus:ring-gray-500 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${hasError ? 'border-red-500 focus:ring-red-500' : ''}
        ${className}
    `.trim();

    return (
        <div className="space-y-2">
            <div className="flex items-start">
                <input
                    ref={ref}
                    type="checkbox"
                    id={checkboxId}
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    onBlur={onBlur}
                    required={required}
                    disabled={disabled}
                    className={baseCheckboxClasses}
                    {...props}
                />
                {label && (
                    <label
                        htmlFor={checkboxId}
                        className={`ml-3 cursor-pointer ${formTypography.label}`}
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
            </div>

            {hasError && (
                <p className={`${formTypography.error} mt-1`}>
                    {error}
                </p>
            )}
        </div>
    );
});

FormCheckbox.displayName = 'FormCheckbox';

export default FormCheckbox;
