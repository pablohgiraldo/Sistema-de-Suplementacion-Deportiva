import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageLoadingState = ({ 
    message = 'Cargando...', 
    show = false,
    className = '' 
}) => {
    if (!show) return null;

    return (
        <div className={`fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 ${className}`}>
            <div className="text-center">
                <LoadingSpinner 
                    size="xl" 
                    color="blue" 
                    text={message}
                />
            </div>
        </div>
    );
};

export default PageLoadingState;
