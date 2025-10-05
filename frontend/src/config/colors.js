// Configuración de colores según PRD - SuperGains
export const colors = {
    // Colores primarios del PRD
    primary: {
        black: '#000000',      // Elegancia y profesionalismo
        white: '#FFFFFF',      // Limpieza y claridad
    },

    // Colores de acento del PRD
    accent: {
        blue: '#3B82F6',       // Confianza y tecnología
        green: '#10B981',      // Salud y naturaleza
        pink: '#EC4899',       // Energía y juventud
        yellow: '#F59E0B',     // Optimismo y vitalidad
    },

    // Variaciones para hover states
    hover: {
        blue: {
            light: '#60A5FA',    // Blue-400
            medium: '#2563EB',   // Blue-600
            dark: '#1D4ED8',     // Blue-700
        },
        green: {
            light: '#34D399',    // Emerald-400
            medium: '#059669',   // Emerald-600
            dark: '#047857',     // Emerald-700
        },
        black: {
            light: '#374151',    // Gray-700
            medium: '#1F2937',   // Gray-800
            dark: '#111827',     // Gray-900
        }
    },

    // Colores de estado
    state: {
        success: '#10B981',    // Verde para éxito
        warning: '#F59E0B',    // Amarillo para advertencia
        error: '#EF4444',      // Rojo para error
        info: '#3B82F6',       // Azul para información
    },

    // Colores específicos para formularios
    form: {
        // Estados de input
        input: {
            default: {
                border: '#D1D5DB',      // Gray-300
                background: '#FFFFFF',   // White
                text: '#111827',        // Gray-900
                placeholder: '#9CA3AF',  // Gray-400
            },
            focus: {
                border: '#6B7280',      // Gray-500
                ring: '#6B7280',        // Gray-500
            },
            error: {
                border: '#EF4444',      // Red-500
                ring: '#EF4444',        // Red-500
                background: '#FEF2F2',  // Red-50
            },
            disabled: {
                border: '#E5E7EB',      // Gray-200
                background: '#F9FAFB',  // Gray-50
                text: '#9CA3AF',        // Gray-400
            },
        },

        // Estados de botones
        button: {
            primary: {
                background: '#111827',   // Gray-900
                hover: '#1F2937',       // Gray-800
                text: '#FFFFFF',        // White
                focus: '#6B7280',       // Gray-500
            },
            secondary: {
                background: '#F3F4F6',   // Gray-100
                hover: '#E5E7EB',       // Gray-200
                text: '#374151',        // Gray-700
                focus: '#D1D5DB',       // Gray-300
            },
            danger: {
                background: '#EF4444',   // Red-600
                hover: '#DC2626',       // Red-700
                text: '#FFFFFF',        // White
                focus: '#F87171',       // Red-400
            },
            success: {
                background: '#10B981',   // Green-600
                hover: '#059669',       // Green-700
                text: '#FFFFFF',        // White
                focus: '#34D399',       // Green-400
            },
            outline: {
                background: 'transparent',
                border: '#D1D5DB',      // Gray-300
                hover: '#F9FAFB',       // Gray-50
                text: '#374151',        // Gray-700
                focus: '#6B7280',       // Gray-500
            },
        },

        // Estados de validación
        validation: {
            error: {
                background: '#FEF2F2',  // Red-50
                border: '#FECACA',      // Red-200
                text: '#DC2626',        // Red-700
                icon: '#EF4444',        // Red-500
            },
            success: {
                background: '#F0FDF4',  // Green-50
                border: '#BBF7D0',      // Green-200
                text: '#166534',        // Green-700
                icon: '#10B981',        // Green-500
            },
            warning: {
                background: '#FFFBEB',  // Yellow-50
                border: '#FED7AA',      // Orange-200
                text: '#C2410C',        // Orange-700
                icon: '#F59E0B',        // Yellow-500
            },
            info: {
                background: '#EFF6FF',  // Blue-50
                border: '#BFDBFE',      // Blue-200
                text: '#1E40AF',        // Blue-800
                icon: '#3B82F6',        // Blue-500
            },
        },

        // Colores para notificaciones y feedback
        notification: {
            success: {
                background: '#F0FDF4',  // Green-50
                border: '#BBF7D0',      // Green-200
                text: '#166534',        // Green-700
                title: '#15803D',       // Green-800
                icon: '#10B981',        // Green-500
                close: '#6B7280',       // Gray-500
                closeHover: '#374151',  // Gray-700
            },
            error: {
                background: '#FEF2F2',  // Red-50
                border: '#FECACA',      // Red-200
                text: '#DC2626',        // Red-700
                title: '#B91C1C',       // Red-800
                icon: '#EF4444',        // Red-500
                close: '#6B7280',       // Gray-500
                closeHover: '#374151',  // Gray-700
            },
            warning: {
                background: '#FFFBEB',  // Yellow-50
                border: '#FED7AA',      // Orange-200
                text: '#C2410C',        // Orange-700
                title: '#A16207',       // Yellow-800
                icon: '#F59E0B',        // Yellow-500
                close: '#6B7280',       // Gray-500
                closeHover: '#374151',  // Gray-700
            },
            info: {
                background: '#EFF6FF',  // Blue-50
                border: '#BFDBFE',      // Blue-200
                text: '#1E40AF',        // Blue-800
                title: '#1E3A8A',       // Blue-900
                icon: '#3B82F6',        // Blue-500
                close: '#6B7280',       // Gray-500
                closeHover: '#374151',  // Gray-700
            },
        },

        // Colores para indicadores de progreso
        progress: {
            completed: {
                background: '#10B981',  // Green-500
                text: '#FFFFFF',        // White
                border: '#059669',      // Green-600
            },
            current: {
                background: '#3B82F6',  // Blue-500
                text: '#FFFFFF',        // White
                border: '#2563EB',      // Blue-600
                ring: '#93C5FD',        // Blue-300
            },
            upcoming: {
                background: '#E5E7EB',  // Gray-200
                text: '#6B7280',        // Gray-500
                border: '#D1D5DB',      // Gray-300
            },
            connector: {
                completed: '#10B981',   // Green-500
                upcoming: '#E5E7EB',    // Gray-200
            },
        },

        // Colores para estados de formulario
        status: {
            idle: {
                background: '#F9FAFB',  // Gray-50
                border: '#E5E7EB',      // Gray-200
                text: '#6B7280',        // Gray-500
            },
            loading: {
                background: '#EFF6FF',  // Blue-50
                border: '#BFDBFE',      // Blue-200
                text: '#1E40AF',        // Blue-800
                icon: '#3B82F6',        // Blue-500
            },
            success: {
                background: '#F0FDF4',  // Green-50
                border: '#BBF7D0',      // Green-200
                text: '#166534',        // Green-700
                icon: '#10B981',        // Green-500
            },
            error: {
                background: '#FEF2F2',  // Red-50
                border: '#FECACA',      // Red-200
                text: '#DC2626',        // Red-700
                icon: '#EF4444',        // Red-500
            },
            warning: {
                background: '#FFFBEB',  // Yellow-50
                border: '#FED7AA',      // Orange-200
                text: '#C2410C',        // Orange-700
                icon: '#F59E0B',        // Yellow-500
            },
        },
    },

    // Colores neutros
    neutral: {
        50: '#F9FAFB',   // Gray-50
        100: '#F3F4F6',  // Gray-100
        200: '#E5E7EB',  // Gray-200
        300: '#D1D5DB',  // Gray-300
        400: '#9CA3AF',  // Gray-400
        500: '#6B7280',  // Gray-500
        600: '#4B5563',  // Gray-600
        700: '#374151',  // Gray-700
        800: '#1F2937',  // Gray-800
        900: '#111827',  // Gray-900
    }
};

// Función para obtener colores de hover
export const getHoverColor = (baseColor, intensity = 'medium') => {
    const hoverMap = {
        blue: colors.hover.blue[intensity],
        green: colors.hover.green[intensity],
        black: colors.hover.black[intensity],
    };

    return hoverMap[baseColor] || baseColor;
};

export default colors;
