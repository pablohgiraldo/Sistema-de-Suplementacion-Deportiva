import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">Términos de Servicio</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-CO')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">1. Aceptación de los Términos</h2>
              <p className="text-gray-700 mb-4">
                Al acceder y utilizar el sitio web de SuperGains, usted acepta cumplir con estos términos de servicio. 
                Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">2. Descripción del Servicio</h2>
              <p className="text-gray-700 mb-4">
                SuperGains es una plataforma de comercio electrónico especializada en suplementos deportivos y nutrición. 
                Ofrecemos productos de alta calidad para atletas y personas interesadas en mejorar su rendimiento físico.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">3. Registro de Usuario</h2>
              <p className="text-gray-700 mb-4">
                Para realizar compras, debe crear una cuenta proporcionando información veraz y actualizada. 
                Es responsable de mantener la confidencialidad de su cuenta y contraseña.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">4. Productos y Precios</h2>
              <p className="text-gray-700 mb-4">
                Todos los precios están en pesos colombianos e incluyen IVA. Nos reservamos el derecho de modificar 
                precios y disponibilidad de productos sin previo aviso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">5. Pagos y Facturación</h2>
              <p className="text-gray-700 mb-4">
                Aceptamos pagos con tarjetas de crédito, débito y transferencias bancarias. 
                Los pagos se procesan de forma segura a través de nuestros socios certificados.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">6. Envíos y Entregas</h2>
              <p className="text-gray-700 mb-4">
                Realizamos envíos a nivel nacional a través de DHL. Los tiempos de entrega varían según la ubicación 
                y pueden verse afectados por factores externos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">7. Devoluciones y Reembolsos</h2>
              <p className="text-gray-700 mb-4">
                Aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que los productos 
                estén en su estado original y con el empaque intacto.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">8. Limitación de Responsabilidad</h2>
              <p className="text-gray-700 mb-4">
                SuperGains no se hace responsable por el uso indebido de los productos. Los suplementos deben 
                consumirse según las indicaciones y bajo supervisión médica si es necesario.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">9. Modificaciones</h2>
              <p className="text-gray-700 mb-4">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones entrarán en vigor inmediatamente después de su publicación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">10. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Para consultas sobre estos términos, puede contactarnos a través de nuestro 
                <a href="/support" className="text-blue-600 hover:text-blue-800 underline"> centro de soporte</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
