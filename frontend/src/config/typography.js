// Configuración de tipografía según PRD - SuperGains
export const typography = {
    // Familias de fuentes
    fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    },

    // Tamaños de fuente
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
        sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
        base: ['1rem', { lineHeight: '1.5rem' }],      // 16px
        lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
        xl: ['1.25rem', { lineHeight: '1.75rem' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
        '5xl': ['3rem', { lineHeight: '1' }],          // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
    },

    // Pesos de fuente
    fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },

    // Espaciado de letras
    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    },

    // Altura de línea
    lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },
};

// Clases de tipografía predefinidas para formularios
export const formTypography = {
    // Labels de formularios
    label: 'text-sm font-medium text-gray-700',

    // Placeholders
    placeholder: 'placeholder-gray-400',

    // Texto de ayuda
    help: 'text-xs text-gray-500',

    // Mensajes de error
    error: 'text-sm text-red-600',

    // Mensajes de éxito
    success: 'text-sm text-green-600',

    // Títulos de sección
    sectionTitle: 'text-lg font-semibold text-gray-900',

    // Subtítulos
    subtitle: 'text-sm text-gray-600',

    // Botones
    button: {
        primary: 'font-medium',
        secondary: 'font-medium',
        danger: 'font-medium',
        success: 'font-medium',
        outline: 'font-medium',
    }
};

// Clases de tipografía para la aplicación
export const appTypography = {
    // Títulos principales
    h1: 'text-4xl font-bold text-gray-900',
    h2: 'text-3xl font-bold text-gray-900',
    h3: 'text-2xl font-semibold text-gray-900',
    h4: 'text-xl font-semibold text-gray-900',
    h5: 'text-lg font-medium text-gray-900',
    h6: 'text-base font-medium text-gray-900',

    // Párrafos
    body: 'text-base text-gray-700',
    bodySmall: 'text-sm text-gray-600',
    bodyLarge: 'text-lg text-gray-700',

    // Enlaces
    link: 'text-blue-600 hover:text-blue-700 font-medium',
    linkSecondary: 'text-gray-600 hover:text-gray-700',

    // Código
    code: 'text-sm font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800',

    // Captions
    caption: 'text-xs text-gray-500',

    // Badges
    badge: 'text-xs font-medium',

    // Precios
    price: 'text-lg font-bold text-gray-900',
    priceSmall: 'text-sm font-semibold text-gray-700',
    priceLarge: 'text-2xl font-bold text-gray-900',
};

export default typography;
