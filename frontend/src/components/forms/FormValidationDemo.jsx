import React, { useState } from 'react';
import {
    FormInput,
    FormButton,
    FormGroup,
    FormError,
    FormSuccess,
    FormNotification,
    FormStatus,
    FormProgress
} from './index';
import { useFormNotifications } from '../../hooks/useFormNotifications';

const FormValidationDemo = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
    });

    const [errors, setErrors] = useState({});
    const [formStatus, setFormStatus] = useState('idle');
    const [currentStep, setCurrentStep] = useState(0);
    const { notifications, showSuccess, showError, showWarning, showInfo, removeNotification } = useFormNotifications();

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'nombre':
                if (!value.trim()) {
                    newErrors.nombre = 'El nombre es requerido';
                } else if (value.trim().length < 2) {
                    newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
                } else {
                    delete newErrors.nombre;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) {
                    newErrors.email = 'El email es requerido';
                } else if (!emailRegex.test(value)) {
                    newErrors.email = 'El email no es válido';
                } else {
                    delete newErrors.email;
                }
                break;

            case 'telefono':
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (value && !phoneRegex.test(value.replace(/\s/g, ''))) {
                    newErrors.telefono = 'El teléfono no es válido';
                } else {
                    delete newErrors.telefono;
                }
                break;

            case 'mensaje':
                if (!value.trim()) {
                    newErrors.mensaje = 'El mensaje es requerido';
                } else if (value.trim().length < 10) {
                    newErrors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
                } else {
                    delete newErrors.mensaje;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Validación en tiempo real
        validateField(name, value);

        // Feedback visual inmediato
        if (value.trim()) {
            if (name === 'email' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                showInfo('Email válido', 'Validación', 2000);
            } else if (name === 'telefono' && /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
                showInfo('Teléfono válido', 'Validación', 2000);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('loading');
        setCurrentStep(1);

        // Validar todos los campos
        const isFormValid = Object.keys(formData).every(field =>
            validateField(field, formData[field])
        );

        if (!isFormValid) {
            setFormStatus('error');
            setCurrentStep(0);
            showError('Por favor corrige los errores en el formulario', 'Error de validación');
            return;
        }

        setCurrentStep(2);

        // Simular envío
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            setFormStatus('success');
            setCurrentStep(3);
            showSuccess('¡Formulario enviado exitosamente!', 'Envío exitoso', 5000);

            // Limpiar formulario después del éxito
            setTimeout(() => {
                setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
                setErrors({});
                setFormStatus('idle');
                setCurrentStep(0);
            }, 3000);

        } catch (error) {
            setFormStatus('error');
            setCurrentStep(0);
            showError('Error al enviar el formulario', 'Error de envío');
        }
    };

    const steps = [
        { label: 'Validación', description: 'Verificando datos' },
        { label: 'Envío', description: 'Enviando formulario' },
        { label: 'Completado', description: 'Envío exitoso' }
    ];

    const isFormValid = Object.keys(errors).length === 0 &&
        Object.values(formData).every(value => value.trim() !== '');

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Demo de Feedback Visual
                </h2>
                <p className="text-gray-600">
                    Este formulario demuestra el sistema de feedback visual con validación en tiempo real.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <FormGroup>
                    <FormInput
                        label="Nombre completo"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        error={errors.nombre}
                        placeholder="Ingresa tu nombre completo"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormInput
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="tu@email.com"
                        required
                    />
                </FormGroup>

                <FormGroup>
                    <FormInput
                        label="Teléfono (opcional)"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        error={errors.telefono}
                        placeholder="+57 300 123 4567"
                    />
                </FormGroup>

                <FormGroup>
                    <FormInput
                        label="Mensaje"
                        name="mensaje"
                        type="textarea"
                        value={formData.mensaje}
                        onChange={handleChange}
                        error={errors.mensaje}
                        placeholder="Escribe tu mensaje aquí..."
                        rows={4}
                        required
                    />
                </FormGroup>

                {/* Progress indicator */}
                {formStatus === 'loading' && (
                    <div className="mt-6">
                        <FormProgress
                            steps={steps}
                            currentStep={currentStep}
                            showLabels={true}
                            showNumbers={true}
                        />
                    </div>
                )}

                {/* Form status */}
                {formStatus !== 'idle' && (
                    <div className="mt-4">
                        <FormStatus
                            status={formStatus}
                            message={
                                formStatus === 'loading' ? 'Procesando formulario...' :
                                    formStatus === 'success' ? '¡Formulario enviado exitosamente!' :
                                        formStatus === 'error' ? 'Error en el formulario' : ''
                            }
                        />
                    </div>
                )}

                <FormGroup>
                    <FormButton
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={formStatus === 'loading'}
                        disabled={!isFormValid || formStatus === 'loading'}
                        className="w-full"
                    >
                        {formStatus === 'loading' ? 'Enviando...' : 'Enviar Formulario'}
                    </FormButton>
                </FormGroup>

                {/* Success message */}
                {formStatus === 'success' && (
                    <FormSuccess message="¡Gracias! Tu mensaje ha sido enviado correctamente." />
                )}
            </form>

            {/* Notifications */}
            <FormNotification
                notifications={notifications}
                onRemove={removeNotification}
                position="top-right"
            />
        </div>
    );
};

export default FormValidationDemo;
