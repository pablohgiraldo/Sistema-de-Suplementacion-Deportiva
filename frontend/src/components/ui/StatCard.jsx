// Componente StatCard para métricas

const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconColor = "text-gray-400",
    valueColor = "text-gray-900",
    className = ''
}) => {
    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-gray-600 text-sm mb-1">{title}</p>
                    <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
                </div>
                {icon && (
                    <div className={`${iconColor}`}>
                        {icon}
                    </div>
                )}
            </div>
            {subtitle && (
                <p className="text-sm text-gray-500 mt-2">{subtitle}</p>
            )}
        </div>
    );
};

export default StatCard;

