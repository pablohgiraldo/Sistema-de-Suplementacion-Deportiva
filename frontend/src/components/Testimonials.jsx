// Componente de Testimonios según PRD
import { useState, useCallback } from 'react';
import { FormGroup, FormInput, FormButton, FormGrid } from './forms';

export default function Testimonials() {
    const [showTestimonialForm, setShowTestimonialForm] = useState(false);
    const [testimonialForm, setTestimonialForm] = useState({
        rating: 5,
        name: '',
        role: '',
        comment: ''
    });

    const testimonials = [
        {
            id: 1,
            name: "Carlos Rodríguez",
            role: "Atleta Profesional",
            rating: 5,
            comment: "Los suplementos de SuperGains han transformado mi rendimiento. La calidad es excepcional y los resultados son visibles desde la primera semana.",
            image: "/placeholder-product.svg"
        },
        {
            id: 2,
            name: "María González",
            role: "Entrenadora Personal",
            rating: 5,
            comment: "Recomiendo SuperGains a todos mis clientes. La transparencia en sus ingredientes y la efectividad de sus productos son incomparables.",
            image: "/placeholder-product.svg"
        },
        {
            id: 3,
            name: "Juan Pérez",
            role: "Culturista",
            rating: 5,
            comment: "Llevo 2 años usando SuperGains y no cambiaría por nada. El Designer Whey Protein es el mejor que he probado, con un sabor increíble.",
            image: "/placeholder-product.svg"
        }
    ];

    const handleTestimonialFormChange = useCallback((field, value) => {
        setTestimonialForm(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleSubmitTestimonial = useCallback((e) => {
        e.preventDefault();

        // Validar formulario
        if (!testimonialForm.name.trim() || !testimonialForm.role.trim() || !testimonialForm.comment.trim()) {
            alert('Por favor, completa todos los campos');
            return;
        }

        // Crear nuevo testimonio
        const newTestimonial = {
            id: Date.now(),
            name: testimonialForm.name.trim(),
            role: testimonialForm.role.trim(),
            rating: testimonialForm.rating,
            comment: testimonialForm.comment.trim(),
            image: "/placeholder-product.svg"
        };

        // Aquí normalmente enviarías el testimonio al backend
        console.log('Nuevo testimonio:', newTestimonial);

        // Simular éxito
        alert('¡Gracias por tu testimonio! Se ha enviado correctamente.');

        // Limpiar formulario y cerrar
        setTestimonialForm({
            rating: 5,
            name: '',
            role: '',
            comment: ''
        });
        setShowTestimonialForm(false);
    }, [testimonialForm]);

    const cancelTestimonialForm = useCallback(() => {
        setTestimonialForm({
            rating: 5,
            name: '',
            role: '',
            comment: ''
        });
        setShowTestimonialForm(false);
    }, []);

    return (
        <section className="bg-white py-16 sm:py-20 lg:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Título de sección */}
                <div className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-3 sm:mb-4">
                        Lo que dicen nuestros clientes
                    </h2>
                    <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto">
                        Miles de atletas confían en SuperGains para alcanzar sus objetivos
                    </p>
                </div>

                {/* Grid de testimonios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {testimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="bg-gray-50 rounded-2xl p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
                        >
                            {/* Rating */}
                            <div className="flex items-center gap-1 mb-4">
                                {Array.from({ length: testimonial.rating }).map((_, idx) => (
                                    <svg
                                        key={idx}
                                        className="w-5 h-5 text-yellow-400 fill-current"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>

                            {/* Comentario */}
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6">
                                "{testimonial.comment}"
                            </p>

                            {/* Perfil del cliente */}
                            <div className="flex items-center gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                    <img
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="text-black font-semibold text-sm sm:text-base">
                                        {testimonial.name}
                                    </h4>
                                    <p className="text-gray-500 text-xs sm:text-sm">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Formulario de testimonio */}
                <div className="mt-12 sm:mt-16">
                    {!showTestimonialForm ? (
                        <div className="text-center">
                            <p className="text-gray-600 text-sm sm:text-base mb-4">
                                ¿Quieres compartir tu experiencia?
                            </p>
                            <button
                                onClick={() => setShowTestimonialForm(true)}
                                className="bg-black text-white px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors text-sm sm:text-base"
                            >
                                Deja tu testimonio
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
                                Comparte tu experiencia
                            </h3>

                            <form onSubmit={handleSubmitTestimonial}>
                                <FormGroup>
                                    <FormInput
                                        type="text"
                                        label="Tu nombre"
                                        value={testimonialForm.name}
                                        onChange={(e) => handleTestimonialFormChange('name', e.target.value)}
                                        placeholder="Ingresa tu nombre completo"
                                        required
                                    />

                                    <FormInput
                                        type="text"
                                        label="Tu rol o profesión"
                                        value={testimonialForm.role}
                                        onChange={(e) => handleTestimonialFormChange('role', e.target.value)}
                                        placeholder="Ej: Atleta Profesional, Entrenador Personal"
                                        required
                                    />

                                    {/* Rating */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Calificación
                                        </label>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleTestimonialFormChange('rating', i + 1)}
                                                    className={`w-8 h-8 ${i < testimonialForm.rating ? 'text-yellow-400' : 'text-gray-300'
                                                        } hover:text-yellow-500 transition-colors`}
                                                >
                                                    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                </button>
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600">
                                                {testimonialForm.rating} de 5 estrellas
                                            </span>
                                        </div>
                                    </div>

                                    <FormInput
                                        type="text"
                                        label="Tu experiencia con SuperGains"
                                        value={testimonialForm.comment}
                                        onChange={(e) => handleTestimonialFormChange('comment', e.target.value)}
                                        placeholder="Comparte tu experiencia y cómo SuperGains te ha ayudado..."
                                        rows={5}
                                        required
                                    />

                                    <FormGrid columns={2} gap="default">
                                        <FormButton
                                            type="submit"
                                            variant="primary"
                                        >
                                            Enviar testimonio
                                        </FormButton>
                                        <FormButton
                                            type="button"
                                            variant="secondary"
                                            onClick={cancelTestimonialForm}
                                        >
                                            Cancelar
                                        </FormButton>
                                    </FormGrid>
                                </FormGroup>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

