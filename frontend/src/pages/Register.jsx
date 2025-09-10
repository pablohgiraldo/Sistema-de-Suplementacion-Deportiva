import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        contraseña: '',
        confirmarContraseña: '',
        rol: 'usuario'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { confirmarContraseña, ...dataToSend } = formData;
            const result = await register(dataToSend);

            if (result.success) {
                setSuccess(true);
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                if (result.details) {
                    // Mostrar errores de validación del backend
                    const errorMessages = result.details.map(detail => detail.message).join(', ');
                    setError(errorMessages);
                } else {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError('Error inesperado al registrar usuario');
        } finally {
            setLoading(false);
        }
    };

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
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Crear Cuenta
                        </h2>
                        <p className="text-sm text-gray-600">
                            ¿Ya tienes cuenta?{' '}
                            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                                    Nombre completo
                                </label>
                                <input
                                    id="nombre"
                                    name="nombre"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Tu nombre completo"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="tu@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="contraseña" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <input
                                    id="contraseña"
                                    name="contraseña"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.contraseña}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmarContraseña" className="block text-sm font-medium text-gray-700">
                                    Confirmar contraseña
                                </label>
                                <input
                                    id="confirmarContraseña"
                                    name="confirmarContraseña"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Repite tu contraseña"
                                    value={formData.confirmarContraseña}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label htmlFor="rol" className="block text-sm font-medium text-gray-700">
                                    Tipo de cuenta
                                </label>
                                <select
                                    id="rol"
                                    name="rol"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    value={formData.rol}
                                    onChange={handleChange}
                                >
                                    <option value="usuario">Usuario</option>
                                    <option value="moderador">Moderador</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
