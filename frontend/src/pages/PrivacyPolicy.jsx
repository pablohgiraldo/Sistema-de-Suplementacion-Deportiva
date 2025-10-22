import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Política de Privacidad</h1>
                    <p className="text-gray-600">Última actualización: 22 de Octubre, 2025</p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introducción</h2>
                        <p className="text-gray-700 leading-relaxed">
                            En SuperGains, nos comprometemos a proteger su privacidad y garantizar la seguridad de su información personal. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y protegemos su información cuando visita nuestro sitio web o realiza una compra.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Información que Recopilamos</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Recopilamos diferentes tipos de información para proporcionarle y mejorar nuestro servicio:
                        </p>
                        
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Información Personal</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                            <li>Nombre completo</li>
                            <li>Dirección de correo electrónico</li>
                            <li>Número de teléfono</li>
                            <li>Dirección de envío y facturación</li>
                            <li>Información de pago (procesada de forma segura por terceros)</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Información de Uso</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Dirección IP</li>
                            <li>Tipo de navegador y versión</li>
                            <li>Páginas visitadas y tiempo de permanencia</li>
                            <li>Historial de compras y preferencias</li>
                            <li>Información de cookies y tecnologías similares</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Cómo Utilizamos su Información</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Utilizamos la información recopilada para los siguientes propósitos:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Procesar y completar sus pedidos</li>
                            <li>Enviar confirmaciones de pedido y actualizaciones de envío</li>
                            <li>Proporcionar soporte al cliente</li>
                            <li>Personalizar su experiencia de compra</li>
                            <li>Enviar comunicaciones promocionales (con su consentimiento)</li>
                            <li>Mejorar nuestros productos y servicios</li>
                            <li>Prevenir fraudes y garantizar la seguridad del sitio</li>
                            <li>Cumplir con obligaciones legales y regulatorias</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compartir Información</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en las siguientes circunstancias:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Proveedores de servicios:</strong> Compartimos información con empresas que nos ayudan a operar nuestro negocio (procesamiento de pagos, envíos, análisis)</li>
                            <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley o para proteger nuestros derechos</li>
                            <li><strong>Transferencias comerciales:</strong> En caso de fusión, venta o transferencia de activos</li>
                            <li><strong>Con su consentimiento:</strong> Cuando usted nos autoriza explícitamente</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies y Tecnologías de Seguimiento</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Utilizamos cookies y tecnologías similares para:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                            <li>Mantener su sesión activa y recordar sus preferencias</li>
                            <li>Analizar el tráfico del sitio y comprender el comportamiento del usuario</li>
                            <li>Personalizar contenido y anuncios</li>
                            <li>Mejorar la funcionalidad del sitio</li>
                        </ul>
                        <p className="text-gray-700 leading-relaxed">
                            Puede configurar su navegador para rechazar cookies, pero esto puede afectar la funcionalidad del sitio.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Seguridad de los Datos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Implementamos medidas de seguridad técnicas, administrativas y físicas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye el uso de encriptación SSL, servidores seguros y controles de acceso estrictos. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es 100% seguro.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sus Derechos</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            De acuerdo con las leyes de protección de datos aplicables, usted tiene derecho a:
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Acceder</strong> a su información personal que tenemos</li>
                            <li><strong>Rectificar</strong> información inexacta o incompleta</li>
                            <li><strong>Eliminar</strong> su información personal (derecho al olvido)</li>
                            <li><strong>Restringir</strong> el procesamiento de su información</li>
                            <li><strong>Portabilidad</strong> de datos a otro proveedor de servicios</li>
                            <li><strong>Objetar</strong> el procesamiento de su información</li>
                            <li><strong>Retirar su consentimiento</strong> en cualquier momento</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Retención de Datos</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo. Los datos de transacciones se conservan según lo requerido por las regulaciones fiscales y contables.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si descubrimos que hemos recopilado información de un menor sin el consentimiento de los padres, eliminaremos esa información de nuestros servidores.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cambios a esta Política</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre cambios significativos publicando la nueva política en esta página y actualizando la fecha de "Última actualización". Le recomendamos revisar esta política regularmente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contacto</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, contáctenos:
                        </p>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700"><strong>SuperGains Colombia</strong></p>
                            <p className="text-gray-700">Email: privacidad@supergains.com</p>
                            <p className="text-gray-700">Teléfono: +57 (1) 234-5678</p>
                            <p className="text-gray-700">Dirección: Bogotá, Colombia</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

