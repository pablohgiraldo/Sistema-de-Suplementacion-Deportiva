import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">Política de Privacidad</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-CO')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">1. Información que Recopilamos</h2>
              <p className="text-gray-700 mb-4">
                Recopilamos información personal que usted nos proporciona directamente, como:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Nombre completo y datos de contacto</li>
                <li>Información de facturación y envío</li>
                <li>Historial de compras y preferencias</li>
                <li>Comunicaciones con nuestro servicio al cliente</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">2. Uso de la Información</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos su información personal para:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Procesar y cumplir con sus pedidos</li>
                <li>Proporcionar servicio al cliente</li>
                <li>Enviar comunicaciones sobre productos y ofertas</li>
                <li>Mejorar nuestros servicios y experiencia del usuario</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">3. Compartir Información</h2>
              <p className="text-gray-700 mb-4">
                No vendemos, alquilamos ni compartimos su información personal con terceros, excepto:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Proveedores de servicios que nos ayudan a operar nuestro negocio</li>
                <li>Procesadores de pagos para transacciones</li>
                <li>Servicios de envío para entregas</li>
                <li>Cuando sea requerido por ley</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">4. Seguridad de Datos</h2>
              <p className="text-gray-700 mb-4">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información 
                personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">5. Cookies y Tecnologías Similares</h2>
              <p className="text-gray-700 mb-4">
                Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web, 
                recordar sus preferencias y analizar el tráfico del sitio.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">6. Sus Derechos</h2>
              <p className="text-gray-700 mb-4">
                Usted tiene derecho a:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                <li>Acceder a su información personal</li>
                <li>Corregir información inexacta</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Oponerse al procesamiento de sus datos</li>
                <li>Retirar su consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">7. Retención de Datos</h2>
              <p className="text-gray-700 mb-4">
                Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos 
                descritos en esta política, a menos que la ley requiera un período de retención más largo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">8. Menores de Edad</h2>
              <p className="text-gray-700 mb-4">
                Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos conscientemente 
                información personal de menores de edad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">9. Cambios en esta Política</h2>
              <p className="text-gray-700 mb-4">
                Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios 
                significativos a través de nuestro sitio web o por correo electrónico.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">10. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Si tiene preguntas sobre esta política de privacidad, puede contactarnos a través de nuestro 
                <a href="/support" className="text-blue-600 hover:text-blue-800 underline"> centro de soporte</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
