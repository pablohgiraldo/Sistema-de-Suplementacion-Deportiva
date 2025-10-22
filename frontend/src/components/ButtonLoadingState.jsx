import React from 'react';

const ButtonLoadingState = ({ 
    isLoading = false, 
    loadingText = 'Cargando...', 
    children,
    className = '',
    disabled = false 
}) => {
    return (
        <button 
            className={`relative ${className}`}
            disabled={disabled || isLoading}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">{loadingText}</span>
                    </div>
                </div>
            )}
            <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                {children}
            </span>
        </button>
    );
};

export default ButtonLoadingState;
