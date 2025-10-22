import React from 'react';

const LoadingSpinner = ({ 
    size = 'md', 
    color = 'blue', 
    text = '', 
    fullScreen = false,
    className = '' 
}) => {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm': return 'w-4 h-4';
            case 'md': return 'w-8 h-8';
            case 'lg': return 'w-12 h-12';
            case 'xl': return 'w-16 h-16';
            default: return 'w-8 h-8';
        }
    };

    const getColorClasses = () => {
        switch (color) {
            case 'blue': return 'text-blue-600';
            case 'green': return 'text-green-600';
            case 'red': return 'text-red-600';
            case 'yellow': return 'text-yellow-600';
            case 'gray': return 'text-gray-600';
            case 'white': return 'text-white';
            default: return 'text-blue-600';
        }
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-current ${getSizeClasses()} ${getColorClasses()}`}></div>
            {text && (
                <p className={`mt-2 text-sm font-medium ${getColorClasses()}`}>
                    {text}
                </p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;