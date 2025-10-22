import { Link } from 'react-router-dom';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm">
                        ← Volver al inicio
                    </Link>
                </div>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Términos y Condiciones de Uso</h1>
                    <p className="text-gray-600">Última actualización: 22 de Octubre, 2025</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Al acceder y utilizar SuperGains (el "Sitio"), usted acepta estar sujeto a estos Términos y Condiciones de Uso, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de todas las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido usar o acceder a este sitio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Uso del Sitio</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            El contenido de este sitio web es para su información general y uso solamente. Está sujeto a cambios sin previo aviso. Al utilizar nuestro sitio, usted se compromete a:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Proporcionar información precisa, actual y completa al crear una cuenta</li>
                            <li>Mantener la seguridad de su contraseña y aceptar toda la responsabilidad de la actividad bajo su cuenta</li>
                            <li>No utilizar el sitio para ningún propósito ilegal o no autorizado</li>
                            <li>No interferir o interrumpir el sitio o los servidores o redes conectadas al sitio</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Productos y Servicios</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            SuperGains se reserva el derecho de:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Modificar o discontinuar cualquier producto sin previo aviso</li>
                            <li>Limitar las cantidades de cualquier producto que ofrecemos</li>
                            <li>Rechazar cualquier pedido que realice con nosotros</li>
                            <li>Corregir cualquier error, inexactitud u omisión en la información de productos</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Precios y Pagos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Todos los precios están sujetos a cambios sin previo aviso. Los precios mostrados en el sitio incluyen IVA cuando sea aplicable. Nos reservamos el derecho de modificar o descontinuar ofertas promocionales en cualquier momento. Los pagos se procesan de forma segura a través de nuestros proveedores de pago certificados.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Envíos y Entregas</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Nos esforzamos por entregar todos los pedidos dentro de los plazos estimados. Sin embargo, SuperGains no se hace responsable de retrasos causados por circunstancias fuera de nuestro control, incluyendo pero no limitado a problemas del servicio de mensajería, desastres naturales o eventos de fuerza mayor.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Devoluciones y Reembolsos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Aceptamos devoluciones de productos no abiertos dentro de los 30 días posteriores a la compra. Los productos deben estar en su empaque original y en condiciones de reventa. Los gastos de envío de devolución son responsabilidad del cliente, excepto en casos de productos defectuosos o errores en el envío.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Propiedad Intelectual</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Todo el contenido del sitio, incluyendo textos, gráficos, logotipos, íconos, imágenes, clips de audio, descargas digitales y software, es propiedad de SuperGains o sus proveedores de contenido y está protegido por las leyes de propiedad intelectual de Colombia y tratados internacionales.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
                        <p className="text-gray-700 leading-relaxed">
                            SuperGains no será responsable de ningún daño directo, indirecto, incidental, especial o consecuente que resulte del uso o la imposibilidad de usar nuestros productos o servicios. Esta limitación se aplica independientemente de si el daño surge de un contrato, negligencia u otra teoría legal.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modificaciones a los Términos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            SuperGains se reserva el derecho de revisar estos términos y condiciones en cualquier momento. Al continuar utilizando este sitio después de que se publiquen dichos cambios, usted acepta estar sujeto a la versión modificada.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Si tiene alguna pregunta sobre estos Términos y Condiciones, por favor contáctenos:
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700"><strong>SuperGains Colombia</strong></p>
                            <p className="text-gray-700">Email: soporte@supergains.com</p>
                            <p className="text-gray-700">Teléfono: +57 (1) 234-5678</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

