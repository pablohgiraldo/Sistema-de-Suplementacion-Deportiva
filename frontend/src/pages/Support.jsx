/**
 * Página: Support
 * 
 * Página de soporte al cliente con información de contacto,
 * FAQs y acceso al chat en vivo
 */

import { useState } from 'react';

export default function Support() {
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "¿Cómo puedo realizar un pedido?",
            answer: "Para realizar un pedido, navega por nuestro catálogo, selecciona los productos que desees, agrégalos al carrito y sigue el proceso de checkout. Necesitarás crear una cuenta o iniciar sesión."
        },
        {
            question: "¿Cuáles son los métodos de pago disponibles?",
            answer: "Aceptamos tarjetas de crédito, débito, PSE y otros métodos de pago a través de nuestra pasarela segura PayU."
        },
        {
            question: "¿Cuánto tiempo tarda el envío?",
            answer: "El tiempo de envío varía según tu ubicación. Generalmente, los pedidos llegan entre 2-5 días hábiles en ciudades principales y 5-8 días en zonas rurales."
        },
        {
            question: "¿Puedo cambiar o devolver un producto?",
            answer: "Sí, aceptamos cambios y devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en su empaque original y sin usar."
        },
        {
            question: "¿Cómo funciona el programa de puntos de lealtad?",
            answer: "Por cada dólar que gastes, acumulas 1 punto. Cada 100 puntos equivalen a $1 USD que puedes canjear en tu próxima compra durante el checkout."
        },
        {
            question: "¿Qué hago si mi pedido no llega?",
            answer: "Puedes rastrear tu pedido desde la sección 'Mis Pedidos'. Si hay algún problema, contáctanos de inmediato a través del chat en vivo o por email."
        },
        {
            question: "¿Los productos son originales?",
            answer: "Sí, todos nuestros productos son 100% originales y trabajamos directamente con distribuidores autorizados de las marcas."
        },
        {
            question: "¿Ofrecen envío gratis?",
            answer: "Sí, ofrecemos envío gratis en pedidos superiores a $100 USD."
        }
    ];

    const contactMethods = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            title: "Chat en Vivo",
            description: "Habla con un agente ahora",
            action: "Disponible 24/7",
            color: "blue"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            title: "Email",
            description: "soporte@supergains.com",
            action: "Respuesta en 24h",
            color: "green"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
            ),
            title: "Teléfono",
            description: "+57 (310) 123-4567",
            action: "Lun-Vie 8am-6pm",
            color: "purple"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            title: "Tienda Física",
            description: "Cra 43A #18-95, Medellín",
            action: "Lun-Sab 9am-7pm",
            color: "orange"
        }
    ];

    const openChat = () => {
        if (window.Tawk_API && window.Tawk_API.maximize) {
            window.Tawk_API.maximize();
        } else {
            alert('El chat se está cargando. Por favor, espera unos segundos e intenta de nuevo.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            ¿Cómo podemos ayudarte?
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Estamos aquí para responder todas tus preguntas y brindarte el mejor soporte posible
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Methods */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {contactMethods.map((method, index) => (
                        <div
                            key={index}
                            className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-t-4 border-${method.color}-500`}
                            onClick={index === 0 ? openChat : undefined}
                        >
                            <div className={`text-${method.color}-600 mb-4`}>
                                {method.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                {method.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                {method.description}
                            </p>
                            <p className={`text-xs font-semibold text-${method.color}-600`}>
                                {method.action}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Quick Help Section */}
                <div className="bg-blue-50 rounded-lg p-8 mb-16 border border-blue-200">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                                ¿Necesitas ayuda rápida?
                            </h3>
                            <p className="text-gray-700 mb-4">
                                Nuestro chat en vivo está disponible 24/7 para resolver tus dudas de inmediato.
                            </p>
                            <button
                                onClick={openChat}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Iniciar Chat Ahora
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQs Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Preguntas Frecuentes
                        </h2>
                        <p className="text-gray-600">
                            Encuentra respuestas rápidas a las preguntas más comunes
                        </p>
                    </div>

                    <div className="max-w-3xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">
                                        {faq.question}
                                    </span>
                                    <svg
                                        className={`w-5 h-5 text-gray-500 transition-transform ${
                                            openFaq === index ? 'transform rotate-180' : ''
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-gray-700">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Resources */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-blue-600 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Guías de Usuario
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Aprende a usar todas las funciones de SuperGains
                        </p>
                        <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                            Ver guías →
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-green-600 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Rastrear Pedido
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Consulta el estado de tu pedido en tiempo real
                        </p>
                        <a href="/orders" className="text-green-600 hover:text-green-700 text-sm font-semibold">
                            Mis pedidos →
                        </a>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-purple-600 mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            Puntos de Lealtad
                        </h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Consulta y canjea tus puntos acumulados
                        </p>
                        <a href="/profile" className="text-purple-600 hover:text-purple-700 text-sm font-semibold">
                            Mi perfil →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

