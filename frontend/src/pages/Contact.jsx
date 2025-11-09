import React, { useState } from 'react';
import {
    FormInput,
    FormButton,
    FormGroup,
    FormError,
    FormSelect,
    validationRules
} from '../components/forms';
import useNotifications from '../hooks/useNotifications';
import api from '../services/api.js';

export default function Contact() {
    const { showSuccess, showError } = useNotifications();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        asunto: '',
        mensaje: '',
        tipoConsulta: 'general'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successInfo, setSuccessInfo] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Enviar mensaje al backend
            const response = await api.post('/contact', formData);

            if (response.data.success) {
                showSuccess('¡Mensaje enviado exitosamente! Te contactaremos pronto.');
                setSuccessInfo({
                    nombre: formData.nombre,
                    email: formData.email,
                    asunto: formData.asunto
                });
                // Limpiar formulario
                setFormData({
                    nombre: '',
                    email: '',
                    telefono: '',
                    asunto: '',
                    mensaje: '',
                    tipoConsulta: 'general'
                });
                setError('');
            } else {
                throw new Error(response.data.error || 'Error al enviar el mensaje');
            }
        } catch (err) {
            console.error('Error al enviar mensaje:', err);
            
            // Manejar error específico de rate limiting
            if (err.response?.status === 429) {
                const rateLimitMessage = err.response?.data?.error || 'Has enviado muchos mensajes en poco tiempo. Intenta de nuevo en unos minutos.';
                setError(rateLimitMessage);
                showError(rateLimitMessage);
            } else {
                setError(err.message || 'Error al enviar el mensaje. Inténtalo de nuevo.');
                showError('Error al enviar el mensaje');
            }
            setSuccessInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const tiposConsulta = [
        { value: 'general', label: 'Consulta General' },
        { value: 'producto', label: 'Consulta sobre Productos' },
        { value: 'pedido', label: 'Consulta sobre Pedidos' },
        { value: 'soporte', label: 'Soporte Técnico' },
        { value: 'sugerencia', label: 'Sugerencia' },
        { value: 'reclamo', label: 'Reclamo' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Contáctanos
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Información de contacto */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                                Información de Contacto
                            </h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email</h3>
                                        <p className="text-gray-600">contacto@supergains.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Teléfono</h3>
                                        <p className="text-gray-600">+57 (1) 234-5678</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Dirección</h3>
                                        <p className="text-gray-600">
                                            Calle 123 #45-67<br />
                                            Bogotá, Colombia
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">Horarios de Atención</h3>
                                        <p className="text-gray-600">
                                            Lunes a Viernes: 8:00 AM - 6:00 PM<br />
                                            Sábados: 9:00 AM - 2:00 PM
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de contacto */}
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                            Envíanos un Mensaje
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <FormGroup>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        id="nombre"
                                        name="nombre"
                                        type="text"
                                        label="Nombre completo"
                                        placeholder="Tu nombre completo"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        required
                                        validationRules={[
                                            validationRules.required('El nombre es obligatorio'),
                                            validationRules.minLength(2, 'El nombre debe tener al menos 2 caracteres'),
                                            validationRules.maxLength(50, 'El nombre no puede tener más de 50 caracteres')
                                        ]}
                                        showValidation={true}
                                    />

                                    <FormInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        label="Email"
                                        placeholder="tu@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                        required
                                        validationRules={[
                                            validationRules.required('El email es obligatorio'),
                                            validationRules.email('Ingresa un email válido')
                                        ]}
                                        showValidation={true}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput
                                        id="telefono"
                                        name="telefono"
                                        type="tel"
                                        label="Teléfono (opcional)"
                                        placeholder="+57 300 123 4567"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        autoComplete="tel"
                                        validationRules={[
                                            validationRules.phone('Ingresa un número de teléfono válido')
                                        ]}
                                        showValidation={true}
                                    />

                                    <FormSelect
                                        id="tipoConsulta"
                                        name="tipoConsulta"
                                        label="Tipo de consulta"
                                        value={formData.tipoConsulta}
                                        onChange={handleChange}
                                        required
                                        options={tiposConsulta}
                                    />
                                </div>

                                <FormInput
                                    id="asunto"
                                    name="asunto"
                                    type="text"
                                    label="Asunto"
                                    placeholder="¿Sobre qué quieres consultarnos?"
                                    value={formData.asunto}
                                    onChange={handleChange}
                                    required
                                    validationRules={[
                                        validationRules.required('El asunto es obligatorio'),
                                        validationRules.minLength(5, 'El asunto debe tener al menos 5 caracteres'),
                                        validationRules.maxLength(100, 'El asunto no puede tener más de 100 caracteres')
                                    ]}
                                    showValidation={true}
                                />

                                <FormInput
                                    id="mensaje"
                                    name="mensaje"
                                    type="textarea"
                                    label="Mensaje"
                                    placeholder="Cuéntanos en detalle cómo podemos ayudarte..."
                                    value={formData.mensaje}
                                    onChange={handleChange}
                                    required
                                    rows={6}
                                    validationRules={[
                                        validationRules.required('El mensaje es obligatorio'),
                                        validationRules.minLength(10, 'El mensaje debe tener al menos 10 caracteres'),
                                        validationRules.maxLength(1000, 'El mensaje no puede tener más de 1000 caracteres')
                                    ]}
                                    showValidation={true}
                                />

                                <FormButton
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={loading}
                                    loading={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Enviando mensaje...' : 'Enviar Mensaje'}
                                </FormButton>
                            </FormGroup>
                        </form>

                        {error && (
                            <div className="mt-4">
                                <FormError error={error} />
                            </div>
                        )}
                        {successInfo && (
                            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                                <div className="flex items-start">
                                    <svg className="h-6 w-6 text-green-500 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h3 className="text-sm font-semibold text-green-800">
                                            ¡Gracias, {successInfo.nombre || 'tu'} mensaje fue recibido!
                                        </h3>
                                        <p className="text-sm text-green-700 mt-1">
                                            Confirmamos que recibimos tu consulta sobre <span className="font-medium">{successInfo.asunto}</span>.
                                            Te responderemos al correo <span className="font-medium">{successInfo.email}</span> lo antes posible.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
