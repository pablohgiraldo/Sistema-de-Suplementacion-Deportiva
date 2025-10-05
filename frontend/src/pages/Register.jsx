import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
    FormInput,
    FormButton,
    FormGroup,
    FormError,
    PasswordInput,
    FormNotification,
    FormStatus,
    FormProgress
} from '../components/forms';
import RateLimitHandler from '../components/RateLimitHandler';
import { useFormNotifications } from '../hooks/useFormNotifications';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        contraseña: '',
        confirmarContraseña: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [rateLimitError, setRateLimitError] = useState(null);
    const [formStatus, setFormStatus] = useState('idle');
    const [currentStep, setCurrentStep] = useState(0);
    const { notifications, showSuccess, showError, removeNotification } = useFormNotifications();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const validateForm = () => {
        if (formData.contraseña !== formData.confirmarContraseña) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (formData.contraseña.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setRateLimitError(null);
        setFormStatus('loading');
        setCurrentStep(1);

        if (!validateForm()) {
            setFormStatus('error');
            return;
        }

        setLoading(true);
        setCurrentStep(2);

        try {
            const { confirmarContraseña: _, ...dataToSend } = formData;
            const result = await register({ ...dataToSend, rol: 'usuario' });

            if (result.success) {
                setSuccess(true);
                setFormStatus('success');
                setCurrentStep(3);
                showSuccess('¡Cuenta creada exitosamente! Redirigiendo al login...', 'Registro exitoso', 3000);
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setFormStatus('error');
                setCurrentStep(0);
                if (result.details) {
                    // Mostrar errores de validación del backend
                    const errorMessages = result.details.map(detail => detail.message).join(', ');
                    setError(errorMessages);
                    showError(errorMessages, 'Error de validación');
                } else {
                    setError(result.error);
                    showError(result.error, 'Error al registrar usuario');
                }
            }
        } catch (err) {
            setFormStatus('error');
            setCurrentStep(0);
            // Verificar si es un error de rate limiting
            if (err.response?.status === 429) {
                setRateLimitError(err);
                setFormStatus('warning');
            } else {
                setError('Error inesperado al registrar usuario');
                showError('Error inesperado al registrar usuario', 'Error de conexión');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setRateLimitError(null);
        setError('');
        setFormStatus('idle');
        setCurrentStep(0);
    };

    const registrationSteps = [
        { label: 'Validación', description: 'Verificando datos' },
        { label: 'Envío', description: 'Creando cuenta' },
        { label: 'Completado', description: 'Registro exitoso' }
    ];

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                                ¡Registro Exitoso!
                            </h2>
                            <p className="text-sm text-gray-600">
                                Tu cuenta ha sido creada exitosamente. Redirigiendo al login...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-12 bg-black rounded-lg mb-6">
                            <span className="text-white font-bold text-xl">SPG</span>
                        </div>
                    </div>

                    {/* Título */}
                    <div className="text-left mb-6">
                        <h1 className="text-2xl font-bold text-black mb-2">
                            Crear cuenta
                        </h1>
                        <p className="text-sm text-gray-500">
                            Elige cómo quieres registrarte
                        </p>
                    </div>

                    {/* Botón de Shop (visual) */}
                    <div className="mb-6">
                        <button
                            type="button"
                            disabled
                            className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            Registrarse con Shop
                        </button>
                    </div>

                    {/* Separador */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-400">o</span>
                        </div>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                        <FormGroup>
                            <FormInput
                                id="nombre"
                                name="nombre"
                                type="text"
                                label="Nombre completo"
                                placeholder="Ingresa tu nombre completo"
                                value={formData.nombre}
                                onChange={handleChange}
                                autoComplete="name"
                                required
                            />

                            <FormInput
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="Ingresa tu email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />

                            <PasswordInput
                                id="contraseña"
                                name="contraseña"
                                label="Contraseña"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.contraseña}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />

                            <PasswordInput
                                id="confirmarContraseña"
                                name="confirmarContraseña"
                                label="Confirmar contraseña"
                                placeholder="Confirma tu contraseña"
                                value={formData.confirmarContraseña}
                                onChange={handleChange}
                                autoComplete="new-password"
                                required
                            />

                            <FormButton
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={loading}
                                loading={loading}
                                className="w-full"
                            >
                                {loading ? 'Creando cuenta...' : 'Continuar'}
                            </FormButton>
                        </FormGroup>
                    </form>

                    {/* Enlaces de política */}
                    <div className="mt-8 text-left">
                        <div className="flex space-x-4 text-xs text-gray-400">
                            <a href="#" className="hover:text-gray-600 transition duration-200">
                                Política de privacidad
                            </a>
                            <a href="#" className="hover:text-gray-600 transition duration-200">
                                Términos de servicio
                            </a>
                        </div>
                    </div>

                    {/* Enlace a login */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition duration-200">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>

                    {/* Rate limit error */}
                    {rateLimitError && (
                        <div className="mt-4">
                            <RateLimitHandler
                                error={rateLimitError}
                                onRetry={handleRetry}
                            />
                        </div>
                    )}

                    {/* Progress indicator */}
                    {formStatus === 'loading' && (
                        <div className="mt-6">
                            <FormProgress
                                steps={registrationSteps}
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
                                    formStatus === 'loading' ? 'Procesando registro...' :
                                        formStatus === 'success' ? '¡Registro exitoso!' :
                                            formStatus === 'error' ? 'Error en el registro' :
                                                formStatus === 'warning' ? 'Demasiados intentos' : ''
                                }
                            />
                        </div>
                    )}

                    {/* Error message */}
                    {error && !rateLimitError && (
                        <div className="mt-4">
                            <FormError error={error} />
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications */}
            <FormNotification
                notifications={notifications}
                onRemove={removeNotification}
                position="top-right"
            />
        </div>
    );
}
