import React from 'react';

const FormProgress = ({
    steps = [],
    currentStep = 0,
    className = '',
    showLabels = true,
    showNumbers = true
}) => {
    const getStepStatus = (index) => {
        if (index < currentStep) return 'completed';
        if (index === currentStep) return 'current';
        return 'upcoming';
    };

    const getStepStyles = (status) => {
        const baseStyles = "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200";

        switch (status) {
            case 'completed':
                return `${baseStyles} bg-form-progress-completed-background text-form-progress-completed-text border-2 border-form-progress-completed-border`;
            case 'current':
                return `${baseStyles} bg-form-progress-current-background text-form-progress-current-text ring-4 ring-form-progress-current-ring`;
            case 'upcoming':
                return `${baseStyles} bg-form-progress-upcoming-background text-form-progress-upcoming-text border-2 border-form-progress-upcoming-border`;
            default:
                return `${baseStyles} bg-form-progress-upcoming-background text-form-progress-upcoming-text border-2 border-form-progress-upcoming-border`;
        }
    };

    const getConnectorStyles = (index) => {
        if (index >= steps.length - 1) return 'hidden';

        const isCompleted = index < currentStep;
        return `flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-form-progress-connector-completed' : 'bg-form-progress-connector-upcoming'} transition-colors duration-200`;
    };

    return (
        <div className={`w-full ${className}`}>
            <nav aria-label="Progreso del formulario">
                <ol className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const status = getStepStatus(index);

                        return (
                            <li key={index} className="flex items-center flex-1">
                                <div className="flex flex-col items-center">
                                    <div className={getStepStyles(status)}>
                                        {showNumbers && (
                                            <span>
                                                {status === 'completed' ? (
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    index + 1
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    {showLabels && (
                                        <div className="mt-2 text-center">
                                            <p className={`text-xs font-medium ${status === 'current' ? 'text-form-progress-current-background' :
                                                status === 'completed' ? 'text-form-progress-completed-background' :
                                                    'text-form-progress-upcoming-text'
                                                }`}>
                                                {step.label}
                                            </p>
                                            {step.description && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {step.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={getConnectorStyles(index)} />
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </div>
    );
};

export default FormProgress;
