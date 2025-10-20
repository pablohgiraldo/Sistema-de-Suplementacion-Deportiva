/**
 * Componente: TawkToChat
 * 
 * Integración del widget de chat de Tawk.to para soporte en vivo
 * Se carga de forma asíncrona y se muestra en todas las páginas
 */

import { useEffect } from 'react';
import { TAWK_CONFIG } from '../config/tawk.config';

export default function TawkToChat() {
    useEffect(() => {
        // Configuración de Tawk.to desde archivo de configuración
        const { propertyId, widgetId } = TAWK_CONFIG;

        // Verificar si el script ya está cargado
        if (window.Tawk_API) {
            return;
        }

        // Crear y cargar el script de Tawk.to
        const script = document.createElement('script');
        script.async = true;
        script.src = `${TAWK_CONFIG.baseUrl}/${propertyId}/${widgetId}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        // Configurar Tawk_API antes de cargar el script
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Eventos de Tawk.to (opcional)
        window.Tawk_API.onLoad = function () {
            console.log('✅ Tawk.to chat cargado exitosamente');
        };

        window.Tawk_API.onChatMaximized = function () {
            console.log('💬 Chat abierto');
        };

        window.Tawk_API.onChatMinimized = function () {
            console.log('💬 Chat minimizado');
        };

        // Añadir el script al documento
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);

        // Cleanup: remover el script cuando el componente se desmonte
        return () => {
            // Opcional: puedes remover el widget si lo deseas
            // Pero generalmente se deja activo durante toda la sesión
        };
    }, []);

    // Este componente no renderiza nada visible
    return null;
}

