import React, { forwardRef, useState } from 'react';
import { formTypography } from '../../config/typography.js';

const PasswordInput = forwardRef(({
    label,
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
    ...props
}, ref) => {
    const inputId = id || name;
    const hasError = !!error;
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const baseInputClasses = `
        w-full form-input pr-12
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

            <div className="relative">
                <input
                    ref={ref}
                    id={inputId}
                    name={name}
                    type={showPassword ? 'text' : 'password'}
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

                {/* Botón para mostrar/ocultar contraseña */}
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    tabIndex={-1}
                    disabled={disabled}
                >
                    {showPassword ? (
                        // Ícono de ojo cerrado (ocultar)
                        <svg
                            className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                        </svg>
                    ) : (
                        // Ícono de ojo abierto (mostrar)
                        <svg
                            className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {hasError && (
                <p className={`${formTypography.error} mt-1`}>
                    {error}
                </p>
            )}
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
