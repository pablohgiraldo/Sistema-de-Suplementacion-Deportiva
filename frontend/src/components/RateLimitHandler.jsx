import React, { useState, useEffect } from 'react';

const RateLimitHandler = ({
    error,
    onRetry,
    className = ''
}) => {
    const [countdown, setCountdown] = useState(null);
    const [canRetry, setCanRetry] = useState(false);

    useEffect(() => {
        if (error && error.response?.status === 429) {
            const retryAfter = error.response.headers['retry-after'];

            if (retryAfter) {
                const seconds = parseInt(retryAfter);
                setCountdown(seconds);
                setCanRetry(false);

                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            setCanRetry(true);
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);
            } else {
                // Si no hay retry-after, permitir reintento después de 30 segundos
                setCountdown(30);
                setCanRetry(false);

                const timer = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            setCanRetry(true);
                            clearInterval(timer);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(timer);
            }
        }
    }, [error]);

    if (!error || error.response?.status !== 429) {
        return null;
    }

    return (
        <div className={`bg-form-notification-warning-background border border-form-notification-warning-border rounded-lg p-4 ${className}`}>
            <div className="flex items-start">
                <svg
                    className="w-5 h-5 text-form-notification-warning-icon mt-0.5 mr-3 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-form-notification-warning-title">
                        Demasiados intentos
                    </h3>
                    <p className="text-sm text-form-notification-warning-text mt-1">
                        Has realizado demasiados intentos de inicio de sesión.
                        Por favor espera antes de intentar de nuevo.
                    </p>

                    {countdown !== null && (
                        <div className="mt-3">
                            {!canRetry ? (
                                <p className="text-sm text-form-notification-warning-text">
                                    Puedes intentar de nuevo en: <span className="font-semibold">{countdown}s</span>
                                </p>
                            ) : (
                                <button
                                    onClick={onRetry}
                                    className="text-sm text-form-notification-warning-title hover:text-form-notification-warning-text font-medium underline transition-colors duration-200"
                                >
                                    Intentar de nuevo
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RateLimitHandler;
