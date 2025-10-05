import React from 'react';

const FormGroup = ({
    children,
    className = '',
    spacing = 'default'
}) => {
    const getSpacingClasses = () => {
        switch (spacing) {
            case 'tight':
                return 'space-y-3';
            case 'default':
                return 'space-y-4';
            case 'loose':
                return 'space-y-6';
            default:
                return 'space-y-4';
        }
    };

    return (
        <div className={`${getSpacingClasses()} ${className}`}>
            {children}
        </div>
    );
};

export default FormGroup;
