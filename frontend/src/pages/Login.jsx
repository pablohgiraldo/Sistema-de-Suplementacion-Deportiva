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
    FormStatus
} from '../components/forms';
import RateLimitHandler from '../components/RateLimitHandler';
import { useFormNotifications } from '../hooks/useFormNotifications';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        contraseña: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rateLimitError, setRateLimitError] = useState(null);
    const [formStatus, setFormStatus] = useState('idle');
    const { notifications, showSuccess, showError, removeNotification } = useFormNotifications();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setRateLimitError(null);
        setFormStatus('loading');

        try {
            const result = await login(formData.email, formData.contraseña);

            if (result.success) {
                setFormStatus('success');
                showSuccess('¡Bienvenido! Iniciando sesión...', 'Inicio de sesión exitoso', 2000);
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setFormStatus('error');
                setError(result.error);
                showError(result.error, 'Error al iniciar sesión');
            }
        } catch (err) {
            // Verificar si es un error de rate limiting
            if (err.response?.status === 429) {
                setRateLimitError(err);
                setFormStatus('warning');
            } else {
                setFormStatus('error');
                setError('Error inesperado al iniciar sesión');
                showError('Error inesperado al iniciar sesión', 'Error de conexión');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRetry = () => {
        setRateLimitError(null);
        setError('');
        setFormStatus('idle');
    };

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
                            Iniciar sesión
                        </h1>
                        <p className="text-sm text-gray-500">
                            Elige cómo quieres iniciar sesión
                        </p>
                    </div>

                    {/* Botón de Shop (visual) */}
                    <div className="mb-6">
                        <button
                            type="button"
                            disabled
                            className="w-full bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                        >
                            Iniciar sesión con Shop
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
                                placeholder="Ingresa tu contraseña"
                                value={formData.contraseña}
                                onChange={handleChange}
                                autoComplete="current-password"
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
                                {loading ? 'Iniciando sesión...' : 'Continuar'}
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

                    {/* Enlace a registro */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            ¿No tienes cuenta?{' '}
                            <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500 transition duration-200">
                                Regístrate aquí
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

                    {/* Form status */}
                    {formStatus !== 'idle' && (
                        <div className="mt-4">
                            <FormStatus
                                status={formStatus}
                                message={
                                    formStatus === 'loading' ? 'Iniciando sesión...' :
                                        formStatus === 'success' ? '¡Inicio de sesión exitoso!' :
                                            formStatus === 'error' ? 'Error al iniciar sesión' :
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
