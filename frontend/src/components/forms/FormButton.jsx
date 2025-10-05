import React from 'react';
import { formTypography } from '../../config/typography.js';

const FormButton = ({
    children,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    onClick,
    ...props
}) => {
    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return 'form-button form-button-primary';
            case 'secondary':
                return 'form-button form-button-secondary';
            case 'danger':
                return 'form-button form-button-danger';
            case 'success':
                return 'form-button form-button-success';
            case 'outline':
                return 'form-button form-button-outline';
            default:
                return 'form-button form-button-primary';
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2 text-sm';
            case 'md':
                return 'px-4 py-3 text-base';
            case 'lg':
                return 'px-6 py-4 text-lg';
            default:
                return 'px-4 py-3 text-base';
        }
    };

    const baseButtonClasses = `
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${formTypography.button[variant] || formTypography.button.primary}
        ${className}
    `.trim();

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={baseButtonClasses}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
};

export default FormButton;
