import React from 'react';

const FormGrid = ({
    children,
    columns = 1,
    gap = 'default',
    className = '',
    responsive = true
}) => {
    const getGridClasses = () => {
        const baseClasses = 'grid';

        // Column classes
        let columnClasses = '';
        if (responsive) {
            switch (columns) {
                case 1:
                    columnClasses = 'grid-cols-1';
                    break;
                case 2:
                    columnClasses = 'grid-cols-1 md:grid-cols-2';
                    break;
                case 3:
                    columnClasses = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
                    break;
                case 4:
                    columnClasses = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
                    break;
                default:
                    columnClasses = `grid-cols-${columns}`;
            }
        } else {
            columnClasses = `grid-cols-${columns}`;
        }

        // Gap classes
        let gapClasses = '';
        switch (gap) {
            case 'tight':
                gapClasses = 'gap-3';
                break;
            case 'default':
                gapClasses = 'gap-4';
                break;
            case 'loose':
                gapClasses = 'gap-6';
                break;
            default:
                gapClasses = 'gap-4';
        }

        return `${baseClasses} ${columnClasses} ${gapClasses}`;
    };

    return (
        <div className={`${getGridClasses()} ${className}`}>
            {children}
        </div>
    );
};

export default FormGrid;
