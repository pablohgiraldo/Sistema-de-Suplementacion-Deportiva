import React from 'react';

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-6">Aviso Legal</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Última actualización: {new Date().toLocaleDateString('es-CO')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">1. Identificación del Titular</h2>
              <p className="text-gray-700 mb-4">
                <strong>SuperGains Colombia S.A.S.</strong><br/>
                NIT: 900.123.456-7<br/>
                Dirección: Calle 123 #45-67, Bogotá, Colombia<br/>
                Teléfono: +57 (1) 234-5678<br/>
                Email: info@supergains.com.co
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">2. Objeto Social</h2>
              <p className="text-gray-700 mb-4">
                SuperGains se dedica a la comercialización de suplementos deportivos, productos nutricionales 
                y accesorios relacionados con el fitness y la salud deportiva.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">3. Condiciones de Uso</h2>
              <p className="text-gray-700 mb-4">
                El acceso y uso de este sitio web implica la aceptación plena de las condiciones establecidas 
                en este aviso legal. Si no está de acuerdo con alguna de estas condiciones, debe abstenerse 
                de utilizar el sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">4. Propiedad Intelectual</h2>
              <p className="text-gray-700 mb-4">
                Todos los contenidos de este sitio web, incluyendo textos, imágenes, logotipos, marcas, 
                diseños y software, son propiedad de SuperGains o de terceros que han autorizado su uso, 
                y están protegidos por las leyes de propiedad intelectual.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">5. Responsabilidad</h2>
              <p className="text-gray-700 mb-4">
                SuperGains se compromete a mantener la veracidad y actualización de la información contenida 
                en el sitio web, pero no se hace responsable de errores u omisiones que puedan existir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">6. Enlaces Externos</h2>
              <p className="text-gray-700 mb-4">
                Este sitio web puede contener enlaces a sitios web de terceros. SuperGains no se hace 
                responsable del contenido, políticas de privacidad o prácticas de estos sitios externos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">7. Protección de Datos</h2>
              <p className="text-gray-700 mb-4">
                El tratamiento de datos personales se rige por nuestra 
                <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline"> Política de Privacidad</a>, 
                cumpliendo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">8. Legislación Aplicable</h2>
              <p className="text-gray-700 mb-4">
                Este aviso legal se rige por la legislación colombiana. Para cualquier controversia, 
                las partes se someten a la jurisdicción de los tribunales de Bogotá, Colombia.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">9. Modificaciones</h2>
              <p className="text-gray-700 mb-4">
                SuperGains se reserva el derecho de modificar este aviso legal en cualquier momento. 
                Las modificaciones entrarán en vigor desde su publicación en el sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">10. Contacto</h2>
              <p className="text-gray-700 mb-4">
                Para cualquier consulta relacionada con este aviso legal, puede contactarnos a través de nuestro 
                <a href="/support" className="text-blue-600 hover:text-blue-800 underline"> centro de soporte</a> 
                o enviar un correo electrónico a legal@supergains.com.co
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
