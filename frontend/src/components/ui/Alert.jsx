// Componente Alert para notificaciones

import { CloseIcon } from '../icons/CRMIcons';

const Alert = ({
    type = 'info',
    message,
    onClose,
    className = ''
}) => {
    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800'
        }
    };

    const style = styles[type] || styles.info;

    return (
        <div className={`${style.bg} border ${style.border} rounded-lg p-4 ${className}`}>
            <div className="flex justify-between items-start">
                <p className={`${style.text} flex-1`}>
                    {message}
                </p>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 ml-4 flex-shrink-0"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;

