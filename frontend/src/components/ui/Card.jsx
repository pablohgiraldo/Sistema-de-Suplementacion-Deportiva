// Componente Card reutilizable

const Card = ({ children, className = '', padding = true, shadow = true }) => {
    const baseStyles = "bg-white rounded-lg";
    const paddingStyles = padding ? "p-6" : "";
    const shadowStyles = shadow ? "shadow-md" : "";

    return (
        <div className={`${baseStyles} ${paddingStyles} ${shadowStyles} ${className}`}>
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-6 ${className}`}>
        {children}
    </div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h2 className={`text-xl font-bold text-gray-900 ${className}`}>
        {children}
    </h2>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={className}>
        {children}
    </div>
);

export default Card;

