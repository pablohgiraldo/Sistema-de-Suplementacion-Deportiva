// Sistema de diseño unificado para SuperGains
import colors from './colors.js';
import typography from './typography.js';
import tailwindConfig from './tailwind.js';

// Exportar todo el sistema de diseño
export {
    colors,
    typography,
    tailwindConfig,
};

// Clases de utilidad predefinidas para uso rápido
export const designTokens = {
    // Colores principales
    colors: {
        primary: {
            black: 'text-gray-900',
            white: 'text-white',
        },
        accent: {
            blue: 'text-blue-600',
            green: 'text-green-600',
            pink: 'text-pink-600',
            yellow: 'text-yellow-600',
        },
        state: {
            success: 'text-green-600',
            warning: 'text-yellow-600',
            error: 'text-red-600',
            info: 'text-blue-600',
        },
    },

    // Tipografía
    typography: {
        heading: {
            h1: 'text-4xl font-bold text-gray-900',
            h2: 'text-3xl font-bold text-gray-900',
            h3: 'text-2xl font-semibold text-gray-900',
            h4: 'text-xl font-semibold text-gray-900',
            h5: 'text-lg font-medium text-gray-900',
            h6: 'text-base font-medium text-gray-900',
        },
        body: {
            large: 'text-lg text-gray-700',
            base: 'text-base text-gray-700',
            small: 'text-sm text-gray-600',
            caption: 'text-xs text-gray-500',
        },
        form: {
            label: 'text-sm font-medium text-gray-700',
            placeholder: 'placeholder-gray-400',
            help: 'text-xs text-gray-500',
            error: 'text-sm text-red-600',
            success: 'text-sm text-green-600',
        },
    },

    // Espaciado
    spacing: {
        tight: 'space-y-2',
        default: 'space-y-4',
        loose: 'space-y-6',
    },

    // Bordes
    borders: {
        default: 'border border-gray-300',
        focus: 'border-gray-500',
        error: 'border-red-500',
        success: 'border-green-500',
        rounded: 'rounded-lg',
        roundedSmall: 'rounded-md',
    },

    // Sombras
    shadows: {
        default: 'shadow-sm',
        focus: 'shadow-md',
        error: 'shadow-red-100',
        success: 'shadow-green-100',
    },

    // Transiciones
    transitions: {
        default: 'transition-all duration-200',
        fast: 'transition-all duration-150',
        slow: 'transition-all duration-300',
    },
};

// Funciones de utilidad para generar clases dinámicamente
export const classUtils = {
    // Generar clases de input con estado
    input: (hasError = false, isDisabled = false) => {
        const base = 'form-input';
        const error = hasError ? 'form-input-error' : '';
        const disabled = isDisabled ? 'opacity-50 cursor-not-allowed' : '';
        return `${base} ${error} ${disabled}`.trim();
    },

    // Generar clases de botón con variante
    button: (variant = 'primary', size = 'md', isDisabled = false) => {
        const base = 'form-button';
        const variantClass = `form-button-${variant}`;
        const sizeClass = size === 'sm' ? 'px-3 py-2 text-sm' :
            size === 'lg' ? 'px-6 py-4 text-lg' :
                'px-4 py-3 text-base';
        const disabled = isDisabled ? 'opacity-50 cursor-not-allowed' : '';
        return `${base} ${variantClass} ${sizeClass} ${disabled}`.trim();
    },

    // Generar clases de validación
    validation: (type = 'error') => {
        const base = 'p-4 rounded-lg border';
        const variants = {
            error: 'bg-red-50 border-red-200 text-red-700',
            success: 'bg-green-50 border-green-200 text-green-700',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
            info: 'bg-blue-50 border-blue-200 text-blue-700',
        };
        return `${base} ${variants[type] || variants.error}`;
    },

    // Generar clases de grid responsivo
    grid: (columns = 1, gap = 'default') => {
        const base = 'grid';
        const columnClasses = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 md:grid-cols-2',
            3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        };
        const gapClasses = {
            tight: 'gap-3',
            default: 'gap-4',
            loose: 'gap-6',
        };
        return `${base} ${columnClasses[columns] || columnClasses[1]} ${gapClasses[gap] || gapClasses.default}`;
    },
};

// Configuración de temas (para futuras expansiones)
export const themes = {
    light: {
        name: 'Light',
        colors: colors,
        typography: typography,
    },
    // Futuro: tema oscuro
    // dark: {
    //     name: 'Dark',
    //     colors: darkColors,
    //     typography: typography,
    // },
};

// Exportar por defecto
export default {
    colors,
    typography,
    tailwindConfig,
    designTokens,
    classUtils,
    themes,
};
