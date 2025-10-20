/**
 * Componente: TawkToChat
 * 
 * Integración del widget de chat de Tawk.to para soporte en vivo
 * Se carga de forma asíncrona y se muestra en todas las páginas
 */

import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TAWK_CONFIG } from '../config/tawk.config';
import api from '../services/api';

export default function TawkToChat() {
    const { user, isAuthenticated } = useAuth();

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

        // Función para notificar al admin sobre inicio de chat
        const notifyAdminChatStarted = async (visitorInfo) => {
            try {
                await api.post('/notifications/chat-started', {
                    visitorName: visitorInfo.name || 'Visitante Anónimo',
                    visitorEmail: visitorInfo.email || 'No proporcionado',
                    userId: user?._id || null,
                    userName: user?.nombre || null,
                    timestamp: new Date().toISOString()
                });
                console.log('✅ Notificación de chat enviada a admin');
            } catch (error) {
                console.error('❌ Error al notificar admin sobre chat:', error);
            }
        };

        // Eventos de Tawk.to
        window.Tawk_API.onLoad = function () {
            console.log('✅ Tawk.to chat cargado exitosamente');
            
            // Si hay usuario autenticado, pasar su información al chat
            if (isAuthenticated && user) {
                window.Tawk_API.setAttributes({
                    'name': user.nombre || 'Usuario',
                    'email': user.email || '',
                    'userId': user._id || '',
                    'rol': user.rol || 'usuario'
                }, function(error) {
                    if (error) {
                        console.error('Error al establecer atributos de usuario:', error);
                    } else {
                        console.log('✅ Información de usuario establecida en chat');
                    }
                });
            }
        };

        window.Tawk_API.onChatMaximized = function () {
            console.log('💬 Chat abierto por usuario');
        };

        window.Tawk_API.onChatMinimized = function () {
            console.log('💬 Chat minimizado');
        };

        // Evento cuando se inicia una conversación (primer mensaje del visitante)
        window.Tawk_API.onChatStarted = function () {
            console.log('🆕 Nueva conversación de chat iniciada');
            
            // Obtener información del visitante
            const visitorInfo = {
                name: user?.nombre || window.Tawk_API.getWindowType() || 'Visitante',
                email: user?.email || ''
            };

            // Notificar al admin
            notifyAdminChatStarted(visitorInfo);
        };

        // Evento cuando el visitante envía un mensaje
        window.Tawk_API.onChatMessageVisitor = function (message) {
            console.log('📨 Mensaje del visitante:', message.message);
        };

        // Evento cuando un agente responde
        window.Tawk_API.onChatMessageAgent = function (message) {
            console.log('📩 Mensaje del agente:', message.message);
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

