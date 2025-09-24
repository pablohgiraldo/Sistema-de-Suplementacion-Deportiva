import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const PageLoader = ({ message = 'Cargando página...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <LoadingSpinner size="xl" text={message} />
                <div className="mt-4">
                    <div className="w-64 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageLoader;
