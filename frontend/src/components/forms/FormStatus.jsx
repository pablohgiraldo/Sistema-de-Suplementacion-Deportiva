import React from 'react';

const FormStatus = ({
    status = 'idle', // 'idle', 'loading', 'success', 'error', 'warning'
    message,
    className = '',
    showIcon = true,
    size = 'md' // 'sm', 'md', 'lg'
}) => {
    const getStatusStyles = () => {
        const baseStyles = "flex items-center justify-center rounded-lg border transition-all duration-200";

        const sizeStyles = {
            sm: "px-3 py-2 text-sm",
            md: "px-4 py-3 text-base",
            lg: "px-6 py-4 text-lg"
        };

        const statusStyles = {
            idle: "bg-form-status-idle-background border-form-status-idle-border text-form-status-idle-text",
            loading: "bg-form-status-loading-background border-form-status-loading-border text-form-status-loading-text",
            success: "bg-form-status-success-background border-form-status-success-border text-form-status-success-text",
            error: "bg-form-status-error-background border-form-status-error-border text-form-status-error-text",
            warning: "bg-form-status-warning-background border-form-status-warning-border text-form-status-warning-text"
        };

        return `${baseStyles} ${sizeStyles[size]} ${statusStyles[status]}`;
    };

    const getIcon = () => {
        if (!showIcon) return null;

        const iconClass = {
            sm: "w-4 h-4",
            md: "w-5 h-5",
            lg: "w-6 h-6"
        }[size];

        switch (status) {
            case 'loading':
                return (
                    <svg className={`${iconClass} animate-spin mr-2 text-form-status-loading-icon`} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                );
            case 'success':
                return (
                    <svg className={`${iconClass} mr-2 text-form-status-success-icon`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'error':
                return (
                    <svg className={`${iconClass} mr-2 text-form-status-error-icon`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            case 'warning':
                return (
                    <svg className={`${iconClass} mr-2 text-form-status-warning-icon`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const getDefaultMessage = () => {
        switch (status) {
            case 'loading':
                return 'Procesando...';
            case 'success':
                return 'Operación exitosa';
            case 'error':
                return 'Ha ocurrido un error';
            case 'warning':
                return 'Advertencia';
            default:
                return '';
        }
    };

    if (status === 'idle' && !message) {
        return null;
    }

    return (
        <div className={getStatusStyles()}>
            {getIcon()}
            <span className="font-medium">
                {message || getDefaultMessage()}
            </span>
        </div>
    );
};

export default FormStatus;
