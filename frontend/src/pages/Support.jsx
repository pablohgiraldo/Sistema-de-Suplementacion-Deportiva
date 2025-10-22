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
        <div className="min-h-screen bg-white">
            {/* Hero Section - Minimalista según PRD */}
            <div className="bg-gray-100 py-16 sm:py-20">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center">
                        <div className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                            SOPORTE
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                            ¿Cómo podemos ayudarte?
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Estamos aquí para resolver todas tus dudas y brindarte el mejor servicio
                        </p>
                    </div>
                </div>
            </div>

            {/* Métodos de Contacto - Diseño minimalista */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {contactMethods.map((method, index) => (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer"
                            onClick={index === 0 ? openChat : undefined}
                        >
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                                <div className="text-white">
                                    {method.icon}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-black mb-2">
                                {method.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                {method.description}
                            </p>
                            <p className="text-xs font-semibold text-black">
                                {method.action}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Sección de Ayuda Rápida - Minimalista */}
                <div className="bg-gray-100 rounded-2xl p-8 mb-16">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-black mb-4">
                            ¿Necesitas ayuda rápida?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Nuestro chat en vivo está disponible 24/7 para resolver tus dudas de inmediato
                        </p>
                        <button
                            onClick={openChat}
                            className="bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                        >
                            Iniciar Chat Ahora
                        </button>
                    </div>
                </div>

                {/* FAQs Section - Minimalista */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <div className="inline-block bg-black text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                            PREGUNTAS FRECUENTES
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                            Preguntas Frecuentes
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Encuentra respuestas rápidas a las preguntas más comunes
                        </p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-bold text-black text-lg">
                                        {faq.question}
                                    </span>
                                    <svg
                                        className={`w-6 h-6 text-gray-400 transition-transform ${
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
                                    <div className="px-6 pb-6 bg-gray-50">
                                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recursos Adicionales - Minimalista */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Guías de Usuario</h3>
                        <p className="text-gray-600 mb-4">
                            Aprende a usar todas las funciones de SuperGains
                        </p>
                        <a href="#" className="text-black font-bold hover:text-gray-600 transition-colors">
                            Ver guías →
                        </a>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Rastrear Pedido</h3>
                        <p className="text-gray-600 mb-4">
                            Consulta el estado de tu pedido en tiempo real
                        </p>
                        <a href="/orders" className="text-black font-bold hover:text-gray-600 transition-colors">
                            Mis pedidos →
                        </a>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-3">Puntos de Lealtad</h3>
                        <p className="text-gray-600 mb-4">
                            Consulta y canjea tus puntos acumulados
                        </p>
                        <a href="/profile" className="text-black font-bold hover:text-gray-600 transition-colors">
                            Mi perfil →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

