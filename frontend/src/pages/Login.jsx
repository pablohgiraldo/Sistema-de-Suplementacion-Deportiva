import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        contraseña: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

        try {
            const result = await login(formData.email, formData.contraseña);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch {
            setError('Error inesperado al iniciar sesión');
        } finally {
            setLoading(false);
        }
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <input
                                id="contraseña"
                                name="contraseña"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200"
                                placeholder="Contraseña"
                                value={formData.contraseña}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                            >
                                {loading ? 'Iniciando sesión...' : 'Continuar'}
                            </button>
                        </div>
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

                    {/* Error message */}
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 text-center">
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
