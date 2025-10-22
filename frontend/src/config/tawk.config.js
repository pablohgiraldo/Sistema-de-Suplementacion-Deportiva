/**
 * Configuración de Tawk.to
 */

export const TAWK_CONFIG = {
    // Property ID de tu cuenta Tawk.to
    propertyId: import.meta.env.VITE_TAWK_PROPERTY_ID || '68f80ed4403f92194faa9d58',

    // Widget ID de tu widget específico
    widgetId: import.meta.env.VITE_TAWK_WIDGET_ID || '1j84fjs44',

    // URL base de Tawk.to
    baseUrl: 'https://embed.tawk.to',

    // Configuración adicional (opcional)
    options: {
        // Personalización del widget
        visibility: {
            desktop: {
                position: 'br', // bottom-right
                xOffset: 20,
                yOffset: 20
            },
            mobile: {
                position: 'br',
                xOffset: 10,
                yOffset: 10
            }
        }
    }
};

export default TAWK_CONFIG;

