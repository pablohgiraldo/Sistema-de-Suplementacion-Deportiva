// Configuración personalizada de Tailwind CSS para SuperGains
import colors from './colors.js';
import typography from './typography.js';

export const tailwindConfig = {
    theme: {
        extend: {
            // Colores personalizados
            colors: {
                // Colores primarios del PRD
                primary: {
                    black: colors.primary.black,
                    white: colors.primary.white,
                },

                // Colores de acento
                accent: {
                    blue: colors.accent.blue,
                    green: colors.accent.green,
                    pink: colors.accent.pink,
                    yellow: colors.accent.yellow,
                },

                // Colores de estado
                state: {
                    success: colors.state.success,
                    warning: colors.state.warning,
                    error: colors.state.error,
                    info: colors.state.info,
                },

                // Colores de formularios
                form: {
                    input: {
                        default: {
                            border: colors.form.input.default.border,
                            background: colors.form.input.default.background,
                            text: colors.form.input.default.text,
                            placeholder: colors.form.input.default.placeholder,
                        },
                        focus: {
                            border: colors.form.input.focus.border,
                            ring: colors.form.input.focus.ring,
                        },
                        error: {
                            border: colors.form.input.error.border,
                            ring: colors.form.input.error.ring,
                            background: colors.form.input.error.background,
                        },
                        disabled: {
                            border: colors.form.input.disabled.border,
                            background: colors.form.input.disabled.background,
                            text: colors.form.input.disabled.text,
                        },
                    },
                    button: {
                        primary: {
                            background: colors.form.button.primary.background,
                            hover: colors.form.button.primary.hover,
                            text: colors.form.button.primary.text,
                            focus: colors.form.button.primary.focus,
                        },
                        secondary: {
                            background: colors.form.button.secondary.background,
                            hover: colors.form.button.secondary.hover,
                            text: colors.form.button.secondary.text,
                            focus: colors.form.button.secondary.focus,
                        },
                        danger: {
                            background: colors.form.button.danger.background,
                            hover: colors.form.button.danger.hover,
                            text: colors.form.button.danger.text,
                            focus: colors.form.button.danger.focus,
                        },
                        success: {
                            background: colors.form.button.success.background,
                            hover: colors.form.button.success.hover,
                            text: colors.form.button.success.text,
                            focus: colors.form.button.success.focus,
                        },
                        outline: {
                            background: colors.form.button.outline.background,
                            border: colors.form.button.outline.border,
                            hover: colors.form.button.outline.hover,
                            text: colors.form.button.outline.text,
                            focus: colors.form.button.outline.focus,
                        },
                    },
                    validation: {
                        error: {
                            background: colors.form.validation.error.background,
                            border: colors.form.validation.error.border,
                            text: colors.form.validation.error.text,
                            icon: colors.form.validation.error.icon,
                        },
                        success: {
                            background: colors.form.validation.success.background,
                            border: colors.form.validation.success.border,
                            text: colors.form.validation.success.text,
                            icon: colors.form.validation.success.icon,
                        },
                        warning: {
                            background: colors.form.validation.warning.background,
                            border: colors.form.validation.warning.border,
                            text: colors.form.validation.warning.text,
                            icon: colors.form.validation.warning.icon,
                        },
                        info: {
                            background: colors.form.validation.info.background,
                            border: colors.form.validation.info.border,
                            text: colors.form.validation.info.text,
                            icon: colors.form.validation.info.icon,
                        },
                    },
                    notification: {
                        success: {
                            background: colors.form.notification.success.background,
                            border: colors.form.notification.success.border,
                            text: colors.form.notification.success.text,
                            title: colors.form.notification.success.title,
                            icon: colors.form.notification.success.icon,
                            close: colors.form.notification.success.close,
                            closeHover: colors.form.notification.success.closeHover,
                        },
                        error: {
                            background: colors.form.notification.error.background,
                            border: colors.form.notification.error.border,
                            text: colors.form.notification.error.text,
                            title: colors.form.notification.error.title,
                            icon: colors.form.notification.error.icon,
                            close: colors.form.notification.error.close,
                            closeHover: colors.form.notification.error.closeHover,
                        },
                        warning: {
                            background: colors.form.notification.warning.background,
                            border: colors.form.notification.warning.border,
                            text: colors.form.notification.warning.text,
                            title: colors.form.notification.warning.title,
                            icon: colors.form.notification.warning.icon,
                            close: colors.form.notification.warning.close,
                            closeHover: colors.form.notification.warning.closeHover,
                        },
                        info: {
                            background: colors.form.notification.info.background,
                            border: colors.form.notification.info.border,
                            text: colors.form.notification.info.text,
                            title: colors.form.notification.info.title,
                            icon: colors.form.notification.info.icon,
                            close: colors.form.notification.info.close,
                            closeHover: colors.form.notification.info.closeHover,
                        },
                    },
                    progress: {
                        completed: {
                            background: colors.form.progress.completed.background,
                            text: colors.form.progress.completed.text,
                            border: colors.form.progress.completed.border,
                        },
                        current: {
                            background: colors.form.progress.current.background,
                            text: colors.form.progress.current.text,
                            border: colors.form.progress.current.border,
                            ring: colors.form.progress.current.ring,
                        },
                        upcoming: {
                            background: colors.form.progress.upcoming.background,
                            text: colors.form.progress.upcoming.text,
                            border: colors.form.progress.upcoming.border,
                        },
                        connector: {
                            completed: colors.form.progress.connector.completed,
                            upcoming: colors.form.progress.connector.upcoming,
                        },
                    },
                    status: {
                        idle: {
                            background: colors.form.status.idle.background,
                            border: colors.form.status.idle.border,
                            text: colors.form.status.idle.text,
                        },
                        loading: {
                            background: colors.form.status.loading.background,
                            border: colors.form.status.loading.border,
                            text: colors.form.status.loading.text,
                            icon: colors.form.status.loading.icon,
                        },
                        success: {
                            background: colors.form.status.success.background,
                            border: colors.form.status.success.border,
                            text: colors.form.status.success.text,
                            icon: colors.form.status.success.icon,
                        },
                        error: {
                            background: colors.form.status.error.background,
                            border: colors.form.status.error.border,
                            text: colors.form.status.error.text,
                            icon: colors.form.status.error.icon,
                        },
                        warning: {
                            background: colors.form.status.warning.background,
                            border: colors.form.status.warning.border,
                            text: colors.form.status.warning.text,
                            icon: colors.form.status.warning.icon,
                        },
                    },
                },
            },

            // Tipografía personalizada
            fontFamily: {
                sans: typography.fontFamily.sans,
                mono: typography.fontFamily.mono,
            },

            fontSize: {
                xs: typography.fontSize.xs,
                sm: typography.fontSize.sm,
                base: typography.fontSize.base,
                lg: typography.fontSize.lg,
                xl: typography.fontSize.xl,
                '2xl': typography.fontSize['2xl'],
                '3xl': typography.fontSize['3xl'],
                '4xl': typography.fontSize['4xl'],
                '5xl': typography.fontSize['5xl'],
                '6xl': typography.fontSize['6xl'],
            },

            fontWeight: typography.fontWeight,
            letterSpacing: typography.letterSpacing,
            lineHeight: typography.lineHeight,

            // Espaciado personalizado para formularios
            spacing: {
                '18': '4.5rem',   // 72px
                '88': '22rem',    // 352px
            },

            // Bordes personalizados
            borderRadius: {
                'form': '0.5rem',  // 8px - para inputs y botones
                'card': '0.75rem', // 12px - para cards
            },

            // Sombras personalizadas
            boxShadow: {
                'form': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                'form-focus': '0 0 0 3px rgba(107, 114, 128, 0.1)',
                'form-error': '0 0 0 3px rgba(239, 68, 68, 0.1)',
            },

            // Transiciones personalizadas
            transitionDuration: {
                'form': '200ms',
            },

            // Breakpoints personalizados
            screens: {
                'xs': '475px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
        },
    },

    // Plugins personalizados
    plugins: [
        // Plugin para utilidades de formularios
        function ({ addUtilities, theme }) {
            const newUtilities = {
                // Utilidades para formularios
                '.form-input': {
                    width: '100%',
                    padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
                    borderWidth: '1px',
                    borderColor: theme('colors.form.input.default.border'),
                    backgroundColor: theme('colors.form.input.default.background'),
                    color: theme('colors.form.input.default.text'),
                    borderRadius: theme('borderRadius.form'),
                    fontSize: theme('fontSize.base[0]'),
                    lineHeight: theme('fontSize.base[1].lineHeight'),
                    transitionProperty: 'all',
                    transitionDuration: theme('transitionDuration.form'),
                    '&::placeholder': {
                        color: theme('colors.form.input.default.placeholder'),
                    },
                    '&:focus': {
                        outline: 'none',
                        borderColor: theme('colors.form.input.focus.border'),
                        boxShadow: theme('boxShadow.form-focus'),
                    },
                    '&:disabled': {
                        backgroundColor: theme('colors.form.input.disabled.background'),
                        borderColor: theme('colors.form.input.disabled.border'),
                        color: theme('colors.form.input.disabled.text'),
                        cursor: 'not-allowed',
                    },
                },

                '.form-input-error': {
                    borderColor: theme('colors.form.input.error.border'),
                    backgroundColor: theme('colors.form.input.error.background'),
                    '&:focus': {
                        borderColor: theme('colors.form.input.error.border'),
                        boxShadow: theme('boxShadow.form-error'),
                    },
                },

                '.form-button': {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: `${theme('spacing.3')} ${theme('spacing.4')}`,
                    borderRadius: theme('borderRadius.form'),
                    fontSize: theme('fontSize.base[0]'),
                    fontWeight: theme('fontWeight.medium'),
                    transitionProperty: 'all',
                    transitionDuration: theme('transitionDuration.form'),
                    cursor: 'pointer',
                    '&:disabled': {
                        opacity: '0.5',
                        cursor: 'not-allowed',
                    },
                },

                '.form-button-primary': {
                    backgroundColor: theme('colors.form.button.primary.background'),
                    color: theme('colors.form.button.primary.text'),
                    '&:hover:not(:disabled)': {
                        backgroundColor: theme('colors.form.button.primary.hover'),
                    },
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 3px ${theme('colors.form.button.primary.focus')}20`,
                    },
                },

                '.form-button-secondary': {
                    backgroundColor: theme('colors.form.button.secondary.background'),
                    color: theme('colors.form.button.secondary.text'),
                    '&:hover:not(:disabled)': {
                        backgroundColor: theme('colors.form.button.secondary.hover'),
                    },
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 3px ${theme('colors.form.button.secondary.focus')}20`,
                    },
                },

                '.form-button-danger': {
                    backgroundColor: theme('colors.form.button.danger.background'),
                    color: theme('colors.form.button.danger.text'),
                    '&:hover:not(:disabled)': {
                        backgroundColor: theme('colors.form.button.danger.hover'),
                    },
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 3px ${theme('colors.form.button.danger.focus')}20`,
                    },
                },

                '.form-button-success': {
                    backgroundColor: theme('colors.form.button.success.background'),
                    color: theme('colors.form.button.success.text'),
                    '&:hover:not(:disabled)': {
                        backgroundColor: theme('colors.form.button.success.hover'),
                    },
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 3px ${theme('colors.form.button.success.focus')}20`,
                    },
                },

                '.form-button-outline': {
                    backgroundColor: theme('colors.form.button.outline.background'),
                    borderWidth: '2px',
                    borderColor: theme('colors.form.button.outline.border'),
                    color: theme('colors.form.button.outline.text'),
                    '&:hover:not(:disabled)': {
                        backgroundColor: theme('colors.form.button.outline.hover'),
                    },
                    '&:focus': {
                        outline: 'none',
                        boxShadow: `0 0 0 3px ${theme('colors.form.button.outline.focus')}20`,
                    },
                },
            };

            addUtilities(newUtilities);
        },
    ],
};

export default tailwindConfig;
