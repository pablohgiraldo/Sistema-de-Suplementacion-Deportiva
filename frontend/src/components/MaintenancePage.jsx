import React from 'react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    {/* Logo o icono de la empresa */}
                    <div className="mx-auto h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                        <svg
                            className="h-8 w-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>

                    {/* Título principal */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        SuperGains
                    </h1>

                    {/* Subtítulo */}
                    <h2 className="text-xl font-semibold text-gray-700 mb-6">
                        Sitio en Mantenimiento
                    </h2>
                </div>

                {/* Mensaje principal */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="text-center">
                        {/* Icono de mantenimiento */}
                        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="h-6 w-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                            </svg>
                        </div>

                        {/* Mensaje de mantenimiento */}
                        <p className="text-gray-600 text-base leading-relaxed mb-6">
                            Estamos realizando mejoras en nuestro sitio web para brindarte una mejor experiencia.
                            Volveremos pronto con nuevas funcionalidades y mejoras.
                        </p>

                        {/* Información adicional */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-500 mb-2">
                                <strong>Tiempo estimado:</strong> 2-4 horas
                            </p>
                            <p className="text-sm text-gray-500">
                                <strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM
                            </p>
                        </div>

                        {/* Botón de contacto */}
                        <div className="space-y-3">
                            <button
                                className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => window.open('mailto:soporte@supergains.com', '_blank')}
                            >
                                Contactar Soporte
                            </button>

                            <button
                                className="w-full bg-white text-gray-700 py-3 px-4 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => window.location.reload()}
                            >
                                Intentar Nuevamente
                            </button>
                        </div>
                    </div>
                </div>

                {/* Información de contacto */}
                <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                        ¿Necesitas ayuda inmediata?
                    </p>
                    <div className="flex justify-center space-x-6 text-sm text-gray-500">
                        <a
                            href="mailto:soporte@supergains.com"
                            className="hover:text-gray-700 transition-colors duration-200"
                        >
                            soporte@supergains.com
                        </a>
                        <a
                            href="tel:+573001234567"
                            className="hover:text-gray-700 transition-colors duration-200"
                        >
                            +57 300 123 4567
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        © 2024 SuperGains. Todos los derechos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
