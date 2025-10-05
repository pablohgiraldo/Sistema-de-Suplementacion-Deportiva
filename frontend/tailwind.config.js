import { tailwindConfig } from './src/config/designSystem.js';

export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Configuración base existente
      screens: {
        'xs': '475px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      // Configuración extendida del sistema de diseño
      ...tailwindConfig.theme.extend,
    }
  },
  plugins: [
    // Plugin personalizado para utilidades de formularios
    function ({ addUtilities, theme }) {
      const newUtilities = {
        // Utilidades para formularios
        '.form-input': {
          width: '100%',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          borderWidth: '1px',
          borderColor: theme('colors.gray.300'),
          backgroundColor: theme('colors.white'),
          color: theme('colors.gray.900'),
          borderRadius: theme('borderRadius.lg'),
          fontSize: theme('fontSize.base[0]'),
          lineHeight: theme('fontSize.base[1].lineHeight'),
          transitionProperty: 'all',
          transitionDuration: '200ms',
          '&::placeholder': {
            color: theme('colors.gray.400'),
          },
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.gray.500'),
            boxShadow: '0 0 0 3px rgba(107, 114, 128, 0.1)',
          },
          '&:disabled': {
            backgroundColor: theme('colors.gray.50'),
            borderColor: theme('colors.gray.200'),
            color: theme('colors.gray.400'),
            cursor: 'not-allowed',
          },
        },

        '.form-input-error': {
          borderColor: theme('colors.red.500'),
          backgroundColor: theme('colors.red.50'),
          '&:focus': {
            borderColor: theme('colors.red.500'),
            boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
          },
        },

        '.form-button': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
          borderRadius: theme('borderRadius.lg'),
          fontSize: theme('fontSize.base[0]'),
          fontWeight: theme('fontWeight.medium'),
          transitionProperty: 'all',
          transitionDuration: '200ms',
          cursor: 'pointer',
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },

        '.form-button-primary': {
          backgroundColor: theme('colors.gray.900'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.800'),
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(107, 114, 128, 0.2)',
          },
        },

        '.form-button-secondary': {
          backgroundColor: theme('colors.gray.100'),
          color: theme('colors.gray.700'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.200'),
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(209, 213, 219, 0.2)',
          },
        },

        '.form-button-danger': {
          backgroundColor: theme('colors.red.600'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.red.700'),
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(248, 113, 113, 0.2)',
          },
        },

        '.form-button-success': {
          backgroundColor: theme('colors.green.600'),
          color: theme('colors.white'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.green.700'),
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(52, 211, 153, 0.2)',
          },
        },

        '.form-button-outline': {
          backgroundColor: 'transparent',
          borderWidth: '2px',
          borderColor: theme('colors.gray.300'),
          color: theme('colors.gray.700'),
          '&:hover:not(:disabled)': {
            backgroundColor: theme('colors.gray.50'),
          },
          '&:focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(107, 114, 128, 0.2)',
          },
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
