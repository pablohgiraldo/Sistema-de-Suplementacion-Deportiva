import React, { forwardRef } from 'react';
import { formTypography } from '../../config/typography.js';

const SearchInput = forwardRef(({
    placeholder = "Buscar...",
    value,
    onChange,
    onKeyDown,
    onFocus,
    onBlur,
    disabled = false,
    className = '',
    id,
    name = 'search',
    autoComplete = 'off',
    size = 'md',
    variant = 'default', // 'default', 'minimal'
    showIcon = true,
    iconPosition = 'right', // 'left', 'right'
    ...props
}, ref) => {
    const inputId = id || name;
    
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2 text-sm';
            case 'lg':
                return 'px-5 py-4 text-lg';
            default:
                return 'px-4 py-3 text-base';
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'minimal':
                return 'border-0 border-b border-gray-300 bg-transparent rounded-none focus:border-gray-500 focus:ring-0';
            default:
                return 'form-input';
        }
    };

    const baseInputClasses = `
        w-full
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
    `.trim();

    const SearchIcon = () => (
        <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            className="text-gray-400"
            aria-hidden="true"
        >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
        </svg>
    );

    return (
        <div className="relative">
            {showIcon && iconPosition === 'left' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <SearchIcon />
                </span>
            )}
            
            <input
                ref={ref}
                id={inputId}
                name={name}
                type="search"
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                className={baseInputClasses}
                {...props}
            />
            
            {showIcon && iconPosition === 'right' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <SearchIcon />
                </span>
            )}
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
