import React from 'react';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">Política de Cookies</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-CO')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">1. ¿Qué son las Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita 
                nuestro sitio web. Nos ayudan a mejorar su experiencia de navegación y a entender cómo utiliza nuestro sitio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">2. Tipos de Cookies que Utilizamos</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3">Cookies Esenciales</h3>
                <p className="text-gray-700 mb-4">
                  Estas cookies son necesarias para el funcionamiento básico del sitio web y no se pueden desactivar.
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Cookies de sesión para mantener su carrito de compras</li>
                  <li>Cookies de autenticación para mantener su sesión iniciada</li>
                  <li>Cookies de seguridad para proteger contra ataques</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3">Cookies de Rendimiento</h3>
                <p className="text-gray-700 mb-4">
                  Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Google Analytics para análisis de tráfico</li>
                  <li>Cookies de seguimiento de páginas visitadas</li>
                  <li>Métricas de rendimiento del sitio</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3">Cookies de Funcionalidad</h3>
                <p className="text-gray-700 mb-4">
                  Mejoran la funcionalidad del sitio web y personalizan su experiencia.
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Preferencias de idioma y región</li>
                  <li>Configuraciones de usuario</li>
                  <li>Recordar información de formularios</li>
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-bold text-black mb-3">Cookies de Marketing</h3>
                <p className="text-gray-700 mb-4">
                  Se utilizan para mostrar anuncios relevantes y medir la efectividad de las campañas.
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                  <li>Cookies de redes sociales</li>
                  <li>Cookies de publicidad dirigida</li>
                  <li>Cookies de remarketing</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">3. Gestión de Cookies</h2>
              <p className="text-gray-700 mb-4">
                Puede controlar y gestionar las cookies de varias maneras:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Configuración de su navegador web</li>
                <li>Herramientas de gestión de cookies de terceros</li>
                <li>Configuración de privacidad en nuestro sitio web</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">4. Cookies de Terceros</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos servicios de terceros que pueden establecer sus propias cookies:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li><strong>Google Analytics:</strong> Para análisis de tráfico web</li>
                <li><strong>Facebook Pixel:</strong> Para seguimiento de conversiones</li>
                <li><strong>Stripe:</strong> Para procesamiento de pagos</li>
                <li><strong>DHL:</strong> Para seguimiento de envíos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">5. Duración de las Cookies</h2>
              <p className="text-gray-700 mb-4">
                Las cookies pueden ser:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li><strong>Cookies de sesión:</strong> Se eliminan al cerrar el navegador</li>
                <li><strong>Cookies persistentes:</strong> Permanecen durante un período determinado</li>
                <li><strong>Cookies de larga duración:</strong> Pueden durar hasta 2 años</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">6. Impacto de Desactivar Cookies</h2>
              <p className="text-gray-700 mb-4">
                Si desactiva las cookies, algunas funcionalidades del sitio web pueden verse afectadas:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>No podrá mantener productos en su carrito</li>
                <li>Su sesión no se mantendrá iniciada</li>
                <li>Las preferencias no se recordarán</li>
                <li>Algunas funciones personalizadas no estarán disponibles</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">7. Actualizaciones de esta Política</h2>
              <p className="text-gray-700 mb-4">
                Podemos actualizar esta política de cookies ocasionalmente para reflejar cambios en nuestras 
                prácticas o por razones legales. Le recomendamos revisar esta página periódicamente.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">8. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Si tiene preguntas sobre nuestra política de cookies, puede contactarnos a través de nuestro 
                <a href="/support" className="text-blue-600 hover:text-blue-800 underline"> centro de soporte</a> 
                o enviar un correo electrónico a privacy@supergains.com.co
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
