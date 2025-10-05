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
