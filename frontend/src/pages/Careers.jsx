import React from 'react';

export default function Careers() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">Carreras en SuperGains</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8 text-lg">
              Únete a nuestro equipo y forma parte de la revolución en la industria de suplementos deportivos.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">¿Por qué trabajar con nosotros?</h2>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-black mb-3">Crecimiento Profesional</h3>
                  <p className="text-gray-700">
                    Ofrecemos oportunidades de desarrollo y crecimiento en una empresa en expansión.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-black mb-3">Ambiente Dinámico</h3>
                  <p className="text-gray-700">
                    Trabajamos en un entorno innovador y colaborativo donde cada idea cuenta.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-black mb-3">Beneficios Competitivos</h3>
                  <p className="text-gray-700">
                    Ofrecemos un paquete de beneficios atractivo y salarios competitivos.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-black mb-3">Impacto Real</h3>
                  <p className="text-gray-700">
                    Contribuye a mejorar la vida de miles de atletas y entusiastas del fitness.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Posiciones Disponibles</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-black mb-2">Desarrollador Frontend</h3>
                  <p className="text-gray-600 mb-3">Tiempo completo • Bogotá, Colombia</p>
                  <p className="text-gray-700 mb-4">
                    Buscamos un desarrollador frontend con experiencia en React, JavaScript y diseño responsivo 
                    para mejorar nuestra plataforma de e-commerce.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">React</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">JavaScript</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">CSS</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">HTML</span>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                    Aplicar Ahora
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-black mb-2">Especialista en Marketing Digital</h3>
                  <p className="text-gray-600 mb-3">Tiempo completo • Bogotá, Colombia</p>
                  <p className="text-gray-700 mb-4">
                    Necesitamos un especialista en marketing digital para desarrollar y ejecutar estrategias 
                    de marketing en redes sociales y campañas publicitarias.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Marketing Digital</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Redes Sociales</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Google Ads</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Analytics</span>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                    Aplicar Ahora
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-black mb-2">Asesor de Ventas</h3>
                  <p className="text-gray-600 mb-3">Tiempo completo • Bogotá, Colombia</p>
                  <p className="text-gray-700 mb-4">
                    Buscamos un asesor de ventas con conocimiento en suplementos deportivos para brindar 
                    asesoría especializada a nuestros clientes.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Ventas</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Nutrición</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Fitness</span>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Atención al Cliente</span>
                  </div>
                  <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors">
                    Aplicar Ahora
                  </button>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Proceso de Selección</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">1</div>
                  <h3 className="font-bold text-black mb-2">Aplicación</h3>
                  <p className="text-gray-600 text-sm">Envía tu CV y carta de presentación</p>
                </div>
                <div className="text-center">
                  <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">2</div>
                  <h3 className="font-bold text-black mb-2">Revisión</h3>
                  <p className="text-gray-600 text-sm">Evaluamos tu perfil y experiencia</p>
                </div>
                <div className="text-center">
                  <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">3</div>
                  <h3 className="font-bold text-black mb-2">Entrevista</h3>
                  <p className="text-gray-600 text-sm">Conversación con nuestro equipo</p>
                </div>
                <div className="text-center">
                  <div className="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">4</div>
                  <h3 className="font-bold text-black mb-2">Decisión</h3>
                  <p className="text-gray-600 text-sm">Te contactamos con la respuesta</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Beneficios</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-black mb-3">Beneficios Laborales</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Salario competitivo</li>
                    <li>Seguro médico</li>
                    <li>Vacaciones pagadas</li>
                    <li>Bonificaciones por rendimiento</li>
                    <li>Capacitación continua</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-3">Beneficios Adicionales</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Descuentos en productos</li>
                    <li>Ambiente de trabajo flexible</li>
                    <li>Oportunidades de crecimiento</li>
                    <li>Equipo joven y dinámico</li>
                    <li>Ubicación céntrica</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">¿No encuentras la posición ideal?</h2>
              <p className="text-gray-700 mb-4">
                Si no encuentras una posición que se ajuste a tu perfil, pero te interesa formar parte de nuestro equipo, 
                puedes enviarnos tu CV y nos pondremos en contacto contigo cuando tengamos una oportunidad adecuada.
              </p>
              <button className="bg-gray-800 text-white px-6 py-3 rounded hover:bg-gray-900 transition-colors">
                Enviar CV Espontáneo
              </button>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Contacto</h2>
              <p className="text-gray-700 mb-4">
                Para más información sobre nuestras oportunidades laborales, puedes contactarnos:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> careers@supergains.com.co</p>
                <p className="text-gray-700 mb-2"><strong>Teléfono:</strong> +57 (1) 234-5678</p>
                <p className="text-gray-700"><strong>Dirección:</strong> Calle 123 #45-67, Bogotá, Colombia</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
